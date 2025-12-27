// Audio Service - Sound Effects and Background Music for Pokemon Battle
// Uses Web Audio API for sound effects and HTML5 Audio for music

interface SoundEffect {
  id: string;
  url: string;
  volume: number;
  loaded: boolean;
  buffer?: AudioBuffer;
}

interface BackgroundMusic {
  id: string;
  name: string;
  url: string;
  category: 'menu' | 'battle' | 'victory' | 'defeat';
}

class AudioService {
  private audioContext: AudioContext | null = null;
  private masterVolume = 0.5;
  private sfxVolume = 0.7;
  private musicVolume = 0.3;
  private sfxEnabled = true;
  private musicEnabled = true;
  private currentMusic: HTMLAudioElement | null = null;
  private currentMusicId: string = '';
  private soundBuffers: Map<string, AudioBuffer> = new Map();
  private isInitialized = false;

  // Sound effect definitions (using placeholder URLs - can be replaced with actual assets)
  private readonly SOUND_EFFECTS: Record<string, { frequency: number; duration: number; type: OscillatorType }> = {
    // Attack sounds
    'attack-physical': { frequency: 200, duration: 0.1, type: 'square' },
    'attack-special': { frequency: 400, duration: 0.15, type: 'sine' },
    'attack-super-effective': { frequency: 600, duration: 0.2, type: 'sawtooth' },
    'attack-not-effective': { frequency: 150, duration: 0.1, type: 'triangle' },
    'attack-critical': { frequency: 800, duration: 0.25, type: 'square' },
    'attack-immune': { frequency: 100, duration: 0.05, type: 'triangle' },

    // Status sounds
    'status-burn': { frequency: 300, duration: 0.3, type: 'sawtooth' },
    'status-freeze': { frequency: 800, duration: 0.4, type: 'sine' },
    'status-paralysis': { frequency: 250, duration: 0.2, type: 'square' },
    'status-poison': { frequency: 180, duration: 0.3, type: 'triangle' },
    'status-sleep': { frequency: 150, duration: 0.5, type: 'sine' },
    'status-heal': { frequency: 500, duration: 0.3, type: 'sine' },

    // Battle events
    'pokemon-switch': { frequency: 350, duration: 0.2, type: 'sine' },
    'pokemon-faint': { frequency: 100, duration: 0.5, type: 'sawtooth' },
    'level-up': { frequency: 600, duration: 0.4, type: 'sine' },
    'item-use': { frequency: 450, duration: 0.15, type: 'sine' },

    // Mechanics
    'mega-evolution': { frequency: 700, duration: 0.5, type: 'sine' },
    'dynamax': { frequency: 200, duration: 0.6, type: 'square' },
    'terastallize': { frequency: 900, duration: 0.4, type: 'sine' },

    // Weather
    'weather-sun': { frequency: 550, duration: 0.3, type: 'sine' },
    'weather-rain': { frequency: 300, duration: 0.4, type: 'triangle' },
    'weather-sandstorm': { frequency: 150, duration: 0.3, type: 'sawtooth' },
    'weather-hail': { frequency: 600, duration: 0.2, type: 'square' },

    // UI sounds
    'button-click': { frequency: 400, duration: 0.05, type: 'square' },
    'button-hover': { frequency: 500, duration: 0.03, type: 'sine' },
    'menu-open': { frequency: 450, duration: 0.1, type: 'sine' },
    'menu-close': { frequency: 350, duration: 0.1, type: 'sine' },
    'select': { frequency: 600, duration: 0.08, type: 'sine' },
    'error': { frequency: 200, duration: 0.15, type: 'square' },

    // Victory/Defeat
    'victory-fanfare': { frequency: 700, duration: 0.8, type: 'sine' },
    'defeat': { frequency: 150, duration: 0.6, type: 'sawtooth' }
  };

