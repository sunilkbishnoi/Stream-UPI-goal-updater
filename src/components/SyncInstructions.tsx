import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getFreechargeScraperScript } from '@/lib/freechargeSync';

export const SyncInstructions = () => {
  const [copied, setCopied] = useState(false);
  const script = getFreechargeScraperScript();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      toast({
        title: "Script Copied!",
        description: "Now paste it in Freecharge console",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please select and copy manually",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Info className="w-4 h-4" />
          Auto-Sync Setup
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enable Auto-Sync from Freecharge</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2 text-sm">
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">1</span>
              <div>
                <p className="font-medium">Open Freecharge in a new tab</p>
                <a 
                  href="https://www.freecharge.in/transactions-history" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs mt-1"
                >
                  Open Freecharge <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <p className="font-medium">Open Developer Console</p>
                <p className="text-muted-foreground text-xs">Press F12 → Click "Console" tab</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">3</span>
              <div>
                <p className="font-medium">Paste and run the sync script</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 gap-2"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Script'}
                </Button>
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">4</span>
              <div>
                <p className="font-medium">Keep both tabs open</p>
                <p className="text-muted-foreground text-xs">Transactions sync every 10 seconds automatically!</p>
              </div>
            </div>
          </div>
          
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>How it works:</strong> The script reads your Freecharge transactions and saves them to browser storage. This page checks for new transactions every 10 seconds and adds them to your goal.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
