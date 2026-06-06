import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { User, Trash2 } from 'lucide-react';

interface Donor {
  id: string;
  name: string;
  amount: number;
  date: string;
}

interface DonorListProps {
  donors: Donor[];
  onClear?: () => void;
}

const getTierColor = (amount: number): string => {
  if (amount >= 1000) return 'text-amber-500';
  if (amount >= 500) return 'text-purple-500';
  if (amount >= 200) return 'text-blue-500';
  if (amount >= 100) return 'text-green-500';
  return 'text-muted-foreground';
};

export const DonorList = ({ donors, onClear }: DonorListProps) => {
  return (
    <div className="w-full border border-border rounded-xl bg-card">
      <div className="flex justify-between items-center px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <User className="w-4 h-4" />
          Donors
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {donors.length} donor{donors.length !== 1 ? 's' : ''}
          </span>
          {donors.length > 0 && onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
      
      <ScrollArea className="h-64">
        {donors.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground py-12">
            No donors yet
          </div>
        ) : (
          <div className="divide-y divide-border">
            {donors.map((donor) => (
              <div
                key={donor.id}
                className="flex flex-col px-5 py-3 hover:bg-muted/50 transition-colors gap-1"
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium text-foreground break-words">
                    {donor.name}
                  </span>
                  <span className={`font-semibold whitespace-nowrap ml-3 ${getTierColor(donor.amount)}`}>
                    ₹{donor.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {donor.date}
                </span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
