import { useState } from 'react';
import { Card } from 'react-bootstrap';
import { Shield, Zap, Info, Sparkles } from 'lucide-react';
import { Pokemon } from '../types/pokemon';
import { useThemeStore } from '../store/themeStore';
import { typeColors } from '../styles/themes';
import { getAnimatedSprite } from '../utils/sprites';

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick?: () => void;
  compact?: boolean;
  showAnimated?: boolean;
}

export default function PokemonCard({ pokemon, onClick, compact = false, showAnimated = false }: PokemonCardProps) {
  const { theme } = useThemeStore();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isShiny, setIsShiny] = useState(false);

  // Get primary weakness for quick preview
  const primaryWeakness = pokemon.typeEffectiveness.doubleWeakTo[0] ||
    pokemon.typeEffectiveness.weakTo[0];

  // Calculate if Pokemon is strong (high BST)
  const isStrong = pokemon.stats.total >= 500;
  const isLegendary = pokemon.stats.total >= 570;

  // Get the appropriate sprite
  const getDisplaySprite = () => {
    if (showAnimated && !imageError) {
      return getAnimatedSprite(pokemon.name, { shiny: isShiny });
    }
    return isShiny
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemon.id}.png`
      : (pokemon.artwork || pokemon.sprite);
  };

  // Handle sprite load error - fallback to static
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="h-100 pokemon-card-hover card-shine"
      style={{
        background: theme.colors.bgCard,
        border: `2px solid ${isHovered ? theme.colors.primary : theme.colors.border}`,
        borderRadius: '20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        overflow: 'hidden',
        position: 'relative',
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered
          ? `0 20px 40px rgba(124, 58, 237, 0.25), 0 0 0 2px ${theme.colors.primary}`
          : '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Legendary Glow Effect */}
      {isLegendary && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 50% 30%, ${typeColors[pokemon.types[0]]}20 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* Strong Pokemon Badge */}
      {isStrong && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: isLegendary
              ? 'linear-gradient(135deg, #FFD700, #FFA500)'
              : theme.gradients.primary,
            color: isLegendary ? '#000' : 'white',
            padding: '5px 10px',
            borderRadius: '10px',
            fontSize: '0.65rem',
            fontWeight: 700,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: isLegendary
              ? '0 0 15px rgba(255, 215, 0, 0.5)'
              : '0 2px 8px rgba(124, 58, 237, 0.3)',
            animation: isLegendary ? 'crystal-shimmer 2s ease-in-out infinite' : 'none',
          }}
        >
          {isLegendary ? <Sparkles size={10} /> : <Zap size={10} />}
          {isLegendary ? 'LEGEND' : 'STRONG'}
        </div>
      )}

      {/* Shiny Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsShiny(!isShiny);
          setImageError(false);
        }}
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: isShiny
            ? 'linear-gradient(135deg, #FFD700, #FFA500)'
            : 'rgba(0,0,0,0.3)',
          color: isShiny ? '#000' : 'white',
          padding: '5px 8px',
          borderRadius: '8px',
          fontSize: '0.65rem',
          fontWeight: 600,
          zIndex: 3,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          transition: 'all 0.3s ease',
        }}
      >
        <Sparkles size={10} />
        {isShiny ? 'SHINY' : '✦'}
      </button>

      {/* Image Container */}
      <div
        style={{
          background: `linear-gradient(180deg, ${typeColors[pokemon.types[0]]}30 0%, ${theme.colors.bgCard} 100%)`,
          padding: compact ? '16px' : '24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated Background Particles */}
        {isHovered && (
          <>
            <div className="particle" style={{ position: 'absolute', top: '20%', left: '20%', width: '6px', height: '6px', background: typeColors[pokemon.types[0]], borderRadius: '50%', animation: 'particle-rise 2s ease-out infinite' }} />
            <div className="particle" style={{ position: 'absolute', top: '40%', left: '70%', width: '4px', height: '4px', background: typeColors[pokemon.types[0]], borderRadius: '50%', animation: 'particle-rise 2.5s ease-out infinite 0.3s' }} />
            <div className="particle" style={{ position: 'absolute', top: '60%', left: '30%', width: '5px', height: '5px', background: typeColors[pokemon.types[0]], borderRadius: '50%', animation: 'particle-rise 2.2s ease-out infinite 0.6s' }} />
          </>
        )}

        {/* Generation Badge */}
        <span
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            background: 'rgba(0,0,0,0.4)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '10px',
            fontSize: '0.7rem',
            fontWeight: 600,
            backdropFilter: 'blur(4px)',
          }}
        >
          Gen {pokemon.generation}
        </span>

        {/* Pokemon Sprite */}
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
          }}
        >
          <img
            src={getDisplaySprite()}
            alt={pokemon.name}
            onError={handleImageError}
            className={isHovered ? 'animate-float-subtle' : ''}
            style={{
              width: compact ? '90px' : '130px',
              height: compact ? '90px' : '130px',
              objectFit: 'contain',
              filter: isShiny
                ? 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.5))'
                : 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.25))',
              transition: 'all 0.4s ease',
              imageRendering: showAnimated ? 'pixelated' : 'auto',
            }}
          />
          {/* Shadow */}
          <div
            className="pokemon-shadow"
            style={{
              width: compact ? '70px' : '100px',
              opacity: isHovered ? 0.5 : 0.3,
              transition: 'opacity 0.3s ease',
            }}
          />
        </div>
      </div>

      <Card.Body style={{ padding: compact ? '14px' : '18px', position: 'relative', zIndex: 1 }}>
        {/* ID and Name */}
        <div className="mb-2">
          <span
            style={{
              color: theme.colors.textMuted,
              fontSize: '0.8rem',
              fontWeight: 600,
              fontFamily: 'monospace',
            }}
          >
            #{pokemon.id.toString().padStart(4, '0')}
          </span>
          <h5
            style={{
              color: theme.colors.textPrimary,
              fontWeight: 700,
              textTransform: 'capitalize',
              margin: '4px 0 0 0',
              fontSize: compact ? '1rem' : '1.15rem',
              letterSpacing: '-0.5px',
            }}
          >
            {pokemon.name.replace(/-/g, ' ')}
          </h5>
        </div>

        {/* Type Badges */}
        <div className="d-flex gap-2 mb-3 flex-wrap">
          {pokemon.types.map((type) => (
            <span
              key={type}
              style={{
                background: `linear-gradient(135deg, ${typeColors[type]}, ${typeColors[type]}CC)`,
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                boxShadow: `0 3px 8px ${typeColors[type]}40`,
                letterSpacing: '0.5px',
              }}
            >
              {type}
            </span>
          ))}
        </div>

        {/* Stats Preview */}
        {!compact && (
          <>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <StatMini
                  label="HP"
                  value={pokemon.stats.hp}
                  color="#EF4444"
                  theme={theme}
                  animate={isHovered}
                />
              </div>
              <div className="col-6">
                <StatMini
                  label="ATK"
                  value={pokemon.stats.attack}
                  color="#F97316"
                  theme={theme}
                  animate={isHovered}
                />
              </div>
              <div className="col-6">
                <StatMini
                  label="DEF"
                  value={pokemon.stats.defense}
                  color="#EAB308"
                  theme={theme}
                  animate={isHovered}
                />
              </div>
              <div className="col-6">
                <StatMini
                  label="SPD"
                  value={pokemon.stats.speed}
                  color="#EC4899"
                  theme={theme}
                  animate={isHovered}
                />
              </div>
            </div>

            {/* Quick Info Footer */}
            <div
              className="d-flex justify-content-between align-items-center pt-3"
              style={{
                borderTop: `1px solid ${theme.colors.border}`,
              }}
            >
              {/* BST */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: theme.colors.textSecondary,
                  fontSize: '0.8rem',
                }}
              >
                <Zap size={14} style={{ color: theme.colors.primary }} />
                <span><strong style={{ color: theme.colors.textPrimary }}>{pokemon.stats.total}</strong> BST</span>
              </div>

              {/* Primary Weakness Preview */}
              {primaryWeakness && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Shield size={14} style={{ color: '#EF4444' }} />
                  <span
                    style={{
                      background: `linear-gradient(135deg, ${typeColors[primaryWeakness]}, ${typeColors[primaryWeakness]}CC)`,
                      color: 'white',
                      padding: '3px 10px',
                      borderRadius: '10px',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    {primaryWeakness}
                  </span>
                </div>
              )}
            </div>

            {/* Click for more info hint */}
            <div
              className="text-center mt-3"
              style={{
                color: isHovered ? theme.colors.primary : theme.colors.textMuted,
                fontSize: '0.72rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'color 0.3s ease',
                fontWeight: isHovered ? 600 : 400,
              }}
            >
              <Info size={13} />
              {isHovered ? 'Click to view details' : 'Click for details'}
            </div>
          </>
        )}

        {/* Compact Mode Stats */}
        {compact && (
          <div
            className="text-center"
            style={{
              color: theme.colors.textSecondary,
              fontSize: '0.85rem',
            }}
          >
            BST: <strong style={{ color: theme.colors.textPrimary }}>{pokemon.stats.total}</strong>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

interface StatMiniProps {
  label: string;
  value: number;
  color: string;
  theme: any;
  animate?: boolean;
}

function StatMini({ label, value, color, theme, animate = false }: StatMiniProps) {
  const percentage = Math.min((value / 255) * 100, 100);

  return (
    <div>
      <div
        className="d-flex justify-content-between mb-1"
        style={{ fontSize: '0.72rem' }}
      >
        <span style={{ color: theme.colors.textSecondary, fontWeight: 600 }}>
          {label}
        </span>
        <span style={{ color: theme.colors.textPrimary, fontWeight: 700 }}>
          {value}
        </span>
      </div>
      <div
        style={{
          background: theme.colors.bgHover,
          borderRadius: '6px',
          height: '7px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}CC)`,
            width: animate ? `${percentage}%` : `${percentage}%`,
            height: '100%',
            borderRadius: '6px',
            transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: animate ? `0 0 8px ${color}60` : 'none',
          }}
        />
      </div>
    </div>
  );
}
