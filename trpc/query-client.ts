import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 2 * 60 * 1000,
                gcTime: 5 * 60 * 1000,
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                retry: (failureCount, error) => {
                    if (
                        error &&
                        typeof error === "object" &&
                        "status" in error
                    ) {
                        const status = (error as any).status;
                        if (status >= 400 && status < 500) {
                            return false;
                        }
                    }
                    return failureCount < 2;
                },
            },
            mutations: {
                retry: 1,
                retryDelay: 1000,
            },
        },
    });

export const queryClient = createQueryClient();
