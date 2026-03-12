"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: 32,
  md: 48,
  lg: 64,
} as const;

type LogoSize = keyof typeof SIZES;

interface WinlyLogoProps {
  size?: LogoSize;
  className?: string;
  glow?: boolean;
}

export function WinlyLogo({ size = "md", className, glow = false }: WinlyLogoProps) {
  const px = SIZES[size];

  return (
    <div
      className={cn(
        "relative shrink-0 rounded-full",
        glow && "shadow-[0_0_20px_rgba(139,92,246,0.4)]",
        className,
      )}
      style={{ width: px, height: px }}
    >
      <Image
        src="/branding/winly-logo.png"
        alt="Winly"
        width={px}
        height={px}
        className="rounded-full object-cover"
        priority
      />
    </div>
  );
}
