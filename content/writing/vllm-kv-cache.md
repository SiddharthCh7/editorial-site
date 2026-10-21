---
title: "How vLLM keeps the KV cache from eating your GPU"
description: "Why giving each request one big chunk of GPU memory wastes space, how vLLM splits memory into small blocks instead, and how to estimate how many requests your GPU can serve."
publishedAt: "2026-10-21"
tags:
  - LLM Inference
  - Model Optimization
  - LLM Systems
featured: true
draft: false
image: "/diagrams/vllm-kv-cover.png"
relatedSlugs: []
---

A model can answer one question quickly and still fall apart when ten people ask at once. The cause is usually not compute. It is memory. The GPU fills up with something called the KV cache, and the server starts kicking requests out to make room.

vLLM fixes this with an idea borrowed from operating systems. Instead of handing each request one big slice of memory, it cuts memory into small blocks and hands them out as needed. This post walks through why that helps, how it works, and what the numbers look like on a real GPU.

![A grid of memory blocks, with a few filled blocks connected out of order by a thin line](/diagrams/vllm-kv-cover.svg)

## What is the KV cache?

When a model generates text, every new token looks back at all the tokens before it. For each earlier token, the model needs two things: a key vector and a value vector. These never change once computed, so the model saves them instead of recalculating them at every step. That saved data is the KV cache.

The size per token depends on the model:

$$
\text{bytes per token} = 2 \cdot L \cdot H_{kv} \cdot d \cdot b
$$

Here $L$ is the number of layers, $H_{kv}$ is the number of key/value heads, $d$ is the size of each head, and $b$ is the bytes per number. The 2 is there because we store both keys and values.

Here is an example. Take a model with 32 layers, 8 key/value heads, a head size of 128, and fp16 numbers (2 bytes each). That comes to 131,072 bytes per token, or 128 KiB. A single request with 128k tokens then holds 16 GiB of cache. On an 80 GB GPU, that is a fifth of the card, and we have not even counted the model weights yet.

The hard part is that nobody knows ahead of time how long a request will be. One user might send 2,000 tokens and another 128,000. The reply length is unknown too. The server has to handle all of this while the cache keeps growing.

## Why one big buffer per request fails

The simplest approach is to reserve space for the maximum length (`max_model_len`) for every request. This works, but it wastes a lot. If your limit is 128k and most chats use 2k, almost all of that reserved memory sits empty.

A smarter approach is to give each request only what it needs right now, as one continuous run of memory. That fails too, as the next picture shows.

