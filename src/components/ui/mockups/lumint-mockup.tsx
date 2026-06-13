export function LumintMockup() {
  // Faux fraud card with 3 risk metrics.
  return (
    <div className="aspect-[4/5] w-full p-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          FRAUD RISK SCORE
        </span>
        <span className="font-mono text-[10px] text-zinc-300">Document · URL · UPI</span>
      </div>
      <div className="mt-4 h-[calc(100%-3rem)] w-full flex flex-col items-center justify-center">
        <div className="relative w-40 h-40 rounded-full border-4 border-zinc-800 flex items-center justify-center">
          <span className="font-serif text-5xl font-light text-zinc-300">72</span>
          <span className="absolute top-0 right-0 font-mono text-[10px] text-zinc-500">
            HIGH
          </span>
        </div>
        <div className="mt-8 w-full space-y-4 px-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-zinc-500">Document Score</span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 rounded bg-zinc-800">
                <div
                  className="h-full w-3/4 rounded bg-accent"
                  style={{ width: "75%" }}
                />
              </div>
              <span className="font-mono text-[10px] text-zinc-300">75</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-zinc-500">URL Risk</span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 rounded bg-zinc-800">
                <div
                  className="h-full w-2/5 rounded bg-accent"
                  style={{ width: "40%" }}
                />
              </div>
              <span className="font-mono text-[10px] text-zinc-300">40</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-zinc-500">UPI Verify</span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 rounded bg-zinc-800">
                <div
                  className="h-full w-3/5 rounded bg-accent"
                  style={{ width: "60%" }}
                />
              </div>
              <span className="font-mono text-[10px] text-zinc-300">60</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-0 right-0 text-center font-mono text-[9px] text-zinc-500">
          Cross-modal fusion engine · LLaMA 3.3 70B
        </div>
      </div>
    </div>
  );
}
