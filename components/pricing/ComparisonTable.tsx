import { Check, Minus } from "lucide-react";

const rows = [
  { feature: "Analyse du compte", starter: true, creator: true, pro: true },
  { feature: "Assistant IA", starter: false, creator: true, pro: true },
  { feature: "Id\u00e9es de contenu", starter: false, creator: true, pro: true },
  { feature: "Analyse concurrentielle", starter: false, creator: false, pro: true },
  { feature: "Comptes sociaux", starter: "1", creator: "3", pro: "Illimit\u00e9" },
];

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-4 w-4 text-success mx-auto" />;
  if (value === false) return <Minus className="h-4 w-4 text-text-muted mx-auto" />;
  return <span className="text-sm text-foreground">{value}</span>;
}

export function ComparisonTable() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-2xl font-bold text-foreground mb-10">
          Comparaison des fonctionnalit&eacute;s
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface-1">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="bg-surface-2">
                <th className="px-6 py-4 text-left font-semibold text-foreground">
                  Fonctionnalit&eacute;
                </th>
                <th className="px-6 py-4 text-center font-semibold text-foreground">
                  Starter
                </th>
                <th className="px-6 py-4 text-center font-semibold text-foreground">
                  Creator
                </th>
                <th className="px-6 py-4 text-center font-semibold text-foreground">
                  Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.feature}
                  className={
                    i % 2 === 0 ? "bg-surface-1" : "bg-surface-2/50"
                  }
                >
                  <td className="px-6 py-4 text-text-secondary">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CellValue value={row.starter} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CellValue value={row.creator} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CellValue value={row.pro} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
