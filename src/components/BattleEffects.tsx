import { useState, useEffect, useCallback } from 'react';

// Particle types for different effects
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
  type: 'circle' | 'star' | 'diamond' | 'spark' | 'drop' | 'rock' | 'leaf';
}

interface ParticleEffectProps {
  type: 'attack' | 'super-effective' | 'critical' | 'heal' | 'faint' | 'mega' | 'dynamax' | 'tera' |
        'weather-sun' | 'weather-rain' | 'weather-sand' | 'weather-hail' | 'status' | null;
  position: { x: number; y: number };
  color?: string;
  onComplete?: () => void;
}

// Type-based color schemes
const TYPE_COLORS: Record<string, string[]> = {
  fire: ['#FF6B35', '#FF4500', '#FFD700', '#FF8C00'],
  water: ['#3498DB', '#2980B9', '#1ABC9C', '#5DADE2'],
  grass: ['#2ECC71', '#27AE60', '#58D68D', '#82E0AA'],
  electric: ['#F1C40F', '#F39C12', '#FFEB3B', '#FFC107'],
  ice: ['#74B9FF', '#0984E3', '#81ECEC', '#00CED1'],
  fighting: ['#E74C3C', '#C0392B', '#FF6B6B', '#D35400'],
  poison: ['#9B59B6', '#8E44AD', '#BB8FCE', '#D2B4DE'],
  ground: ['#D4A574', '#A0522D', '#DEB887', '#CD853F'],
  flying: ['#81ECEC', '#74B9FF', '#A8E6CF', '#87CEEB'],
  psychic: ['#FF6B9D', '#EC4899', '#F472B6', '#DB2777'],
  bug: ['#A4C639', '#7CB342', '#8BC34A', '#9CCC65'],
  rock: ['#A08060', '#8B7355', '#D2B48C', '#BC8F8F'],
  ghost: ['#7C3AED', '#8B5CF6', '#A78BFA', '#6D28D9'],
  dragon: ['#7C3AED', '#6366F1', '#4F46E5', '#818CF8'],
  dark: ['#4A4A4A', '#333333', '#5C5C5C', '#1A1A2E'],
  steel: ['#95A5A6', '#7F8C8D', '#BDC3C7', '#AAB7B8'],
  fairy: ['#FFB7DF', '#FF9ECD', '#FFD6EC', '#FDBFEA'],
  normal: ['#A8A878', '#BCBCAC', '#C6C6A7', '#D4D4BE'],
  default: ['#FF4444', '#FF6666', '#FF8888', '#FFAAAA']
};

export function ParticleEffect({ type, position, color, onComplete }: ParticleEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const colors = color ? [color] : TYPE_COLORS.default;

    const particleCount = getParticleCount(type);
    const particleType = getParticleType(type);

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;

      newParticles.push({
        id: Date.now() + i,
        x: position.x,
        y: position.y,
        vx: Math.cos(angle) * speed * (type === 'weather-rain' ? 0.1 : 1),
        vy: Math.sin(angle) * speed + (type === 'weather-rain' ? 5 : 0),
        size: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        life: 60 + Math.random() * 30,
        maxLife: 60 + Math.random() * 30,
        type: particleType
      });
    }

    return newParticles;
  }, [type, position, color]);

  useEffect(() => {
    if (!type) return;

    setIsActive(true);
    setParticles(createParticles());

    const animationFrame = { current: 0 };
    const animate = () => {
      setParticles(prev => {
        const updated = prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + (type?.includes('weather') ? 0.1 : 0.15), // gravity
            life: p.life - 1,
            opacity: p.life / p.maxLife,
            size: p.size * (type === 'faint' ? 0.98 : 0.99)
          }))
          .filter(p => p.life > 0);

        if (updated.length === 0) {
          setIsActive(false);
          onComplete?.();
        }

        return updated;
      });

      if (isActive) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame.current);
    };
  }, [type, createParticles, onComplete, isActive]);

  if (!isActive || particles.length === 0) return null;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000
      }}
    >
      {particles.map(p => (
        <ParticleShape key={p.id} particle={p} />
      ))}
    </svg>
  );
}

