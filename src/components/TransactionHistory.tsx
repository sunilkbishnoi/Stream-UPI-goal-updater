import { Transaction } from '@/hooks/useDonationStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const getTierColor = (amount: number): string => {
  if (amount >= 1000) return 'text-amber-600';
  if (amount >= 500) return 'text-purple-600';
  if (amount >= 200) return 'text-blue-600';
  if (amount >= 100) return 'text-green-600';
  return 'text-foreground';
};

export const TransactionHistory = ({ transactions, onDelete }: TransactionHistoryProps) => {
  return (
    <div className="w-full border border-border rounded-xl bg-card">
      <div className="flex justify-between items-center px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">All History</h3>
        <span className="text-sm text-muted-foreground">
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <ScrollArea className="h-64">
        {transactions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground py-12">
            No transactions yet
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex justify-between items-center px-5 py-3 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex flex-col">
                  <span className={`font-semibold ${getTierColor(transaction.amount)}`}>
                    +₹{transaction.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(transaction.timestamp)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {formatTime(transaction.timestamp)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(transaction.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
