import { useRef } from 'react';
import { Upload, QrCode } from 'lucide-react';

interface QRSectionProps {
  qrImage: string | null;
  onImageUpload: (image: string) => void;
}

export const QRSection = ({ qrImage, onImageUpload }: QRSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageUpload(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      <div
        onClick={handleClick}
        className="relative w-48 h-48 border-2 border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer hover:border-muted-foreground transition-colors bg-muted/30 overflow-hidden"
      >
        {qrImage ? (
          <img
            src={qrImage}
            alt="UPI QR Code"
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <QrCode className="w-12 h-12" />
            <div className="text-center px-4">
              <p className="text-sm font-medium">Upload QR Code</p>
              <p className="text-xs mt-1">Click to upload</p>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {qrImage && (
        <button
          onClick={handleClick}
          className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Upload className="w-3 h-3" />
          Change QR
        </button>
      )}
    </div>
  );
};