  // Initialize audio context (must be called after user interaction)
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
      console.log('Audio service initialized');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  // Play a synthesized sound effect
  playSFX(soundId: string): void {
    if (!this.sfxEnabled || !this.audioContext) return;

    const soundDef = this.SOUND_EFFECTS[soundId];
    if (!soundDef) {
      console.warn(`Sound effect not found: ${soundId}`);
      return;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = soundDef.type;
      oscillator.frequency.setValueAtTime(soundDef.frequency, this.audioContext.currentTime);

      // Envelope for the sound
      const volume = this.masterVolume * this.sfxVolume;
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + soundDef.duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + soundDef.duration);
    } catch (error) {
      console.error('Error playing SFX:', error);
    }
  }

  // Play attack sound based on effectiveness
  playAttackSound(effectiveness: number, isCritical: boolean = false, isPhysical: boolean = true): void {
    if (isCritical) {
      this.playSFX('attack-critical');
    } else if (effectiveness === 0) {
      this.playSFX('attack-immune');
    } else if (effectiveness > 1) {
      this.playSFX('attack-super-effective');
    } else if (effectiveness < 1) {
      this.playSFX('attack-not-effective');
    } else {
      this.playSFX(isPhysical ? 'attack-physical' : 'attack-special');
    }
  }

  // Play type-specific move sound
  playTypeSound(type: string): void {
    // Map types to frequencies for variety
    const typeFrequencies: Record<string, number> = {
      'fire': 400, 'water': 300, 'grass': 350, 'electric': 600,
      'ice': 500, 'fighting': 200, 'poison': 250, 'ground': 150,
      'flying': 450, 'psychic': 550, 'bug': 380, 'rock': 180,
      'ghost': 280, 'dragon': 320, 'dark': 220, 'steel': 420, 'fairy': 520
    };

    if (this.audioContext && this.sfxEnabled) {
      const frequency = typeFrequencies[type.toLowerCase()] || 400;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, this.audioContext.currentTime + 0.1);

      const volume = this.masterVolume * this.sfxVolume * 0.5;
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.2);
    }
  }

  // Play victory or defeat sound
  playBattleResult(isVictory: boolean): void {
    if (!this.audioContext || !this.sfxEnabled) return;

    if (isVictory) {
      // Victory fanfare - ascending notes
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        setTimeout(() => {
          const osc = this.audioContext!.createOscillator();
          const gain = this.audioContext!.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.audioContext!.currentTime);

          gain.gain.setValueAtTime(this.masterVolume * this.sfxVolume * 0.4, this.audioContext!.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.3);

          osc.connect(gain);
          gain.connect(this.audioContext!.destination);

          osc.start();
          osc.stop(this.audioContext!.currentTime + 0.3);
        }, i * 150);
      });
    } else {
      // Defeat sound - descending notes
      const notes = [392.00, 329.63, 261.63, 196.00]; // G4, E4, C4, G3
      notes.forEach((freq, i) => {
        setTimeout(() => {
          const osc = this.audioContext!.createOscillator();
          const gain = this.audioContext!.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, this.audioContext!.currentTime);

          gain.gain.setValueAtTime(this.masterVolume * this.sfxVolume * 0.3, this.audioContext!.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.4);

          osc.connect(gain);
          gain.connect(this.audioContext!.destination);

          osc.start();
          osc.stop(this.audioContext!.currentTime + 0.4);
        }, i * 200);
      });
    }
  }

  // Settings
  setSFXEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (!enabled && this.currentMusic) {
      this.currentMusic.pause();
    }
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.volume = this.masterVolume * this.musicVolume;
    }
  }

  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.volume = this.masterVolume * this.musicVolume;
    }
  }

  // Getters
  isSFXEnabled(): boolean {
    return this.sfxEnabled;
  }

  isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  getSFXVolume(): number {
    return this.sfxVolume;
  }

  getMusicVolume(): number {
    return this.musicVolume;
  }

  // Cleanup
  destroy(): void {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.soundBuffers.clear();
    this.isInitialized = false;
  }
}

// Singleton instance
export const audioService = new AudioService();

// React hook for audio
import { useEffect, useState, useCallback } from 'react';

export function useAudio() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(audioService.isSFXEnabled());
  const [musicEnabled, setMusicEnabled] = useState(audioService.isMusicEnabled());

  const initialize = useCallback(async () => {
    await audioService.initialize();
    setIsInitialized(true);
  }, []);

  const toggleSFX = useCallback(() => {
    const newValue = !sfxEnabled;
    audioService.setSFXEnabled(newValue);
    setSfxEnabled(newValue);
  }, [sfxEnabled]);

  const toggleMusic = useCallback(() => {
    const newValue = !musicEnabled;
    audioService.setMusicEnabled(newValue);
    setMusicEnabled(newValue);
  }, [musicEnabled]);

  const playSFX = useCallback((soundId: string) => {
    audioService.playSFX(soundId);
  }, []);

  const playAttackSound = useCallback((effectiveness: number, isCritical?: boolean, isPhysical?: boolean) => {
    audioService.playAttackSound(effectiveness, isCritical, isPhysical);
  }, []);

  const playTypeSound = useCallback((type: string) => {
    audioService.playTypeSound(type);
  }, []);

  const playBattleResult = useCallback((isVictory: boolean) => {
    audioService.playBattleResult(isVictory);
  }, []);

  return {
    isInitialized,
    sfxEnabled,
    musicEnabled,
    initialize,
    toggleSFX,
    toggleMusic,
    playSFX,
    playAttackSound,
    playTypeSound,
    playBattleResult,
    setMasterVolume: audioService.setMasterVolume.bind(audioService),
    setSFXVolume: audioService.setSFXVolume.bind(audioService),
    setMusicVolume: audioService.setMusicVolume.bind(audioService)
  };
}
