import { useMemo } from "react";
import { api } from "@/trpc/client";

export function useHabitsDashboard(viewMode: "today" | "week" | "month") {
    const { data, isLoading, error, refetch } =
        api.habits.getDashboard.useQuery(
            {
                viewMode,
            },
            {
                staleTime: 5 * 60 * 1000,
                gcTime: 15 * 60 * 1000,
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                refetchOnReconnect: true,
                retry: (failureCount, error) => {
                    if (error && typeof error === "object" && "code" in error) {
                        const code = (error as { code?: string }).code;
                        if (code === "UNAUTHORIZED" || code === "FORBIDDEN") {
                            return false;
                        }
                    }
                    return failureCount < 2;
                },
            }
        );

    const memoizedData = useMemo(() => {
        if (!data) return null;

        return {
            ...data,

            habitsByStatus: {
                completed: data.todayStats.habits.filter((h) => h.isCompleted),
                pending: data.todayStats.habits.filter((h) => !h.isCompleted),
            },
        };
    }, [data]);

    return {
        data: memoizedData,
        isLoading,
        error,
        refetch,

        isTodayComplete: memoizedData?.todayStats.completionPercentage === 100,
        hasHabits:
            memoizedData?.todayStats.habits.length &&
            memoizedData.todayStats.habits.length > 0,
    };
}

export function useHabitsMutations() {
    const utils = api.useUtils();

    const toggleCompletion = api.habits.toggleCompletion.useMutation({
        onMutate: async ({ habitId, isCompleted }) => {
            await utils.habits.getDashboard.cancel();

            const previousData = utils.habits.getDashboard.getData();

            if (previousData) {
                utils.habits.getDashboard.setData(undefined, {
                    ...previousData,
                    todayStats: {
                        ...previousData.todayStats,
                        habits: previousData.todayStats.habits.map((habit) =>
                            habit.id === habitId
                                ? { ...habit, isCompleted }
                                : habit
                        ),
                    },
                });
            }

            return { previousData };
        },
        onError: (error, variables, context) => {
            if (context?.previousData) {
                utils.habits.getDashboard.setData(
                    undefined,
                    context.previousData
                );
            }
            console.error("Error toggling habit completion:", error);
        },
        onSettled: () => {
            utils.habits.getDashboard.invalidate();
        },
    });

    return {
        toggleCompletion,
        isPending: toggleCompletion.isPending,
    };
}
