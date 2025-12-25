import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus } from 'lucide-react';
import { Pokemon, PokemonType } from '../types/pokemon';
import { useThemeStore } from '../store/themeStore';
import { typeColors } from '../styles/themes';

interface PokemonCardProps {
  pokemon: Pokemon;
  onAdd?: () => void;
}

export default function PokemonCard({ pokemon, onAdd }: PokemonCardProps) {
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  return (
    <Card
      className="h-100 card-hover"
      style={{
        background: theme.colors.bgCard,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '16px',
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

        <div className="d-flex gap-2 mt-3">
          <Button
            variant="outline"
            className="flex-fill"
            onClick={() => navigate(`/pokemon/${pokemon.id}`)}
            style={{
              border: `2px solid ${theme.colors.primary}`,
              color: theme.colors.primary,
              fontWeight: 600,
              borderRadius: '10px',
            }}
          >
            <Eye size={16} className="me-1" />
            Details
          </Button>
          {onAdd && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              className="flex-fill"
              style={{
                background: theme.gradients.primary,
                border: 'none',
                fontWeight: 600,
                borderRadius: '10px',
              }}
            >
              <Plus size={16} className="me-1" />
              Add
            </Button>
          )}
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
