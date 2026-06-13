export function MaetMockup() {
  // Faux candlestick chart with 7 candles + 3 dashed indicator lines.
  // All hand-calculated; deterministic, no math.random at render.
  const candles = [
    { x: 50, o: 180, h: 160, l: 200, c: 170, up: false },
    { x: 100, o: 170, h: 150, l: 190, c: 158, up: false },
    { x: 150, o: 158, h: 140, l: 175, c: 148, up: false },
    { x: 200, o: 148, h: 120, l: 160, c: 130, up: false },
    { x: 250, o: 130, h: 110, l: 145, c: 118, up: false },
    { x: 300, o: 118, h: 100, l: 130, c: 108, up: false },
    { x: 350, o: 108, h: 90, l: 120, c: 98, up: false },
  ];
  return (
    <div className="aspect-[4/5] w-full p-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          RELIANCE.NS · 1D
        </span>
        <span className="font-mono text-[10px] text-zinc-300">₹1,298.40</span>
      </div>
      <svg
        viewBox="0 0 400 280"
        className="mt-4 h-[calc(100%-3rem)] w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        {/* Y axis grid */}
        {[40, 100, 160, 220, 280].map((y) => (
          <line
            key={y}
            x1="20"
            y1={y}
            x2="400"
            y2={y}
            stroke="#27272A"
            strokeWidth="0.5"
            strokeDasharray="2 4"
          />
        ))}
        {/* Indicator lines (VWAP, EMA, Bollinger) */}
        <path
          d="M 20 130 C 100 120, 200 110, 400 80"
          stroke="#71717A"
          strokeWidth="1"
          strokeDasharray="4 4"
          fill="none"
        />
        <path
          d="M 20 150 C 100 140, 200 125, 400 95"
          stroke="#A1A1AA"
          strokeWidth="1"
          strokeDasharray="2 4"
          fill="none"
        />
        <path
          d="M 20 170 C 100 165, 200 150, 400 115"
          stroke="#52525B"
          strokeWidth="1"
          strokeDasharray="2 4"
          fill="none"
        />
        {/* Candles */}
        {candles.map((c, i) => (
          <g key={i}>
            <line
              x1={c.x}
              y1={c.h}
              x2={c.x}
              y2={c.l}
              stroke={c.up ? "#4ADE80" : "#F87171"}
              strokeWidth="1"
            />
            <rect
              x={c.x - 8}
              y={Math.min(c.o, c.c)}
              width="16"
              height={Math.max(Math.abs(c.c - c.o), 2)}
              fill={c.up ? "#4ADE80" : "#F87171"}
            />
          </g>
        ))}
      </svg>
      <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-zinc-500">
        <span>09:15 · 15:30 IST</span>
        <span>VWAP · EMA · BB</span>
      </div>
    </div>
  );
}
