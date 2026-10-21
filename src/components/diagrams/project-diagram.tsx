/**
 * Architecture diagrams referenced by project frontmatter (`diagram:`).
 * Keeping them as components means they inherit theme tokens and never load as
 * images. A project without a diagram simply renders without one.
 */

const label = {
  fontFamily: "var(--font-mono)",
  fontSize: 8,
  letterSpacing: 1.1,
  fill: "var(--ink-muted)",
} as const;

const boxLabel = {
  fontFamily: "var(--font-sans)",
  fontSize: 11,
  fill: "var(--ink)",
} as const;

function Frame({ children, viewBox = "0 0 640 300" }: { children: React.ReactNode; viewBox?: string }) {
  return (
    <svg
      viewBox={viewBox}
      role="presentation"
      aria-hidden="true"
      fill="none"
      className="h-auto w-full"
    >
      {children}
    </svg>
  );
}

function SchedulerLifecycle() {
  return (
    <Frame>
      {/* Inbound queue */}
      <text x="0" y="12" {...label}>
        INBOUND
      </text>
      {[0, 1, 2].map((index) => (
        <g key={index}>
          <rect
            x="0"
            y={26 + index * 26}
            width="104"
            height="18"
            stroke="var(--rule)"
            fill="var(--surface)"
          />
          <text x="8" y={39 + index * 26} {...label} fill="var(--ink-secondary)">
            seq {index + 4}
          </text>
          <text x="96" y={39 + index * 26} {...label} textAnchor="end" fill="var(--ink-muted)">
            {index === 0 ? "prompt" : "queued"}
          </text>
        </g>
      ))}

      {/* Admission */}
      <path d="M104 40 H136" stroke="var(--rule-strong)" />
      <path d="M132 37 L138 40 L132 43" stroke="var(--rule-strong)" />
      <rect x="140" y="24" width="132" height="54" stroke="var(--sage)" fill="var(--sage-wash)" />
      <text x="150" y="44" {...boxLabel}>
        Admission
      </text>
      <text x="150" y="60" {...label}>
        budget · fairness · kv
      </text>

      {/* Batch table */}
      <path d="M272 51 H304" stroke="var(--rule-strong)" />
      <path d="M300 48 L306 51 L300 54" stroke="var(--rule-strong)" />
      <rect x="308" y="10" width="150" height="126" stroke="var(--rule)" fill="var(--surface)" />
      <text x="318" y="26" {...label}>
        BATCH TABLE
      </text>
      {[
        { id: "seq 04", state: "decode", width: 96 },
        { id: "seq 05", state: "decode", width: 74 },
        { id: "seq 06", state: "prefill", width: 58 },
        { id: "seq 07", state: "decode", width: 40 },
      ].map((row, index) => (
        <g key={row.id}>
          <text x="318" y={48 + index * 22} {...label} fill="var(--ink-secondary)">
            {row.id}
          </text>
          <rect
            x="366"
            y={40 + index * 22}
            width={row.width}
            height="9"
            fill={row.state === "prefill" ? "var(--accent)" : "var(--sage)"}
            opacity={row.state === "prefill" ? 0.65 : 0.5}
          />
          <text x="470" y={48 + index * 22} {...label}>
            {row.state}
          </text>
        </g>
      ))}
      <text x="318" y="126" {...label} fill="var(--ink-muted)">
        4 admitted · 3 waiting
      </text>

      {/* Engine */}
      <path d="M458 51 H492" stroke="var(--rule-strong)" />
      <path d="M488 48 L494 51 L488 54" stroke="var(--rule-strong)" />
      <rect x="496" y="24" width="144" height="54" stroke="var(--rule-strong)" />
      <text x="506" y="44" {...boxLabel}>
        Engine step
      </text>
      <text x="506" y="60" {...label}>
        one pass, all seqs
      </text>

      {/* KV allocator with eviction */}
      <rect x="308" y="176" width="332" height="76" stroke="var(--rule)" fill="var(--surface)" />
      <text x="318" y="194" {...label}>
        BLOCK ALLOCATOR · 128-TOKEN BLOCKS
      </text>
      {Array.from({ length: 21 }).map((_, index) => {
        const filled = index < 15;
        const evicted = index >= 13 && index < 15;
        return (
          <rect
            key={index}
            x={318 + index * 15}
            y={206}
            width="11"
            height="14"
            stroke={filled ? (evicted ? "var(--accent)" : "var(--sage)") : "var(--rule)"}
            fill={filled ? (evicted ? "var(--accent)" : "var(--sage)") : "none"}
            opacity={filled ? 0.55 : 1}
          />
        );
      })}
      <text x="318" y="240" {...label} fill="var(--ink-muted)">
        resident 15 · free 6 · evicted 2 (prefix miss)
      </text>
      <path d="M496 164 V176" stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="3 3" />
      <text x="506" y="172" {...label} fill="var(--accent)">
        allocate / evict
      </text>

      {/* Streaming */} 
      <path d="M568 78 V176" stroke="var(--rule-strong)" />
      <path d="M565 170 L568 176 L571 170" stroke="var(--rule-strong)" />
      <text x="576" y="196" {...label}>
        tokens
      </text>
    </Frame>
  );
}

