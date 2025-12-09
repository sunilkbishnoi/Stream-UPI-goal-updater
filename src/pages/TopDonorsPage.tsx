import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface DonorAggregate {
  name: string;
  totalAmount: number;
  donationCount: number;
}

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        bg: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20',
        border: 'border-amber-500/50',
        text: 'text-amber-500',
        icon: '🥇',
        size: 'text-3xl',
      };
    case 2:
      return {
        bg: 'bg-gradient-to-r from-slate-400/20 to-gray-400/20',
        border: 'border-slate-400/50',
        text: 'text-slate-400',
        icon: '🥈',
        size: 'text-2xl',
      };
    case 3:
      return {
        bg: 'bg-gradient-to-r from-amber-700/20 to-orange-700/20',
        border: 'border-amber-700/50',
        text: 'text-amber-700',
        icon: '🥉',
        size: 'text-2xl',
      };
    default:
      return {
        bg: 'bg-muted/50',
        border: 'border-border',
        text: 'text-muted-foreground',
        icon: `#${rank}`,
        size: 'text-xl',
      };
  }
};

const TopDonorsPage = () => {
  const [donors, setDonors] = useState<DonorAggregate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonors = async () => {
      const { data, error } = await supabase
        .from('freecharge_transactions')
        .select('name, amount');

      if (error) {
        console.error('Error fetching donors:', error);
        setLoading(false);
        return;
      }

      // Aggregate by name
      const aggregated = (data || []).reduce((acc, tx) => {
        if (!acc[tx.name]) {
          acc[tx.name] = { name: tx.name, totalAmount: 0, donationCount: 0 };
        }
        acc[tx.name].totalAmount += tx.amount;
        acc[tx.name].donationCount += 1;
        return acc;
      }, {} as Record<string, DonorAggregate>);

      const sorted = Object.values(aggregated).sort((a, b) => b.totalAmount - a.totalAmount);
      setDonors(sorted);
      setLoading(false);
    };

    fetchDonors();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('top-donors-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'freecharge_transactions' },
        () => {
          fetchDonors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            <h1 className="text-3xl font-bold text-foreground">Top Donors</h1>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-muted-foreground py-12">
              Loading...
            </div>
          ) : donors.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 border border-border rounded-xl bg-card">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No donors yet</p>
              <p className="text-sm mt-1">Be the first to donate!</p>
            </div>
          ) : (
            donors.map((donor, index) => {
              const rank = index + 1;
              const style = getRankStyle(rank);

              return (
                <div
                  key={donor.name}
                  className={`flex items-center justify-between p-5 rounded-xl border ${style.bg} ${style.border} transition-all hover:scale-[1.01]`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`${style.size}`}>{style.icon}</span>
                    <div>
                      <p className="font-semibold text-foreground text-lg">{donor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {donor.donationCount} donation{donor.donationCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span className={`text-2xl font-bold ${style.text}`}>
                    ₹{donor.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
};

export default TopDonorsPage;