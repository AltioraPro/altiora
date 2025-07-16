"use client";

import { ReactNode } from "react";
import { TRPCReactProvider } from "@/trpc/client";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <TRPCReactProvider>
      {children}
    </TRPCReactProvider>
  );
} 