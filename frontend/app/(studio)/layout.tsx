import { Suspense } from "react";
import { AppShell } from "@/components/shell/AppShell";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted">
          Loading
        </div>
      }
    >
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
