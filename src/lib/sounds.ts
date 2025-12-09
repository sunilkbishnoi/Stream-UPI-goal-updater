// High-quality streamer donation sounds using real audio samples
const audioContextRef = { current: null as AudioContext | null };
const audioBuffers: Map<string, AudioBuffer> = new Map();

// Get user volume preference
const getVolumeMultiplier = (): number => {
  try {
    const saved = localStorage.getItem('donation-sound-volume');
    return saved ? parseFloat(saved) : 0.3;
  } catch {
    return 0.3;
  }
};

const getAudioContext = (): AudioContext => {
  if (!audioContextRef.current) {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContextRef.current;
};

// Sound URLs - using high quality free sound effects
const SOUND_URLS = {
  coin: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', // Coin clink
  coins: 'https://assets.mixkit.co/active_storage/sfx/888/888-preview.mp3', // Multiple coins
  cashRegister: 'https://assets.mixkit.co/active_storage/sfx/1999/1999-preview.mp3', // Cash register
  success: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', // Success notification
  levelUp: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Level up
  jackpot: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3', // Jackpot win
  fanfare: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3', // Victory fanfare
  celebration: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Celebration
};

// Preload sounds for instant playback
const loadSound = async (name: string, url: string): Promise<void> => {
  try {
    const ctx = getAudioContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    audioBuffers.set(name, audioBuffer);
  } catch (e) {
    console.warn(`Failed to load sound ${name}:`, e);
  }
};

// Initialize - preload all sounds
const initSounds = async () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  
  await Promise.all(
    Object.entries(SOUND_URLS).map(([name, url]) => loadSound(name, url))
  );
};

// Play a preloaded sound
const playBuffer = (name: string, baseVolume: number = 1, delay: number = 0) => {
  const buffer = audioBuffers.get(name);
  if (!buffer) return;
  
  const volumeMultiplier = getVolumeMultiplier();
  if (volumeMultiplier === 0) return; // Muted
  
  const ctx = getAudioContext();
  const source = ctx.createBufferSource();
  const gainNode = ctx.createGain();
  
  source.buffer = buffer;
  gainNode.gain.value = baseVolume * volumeMultiplier;
  
  source.connect(gainNode);
  gainNode.connect(ctx.destination);
  source.start(ctx.currentTime + delay);
};

// Fallback synthesized sounds if loading fails
const playSynthCoin = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  for (let i = 0; i < 3; i++) {
    const delay = i * 0.06;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2500 + Math.random() * 1000, now + delay);
    osc.frequency.exponentialRampToValueAtTime(1200, now + delay + 0.1);
    
    gain.gain.setValueAtTime(0.1, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + delay);
    osc.stop(now + delay + 0.2);
  }
};

const playSynthCashRegister = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  
  // Bell ding
  const bell = ctx.createOscillator();
  const bellGain = ctx.createGain();
  bell.type = 'sine';
  bell.frequency.setValueAtTime(2000, now);
  bellGain.gain.setValueAtTime(0.15, now);
  bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  bell.connect(bellGain);
  bellGain.connect(ctx.destination);
  bell.start(now);
  bell.stop(now + 0.6);
  
  // Overtone
  const bell2 = ctx.createOscillator();
  const bellGain2 = ctx.createGain();
  bell2.type = 'sine';
  bell2.frequency.setValueAtTime(4000, now);
  bellGain2.gain.setValueAtTime(0.08, now);
  bellGain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  bell2.connect(bellGain2);
  bellGain2.connect(ctx.destination);
  bell2.start(now);
  bell2.stop(now + 0.4);
};

// Tier 1: ₹10-99 - Single coin
const playTier1Sound = () => {
  if (audioBuffers.has('coin')) {
    playBuffer('coin', 0.25);
  } else {
    playSynthCoin(getAudioContext());
  }
};

// Tier 2: ₹100-199 - Cash register
const playTier2Sound = () => {
  if (audioBuffers.has('cashRegister')) {
    playBuffer('cashRegister', 0.3);
  } else {
    playSynthCashRegister(getAudioContext());
  }
};

// Tier 3: ₹200-499 - Success + coins
const playTier3Sound = () => {
  if (audioBuffers.has('success')) {
    playBuffer('success', 0.3);
    playBuffer('coins', 0.2, 0.2);
  } else {
    playSynthCashRegister(getAudioContext());
  }
};

// Tier 4: ₹500-999 - Level up
const playTier4Sound = () => {
  if (audioBuffers.has('levelUp')) {
    playBuffer('levelUp', 0.35);
  } else {
    playSynthCashRegister(getAudioContext());
  }
};

// Tier 5: ₹1000+ - Jackpot!
const playTier5Sound = () => {
  if (audioBuffers.has('jackpot')) {
    playBuffer('jackpot', 0.4);
    playBuffer('coins', 0.15, 0.3);
  } else if (audioBuffers.has('fanfare')) {
    playBuffer('fanfare', 0.4);
  } else {
    playSynthCashRegister(getAudioContext());
  }
};

// Goal reached
const playGoalSound = () => {
  if (audioBuffers.has('celebration')) {
    playBuffer('celebration', 0.4);
    playBuffer('fanfare', 0.25, 0.5);
  } else if (audioBuffers.has('jackpot')) {
    playBuffer('jackpot', 0.4);
  } else {
    const ctx = getAudioContext();
    playSynthCashRegister(ctx);
  }
};

// Initialize sounds on first user interaction
let initialized = false;
const ensureInitialized = async () => {
  if (!initialized) {
    initialized = true;
    await initSounds();
  }
};

export const playDonationSound = async (amount: number) => {
  if (amount < 10) return;
  
  try {
    await ensureInitialized();
    
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    if (amount >= 1000) {
      playTier5Sound();
    } else if (amount >= 500) {
      playTier4Sound();
    } else if (amount >= 200) {
      playTier3Sound();
    } else if (amount >= 100) {
      playTier2Sound();
    } else {
      playTier1Sound();
    }
  } catch (e) {
    console.error('Failed to play sound:', e);
  }
};

export { playGoalSound };

// Also export for manual initialization
export const initDonationSounds = ensureInitialized;