import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const QRPage = () => {
  const [state, setState] = useState({
    upiId: '',
    current: 0,
    goal: 12000,
  });

  useEffect(() => {
    // Load state from localStorage
    const loadState = () => {
      try {
        const saved = localStorage.getItem('donation-tracker-state');
        if (saved) {
          const parsed = JSON.parse(saved);
          setState({
            upiId: parsed.upiId || '',
            current: parsed.current || 0,
            goal: parsed.goal || 12000,
          });
        }
      } catch (e) {
        console.error('Failed to load state:', e);
      }
    };

    loadState();

    // Listen for storage changes (when home page updates)
    const handleStorage = () => loadState();
    window.addEventListener('storage', handleStorage);
    
    // Poll for updates every second
    const interval = setInterval(loadState, 1000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const upiLink = state.upiId 
    ? `upi://pay?pa=${state.upiId}&pn=Donation&cu=INR`
    : '';

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-IN');
  };

  

  return (
    <Link to="/" className="min-h-screen bg-transparent flex items-center justify-center p-8 cursor-pointer">
      <div className="inline-flex flex-col border-4 border-foreground rounded-lg overflow-hidden bg-background">
        {/* QR Code Area */}
        <div className="w-64 h-64 flex items-center justify-center bg-background p-4">
          <QRCodeSVG
            value={upiLink}
            size={220}
            level="H"
            bgColor="transparent"
            fgColor="currentColor"
            className="text-foreground"
          />
        </div>
        
        {/* Goal Display */}
        <div className="border-t-4 border-foreground bg-background px-4 py-3">
          <p className="text-center text-2xl font-black tracking-tight text-foreground">
            {formatAmount(state.current)}/{formatAmount(state.goal)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default QRPage;