// ---------------------------------------------------------------------------
// Content Calendar Module
// Week view utilities
// ---------------------------------------------------------------------------

export interface CalendarDay {
  date: string;      // YYYY-MM-DD
  label: string;     // "Mon 10"
  dayName: string;   // "Monday"
  isToday: boolean;
}

/**
 * Get the 7 days of the week containing the given date.
 * Week starts on Monday.
 */
export function getWeekDays(refDate: string): CalendarDay[] {
  const d = new Date(refDate + "T12:00:00");
  // Monday = 1, Sunday = 0 → shift Sunday to 7
  const dayOfWeek = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - (dayOfWeek - 1));

  const todayStr = toDateStr(new Date());
  const days: CalendarDay[] = [];
  const dayNames = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const shortNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    const dateStr = toDateStr(current);
    days.push({
      date: dateStr,
      label: `${shortNames[i]} ${current.getDate()}`,
      dayName: dayNames[i],
      isToday: dateStr === todayStr,
    });
  }

  return days;
}

/**
 * Navigate to previous or next week.
 */
export function shiftWeek(refDate: string, direction: -1 | 1): string {
  const d = new Date(refDate + "T12:00:00");
  d.setDate(d.getDate() + direction * 7);
  return toDateStr(d);
}

/**
 * Format a date as YYYY-MM-DD.
 */
export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Get a human-readable label for a week range.
 */
export function weekLabel(days: CalendarDay[]): string {
  if (days.length === 0) return "";
  const first = days[0];
  const last = days[days.length - 1];
  const fDate = new Date(first.date + "T12:00:00");
  const lDate = new Date(last.date + "T12:00:00");
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

  if (fDate.getMonth() === lDate.getMonth()) {
    return `${months[fDate.getMonth()]} ${fDate.getDate()} – ${lDate.getDate()}, ${fDate.getFullYear()}`;
  }
  return `${months[fDate.getMonth()]} ${fDate.getDate()} – ${months[lDate.getMonth()]} ${lDate.getDate()}, ${fDate.getFullYear()}`;
}
