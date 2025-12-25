import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Card, ProgressBar, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Heart, Shield, Swords } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useTeamStore } from '../store/teamStore';
import { fetchPokemon } from '../services/pokeapi';
import { generateMovesets } from '../services/movesetService';
import { BattleEngine, generateAITeam, BattleState, BattlePokemon } from '../services/battleEngine';
import { typeColors } from '../styles/themes';
import { Pokemon } from '../types/pokemon';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Battle() {
  const { theme } = useThemeStore();
  const { team } = useTeamStore();
  const navigate = useNavigate();

  const [battle, setBattle] = useState<BattleEngine | null>(null);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeBattle();
  }, []);

  useEffect(() => {
    // Auto-scroll logs to bottom
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battleState?.logs]);

  async function initializeBattle() {
    setInitializing(true);
    setLoading(true);

    try {
      // Check if player has a team
      if (!team || team.length === 0) {
        alert('You need to build a team first!');
        navigate('/team-builder');
        return;
      }

      // Ensure team has movesets
      const playerTeam = team.map(p => {
        if (!p.recommendedMovesets || p.recommendedMovesets.length === 0) {
          p.recommendedMovesets = generateMovesets(p);
        }
        return p;
      });

      // Generate AI team
      const allPokemon: Pokemon[] = [];
      const metaIds = [6, 94, 130, 143, 150, 248, 249, 250, 445, 448, 530, 635, 658, 706, 717, 784, 785, 786];

      for (const id of metaIds) {
        try {
          const p = await fetchPokemon(id);
          p.recommendedMovesets = generateMovesets(p);
          allPokemon.push(p);
        } catch (e) {
          console.error(`Failed to load Pokemon ${id}`, e);
        }
      }

      const aiTeam = generateAITeam(allPokemon, Math.min(3, playerTeam.length));

      // Initialize battle
      const battleEngine = new BattleEngine(playerTeam, aiTeam);
      setBattle(battleEngine);
      setBattleState(battleEngine.getState());
    } catch (error) {
      console.error('Error initializing battle:', error);
      alert('Failed to initialize battle');
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  }

  function handleMoveClick(moveIndex: number) {
    if (!battle || !battleState) return;
    if (battleState.phase !== 'player-turn') return;

    const newState = battle.playerUseMove(moveIndex);
    setBattleState(newState);

    // AI turn
    if (newState.phase === 'ai-turn') {
      setTimeout(() => {
        const aiState = battle.aiTurn();
        setBattleState(aiState);
      }, 1500);
    }
  }

  function handleSwitchPokemon(teamIndex: number) {
    if (!battle || !battleState) return;

    const newState = battle.switchPokemon(teamIndex, 'player');
    setBattleState(newState);
  }

  function handleForfeit() {
    if (!battle) return;

    const confirmed = window.confirm('Are you sure you want to forfeit?');
    if (confirmed) {
      const newState = battle.forfeit('player');
      setBattleState(newState);
    }
  }

  function handleRestart() {
    initializeBattle();
  }

  if (loading || initializing) {
    return <LoadingSpinner />;
  }

  if (!battleState || !battle) {
    return (
      <Container className="text-center mt-5">
        <h2>Failed to initialize battle</h2>
        <Button onClick={() => navigate('/team-builder')}>Back to Team Builder</Button>
      </Container>
    );
  }

  const { playerPokemon, aiPokemon, playerTeam, aiTeam, logs, phase, winner } = battleState;

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
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button
            variant="outline"
            onClick={() => navigate('/team-builder')}
            style={{
              border: `2px solid ${theme.colors.border}`,
              color: theme.colors.textPrimary,
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={18} className="me-2" />
            Back
          </Button>

          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              background: theme.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
            }}
          >
            Pokemon Battle
          </h2>

          <Button
            variant="danger"
            onClick={handleForfeit}
            disabled={phase === 'finished'}
            style={{ fontWeight: 600 }}
          >
            Forfeit
          </Button>
        </div>

        <Row className="g-4">
          {/* Battle Arena */}
          <Col lg={8}>
            {/* AI Pokemon */}
            {aiPokemon && (
              <BattlePokemonCard
                battlePokemon={aiPokemon}
                side="opponent"
                isActive={phase === 'ai-turn'}
              />
            )}

            {/* Battle Field */}
            <div
              className="my-4 p-4 text-center"
              style={{
                background: theme.gradients.secondary,
                borderRadius: '20px',
                border: `3px solid ${theme.colors.border}`,
                minHeight: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {winner ? (
                <div>
                  <h1
                    style={{
                      fontSize: '3rem',
                      fontWeight: 800,
                      color: winner === 'player' ? theme.colors.success : theme.colors.error,
                    }}
                  >
                    {winner === 'player' ? 'Victory!' : 'Defeat!'}
                  </h1>
                  <Button
                    onClick={handleRestart}
                    style={{
                      background: theme.gradients.primary,
                      border: 'none',
                      padding: '12px 30px',
                      fontWeight: 700,
                      marginTop: '20px',
                    }}
                  >
                    Battle Again
                  </Button>
                </div>
              ) : (
                <div>
                  <h3 style={{ color: theme.colors.textPrimary, marginBottom: '10px' }}>
                    {phase === 'player-turn' ? 'Your Turn' : "Opponent's Turn"}
                  </h3>
                  <p style={{ color: theme.colors.textSecondary, fontSize: '1.1rem' }}>
                    {phase === 'player-turn' ? 'Choose your move!' : 'Waiting for opponent...'}
                  </p>
                </div>
              )}
            </div>

            {/* Player Pokemon */}
            {playerPokemon && (
              <BattlePokemonCard
                battlePokemon={playerPokemon}
                side="player"
                isActive={phase === 'player-turn'}
              />
            )}

            {/* Move Selection */}
            {playerPokemon && !winner && phase === 'player-turn' && (
              <Card
                className="mt-3"
                style={{
                  background: theme.colors.bgCard,
                  border: `2px solid ${theme.colors.border}`,
                  borderRadius: '16px',
                }}
              >
                <Card.Body>
                  <h5 style={{ color: theme.colors.textPrimary, marginBottom: '15px' }}>
                    Select Move
                  </h5>
                  <Row className="g-3">
                    {playerPokemon.moves.map((move, idx) => (
                      <Col key={idx} md={6}>
                        <Button
                          onClick={() => handleMoveClick(idx)}
                          disabled={playerPokemon.isFainted}
                          className="w-100"
                          style={{
                            background: typeColors[move.type],
                            border: 'none',
                            padding: '15px',
                            borderRadius: '12px',
                            textAlign: 'left',
                            position: 'relative',
                            boxShadow: `0 4px 15px ${typeColors[move.type]}40`,
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
                                {move.name}
                              </div>
                              <div style={{ fontSize: '0.85rem', opacity: 0.9, color: '#fff' }}>
                                {move.type.toUpperCase()} • {move.category}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', color: '#fff' }}>
                              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                                {move.power}
                              </div>
                              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                                {move.accuracy}% acc
                              </div>
                            </div>
                          </div>
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* Team Overview */}
            <Row className="g-3 mt-3">
              <Col>
                <Card
                  style={{
                    background: theme.colors.bgCard,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '16px',
                  }}
                >
                  <Card.Body>
                    <h6 style={{ color: theme.colors.textPrimary, marginBottom: '15px' }}>
                      Your Team
                    </h6>
                    <div className="d-flex gap-2">
                      {playerTeam.map((p, idx) => (
                        <MiniPokemonCard
                          key={idx}
                          battlePokemon={p}
                          isActive={playerPokemon?.pokemon.id === p.pokemon.id}
                          onClick={() => !p.isFainted && handleSwitchPokemon(idx)}
                        />
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col>
                <Card
                  style={{
                    background: theme.colors.bgCard,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '16px',
                  }}
                >
                  <Card.Body>
                    <h6 style={{ color: theme.colors.textPrimary, marginBottom: '15px' }}>
                      Opponent's Team
                    </h6>
                    <div className="d-flex gap-2">
                      {aiTeam.map((p, idx) => (
                        <MiniPokemonCard
                          key={idx}
                          battlePokemon={p}
                          isActive={aiPokemon?.pokemon.id === p.pokemon.id}
                        />
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>

          {/* Battle Log */}
          <Col lg={4}>
            <Card
              style={{
                background: theme.colors.bgCard,
                border: `2px solid ${theme.colors.border}`,
                borderRadius: '16px',
                height: '800px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Card.Body style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <h5 style={{ color: theme.colors.textPrimary, marginBottom: '15px' }}>
                  Battle Log
                </h5>
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '10px',
                    background: theme.colors.bgSecondary,
                    borderRadius: '12px',
                  }}
                >
                  {logs.map((log, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 12px',
                        marginBottom: '8px',
                        background: theme.colors.bgCard,
                        borderRadius: '8px',
                        borderLeft: `4px solid ${getLogColor(log.type, theme)}`,
                      }}
                    >
                      <div
                        style={{
                          color: theme.colors.textPrimary,
                          fontSize: '0.9rem',
                          fontWeight: log.type === 'info' ? 600 : 700,
                        }}
                      >
                        {log.message}
                      </div>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

interface BattlePokemonCardProps {
  battlePokemon: BattlePokemon;
  side: 'player' | 'opponent';
  isActive: boolean;
}

function BattlePokemonCard({ battlePokemon, side, isActive }: BattlePokemonCardProps) {
  const { theme } = useThemeStore();
  const { pokemon, currentHP, maxHP, isFainted } = battlePokemon;

  const hpPercentage = (currentHP / maxHP) * 100;
  const hpColor =
    hpPercentage > 50
      ? theme.colors.success
      : hpPercentage > 25
      ? theme.colors.warning
      : theme.colors.error;

  return (
    <Card
      style={{
        background: theme.colors.bgCard,
        border: `3px solid ${isActive ? theme.colors.primary : theme.colors.border}`,
        borderRadius: '20px',
        marginBottom: '20px',
        opacity: isFainted ? 0.5 : 1,
        boxShadow: isActive ? `0 0 30px ${theme.colors.primary}40` : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <Card.Body>
        <Row className="align-items-center">
          <Col xs={4} className="text-center">
            <img
              src={pokemon.artwork || pokemon.sprite}
              alt={pokemon.name}
              style={{
                width: '150px',
                height: '150px',
                objectFit: 'contain',
                filter: isFainted ? 'grayscale(100%)' : 'none',
                transform: side === 'opponent' ? 'scaleX(-1)' : 'none',
              }}
            />
          </Col>
          <Col xs={8}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h4
                style={{
                  color: theme.colors.textPrimary,
                  fontWeight: 800,
                  textTransform: 'capitalize',
                  margin: 0,
                }}
              >
                {pokemon.name}
              </h4>
              <Badge
                bg="secondary"
                style={{
                  background: theme.colors.bgSecondary,
                  color: theme.colors.textSecondary,
                  fontSize: '0.9rem',
                  padding: '6px 12px',
                }}
              >
                Lv. 50
              </Badge>
            </div>

            <div className="d-flex gap-2 mb-3">
              {pokemon.types.map((type) => (
                <Badge
                  key={type}
                  style={{
                    background: typeColors[type],
                    fontSize: '0.85rem',
                    padding: '6px 14px',
                    textTransform: 'uppercase',
                  }}
                >
                  {type}
                </Badge>
              ))}
            </div>

            <div className="mb-2">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="d-flex align-items-center gap-2">
                  <Heart size={16} style={{ color: theme.colors.error }} />
                  <span style={{ color: theme.colors.textSecondary, fontWeight: 600 }}>
                    HP
                  </span>
                </div>
                <span
                  style={{
                    color: theme.colors.textPrimary,
                    fontWeight: 800,
                  }}
                >
                  {currentHP} / {maxHP}
                </span>
              </div>
              <ProgressBar
                now={hpPercentage}
                style={{
                  height: '20px',
                  borderRadius: '10px',
                  background: theme.colors.bgSecondary,
                }}
                variant=""
              >
                <div
                  style={{
                    width: `${hpPercentage}%`,
                    background: hpColor,
                    borderRadius: '10px',
                    transition: 'width 0.5s ease, background 0.3s ease',
                  }}
                />
              </ProgressBar>
            </div>

            {isFainted && (
              <Alert variant="danger" className="mt-2 mb-0" style={{ fontSize: '0.9rem' }}>
                <strong>Fainted!</strong>
              </Alert>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

interface MiniPokemonCardProps {
  battlePokemon: BattlePokemon;
  isActive: boolean;
  onClick?: () => void;
}

function MiniPokemonCard({ battlePokemon, isActive, onClick }: MiniPokemonCardProps) {
  const { theme } = useThemeStore();
  const { pokemon, currentHP, maxHP, isFainted } = battlePokemon;

  const hpPercentage = (currentHP / maxHP) * 100;

  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        background: theme.colors.bgSecondary,
        border: `2px solid ${isActive ? theme.colors.primary : theme.colors.border}`,
        borderRadius: '12px',
        padding: '10px',
        textAlign: 'center',
        cursor: onClick && !isFainted ? 'pointer' : 'default',
        opacity: isFainted ? 0.4 : 1,
        transition: 'all 0.2s ease',
      }}
    >
      <img
        src={pokemon.sprite}
        alt={pokemon.name}
        style={{
          width: '50px',
          height: '50px',
          objectFit: 'contain',
          filter: isFainted ? 'grayscale(100%)' : 'none',
        }}
      />
      <div
        style={{
          fontSize: '0.75rem',
          color: theme.colors.textPrimary,
          fontWeight: 600,
          textTransform: 'capitalize',
          marginTop: '5px',
        }}
      >
        {pokemon.name.slice(0, 8)}
      </div>
      <div
        style={{
          width: '100%',
          height: '4px',
          background: theme.colors.bgTertiary,
          borderRadius: '2px',
          marginTop: '5px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${hpPercentage}%`,
            height: '100%',
            background: hpPercentage > 50 ? theme.colors.success : hpPercentage > 25 ? theme.colors.warning : theme.colors.error,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}

function getLogColor(type: string, theme: any): string {
  switch (type) {
    case 'damage':
      return theme.colors.error;
    case 'effectiveness':
      return theme.colors.warning;
    case 'critical':
      return theme.colors.accent2;
    case 'faint':
      return theme.colors.textMuted;
    default:
      return theme.colors.primary;
  }
}
