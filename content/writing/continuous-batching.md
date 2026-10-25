---
title: "How continuous batching keeps your GPU from sitting idle"
description: "Traditional batching forces fast requests to wait for slow ones, leaving expensive GPUs mostly idle. Here is how iteration-level scheduling lets requests join and leave on every single token."
publishedAt: "2026-10-25"
tags:
  - LLM Inference
  - Model Optimization
  - LLM Systems
featured: true
draft: false
image: "/diagrams/continuous-batching-cover.png"
relatedSlugs:
  - "vllm-kv-cache"
---

When you run an AI model on a GPU, running one prompt at a time is terribly inefficient. A GPU contains thousands of small compute cores built to process massive batches of numbers together. If you feed it just one user query, most of those cores sit around waiting for memory to load.

The natural answer is batching: gather multiple user requests and process them together.

In traditional deep learning, batching is straightforward. If you classify five images, each image takes the exact same amount of time. You feed five images in, you get five predictions out, and you move on to the next five.

With large language models, this simple approach breaks down completely.

![A timeline of token iterations showing continuous slot occupancy without idle padding](/diagrams/continuous-batching-cover.svg)

## The trouble with static batching

Large language models generate text autoregressively. That means they produce one token, feed it back into the model, and then generate the next token. They repeat this cycle until they hit a stop token or reach a maximum length.

Because of this loop, two requests almost never finish at the same time:

- User A asks: "What is the capital of France?" The model replies with "Paris" (1 token).
- User B asks: "Write a 500-word essay on the Roman Empire." The model replies with 600 tokens.

If you group these two requests into a traditional static batch, User A finishes on the very first cycle. But the batch cannot finish until User B finishes all 600 cycles.

So what happens to User A's slot in the GPU? Nothing. It sits there empty. The GPU continues running computations on useless padding tokens for 599 iterations just to keep the batch shape uniform.

```
Traditional (Static) Batching:

Iteration:    1   2   3   4   5 ... 599  600
--------------------------------------------
Request A:  [Tok][Pad][Pad][Pad]...[Pad][Pad]  <- Done at step 1, wastes 599 steps
Request B:  [Tok][Tok][Tok][Tok]...[Tok][Tok]  <- Runs all 600 steps
Request C:  [Waiting in queue outside...]      <- Cannot start until B finishes
```

While Request A's slot sits empty, Request C is stuck in the waiting queue, waiting for the entire batch to complete before it can even start.

![Static request-level batching with empty padding slots compared with iteration-level continuous batching](/diagrams/batching-analogy.svg "Figure 1: In static batching, finished requests trap empty slots with padding until the longest request completes. In continuous batching, queued requests enter immediately on the next token step.")

In production, this waste adds up fast. In typical chat workloads with varying response lengths, static batching leaves between 60% and 80% of GPU compute capacity completely unused.

## The core insight: Schedule iterations, not requests

The breakthrough came from rethinking when decisions are made. Instead of treating a batch as a fixed container that stays locked from start to finish, what if we manage the batch at the level of individual tokens?

This technique is called **continuous batching** (also known as **iteration-level batching**). It was first introduced to LLM serving in the Orca paper (OSDI 2022) and is now standard in inference engines like vLLM, TensorRT-LLM, and TGI.

The idea is simple:

1. At every generation step, the engine produces one token for every active request in the batch.
2. If any request produces an end-of-sequence token, it immediately leaves the batch. The engine returns the complete result to the client right away.
3. If there is free memory and an open slot, a new request from the waiting queue enters the batch on the very next step.

![Static batching compared with continuous batching over eight decoding steps](/diagrams/batching-timeline.svg "Figure 2: In static batching, finished sequences waste GPU time on empty padding. In continuous batching, queued requests fill vacant slots on the next forward pass.")

Notice what changed. No slots sit around filled with useless padding. As soon as Request A finishes, its slot is given to Request C. Fast queries finish quickly and leave, while long queries continue running without holding anyone hostage.

## Prefill vs. Decode: Mixing the two workloads

To understand how continuous batching works during a live run, it helps to separate what a language model actually does into two distinct phases:

### 1. The Prefill phase (Prompt processing)
When a prompt first arrives, the model reads all of its tokens at once. If your prompt is 500 words long, the model processes all 500 tokens in parallel. This phase is **compute-bound**. The GPU math units run at high utilization, calculating initial attention and generating the very first output token.

### 2. The Decode phase (Token generation)
Once the first token exists, the model switches to generating one token at a time. Each step reads the entire historical context (stored in the KV cache) from memory, runs a forward pass to predict one token, and writes that new token back. Because each step only computes a single token per request, this phase is **memory-bandwidth bound**. The GPU spends most of its time moving weights and cache data across memory buses rather than crunching raw math.

