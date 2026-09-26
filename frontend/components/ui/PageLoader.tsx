export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 py-16" role="status">
      <div className="desk-rail" aria-hidden>
        <span className="desk-rail-slug" />
      </div>
      <p className="text-[13px] text-muted">{label}</p>
    </div>
  );
}
