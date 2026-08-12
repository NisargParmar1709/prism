"use client";

import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { Target, AlertCircle, CheckCircle2, AlertTriangle, Coins } from "lucide-react";
import { SavingsGoal } from "@/hooks/use-savings-goals";

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onContribute?: () => void;
  onEdit?: () => void;
}

export function SavingsGoalCard({ goal, onContribute, onEdit }: SavingsGoalCardProps) {
  const getStatusConfig = () => {
    switch (goal.status) {
      case "on_track":
        return { label: "On Track", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" };
      case "at_risk":
        return { label: "At Risk", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" };
      case "behind":
        return { label: "Behind", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" };
      default:
        return { label: "Unknown", icon: Target, color: "text-prism-text-muted", bg: "bg-prism-elevated" };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  return (
    <SurfaceCard className="p-6 flex flex-col gap-6 w-[320px] shrink-0" interactive onClick={onEdit}>
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-prism-violet-500/10 text-prism-violet-500">
            {goal.icon ? (
              <span className="text-xl leading-none block w-6 h-6 text-center">{goal.icon}</span>
            ) : (
              <Target className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-h3 text-prism-text font-semibold">{goal.name}</h3>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {statusConfig.label}
        </div>
      </div>

      {/* Center: Circular Progress */}
      <div className="flex justify-center py-2">
        <CircularProgress value={goal.percentage} size="mobile" />
      </div>

      {/* Details */}
      <div className="text-center">
        <div className="text-body font-medium text-prism-text">
          {formatCurrency(goal.current_amount)} <span className="text-prism-text-muted font-normal">saved</span>
        </div>
        <div className="text-sm text-prism-text-muted mt-1">
          {formatCurrency(goal.remaining)} remaining
        </div>
      </div>

      {/* Monthly Contribution Progress */}
      <div className="mt-2 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-prism-text-muted font-medium">Monthly contribution</span>
          <span className="text-prism-text font-medium">{formatCurrency(goal.monthly_contribution)}</span>
        </div>
        {/* Placeholder for monthly contribution progress bar - would need backend data for "contributed this month" vs "target" */}
        <div className="w-full bg-prism-elevated h-1.5 rounded-full overflow-hidden">
          <div className="bg-prism-violet-500 h-full rounded-full" style={{ width: '0%' }} />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-2 flex gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContribute?.();
          }}
          className="flex-1 flex justify-center items-center gap-2 bg-prism-violet-500 hover:bg-prism-violet-600 text-white py-2.5 rounded-xl font-medium transition-colors text-sm"
        >
          <Coins className="w-4 h-4" />
          Contribute
        </button>
      </div>
    </SurfaceCard>
  );
}
