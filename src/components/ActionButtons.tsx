import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ActionButtonsProps {
  currentGoal: number;
  onSetGoal: (goal: number) => void;
  onReset: () => void;
}

export const ActionButtons = ({ currentGoal, onSetGoal, onReset }: ActionButtonsProps) => {
  const [goalInput, setGoalInput] = useState(currentGoal.toString());
  const [open, setOpen] = useState(false);

  const handleSaveGoal = () => {
    const value = parseInt(goalInput, 10);
    if (!isNaN(value) && value > 0) {
      onSetGoal(value);
      setOpen(false);
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Goal Settings
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Donation Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="goal">Goal Amount (₹)</Label>
              <Input
                id="goal"
                type="number"
                min="1"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="Enter goal amount"
              />
            </div>
            <Button onClick={handleSaveGoal} className="w-full">
              Save Goal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Progress?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset the current amount to 0 and clear all transaction history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
