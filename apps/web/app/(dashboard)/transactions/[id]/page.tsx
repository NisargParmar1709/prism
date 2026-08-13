'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Trash2, Calendar, Tag, CreditCard, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { PrismButton } from '@/components/ui/PrismButton';
import { useTransaction, useDeleteTransaction, useRestoreTransaction } from '@/hooks/use-transactions';
import { TransactionEditModal } from '@/components/transactions/TransactionEditModal';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { data: transaction, isLoading, error } = useTransaction(id);
  const deleteMutation = useDeleteTransaction();
  const restoreMutation = useRestoreTransaction();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-prism-violet-200 border-t-prism-violet-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="p-8 text-center">
        <p className="text-prism-text-muted mb-4">Transaction not found.</p>
        <PrismButton onClick={() => router.push('/transactions')} variant="secondary">
          Back to Transactions
        </PrismButton>
      </div>
    );
  }

  const isIncome = transaction.type === 'income';

  const handleDelete = () => {
    // Custom confirm dialog could go here, but for now we use browser confirm or just delete directly
    if (!window.confirm(`Delete this transaction? This will remove ₹${transaction.amount} from your ${transaction.account_name} balance.`)) {
      return;
    }

    deleteMutation.mutateAsync(id).then(() => {
      // Redirect immediately to transactions list
      router.push('/transactions');
      
      // We show a custom toast with Undo button
      // To bypass the default success toast from useDeleteTransaction, we'd need to either disable it 
      // there, or just show another one. Let's show a custom toast that stays for 5 seconds.
      toast(
        (t) => (
          <div className="flex items-center justify-between w-full gap-4">
            <span>Transaction deleted</span>
            <button
              onClick={() => {
                restoreMutation.mutate(id);
                toast.dismiss(t.id);
              }}
              className="text-prism-violet-600 font-medium text-small hover:underline"
            >
              Undo
            </button>
          </div>
        ),
        { duration: 5000, id: `undo-${id}` }
      );
    });
  };

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-prism-surface/80 backdrop-blur-md border-b border-prism-border p-4 md:px-8">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-prism-text hover:text-prism-violet-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex gap-2">
            <PrismButton 
              variant="outline" 
              size="compact"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit2 className="w-4 h-4 mr-2" /> Edit
            </PrismButton>
            <PrismButton 
              variant="danger" 
              size="compact"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </PrismButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-10 mt-6">
          <div className="w-16 h-16 bg-prism-white rounded-full flex items-center justify-center text-3xl shadow-sm mb-4 border border-prism-border">
            {transaction.category_icon}
          </div>
          <h1 className="text-h2 font-semibold text-prism-text mb-1">{transaction.category_name}</h1>
          <p className="text-body text-prism-text-muted mb-6">{transaction.note || 'No note provided'}</p>
          
          <div className={`text-5xl md:text-6xl font-bold tracking-tight ${isIncome ? 'text-prism-success' : 'text-prism-text'}`}>
            {isIncome ? '+' : '-'}₹{parseFloat(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-prism-white rounded-card shadow-card overflow-hidden">
          <div className="p-6">
            <h3 className="text-h3 font-medium text-prism-text mb-6">Details</h3>
            
            <div className="space-y-6">
              {/* Account */}
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-prism-surface flex items-center justify-center text-prism-text-muted mr-4">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-prism-text-muted uppercase tracking-wider font-medium mb-1">Account</p>
                  <p className="text-body font-medium text-prism-text">{transaction.account_name}</p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-prism-surface flex items-center justify-center text-prism-text-muted mr-4">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-prism-text-muted uppercase tracking-wider font-medium mb-1">Date</p>
                  <p className="text-body font-medium text-prism-text">
                    {format(new Date(transaction.date), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-prism-surface flex items-center justify-center text-prism-text-muted mr-4">
                  {transaction.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-prism-success" />
                  ) : (
                    <Clock className="w-5 h-5 text-prism-warning" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-prism-text-muted uppercase tracking-wider font-medium mb-1">Status</p>
                  <p className="text-body font-medium text-prism-text capitalize">
                    {transaction.status}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {transaction.tags && transaction.tags.length > 0 && (
                <div className="flex items-start pt-2">
                  <div className="w-10 h-10 rounded-full bg-prism-surface flex items-center justify-center text-prism-text-muted mr-4 shrink-0">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-prism-text-muted uppercase tracking-wider font-medium mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {transaction.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-prism-surface text-small text-prism-text rounded-full border border-prism-border">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-prism-surface/50 border-t border-prism-border p-4 text-center">
            <p className="text-xs text-prism-text-muted">
              Created on {format(new Date(transaction.created_at), 'MMM d, yyyy, h:mm a')}
            </p>
          </div>
        </div>

      </main>

      {transaction && (
        <TransactionEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          transaction={transaction}
        />
      )}
    </div>
  );
}
