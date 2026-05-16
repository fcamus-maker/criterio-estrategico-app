"use client";

import AuthGateCE from "@/app/components/AuthGateCE";
import type { ReactNode } from "react";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return <AuthGateCE zona="panel">{children}</AuthGateCE>;
}
