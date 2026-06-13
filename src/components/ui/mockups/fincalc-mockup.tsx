export function FincalcMockup() {
  return (
    <div className="aspect-[4/5] w-full p-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          SIP CALCULATOR
        </span>
        <span className="font-mono text-[10px] text-zinc-300">₹ / mo</span>
      </div>
      <div className="mt-4 h-[calc(100%-3rem)] w-full flex flex-col gap-3">
        <label className="block">
          <span className="font-mono text-[10px] text-zinc-500">Monthly investment</span>
          <div className="mt-1 w-full rounded border border-zinc-800 bg-bg px-3 py-2 font-mono text-sm text-zinc-100">
            ₹ 12,500
          </div>
        </label>
        <label className="block">
          <span className="font-mono text-[10px] text-zinc-500">Duration</span>
          <div className="mt-1 w-full rounded border border-zinc-800 bg-bg px-3 py-2 font-mono text-sm text-zinc-100">
            10 years
          </div>
        </label>
        <label className="block">
          <span className="font-mono text-[10px] text-zinc-500">Expected return</span>
          <div className="mt-1 w-full rounded border border-zinc-800 bg-bg px-3 py-2 font-mono text-sm text-zinc-100">
            12% p.a.
          </div>
        </label>
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Future value
            </span>
            <span className="font-serif italic text-3xl text-paper">₹ 29,73,408</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Invested
            </span>
            <span className="font-mono text-xs text-zinc-400">₹ 15,00,000</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Gain
            </span>
            <span className="font-mono text-xs text-zinc-300">₹ 14,73,408</span>
          </div>
        </div>
      </div>
    </div>
  );
}
