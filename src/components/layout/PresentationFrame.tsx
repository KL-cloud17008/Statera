"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { routeTone } from "@/lib/presentation";

/** Animate the frame, never the data or inputs inside it. The layout persists
 * across navigation, so seen sections do not replay on saves or return visits. */
const SeenFrames = createContext<Set<string> | null>(null);

export function PresentationFrame({ children }: { children: ReactNode }) {
  const [seen] = useState(() => new Set<string>());
  const pathname = usePathname();
  return <SeenFrames.Provider value={seen}><div data-tone={routeTone(pathname)} className="presentation-frame ledger py-5 pb-[calc(2.5rem+env(safe-area-inset-bottom))] md:py-6 md:pb-16">{children}</div></SeenFrames.Provider>;
}

/** Each caption registers after its own hydration, including streamed pages. */
export function FrameReveal({ as: Tag = "div", name, className, children }: {
  as?: "div" | "header";
  name: string;
  className?: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const seen = useContext(SeenFrames);
  const pathname = usePathname();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const element = root.current;
    const key = `${pathname}:${name}`;
    if (!element || !seen || seen.has(key) || pathname === "/workout" || typeof IntersectionObserver === "undefined") return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      seen.add(key);
      if (!preference.matches) setEntered(true);
      observer.disconnect();
    }, { threshold: 0, rootMargin: "0px 0px -32px 0px" });
    observer.observe(element);
    const stopMotion = () => {
      if (preference.matches) setEntered(false);
    };
    preference.addEventListener("change", stopMotion);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", stopMotion);
    };
  }, [name, pathname, seen]);

  return <Tag ref={root} data-frame={name} data-frame-enter={entered ? "true" : undefined} className={className}>{children}</Tag>;
}
