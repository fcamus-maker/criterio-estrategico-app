"use client";

import AuthGateCE from "@/app/components/AuthGateCE";
import type { ReactNode } from "react";

export default function EvaluarV2Layout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthGateCE zona="evaluar-v2">{children}</AuthGateCE>;
}
