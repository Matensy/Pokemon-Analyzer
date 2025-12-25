import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import {
  Trophy, Target,
  ChevronRight, AlertTriangle,
  Users, BarChart3, Sparkles, Crown, TrendingUp
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useTeamStore } from '../store/teamStore';
import { Pokemon } from '../types/pokemon';
import type { PokemonType } from '../types/pokemon';
import { typeColors } from '../styles/themes';
import { analyzeTeam } from '../services/aiAnalysisService';
import PokemonDetailModal from '../components/PokemonDetailModal';

// Meta Pokemon data for competitive analysis
const metaTiers = {
  S: [
    'flutter-mane', 'iron-bundle', 'gholdengo', 'chi-yu', 'iron-hands',
    'great-tusk', 'kingambit', 'dragapult', 'iron-valiant', 'roaring-moon'
  ],
  A: [
    'dragonite', 'garchomp', 'landorus-therian', 'urshifu', 'rillaboom',
    'grimmsnarl', 'amoonguss', 'incineroar', 'tornadus', 'pelipper'
  ],
  B: [
    'palafin', 'arcanine', 'armarouge', 'baxcalibur', 'dondozo',
    'tatsugiri', 'annihilape', 'iron-moth', 'murkrow', 'indeedee-f'
  ]
};

// Common team archetypes
const teamArchetypes = [
  {
    name: 'Hyper Offense',
    description: 'Fast, aggressive teams focused on dealing damage quickly',
    coreStrategy: 'Speed control + powerful attackers',
    keyMoves: ['Tailwind', 'Protect', 'Fake Out'],
    color: '#EF4444'
  },
  {
    name: 'Balanced',
    description: 'Well-rounded teams with offensive and defensive options',
    coreStrategy: 'Adaptable to different matchups',
    keyMoves: ['Protect', 'Will-O-Wisp', 'U-turn'],
    color: '#3B82F6'
  },
  {
    name: 'Trick Room',
    description: 'Teams built around the Trick Room speed reversal',
    coreStrategy: 'Slow, bulky attackers under Trick Room',
    keyMoves: ['Trick Room', 'Protect', 'Ally Switch'],
    color: '#A855F7'
  },
  {
    name: 'Weather (Sun)',
    description: 'Teams utilizing sun for boosted Fire moves and Chlorophyll',
    coreStrategy: 'Drought + Solar Power/Chlorophyll sweepers',
    keyMoves: ['Sunny Day', 'Solar Beam', 'Heat Wave'],
    color: '#F59E0B'
  },
  {
    name: 'Weather (Rain)',
    description: 'Teams utilizing rain for Swift Swim and Water moves',
    coreStrategy: 'Drizzle + Swift Swim sweepers',
    keyMoves: ['Rain Dance', 'Hurricane', 'Thunder'],
    color: '#6366F1'
  },
  {
    name: 'Goodstuffs',
    description: 'Collection of individually powerful Pokemon',
    coreStrategy: 'Individual Pokemon strength over synergy',
    keyMoves: ['Protect', 'Tera Blast', 'Helping Hand'],
    color: '#22C55E'
  }
];

