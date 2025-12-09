import { Button } from '@/components/ui/button';
interface AmountButtonsProps {
  onAdd: (amount: number) => void;
}
const QUICK_AMOUNTS = [10, 100, 200, 500, 1000];
export const AmountButtons = ({
  onAdd
}: AmountButtonsProps) => {
  return <div className="grid grid-cols-5 gap-2 w-full max-w-sm">
      {QUICK_AMOUNTS.map(amount => <Button key={amount} variant="amount" size="amount" onClick={() => onAdd(amount)} className="w-full mx-0 px-[10px] py-[10px] pl-0 pr-0 text-center">
          ₹{amount}
        </Button>)}
    </div>;
};