### How they run together

In continuous batching, an iteration does not have to be purely prefill or purely decode. A single batch forward pass can combine:

- A new request running its prefill pass.
- Several ongoing requests each generating their next single token.

By blending prefill and decode in the same iteration, the GPU gets the best of both worlds. The prefill tokens put the idle compute cores to work, while the decode requests ensure memory bandwidth is used productively.

## Static batching vs. Continuous batching

Here is how the two approaches compare in practice:

| Dimension | Static Batching | Continuous Batching |
| :--- | :--- | :--- |
| **Scheduling unit** | The whole request | A single token iteration |
| **Handling finished requests** | Padded until the longest request finishes | Ejected immediately |
| **Admitting new requests** | Must wait for the current batch to end | Can join on the next token step |
| **GPU utilization** | Low (spends time on padding) | High (batch slots stay occupied) |
| **Short query latency** | Trapped behind long queries | Returns as soon as generation stops |
| **Overall throughput** | Baseline | Typically 2x to 5x higher |

## The missing piece: Why memory management had to change

Continuous batching sounds obvious in retrospect, but it was surprisingly difficult to implement before modern memory managers existed.

In traditional setups, GPU memory for a request's KV cache had to be allocated as one continuous, contiguous block. If you wanted to admit Request C in the middle of a run, you needed a contiguous slab of GPU memory big enough to hold its prompt and whatever tokens it might generate later.

If that memory was fragmented across scattered locations, Request C had to wait, even if the total free memory on the GPU was plenty.

This is why systems like vLLM introduced **PagedAttention**. By breaking the KV cache into small virtual pages (usually 16 tokens each), the scheduler can drop a new request into any available blocks anywhere in memory. For a closer look at the memory math and block tables behind this, see [How vLLM keeps the KV cache from eating your GPU](/writing/vllm-kv-cache). Continuous batching provides the dynamic schedule, while paged memory provides the flexible memory pool needed to make dynamic scheduling practical.

## The real-world challenges

Continuous batching solves the idle GPU problem, but it introduces two new challenges that system engineers have to manage:

### 1. Prefill interference (The latency spike)
Because prompt prefill takes significantly more compute than decoding a single token, admitting a request with a huge prompt (say, 8,000 tokens) into an existing batch can cause a noticeable pause.

The ongoing requests that were smoothly generating tokens at 30 milliseconds per token suddenly experience a 300-millisecond delay while the GPU chews through the new prompt. This creates jitter in the user-visible typing stream.

![Latency chart comparing unchunked prefill spikes against steady chunked prefill execution](/diagrams/prefill-chunking.svg "Figure 3: Unchunked prefill causes sudden 10x spikes in inter-token latency. Chunked prefill interleaves prompt processing with decode steps to maintain steady streaming latency.")

The modern fix for this is **chunked prefill**. Instead of processing all 8,000 tokens of a new prompt in one massive bite, the engine chops the prompt into chunks (e.g., 512 tokens per step) and weaves them across multiple iterations alongside the decoding requests.

### 2. Memory exhaustion and preemption
Because requests arrive dynamically and their final lengths are unknown, a server might admit several requests only to find that their combined KV caches exceed total GPU memory a few seconds later.

When the memory pool runs completely dry, the scheduler must **preempt** an active request. It pauses that request, frees its memory blocks, and lets the others finish. Once memory frees up, the paused request is resumed. A well-tuned system sets limits on concurrent sequences (`max_num_seqs`) to ensure preemptions remain rare events.

## Key metrics to watch in production

If you operate or monitor an LLM inference service, these three metrics will tell you whether your batching strategy is healthy:

- **Time to First Token (TTFT):** Measures how long a user waits between sending a prompt and seeing the first word appear. High TTFT usually means requests are sitting in a long queue waiting for prefill capacity.
- **Inter-Token Latency (ITL):** Measures the time between subsequent tokens during generation (the streaming speed). Spikes in ITL usually point to heavy prefill interference from newly admitted requests.
- **Throughput (Tokens per second):** The total number of tokens generated across all users per second. Continuous batching exists primarily to maximize this number without letting individual latencies blow up.

## Summary

In classical computing, batching is about grouping identical jobs to amortize overhead. In generative AI, where every prompt has a different size and every answer has an unpredictable length, static containers simply do not work.

Continuous batching transforms inference from a rigid set of batches into a fluid conveyor belt. By making scheduling decisions token by token, it keeps the GPU's memory and compute continuously saturated, giving you substantially higher throughput without penalizing short requests.

## Continue reading

To see how memory management and scheduling fit together:

- [How vLLM keeps the KV cache from eating your GPU](/writing/vllm-kv-cache): A breakdown of KV cache fragmentation, block tables, and how to estimate how many concurrent requests your GPU can support.
