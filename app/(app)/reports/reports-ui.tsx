"use client";

import { SectionHeader, Card, Badge, Button } from "@/components/ui";
import { FileBarChart, Download, RefreshCw, Clock } from "lucide-react";
import { reports, type ReportStatus } from "@/lib/mock/reports";

const statusConfig: Record<ReportStatus, { variant: "success" | "warning" | "default"; label: string }> = {
  ready: { variant: "success", label: "Prêt" },
  generating: { variant: "warning", label: "En cours..." },
  pending: { variant: "default", label: "En attente" },
};

export function ReportsUI() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Rapports"
        description="Rapports de performance mensuels et trimestriels"
        action={
          <Button size="sm">
            <RefreshCw className="h-4 w-4" />
            Générer un rapport
          </Button>
        }
      />

      <div className="space-y-4">
        {reports.map((report) => {
          const status = statusConfig[report.status];
          return (
            <Card key={report.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-accent-muted p-2 mt-0.5">
                    <FileBarChart className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{report.title}</h3>
                    <p className="text-xs text-text-muted mt-0.5">{report.period}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={status.variant}>{status.label}</Badge>
                  {report.status === "ready" && (
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-sm text-text-secondary mb-4">{report.summary}</p>

              <div className="flex flex-wrap gap-4">
                {report.metrics.map((m) => (
                  <div key={m.label} className="rounded-lg bg-surface-2 px-3 py-2">
                    <p className="text-[11px] text-text-muted">{m.label}</p>
                    <p className="text-sm font-semibold text-foreground">{m.value}</p>
                  </div>
                ))}
              </div>

              {report.generatedAt && (
                <div className="mt-3 flex items-center gap-1 text-xs text-text-muted">
                  <Clock className="h-3 w-3" />
                  Généré le {report.generatedAt}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
