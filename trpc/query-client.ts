import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // OPTIMISATION: Configuration globale pour améliorer les performances
      staleTime: 2 * 60 * 1000, // 2 minutes par défaut
      gcTime: 5 * 60 * 1000, // 5 minutes (anciennement cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: (failureCount, error) => {
        // Ne pas retry sur les erreurs 4xx
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 2;
      },
    },
    mutations: {
      // OPTIMISATION: Configuration des mutations
      retry: 1,
      retryDelay: 1000,
    },
  },
});

export const queryClient = createQueryClient(); 