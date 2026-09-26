import { Suspense } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { PageLoader } from "@/components/ui/PageLoader";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <PageLoader label="Opening studio" />
        </div>
      }
    >
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
