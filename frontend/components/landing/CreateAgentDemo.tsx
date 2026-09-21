import { DeskflowMark } from "@/components/ui/marks";

export function CreateAgentDemo() {
  return (
    <div className="hero-demo relative flex h-[448px] flex-col overflow-hidden rounded-2xl border border-[#eceff3] bg-white shadow-[0_18px_50px_rgba(17,24,39,0.08)]">
      <div className="hero-demo-cursor" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 3.5 19 13.2l-6.2 1.2 3.4 6.4-2.6 1.4-3.5-6.5L5 20.2z"
            fill="#111827"
            stroke="#fff"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <DeskflowMark className="h-6 w-6" />
          <div>
            <p className="text-[13px] font-semibold">Agents</p>
            <p className="text-[11px] text-muted">Studio</p>
          </div>
        </div>
        <span className="hero-demo-press rounded-lg bg-accent px-3 py-1.5 text-[12px] font-semibold text-white">
          Create agent
        </span>
      </div>

      <div className="relative min-h-0 flex-1">
        <div className="hero-demo-list pointer-events-none absolute inset-0 p-4">
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-line px-4 text-center text-[13px] text-muted">
            <div>
              No agent for this company yet.
              <span className="mt-1 block text-[12px]">Create one, then ingest the guides.</span>
            </div>
          </div>
        </div>

        <div className="hero-demo-form pointer-events-none absolute inset-0 p-4 opacity-0">
          <p className="text-[12px] text-muted">New agent</p>
          <label className="mt-2 block">
            <span className="mb-1 block text-[12px] text-muted">Name</span>
            <div className="flex h-9 items-center rounded-lg border border-line bg-white px-3 text-[13px]">
              <span className="hero-demo-type-name">Scalina support</span>
            </div>
          </label>
          <label className="mt-2 block">
            <span className="mb-1 block text-[12px] text-muted">Company id</span>
            <div className="flex h-9 items-center rounded-lg border border-line bg-white px-3 font-mono text-[13px]">
              <span className="hero-demo-type-id">scalina</span>
            </div>
          </label>
          <p className="mb-1 mt-2 text-[12px] text-muted">Specialists</p>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-accent px-3 py-1 text-[12px] capitalize text-white">sales</span>
            <span className="hero-demo-chip-support rounded-full border border-line px-3 py-1 text-[12px] capitalize text-muted">
              support
            </span>
            <span className="hero-demo-chip-billing rounded-full border border-line px-3 py-1 text-[12px] capitalize text-muted">
              billing
            </span>
          </div>
          <span className="mt-3 inline-flex rounded-lg bg-accent px-3 py-1.5 text-[13px] font-semibold text-white">
            Create agent
          </span>
        </div>

        <div className="hero-demo-done pointer-events-none absolute inset-0 p-4 opacity-0">
          <div className="flex h-full flex-col rounded-xl border border-line bg-[#fafbfc] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[14px] font-semibold">
                  S
                </span>
                <div>
                  <p className="text-[15px] font-semibold">Scalina support</p>
                  <p className="font-mono text-[12px] text-muted">/c/scalina</p>
                </div>
              </div>
              <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                Active
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["sales", "support", "billing"].map((lane) => (
                <span key={lane} className="rounded-full bg-white px-3 py-1 text-[12px] capitalize text-ink/80">
                  {lane}
                </span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-white py-3">
                <p className="text-[11px] text-muted">Docs</p>
                <p className="mt-0.5 text-[14px] font-semibold">Indexed</p>
              </div>
              <div className="rounded-lg bg-white py-3">
                <p className="text-[11px] text-muted">Lanes</p>
                <p className="mt-0.5 text-[14px] font-semibold">3 on</p>
              </div>
              <div className="rounded-lg bg-white py-3">
                <p className="text-[11px] text-muted">Desk</p>
                <p className="mt-0.5 text-[14px] font-semibold">Live</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