export default function ChampionsTrainer() {
  const { theme } = useThemeStore();
  const { team, removePokemon, clearTeam } = useTeamStore();
  const [analysis, setAnalysis] = useState<any>(null);
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [showPokemonModal, setShowPokemonModal] = useState(false);

  useEffect(() => {
    if (team.length > 0) {
      const teamAnalysis = analyzeTeam(team);
      setAnalysis(teamAnalysis);
    } else {
      setAnalysis(null);
    }
  }, [team]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22C55E';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#EF4444';
    return '#DC2626';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#DC2626';
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      default: return '#22C55E';
    }
  };

  return (
    <div style={{ background: theme.colors.bgPrimary, minHeight: '100vh', paddingTop: '30px' }}>
      <Container>
        {/* Header */}
        <div className="text-center mb-4">
          <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
            <Trophy size={40} style={{ color: theme.colors.primary }} />
            <h1
              className="gradient-text mb-0"
              style={{ fontWeight: 800, fontSize: '2.5rem' }}
            >
              Champions Trainer
            </h1>
          </div>
          <p style={{ color: theme.colors.textSecondary }}>
            Build and analyze competitive teams for Pokemon Champions
          </p>
        </div>

        <Row className="g-4">
          {/* Left Column - Team Building */}
          <Col lg={8}>
            {/* Current Team */}
            <Card
              className="mb-4"
              style={{
                background: theme.colors.bgCard,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '16px',
              }}
            >
              <Card.Header
                style={{
                  background: theme.gradients.primary,
                  borderRadius: '16px 16px 0 0',
                  padding: '16px 20px',
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 text-white d-flex align-items-center gap-2">
                    <Users size={20} />
                    Your Team ({team.length}/6)
                  </h5>
                  {team.length > 0 && (
                    <button
                      onClick={clearTeam}
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      Clear Team
                    </button>
                  )}
                </div>
              </Card.Header>
              <Card.Body style={{ padding: '20px' }}>
                {team.length === 0 ? (
                  <div
                    className="text-center py-5"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    <Users size={48} className="mb-3" style={{ opacity: 0.5 }} />
                    <p className="mb-1">No Pokemon in your team yet</p>
                    <p className="small">
                      Go to the Pokedex to add Pokemon to your team
                    </p>
                  </div>
                ) : (
                  <Row className="g-3">
                    {team.map((pokemon, index) => (
                      <Col key={index} xs={6} md={4}>
                        <div
                          className="p-3 text-center position-relative card-hover"
                          style={{
                            background: theme.colors.bgHover,
                            borderRadius: '12px',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            setSelectedPokemon(pokemon);
                            setShowPokemonModal(true);
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removePokemon(index);
                            }}
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: theme.colors.error,
                              border: 'none',
                              color: 'white',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            ×
                          </button>
                          <img
                            src={pokemon.artwork || pokemon.sprite}
                            alt={pokemon.name}
                            style={{
                              width: '80px',
                              height: '80px',
                              objectFit: 'contain',
                            }}
                          />
                          <div
                            style={{
                              color: theme.colors.textPrimary,
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              marginTop: '8px',
                            }}
                          >
                            {pokemon.name}
                          </div>
                          <div className="d-flex gap-1 justify-content-center mt-2">
                            {pokemon.types.map((type) => (
                              <span
                                key={type}
                                style={{
                                  background: typeColors[type],
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                }}
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Col>
                    ))}
                    {Array.from({ length: 6 - team.length }).map((_, i) => (
                      <Col key={`empty-${i}`} xs={6} md={4}>
                        <div
                          className="p-3 text-center"
                          style={{
                            background: theme.colors.bgHover,
                            borderRadius: '12px',
                            border: `2px dashed ${theme.colors.border}`,
                            height: '160px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span style={{ color: theme.colors.textMuted }}>
                            Empty Slot
                          </span>
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card.Body>
            </Card>

            {/* Team Archetypes */}
            <Card
              style={{
                background: theme.colors.bgCard,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '16px',
              }}
            >
              <Card.Header
                style={{
                  background: 'transparent',
                  borderBottom: `1px solid ${theme.colors.border}`,
                  padding: '16px 20px',
                }}
              >
                <h5
                  className="mb-0 d-flex align-items-center gap-2"
                  style={{ color: theme.colors.textPrimary }}
                >
                  <Crown size={20} />
                  Team Archetypes
                </h5>
              </Card.Header>
              <Card.Body style={{ padding: '20px' }}>
                <Row className="g-3">
                  {teamArchetypes.map((archetype) => (
                    <Col key={archetype.name} md={6}>
                      <div
                        className="p-3 h-100"
                        style={{
                          background: selectedArchetype === archetype.name
                            ? `${archetype.color}15`
                            : theme.colors.bgHover,
                          borderRadius: '12px',
                          border: selectedArchetype === archetype.name
                            ? `2px solid ${archetype.color}`
                            : `1px solid ${theme.colors.border}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() =>
                          setSelectedArchetype(
                            selectedArchetype === archetype.name
                              ? null
                              : archetype.name
                          )
                        }
                      >
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              background: archetype.color,
                            }}
                          />
                          <strong style={{ color: theme.colors.textPrimary }}>
                            {archetype.name}
                          </strong>
                        </div>
                        <p
                          className="small mb-2"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          {archetype.description}
                        </p>
                        <div className="d-flex flex-wrap gap-1">
                          {archetype.keyMoves.map((move) => (
                            <Badge
                              key={move}
                              style={{
                                background: theme.colors.bgPrimary,
                                color: theme.colors.textSecondary,
                                fontWeight: 500,
                              }}
                            >
                              {move}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Analysis */}
          <Col lg={4}>
            {/* Team Score */}
            {analysis && (
              <>
                <Card
                  className="mb-4"
                  style={{
                    background: theme.colors.bgCard,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '16px',
                  }}
                >
                  <Card.Body className="text-center p-4">
                    <h6
                      className="mb-3"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      Team Score
                    </h6>
                    <div
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: `conic-gradient(${getScoreColor(
                          analysis.overallScore
                        )} ${analysis.overallScore}%, ${
                          theme.colors.bgHover
                        } 0)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                      }}
                    >
                      <div
                        style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: theme.colors.bgCard,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            color: getScoreColor(analysis.overallScore),
                          }}
                        >
                          {analysis.overallScore}
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: theme.colors.textMuted,
                          }}
                        >
                          / 100
                        </span>
                      </div>
                    </div>
                    <p
                      className="mt-3 mb-0"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {analysis.overallScore >= 80
                        ? 'Excellent team composition!'
                        : analysis.overallScore >= 60
                        ? 'Good team with room for improvement'
                        : 'Consider addressing weaknesses'}
                    </p>
                  </Card.Body>
                </Card>

                {/* Weaknesses */}
                {analysis.weaknesses.length > 0 && (
                  <Card
                    className="mb-4"
                    style={{
                      background: theme.colors.bgCard,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '16px',
                    }}
                  >
                    <Card.Header
                      style={{
                        background: 'transparent',
                        borderBottom: `1px solid ${theme.colors.border}`,
                        padding: '16px 20px',
                      }}
                    >
                      <h6
                        className="mb-0 d-flex align-items-center gap-2"
                        style={{ color: theme.colors.error }}
                      >
                        <AlertTriangle size={18} />
                        Team Weaknesses
                      </h6>
                    </Card.Header>
                    <Card.Body style={{ padding: '16px 20px' }}>
                      {analysis.weaknesses.slice(0, 5).map(
                        (
                          weakness: { type: PokemonType; count: number },
                          index: number
                        ) => (
                          <div
                            key={index}
                            className="d-flex align-items-center justify-content-between mb-2"
                          >
                            <span
                              style={{
                                background: typeColors[weakness.type],
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                              }}
                            >
                              {weakness.type}
                            </span>
                            <span
                              style={{
                                color:
                                  weakness.count >= 3
                                    ? theme.colors.error
                                    : theme.colors.textSecondary,
                                fontWeight: 600,
                              }}
                            >
                              {weakness.count} weak
                            </span>
                          </div>
                        )
                      )}
                    </Card.Body>
                  </Card>
                )}

                {/* Threats */}
                {analysis.threats.length > 0 && (
                  <Card
                    className="mb-4"
                    style={{
                      background: theme.colors.bgCard,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '16px',
                    }}
                  >
                    <Card.Header
                      style={{
                        background: 'transparent',
                        borderBottom: `1px solid ${theme.colors.border}`,
                        padding: '16px 20px',
                      }}
                    >
                      <h6
                        className="mb-0 d-flex align-items-center gap-2"
                        style={{ color: theme.colors.warning }}
                      >
                        <Target size={18} />
                        Meta Threats
                      </h6>
                    </Card.Header>
                    <Card.Body style={{ padding: '16px 20px' }}>
                      {analysis.threats.slice(0, 4).map(
                        (
                          threat: {
                            pokemon: string;
                            reason: string;
                            severity: string;
                          },
                          index: number
                        ) => (
                          <div
                            key={index}
                            className="mb-3 pb-2"
                            style={{
                              borderBottom:
                                index < 3
                                  ? `1px solid ${theme.colors.border}`
                                  : 'none',
                            }}
                          >
                            <div className="d-flex align-items-center justify-content-between">
                              <span
                                className="text-capitalize"
                                style={{
                                  color: theme.colors.textPrimary,
                                  fontWeight: 600,
                                }}
                              >
                                {threat.pokemon.replace('-', ' ')}
                              </span>
                              <Badge
                                style={{
                                  background: getSeverityColor(threat.severity),
                                  color: 'white',
                                }}
                              >
                                {threat.severity}
                              </Badge>
                            </div>
                            <small
                              style={{ color: theme.colors.textSecondary }}
                            >
                              {threat.reason}
                            </small>
                          </div>
                        )
                      )}
                    </Card.Body>
                  </Card>
                )}

                {/* Recommendations */}
                {analysis.recommendations.length > 0 && (
                  <Card
                    style={{
                      background: theme.colors.bgCard,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '16px',
                    }}
                  >
                    <Card.Header
                      style={{
                        background: 'transparent',
                        borderBottom: `1px solid ${theme.colors.border}`,
                        padding: '16px 20px',
                      }}
                    >
                      <h6
                        className="mb-0 d-flex align-items-center gap-2"
                        style={{ color: theme.colors.success }}
                      >
                        <Sparkles size={18} />
                        AI Recommendations
                      </h6>
                    </Card.Header>
                    <Card.Body style={{ padding: '16px 20px' }}>
                      {analysis.recommendations.slice(0, 4).map(
                        (
                          rec: {
                            type: string;
                            message: string;
                            priority: string;
                          },
                          index: number
                        ) => (
                          <div
                            key={index}
                            className="d-flex gap-2 mb-2"
                            style={{ color: theme.colors.textSecondary }}
                          >
                            <ChevronRight
                              size={16}
                              style={{
                                color: theme.colors.primary,
                                flexShrink: 0,
                                marginTop: '2px',
                              }}
                            />
                            <span className="small">{rec.message}</span>
                          </div>
                        )
                      )}
                    </Card.Body>
                  </Card>
                )}
              </>
            )}

            {/* No Team Message */}
            {!analysis && (
              <Card
                style={{
                  background: theme.colors.bgCard,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '16px',
                }}
              >
                <Card.Body className="text-center p-5">
                  <BarChart3
                    size={48}
                    className="mb-3"
                    style={{ color: theme.colors.textMuted, opacity: 0.5 }}
                  />
                  <h6 style={{ color: theme.colors.textPrimary }}>
                    Build Your Team
                  </h6>
                  <p
                    className="small mb-0"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Add Pokemon from the Pokedex to see detailed analysis and
                    recommendations
                  </p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>

        {/* Meta Tier List */}
        <Card
          className="mt-4"
          style={{
            background: theme.colors.bgCard,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '16px',
          }}
        >
          <Card.Header
            style={{
              background: 'transparent',
              borderBottom: `1px solid ${theme.colors.border}`,
              padding: '16px 20px',
            }}
          >
            <h5
              className="mb-0 d-flex align-items-center gap-2"
              style={{ color: theme.colors.textPrimary }}
            >
              <TrendingUp size={20} />
              VGC Meta Tier List (Pokemon Champions)
            </h5>
          </Card.Header>
          <Card.Body style={{ padding: '20px' }}>
            {Object.entries(metaTiers).map(([tier, pokemons]) => (
              <div key={tier} className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Badge
                    style={{
                      background:
                        tier === 'S'
                          ? '#EF4444'
                          : tier === 'A'
                          ? '#F59E0B'
                          : '#3B82F6',
                      padding: '6px 12px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                    }}
                  >
                    {tier} Tier
                  </Badge>
                  <span
                    style={{
                      color: theme.colors.textSecondary,
                      fontSize: '0.85rem',
                    }}
                  >
                    {tier === 'S'
                      ? 'Top meta threats'
                      : tier === 'A'
                      ? 'Very strong picks'
                      : 'Solid options'}
                  </span>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {pokemons.map((pokemon) => (
                    <span
                      key={pokemon}
                      style={{
                        background: theme.colors.bgHover,
                        color: theme.colors.textPrimary,
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                      }}
                    >
                      {pokemon.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </Card.Body>
        </Card>
      </Container>

      {/* Pokemon Detail Modal */}
      <PokemonDetailModal
        pokemon={selectedPokemon}
        show={showPokemonModal}
        onHide={() => setShowPokemonModal(false)}
      />
    </div>
  );
}
