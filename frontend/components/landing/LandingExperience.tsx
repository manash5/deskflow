import type { ReactNode } from "react";
import Link from "next/link";
import { DeskflowMark } from "@/components/ui/marks";
import { CreateAgentDemo } from "@/components/landing/CreateAgentDemo";
import { LandingHeader, ScrollStage } from "@/components/landing/ScrollStage";

function Check({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg className={`shrink-0 text-accent ${className}`} viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M4 9.2 7.1 12.4 14 5.4"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProductFrame({
  tone,
  children,
}: {
  tone: "orange" | "slate" | "mint";
  children: ReactNode;
}) {
  const bg =
    tone === "orange"
      ? "bg-[linear-gradient(180deg,#fff3ec_0%,#ffe4d4_100%)]"
      : tone === "mint"
        ? "bg-[linear-gradient(180deg,#eef6f3_0%,#dceee8_100%)]"
        : "bg-[linear-gradient(180deg,#f3f5f8_0%,#e7ebf1_100%)]";

  return (
    <div className={`mt-12 overflow-hidden rounded-[28px] ${bg} px-4 pb-0 pt-12 sm:px-10 sm:pt-14`}>
      <div className="mx-auto max-w-4xl translate-y-2">{children}</div>
    </div>
  );
}

function ChatMock() {
  return (
    <div className="min-h-[420px] rounded-t-2xl border border-b-0 border-white/80 bg-white shadow-[0_20px_40px_rgba(17,24,39,0.08)]">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div className="flex items-center gap-2">
          <DeskflowMark className="h-6 w-6" />
          <div>
            <p className="text-[13px] font-semibold">Scalina desk</p>
            <p className="font-mono text-[11px] text-muted">/c/scalina</p>
          </div>
        </div>
        <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
          support
        </span>
      </div>
      <div className="space-y-3 px-5 py-6">
        <div className="flex justify-end">
          <div className="max-w-[75%] rounded-xl bg-fill px-3 py-2.5 text-left text-[13px] leading-relaxed">
            What’s the return window on unused hardware?
          </div>
        </div>
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-xl border border-line px-3 py-2.5 text-left text-[13px] leading-relaxed">
            <p className="text-[11px] font-medium text-accent">Retrieved from returns.md</p>
            <p className="mt-1 text-ink/80">
              30 days if unused and in original packaging. After that, billing handles restocking fees.
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[75%] rounded-xl bg-fill px-3 py-2.5 text-left text-[13px] leading-relaxed">
            And who handles restocking after day 30?
          </div>
        </div>
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-xl border border-line px-3 py-2.5 text-left text-[13px] leading-relaxed">
            <p className="text-[11px] font-medium text-accent">Routed to billing</p>
            <p className="mt-1 text-ink/80">
              Billing owns restocking fees. The desk stays in that lane instead of answering from support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function KnowledgeMock() {
  const files = [
    { name: "returns.md", state: "Indexed" },
    { name: "billing-policy.pdf", state: "Indexed" },
    { name: "booking-hours.txt", state: "Chunking" },
    { name: "sales-faq.md", state: "Indexed" },
  ];

  return (
    <div className="min-h-[420px] rounded-t-2xl border border-b-0 border-white/80 bg-white p-6 shadow-[0_20px_40px_rgba(17,24,39,0.08)]">
      <p className="text-[13px] font-semibold">Company collection · scalina</p>
      <p className="mt-1 text-[12px] text-muted">Markdown, text, and PDF only. Scoped to this company id.</p>
      <div className="mt-6 space-y-2.5">
        {files.map((file) => (
          <div
            key={file.name}
            className="flex items-center justify-between rounded-lg border border-line px-4 py-3.5"
          >
            <span className="font-mono text-[13px]">{file.name}</span>
            <span className="text-[12px] text-accent">{file.state}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudioMock() {
  const lanes = [
    { label: "Sales", n: "18" },
    { label: "Support", n: "41" },
    { label: "Billing", n: "9" },
    { label: "Booking", n: "12" },
  ];

  return (
    <div className="min-h-[420px] rounded-t-2xl border border-b-0 border-white/80 bg-white p-6 shadow-[0_20px_40px_rgba(17,24,39,0.08)]">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold">Studio · last 7 days</p>
        <span className="text-[12px] text-muted">Confidence on retrieved turns</span>
      </div>
      <div className="mt-6 grid grid-cols-4 gap-2">
        {lanes.map((lane) => (
          <div key={lane.label} className="rounded-lg bg-fill px-3 py-4">
            <p className="text-[11px] text-muted">{lane.label}</p>
            <p className="mt-1 text-[22px] font-semibold tracking-tight">{lane.n}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 h-40 overflow-hidden rounded-lg bg-[#fff7f2]">
        <svg viewBox="0 0 320 96" className="h-full w-full" aria-hidden>
          <path
            className="landing-chart-line"
            d="M0 70 C40 68 50 40 80 42 C110 44 120 22 160 28 C200 34 210 18 250 24 C280 28 300 16 320 20"
            fill="none"
            stroke="#e04e00"
            strokeWidth="2.2"
          />
        </svg>
      </div>
    </div>
  );
}

export function LandingExperience() {
  return (
    <div className="min-h-dvh bg-white text-ink">
      <div className="relative flex min-h-svh flex-col overflow-hidden">
      <div className="hero-field pointer-events-none absolute inset-0" aria-hidden>
        <div className="hero-orb hero-orb-a" />
        <div className="hero-orb hero-orb-b" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none">
          <g className="hero-net" stroke="#e04e00" strokeWidth="1">
            <path d="M80 140 L220 210 L160 340 L320 300 L280 470" />
            <path d="M220 210 L410 160 L520 280" />
            <path d="M160 340 L90 520 L240 600" />
            <path d="M320 300 L480 430 L410 560" />
            <path d="M280 470 L480 430 L620 620" />
          </g>
          <g className="hero-nodes" fill="#e04e00">
            <circle className="hero-node" cx="80" cy="140" r="3.5" />
            <circle className="hero-node" cx="220" cy="210" r="4.5" />
            <circle className="hero-node" cx="160" cy="340" r="3" />
            <circle className="hero-node" cx="320" cy="300" r="5" />
            <circle className="hero-node" cx="280" cy="470" r="3.5" />
            <circle className="hero-node" cx="410" cy="160" r="3" />
            <circle className="hero-node" cx="520" cy="280" r="3.5" />
            <circle className="hero-node" cx="90" cy="520" r="3" />
            <circle className="hero-node" cx="240" cy="600" r="3.5" />
            <circle className="hero-node" cx="480" cy="430" r="4" />
            <circle className="hero-node" cx="410" cy="560" r="3" />
            <circle className="hero-node" cx="620" cy="620" r="3.5" />
          </g>
        </svg>
      </div>
      <LandingHeader>
        <div className="mx-auto flex max-w-7xl items-center gap-8 px-5 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <DeskflowMark className="h-7 w-7" />
            <span className="text-[16px] font-semibold tracking-tight">Deskflow</span>
          </Link>
          <nav className="hidden items-center gap-6 text-[14.5px] text-ink/80 md:flex">
            <a href="#product">Product</a>
            <a href="#knowledge">Knowledge</a>
            <a href="#studio">Studio</a>
          </nav>
          <div className="ml-auto flex items-center gap-4 text-[14.5px]">
            <Link href="/login" className="text-ink/80 hover:text-ink">
              Log in
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-accent px-3.5 py-2 text-[14px] font-semibold text-white"
            >
              Open studio
            </Link>
          </div>
        </div>
      </LandingHeader>

      <section className="relative z-10 flex flex-1 items-center pt-6 pb-[8vh]">
        <div className="mx-auto grid w-full max-w-7xl items-stretch gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:gap-16 xl:gap-20">
        <div className="flex flex-col justify-between gap-8 py-1 lg:min-h-[448px]">
          <div>
            <p className="text-[17px] text-muted">Grounded company support</p>
            <h1 className="mt-4 text-[clamp(2.35rem,4.4vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.035em]">
              The support agent that
              <br />
              actually knows the docs
            </h1>
          </div>
          <ul className="space-y-3.5 text-[16.5px] leading-snug text-ink/75">
            <li className="flex items-start gap-3">
              <Check />
              Answers land from ingested docs, not invented policy
            </li>
            <li className="flex items-start gap-3">
              <Check />
              Find the right specialist without leaving Deskflow
            </li>
            <li className="flex items-start gap-3">
              <Check />
              Follow-up turns stay in-lane — sales, billing, booking
            </li>
            <li className="flex items-start gap-3">
              <Check />
              Stand up the first public desk in under 10 minutes
            </li>
          </ul>
          <div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-lg bg-accent px-6 py-3.5 text-[16px] font-semibold text-white"
              >
                Open studio — no card needed
              </Link>
              <Link
                href="/c/scalina"
                className="rounded-lg border border-line bg-white px-6 py-3.5 text-[16px] font-medium text-ink"
              >
                Try a live desk
              </Link>
            </div>
            <div className="mt-6 grid max-w-xl grid-cols-2 gap-x-6 gap-y-2.5 text-[14px] text-ink/70">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Studio login
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Specialists on from day 1
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Delete an agent anytime
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Per-company collections
              </span>
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[480px] self-center lg:mx-0 lg:max-w-none">
          <CreateAgentDemo />
        </div>
        </div>
      </section>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-8 text-[13px] font-medium tracking-wide text-muted sm:px-8">
          <span>Sales</span>
          <span>Support</span>
          <span>Account</span>
          <span>Billing</span>
          <span>Booking</span>
          <span>General</span>
        </div>
      </div>

      <section id="product" className="scroll-mt-16 px-5 py-20 text-center sm:px-8">
        <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.03em]">
          Route every desk on autopilot
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-muted">
          A visitor asks at /c/your-id. The graph picks a specialist, retrieves from that company’s
          collection, and answers from the guides you published.
        </p>
        <Link
          href="/login"
          className="mt-7 inline-flex rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-white"
        >
          Open studio
        </Link>
        <div className="mx-auto max-w-5xl">
          <ScrollStage variant="rise">
            <ProductFrame tone="orange">
              <ChatMock />
            </ProductFrame>
          </ScrollStage>
        </div>
      </section>

      <section id="knowledge" className="scroll-mt-16 px-5 py-8 text-center sm:px-8 sm:py-16">
        <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.03em]">
          Ingest the docs. Keep retrieval scoped.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-muted">
          Upload markdown, text, or PDF when you create an agent. Chunks stay in that company id’s
          collection. If a fact is missing, the desk says so.
        </p>
        <Link
          href="/login"
          className="mt-7 inline-flex rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-white"
        >
          Open studio
        </Link>
        <div className="mx-auto max-w-5xl">
          <ScrollStage variant="clip">
            <ProductFrame tone="slate">
              <KnowledgeMock />
            </ProductFrame>
          </ScrollStage>
        </div>
      </section>

      <section id="studio" className="scroll-mt-16 px-5 py-8 text-center sm:px-8 sm:py-16">
        <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.03em]">
          Watch the lanes, not vanity counts
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-muted">
          Operators see chats, blocks, and confidence in the studio. Billing stays billing. Humans
          keep the exceptions.
        </p>
        <Link
          href="/login"
          className="mt-7 inline-flex rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-white"
        >
          Open studio
        </Link>
        <div className="mx-auto max-w-5xl">
          <ScrollStage variant="draw">
            <ProductFrame tone="mint">
              <StudioMock />
            </ProductFrame>
          </ScrollStage>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <ScrollStage variant="rise">
          <div className="mx-auto max-w-5xl rounded-[28px] bg-[#f6f7f9] px-6 py-14 text-center sm:px-12">
          <h2 className="text-[clamp(1.8rem,4vw,2.4rem)] font-bold tracking-[-0.03em]">
            Six specialists. One graph.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-muted">
            Sales, support, account, billing, booking, and general. Turn lanes on per agent. Persona
            is optional — a default voice if you leave it blank.
          </p>
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
            {["Sales", "Support", "Account", "Billing", "Booking", "General"].map((name) => (
              <div
                key={name}
                className="rounded-xl border border-white bg-white px-4 py-4 text-[14px] font-medium shadow-sm"
              >
                {name}
              </div>
            ))}
          </div>
          <Link
            href="/c/scalina"
            className="mt-8 inline-flex rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-white"
          >
            Try a live desk
          </Link>
          </div>
        </ScrollStage>
      </section>

      <section className="px-5 pb-20 pt-4 text-center sm:px-8">
        <h2 className="text-[clamp(1.9rem,4vw,2.7rem)] font-bold tracking-[-0.03em]">
          Publish a desk that answers from what you actually wrote
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[16px] text-muted">
          Create the agent, drop the guides, open /c/your-id. Studio access is JWT-only.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex rounded-lg bg-accent px-6 py-3 text-[15px] font-semibold text-white"
        >
          Open studio
        </Link>
        <p className="mt-3 text-[13px] text-muted">No credit card. Seed login on a local studio.</p>
      </section>

      <footer className="border-t border-line bg-[#fafbfc] px-5 py-12 text-[13px] sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <DeskflowMark className="h-6 w-6" />
              <span className="text-[14px] font-semibold text-ink">Deskflow</span>
            </Link>
            <p className="mt-3 max-w-[200px] text-muted">
              Company-scoped support agents with a public desk and an operator studio.
            </p>
          </div>
          <div>
            <p className="font-semibold text-ink">Product</p>
            <div className="mt-3 space-y-2 text-muted">
              <p>
                <a href="#product">Routing</a>
              </p>
              <p>
                <a href="#knowledge">Knowledge</a>
              </p>
              <p>
                <a href="#studio">Studio</a>
              </p>
            </div>
          </div>
          <div>
            <p className="font-semibold text-ink">Desks</p>
            <div className="mt-3 space-y-2 text-muted">
              <p>
                <Link href="/c/scalina">Scalina</Link>
              </p>
              <p>
                <Link href="/c/northwind">Northwind</Link>
              </p>
              <p>
                <Link href="/login">Open studio</Link>
              </p>
            </div>
          </div>
          <div>
            <p className="font-semibold text-ink">Account</p>
            <div className="mt-3 space-y-2 text-muted">
              <p>
                <Link href="/login">Log in</Link>
              </p>
              <p>JWT studio only</p>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl text-muted">© 2026 Deskflow</p>
      </footer>
    </div>
  );
}
