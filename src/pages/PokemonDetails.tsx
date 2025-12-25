import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Tabs, Tab } from 'react-bootstrap';
import { ArrowLeft, Shield, Sword, Zap, Heart } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useTeamStore } from '../store/teamStore';
import { fetchPokemon } from '../services/pokeapi';
import { generateMovesets } from '../services/movesetService';
import { Pokemon } from '../types/pokemon';
import { typeColors } from '../styles/themes';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PokemonDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { addPokemon } = useTeamStore();

  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPokemon();
  }, [id]);

  async function loadPokemon() {
    if (!id) return;

    setLoading(true);
    try {
      const p = await fetchPokemon(parseInt(id));
      p.recommendedMovesets = generateMovesets(p);
      setPokemon(p);
    } catch (error) {
      console.error('Error loading Pokemon:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!pokemon) {
    return (
      <Container className="text-center mt-5">
        <h2>Pokemon not found</h2>
        <Button onClick={() => navigate('/pokedex')}>Back to Pokédex</Button>
      </Container>
    );
  }

  return (
    <div
      style={{
        background: theme.colors.bgPrimary,
        minHeight: '100vh',
        paddingTop: '30px',
        paddingBottom: '60px',
      }}
    >
      <Container>
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/pokedex')}
          className="mb-4"
          style={{
            border: `2px solid ${theme.colors.border}`,
            color: theme.colors.textPrimary,
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={18} className="me-2" />
          Back to Pokédex
        </Button>

        {/* Header Card */}
        <Card
          className="mb-4"
          style={{
            background: theme.gradients.secondary,
            border: `2px solid ${theme.colors.border}`,
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        >
          <Card.Body className="p-5">
            <Row className="align-items-center">
              <Col md={4} className="text-center">
                <img
                  src={pokemon.artwork || pokemon.sprite}
                  alt={pokemon.name}
                  style={{
                    width: '250px',
                    height: '250px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3))',
                  }}
                />
              </Col>
              <Col md={8}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <h1
                    style={{
                      fontSize: '3rem',
                      fontWeight: 800,
                      color: theme.colors.textPrimary,
                      textTransform: 'capitalize',
                      margin: 0,
                    }}
                  >
                    {pokemon.name}
                  </h1>
                  <Badge
                    bg="secondary"
                    style={{
                      fontSize: '1.2rem',
                      padding: '8px 16px',
                      background: theme.colors.bgSecondary,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    #{pokemon.id.toString().padStart(4, '0')}
                  </Badge>
                </div>

                <div className="d-flex gap-2 mb-4">
                  {pokemon.types.map((type) => (
                    <Badge
                      key={type}
                      style={{
                        background: typeColors[type],
                        fontSize: '1rem',
                        padding: '10px 20px',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                      }}
                    >
                      {type}
                    </Badge>
                  ))}
                  <Badge
                    style={{
                      background: theme.colors.bgSecondary,
                      color: theme.colors.textPrimary,
                      fontSize: '1rem',
                      padding: '10px 20px',
                      fontWeight: 700,
                    }}
                  >
                    Gen {pokemon.generation}
                  </Badge>
                </div>

                <Row className="mb-3">
                  <Col xs={6}>
                    <div style={{ color: theme.colors.textSecondary }}>
                      <strong>Height:</strong> {pokemon.height / 10}m
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div style={{ color: theme.colors.textSecondary }}>
                      <strong>Weight:</strong> {pokemon.weight / 10}kg
                    </div>
                  </Col>
                </Row>

                <Button
                  onClick={() => {
                    addPokemon(pokemon);
                    navigate('/team-builder');
                  }}
                  style={{
                    background: theme.gradients.primary,
                    border: 'none',
                    padding: '12px 30px',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    borderRadius: '12px',
                  }}
                >
                  Add to Team
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Main Content Tabs */}
        <Tabs
          defaultActiveKey="stats"
          className="mb-4"
          style={{
            borderBottom: `2px solid ${theme.colors.border}`,
          }}
        >
          {/* Stats Tab */}
          <Tab eventKey="stats" title="Stats & Abilities">
            <Row className="g-4 mt-2">
              {/* Base Stats */}
              <Col md={6}>
                <Card
                  style={{
                    background: theme.colors.bgCard,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '16px',
                  }}
                >
                  <Card.Body>
                    <h4 style={{ color: theme.colors.textPrimary, marginBottom: '20px' }}>
                      Base Stats
                    </h4>
                    <StatBar label="HP" value={pokemon.stats.hp} max={255} color={theme.colors.error} icon={<Heart size={16} />} />
                    <StatBar label="Attack" value={pokemon.stats.attack} max={255} color={theme.colors.accent1} icon={<Sword size={16} />} />
                    <StatBar label="Defense" value={pokemon.stats.defense} max={255} color={theme.colors.accent4} icon={<Shield size={16} />} />
                    <StatBar label="Sp. Attack" value={pokemon.stats.specialAttack} max={255} color={theme.colors.accent2} icon={<Zap size={16} />} />
                    <StatBar label="Sp. Defense" value={pokemon.stats.specialDefense} max={255} color={theme.colors.accent3} icon={<Shield size={16} />} />
                    <StatBar label="Speed" value={pokemon.stats.speed} max={255} color={theme.colors.info} icon={<Zap size={16} />} />

                    <div
                      className="mt-4 p-3 text-center"
                      style={{
                        background: theme.gradients.primary,
                        borderRadius: '12px',
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                        {pokemon.stats.total}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#fff', opacity: 0.9 }}>
                        Total Base Stats
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Abilities */}
              <Col md={6}>
                <Card
                  style={{
                    background: theme.colors.bgCard,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '16px',
                  }}
                >
                  <Card.Body>
                    <h4 style={{ color: theme.colors.textPrimary, marginBottom: '20px' }}>
                      Abilities
                    </h4>
                    {pokemon.abilities.map((ability, idx) => (
                      <div
                        key={idx}
                        className="mb-3 p-3"
                        style={{
                          background: theme.colors.bgSecondary,
                          borderRadius: '12px',
                          border: ability.isHidden ? `2px dashed ${theme.colors.primary}` : 'none',
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6
                            style={{
                              color: theme.colors.textPrimary,
                              fontWeight: 700,
                              textTransform: 'capitalize',
                              margin: 0,
                            }}
                          >
                            {ability.name.replace('-', ' ')}
                          </h6>
                          {ability.isHidden && (
                            <Badge bg="warning" style={{ fontSize: '0.7rem' }}>
                              Hidden
                            </Badge>
                          )}
                        </div>
                        <p
                          style={{
                            color: theme.colors.textSecondary,
                            fontSize: '0.9rem',
                            margin: 0,
                          }}
                        >
                          {ability.description || 'No description available'}
                        </p>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Type Effectiveness Tab */}
          <Tab eventKey="types" title="Type Effectiveness">
            <Row className="g-4 mt-2">
              {/* Weaknesses */}
              <Col md={6}>
                <Card
                  style={{
                    background: theme.colors.bgCard,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '16px',
                  }}
                >
                  <Card.Body>
                    <h4 style={{ color: theme.colors.textPrimary, marginBottom: '20px' }}>
                      Weaknesses
                    </h4>

                    {pokemon.typeEffectiveness.doubleWeakTo.length > 0 && (
                      <div className="mb-3">
                        <h6 style={{ color: theme.colors.error, marginBottom: '10px' }}>
                          4x Weak To
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                          {pokemon.typeEffectiveness.doubleWeakTo.map((type) => (
                            <Badge
                              key={type}
                              style={{
                                background: typeColors[type],
                                fontSize: '0.9rem',
                                padding: '8px 16px',
                                textTransform: 'uppercase',
                              }}
                            >
                              {type} (4x)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {pokemon.typeEffectiveness.weakTo.length > 0 && (
                      <div>
                        <h6 style={{ color: theme.colors.warning, marginBottom: '10px' }}>
                          2x Weak To
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                          {pokemon.typeEffectiveness.weakTo.map((type) => (
                            <Badge
                              key={type}
                              style={{
                                background: typeColors[type],
                                fontSize: '0.9rem',
                                padding: '8px 16px',
                                textTransform: 'uppercase',
                              }}
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {pokemon.typeEffectiveness.weakTo.length === 0 &&
                     pokemon.typeEffectiveness.doubleWeakTo.length === 0 && (
                      <p style={{ color: theme.colors.textSecondary }}>
                        No weaknesses!
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Resistances & Immunities */}
              <Col md={6}>
                <Card
                  style={{
                    background: theme.colors.bgCard,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '16px',
                  }}
                >
                  <Card.Body>
                    <h4 style={{ color: theme.colors.textPrimary, marginBottom: '20px' }}>
                      Resistances & Immunities
                    </h4>

                    {pokemon.typeEffectiveness.immune.length > 0 && (
                      <div className="mb-3">
                        <h6 style={{ color: theme.colors.success, marginBottom: '10px' }}>
                          Immune To (0x)
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                          {pokemon.typeEffectiveness.immune.map((type) => (
                            <Badge
                              key={type}
                              style={{
                                background: typeColors[type],
                                fontSize: '0.9rem',
                                padding: '8px 16px',
                                textTransform: 'uppercase',
                              }}
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {pokemon.typeEffectiveness.resistantTo.length > 0 && (
                      <div>
                        <h6 style={{ color: theme.colors.info, marginBottom: '10px' }}>
                          Resistant To (0.5x)
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                          {pokemon.typeEffectiveness.resistantTo.map((type) => (
                            <Badge
                              key={type}
                              style={{
                                background: typeColors[type],
                                fontSize: '0.9rem',
                                padding: '8px 16px',
                                textTransform: 'uppercase',
                              }}
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Movesets Tab */}
          <Tab eventKey="movesets" title="Recommended Movesets">
            <Row className="g-4 mt-2">
              {pokemon.recommendedMovesets && pokemon.recommendedMovesets.length > 0 ? (
                pokemon.recommendedMovesets.map((moveset, idx) => (
                  <Col key={idx} md={6}>
                    <Card
                      style={{
                        background: theme.colors.bgCard,
                        border: `2px solid ${theme.colors.border}`,
                        borderRadius: '16px',
                      }}
                    >
                      <Card.Body>
                        <div
                          className="mb-3 p-2 text-center"
                          style={{
                            background: theme.gradients.primary,
                            borderRadius: '10px',
                          }}
                        >
                          <h5
                            style={{
                              color: '#fff',
                              fontWeight: 700,
                              margin: 0,
                            }}
                          >
                            {moveset.role}
                          </h5>
                        </div>

                        <div className="mb-3">
                          <h6 style={{ color: theme.colors.textPrimary }}>Ability</h6>
                          <Badge
                            style={{
                              background: theme.colors.primary,
                              fontSize: '0.9rem',
                              padding: '6px 12px',
                            }}
                          >
                            {moveset.ability}
                          </Badge>
                        </div>

                        <div className="mb-3">
                          <h6 style={{ color: theme.colors.textPrimary }}>Item</h6>
                          <Badge
                            style={{
                              background: theme.colors.accent3,
                              fontSize: '0.9rem',
                              padding: '6px 12px',
                            }}
                          >
                            {moveset.item}
                          </Badge>
                        </div>

                        <div className="mb-3">
                          <h6 style={{ color: theme.colors.textPrimary }}>Moves</h6>
                          <div className="d-flex flex-column gap-2">
                            {moveset.moves.map((move, mIdx) => (
                              <div
                                key={mIdx}
                                style={{
                                  background: theme.colors.bgSecondary,
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  color: theme.colors.textPrimary,
                                  fontWeight: 600,
                                  textTransform: 'capitalize',
                                }}
                              >
                                {move.replace('-', ' ')}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mb-3">
                          <h6 style={{ color: theme.colors.textPrimary }}>Nature</h6>
                          <Badge
                            style={{
                              background: theme.colors.accent2,
                              fontSize: '0.9rem',
                              padding: '6px 12px',
                            }}
                          >
                            {moveset.nature}
                          </Badge>
                        </div>

                        <div>
                          <h6 style={{ color: theme.colors.textPrimary }}>EV Spread</h6>
                          <div
                            style={{
                              background: theme.colors.bgSecondary,
                              padding: '10px',
                              borderRadius: '8px',
                              color: theme.colors.textSecondary,
                              fontSize: '0.9rem',
                            }}
                          >
                            {moveset.evs}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col>
                  <p style={{ color: theme.colors.textSecondary }}>
                    No recommended movesets available
                  </p>
                </Col>
              )}
            </Row>
          </Tab>

          {/* Moves Tab */}
          <Tab eventKey="moves" title="All Moves">
            <div className="mt-2">
              <Card
                style={{
                  background: theme.colors.bgCard,
                  border: `2px solid ${theme.colors.border}`,
                  borderRadius: '16px',
                }}
              >
                <Card.Body>
                  <h4 style={{ color: theme.colors.textPrimary, marginBottom: '20px' }}>
                    Available Moves ({pokemon.moves.length})
                  </h4>
                  <Row className="g-2">
                    {pokemon.moves.map((move, idx) => (
                      <Col key={idx} md={3} sm={6}>
                        <div
                          style={{
                            background: theme.colors.bgSecondary,
                            padding: '10px',
                            borderRadius: '8px',
                            textAlign: 'center',
                            color: theme.colors.textPrimary,
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            textTransform: 'capitalize',
                          }}
                        >
                          {move.name.replace('-', ' ')}
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
}

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  icon: React.ReactNode;
}

function StatBar({ label, value, max, color, icon }: StatBarProps) {
  const { theme } = useThemeStore();
  const percentage = (value / max) * 100;

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-2">
          <span style={{ color: theme.colors.textSecondary }}>{icon}</span>
          <span
            style={{
              color: theme.colors.textSecondary,
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            {label}
          </span>
        </div>
        <span
          style={{
            color: theme.colors.textPrimary,
            fontWeight: 800,
            fontSize: '1.1rem',
          }}
        >
          {value}
        </span>
      </div>
      <div
        style={{
          background: theme.colors.bgSecondary,
          borderRadius: '8px',
          height: '12px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            background: color,
            width: `${percentage}%`,
            height: '100%',
            borderRadius: '8px',
            transition: 'width 0.5s ease',
            boxShadow: `0 0 10px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}
