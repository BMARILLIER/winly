"use client";

import { useState } from "react";
import { HelpButton } from "./HelpButton";
import { HelpPanel } from "./HelpPanel";

export function HelpSystem() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <HelpButton onClick={() => setOpen(true)} />
      <HelpPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
