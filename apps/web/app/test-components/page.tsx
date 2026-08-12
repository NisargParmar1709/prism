'use client';

import React from 'react';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { DarkHeroCard } from '@/components/ui/DarkHeroCard';
import { PrismButton } from '@/components/ui/PrismButton';
import { PrismInput } from '@/components/ui/PrismInput';
import { AmountInput } from '@/components/ui/AmountInput';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { TransactionRow } from '@/components/ui/TransactionRow';
import { StatusPill } from '@/components/ui/StatusPill';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { QuickAddFAB } from '@/components/ui/QuickAddFAB';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Coffee, Car, ShoppingBag, Search } from 'lucide-react';

export default function TestComponentsPage() {
  return (
    <div className="min-h-screen bg-prism-surface p-4 md:p-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-display text-prism-text mb-8">Component Library</h1>
        
        {/* SectionHeader */}
        <section>
          <SectionHeader 
            title="1. SectionHeader" 
            subtitle="Used to separate content blocks with optional actions." 
            action={<PrismButton variant="outline" size="compact">Action</PrismButton>}
          />
        </section>

        {/* SurfaceCard & DarkHeroCard */}
        <section className="space-y-4">
          <h2 className="text-h2">2 & 3. Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SurfaceCard interactive>
              <h3 className="text-h3 mb-2">Surface Card</h3>
              <p className="text-body text-prism-text-secondary">This card is interactive and will hover on mouse over.</p>
            </SurfaceCard>
            <DarkHeroCard>
              <h3 className="text-h3 mb-2">Dark Hero Card</h3>
              <p className="text-body text-prism-dark-muted">Used for prominent account displays.</p>
              <div className="mt-4 text-h1">₹2,84,350</div>
            </DarkHeroCard>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-h2">4. PrismButton Variants</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <PrismButton variant="primary">Primary</PrismButton>
            <PrismButton variant="secondary">Secondary</PrismButton>
            <PrismButton variant="outline">Outline</PrismButton>
            <PrismButton variant="danger">Danger</PrismButton>
            <PrismButton variant="text">Text Button</PrismButton>
            <PrismButton variant="primary" isLoading>Loading</PrismButton>
            <PrismButton variant="primary" disabled>Disabled</PrismButton>
          </div>
        </section>

        {/* Inputs */}
        <section className="space-y-4">
          <h2 className="text-h2">5 & 6. Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <PrismInput label="Standard Input" placeholder="Enter text..." />
              <PrismInput label="Input with Error" error="This field is required." defaultValue="Invalid value" />
            </div>
            <div className="space-y-4">
              <AmountInput label="Amount Input" value="4500.50" />
              <AmountInput label="Amount with Error" value="99999" error="Exceeds budget" />
            </div>
          </div>
        </section>

        {/* Progress */}
        <section className="space-y-4">
          <h2 className="text-h2">7 & 8. Progress Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <SurfaceCard>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1 text-xs"><span>Food</span><span>40%</span></div>
                  <ProgressBar value={40} />
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-xs"><span>Transport</span><span>85%</span></div>
                  <ProgressBar value={85} />
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-xs"><span>Shopping</span><span>110%</span></div>
                  <ProgressBar value={110} />
                </div>
              </div>
            </SurfaceCard>
            <SurfaceCard className="flex justify-center py-8">
              <CircularProgress value={62} label="Saved" size="desktop" />
            </SurfaceCard>
          </div>
        </section>

        {/* Status Pills */}
        <section className="space-y-4">
          <h2 className="text-h2">9. StatusPill</h2>
          <div className="flex flex-wrap gap-4">
            <StatusPill type="completed" label="Completed" />
            <StatusPill type="pending" label="Pending" />
            <StatusPill type="over-limit" label="Over Limit" />
            <StatusPill type="brand" label="UPI / NEFT" />
            <StatusPill type="monthly" label="Monthly" />
          </div>
        </section>

        {/* Transaction Row */}
        <section className="space-y-4">
          <h2 className="text-h2">10. TransactionRow</h2>
          <div className="rounded-card border border-prism-border overflow-hidden">
            <TransactionRow 
              icon={<Coffee size={20} />} 
              title="Starbucks" 
              subtitle="Food & Dining • 12:30 PM" 
              account="HDFC Savings" 
              amount={-450} 
              statusNode={<StatusPill type="completed" label="Completed" />}
            />
            <TransactionRow 
              icon={<Car size={20} />} 
              title="Uber" 
              subtitle="Transport • 09:15 AM" 
              account="HDFC Savings" 
              amount={-250} 
              isSelected
            />
            <TransactionRow 
              icon={<ShoppingBag size={20} />} 
              title="Salary Reversal" 
              subtitle="Income • Yesterday" 
              account="Axis Salary" 
              amount={50000} 
            />
          </div>
        </section>

        {/* Empty State */}
        <section className="space-y-4">
          <h2 className="text-h2">11. EmptyState</h2>
          <SurfaceCard>
            <EmptyState 
              icon={<Search />}
              title="No transactions found"
              description="We couldn't find anything matching your filters. Try adjusting them."
              actionLabel="Clear Filters"
              onAction={() => alert('Cleared!')}
            />
          </SurfaceCard>
        </section>

        {/* Skeleton */}
        <section className="space-y-4">
          <h2 className="text-h2">12. Skeleton Loaders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton variant="circle" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" className="w-3/4" />
                  <Skeleton variant="text" className="w-1/2" />
                </div>
              </div>
            </div>
            <div>
              <Skeleton variant="card" />
            </div>
          </div>
        </section>
        
      </div>
      
      {/* QuickAddFAB */}
      <QuickAddFAB onClick={() => alert('FAB Clicked! (or N pressed)')} />
    </div>
  );
}
