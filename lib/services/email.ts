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
}: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ sent: boolean; error?: string }> {
  if (!isConfigured()) {
    console.warn("[email] SMTP non configuré — email non envoyé à", to);
    console.warn("[email] Sujet :", subject);
    console.warn("[email] Contenu :\n" + text);
    return { sent: false, error: "SMTP not configured" };
  }

  try {
    const transport = createTransport();
    await transport.sendMail({ from: SMTP_FROM, to, subject, text });
    return { sent: true };
  } catch (err) {
    console.error("[email] Échec d'envoi à", to, err);
    return { sent: false, error: String(err) };
  }
}
