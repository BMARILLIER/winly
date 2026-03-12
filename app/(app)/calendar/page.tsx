import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getWeekDays, toDateStr } from "@/modules/calendar";
import { WeekView } from "./week-view";

interface Props {
  searchParams: Promise<{ week?: string }>;
}

export default async function CalendarPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const params = await searchParams;
  const refDate = params.week ?? toDateStr(new Date());
  const days = getWeekDays(refDate);

  const startDate = days[0].date;
  const endDate = days[6].date;

  // Scheduled content for this week
  const scheduled = await prisma.contentIdea.findMany({
    where: {
      workspaceId: workspace.id,
      scheduledDate: { gte: startDate, lte: endDate },
    },
    orderBy: { createdAt: "asc" },
  });

  // Unscheduled content (backlog)
  const backlog = await prisma.contentIdea.findMany({
    where: {
      workspaceId: workspace.id,
      scheduledDate: null,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Calendrier éditorial</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Planifiez votre semaine et assignez du contenu à des jours précis.
        </p>
      </div>

      <WeekView
        days={days}
        refDate={refDate}
        scheduled={scheduled.map((s) => ({
          id: s.id,
          title: s.title,
          format: s.format,
          status: s.status,
          scheduledDate: s.scheduledDate!,
        }))}
        backlog={backlog.map((b) => ({
          id: b.id,
          title: b.title,
          format: b.format,
          status: b.status,
        }))}
        workspaceId={workspace.id}
      />
    </div>
  );
}
