"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { apiError } from "@/lib/api";
import { useAuth } from "@/modules/auth/AuthProvider";
import { DeskflowMark } from "@/components/ui/marks";
import { PageLoader } from "@/components/ui/PageLoader";

function StudioPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <div className="absolute -left-8 top-10 h-24 w-20 rounded-xl bg-white/70 shadow-sm" />
      <div className="relative rounded-2xl border border-line bg-white p-4 shadow-[0_20px_50px_rgba(17,24,39,0.1)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DeskflowMark className="h-6 w-6" />
            <span className="text-[12px] font-medium">Deskflow</span>
          </div>
          <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] text-accent-ink">Agent</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fill text-[13px] font-semibold">
            S
          </span>
          <div>
            <p className="text-[14px] font-semibold">Scalina support</p>
            <p className="font-mono text-[11px] text-muted">scalina</p>
          </div>
        </div>
        <p className="mt-2">
          <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
            Active
          </span>
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-muted">
          <div className="rounded-lg bg-fill py-2">Sales</div>
          <div className="rounded-lg bg-fill py-2">Support</div>
          <div className="rounded-lg bg-fill py-2">Billing</div>
        </div>
        <p className="mt-3 text-[12px] text-muted">companyId · docs indexed · routed</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { admin, ready, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("admin@deskflow.local");
  const [password, setPassword] = useState("deskflow-admin");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && admin) {
      router.replace("/agents");
    }
  }, [admin, ready, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      router.replace("/agents");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <PageLoader label="Opening studio" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white">
      <Link href="/" className="absolute left-6 top-5 z-20 flex items-center gap-2">
        <DeskflowMark className="h-7 w-7" />
        <span className="text-[15px] font-semibold tracking-tight">Deskflow</span>
      </Link>

      <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="flex flex-col px-6 pb-8 pt-20 sm:px-12 lg:px-16">
          <form onSubmit={onSubmit} className="mx-auto my-auto w-full max-w-[360px]">
            <div className="inline-flex rounded-md bg-fill p-1 text-[13px] font-medium">
              <span className="rounded-md bg-accent px-4 py-1.5 text-accent-ink">Log in</span>
            </div>

            <label className="mt-8 block text-[13px] text-ink">
              Email
              <input
                className="mt-1.5 w-full rounded-lg border border-line px-3 py-2.5 text-[13px] outline-none placeholder:text-muted focus:border-ink"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="Studio email"
                autoComplete="username"
                required
              />
            </label>
            <label className="mt-4 block text-[13px] text-ink">
              Password
              <span className="relative mt-1.5 block">
                <input
                  className="w-full rounded-lg border border-line px-3 py-2.5 pr-10 text-[13px] outline-none placeholder:text-muted focus:border-ink"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-1 text-[11px] text-muted"
                  onClick={() => setShowPassword((open) => !open)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </span>
            </label>

            {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

            <button
              type="submit"
              disabled={busy}
              className="mt-5 w-full rounded-md bg-accent py-2.5 text-[14px] font-semibold text-accent-ink disabled:opacity-50"
            >
              {busy ? "Signing in" : "Log in"}
            </button>
          </form>

          <p className="mt-auto pt-8 text-center text-[12px] text-muted">
            Studio access only.{" "}
            <Link href="/" className="text-ink hover:underline">
              Back to the site
            </Link>
          </p>
        </div>

        <div className="relative hidden min-h-dvh overflow-hidden lg:block">
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(14% 0, 100% 0, 100% 100%, 0 100%)",
              background: "#fff3ec",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(14% 0, 100% 0, 100% 100%, 0 100%)",
              background:
                "radial-gradient(circle at 72% 28%, rgba(224,78,0,0.14), transparent 46%)",
            }}
          />
          <div className="relative flex h-full flex-col items-center justify-center px-12">
            <StudioPreview />
            <p className="mt-10 text-center text-[28px] font-semibold tracking-tight">
              One desk. Every lane.
            </p>
            <p className="mt-2 max-w-sm text-center text-[13px] leading-relaxed text-muted">
              Operators ingest company docs and let specialists answer from what
              you actually published.
            </p>
            <Link
              href="/c/scalina"
              className="mt-5 rounded-md border border-accent/25 bg-white px-4 py-1.5 text-[13px] font-medium text-accent"
            >
              Try a live desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
