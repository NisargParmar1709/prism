"use client";

import { useState } from "react";
import { Plus, Target } from "lucide-react";
import { SavingsGoalCard } from "./SavingsGoalCard";
import { AddGoalModal } from "./AddGoalModal";
import { ContributeModal } from "./ContributeModal";
import { useSavingsGoals, SavingsGoal } from "@/hooks/use-savings-goals";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PrismButton } from "@/components/ui/PrismButton";

export function SavingsGoalsSection() {
  const { data, isLoading, isError } = useSavingsGoals();
  const goals = data?.data || [];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);

  return (
    <section className="mt-8">
      <SectionHeader 
        title="Savings Goals"
        action={
          <PrismButton 
            onClick={() => setIsAddModalOpen(true)} 
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Goal
          </PrismButton>
        }
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-[320px] h-[340px] rounded-3xl shrink-0" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-prism-rose-500 p-4 bg-prism-rose-500/10 rounded-2xl">
            Failed to load savings goals.
          </div>
        ) : goals.length === 0 ? (
          <EmptyState
            icon={<Target />}
            title="No savings goals yet"
            description="Set a goal to start saving for your next big purchase or emergency fund."
            actionLabel="Create Goal"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 hide-scrollbar snap-x">
            {goals.map((goal) => (
              <div key={goal.id} className="snap-start">
                <SavingsGoalCard
                  goal={goal}
                  onContribute={() => setContributeGoal(goal)}
                  onEdit={() => {}}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <AddGoalModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      
      <ContributeModal 
        isOpen={!!contributeGoal} 
        onClose={() => setContributeGoal(null)}
        goal={contributeGoal}
      />
    </section>
  );
}
