"use client";

import { useState } from "react";
import { repurposeContent, OUTPUT_FORMATS, type RepurposedContent } from "@/modules/repurpose";

export function Repurposer() {
  const [source, setSource] = useState("");
  const [results, setResults] = useState<RepurposedContent[] | null>(null);
  const [activeTab, setActiveTab] = useState("thread");
  const [copiedPart, setCopiedPart] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<string | null>(null);

  function handleRepurpose() {
    if (!source.trim()) return;
    const repurposed = repurposeContent(source);
    setResults(repurposed);
    setActiveTab(repurposed[0]?.formatId ?? "thread");
  }

  function copyPart(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedPart(id);
    setTimeout(() => setCopiedPart(null), 2000);
  }

  function copyAll(content: RepurposedContent) {
    const full = content.parts.join("\n\n---\n\n");
    navigator.clipboard.writeText(full);
    setCopiedAll(content.formatId);
    setTimeout(() => setCopiedAll(null), 2000);
  }

  const activeResult = results?.find((r) => r.formatId === activeTab);

  return (
    <div>
      {/* Source input */}
      <div className="rounded-xl border border-border bg-surface-1 p-6 transition-all duration-200 hover:border-border-hover">
        <label htmlFor="source" className="block text-sm font-medium text-foreground">
          Source content
        </label>
        <textarea
          id="source"
          rows={6}
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Paste a blog post, caption, article, notes, or any text you want to repurpose..."
          className="mt-2 block w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {source.length} characters
          </span>
          <button
            onClick={handleRepurpose}
            disabled={!source.trim()}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            Repurpose
          </button>
        </div>
      </div>

      {/* Results */}
      {results && results.length > 0 && (
        <div className="mt-8">
          {/* Format tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {OUTPUT_FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveTab(f.id)}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === f.id
                    ? "bg-accent text-white"
                    : "bg-surface-2 text-text-secondary hover:bg-surface-3"
                }`}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>

          {/* Active format content */}
          {activeResult && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {OUTPUT_FORMATS.find((f) => f.id === activeResult.formatId)?.icon}{" "}
                    {activeResult.formatLabel}
                  </h2>
                  <p className="text-xs text-text-secondary">
                    {activeResult.parts.length} part{activeResult.parts.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => copyAll(activeResult)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-accent hover:bg-accent-muted transition-colors"
                >
                  {copiedAll === activeResult.formatId ? "Copied!" : "Copy all"}
                </button>
              </div>

              <div className="space-y-3">
                {activeResult.parts.map((part, i) => {
                  const partId = `${activeResult.formatId}-${i}`;
                  return (
                    <div
                      key={i}
                      className="rounded-xl border border-border bg-surface-1 p-5 transition-all duration-200 hover:border-border-hover"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground whitespace-pre-line">
                            {part}
                          </p>
                        </div>
                        <button
                          onClick={() => copyPart(part, partId)}
                          className="shrink-0 rounded-lg px-3 py-1 text-xs font-medium text-text-muted hover:text-accent hover:bg-accent-muted transition-colors"
                        >
                          {copiedPart === partId ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-text-muted">
                          Part {i + 1}/{activeResult.parts.length}
                        </span>
                        <span className="text-xs text-text-muted">·</span>
                        <span className="text-xs text-text-muted">
                          {part.length} chars
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
