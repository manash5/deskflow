"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { PageLoader } from "@/components/ui/PageLoader";

type StudioLoadValue = {
  active: boolean;
  label: string;
  setLoad: (next: { active: boolean; label?: string }) => void;
};

const StudioLoadContext = createContext<StudioLoadValue | null>(null);

export function StudioLoadProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const [label, setLabel] = useState("Loading");

  const setLoad = useCallback((next: { active: boolean; label?: string }) => {
    setActive(next.active);
    if (next.label) setLabel(next.label);
  }, []);

  const value = useMemo<StudioLoadValue>(
    () => ({ active, label, setLoad }),
    [active, label, setLoad],
  );

  return <StudioLoadContext.Provider value={value}>{children}</StudioLoadContext.Provider>;
}

export function StudioLoadOverlay() {
  const context = useContext(StudioLoadContext);
  if (!context?.active) return null;
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg">
      <PageLoader label={context.label} />
    </div>
  );
}

export function useSetStudioLoad() {
  const context = useContext(StudioLoadContext);
  return context?.setLoad;
}

export function useStudioLoad(active: boolean, label: string) {
  const setLoad = useContext(StudioLoadContext)?.setLoad;

  useEffect(() => {
    if (!setLoad) return;
    setLoad({ active, label });
  }, [active, label, setLoad]);
}
