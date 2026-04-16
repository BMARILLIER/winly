import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://winly-lac.vercel.app"),
  title: {
    default: "Winly — Ton coach IA Instagram",
    template: "%s | Winly",
  },
  description:
    "Analytics, insights IA, viral score, coach quotidien — tout pour grandir sur Instagram. Gratuit pour commencer.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://winly-lac.vercel.app",
    siteName: "Winly",
    title: "Winly — Grandis sur Instagram avec ton coach IA",
    description:
      "Analytics, viral score, analyse concurrentielle, contenu IA — 6 outils pour booster ta croissance Instagram. Gratuit.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Winly — Coach IA Instagram",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Winly — Grandis sur Instagram avec ton coach IA",
    description:
      "Analytics, viral score, coach quotidien — tout pour les createurs Instagram.",
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
