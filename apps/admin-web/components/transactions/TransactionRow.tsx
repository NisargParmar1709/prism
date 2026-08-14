import React from 'react';
import { Transaction } from '@/hooks/use-transactions';
import { cn, formatCurrency } from '@/lib/utils';
import { useBalanceVisibility } from '@/components/providers/BalanceProvider';
import { format, parseISO } from 'date-fns';
import { parseLocalDate } from '@/lib/date-utils';

export interface TransactionRowProps {
  transaction: Transaction;
  hideAccount?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export function TransactionRow({
  transaction,
  hideAccount = false,
  isSelected = false,
  onClick,
}: TransactionRowProps) {
  const { showBalance } = useBalanceVisibility();

  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? 'text-prism-success' : 'text-prism-text';
  const sign = isIncome ? '+' : '−';

  return (
    <div
      onClick={onClick}
      className={cn(
        'group grid h-16 cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-prism-border py-3 pl-3 pr-4 transition-colors hover:bg-prism-surface',
        isSelected && 'border-l-4 border-l-prism-violet-500 pl-[9px]',
        'sm:grid-cols-[auto_1fr_auto_auto]' // Account/Date column added for larger screens
      )}
    >
      {/* Icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-prism-violet-50 text-xl text-prism-violet-700">
        {transaction.category_icon || '📝'}
      </div>

      {/* Details */}
      <div className="flex flex-col truncate">
        <span className="truncate text-body font-medium text-prism-text">
          {transaction.note || 'Transaction'}
        </span>
        <span className="truncate text-small text-prism-text-muted">
          {transaction.category_name || 'Uncategorized'}
          {!hideAccount && <span className="sm:hidden"> · {transaction.account_name}</span>}
          <span className="sm:hidden"> · {format(parseLocalDate(transaction.date), 'MMM d, yyyy')}</span>
        </span>
      </div>

      {/* Account (hidden on mobile, hidden if hideAccount is true) */}
      {!hideAccount && (
        <div className="hidden flex-col truncate sm:flex">
          <span className="truncate text-body text-prism-text">{transaction.account_name}</span>
          <span className="truncate text-small text-prism-text-muted">
            {format(parseLocalDate(transaction.date), 'MMM d, yyyy')}
          </span>
          <span className="truncate text-xs text-prism-text-muted">
            {format(parseISO(transaction.created_at), 'h:mm a')}
          </span>
        </div>
      )}

      {/* Date on desktop if Account is hidden */}
      {hideAccount && (
        <div className="hidden flex-col truncate text-right sm:flex">
          <span className="truncate text-small text-prism-text-muted">
            {format(parseLocalDate(transaction.date), 'MMM d, yyyy')}
          </span>
          <span className="truncate text-xs text-prism-text-muted">
            {format(parseISO(transaction.created_at), 'h:mm a')}
          </span>
        </div>
      )}

      {/* Amount and Status */}
      <div className="flex flex-col items-end whitespace-nowrap text-right">
        <span className={cn('font-mono text-body tracking-tight', amountColor)}>
          {showBalance
            ? `${sign}${formatCurrency(transaction.amount)}`
            : '****'}
        </span>
        <span className="text-xs text-prism-text-muted capitalize">
          {transaction.status}
        </span>
      </div>
    </div>
  );
}
