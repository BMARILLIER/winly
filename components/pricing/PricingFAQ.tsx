"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Puis-je changer de plan\u00a0?",
    answer: "Oui, vous pouvez modifier votre abonnement \u00e0 tout moment.",
  },
  {
    question: "Puis-je annuler\u00a0?",
    answer: "Oui, l\u2019abonnement peut \u00eatre annul\u00e9 \u00e0 tout moment.",
  },
  {
    question: "Y a-t-il une version gratuite\u00a0?",
    answer: "Oui, le plan Starter est gratuit.",
  },
];

export function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="py-20">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-center text-2xl font-bold text-foreground mb-10">
          Questions fr&eacute;quentes
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-surface-1 overflow-hidden"
            >
              <button
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left cursor-pointer"
              >
                <span className="font-medium text-foreground">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-text-muted shrink-0 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-200 ${
                  openIndex === i
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-4 text-sm text-text-secondary">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
