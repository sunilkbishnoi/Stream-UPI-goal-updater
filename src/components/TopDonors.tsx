import { Link } from 'react-router-dom';
import { Trophy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Donor {
  name: string;
  totalAmount: number;
}

interface TopDonorsProps {
  donors: Donor[];
}

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        bg: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20',
        border: 'border-amber-500/50',
        text: 'text-amber-500',
        icon: '🥇',
      };
    case 2:
      return {
        bg: 'bg-gradient-to-r from-slate-400/20 to-gray-400/20',
        border: 'border-slate-400/50',
        text: 'text-slate-400',
        icon: '🥈',
      };
    case 3:
      return {
        bg: 'bg-gradient-to-r from-amber-700/20 to-orange-700/20',
        border: 'border-amber-700/50',
        text: 'text-amber-700',
        icon: '🥉',
      };
    default:
      return {
        bg: 'bg-muted/50',
        border: 'border-border',
        text: 'text-muted-foreground',
        icon: '',
      };
  }
};

export const TopDonors = ({ donors }: TopDonorsProps) => {
  const top3 = donors.slice(0, 3);

  return (
    <div className="w-full border border-border rounded-xl bg-card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-foreground">Top Donors</h3>
        </div>
        <Link to="/top-donors">
          <Button variant="ghost" size="sm" className="gap-1.5">
            View All
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      <div className="p-4 space-y-3">
        {top3.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            No donors yet
          </div>
        ) : (
          top3.map((donor, index) => {
            const rank = index + 1;
            const style = getRankStyle(rank);
            
            return (
              <div
                key={donor.name}
                className={`flex items-center justify-between p-4 rounded-lg border ${style.bg} ${style.border} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{style.icon}</span>
                  <div>
                    <p className="font-semibold text-foreground">{donor.name}</p>
                    <p className="text-xs text-muted-foreground">Rank #{rank}</p>
                  </div>
                </div>
                <span className={`text-xl font-bold ${style.text}`}>
                  ₹{donor.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};