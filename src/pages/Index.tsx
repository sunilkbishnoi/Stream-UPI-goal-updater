import { QRBox } from '@/components/QRBox';
import { UPIInput } from '@/components/UPIInput';
import { GoalDisplay } from '@/components/GoalDisplay';
import { AmountButtons } from '@/components/AmountButtons';
import { CustomAmountInput } from '@/components/CustomAmountInput';
import { ActionButtons } from '@/components/ActionButtons';
import { TransactionHistory } from '@/components/TransactionHistory';
import { DonorList } from '@/components/DonorList';
import { TopDonors } from '@/components/TopDonors';
import { VolumeControl } from '@/components/VolumeControl';
import { useDonationStore } from '@/hooks/useDonationStore';
import { useFreechargeSync } from '@/hooks/useFreechargeSync';
import { toast } from '@/hooks/use-toast';
const Index = () => {
  const {
    goal,
    current,
    percentage,
    transactions,
    freechargeTransactions,
    upiId,
    addAmount,
    deleteTransaction,
    importFreechargeTransactions,
    setGoal,
    reset,
    resetFreecharge,
    setUpiId
  } = useDonationStore();

  // Auto-sync with database (extension will push data here)
  useFreechargeSync(importFreechargeTransactions);
  const handleAddAmount = (amount: number) => {
    addAmount(amount);
    toast({
      title: "Donation Added!",
      description: `₹${amount.toLocaleString('en-IN')} has been added.`
    });
  };
  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    toast({
      title: "Transaction Deleted",
      description: "The transaction has been removed."
    });
  };

  // Convert freecharge transactions to donor format
  const donors = freechargeTransactions.map(tx => ({
    id: tx.id,
    name: tx.name,
    amount: tx.amount,
    date: tx.date
  }));

  // Calculate top donors by aggregating total amounts per name
  const topDonors = Object.values(freechargeTransactions.reduce((acc, tx) => {
    if (!acc[tx.name]) {
      acc[tx.name] = {
        name: tx.name,
        totalAmount: 0
      };
    }
    acc[tx.name].totalAmount += tx.amount;
    return acc;
  }, {} as Record<string, {
    name: string;
    totalAmount: number;
  }>)).sort((a, b) => b.totalAmount - a.totalAmount);
  return <main className="min-h-screen bg-background py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Top Row: QR Box (left) + Controls (right) */}
        <div className="flex-col lg:flex-row gap-8 w-full flex items-center justify-center">
          {/* QR Box - Left Side */}
          <div className="shrink-0">
            <QRBox upiId={upiId} current={current} goal={goal} />
          </div>
          
          {/* Controls Column - Right Side */}
          <div className="flex-1 flex flex-col gap-4 max-w-md">
            {/* Progress Bar */}
            <GoalDisplay current={current} goal={goal} percentage={percentage} />
            
            {/* Quick Amount Buttons */}
            <AmountButtons onAdd={handleAddAmount} />
            
            {/* Custom Amount Input */}
            <CustomAmountInput onAdd={handleAddAmount} />
            
            {/* Settings Section: UPI ID + Goal + Reset */}
            <div className="border border-border rounded-xl bg-card p-4 space-y-4">
              <UPIInput upiId={upiId} onSave={setUpiId} />
              
              {/* Volume Control */}
              <div className="border-t border-border pt-3">
                <VolumeControl />
              </div>
              
              <div className="border-t border-border pt-3">
                <ActionButtons currentGoal={goal} onSetGoal={setGoal} onReset={reset} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Middle Row: History (left) + Donors (right) - always side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <TransactionHistory transactions={transactions} onDelete={handleDeleteTransaction} />
          <DonorList donors={donors} onClear={resetFreecharge} />
        </div>

        {/* Bottom: Top Donors Section */}
        <div className="w-full max-w-md">
          <TopDonors donors={topDonors} />
        </div>
      </div>
    </main>;
};
export default Index;