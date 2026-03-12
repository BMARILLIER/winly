"use client";

import { useState, useMemo, useCallback } from "react";

/**
 * Generic filter hook for list pages.
 *
 * Usage:
 *   const { filtered, setFilter, filters } = useFilters(items, {
 *     category: (item, value) => value === "all" || item.category === value,
 *     urgency: (item, value) => value === "all" || item.urgency === value,
 *   }, { category: "all", urgency: "all" });
 */
export function useFilters<T, F extends Record<string, string>>(
  items: T[],
  matchers: { [K in keyof F]: (item: T, value: F[K]) => boolean },
  defaults: F
) {
  const [filters, setFilters] = useState<F>(defaults);

  const setFilter = useCallback(<K extends keyof F>(key: K, value: F[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      for (const key of Object.keys(matchers) as (keyof F)[]) {
        if (!matchers[key](item, filters[key])) return false;
      }
      return true;
    });
  }, [items, filters, matchers]);

  return { filtered, filters, setFilter };
}
