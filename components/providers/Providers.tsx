"use client";

import { ReactNode } from "react";
import { TRPCReactProvider } from "@/trpc/client";
import { ToastProvider } from "@/components/ui/toast";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <TRPCReactProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </TRPCReactProvider>
  );
} 