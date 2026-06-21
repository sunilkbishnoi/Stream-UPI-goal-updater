import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FreechargeTransaction } from '@/hooks/useDonationStore';

export const useFreechargeSync = (
  onNewTransactions: (transactions: FreechargeTransaction[]) => void
) => {
  // Fetch all transactions from database
  const fetchTransactions = useCallback(async () => {
    const { data, error } = await supabase
      .from('freecharge_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching freecharge transactions:', error);
      return;
    }

    if (data && data.length > 0) {
      const formatted: FreechargeTransaction[] = data.map(tx => ({
        id: tx.id,
        name: tx.name,
        date: tx.date,
        transactionId: tx.transaction_id,
        status: tx.status,
        amount: Number(tx.amount),
      }));
      onNewTransactions(formatted);
    }
  }, [onNewTransactions]);

  // Set up realtime subscription
  useEffect(() => {
    // Initial fetch
    fetchTransactions();

    // Subscribe to new inserts
    const channel = supabase
      .channel('freecharge-sync')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'freecharge_transactions',
        },
        (payload) => {
          console.log('New transaction synced:', payload);
          // Refetch all to update
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTransactions]);

  return { refetch: fetchTransactions };
};
