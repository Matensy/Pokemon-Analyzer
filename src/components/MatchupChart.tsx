// Visual Type Matchup Chart Component
import { useState } from 'react';
import { Card, Row, Col, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { PokemonType } from '../types/pokemon';
import { useThemeStore } from '../store/themeStore';
import { typeColors } from '../styles/themes';

interface MatchupChartProps {
  pokemonTypes?: PokemonType[];
  showFullChart?: boolean;
  compact?: boolean;
}

// Complete type chart data
const TYPE_CHART: Record<PokemonType, Record<PokemonType, number>> = {
  normal: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
  fire: { normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 0.5, dark: 1, steel: 2, fairy: 1 },
  water: { normal: 1, fire: 2, water: 0.5, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 2, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 0.5, dark: 1, steel: 1, fairy: 1 },
  electric: { normal: 1, fire: 1, water: 2, electric: 0.5, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 0, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 0.5, dark: 1, steel: 1, fairy: 1 },
  grass: { normal: 1, fire: 0.5, water: 2, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 0.5, ground: 2, flying: 0.5, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 0.5, dark: 1, steel: 0.5, fairy: 1 },
  ice: { normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 0.5, fighting: 1, poison: 1, ground: 2, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 1, steel: 0.5, fairy: 1 },
  fighting: { normal: 2, fire: 1, water: 1, electric: 1, grass: 1, ice: 2, fighting: 1, poison: 0.5, ground: 1, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dragon: 1, dark: 2, steel: 2, fairy: 0.5 },
  poison: { normal: 1, fire: 1, water: 1, electric: 1, grass: 2, ice: 1, fighting: 1, poison: 0.5, ground: 0.5, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0.5, dragon: 1, dark: 1, steel: 0, fairy: 2 },
  ground: { normal: 1, fire: 2, water: 1, electric: 2, grass: 0.5, ice: 1, fighting: 1, poison: 2, ground: 1, flying: 0, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 1, dark: 1, steel: 2, fairy: 1 },
  flying: { normal: 1, fire: 1, water: 1, electric: 0.5, grass: 2, ice: 1, fighting: 2, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
  psychic: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 2, ground: 1, flying: 1, psychic: 0.5, bug: 1, rock: 1, ghost: 1, dragon: 1, dark: 0, steel: 0.5, fairy: 1 },
  bug: { normal: 1, fire: 0.5, water: 1, electric: 1, grass: 2, ice: 1, fighting: 0.5, poison: 0.5, ground: 1, flying: 0.5, psychic: 2, bug: 1, rock: 1, ghost: 0.5, dragon: 1, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { normal: 1, fire: 2, water: 1, electric: 1, grass: 1, ice: 2, fighting: 0.5, poison: 1, ground: 0.5, flying: 2, psychic: 1, bug: 2, rock: 1, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
  ghost: { normal: 0, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, dark: 0.5, steel: 1, fairy: 1 },
  dragon: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 1, steel: 0.5, fairy: 0 },
  dark: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 0.5, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, dark: 0.5, steel: 1, fairy: 0.5 },
  steel: { normal: 1, fire: 0.5, water: 0.5, electric: 0.5, grass: 1, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 2 },
  fairy: { normal: 1, fire: 0.5, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 0.5, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 2, steel: 0.5, fairy: 1 }
};

const ALL_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic',
  'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

export default function MatchupChart({ pokemonTypes, showFullChart = false, compact = false }: MatchupChartProps) {
  const { theme } = useThemeStore();
  const [selectedType, setSelectedType] = useState<PokemonType | null>(null);

  // Calculate combined effectiveness for dual types
  const getDefensiveEffectiveness = (attackType: PokemonType, defenderTypes: PokemonType[]): number => {
    return defenderTypes.reduce((mult, defType) => mult * TYPE_CHART[attackType][defType], 1);
  };

  const getEffectivenessColor = (mult: number): string => {
    if (mult === 0) return '#374151';
    if (mult === 0.25) return '#1E3A5F';
    if (mult === 0.5) return '#1E40AF';
    if (mult === 1) return '#6B7280';
    if (mult === 2) return '#DC2626';
    if (mult === 4) return '#7F1D1D';
    return '#6B7280';
  };

  const getEffectivenessText = (mult: number): string => {
    if (mult === 0) return '0';
    if (mult === 0.25) return '¼';
    if (mult === 0.5) return '½';
    if (mult === 1) return '-';
    if (mult === 2) return '2×';
    if (mult === 4) return '4×';
    return String(mult);
  };

  // If specific Pokemon types are provided, show their matchup
  if (pokemonTypes && pokemonTypes.length > 0) {
    const weaknesses: { type: PokemonType; mult: number }[] = [];
    const resistances: { type: PokemonType; mult: number }[] = [];
    const immunities: { type: PokemonType; mult: number }[] = [];

    ALL_TYPES.forEach(attackType => {
      const mult = getDefensiveEffectiveness(attackType, pokemonTypes);
      if (mult === 0) {
        immunities.push({ type: attackType, mult });
      } else if (mult < 1) {
        resistances.push({ type: attackType, mult });
      } else if (mult > 1) {
        weaknesses.push({ type: attackType, mult });
      }
    });

    // Sort by effectiveness
    weaknesses.sort((a, b) => b.mult - a.mult);
    resistances.sort((a, b) => a.mult - b.mult);

    if (compact) {
      return (
        <div className="d-flex flex-wrap gap-1">
          {weaknesses.map(({ type, mult }) => (
            <OverlayTrigger
              key={type}
              overlay={<Tooltip>{type} ({mult}×)</Tooltip>}
            >
              <Badge style={{ background: typeColors[type], opacity: mult === 4 ? 1 : 0.8 }}>
                {mult === 4 ? '4×' : '2×'}
              </Badge>
            </OverlayTrigger>
          ))}
        </div>
      );
    }

    return (
      <Card style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}` }}>
        <Card.Body>
          {/* Weaknesses */}
          {weaknesses.length > 0 && (
            <div className="mb-3">
              <h6 style={{ color: '#EF4444', fontWeight: 700 }}>Weaknesses ({weaknesses.length})</h6>
              <div className="d-flex flex-wrap gap-2">
                {weaknesses.map(({ type, mult }) => (
                  <div
                    key={type}
                    style={{
                      background: typeColors[type],
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span style={{ textTransform: 'capitalize' }}>{type}</span>
                    <Badge bg="danger" pill>{mult}×</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resistances */}
          {resistances.length > 0 && (
            <div className="mb-3">
              <h6 style={{ color: '#3B82F6', fontWeight: 700 }}>Resistances ({resistances.length})</h6>
              <div className="d-flex flex-wrap gap-2">
                {resistances.map(({ type, mult }) => (
                  <div
                    key={type}
                    style={{
                      background: typeColors[type],
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span style={{ textTransform: 'capitalize' }}>{type}</span>
                    <Badge bg="primary" pill>{mult === 0.5 ? '½' : '¼'}×</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Immunities */}
          {immunities.length > 0 && (
            <div>
              <h6 style={{ color: '#22C55E', fontWeight: 700 }}>Immunities ({immunities.length})</h6>
              <div className="d-flex flex-wrap gap-2">
                {immunities.map(({ type }) => (
                  <div
                    key={type}
                    style={{
                      background: typeColors[type],
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span style={{ textTransform: 'capitalize' }}>{type}</span>
                    <Badge bg="success" pill>0×</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  }

  // Full type chart grid
  if (showFullChart) {
    return (
      <Card style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}`, overflow: 'auto' }}>
        <Card.Body className="p-2">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '800px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '4px', background: theme.colors.bgPrimary, position: 'sticky', left: 0, zIndex: 2 }}>
                    <div style={{ color: theme.colors.textSecondary, fontSize: '0.7rem' }}>ATK↓ DEF→</div>
                  </th>
                  {ALL_TYPES.map(defType => (
                    <th key={defType} style={{ padding: '2px', textAlign: 'center' }}>
                      <div
                        style={{
                          background: typeColors[defType],
                          color: 'white',
                          padding: '4px',
                          borderRadius: '4px',
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          writingMode: 'vertical-rl',
                          textOrientation: 'mixed',
                          height: '60px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {defType.slice(0, 3)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_TYPES.map(atkType => (
                  <tr key={atkType}>
                    <td style={{ padding: '2px', background: theme.colors.bgPrimary, position: 'sticky', left: 0, zIndex: 1 }}>
                      <div
                        style={{
                          background: typeColors[atkType],
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}
                      >
                        {atkType.slice(0, 3)}
                      </div>
                    </td>
                    {ALL_TYPES.map(defType => {
                      const mult = TYPE_CHART[atkType][defType];
                      return (
                        <td
                          key={defType}
                          style={{
                            padding: '2px',
                            textAlign: 'center'
                          }}
                        >
                          <div
                            style={{
                              background: getEffectivenessColor(mult),
                              color: mult === 0 ? '#9CA3AF' : 'white',
                              width: '32px',
                              height: '32px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              margin: '0 auto'
                            }}
                          >
                            {getEffectivenessText(mult)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="d-flex gap-3 justify-content-center mt-3 flex-wrap">
            <div className="d-flex align-items-center gap-1">
              <div style={{ width: '20px', height: '20px', background: '#7F1D1D', borderRadius: '4px' }} />
              <span style={{ color: theme.colors.textSecondary, fontSize: '0.75rem' }}>4×</span>
            </div>
            <div className="d-flex align-items-center gap-1">
              <div style={{ width: '20px', height: '20px', background: '#DC2626', borderRadius: '4px' }} />
              <span style={{ color: theme.colors.textSecondary, fontSize: '0.75rem' }}>2×</span>
            </div>
            <div className="d-flex align-items-center gap-1">
              <div style={{ width: '20px', height: '20px', background: '#6B7280', borderRadius: '4px' }} />
              <span style={{ color: theme.colors.textSecondary, fontSize: '0.75rem' }}>1×</span>
            </div>
            <div className="d-flex align-items-center gap-1">
              <div style={{ width: '20px', height: '20px', background: '#1E40AF', borderRadius: '4px' }} />
              <span style={{ color: theme.colors.textSecondary, fontSize: '0.75rem' }}>½×</span>
            </div>
            <div className="d-flex align-items-center gap-1">
              <div style={{ width: '20px', height: '20px', background: '#1E3A5F', borderRadius: '4px' }} />
              <span style={{ color: theme.colors.textSecondary, fontSize: '0.75rem' }}>¼×</span>
            </div>
            <div className="d-flex align-items-center gap-1">
              <div style={{ width: '20px', height: '20px', background: '#374151', borderRadius: '4px' }} />
              <span style={{ color: theme.colors.textSecondary, fontSize: '0.75rem' }}>0×</span>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return null;
}

// Team Matchup Analysis Component
export function TeamMatchupAnalysis({ team }: { team: { name: string; types: PokemonType[] }[] }) {
  const { theme } = useThemeStore();

  // Calculate team-wide weakness coverage
  const weaknessCounts: Record<PokemonType, number> = {} as Record<PokemonType, number>;
  const resistanceCounts: Record<PokemonType, number> = {} as Record<PokemonType, number>;

  ALL_TYPES.forEach(type => {
    weaknessCounts[type] = 0;
    resistanceCounts[type] = 0;
  });

  team.forEach(pokemon => {
    ALL_TYPES.forEach(attackType => {
      const mult = pokemon.types.reduce((m, t) => m * TYPE_CHART[attackType][t], 1);
      if (mult > 1) weaknessCounts[attackType]++;
      if (mult < 1) resistanceCounts[attackType]++;
    });
  });

  // Find shared weaknesses (types that hit 3+ Pokemon super effectively)
  const sharedWeaknesses = ALL_TYPES.filter(type => weaknessCounts[type] >= 3);
  const goodCoverage = ALL_TYPES.filter(type => resistanceCounts[type] >= 3);

  return (
    <Card style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}` }}>
      <Card.Header style={{ background: theme.colors.primary, color: 'white', fontWeight: 700 }}>
        Team Defensive Analysis
      </Card.Header>
      <Card.Body>
        {sharedWeaknesses.length > 0 && (
          <div className="mb-3">
            <h6 style={{ color: '#EF4444' }}>⚠️ Shared Weaknesses ({sharedWeaknesses.length})</h6>
            <p style={{ color: theme.colors.textSecondary, fontSize: '0.85rem', marginBottom: '8px' }}>
              These types hit 3+ of your Pokemon super effectively
            </p>
            <div className="d-flex flex-wrap gap-2">
              {sharedWeaknesses.map(type => (
                <Badge key={type} style={{ background: typeColors[type], fontSize: '0.85rem', padding: '6px 12px' }}>
                  {type} ({weaknessCounts[type]} weak)
                </Badge>
              ))}
            </div>
          </div>
        )}

        {goodCoverage.length > 0 && (
          <div>
            <h6 style={{ color: '#22C55E' }}>✓ Good Coverage ({goodCoverage.length})</h6>
            <p style={{ color: theme.colors.textSecondary, fontSize: '0.85rem', marginBottom: '8px' }}>
              These types are resisted by 3+ of your Pokemon
            </p>
            <div className="d-flex flex-wrap gap-2">
              {goodCoverage.map(type => (
                <Badge key={type} style={{ background: typeColors[type], fontSize: '0.85rem', padding: '6px 12px' }}>
                  {type} ({resistanceCounts[type]} resist)
                </Badge>
              ))}
            </div>
          </div>
        )}

        {sharedWeaknesses.length === 0 && (
          <div className="text-center py-3">
            <span style={{ color: '#22C55E', fontSize: '1.2rem' }}>✓</span>
            <p style={{ color: theme.colors.textSecondary, margin: 0 }}>
              No major shared weaknesses detected!
            </p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
