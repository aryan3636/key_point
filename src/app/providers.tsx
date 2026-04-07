"use client";

import { PropsWithChildren } from "react";
import { AppStateProvider } from "@/app/context/app-state-context";

export function Providers({ children }: PropsWithChildren) {
  return <AppStateProvider>{children}</AppStateProvider>;
}
