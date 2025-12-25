import { Card } from 'react-bootstrap';
import { Shield, Zap, Info } from 'lucide-react';
import { Pokemon } from '../types/pokemon';
import { useThemeStore } from '../store/themeStore';
import { typeColors } from '../styles/themes';

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick?: () => void;
  compact?: boolean;
}

export default function PokemonCard({ pokemon, onClick, compact = false }: PokemonCardProps) {
  const { theme } = useThemeStore();

  // Get primary weakness for quick preview
  const primaryWeakness = pokemon.typeEffectiveness.doubleWeakTo[0] ||
    pokemon.typeEffectiveness.weakTo[0];

  // Calculate if Pokemon is strong (high BST)
  const isStrong = pokemon.stats.total >= 500;

  return (
    <Card
      onClick={onClick}
      className="h-100 card-hover"
      style={{
        background: theme.colors.bgCard,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Strong Pokemon Badge */}
      {isStrong && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: theme.gradients.primary,
            color: 'white',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '0.65rem',
            fontWeight: 700,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Zap size={10} />
          STRONG
        </div>
      )}

      {/* Image Container */}
      <div
        style={{
          background: theme.gradients.secondary,
          padding: compact ? '12px' : '20px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Generation Badge */}
        <span
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            background: 'rgba(0,0,0,0.3)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '0.7rem',
            fontWeight: 600,
          }}
        >
          Gen {pokemon.generation}
        </span>

        <img
          src={pokemon.artwork || pokemon.sprite}
          alt={pokemon.name}
          style={{
            width: compact ? '80px' : '120px',
            height: compact ? '80px' : '120px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
            transition: 'transform 0.3s ease',
          }}
        />
      </div>

      <Card.Body style={{ padding: compact ? '12px' : '16px' }}>
        {/* ID and Name */}
        <div className="mb-2">
          <span
            style={{
              color: theme.colors.textMuted,
              fontSize: '0.8rem',
              fontWeight: 600,
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
              fontSize: compact ? '1rem' : '1.1rem',
            }}
          >
            {pokemon.name.replace(/-/g, ' ')}
          </h5>
        </div>

        {/* Type Badges */}
        <div className="d-flex gap-2 mb-3">
          {pokemon.types.map((type) => (
            <span
              key={type}
              style={{
                background: typeColors[type],
                color: '#FFFFFF',
                padding: '5px 12px',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
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
                />
              </div>
              <div className="col-6">
                <StatMini
                  label="ATK"
                  value={pokemon.stats.attack}
                  color="#F97316"
                  theme={theme}
                />
              </div>
              <div className="col-6">
                <StatMini
                  label="DEF"
                  value={pokemon.stats.defense}
                  color="#EAB308"
                  theme={theme}
                />
              </div>
              <div className="col-6">
                <StatMini
                  label="SPD"
                  value={pokemon.stats.speed}
                  color="#EC4899"
                  theme={theme}
                />
              </div>
            </div>

            {/* Quick Info Footer */}
            <div
              className="d-flex justify-content-between align-items-center pt-2"
              style={{
                borderTop: `1px solid ${theme.colors.border}`,
              }}
            >
              {/* BST */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: theme.colors.textSecondary,
                  fontSize: '0.8rem',
                }}
              >
                <Zap size={14} />
                <span>{pokemon.stats.total} BST</span>
              </div>

              {/* Primary Weakness Preview */}
              {primaryWeakness && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Shield size={14} style={{ color: theme.colors.error }} />
                  <span
                    style={{
                      background: typeColors[primaryWeakness],
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '8px',
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
              className="text-center mt-2"
              style={{
                color: theme.colors.textMuted,
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <Info size={12} />
              Click for details
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
            BST: <strong>{pokemon.stats.total}</strong>
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
}

function StatMini({ label, value, color, theme }: StatMiniProps) {
  const percentage = Math.min((value / 255) * 100, 100);

  return (
    <div>
      <div
        className="d-flex justify-content-between mb-1"
        style={{ fontSize: '0.7rem' }}
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
          borderRadius: '4px',
          height: '6px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: color,
            width: `${percentage}%`,
            height: '100%',
            borderRadius: '4px',
            transition: 'width 0.5s ease',
          }}
        />
      </div>
    </div>
  );
}
