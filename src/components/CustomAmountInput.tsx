import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CustomAmountInputProps {
  onAdd: (amount: number) => void;
}

export const CustomAmountInput = ({ onAdd }: CustomAmountInputProps) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseInt(amount, 10);
    
    if (isNaN(value) || value < 10) {
      toast({
        title: "Invalid amount",
        description: "Minimum amount is ₹10",
        variant: "destructive",
      });
      return;
    }
    
    onAdd(value);
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-sm">
      <Input
        type="number"
        min="10"
        placeholder="Custom amount (min ₹10)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="flex-1 h-10"
      />
      <Button type="submit" size="icon" className="h-10 w-10">
        <Plus className="w-4 h-4" />
      </Button>
    </form>
  );
};
