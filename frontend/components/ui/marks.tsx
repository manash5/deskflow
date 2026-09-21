import type { ReactNode } from "react";

export function IconMark({
  className = "h-4 w-4",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      {children}
    </svg>
  );
}

export function DeskflowMark({
  className = "h-8 w-8",
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  const blade = "M1.15-2.35 2.05-11.1 6.4-8.95 2.55-1.55Z";

  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="8" fill={onDark ? "#fff" : "#111827"} />
      <g fill={onDark ? "#111827" : "#fff"} transform="translate(16 16)">
        {Array.from({ length: 8 }, (_, index) => (
          <path key={index} d={blade} transform={`rotate(${index * 45})`} />
        ))}
      </g>
    </svg>
  );
}

export function IconHome({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <IconMark className={className}>
      <path d="M2.5 7.5 8 2.8l5.5 4.7V13.2H9.4V9.4H6.6v3.8H2.5z" stroke="currentColor" strokeWidth="1.4" />
    </IconMark>
  );
}

export function IconBoard({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <IconMark className={className}>
      <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </IconMark>
  );
}

export function IconDraft({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <IconMark className={className}>
      <path
        d="M5 2.8h4.2L12.8 6.4V13.2H5z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M9.1 2.8V6.4h3.6" stroke="currentColor" strokeWidth="1.4" />
    </IconMark>
  );
}

export function IconDirectory({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <IconMark className={className}>
      <rect x="2.5" y="3.5" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9.5 6.5h4v6.2a1 1 0 0 1-1 1h-3" stroke="currentColor" strokeWidth="1.4" />
    </IconMark>
  );
}

export function IconSignal({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <IconMark className={className}>
      <path d="M4 11.5V8M8 11.5V4.5M12 11.5V6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </IconMark>
  );
}

export function IconBell({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <IconMark className={className}>
      <path
        d="M3.5 10.5h9L11 7.4a3 3 0 1 0-6 0zM6.6 12.3a1.4 1.4 0 0 0 2.8 0"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </IconMark>
  );
}

export function IconPlus({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <IconMark className={className}>
      <path d="M8 3.2v9.6M3.2 8h9.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </IconMark>
  );
}

export function IconSearch({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <IconMark className={className}>
      <circle cx="7" cy="7" r="3.4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9.6 9.6 13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </IconMark>
  );
}

export function IconChevron({
  className = "h-3.5 w-3.5",
  open,
}: {
  className?: string;
  open?: boolean;
}) {
  return (
    <IconMark className={`${className} transition-transform ${open ? "rotate-90" : ""}`}>
      <path d="M6 3.5 11 8 6 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </IconMark>
  );
}

export function IconFilter({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <IconMark className={className}>
      <path d="M2.5 4h11L9.4 9.2V13l-2.8-1.3V9.2z" stroke="currentColor" strokeWidth="1.4" />
    </IconMark>
  );
}
