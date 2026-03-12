"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { target: 12, suffix: "K+", label: "Créateurs actifs" },
  { target: 2.4, suffix: "M", label: "Posts analysés", decimals: 1 },
  { target: 89, suffix: "%", label: "Taux de croissance" },
  { target: 4.9, suffix: "/5", label: "Note utilisateurs", decimals: 1 },
];

export function AnimatedStats() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const start = performance.now();
          const duration = 2000;

          function animate(now: number) {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setProgress(eased);
            if (t < 1) requestAnimationFrame(animate);
          }

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section className="border-y border-border bg-surface-1 py-12">
      <div ref={ref} className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => {
            const current = s.target * progress;
            const display = s.decimals
              ? current.toFixed(s.decimals)
              : Math.round(current).toString();

            return (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-violet bg-clip-text text-transparent tabular-nums">
                  {display}{s.suffix}
                </p>
                <p className="mt-1 text-sm text-text-muted">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
