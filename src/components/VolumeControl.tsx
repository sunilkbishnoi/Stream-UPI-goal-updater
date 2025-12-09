import { Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

const VOLUME_KEY = 'donation-sound-volume';

export const getVolume = (): number => {
  try {
    const saved = localStorage.getItem(VOLUME_KEY);
    return saved ? parseFloat(saved) : 0.3;
  } catch {
    return 0.3;
  }
};

export const VolumeControl = () => {
  const [volume, setVolume] = useState(getVolume);
  const [muted, setMuted] = useState(volume === 0);

  useEffect(() => {
    localStorage.setItem(VOLUME_KEY, volume.toString());
  }, [volume]);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (muted) {
      setVolume(0.3);
      setMuted(false);
    } else {
      setVolume(0);
      setMuted(true);
    }
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="h-8 w-8 shrink-0"
      >
        {muted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
      <Slider
        value={[volume]}
        onValueChange={handleVolumeChange}
        max={1}
        step={0.05}
        className="flex-1"
      />
      <span className="text-xs text-muted-foreground w-8 text-right">
        {Math.round(volume * 100)}%
      </span>
    </div>
  );
};
