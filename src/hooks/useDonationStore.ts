import { useState, useEffect, useCallback, useRef } from 'react';
import { playDonationSound, playGoalSound } from '@/lib/sounds';

export interface Transaction {
  id: string;
  amount: number;
  timestamp: Date;
}

export interface FreechargeTransaction {
  id: string;
  name: string;
  date: string;
  transactionId: string;
  status: string;
  amount: number;
}

interface DonationState {
  goal: number;
  current: number;
  transactions: Transaction[];
  freechargeTransactions: FreechargeTransaction[];
  processedTxIds: string[];
  upiId: string;
  lastFreechargeRefresh: Date | null;
}

const STORAGE_KEY = 'donation-tracker-state';

const loadState = (): DonationState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        transactions: parsed.transactions.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp),
        })),
        freechargeTransactions: parsed.freechargeTransactions || [],
        processedTxIds: parsed.processedTxIds || [],
        lastFreechargeRefresh: parsed.lastFreechargeRefresh ? new Date(parsed.lastFreechargeRefresh) : null,
      };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return {
    goal: 12000,
    current: 0,
    transactions: [],
    freechargeTransactions: [],
    processedTxIds: [],
    upiId: '',
    lastFreechargeRefresh: null,
  };
};

const saveState = (state: DonationState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
};

export const useDonationStore = () => {
  const [state, setState] = useState<DonationState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addAmount = useCallback((amount: number) => {
    if (amount < 10) return;
    
    playDonationSound(amount);
    
    setState(prev => {
      const newCurrent = prev.current + amount;
      
      // Check if goal is reached with this donation
      if (newCurrent >= prev.goal && prev.current < prev.goal) {
        setTimeout(() => playGoalSound(), 500);
      }
      
      return {
        ...prev,
        current: newCurrent,
        transactions: [
          {
            id: Date.now().toString(),
            amount,
            timestamp: new Date(),
          },
          ...prev.transactions,
        ],
      };
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState(prev => {
      const transaction = prev.transactions.find(t => t.id === id);
      if (!transaction) return prev;
      
      return {
        ...prev,
        current: Math.max(0, prev.current - transaction.amount),
        transactions: prev.transactions.filter(t => t.id !== id),
      };
    });
  }, []);

  const importFreechargeTransactions = useCallback((newTransactions: FreechargeTransaction[]) => {
    setState(prev => {
      // Filter out already processed transactions
      const unprocessed = newTransactions.filter(
        tx => !prev.processedTxIds.includes(tx.transactionId || tx.id)
      );
      
      if (unprocessed.length === 0) {
        return {
          ...prev,
          lastFreechargeRefresh: new Date(),
        };
      }

      // Add new transactions to goal and play sounds
      let newCurrent = prev.current;
      const newLocalTransactions = [...prev.transactions];
      
      unprocessed.forEach(tx => {
        // Only accept donations of ₹10 or more
        if (tx.amount >= 10) {
          newCurrent += tx.amount;
          newLocalTransactions.unshift({
            id: tx.transactionId || tx.id,
            amount: tx.amount,
            timestamp: new Date(),
          });
          
          // Play sound for each new transaction
          setTimeout(() => playDonationSound(tx.amount), 100);
        }
      });
      
      // Check if goal is reached
      if (newCurrent >= prev.goal && prev.current < prev.goal) {
        setTimeout(() => playGoalSound(), 500);
      }

      // Merge and dedupe freecharge transactions
      const existingIds = new Set(prev.freechargeTransactions.map(t => t.transactionId || t.id));
      const mergedFreecharge = [
        ...newTransactions.filter(t => !existingIds.has(t.transactionId || t.id)),
        ...prev.freechargeTransactions,
      ];

      return {
        ...prev,
        current: newCurrent,
        transactions: newLocalTransactions,
        freechargeTransactions: mergedFreecharge,
        processedTxIds: [
          ...prev.processedTxIds,
          ...unprocessed.map(tx => tx.transactionId || tx.id),
        ],
        lastFreechargeRefresh: new Date(),
      };
    });
  }, []);

  const setGoal = useCallback((goal: number) => {
    setState(prev => ({ ...prev, goal }));
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      current: 0,
      transactions: [],
    }));
  }, []);

  const resetFreecharge = useCallback(() => {
    setState(prev => ({
      ...prev,
      freechargeTransactions: [],
      processedTxIds: [],
      lastFreechargeRefresh: null,
    }));
  }, []);

  const setUpiId = useCallback((upiId: string) => {
    setState(prev => ({ ...prev, upiId }));
  }, []);

  const percentage = state.goal > 0 ? Math.min((state.current / state.goal) * 100, 100) : 0;

  return {
    ...state,
    percentage,
    addAmount,
    deleteTransaction,
    importFreechargeTransactions,
    setGoal,
    reset,
    resetFreecharge,
    setUpiId,
  };
};
