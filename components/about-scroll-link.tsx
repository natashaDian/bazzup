"use client";

import type { ReactNode } from "react";

export function AboutScrollLink({
  href,
  className,
  children,
}: {
  href: `#${string}`;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        const target = document.querySelector(href);
        if (!target) return;
        event.preventDefault();
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }}
    >
      {children}
    </a>
  );
}
