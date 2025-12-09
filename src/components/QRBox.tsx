import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
interface QRBoxProps {
  upiId: string;
  current: number;
  goal: number;
}
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-IN');
};
export const QRBox = ({
  upiId,
  current,
  goal
}: QRBoxProps) => {
  const upiUrl = upiId ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Donation` : '';
  return <Link to="/qr" className="inline-flex flex-col border-4 border-foreground rounded-lg overflow-hidden bg-background cursor-pointer hover:scale-105 transition-transform mr-[230px]">
      {/* QR Code Area - Square */}
      <div className="w-52 h-52 flex items-center justify-center bg-background mr-0">
        {upiId ? <QRCodeSVG value={upiUrl} size={180} level="H" bgColor="transparent" fgColor="currentColor" className="text-foreground" /> : <div className="flex flex-col items-center gap-1 text-muted-foreground text-center px-4">
            <p className="text-xs">Enter UPI ID below</p>
          </div>}
      </div>
      
      {/* Goal Display - Compact */}
      <div className="border-t-4 border-foreground bg-background px-3 py-2">
        <p className="text-center text-xl font-black tracking-tight text-foreground">
          {formatNumber(current)}/{formatNumber(goal)}
        </p>
      </div>
    </Link>;
};