"use client";

import { useEffect } from "react";

export default function EvaluarPage() {
  useEffect(() => {
    window.location.href = "/evaluar/paso1";
  }, []);

  return null;
}