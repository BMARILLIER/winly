import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || "Winly <noreply@winly.app>";

function isConfigured(): boolean {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

function createTransport() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<{ sent: boolean; error?: string }> {
  if (!isConfigured()) {
    console.warn("[email] SMTP non configuré — email non envoyé à", to);
    console.warn("[email] Sujet :", subject);
    console.warn("[email] Contenu :\n" + text);
    return { sent: false, error: "SMTP not configured" };
  }

  try {
    const transport = createTransport();
    await transport.sendMail({ from: SMTP_FROM, to, subject, text, html });
    return { sent: true };
  } catch (err) {
    console.error("[email] Échec d'envoi à", to, err);
    return { sent: false, error: String(err) };
  }
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendWelcomeEmail(to: string, name: string | null) {
  const displayName = name?.trim() || "créateur";
  return sendEmail({
    to,
    subject: "Bienvenue sur Winly 🚀",
    text: `Salut ${displayName},

Bienvenue sur Winly ! Ton compte est prêt.

Pour démarrer :
1. Connecte ton Instagram depuis les paramètres
2. Complète ton premier audit créateur
3. Génère tes 5 premières idées de contenu

C'est parti : ${APP_URL}/dashboard

— L'équipe Winly`,
  });
}

export interface WeeklyDigestPayload {
  totalXp: number;
  level: number;
  streakDays: number;
  newFollowers: number | null;
  contentCreated: number;
  alertsCount: number;
  // AI report
  intro: string;
  topPost: {
    type: string;
    likes: number;
    comments: number;
    caption: string | null;
    permalink: string | null;
    reason: string | null;
  } | null;
  flopPost: {
    type: string;
    likes: number;
    comments: number;
    caption: string | null;
    reason: string | null;
  } | null;
  engagementDeltaPct: number | null;
  actions: string[];
  opportunity: string | null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMediaType(t: string): string {
  switch (t) {
    case "IMAGE":
      return "Photo";
    case "VIDEO":
      return "Reel / vidéo";
    case "CAROUSEL_ALBUM":
      return "Carrousel";
    default:
      return t;
  }
}

function buildDigestText(displayName: string, s: WeeklyDigestPayload): string {
  const lines: string[] = [
    `Salut ${displayName},`,
    "",
    s.intro,
    "",
    "— TA SEMAINE EN CHIFFRES —",
    `• Niveau ${s.level} (${s.totalXp} XP) · streak ${s.streakDays} j`,
    s.newFollowers !== null
      ? `• Followers : ${s.newFollowers >= 0 ? "+" : ""}${s.newFollowers}`
      : "• Instagram non connecté",
    s.engagementDeltaPct !== null
      ? `• Engagement moyen : ${s.engagementDeltaPct >= 0 ? "+" : ""}${s.engagementDeltaPct}% vs semaine précédente`
      : "",
    `• Idées créées : ${s.contentCreated}`,
    "",
  ];

  if (s.topPost) {
    lines.push("— TOP POST —");
    lines.push(`${formatMediaType(s.topPost.type)} · ❤️ ${s.topPost.likes} · 💬 ${s.topPost.comments}`);
    if (s.topPost.caption) lines.push(`"${s.topPost.caption.slice(0, 120)}"`);
    if (s.topPost.reason) lines.push(`→ ${s.topPost.reason}`);
    if (s.topPost.permalink) lines.push(s.topPost.permalink);
    lines.push("");
  }

  if (s.flopPost) {
    lines.push("— POST À AMÉLIORER —");
    lines.push(`${formatMediaType(s.flopPost.type)} · ❤️ ${s.flopPost.likes} · 💬 ${s.flopPost.comments}`);
    if (s.flopPost.caption) lines.push(`"${s.flopPost.caption.slice(0, 120)}"`);
    if (s.flopPost.reason) lines.push(`→ ${s.flopPost.reason}`);
    lines.push("");
  }

  if (s.actions.length > 0) {
    lines.push("— 3 ACTIONS POUR CETTE SEMAINE —");
    s.actions.slice(0, 3).forEach((a, i) => lines.push(`${i + 1}. ${a}`));
    lines.push("");
  }

  if (s.opportunity) {
    lines.push("— OPPORTUNITÉ —");
    lines.push(s.opportunity);
    lines.push("");
  }

  lines.push(`Ouvre ton dashboard : ${APP_URL}/dashboard`);
  lines.push("");
  lines.push("— L'équipe Winly");
  return lines.filter((l) => l !== undefined).join("\n");
}

function buildDigestHtml(displayName: string, s: WeeklyDigestPayload): string {
  const accent = "#7c3aed";
  const bg = "#0b0b0f";
  const card = "#17171f";
  const text = "#e5e5ea";
  const muted = "#9b9ba3";

  const section = (title: string, inner: string) => `
    <tr><td style="padding:20px 24px;border-top:1px solid #262630;">
      <div style="font-size:11px;letter-spacing:1px;color:${muted};text-transform:uppercase;margin-bottom:8px;">${title}</div>
      ${inner}
    </td></tr>`;

  const statsRow = `
    <div style="color:${text};font-size:14px;line-height:1.6;">
      <strong>Niveau ${s.level}</strong> · ${s.totalXp} XP · streak ${s.streakDays} j<br/>
      ${
        s.newFollowers !== null
          ? `Followers : <strong style="color:${s.newFollowers >= 0 ? "#22c55e" : "#ef4444"};">${s.newFollowers >= 0 ? "+" : ""}${s.newFollowers}</strong>`
          : `<span style="color:${muted};">Instagram non connecté</span>`
      }
      ${
        s.engagementDeltaPct !== null
          ? ` · Engagement <strong style="color:${s.engagementDeltaPct >= 0 ? "#22c55e" : "#ef4444"};">${s.engagementDeltaPct >= 0 ? "+" : ""}${s.engagementDeltaPct}%</strong>`
          : ""
      }
      <br/>Idées créées : ${s.contentCreated}
    </div>`;

  const postBlock = (p: NonNullable<WeeklyDigestPayload["topPost"]>, label: string, color: string) => `
    <div style="background:#0f0f17;border:1px solid #262630;border-radius:8px;padding:14px;color:${text};font-size:14px;">
      <div style="color:${color};font-weight:600;margin-bottom:4px;">${label} · ${escapeHtml(formatMediaType(p.type))}</div>
      <div style="color:${muted};font-size:13px;margin-bottom:6px;">❤️ ${p.likes} · 💬 ${p.comments}</div>
      ${p.caption ? `<div style="font-style:italic;color:${text};margin-bottom:8px;">"${escapeHtml(p.caption.slice(0, 140))}"</div>` : ""}
      ${p.reason ? `<div style="color:${text};">${escapeHtml(p.reason)}</div>` : ""}
      ${"permalink" in p && p.permalink ? `<div style="margin-top:8px;"><a href="${escapeHtml(p.permalink)}" style="color:${accent};text-decoration:none;font-size:13px;">Voir le post →</a></div>` : ""}
    </div>`;

  const actionsHtml =
    s.actions.length > 0
      ? `<ol style="margin:0;padding-left:20px;color:${text};font-size:14px;line-height:1.7;">${s.actions
          .slice(0, 3)
          .map((a) => `<li>${escapeHtml(a)}</li>`)
          .join("")}</ol>`
      : "";

  return `<!doctype html>
<html><body style="margin:0;background:${bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:${card};border-radius:12px;overflow:hidden;">
        <tr><td style="padding:28px 24px 8px;">
          <div style="font-size:12px;color:${muted};letter-spacing:2px;text-transform:uppercase;">Winly · Récap hebdo</div>
          <h1 style="color:${text};font-size:22px;margin:8px 0 4px;">Salut ${escapeHtml(displayName)} 👋</h1>
          <p style="color:${text};font-size:15px;line-height:1.5;margin:12px 0 0;">${escapeHtml(s.intro)}</p>
        </td></tr>

        ${section("Ta semaine en chiffres", statsRow)}
        ${s.topPost ? section("Top post", postBlock({ ...s.topPost }, "🏆 Top", "#22c55e")) : ""}
        ${s.flopPost ? section("Post à améliorer", postBlock({ ...s.flopPost, permalink: null }, "📉 À améliorer", "#f59e0b")) : ""}
        ${actionsHtml ? section("3 actions pour cette semaine", actionsHtml) : ""}
        ${s.opportunity ? section("Opportunité", `<div style="color:${text};font-size:14px;line-height:1.5;">${escapeHtml(s.opportunity)}</div>`) : ""}

        <tr><td style="padding:24px;border-top:1px solid #262630;text-align:center;">
          <a href="${APP_URL}/dashboard" style="display:inline-block;background:${accent};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Ouvrir mon dashboard →</a>
        </td></tr>
        <tr><td style="padding:16px 24px 24px;color:${muted};font-size:12px;text-align:center;">— L'équipe Winly</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendWeeklyDigestEmail(
  to: string,
  name: string | null,
  stats: WeeklyDigestPayload,
) {
  const displayName = name?.trim() || "créateur";
  const subject = stats.topPost
    ? `🏆 Ton top post + 3 actions — récap Winly`
    : `Ton récap Winly de la semaine`;

  return sendEmail({
    to,
    subject,
    text: buildDigestText(displayName, stats),
    html: buildDigestHtml(displayName, stats),
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: "Réinitialise ton mot de passe Winly",
    text: `Tu as demandé à réinitialiser ton mot de passe Winly.

Clique sur ce lien (valide 1 heure) :
${resetUrl}

Si tu n'es pas à l'origine de cette demande, ignore cet email.

— L'équipe Winly`,
  });
}
