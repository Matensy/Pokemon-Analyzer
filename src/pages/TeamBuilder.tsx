import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Modal, Badge, Form, Spinner, ListGroup, ProgressBar } from 'react-bootstrap';
import {
  Trash2, Sparkles, Search, Wand2, CheckCircle2, AlertTriangle,
  Target, Shield, Zap, Users, ChevronRight, Crown, TrendingUp,
  Brain, RefreshCw, X, Info, Star, Copy, Check
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useTeamStore } from '../store/teamStore';
import { analyzeTeam } from '../services/aiAnalysisService';
import { analyzeTeam as analyzeTeamV2, autoFillTeam } from '../services/teamAnalyzer';
import { fetchPokemon } from '../services/pokeapi';
import { loadPokemonIndex, searchPokemonGlobal, PokemonEntry } from '../services/pokemonIndex';
import { SMOGON_MOVESETS, SmogonMoveset, getTopMovesets, formatEVs, getFormatDisplayName, SmogonFormat } from '../data/smogonSets';
import { VGC_USAGE_DATA, getUsageData } from '../data/vgcStats';
import { Pokemon, PokemonType } from '../types/pokemon';
import { typeColors } from '../styles/themes';
import { generateMovesets } from '../services/movesetService';

// Compact team slot component
function TeamSlot({ pokemon, index, onRemove, onClick, theme, isEmpty }: {
  pokemon?: Pokemon;
  index: number;
  onRemove: () => void;
  onClick: () => void;
  theme: any;
  isEmpty: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  if (isEmpty) {
    return (
      <div
        style={{
          background: theme.colors.bgTertiary,
          border: `2px dashed ${theme.colors.border}`,
          borderRadius: '16px',
          height: '140px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'default',
          transition: 'all 0.3s ease',
        }}
      >
        <span style={{ color: theme.colors.textMuted, fontSize: '2rem', opacity: 0.5 }}>+</span>
        <span style={{ color: theme.colors.textMuted, fontSize: '0.8rem' }}>Slot {index + 1}</span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: `linear-gradient(135deg, ${typeColors[pokemon!.types[0]]}30, ${theme.colors.bgCard})`,
        border: `2px solid ${isHovered ? theme.colors.primary : typeColors[pokemon!.types[0]]}`,
        borderRadius: '16px',
        height: '140px',
        padding: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 8px 24px ${typeColors[pokemon!.types[0]]}40` : 'none',
      }}
    >
      {/* Remove Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(239, 68, 68, 0.9)',
          border: 'none',
          borderRadius: '8px',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          zIndex: 10,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <X size={14} />
      </button>

      <div className="d-flex align-items-center h-100">
        <img
          src={pokemon!.artwork || pokemon!.sprite}
          alt={pokemon!.name}
          style={{
            width: '80px',
            height: '80px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
          }}
        />
        <div className="ms-2 flex-grow-1">
          <div style={{
            color: theme.colors.textPrimary,
            fontWeight: 700,
            fontSize: '0.95rem',
            textTransform: 'capitalize',
          }}>
            {pokemon!.name.replace(/-/g, ' ')}
          </div>
          <div className="d-flex gap-1 mt-1 flex-wrap">
            {pokemon!.types.map(type => (
              <span
                key={type}
                style={{
                  background: typeColors[type],
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '8px',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {type}
              </span>
            ))}
          </div>
          <div style={{ color: theme.colors.textMuted, fontSize: '0.7rem', marginTop: '4px' }}>
            Click to view movesets
          </div>
        </div>
      </div>
    </div>
  );
}

// AI Recommendation Card
function RecommendationCard({ rec, onAdd, theme }: {
  rec: { pokemon: string; sprite: string; reason: string; roles: string[]; priority: number };
  onAdd: () => void;
  theme: any;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await onAdd();
    setLoading(false);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? theme.colors.bgHover : theme.colors.bgCard,
        border: `1px solid ${isHovered ? theme.colors.primary : theme.colors.border}`,
        borderRadius: '12px',
        padding: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      <div className="d-flex align-items-center gap-3">
        {loading ? (
          <Spinner animation="border" size="sm" style={{ color: theme.colors.primary }} />
        ) : (
          <img
            src={rec.sprite}
            alt={rec.pokemon}
            style={{ width: '50px', height: '50px', objectFit: 'contain' }}
          />
        )}
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2">
            <span style={{
              color: theme.colors.textPrimary,
              fontWeight: 700,
              textTransform: 'capitalize',
            }}>
              {rec.pokemon.replace(/-/g, ' ')}
            </span>
            {rec.priority >= 9 && (
              <Crown size={14} style={{ color: '#FFD700' }} />
            )}
          </div>
          <div style={{ color: theme.colors.textSecondary, fontSize: '0.75rem' }}>
            {rec.reason}
          </div>
        </div>
        <ChevronRight size={18} style={{ color: theme.colors.textMuted }} />
      </div>
    </div>
  );
}

// Moveset Card Component
function MovesetCard({ moveset, onSelect, theme, isSelected }: {
  moveset: SmogonMoveset;
  onSelect: () => void;
  theme: any;
  isSelected: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copyShowdownFormat = () => {
    const text = `${moveset.pokemon.charAt(0).toUpperCase() + moveset.pokemon.slice(1)} @ ${moveset.item}
Ability: ${moveset.ability}
${moveset.teraType ? `Tera Type: ${moveset.teraType}` : ''}
EVs: ${formatEVs(moveset.evs)}
${moveset.nature} Nature
${moveset.moves.map(m => `- ${m}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onSelect}
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.bgCard})`
          : theme.colors.bgCard,
        border: `2px solid ${isSelected ? theme.colors.primary : theme.colors.border}`,
        borderRadius: '16px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
      }}
    >
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: theme.colors.success,
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={14} color="white" />
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <div style={{ color: theme.colors.textPrimary, fontWeight: 700, fontSize: '1rem' }}>
            {moveset.name}
          </div>
          <Badge
            bg=""
            style={{
              background: theme.colors.primary,
              fontSize: '0.7rem',
              marginTop: '4px'
            }}
          >
            {getFormatDisplayName(moveset.format)}
          </Badge>
        </div>
        <div className="text-end">
          <div style={{
            color: theme.colors.success,
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <TrendingUp size={14} />
            {moveset.usage}%
          </div>
          <div style={{ color: theme.colors.textMuted, fontSize: '0.7rem' }}>usage</div>
        </div>
      </div>

      {/* Item & Ability */}
      <div className="row g-2 mb-3">
        <div className="col-6">
          <div style={{ color: theme.colors.textMuted, fontSize: '0.7rem' }}>Item</div>
          <div style={{ color: theme.colors.textPrimary, fontWeight: 600, fontSize: '0.85rem' }}>
            {moveset.item}
          </div>
        </div>
        <div className="col-6">
          <div style={{ color: theme.colors.textMuted, fontSize: '0.7rem' }}>Ability</div>
          <div style={{ color: theme.colors.textPrimary, fontWeight: 600, fontSize: '0.85rem' }}>
            {moveset.ability}
          </div>
        </div>
      </div>

      {/* Nature & EVs */}
      <div className="mb-3">
        <div style={{ color: theme.colors.textMuted, fontSize: '0.7rem' }}>Nature / EVs</div>
        <div style={{ color: theme.colors.textSecondary, fontSize: '0.8rem' }}>
          {moveset.nature} • {formatEVs(moveset.evs)}
        </div>
      </div>

      {/* Tera Type */}
      {moveset.teraType && (
        <div className="mb-3">
          <div style={{ color: theme.colors.textMuted, fontSize: '0.7rem' }}>Tera Type</div>
          <Badge
            bg=""
            style={{
              background: typeColors[moveset.teraType.toLowerCase() as PokemonType] || theme.colors.primary,
              textTransform: 'capitalize'
            }}
          >
            {moveset.teraType}
          </Badge>
        </div>
      )}

      {/* Moves */}
      <div className="mb-3">
        <div style={{ color: theme.colors.textMuted, fontSize: '0.7rem', marginBottom: '8px' }}>Moves</div>
        <div className="d-flex flex-wrap gap-2">
          {moveset.moves.map((move, i) => (
            <span
              key={i}
              style={{
                background: theme.colors.bgHover,
                color: theme.colors.textPrimary,
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              {move}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div style={{
        color: theme.colors.textSecondary,
        fontSize: '0.8rem',
        fontStyle: 'italic',
        borderTop: `1px solid ${theme.colors.border}`,
        paddingTop: '12px',
      }}>
        {moveset.description}
      </div>

      {/* Copy Button */}
      <button
        onClick={(e) => { e.stopPropagation(); copyShowdownFormat(); }}
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          background: copied ? theme.colors.success : theme.colors.bgHover,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          padding: '6px 10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: copied ? 'white' : theme.colors.textSecondary,
          fontSize: '0.7rem',
          transition: 'all 0.2s ease',
        }}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? 'Copied!' : 'Showdown'}
      </button>
    </div>
  );
}

export default function TeamBuilder() {
  const { theme } = useThemeStore();
  const { team, addPokemon, removePokemon, clearTeam, updatePokemon } = useTeamStore();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PokemonEntry[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loadingPokemon, setLoadingPokemon] = useState<string | null>(null);

  // Moveset Modal state
  const [selectedTeamPokemon, setSelectedTeamPokemon] = useState<Pokemon | null>(null);
  const [showMovesetModal, setShowMovesetModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<SmogonFormat>('vgc2025');
  const [selectedMovesetIndex, setSelectedMovesetIndex] = useState<number | null>(null);

  // Auto-fill state
  const [autoFillLoading, setAutoFillLoading] = useState(false);

  // Analysis
  const analysis = analyzeTeam(team);
  const analysisV2 = analyzeTeamV2(team);

  // Load Pokemon index
  useEffect(() => {
    loadPokemonIndex();
  }, []);

  // Handle search
  const handleSearchChange = useCallback(async (value: string) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      const results = await searchPokemonGlobal(value);
      setSearchResults(results.slice(0, 8));
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, []);

  // Add Pokemon from search
  const handleAddPokemon = async (entry: PokemonEntry) => {
    setLoadingPokemon(entry.name);
    setShowSearchResults(false);
    setSearchQuery('');
    try {
      const pokemon = await fetchPokemon(entry.id);
      pokemon.recommendedMovesets = generateMovesets(pokemon);
      addPokemon(pokemon);
    } catch (error) {
      console.error('Error adding Pokemon:', error);
    } finally {
      setLoadingPokemon(null);
    }
  };

  // Add Pokemon from recommendation
  const handleAddRecommendation = async (name: string) => {
    setLoadingPokemon(name);
    try {
      // Search for the Pokemon
      const results = await searchPokemonGlobal(name);
      if (results.length > 0) {
        const pokemon = await fetchPokemon(results[0].id);
        pokemon.recommendedMovesets = generateMovesets(pokemon);
        addPokemon(pokemon);
      }
    } catch (error) {
      console.error('Error adding Pokemon:', error);
    } finally {
      setLoadingPokemon(null);
    }
  };

  // Auto-fill team
  const handleAutoFill = async () => {
    if (team.length >= 6) return;

    setAutoFillLoading(true);
    try {
      const suggestions = autoFillTeam(team, 6);

      for (const suggestion of suggestions) {
        if (team.length >= 6) break;
        const results = await searchPokemonGlobal(suggestion);
        if (results.length > 0) {
          const pokemon = await fetchPokemon(results[0].id);
          pokemon.recommendedMovesets = generateMovesets(pokemon);
          addPokemon(pokemon);
          // Small delay for visual effect
          await new Promise(r => setTimeout(r, 300));
        }
      }
    } catch (error) {
      console.error('Error auto-filling team:', error);
    } finally {
      setAutoFillLoading(false);
    }
  };

  // Get movesets for selected Pokemon
  const getMovesets = () => {
    if (!selectedTeamPokemon) return [];
    const pokemonName = selectedTeamPokemon.name.toLowerCase();
    return SMOGON_MOVESETS.filter(m => {
      const normalizedName = m.pokemon.toLowerCase();
      return normalizedName === pokemonName ||
             normalizedName.replace(/-/g, '') === pokemonName.replace(/-/g, '');
    });
  };

  // Filter movesets by format
  const filteredMovesets = getMovesets().filter(m => m.format === selectedFormat);
  const allMovesets = getMovesets();

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return '#22C55E';
    if (score >= 40) return theme.colors.warning;
    return theme.colors.error;
  };

  // Available formats for the moveset modal
  const formats: SmogonFormat[] = ['vgc2025', 'ou', 'ubers', 'nationaldex', 'uu'];

  return (
    <div style={{ background: theme.colors.bgPrimary, minHeight: '100vh', paddingTop: '30px', paddingBottom: '60px' }}>
      <Container fluid style={{ maxWidth: '1600px' }}>
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="d-flex align-items-center justify-content-center gap-3 mb-2" style={{ fontWeight: 800 }}>
            <Brain size={36} style={{ color: theme.colors.primary }} />
            <span style={{
              background: theme.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              AI Team Builder
            </span>
          </h1>
          <p style={{ color: theme.colors.textSecondary }}>
            Build your competitive VGC team with AI-powered recommendations
          </p>
        </div>

        <Row>
          {/* Left Column - Pokemon Finder & Recommendations */}
          <Col lg={4}>
            {/* Search Box */}
            <div
              className="p-4 mb-4"
              style={{
                background: theme.colors.bgCard,
                borderRadius: '20px',
                border: `1px solid ${theme.colors.border}`,
                position: 'relative',
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-3">
                <Search size={18} style={{ color: theme.colors.primary }} />
                <h5 style={{ color: theme.colors.textPrimary, margin: 0, fontWeight: 700 }}>
                  Find Pokemon
                </h5>
              </div>

              <Form.Control
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{
                  background: theme.colors.bgTertiary,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.textPrimary,
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '1rem',
                }}
              />

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <ListGroup
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '16px',
                    right: '16px',
                    zIndex: 1000,
                    maxHeight: '350px',
                    overflowY: 'auto',
                    borderRadius: '12px',
                    marginTop: '4px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  {searchResults.map((entry) => (
                    <ListGroup.Item
                      key={entry.id}
                      action
                      onClick={() => handleAddPokemon(entry)}
                      disabled={loadingPokemon !== null || team.some(p => p.id === entry.id) || team.length >= 6}
                      style={{
                        background: theme.colors.bgCard,
                        color: theme.colors.textPrimary,
                        border: 'none',
                        borderBottom: `1px solid ${theme.colors.border}`,
                        cursor: team.some(p => p.id === entry.id) || team.length >= 6 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        opacity: team.some(p => p.id === entry.id) ? 0.5 : 1,
                      }}
                    >
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.id}.png`}
                        alt={entry.name}
                        style={{ width: '48px', height: '48px' }}
                      />
                      <div className="flex-grow-1">
                        <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>
                          {entry.name.replace(/-/g, ' ')}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>
                          #{entry.id}
                        </div>
                      </div>
                      {team.some(p => p.id === entry.id) && (
                        <Badge bg="secondary">In Team</Badge>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </div>

            {/* AI Recommendations */}
            <div
              className="p-4 mb-4"
              style={{
                background: theme.colors.bgCard,
                borderRadius: '20px',
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <Sparkles size={18} style={{ color: theme.colors.primary }} />
                  <h5 style={{ color: theme.colors.textPrimary, margin: 0, fontWeight: 700 }}>
                    AI Recommendations
                  </h5>
                </div>
                {team.length > 0 && team.length < 6 && (
                  <button
                    onClick={handleAutoFill}
                    disabled={autoFillLoading}
                    style={{
                      background: theme.gradients.primary,
                      border: 'none',
                      borderRadius: '10px',
                      padding: '8px 14px',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: autoFillLoading ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {autoFillLoading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>
                        <Wand2 size={14} />
                        Auto-Fill ({6 - team.length})
                      </>
                    )}
                  </button>
                )}
              </div>

              {team.length === 0 ? (
                <div style={{ color: theme.colors.textMuted, textAlign: 'center', padding: '20px' }}>
                  <Users size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p>Add your first Pokemon to get personalized recommendations!</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {analysisV2.recommendations.slice(0, 6).map((rec, i) => (
                    <RecommendationCard
                      key={i}
                      rec={rec}
                      onAdd={() => handleAddRecommendation(rec.pokemon)}
                      theme={theme}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Top VGC Picks Quick Add */}
            {team.length < 6 && (
              <div
                className="p-4"
                style={{
                  background: theme.colors.bgCard,
                  borderRadius: '20px',
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Crown size={18} style={{ color: '#FFD700' }} />
                  <h5 style={{ color: theme.colors.textPrimary, margin: 0, fontWeight: 700 }}>
                    Top VGC Picks
                  </h5>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  {VGC_USAGE_DATA.slice(0, 12).map((data, i) => {
                    const isInTeam = team.some(p => p.name.toLowerCase().replace(/-/g, '') === data.pokemon.toLowerCase().replace(/-/g, ''));
                    return (
                      <button
                        key={i}
                        onClick={() => !isInTeam && handleAddRecommendation(data.pokemon)}
                        disabled={isInTeam || loadingPokemon !== null || team.length >= 6}
                        style={{
                          background: isInTeam ? theme.colors.bgTertiary : theme.colors.bgHover,
                          border: `1px solid ${isInTeam ? theme.colors.success : theme.colors.border}`,
                          borderRadius: '10px',
                          padding: '8px 12px',
                          color: isInTeam ? theme.colors.success : theme.colors.textPrimary,
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: isInTeam ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          textTransform: 'capitalize',
                          opacity: (loadingPokemon !== null && loadingPokemon !== data.pokemon) ? 0.5 : 1,
                        }}
                      >
                        {isInTeam && <CheckCircle2 size={12} />}
                        {data.pokemon.replace(/-/g, ' ')}
                        <span style={{
                          background: data.tier === 'S' ? '#FFD700' : data.tier === 'A' ? theme.colors.primary : theme.colors.textMuted,
                          color: data.tier === 'S' ? '#000' : 'white',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '0.6rem',
                          fontWeight: 700,
                        }}>
                          {data.tier}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </Col>

          {/* Middle Column - Team */}
          <Col lg={4}>
            <div
              className="p-4"
              style={{
                background: theme.colors.bgCard,
                borderRadius: '20px',
                border: `1px solid ${theme.colors.border}`,
                minHeight: '600px',
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-2">
                  <Users size={20} style={{ color: theme.colors.primary }} />
                  <h4 style={{ color: theme.colors.textPrimary, margin: 0, fontWeight: 700 }}>
                    Your Team
                  </h4>
                  <Badge bg="" style={{ background: theme.gradients.primary }}>
                    {team.length}/6
                  </Badge>
                </div>
                {team.length > 0 && (
                  <button
                    onClick={clearTeam}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${theme.colors.error}`,
                      borderRadius: '8px',
                      padding: '6px 12px',
                      color: theme.colors.error,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8rem',
                    }}
                  >
                    <Trash2 size={14} />
                    Clear
                  </button>
                )}
              </div>

              <div className="d-grid gap-3" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <TeamSlot
                    key={index}
                    pokemon={team[index]}
                    index={index}
                    isEmpty={!team[index]}
                    onRemove={() => removePokemon(team[index]?.id)}
                    onClick={() => {
                      if (team[index]) {
                        setSelectedTeamPokemon(team[index]);
                        setShowMovesetModal(true);
                        setSelectedMovesetIndex(null);
                      }
                    }}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
          </Col>

          {/* Right Column - AI Analysis Scorecard */}
          <Col lg={4}>
            <div
              className="p-4"
              style={{
                background: theme.colors.bgCard,
                borderRadius: '20px',
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-4">
                <Brain size={20} style={{ color: theme.colors.primary }} />
                <h4 style={{ color: theme.colors.textPrimary, margin: 0, fontWeight: 700 }}>
                  AI Scorecard
                </h4>
              </div>

              {/* Score Circle */}
              <div className="text-center mb-4">
                <div
                  style={{
                    width: '160px',
                    height: '160px',
                    margin: '0 auto',
                    borderRadius: '50%',
                    background: `conic-gradient(${getScoreColor(analysis.overallScore)} ${analysis.overallScore}%, ${theme.colors.bgTertiary} 0)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 30px ${getScoreColor(analysis.overallScore)}40`,
                  }}
                >
                  <div
                    style={{
                      width: '130px',
                      height: '130px',
                      borderRadius: '50%',
                      background: theme.colors.bgCard,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 800,
                      color: getScoreColor(analysis.overallScore),
                      lineHeight: 1,
                    }}>
                      {analysis.overallScore}
                    </div>
                    <div style={{ color: theme.colors.textMuted, fontSize: '0.9rem' }}>
                      Team Score
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Coverage */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Target size={16} style={{ color: theme.colors.primary }} />
                  <h6 style={{ color: theme.colors.textPrimary, margin: 0, fontWeight: 700 }}>
                    Role Coverage
                  </h6>
                </div>
                <div className="d-flex flex-column gap-2">
                  {analysisV2.roles.slice(0, 6).map((role, i) => (
                    <div
                      key={i}
                      className="d-flex align-items-center justify-content-between"
                      style={{
                        background: role.filled ? `${theme.colors.success}15` : theme.colors.bgTertiary,
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${role.filled ? theme.colors.success : theme.colors.border}`,
                      }}
                    >
                      <span style={{
                        color: role.filled ? theme.colors.success : theme.colors.textSecondary,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}>
                        {role.role}
                      </span>
                      {role.filled ? (
                        <div className="d-flex align-items-center gap-2">
                          <span style={{
                            color: theme.colors.success,
                            fontSize: '0.75rem',
                            textTransform: 'capitalize',
                          }}>
                            {role.pokemon}
                          </span>
                          <CheckCircle2 size={16} style={{ color: theme.colors.success }} />
                        </div>
                      ) : (
                        <span style={{ color: theme.colors.textMuted, fontSize: '0.75rem' }}>
                          Missing
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              {analysis.weaknesses.length > 0 && (
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <AlertTriangle size={16} style={{ color: theme.colors.warning }} />
                    <h6 style={{ color: theme.colors.textPrimary, margin: 0, fontWeight: 700 }}>
                      Shared Weaknesses
                    </h6>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {analysis.weaknesses.map((w, i) => (
                      <Badge
                        key={i}
                        bg=""
                        style={{
                          background: typeColors[w.type],
                          padding: '8px 14px',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {w.type.toUpperCase()}
                        <span style={{
                          background: 'rgba(0,0,0,0.3)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                        }}>
                          {w.count}×
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {analysis.strengths.length > 0 && (
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Shield size={16} style={{ color: theme.colors.success }} />
                    <h6 style={{ color: theme.colors.textPrimary, margin: 0, fontWeight: 700 }}>
                      Resistances
                    </h6>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {analysis.strengths.slice(0, 6).map((type, i) => (
                      <Badge
                        key={i}
                        bg=""
                        style={{
                          background: typeColors[type],
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                        }}
                      >
                        {type.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Synergies */}
              {analysisV2.synergies.length > 0 && (
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Zap size={16} style={{ color: theme.colors.info }} />
                    <h6 style={{ color: theme.colors.textPrimary, margin: 0, fontWeight: 700 }}>
                      Team Synergies
                    </h6>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {analysisV2.synergies.map((syn, i) => (
                      <Badge
                        key={i}
                        bg=""
                        style={{
                          background: `${theme.colors.info}20`,
                          color: theme.colors.info,
                          border: `1px solid ${theme.colors.info}`,
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                        }}
                      >
                        {syn}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Elements */}
              {analysisV2.missingElements.length > 0 && (
                <div>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Info size={16} style={{ color: theme.colors.warning }} />
                    <h6 style={{ color: theme.colors.textPrimary, margin: 0, fontWeight: 700 }}>
                      What's Missing
                    </h6>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {analysisV2.missingElements.slice(0, 4).map((item, i) => (
                      <div
                        key={i}
                        style={{
                          background: `${theme.colors.warning}15`,
                          border: `1px solid ${theme.colors.warning}40`,
                          borderRadius: '10px',
                          padding: '10px 14px',
                          color: theme.colors.warning,
                          fontSize: '0.85rem',
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Moveset Modal */}
      <Modal
        show={showMovesetModal}
        onHide={() => setShowMovesetModal(false)}
        size="xl"
        centered
        contentClassName="bg-transparent border-0"
      >
        <div
          style={{
            background: theme.colors.bgCard,
            borderRadius: '24px',
            border: `1px solid ${theme.colors.border}`,
            maxHeight: '90vh',
            overflow: 'hidden',
          }}
        >
          {/* Modal Header */}
          <div
            className="p-4"
            style={{
              borderBottom: `1px solid ${theme.colors.border}`,
              background: selectedTeamPokemon
                ? `linear-gradient(135deg, ${typeColors[selectedTeamPokemon.types[0]]}20, transparent)`
                : undefined,
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                {selectedTeamPokemon && (
                  <img
                    src={selectedTeamPokemon.artwork || selectedTeamPokemon.sprite}
                    alt={selectedTeamPokemon.name}
                    style={{ width: '70px', height: '70px', objectFit: 'contain' }}
                  />
                )}
                <div>
                  <h4 style={{
                    color: theme.colors.textPrimary,
                    margin: 0,
                    fontWeight: 800,
                    textTransform: 'capitalize',
                  }}>
                    {selectedTeamPokemon?.name.replace(/-/g, ' ')}
                  </h4>
                  <div className="d-flex gap-2 mt-1">
                    {selectedTeamPokemon?.types.map(type => (
                      <Badge
                        key={type}
                        bg=""
                        style={{ background: typeColors[type] }}
                      >
                        {type.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowMovesetModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: theme.colors.textMuted,
                  cursor: 'pointer',
                  padding: '8px',
                }}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Format Selector */}
          <div className="p-3" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
            <div className="d-flex gap-2 flex-wrap">
              {formats.map(format => (
                <button
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  style={{
                    background: selectedFormat === format ? theme.gradients.primary : theme.colors.bgTertiary,
                    border: `1px solid ${selectedFormat === format ? theme.colors.primary : theme.colors.border}`,
                    borderRadius: '10px',
                    padding: '8px 16px',
                    color: selectedFormat === format ? 'white' : theme.colors.textSecondary,
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {getFormatDisplayName(format)}
                  {allMovesets.filter(m => m.format === format).length > 0 && (
                    <span style={{
                      marginLeft: '8px',
                      opacity: 0.7,
                      background: selectedFormat === format ? 'rgba(255,255,255,0.2)' : theme.colors.bgHover,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                    }}>
                      {allMovesets.filter(m => m.format === format).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Movesets */}
          <div style={{ maxHeight: '50vh', overflowY: 'auto', padding: '20px' }}>
            {filteredMovesets.length > 0 ? (
              <Row className="g-3">
                {filteredMovesets.map((moveset, i) => (
                  <Col md={6} key={i}>
                    <MovesetCard
                      moveset={moveset}
                      isSelected={selectedMovesetIndex === i}
                      onSelect={() => setSelectedMovesetIndex(i)}
                      theme={theme}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="text-center py-5" style={{ color: theme.colors.textMuted }}>
                <Star size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p style={{ fontSize: '1.1rem' }}>
                  No movesets found for {selectedTeamPokemon?.name.replace(/-/g, ' ')} in {getFormatDisplayName(selectedFormat)}
                </p>
                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                  Try selecting a different format above
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          {selectedMovesetIndex !== null && filteredMovesets[selectedMovesetIndex] && (
            <div
              className="p-4"
              style={{
                borderTop: `1px solid ${theme.colors.border}`,
                background: theme.colors.bgTertiary,
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div style={{ color: theme.colors.textSecondary }}>
                  <CheckCircle2 size={16} className="me-2" style={{ color: theme.colors.success }} />
                  Selected: <strong style={{ color: theme.colors.textPrimary }}>
                    {filteredMovesets[selectedMovesetIndex].name}
                  </strong>
                </div>
                <button
                  onClick={() => setShowMovesetModal(false)}
                  style={{
                    background: theme.gradients.primary,
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    color: 'white',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Check size={18} />
                  Apply Moveset
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
