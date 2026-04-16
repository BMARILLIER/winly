import { prisma } from "@/lib/db";
import { getActiveConnection } from "@/lib/services/instagram-connection";

export interface BestTimeSlot {
  dayOfWeek: number; // 0=dimanche, 1=lundi ... 6=samedi
  dayLabel: string;
  hour: number; // 0-23
  hourLabel: string;
  avgEngagement: number;
  postCount: number;
}

export interface BestTimeResult {
  hasData: boolean;
  bestSlot: BestTimeSlot | null;
  topSlots: BestTimeSlot[]; // top 5
  nextBestTime: { label: string; inMinutes: number } | null;
  heatmap: number[][]; // 7 jours × 24 heures, valeur = engagement moyen
}

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function formatHour(h: number): string {
  return `${h.toString().padStart(2, "0")}h`;
}

export async function getBestTimeToPost(userId: string): Promise<BestTimeResult> {
  const connection = await getActiveConnection(userId);
  if (!connection) {
    return { hasData: false, bestSlot: null, topSlots: [], nextBestTime: null, heatmap: [] };
  }

  const media = await prisma.instagramMedia.findMany({
    where: { connectionId: connection.id },
    select: { timestamp: true, likeCount: true, commentsCount: true },
    orderBy: { timestamp: "desc" },
    take: 50,
  });

  if (media.length < 3) {
    return { hasData: false, bestSlot: null, topSlots: [], nextBestTime: null, heatmap: [] };
  }

  // Aggreger engagement par (jour, heure)
  const slotMap = new Map<string, { total: number; count: number; day: number; hour: number }>();

  for (const m of media) {
    const d = new Date(m.timestamp);
    const day = d.getUTCDay();
    const hour = d.getUTCHours();
    const key = `${day}-${hour}`;
    const eng = m.likeCount + m.commentsCount;

    const cur = slotMap.get(key) ?? { total: 0, count: 0, day, hour };
    cur.total += eng;
    cur.count += 1;
    slotMap.set(key, cur);
  }

  const slots: BestTimeSlot[] = Array.from(slotMap.values())
    .map((s) => ({
      dayOfWeek: s.day,
      dayLabel: DAY_LABELS[s.day],
      hour: s.hour,
      hourLabel: formatHour(s.hour),
      avgEngagement: Math.round(s.total / s.count),
      postCount: s.count,
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement);

  const topSlots = slots.slice(0, 5);
  const bestSlot = topSlots[0] ?? null;

  // Heatmap 7×24
  const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const s of slots) {
    heatmap[s.dayOfWeek][s.hour] = s.avgEngagement;
  }

  // Calcul "prochain meilleur moment"
  let nextBestTime: BestTimeResult["nextBestTime"] = null;
  if (bestSlot) {
    const now = new Date();
    const nowDay = now.getUTCDay();
    const nowHour = now.getUTCHours();
    const nowMin = now.getUTCMinutes();

    // Cherche le prochain slot dans les top 5
    for (const slot of topSlots) {
      let daysAhead = slot.dayOfWeek - nowDay;
      if (daysAhead < 0) daysAhead += 7;
      if (daysAhead === 0 && slot.hour <= nowHour) daysAhead = 7;

      const minutesAhead = daysAhead * 24 * 60 + (slot.hour - nowHour) * 60 - nowMin;

      if (minutesAhead > 0 && (!nextBestTime || minutesAhead < nextBestTime.inMinutes)) {
        if (daysAhead === 0) {
          nextBestTime = {
            label: `Aujourd'hui a ${slot.hourLabel}`,
            inMinutes: minutesAhead,
          };
        } else if (daysAhead === 1) {
          nextBestTime = {
            label: `Demain a ${slot.hourLabel}`,
            inMinutes: minutesAhead,
          };
        } else {
          nextBestTime = {
            label: `${slot.dayLabel} a ${slot.hourLabel}`,
            inMinutes: minutesAhead,
          };
        }
      }
    }
  }

  return { hasData: true, bestSlot, topSlots, nextBestTime, heatmap };
}
