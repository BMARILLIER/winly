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
