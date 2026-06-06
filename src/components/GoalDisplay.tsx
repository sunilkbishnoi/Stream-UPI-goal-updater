import { Progress } from '@/components/ui/progress';

interface GoalDisplayProps {
  current: number;
  goal: number;
  percentage: number;
}

export const GoalDisplay = ({ percentage }: GoalDisplayProps) => {
  return (
    <div className="flex flex-col items-center gap-1 w-full">
      <div className="w-full">
        <Progress value={percentage} className="h-2" />
      </div>
      <p className="text-muted-foreground text-xs">
        {percentage.toFixed(1)}% of goal reached
      </p>
    </div>
  );
};
