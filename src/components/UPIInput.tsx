import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UPIInputProps {
  upiId: string;
  onSave: (upiId: string) => void;
}

export const UPIInput = ({ upiId, onSave }: UPIInputProps) => {
  const [inputValue, setInputValue] = useState(upiId);

  const handleSave = () => {
    if (!inputValue.trim()) {
      toast({
        title: "Invalid UPI ID",
        description: "Please enter a valid UPI ID",
        variant: "destructive",
      });
      return;
    }
    onSave(inputValue.trim());
    toast({
      title: "UPI ID Saved",
      description: "Your UPI ID has been saved successfully",
    });
  };

  return (
    <div className="w-full max-w-sm border border-border rounded-xl bg-card p-5">
      <h3 className="text-center font-semibold text-foreground mb-4">Enter UPI ID</h3>
      <Input
        type="text"
        placeholder="yourname@upi"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="mb-3 text-center"
      />
      <Button 
        onClick={handleSave} 
        className="w-full gap-2 bg-muted-foreground hover:bg-muted-foreground/80"
      >
        <Check className="w-4 h-4" />
        Save UPI ID
      </Button>
    </div>
  );
};
