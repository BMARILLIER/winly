"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  children?: (activeTab: string) => React.ReactNode;
}

export function Tabs({ tabs, defaultTab, onChange, className, children }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? "");

  function handleChange(id: string) {
    setActive(id);
    onChange?.(id);
  }

  return (
    <div className={className}>
      <div className="flex gap-1 rounded-lg bg-surface-2 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
              active === tab.id
                ? "bg-surface-1 text-foreground shadow-sm-dark"
                : "text-text-secondary hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {children && <div className="mt-4">{children(active)}</div>}
    </div>
  );
}
