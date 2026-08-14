import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface SavingsGoal {
  id: string;
  name: string;
  icon: string | null;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  percentage: number;
  remaining: number;
  status: "on_track" | "behind" | "at_risk";
  deadline: string | null;
}

export function useSavingsGoals() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["savings-goals"],
    queryFn: async () => {
      const response = await api.get<SavingsGoal[]>("/savings-goals");
      return { data: response.data };
    },
  });

  const createGoal = useMutation({
    mutationFn: async (data: Partial<SavingsGoal>) => {
      const response = await api.post("/savings-goals", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
    },
  });

  const contributeGoal = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const response = await api.patch(`/savings-goals/${id}/contribute`, { amount });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
    },
  });

  return {
    ...query,
    createGoal,
    contributeGoal,
  };
}