function ParticleShape({ particle }: { particle: Particle }) {
  const { x, y, size, color, opacity, type } = particle;

  switch (type) {
    case 'star':
      return (
        <polygon
          points={getStarPoints(x, y, size)}
          fill={color}
          opacity={opacity}
          style={{ filter: `drop-shadow(0 0 ${size / 2}px ${color})` }}
        />
      );
    case 'diamond':
      return (
        <polygon
          points={`${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}`}
          fill={color}
          opacity={opacity}
          style={{ filter: `drop-shadow(0 0 ${size / 2}px ${color})` }}
        />
      );
    case 'spark':
      return (
        <line
          x1={x - size}
          y1={y}
          x2={x + size}
          y2={y}
          stroke={color}
          strokeWidth={2}
          opacity={opacity}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      );
    case 'drop':
      return (
        <ellipse
          cx={x}
          cy={y}
          rx={size / 3}
          ry={size}
          fill={color}
          opacity={opacity}
        />
      );
    case 'rock':
      return (
        <polygon
          points={`${x},${y - size} ${x + size * 0.7},${y - size * 0.3} ${x + size * 0.5},${y + size * 0.5} ${x - size * 0.5},${y + size * 0.3} ${x - size * 0.7},${y - size * 0.4}`}
          fill={color}
          opacity={opacity}
        />
      );
    case 'leaf':
      return (
        <ellipse
          cx={x}
          cy={y}
          rx={size}
          ry={size / 2}
          fill={color}
          opacity={opacity}
          transform={`rotate(${(x + y) % 360}, ${x}, ${y})`}
        />
      );
    default:
      return (
        <circle
          cx={x}
          cy={y}
          r={size}
          fill={color}
          opacity={opacity}
          style={{ filter: `drop-shadow(0 0 ${size / 2}px ${color})` }}
        />
      );
  }
}

function getStarPoints(cx: number, cy: number, size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? size : size / 2;
    points.push(`${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`);
  }
  return points.join(' ');
}

function getParticleCount(type: ParticleEffectProps['type']): number {
  switch (type) {
    case 'critical':
    case 'mega':
    case 'dynamax':
      return 40;
    case 'super-effective':
    case 'tera':
      return 30;
    case 'attack':
    case 'heal':
      return 20;
    case 'faint':
      return 50;
    case 'weather-sun':
    case 'weather-rain':
    case 'weather-sand':
    case 'weather-hail':
      return 25;
    case 'status':
      return 15;
    default:
      return 20;
  }
}

function getParticleType(type: ParticleEffectProps['type']): Particle['type'] {
  switch (type) {
    case 'critical':
    case 'mega':
    case 'tera':
      return 'star';
    case 'dynamax':
      return 'diamond';
    case 'weather-rain':
      return 'drop';
    case 'weather-sand':
    case 'weather-hail':
      return 'rock';
    case 'heal':
      return 'spark';
    default:
      return 'circle';
  }
}

// Damage number popup component
interface DamagePopupProps {
  damage: number;
  position: { x: number; y: number };
  isCritical?: boolean;
  isHeal?: boolean;
  onComplete?: () => void;
}

