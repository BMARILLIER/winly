"use client";

import { WinlyLogo } from "./winly-logo";
import type { ComponentProps } from "react";

type AvatarProps = Omit<ComponentProps<typeof WinlyLogo>, "glow"> & {
  pulse?: boolean;
};

export function AIAssistantAvatar({ pulse = false, size = "sm", className, ...rest }: AvatarProps) {
  return (
    <div className={pulse ? "animate-pulse" : undefined}>
      <WinlyLogo size={size} glow className={className} {...rest} />
    </div>
  );
}
