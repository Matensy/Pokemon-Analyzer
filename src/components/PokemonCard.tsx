import { Card } from 'react-bootstrap';
import { Pokemon } from '../types/pokemon';
import { useThemeStore } from '../store/themeStore';
import { typeColors } from '../styles/themes';

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick?: () => void;
}

export default function PokemonCard({ pokemon, onClick }: PokemonCardProps) {
  const { theme } = useThemeStore();

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
      }}
    >
      <div
        style={{
          background: theme.gradients.secondary,
          padding: '16px',
          textAlign: 'center',
        }}
      >
        <img
          src={pokemon.artwork || pokemon.sprite}
          alt={pokemon.name}
          style={{
            width: '120px',
            height: '120px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
          }}
        />
      </div>

      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span
            style={{
              color: theme.colors.textSecondary,
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            #{pokemon.id.toString().padStart(4, '0')}
          </span>
          <span
            style={{
              background: theme.colors.bgHover,
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              color: theme.colors.textSecondary,
              fontWeight: 600,
            }}
          >
            Gen {pokemon.generation}
          </span>
        </div>

        <h5
          style={{
            color: theme.colors.textPrimary,
            fontWeight: 700,
            textTransform: 'capitalize',
            marginBottom: '12px',
          }}
        >
          {pokemon.name}
        </h5>

        <div className="d-flex gap-2 mb-3">
          {pokemon.types.map((type) => (
            <span
              key={type}
              style={{
                background: typeColors[type],
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              }}
            >
              {type}
            </span>
          ))}
        </div>

        <div className="row g-2">
          <div className="col-6">
            <StatBar
              label="HP"
              value={pokemon.stats.hp}
              color={theme.colors.error}
            />
          </div>
          <div className="col-6">
            <StatBar
              label="ATK"
              value={pokemon.stats.attack}
              color={theme.colors.accent1}
            />
          </div>
          <div className="col-6">
            <StatBar
              label="DEF"
              value={pokemon.stats.defense}
              color={theme.colors.accent4}
            />
          </div>
          <div className="col-6">
            <StatBar
              label="SPD"
              value={pokemon.stats.speed}
              color={theme.colors.accent3}
            />
          </div>
        </div>

        <div
          className="mt-3 text-center"
          style={{
            color: theme.colors.textSecondary,
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Total: {pokemon.stats.total}
        </div>
      </Card.Body>
    </Card>
  );
}

interface StatBarProps {
  label: string;
  value: number;
  color: string;
}

function StatBar({ label, value, color }: StatBarProps) {
  const { theme } = useThemeStore();
  const percentage = Math.min((value / 255) * 100, 100);

  return (
    <div style={{ marginBottom: '8px' }}>
      <div
        className="d-flex justify-content-between align-items-center"
        style={{ fontSize: '0.75rem', marginBottom: '4px' }}
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
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}
