/**
 * Hero diagram: one request's path through an inference engine, with the decode
 * loop drawn explicitly. Static SVG so it renders without JavaScript, stays
 * legible at any zoom, and costs nothing to load.
 */

const stages = [
  {
    n: "01",
    title: "Scheduling",
    detail: "admit requests · assemble a batch",
  },
  {
    n: "02",
    title: "KV cache",
    detail: "allocate blocks · reuse prefixes",
  },
  {
    n: "03",
    title: "Attention",
    detail: "read context · score positions",
  },
  {
    n: "04",
    title: "Decoding",
    detail: "sample a token · stream · repeat",
  },
];

export function PipelineDiagram({ className = "" }: { className?: string }) {
  return (
    <figure className={`m-0 ${className}`}>
      <div className="border border-rule bg-surface p-4 sm:p-5">
        <svg
          viewBox="0 0 560 420"
          role="img"
          aria-labelledby="pipeline-title pipeline-desc"
          className="h-auto w-full"
          fill="none"
        >
          <title id="pipeline-title">
            A request moving through an LLM inference pipeline
          </title>
          <desc id="pipeline-desc">
            Four stages on a vertical rail: scheduling admits requests into a
            batch, the KV cache allocates and reuses memory blocks, attention
            reads the cached context, and decoding samples tokens that stream
            back to the caller. A dashed feedback path returns each new token to
            the scheduler, forming the decode loop.
          </desc>

          {/* Header rule and figure meta */}
          <text
            x="0"
            y="14"
            fill="var(--ink-muted)"
            fontSize="8.5"
            letterSpacing="1.6"
            fontFamily="var(--font-mono)"
          >
            FIG. 01
          </text>
          <text
            x="560"
            y="14"
            fill="var(--ink-muted)"
            fontSize="8.5"
            letterSpacing="1.6"
            textAnchor="end"
            fontFamily="var(--font-mono)"
          >
            INFERENCE REQUEST LIFECYCLE
          </text>
          <line x1="0" y1="24" x2="560" y2="24" stroke="var(--rule)" />

          {/* Vertical rail */}
          <line
            x1="26"
            y1="60"
            x2="26"
            y2="330"
            stroke="var(--rule-strong)"
            className="diagram-draw"
          />

          {stages.map((stage, index) => {
            const y = 66 + index * 76;
            const active = index === stages.length - 1;
            return (
              <g key={stage.n}>
                {/* Tick on the rail */}
                <line x1="20" y1={y + 4} x2="32" y2={y + 4} stroke="var(--rule)" />
                <rect
                  x="22"
                  y={y}
                  width="8"
                  height="8"
                  fill={active ? "var(--accent)" : "var(--sage)"}
                />

                <text
                  x="46"
                  y={y + 8}
                  fill={active ? "var(--accent)" : "var(--ink-muted)"}
                  fontSize="8.5"
                  letterSpacing="1.4"
                  fontFamily="var(--font-mono)"
                >
                  {stage.n}
                </text>
                <text
                  x="70"
                  y={y + 8}
                  fill="var(--ink)"
                  fontSize="13"
                  fontFamily="var(--font-sans)"
                >
                  {stage.title}
                </text>
                <text
                  x="70"
                  y={y + 26}
                  fill="var(--ink-secondary)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  {stage.detail}
                </text>
              </g>
            );
          })}

          {/* Stage graphics ------------------------------------------------- */}

          {/* 01 - request queue */}
          <g>
            <rect x="392" y="56" width="168" height="34" stroke="var(--rule)" />
            <rect x="400" y="63" width="52" height="7" fill="var(--sage)" opacity="0.85" />
            <rect x="456" y="63" width="34" height="7" fill="var(--sage)" opacity="0.5" />
            <rect x="494" y="63" width="20" height="7" fill="var(--sage)" opacity="0.3" />
            <text x="400" y="84" fill="var(--ink-muted)" fontSize="7.5" letterSpacing="1.1" fontFamily="var(--font-mono)">
              BATCH · 12 SEQS
            </text>
          </g>

          {/* 02 - KV cache block grid */}
          <g>
            {Array.from({ length: 18 }).map((_, index) => {
              const col = index % 9;
              const row = Math.floor(index / 9);
              const filled = index < 11;
              return (
                <rect
                  key={index}
                  x={392 + col * 19}
                  y={134 + row * 16}
                  width="15"
                  height="11"
                  stroke={filled ? "var(--sage)" : "var(--rule)"}
                  fill={filled ? "var(--sage)" : "none"}
                  opacity={filled ? (index % 4 === 0 ? 0.45 : 0.8) : 1}
                />
              );
            })}
            <text x="392" y="182" fill="var(--ink-muted)" fontSize="7.5" letterSpacing="1.1" fontFamily="var(--font-mono)">
              PAGED BLOCKS · 11 / 18 RESIDENT
            </text>
          </g>

          {/* 03 - attention reading cached positions */}
          <g>
            {Array.from({ length: 7 }).map((_, index) => (
              <g key={index}>
                <line
                  x1={400 + index * 22}
                  y1="216"
                  x2="470"
                  y2="237"
                  stroke="var(--rule-strong)"
                  strokeWidth="0.75"
                />
                <circle cx={400 + index * 22} cy="216" r="2.5" fill="var(--sage)" opacity={0.35 + index * 0.09} />
              </g>
            ))}
            <circle cx="470" cy="237" r="4.5" fill="var(--accent)" />
            <text x="392" y="262" fill="var(--ink-muted)" fontSize="7.5" letterSpacing="1.1" fontFamily="var(--font-mono)">
              CONTEXT → SCORES → TOKEN
            </text>
          </g>

          {/* 04 - streaming output */}
          <g>
            <line x1="392" y1="300" x2="540" y2="300" stroke="var(--rule)" strokeDasharray="2 3" />
            {[0, 1, 2, 3, 4].map((index) => (
              <circle
                key={index}
                cx={400 + index * 17}
                cy="300"
                r={index === 4 ? 3.5 : 2.5}
                fill={index === 4 ? "var(--accent)" : "var(--sage)"}
                opacity={index === 4 ? 1 : 0.55}
              />
            ))}
            <text x="404" y="320" fill="var(--ink-secondary)" fontSize="8.5" fontFamily="var(--font-mono)">
              token → token → token
            </text>
          </g>

          {/* Decode loop: back to scheduling */}
          <path
            d="M532 300 L548 300 L548 40 L26 40 L26 56"
            stroke="var(--accent)"
            strokeWidth="0.9"
            strokeDasharray="3 4"
            opacity="0.55"
          />
          <path d="M23 54 L26 60 L29 54" stroke="var(--accent)" strokeWidth="0.9" opacity="0.7" />
          <text
            x="286"
            y="34"
            fill="var(--accent)"
            fontSize="8"
            letterSpacing="1.3"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            opacity="0.85"
          >
            DECODE LOOP
          </text>

          {/* Latency axis */}
          <line x1="0" y1="360" x2="560" y2="360" stroke="var(--rule)" />
          {["0", "", "", "", "steady state", ""].map((label, index) => (
            <g key={index}>
              <line x1={index * 112} y1="355" x2={index * 112} y2="365" stroke="var(--rule)" />
              {label && (
                <text
                  x={index * 112}
                  y="378"
                  fill="var(--ink-muted)"
                  fontSize="7.5"
                  letterSpacing="1.1"
                  textAnchor={index === 4 ? "middle" : "start"}
                  fontFamily="var(--font-mono)"
                >
                  {label}
                </text>
              )}
            </g>
          ))}
          <text x="0" y="398" fill="var(--ink-secondary)" fontSize="9" fontFamily="var(--font-mono)">
            prefill
          </text>
          <line x1="46" y1="394" x2="112" y2="394" stroke="var(--rule-strong)" strokeWidth="0.75" />
          <text x="120" y="398" fill="var(--ink-secondary)" fontSize="9" fontFamily="var(--font-mono)">
            decode
          </text>
          <line x1="166" y1="394" x2="528" y2="394" stroke="var(--accent)" strokeWidth="0.75" opacity="0.5" />
        </svg>
      </div>
      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-xs text-secondary">
        <span>
          Fig. 1 - One request through a continuous-batching engine. The dashed
          path is the decode loop.
        </span>
        <span className="font-mono text-[0.625rem] uppercase tracking-widest text-muted">
          schematic
        </span>
      </figcaption>
    </figure>
  );
}
