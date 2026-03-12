"use client";

import { updateSystemSetting } from "@/lib/actions/admin";

type SettingRow = {
  key: string;
  label: string;
  defaultValue: string;
  currentValue: string;
};

export function SettingsEditor({ settings }: { settings: SettingRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-surface-1">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-surface-2">
          <tr>
            <th className="px-4 py-3 font-medium text-text-secondary">Paramètre</th>
            <th className="px-4 py-3 font-medium text-text-secondary">Valeur</th>
            <th className="px-4 py-3 font-medium text-text-secondary">Défaut</th>
            <th className="px-4 py-3 font-medium text-text-secondary" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {settings.map((s) => (
            <tr key={s.key}>
              <td className="px-4 py-3">
                <span className="text-foreground">{s.label}</span>
                <br />
                <code className="text-xs text-text-muted">{s.key}</code>
              </td>
              <td className="px-4 py-3">
                <form action={updateSystemSetting} className="flex gap-2">
                  <input type="hidden" name="key" value={s.key} />
                  <input
                    type="text"
                    name="value"
                    defaultValue={s.currentValue}
                    className="w-24 rounded border px-2 py-1 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded bg-accent px-3 py-1 text-xs text-white hover:bg-accent-hover"
                  >
                    Sauver
                  </button>
                </form>
              </td>
              <td className="px-4 py-3 text-text-muted">{s.defaultValue}</td>
              <td className="px-4 py-3">
                {s.currentValue !== s.defaultValue && (
                  <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs text-warning">
                    Modifié
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
