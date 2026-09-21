"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

export function LandingHeader({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-300 ${
        scrolled ? "border-line shadow-[0_8px_24px_rgba(17,24,39,0.04)]" : "border-transparent"
      }`}
    >
      {children}
    </header>
  );
}

export function ScrollStage({
  children,
  variant = "rise",
  className = "",
}: {
  children: ReactNode;
  variant?: "rise" | "clip" | "draw";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setOn(true);
      },
      { threshold: 0.22, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-on={on ? "1" : "0"}
      className={`landing-stage landing-stage-${variant} ${on ? "is-in" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