function TraceGraphDiagram() {
  return (
    <Frame viewBox="0 0 640 320">
      <text x="0" y="12" {...label}>
        CONTROL FLOW
      </text>
      <rect x="0" y="26" width="128" height="46" stroke="var(--rule-strong)" />
      <text x="10" y="46" {...boxLabel}>
        Planner
      </text>
      <text x="10" y="62" {...label}>
        step budget 8
      </text>

      <path d="M128 49 H176" stroke="var(--rule-strong)" />
      <path d="M172 46 L178 49 L172 52" stroke="var(--rule-strong)" />

      <rect x="180" y="26" width="136" height="46" stroke="var(--sage)" fill="var(--sage-wash)" />
      <text x="190" y="46" {...boxLabel}>
        Model call
      </text>
      <text x="190" y="62" {...label}>
        tool_use → router
      </text>

      <path d="M316 49 H364" stroke="var(--rule-strong)" />
      <path d="M360 46 L366 49 L360 52" stroke="var(--rule-strong)" />

      <rect x="368" y="26" width="116" height="46" stroke="var(--rule-strong)" />
      <text x="378" y="46" {...boxLabel}>
        Tool router
      </text>
      <text x="378" y="62" {...label}>
        schema check
      </text>

      <path d="M484 42 H520" stroke="var(--rule-strong)" />
      <path d="M520 42 V64" stroke="var(--rule-strong)" />
      <path d="M517 60 L520 66 L523 60" stroke="var(--rule-strong)" />
      <rect x="488" y="70" width="132" height="26" stroke="var(--rule)" fill="var(--surface)" />
      <text x="496" y="87" {...label} fill="var(--ink-secondary)">
        shell.exec
      </text>
      <rect x="488" y="104" width="132" height="26" stroke="var(--accent)" fill="var(--accent-wash)" />
      <text x="496" y="121" {...label} fill="var(--accent)">
        http.get · timeout
      </text>

      {/* Retry / observation path back to the model */}
      <path
        d="M488 117 H466 V150 H234 V100"
        stroke="var(--accent)"
        strokeWidth="0.9"
        strokeDasharray="3 3"
        opacity="0.7"
      />
      <path d="M231 104 L234 98 L237 104" stroke="var(--accent)" strokeWidth="0.9" />
      <text x="352" y="164" {...label} fill="var(--accent)" textAnchor="middle">
        observation + retry
      </text>

      {/* Waterfall */}
      <text x="0" y="196" {...label}>
        TRACE WATERFALL
      </text>
      <line x1="0" y1="206" x2="640" y2="206" stroke="var(--rule)" />
      {[
        { name: "run", start: 0, width: 604, depth: 0, color: "var(--rule-strong)" },
        { name: "plan", start: 12, width: 118, depth: 1, color: "var(--sage)" },
        { name: "model", start: 140, width: 220, depth: 1, color: "var(--sage)" },
        { name: "tool.exec", start: 300, width: 74, depth: 2, color: "var(--accent)" },
        { name: "retry", start: 382, width: 188, depth: 2, color: "var(--accent)" },
        { name: "answer", start: 420, width: 96, depth: 1, color: "var(--sage)" },
      ].map((span, index) => (
        <g key={span.name}>
          <text x="0" y={228 + index * 17} {...label} fill="var(--ink-secondary)">
            {span.name}
          </text>
          <rect
            x={104 + span.start * 0.68}
            y={218 + index * 17}
            width={span.width * 0.68}
            height="7"
            fill={span.color}
            opacity={span.depth === 0 ? 0.4 : 0.65}
          />
        </g>
      ))}
      <text x="536" y="228" {...label}>
        ms →
      </text>
    </Frame>
  );
}

function CacheHierarchyDiagram() {
  return (
    <Frame viewBox="0 0 640 300">
      <text x="0" y="12" {...label}>
        MEMORY TIERS · NOT TO SCALE
      </text>
      {[
        { name: "SRAM / registers", note: "~20 MB · per-SM", width: 220, y: 30, fill: "var(--sage)" },
        { name: "HBM", note: "tens of GB · ~TB/s", width: 340, y: 82, fill: "var(--sage)" },
        { name: "Host RAM", note: "hundreds of GB · ~100 GB/s", width: 460, y: 134, fill: "var(--sage)" },
        { name: "NVMe", note: "TB-scale · ~GB/s", width: 560, y: 186, fill: "var(--accent)" },
      ].map((tier) => (
        <g key={tier.name}>
          <rect
            x="0"
            y={tier.y}
            width={tier.width}
            height="36"
            stroke={tier.fill}
            fill={tier.fill}
            fillOpacity="0.06"
            opacity={0.9}
          />
          <text x="12" y={tier.y + 23} {...boxLabel}>
            {tier.name}
          </text>
          <text x={tier.width - 12} y={tier.y + 23} {...label} textAnchor="end">
            {tier.note}
          </text>
        </g>
      ))}

      {/* Movement paths */}
      <path d="M600 52 V186" stroke="var(--rule-strong)" strokeDasharray="3 4" />
      <path d="M597 58 L600 52 L603 58" stroke="var(--rule-strong)" />
      <text x="608" y="120" {...label} fill="var(--ink-muted)" transform="rotate(90 608 120)">
        paging / offload
      </text>

      <text x="0" y="248" {...label}>
        KV CACHE RESIDES IN HBM; PREFIX REUSE DECIDES WHAT STAYS
      </text>
      <line x1="0" y1="258" x2="640" y2="258" stroke="var(--rule)" />
      <text x="0" y="276" {...label} fill="var(--ink-muted)">
        latency grows downward · capacity grows downward
      </text>
    </Frame>
  );
}

const diagrams: Record<string, () => React.JSX.Element> = {
  "scheduler-lifecycle": SchedulerLifecycle,
  "trace-graph": TraceGraphDiagram,
  "cache-hierarchy": CacheHierarchyDiagram,
};

export function ProjectDiagram({ name }: { name?: string }) {
  if (!name) return null;
  const Diagram = diagrams[name];
  if (!Diagram) return null;
  return (
    <div className="border border-rule bg-surface p-4 sm:p-5">
      <Diagram />
    </div>
  );
}
