import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import {
  Zap, Shield, Swords, Target,
  Sparkles, BookOpen, FlaskConical, Award
} from 'lucide-react';
import { Pokemon, Move, Moveset } from '../types/pokemon';
import { useThemeStore } from '../store/themeStore';
import { typeColors } from '../styles/themes';
import { generateMovesets } from '../services/movesetService';
import '../styles/pokemon-details.css';

interface PokemonDetailModalProps {
  pokemon: Pokemon | null;
  show: boolean;
  onHide: () => void;
  onAddToTeam?: (pokemon: Pokemon) => void;
}

export default function PokemonDetailModal({
  pokemon,
  show,
  onHide,
  onAddToTeam
}: PokemonDetailModalProps) {
  const { theme } = useThemeStore();
  const [showShiny, setShowShiny] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');
  const [movesets, setMovesets] = useState<Moveset[]>([]);

  useEffect(() => {
    if (pokemon) {
      const sets = pokemon.recommendedMovesets.length > 0
        ? pokemon.recommendedMovesets
        : generateMovesets(pokemon);
      setMovesets(sets);
    }
  }, [pokemon]);

  if (!pokemon) return null;

  const statColors: Record<string, string> = {
    hp: '#EF4444',
    attack: '#F97316',
    defense: '#EAB308',
    specialAttack: '#3B82F6',
    specialDefense: '#22C55E',
    speed: '#EC4899'
  };

  const statLabels: Record<string, string> = {
    hp: 'HP',
    attack: 'Attack',
    defense: 'Defense',
    specialAttack: 'Sp. Atk',
    specialDefense: 'Sp. Def',
    speed: 'Speed'
  };

  const getStatPercentage = (value: number) => Math.min((value / 255) * 100, 100);

  const getMovesByCategory = (category: 'physical' | 'special' | 'status') => {
    return pokemon.moves.filter(m => m.category === category);
  };

  const findMoveDetails = (moveName: string): Move | undefined => {
    return pokemon.moves.find(m => m.name === moveName);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="pokemon-detail-modal"
    >
      <Modal.Body style={{
        background: theme.colors.bgPrimary,
        padding: 0,
        color: theme.colors.textPrimary
      }}>
        {/* Header with Pokemon Image */}
        <div
          className="pokemon-detail-header"
          style={{ background: theme.gradients.primary }}
        >
          <span className="pokemon-detail-id" style={{ color: 'white' }}>
            #{pokemon.id.toString().padStart(4, '0')}
          </span>

          <button
            className={`shiny-toggle ${showShiny ? 'active' : ''}`}
            onClick={() => setShowShiny(!showShiny)}
            style={{
              color: showShiny ? 'white' : theme.colors.textPrimary,
              background: showShiny ? undefined : theme.colors.bgCard,
              borderColor: theme.colors.border
            }}
          >
            <Sparkles size={14} className="me-1" />
            Shiny
          </button>

          <img
            src={showShiny ? pokemon.spriteShiny : (pokemon.artwork || pokemon.sprite)}
            alt={pokemon.name}
            className="pokemon-detail-artwork"
          />

          <h2 className="pokemon-detail-name" style={{ color: 'white' }}>
            {pokemon.name}
          </h2>

          <div className="d-flex gap-2 justify-content-center">
            {pokemon.types.map(type => (
              <span
                key={type}
                className="type-badge"
                style={{ background: typeColors[type] }}
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className="detail-tabs"
          style={{ borderColor: theme.colors.border }}
        >
          {[
            { key: 'stats', icon: <Target size={16} />, label: 'Stats' },
            { key: 'weaknesses', icon: <Shield size={16} />, label: 'Weaknesses' },
            { key: 'moves', icon: <Swords size={16} />, label: 'Moves' },
            { key: 'builds', icon: <Award size={16} />, label: 'Builds' },
            { key: 'abilities', icon: <FlaskConical size={16} />, label: 'Abilities' }
          ].map(tab => (
            <button
              key={tab.key}
              className={`detail-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              style={{
                color: activeTab === tab.key ? theme.colors.primary : theme.colors.textSecondary
              }}
            >
              {tab.icon}
              <span className="ms-2">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="stats-section">
              {Object.entries(pokemon.stats).filter(([key]) => key !== 'total').map(([stat, value]) => (
                <div key={stat} className="stat-row">
                  <span className="stat-label" style={{ color: theme.colors.textSecondary }}>
                    {statLabels[stat]}
                  </span>
                  <div
                    className="stat-bar-container"
                    style={{ background: theme.colors.bgHover }}
                  >
                    <div
                      className="stat-bar"
                      style={{
                        width: `${getStatPercentage(value as number)}%`,
                        background: statColors[stat]
                      }}
                    />
                  </div>
                  <span className="stat-value" style={{ color: theme.colors.textPrimary }}>
                    {value}
                  </span>
                </div>
              ))}

              <div
                className="mt-3 p-3 text-center"
                style={{
                  background: theme.colors.bgHover,
                  borderRadius: '12px'
                }}
              >
                <span style={{ color: theme.colors.textSecondary }}>Base Stat Total: </span>
                <strong style={{ color: theme.colors.primary, fontSize: '1.25rem' }}>
                  {pokemon.stats.total}
                </strong>
              </div>

              <div className="row mt-3 g-2">
                <div className="col-6">
                  <div
                    className="p-3 text-center"
                    style={{ background: theme.colors.bgHover, borderRadius: '12px' }}
                  >
                    <div style={{ color: theme.colors.textSecondary, fontSize: '0.8rem' }}>Height</div>
                    <strong>{(pokemon.height / 10).toFixed(1)} m</strong>
                  </div>
                </div>
                <div className="col-6">
                  <div
                    className="p-3 text-center"
                    style={{ background: theme.colors.bgHover, borderRadius: '12px' }}
                  >
                    <div style={{ color: theme.colors.textSecondary, fontSize: '0.8rem' }}>Weight</div>
                    <strong>{(pokemon.weight / 10).toFixed(1)} kg</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Weaknesses Tab */}
          {activeTab === 'weaknesses' && (
            <div className="type-effectiveness-section" style={{ borderColor: theme.colors.border }}>
              {pokemon.typeEffectiveness.doubleWeakTo.length > 0 && (
                <div className="mb-4">
                  <div className="effectiveness-title" style={{ color: '#EF4444' }}>
                    <Shield size={18} />
                    4x Weak To (Critical!)
                  </div>
                  <div className="effectiveness-grid">
                    {pokemon.typeEffectiveness.doubleWeakTo.map(type => (
                      <span
                        key={type}
                        className="type-badge type-badge-small"
                        style={{ background: typeColors[type] }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {pokemon.typeEffectiveness.weakTo.length > 0 && (
                <div className="mb-4">
                  <div className="effectiveness-title" style={{ color: '#F97316' }}>
                    <Shield size={18} />
                    2x Weak To
                  </div>
                  <div className="effectiveness-grid">
                    {pokemon.typeEffectiveness.weakTo.map(type => (
                      <span
                        key={type}
                        className="type-badge type-badge-small"
                        style={{ background: typeColors[type] }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {pokemon.typeEffectiveness.resistantTo.length > 0 && (
                <div className="mb-4">
                  <div className="effectiveness-title" style={{ color: '#22C55E' }}>
                    <Shield size={18} />
                    Resistant To
                  </div>
                  <div className="effectiveness-grid">
                    {pokemon.typeEffectiveness.resistantTo.map(type => (
                      <span
                        key={type}
                        className="type-badge type-badge-small"
                        style={{ background: typeColors[type] }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {pokemon.typeEffectiveness.immune.length > 0 && (
                <div className="mb-4">
                  <div className="effectiveness-title" style={{ color: '#3B82F6' }}>
                    <Shield size={18} />
                    Immune To (0x)
                  </div>
                  <div className="effectiveness-grid">
                    {pokemon.typeEffectiveness.immune.map(type => (
                      <span
                        key={type}
                        className="type-badge type-badge-small"
                        style={{ background: typeColors[type] }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Moves Tab */}
          {activeTab === 'moves' && (
            <div className="moves-section" style={{ borderColor: theme.colors.border }}>
              {['physical', 'special', 'status'].map(category => {
                const categoryMoves = getMovesByCategory(category as any);
                if (categoryMoves.length === 0) return null;

                return (
                  <div key={category} className="mb-4">
                    <h6
                      className="mb-3 text-capitalize d-flex align-items-center gap-2"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {category === 'physical' && <Swords size={18} />}
                      {category === 'special' && <Zap size={18} />}
                      {category === 'status' && <BookOpen size={18} />}
                      {category} Moves ({categoryMoves.length})
                    </h6>
                    <div className="moves-grid">
                      {categoryMoves.slice(0, 12).map(move => (
                        <div
                          key={move.name}
                          className="move-card"
                          style={{
                            background: theme.colors.bgCard,
                            borderColor: theme.colors.border,
                          }}
                        >
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span
                              className="type-badge type-badge-small"
                              style={{ background: typeColors[move.type] }}
                            >
                              {move.type}
                            </span>
                            <span
                              className="move-name"
                              style={{ color: theme.colors.textPrimary }}
                            >
                              {move.name.replace('-', ' ')}
                            </span>
                          </div>
                          <div className="move-stats" style={{ color: theme.colors.textSecondary }}>
                            {move.power && (
                              <span className="move-stat">
                                <Swords size={12} /> {move.power}
                              </span>
                            )}
                            {move.accuracy && (
                              <span className="move-stat">
                                <Target size={12} /> {move.accuracy}%
                              </span>
                            )}
                            <span className="move-stat">PP: {move.pp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {pokemon.moves.length === 0 && (
                <div className="text-center py-4" style={{ color: theme.colors.textSecondary }}>
                  No moves data available. Try refreshing the page.
                </div>
              )}
            </div>
          )}

          {/* Builds Tab */}
          {activeTab === 'builds' && (
            <div className="moveset-section" style={{ borderColor: theme.colors.border }}>
              {movesets.length > 0 ? movesets.map((set, index) => (
                <div
                  key={index}
                  className="moveset-card"
                  style={{
                    background: theme.colors.bgCard,
                    borderColor: theme.colors.border
                  }}
                >
                  <div
                    className="moveset-role"
                    style={{ color: theme.colors.primary }}
                  >
                    <Award size={18} className="me-2" />
                    {set.role}
                  </div>
                  <div
                    className="moveset-description"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {set.description}
                  </div>

                  <div className="moveset-details">
                    <div className="moveset-detail-item">
                      <span
                        className="moveset-detail-label"
                        style={{ color: theme.colors.textMuted }}
                      >
                        Ability
                      </span>
                      <span
                        className="moveset-detail-value text-capitalize"
                        style={{ color: theme.colors.textPrimary }}
                      >
                        {set.ability.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="moveset-detail-item">
                      <span
                        className="moveset-detail-label"
                        style={{ color: theme.colors.textMuted }}
                      >
                        Item
                      </span>
                      <span
                        className="moveset-detail-value"
                        style={{ color: theme.colors.textPrimary }}
                      >
                        {set.item}
                      </span>
                    </div>
                    <div className="moveset-detail-item">
                      <span
                        className="moveset-detail-label"
                        style={{ color: theme.colors.textMuted }}
                      >
                        Nature
                      </span>
                      <span
                        className="moveset-detail-value"
                        style={{ color: theme.colors.textPrimary }}
                      >
                        {set.nature}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span
                      className="moveset-detail-label"
                      style={{ color: theme.colors.textMuted }}
                    >
                      Recommended Moves
                    </span>
                    <div className="moveset-moves-list">
                      {set.moves.map((moveName, i) => {
                        const move = findMoveDetails(moveName);
                        return (
                          <span
                            key={i}
                            className="moveset-move-badge"
                            style={{
                              background: move ? typeColors[move.type] : theme.colors.bgHover,
                              color: move ? 'white' : theme.colors.textPrimary
                            }}
                          >
                            {moveName.replace(/-/g, ' ')}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3">
                    <span
                      className="moveset-detail-label"
                      style={{ color: theme.colors.textMuted }}
                    >
                      EV Spread
                    </span>
                    <div className="ev-spread">
                      {Object.entries(set.evs)
                        .filter(([_, value]) => value > 0)
                        .map(([stat, value]) => (
                          <span
                            key={stat}
                            className="ev-item"
                            style={{
                              background: statColors[stat] || theme.colors.primary,
                              color: 'white'
                            }}
                          >
                            {value} {statLabels[stat] || stat}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-4" style={{ color: theme.colors.textSecondary }}>
                  No recommended builds available for this Pokemon.
                </div>
              )}
            </div>
          )}

          {/* Abilities Tab */}
          {activeTab === 'abilities' && (
            <div className="abilities-section" style={{ borderColor: theme.colors.border }}>
              {pokemon.abilities.map((ability, index) => (
                <div
                  key={index}
                  className="ability-card"
                  style={{
                    background: theme.colors.bgCard,
                    borderColor: theme.colors.border
                  }}
                >
                  <div
                    className="ability-name"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    <FlaskConical size={16} />
                    {ability.name.replace(/-/g, ' ')}
                    {ability.isHidden && (
                      <span
                        className="ability-hidden-badge"
                        style={{
                          background: theme.colors.primary,
                          color: 'white'
                        }}
                      >
                        Hidden
                      </span>
                    )}
                  </div>
                  <div
                    className="ability-description"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {ability.description || 'No description available.'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className="p-3 d-flex gap-2 justify-content-end"
          style={{
            borderTop: `1px solid ${theme.colors.border}`,
            background: theme.colors.bgSecondary
          }}
        >
          <button
            className="btn"
            onClick={onHide}
            style={{
              background: theme.colors.bgHover,
              color: theme.colors.textPrimary,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            Close
          </button>
          {onAddToTeam && (
            <button
              className="btn"
              onClick={() => {
                onAddToTeam(pokemon);
                onHide();
              }}
              style={{
                background: theme.gradients.primary,
                color: 'white',
                border: 'none',
                fontWeight: 600
              }}
            >
              Add to Team
            </button>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}
