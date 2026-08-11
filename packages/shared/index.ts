/**
 * @prism/shared
 * Shared types and constants across frontend and backend.
 */

/** Supported account types */
export type AccountType = 'cash' | 'bank' | 'wallet' | 'fd' | 'savings' | 'emergency';

/** Transaction type */
export type TransactionType = 'income' | 'expense';

/** Budget status */
export type BudgetStatus = 'healthy' | 'warning' | 'over_limit';

/** Savings goal status */
export type SavingsGoalStatus = 'on_track' | 'behind' | 'completed';

/** Currency — INR only for v1 */
export const CURRENCY = 'INR' as const;
export const CURRENCY_SYMBOL = '₹' as const;