![Two rows of memory blocks. Request B grows into the free block beside it. Request A is blocked by B's buffer.](/diagrams/kv-fragmentation.svg "Figure 1: Two requests, one pool. B can grow because its neighbour is free. A cannot, even though there is free space further along.")

Request A has three blocks and request B sits right after it with four. B needs more room, and the block after B is free, so it grows. Now A needs a fourth block, but the next block belongs to B. A is stuck, even though the GPU has free memory elsewhere.

You have three ways out:

1. **Reserve the maximum for everyone.** It is safe, but it wastes memory.
2. **Move A to a bigger region.** Nothing breaks, but copying gets slower as sequences grow, and a big enough free region may not exist.
3. **Let A grow into any free block and keep track of where its pieces are.** Nothing moves. The only cost is a lookup to find each piece.

vLLM picks the third option.

## Blocks and the block table

When vLLM starts, it divides the memory set aside for the cache into equal-sized blocks. By default, each block holds 16 tokens. Every request gets a **block table**, which is a simple list. Entry number $i$ says which physical block holds the request's $i$-th chunk of tokens.

So a request thinks it has blocks 0, 1, 2 in order (these are *logical* blocks). In reality those could live at blocks 7, 2 and 11 in memory (these are *physical* blocks). The table connects the two.

When a request fills its last block, vLLM gives it any free block, wherever it is. The table gets one new entry. Nothing is copied, and no neighbour needs to be free.

![Three logical blocks for forty tokens, a block table mapping them to physical blocks 7, 2 and 11, and a pool where those blocks are not adjacent](/diagrams/paged-kv-blocks.svg "Figure 2: Forty tokens, three blocks. The block table keeps them in order, and the half-empty last block is the cost.")

Let's follow a request through. Say it arrives with a 40-token prompt. That needs $\lceil 40 / 16 \rceil = 3$ blocks. The model fills them during the prefill step, and the last block ends up with 8 tokens used and 8 empty. Then decoding starts and adds one token per step. Each new token goes into the current block until it is full, and then the request takes one more block from the free list.

This design has a few effects:

- **Finding space gets easier.** You no longer need a long free stretch. Any twelve free blocks can serve a request that needs twelve.
- **Scattered gaps stop mattering, but a little waste remains.** The last block of each request is partly empty. That is at most one block per request.
- **Requests can share blocks.** More on that next.

### Sharing common prefixes

Many requests start with the same text, such as a system prompt, a tool description, or a shared document. If two requests have an identical start, they can point to the same physical blocks. vLLM keeps a count of how many requests use each block. If one request needs to change a shared block, vLLM copies it first so the others are not affected.

For agents, this is a big deal. An agent re-sends a growing conversation at every step, so most of the text repeats. Sharing blocks can decide whether your memory budget works at all.

It also means your prompt template affects capacity. If you reorder a JSON schema or put a timestamp at the top of the prompt, the shared prefix no longer matches, and reuse quietly drops to almost zero.

### The cost of the table

Paging is not free. The attention step has to follow the table to find the keys and values, which adds a little extra work on every read. Block size controls this trade-off. Small blocks waste less space and share prefixes more precisely, but they make the table bigger and the reads more scattered. Sixteen tokens is the default because it sits in a good middle ground.

## What happens when blocks run out

Sooner or later the free list is empty and a running request needs one more block. vLLM then **preempts** a request. It frees that request's blocks and puts it back in the waiting queue. When the request is admitted again, current versions recompute its cache from scratch. Older versions could instead copy the cache to CPU memory and bring it back later.

Both options are expensive, and you will see the cost in your slowest responses.

vLLM can also hold back a small share of blocks as a safety margin (a watermark), so the pool does not run at exactly zero. It is off by default.

Two settings control the pressure directly: `max_num_seqs` (how many requests run at once) and `max_model_len` (the longest allowed context). If you raise either one without adding memory, you mostly just move requests from the waiting queue into the preemption path.

## How vLLM decides how many blocks it has

vLLM measures the pool at startup instead of guessing. It does this in five steps:

1. **Set the budget.** `gpu_memory_utilization` is the share of GPU memory vLLM may use. The default is 0.92, which leaves room for the driver and other things on the card.
2. **Load the model.** The weights take their share.
3. **Measure the rest.** vLLM runs a dummy forward pass and records peak memory use. This covers activations, CUDA graphs and other allocations.
4. **Subtract.** Whatever is left over goes to the cache.
5. **Divide.** At 128 KiB per token, a 16-token block takes 2 MiB. Dividing the leftover memory by 2 MiB gives the number of blocks.

> [!NOTE]
> Defaults change between releases, so check the startup log of the version you run. It prints the total KV cache tokens and the maximum concurrency at your sequence length. That is a more useful number than the size of the GPU.

## A worked example on an 80 GB card

Use the same model as before (128 KiB per token) on an 80 GB GPU with the default 0.92 setting. The budget is about 73 GB. The weights take 16 GB, and peak activations, CUDA graphs and other allocations take about 4 GB. That leaves roughly 53 GB for the cache.

| Quantity | Value |
| --- | --- |
| Cache per token | 128 KiB |
| Block size (16 tokens) | 2 MiB |
| Budget left for cache | ~53 GB |
| Blocks in the pool | ~27,400 |
| Tokens that fit at once | ~439,000 |
| Concurrent 8k-token requests | ~53 |
| Concurrent 128k-token requests | ~3 |

Look at the last two rows. The same model on the same card serves about 53 chats at 8k tokens, but only about 3 at 128k. Sixteen times the context means sixteen times the cache per request. Memory, not compute, usually sets how many users you can serve.

These numbers ignore the watermark, the block tables themselves, and prefix sharing. The startup log gives the real figure, and that is the one to use in a design review.

## What paging does not fix

Paging solves where the cache lives. It does not solve everything:

- **Attention still gets costlier with longer context.** Paging changes where keys and values are stored, not how many a token has to read. Long prompts are still expensive to prefill, which is why chunked prefill exists. It splits a long prompt into pieces so it does not block everyone else's decoding.
- **Memory bandwidth is the same.** Every decode step reads the cache of every running request. Splitting it into blocks does not shrink the data moving over the bus.
- **Some waste remains.** Gaps between requests are gone, but each request can still waste up to one block, and block tables take memory too.
- **Preemption can cost more than it saves.** Recomputing a cache is real work. A server that admits fewer requests can sometimes give steadier latency than one that admits many and evicts later.
- **It cannot save a GPU that is too small.** If weights, activations and cache do not fit together, no allocator can create the missing gigabytes. It can only decide who waits.

Models with compressed caches, such as latent attention models, change the math and sometimes the block layout. The core question stays the same: how much state can the GPU hold while keeping latency acceptable?

## What to watch once it is running

Four signals cover most of what you need.

**KV cache usage** is the share of blocks in use. High usage with a growing queue means the pool is too small for your traffic. Flat usage with poor throughput means the problem is somewhere else.

**Preemptions** should be rare. A rising count means requests are being admitted and then thrown out, which is the most expensive way to serve them. The usual fixes are lowering `max_num_seqs`, lowering `max_model_len`, or adding memory.

**Prefix cache hit rate** warns you about prompt changes. Reordering a tool schema or adding a session ID at the top can push reuse close to zero. The only symptom may be a drop in capacity a week later.

**Time to first token and inter-token latency** show you which half of the work is struggling. A long prefill raises time to first token. A full batch or heavy preemption raises inter-token latency. Paging improves throughput, but it will not keep either number steady under overload.

## The takeaway

Paging does not make the math of inference faster. It makes memory easy to hand out, and that lets the scheduler keep the GPU busy with requests whose lengths nobody can predict.

Once the cache is a pool of blocks with a table in front of it, three questions become normal design choices: how many requests to admit, which one to evict when the pool runs dry, and which prefixes are worth sharing.

Next time you set `gpu_memory_utilization` or raise a context limit, don't just ask whether the model fits. Ask how many blocks are left, and what happens on the step when they run out.
