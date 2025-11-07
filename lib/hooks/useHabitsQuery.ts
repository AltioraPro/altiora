import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";

export function useHabitsDashboard(viewMode: "today" | "week" | "month") {
    const { data, isLoading, error, refetch } = useQuery(
        orpc.habits.getDashboard.queryOptions({
            input: {
                viewMode,
            },
        })
    );

    return {
        data,
        isLoading,
        error,
        refetch,
        isTodayComplete: data?.todayStats.completionPercentage === 100,
        hasHabits:
            data?.todayStats.habits.length && data.todayStats.habits.length > 0,
    };
}

export function useHabitsMutations() {
    const queryClient = useQueryClient();

    const toggleCompletion = useMutation(
        orpc.habits.toggleCompletion.mutationOptions({
            onMutate: async ({ habitId, isCompleted }) => {
                await queryClient.cancelQueries({
                    queryKey: orpc.habits.getDashboard.queryKey(),
                });

                const previousData = queryClient.getQueryData(
                    orpc.habits.getDashboard.queryKey()
                );

                if (previousData) {
                    queryClient.setQueryData(
                        orpc.habits.getDashboard.queryKey(),
                        {
                            ...previousData,
                            todayStats: {
                                ...previousData.todayStats,
                                habits: previousData.todayStats.habits.map(
                                    (habit) =>
                                        habit.id === habitId
                                            ? { ...habit, isCompleted }
                                            : habit
                                ),
                            },
                        }
                    );
                }

                return { previousData };
            },
            onError: (error, _variables, context) => {
                if (context?.previousData) {
                    queryClient.setQueryData(
                        orpc.habits.getDashboard.queryKey(),
                        context.previousData
                    );
                }
                console.error("Error toggling habit completion:", error);
            },
            onSettled: () => {
                queryClient.invalidateQueries({
                    queryKey: orpc.habits.getDashboard.queryKey(),
                });
            },
        })
    );

    return {
        toggleCompletion,
        isPending: toggleCompletion.isPending,
    };
}
