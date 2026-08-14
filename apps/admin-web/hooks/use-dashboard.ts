'use client';

import { useQuery } from '@tanstack/react-query';

export interface DashboardData {
  greeting: string;
  date: string;
  period: string;
  primary_account: {
    id: string;
    name: string;
    type: string;
    last_4_digits: string | null;
    balance: string;
    card_brand?: string;
  };
  stats: {
    total_balance: string;
    balance_change: string;
    balance_change_type: 'increase' | 'decrease' | 'neutral';
    income_this_month: string;
    income_change: string;
    spent_this_month: string;
    spent_change: string;
    savings_rate: number;
    savings_amount: string;
  };
  budget_health: {
    spent: string;
    limit: string;
    percentage: number;
    days_remaining: number;
    daily_allowance: string;
  };
  accounts: Array<{
    id: string;
    name: string;
    type: string;
    balance: string;
    change: string;
    change_type: 'increase' | 'decrease' | 'neutral';
  }>;
  recent_transactions: Array<{
    id: string;
    description: string;
    category: string;
    category_icon: string;
    account: string;
    type: 'income' | 'expense';
    amount: string;
    date: string;
    status: string;
    payment_method: string;
  }>;
  savings_goals: Array<{
    id: string;
    name: string;
    icon: string;
    target: string;
    saved: string;
    percentage: number;
    monthly_contribution: string;
    monthly_target: string;
    status: 'on_track' | 'behind' | 'at_risk';
  }>;
}

const mockDashboardData: DashboardData = {
  greeting: "Good afternoon, Rahul",
  date: new Date().toISOString().split('T')[0],
  period: "July 2026",
  primary_account: {
    id: "acc-123",
    name: "HDFC Savings",
    type: "bank",
    last_4_digits: "4821",
    balance: "284350.00",
    card_brand: "visa"
  },
  stats: {
    total_balance: "44320.00",
    balance_change: "2400.00",
    balance_change_type: "increase",
    income_this_month: "8000.00",
    income_change: "500.00",
    spent_this_month: "12800.00",
    spent_change: "1200.00",
    savings_rate: 35,
    savings_amount: "2800.00"
  },
  budget_health: {
    spent: "67430.00",
    limit: "100000.00",
    percentage: 67.4,
    days_remaining: 12,
    daily_allowance: "1733.00"
  },
  accounts: [
    {
      id: "acc-123",
      name: "HDFC Savings",
      type: "bank",
      balance: "32400.00",
      change: "2400.00",
      change_type: "increase"
    },
    {
      id: "acc-124",
      name: "PhonePe",
      type: "wallet",
      balance: "4200.00",
      change: "120.00",
      change_type: "decrease"
    },
    {
      id: "acc-125",
      name: "Cash Wallet",
      type: "cash",
      balance: "7720.00",
      change: "0.00",
      change_type: "neutral"
    }
  ],
  recent_transactions: [
    {
      id: "tx-1",
      description: "Swiggy",
      category: "Food & Dining",
      category_icon: "🍔",
      account: "HDFC Savings",
      type: "expense",
      amount: "450.00",
      date: "2026-07-28",
      status: "completed",
      payment_method: "UPI"
    },
    {
      id: "tx-2",
      description: "Ola Cabs",
      category: "Transport",
      category_icon: "🚕",
      account: "PhonePe",
      type: "expense",
      amount: "320.00",
      date: "2026-07-27",
      status: "completed",
      payment_method: "UPI"
    },
    {
      id: "tx-3",
      description: "Salary",
      category: "Income",
      category_icon: "💰",
      account: "HDFC Savings",
      type: "income",
      amount: "95000.00",
      date: "2026-07-01",
      status: "completed",
      payment_method: "NEFT"
    }
  ],
  savings_goals: [
    {
      id: "sg-1",
      name: "Emergency Fund",
      icon: "🛡️",
      target: "300000.00",
      saved: "185000.00",
      percentage: 62,
      monthly_contribution: "15000.00",
      monthly_target: "15000.00",
      status: "on_track"
    },
    {
      id: "sg-2",
      name: "Goa Trip",
      icon: "🏖️",
      target: "50000.00",
      saved: "22000.00",
      percentage: 44,
      monthly_contribution: "5000.00",
      monthly_target: "5000.00",
      status: "behind"
    },
    {
      id: "sg-3",
      name: "MacBook Pro",
      icon: "💻",
      target: "130000.00",
      saved: "40300.00",
      percentage: 31,
      monthly_contribution: "10000.00",
      monthly_target: "10000.00",
      status: "on_track"
    }
  ]
};

const fetchDashboardData = async (): Promise<DashboardData> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDashboardData);
    }, 600);
  });
};

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
  });
}
