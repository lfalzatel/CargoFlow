// src/lib/soundEffects.ts
export type SoundProfileId = 'pop' | 'click' | 'chime' | 'haptic' | 'arcade' | 'silent';

export interface SoundProfile {
  id: SoundProfileId;
  name: string;
  desc: string;
  emoji: string;
  isDefault?: boolean;
}

export const SOUND_PROFILES: SoundProfile[] = [
  { id: 'pop', name: 'Pop / Burbuja', desc: 'Suave y satisfactorio estilo iOS (Por defecto)', emoji: '🍿', isDefault: true },
  { id: 'click', name: 'Click Digital', desc: 'Crisp, mecánico y tecnológico', emoji: '⚡' },
  { id: 'chime', name: 'Campana Armónica', desc: 'Micro-acorde elegante y refinado', emoji: '🎵' },
  { id: 'haptic', name: 'Toque Háptico', desc: 'Golpecito grave estilo motor de vibración', emoji: '📳' },
  { id: 'arcade', name: 'Chime Brillos', desc: 'Tono cristalino ascendente moderno', emoji: '✨' },
  { id: 'silent', name: 'Silencioso', desc: 'Desactivar efectos de sonido', emoji: '🔇' },
];

const STORAGE_KEY_MENU = 'ui_sound_profile_menu';
const STORAGE_KEY_GENERAL = 'ui_sound_profile_general';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (err) {
    console.warn('Error iniciando AudioContext:', err);
    return null;
  }
}

// 🍿 1. Pop / Burbuja (Tono de barrido sinusoidal corto)
export function playPop() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.warn('Error en playPop:', e);
  }
}

// ⚡ 2. Click Digital (Tono triangular ultracorto)
export function playClick() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch (e) {
    console.warn('Error en playClick:', e);
  }
}

// 🎵 3. Campana Armónica (Doble tono simultáneo Do5 + Mi5)
export function playChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.12);
  } catch (e) {
    console.warn('Error en playChime:', e);
  }
}

// 📳 4. Toque Háptico (Frecuencia grave descendente 160Hz -> 50Hz)
export function playHapticThud() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {
    console.warn('Error en playHapticThud:', e);
  }
}

// ✨ 5. Arcade / Chime Brillos (Escala triple ascendente 600Hz -> 1200Hz -> 1800Hz)
export function playArcade() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.12);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.12);
  } catch (e) {
    console.warn('Error en playArcade:', e);
  }
}

// ── GETTERS & SETTERS CON VALORES POR DEFECTO ACTIVOS ──
export function getMenuUiSoundProfile(): SoundProfileId {
  if (typeof localStorage === 'undefined') return 'pop';
  const saved = localStorage.getItem(STORAGE_KEY_MENU) as SoundProfileId;
  if (saved && SOUND_PROFILES.some(p => p.id === saved)) return saved;
  return 'pop'; // Activo por defecto ('pop')
}

export function setMenuUiSoundProfile(profileId: SoundProfileId): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MENU, profileId);
  }
}

export function getGeneralUiSoundProfile(): SoundProfileId {
  if (typeof localStorage === 'undefined') return 'pop';
  const saved = localStorage.getItem(STORAGE_KEY_GENERAL) as SoundProfileId;
  if (saved && SOUND_PROFILES.some(p => p.id === saved)) return saved;
  return 'pop'; // Activo por defecto ('pop')
}

export function setGeneralUiSoundProfile(profileId: SoundProfileId): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_GENERAL, profileId);
  }
}

function playSoundByProfile(profileId: SoundProfileId): void {
  switch (profileId) {
    case 'pop': playPop(); break;
    case 'click': playClick(); break;
    case 'chime': playChime(); break;
    case 'haptic': playHapticThud(); break;
    case 'arcade': playArcade(); break;
    case 'silent': default: break;
  }
}

// Reproduce el sonido de navegación del menú inferior
export function playMenuUiSound(overrideProfileId?: SoundProfileId): void {
  const profileId = overrideProfileId || getMenuUiSoundProfile();
  playSoundByProfile(profileId);
}

// Reproduce el sonido de botones e interfaz general
export function playGeneralUiSound(overrideProfileId?: SoundProfileId): void {
  const profileId = overrideProfileId || getGeneralUiSoundProfile();
  playSoundByProfile(profileId);
}
