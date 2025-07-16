import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // SSR : avec Next.js, nous utilisons Suspense pour la gestion des states de loading
        staleTime: 30 * 1000, // 30 secondes
      },
    },
  }); 