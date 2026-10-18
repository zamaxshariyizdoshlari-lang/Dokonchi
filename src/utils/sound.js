// "Do'kon ohanglari": short WebAudio tones + haptic feedback, no audio files needed.
const MUTE_KEY = 'baraka_pos_sound_muted_v1';

let ctx = null;

export const isSoundMuted = () => {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
};

export const setSoundMuted = (muted) => {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    // storage unavailable: mute state just won't persist
  }
};

const getCtx = () => {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};

const tone = (freq, start, duration, { type = 'sine', gain = 0.12 } = {}) => {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const amp = c.createGain();
  const t0 = c.currentTime + start;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(amp).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
};

const buzz = (pattern) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // vibration not supported
  }
};

const play = (fn, vibrate) => {
  if (vibrate) buzz(vibrate);
  if (isSoundMuted()) return;
  try {
    fn();
  } catch {
    // audio blocked until first user gesture: ignore
  }
};

// Product added to cart: soft click-pop
export const playAddToCart = () =>
  play(() => {
    tone(520, 0, 0.06, { type: 'triangle', gain: 0.1 });
    tone(780, 0.03, 0.07, { type: 'triangle', gain: 0.08 });
  }, 10);

// Barcode scanned: supermarket beep, 880 Hz
export const playScan = () =>
  play(() => tone(880, 0, 0.12, { type: 'square', gain: 0.06 }), 20);

// Customer card recognised: two-tone C5 -> G5
export const playCustomerFound = () =>
  play(() => {
    tone(523.25, 0, 0.14);
    tone(783.99, 0.14, 0.22);
  }, [15, 40, 15]);

// Debt paid / sale completed: cash register "cha-ching"
export const playChaChing = () =>
  play(() => {
    tone(1318.5, 0, 0.09, { type: 'triangle', gain: 0.1 });
    tone(1760, 0.09, 0.45, { type: 'triangle', gain: 0.1 });
    tone(2637, 0.09, 0.3, { type: 'sine', gain: 0.04 });
  }, [20, 30, 40]);