export function DamagePopup({ damage, position, isCritical, isHeal, onComplete }: DamagePopupProps) {
  const [visible, setVisible] = useState(true);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const animationDuration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / animationDuration;

      if (progress >= 1) {
        setVisible(false);
        onComplete?.();
        return;
      }

      // Bounce effect
      const bounce = Math.sin(progress * Math.PI) * 50;
      setOffset(-bounce);

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y + offset,
        transform: 'translate(-50%, -50%)',
        fontSize: isCritical ? '3rem' : '2.5rem',
        fontWeight: 900,
        color: isHeal ? '#22C55E' : isCritical ? '#FFD700' : '#FF4444',
        textShadow: `
          3px 3px 0 ${isHeal ? '#166534' : isCritical ? '#FF4500' : '#000'},
          -2px -2px 0 #000,
          2px -2px 0 #000,
          -2px 2px 0 #000
        `,
        zIndex: 1001,
        pointerEvents: 'none',
        animation: 'damage-pop 1.5s ease-out forwards'
      }}
    >
      {isHeal ? '+' : '-'}{damage}
      {isCritical && (
        <div style={{
          fontSize: '1rem',
          color: '#FFD700',
          textShadow: '2px 2px 0 #000'
        }}>
          CRITICAL!
        </div>
      )}
    </div>
  );
}

// Effectiveness text popup
interface EffectivenessPopupProps {
  effectiveness: number;
  position: { x: number; y: number };
  onComplete?: () => void;
}

export function EffectivenessPopup({ effectiveness, position, onComplete }: EffectivenessPopupProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  let text = '';
  let color = '';

  if (effectiveness === 0) {
    text = "It doesn't affect...";
    color = '#666666';
  } else if (effectiveness >= 2) {
    text = "It's super effective!";
    color = '#FF4444';
  } else if (effectiveness < 1) {
    text = "It's not very effective...";
    color = '#888888';
  } else {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
        fontSize: '1.5rem',
        fontWeight: 800,
        color,
        textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        zIndex: 1001,
        pointerEvents: 'none',
        animation: 'text-popup 2s ease-out forwards'
      }}
    >
      {text}
    </div>
  );
}

// Weather overlay component
interface WeatherOverlayProps {
  weather: 'sun' | 'rain' | 'sandstorm' | 'hail' | 'snow' | null;
}

export function WeatherOverlay({ weather }: WeatherOverlayProps) {
  if (!weather) return null;

  const getWeatherStyle = () => {
    switch (weather) {
      case 'sun':
        return {
          background: 'linear-gradient(180deg, rgba(255, 200, 100, 0.3) 0%, rgba(255, 150, 50, 0.1) 100%)',
          boxShadow: 'inset 0 0 100px rgba(255, 200, 100, 0.3)'
        };
      case 'rain':
        return {
          background: 'linear-gradient(180deg, rgba(100, 149, 237, 0.3) 0%, rgba(70, 130, 180, 0.1) 100%)',
          boxShadow: 'inset 0 0 100px rgba(100, 149, 237, 0.2)'
        };
      case 'sandstorm':
        return {
          background: 'linear-gradient(180deg, rgba(210, 180, 140, 0.4) 0%, rgba(194, 178, 128, 0.2) 100%)',
          boxShadow: 'inset 0 0 100px rgba(210, 180, 140, 0.3)'
        };
      case 'hail':
      case 'snow':
        return {
          background: 'linear-gradient(180deg, rgba(200, 230, 255, 0.3) 0%, rgba(150, 200, 255, 0.1) 100%)',
          boxShadow: 'inset 0 0 100px rgba(200, 230, 255, 0.2)'
        };
      default:
        return {};
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        ...getWeatherStyle(),
        pointerEvents: 'none',
        zIndex: 1,
        transition: 'all 1s ease'
      }}
    />
  );
}

// Screen flash effect
interface ScreenFlashProps {
  color: string;
  duration?: number;
  onComplete?: () => void;
}

export function ScreenFlash({ color, duration = 200, onComplete }: ScreenFlashProps) {
  const [opacity, setOpacity] = useState(0.5);

  useEffect(() => {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        onComplete?.();
        return;
      }

      setOpacity(0.5 * (1 - progress));
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [duration, onComplete]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: color,
        opacity,
        pointerEvents: 'none',
        zIndex: 1002
      }}
    />
  );
}

// Export type colors for external use
export { TYPE_COLORS };
