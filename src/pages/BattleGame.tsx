import { useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, ProgressBar, Badge, Alert } from 'react-bootstrap';
import { Swords, Shield, Package, ArrowLeftRight, Zap, Heart } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useTeamStore } from '../store/teamStore';
import { BattleState, BattlePokemon, BattleAction } from '../types/battle';
import { Pokemon, Move } from '../types/pokemon';
import { generateAITeam } from '../services/aiTeamGenerator';
import { getAIAction } from '../services/battleAI';
import { calculateDamage, applyDamage, healPokemon, cureStatus, processEndOfTurn, checkBattleEnd, getSpeedOrder } from '../services/battleEngine';
import { STARTER_ITEMS, ALL_ITEMS } from '../data/items';
import { typeColors } from '../styles/themes';
import MovesetSelector from '../components/MovesetSelector';
import '../styles/battle-animations.css';

export default function BattleGame() {
  const { theme } = useThemeStore();
  const { team } = useTeamStore();

  const [gameState, setGameState] = useState<'menu' | 'team-select' | 'moveset-select' | 'battle' | 'ended'>('menu');
  const [selectedForBattle, setSelectedForBattle] = useState<number[]>([]);
  const [currentMovesetIndex, setCurrentMovesetIndex] = useState(0);
  const [teamWithMovesets, setTeamWithMovesets] = useState<Pokemon[]>([]);

  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  const [showMoveSelect, setShowMoveSelect] = useState(false);
  const [showWeaknessPanel, setShowWeaknessPanel] = useState(false);

  const [animations, setAnimations] = useState<{
    playerAttack: boolean;
    aiAttack: boolean;
    playerDamage: boolean;
    aiDamage: boolean;
    damageNumber: { value: number; x: number; y: number; isCritical: boolean } | null;
    effectText: string | null;
  }>({
    playerAttack: false,
    aiAttack: false,
    playerDamage: false,
    aiDamage: false,
    damageNumber: null,
    effectText: null,
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Start game
  const startGame = () => {
    if (team.length < 6) {
      alert('You need a full team of 6 Pokemon!');
      return;
    }
    setGameState('team-select');
    setSelectedForBattle([]);
  };

  // Confirm team selection (4 from 6)
  const confirmTeamSelection = () => {
    if (selectedForBattle.length !== 4) {
      alert('Select exactly 4 Pokemon!');
      return;
    }

    const selected = selectedForBattle.map(i => team[i]);
    setTeamWithMovesets(selected);
    setCurrentMovesetIndex(0);
    setGameState('moveset-select');
  };

  // Handle moveset confirmation for one Pokemon
  const handleMovesetConfirm = (moves: Move[]) => {
    const updated = [...teamWithMovesets];
    updated[currentMovesetIndex] = {
      ...updated[currentMovesetIndex],
      moves: moves
    };
    setTeamWithMovesets(updated);

    if (currentMovesetIndex < 3) {
      setCurrentMovesetIndex(currentMovesetIndex + 1);
    } else {
      // All movesets selected, start battle!
      initializeBattle(updated);
    }
  };

  // Initialize battle
  const initializeBattle = async (playerPokemon: Pokemon[]) => {
    // Convert to BattlePokemon
    const playerTeamBattle = playerPokemon.map(p => convertToBattlePokemon(p));

    // Generate AI team
    const aiPokemon = await generateAITeam(playerPokemon);
    const aiSelected = aiPokemon.slice(0, 4);

    // Set active Pokemon
    playerTeamBattle[0].isActive = true;
    aiSelected[0].isActive = true;

    const initialState: BattleState = {
      playerTeam: {
        pokemon: playerTeamBattle,
        selectedForBattle: playerTeamBattle,
        items: [...STARTER_ITEMS],
        remainingPokemon: 4
      },
      aiTeam: {
        pokemon: aiPokemon,
        selectedForBattle: aiSelected,
        items: [],
        remainingPokemon: 4
      },
      currentTurn: 1,
      battleLog: [
        '⚔️ Battle Start!',
        `Go! ${playerTeamBattle[0].name}!`,
        `Opponent sent out ${aiSelected[0].name}!`
      ],
      isPlayerTurn: true,
      battleEnded: false,
      format: 'vgc'
    };

    setBattleState(initialState);
    setBattleLog(initialState.battleLog);
    setGameState('battle');
  };

  const convertToBattlePokemon = (pokemon: Pokemon): BattlePokemon => {
    const level = 50;
    const maxHp = Math.floor(((2 * pokemon.stats.hp + 31 + 63) * level) / 100) + level + 10;

    return {
      ...pokemon,
      currentHp: maxHp,
      maxHp,
      level,
      status: { name: null },
      statStages: {
        attack: 0,
        defense: 0,
        specialAttack: 0,
        specialDefense: 0,
        speed: 0,
        accuracy: 0,
        evasion: 0
      },
      selectedMoves: pokemon.moves.slice(0, 4),
      isActive: false,
      isFainted: false
    };
  };

  // Calculate type effectiveness for UI display
  const getEffectivenessMultiplier = (moveType: string, defenderTypes: string[]): number => {
    // Simplified - would use full type chart
    let mult = 1;
    defenderTypes.forEach(type => {
      // Add actual type chart here
      if (moveType === 'fire' && type === 'grass') mult *= 2;
      if (moveType === 'water' && type === 'fire') mult *= 2;
      if (moveType === 'grass' && type === 'water') mult *= 2;
      if (moveType === 'electric' && type === 'water') mult *= 2;
      // ... etc
    });
    return mult;
  };

  // Handle move selection with visual feedback
  const handleMoveSelect = (moveIndex: number) => {
    if (!battleState || isProcessing) return;

    setShowMoveSelect(false);
    setIsProcessing(true);

    const playerAction: BattleAction = {
      type: 'move',
      pokemonIndex: 0,
      moveIndex,
      targetIndex: 0
    };

    processTurn(playerAction);
  };

  const processTurn = (playerAction: BattleAction) => {
    if (!battleState) return;

    setTimeout(async () => {
      const newState = { ...battleState };
      const logs: string[] = [];

      // Get AI action
      const aiDecision = getAIAction(newState.aiTeam, newState.playerTeam);

      const playerActive = newState.playerTeam.selectedForBattle.find(p => p.isActive)!;
      const aiActive = newState.aiTeam.selectedForBattle.find(p => p.isActive)!;

      // Determine speed order
      const [first] = getSpeedOrder(playerActive, aiActive);
      const firstAction = first === playerActive ? playerAction : aiDecision.action;
      const secondAction = first === playerActive ? aiDecision.action : playerAction;
      const firstIsPlayer = first === playerActive;

      // Execute first action with animation
      await executeActionWithAnimation(firstAction, firstIsPlayer, newState, logs);

      if (!checkBattleEnd(newState)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await executeActionWithAnimation(secondAction, !firstIsPlayer, newState, logs);
      }

      // End of turn effects
      const endTurnLogs = processEndOfTurn(newState);
      logs.push(...endTurnLogs);

      checkBattleEnd(newState);

      if (newState.battleEnded) {
        setGameState('ended');
      }

      newState.currentTurn++;
      newState.battleLog.push(...logs);

      setBattleState(newState);
      setBattleLog([...newState.battleLog]);
      setIsProcessing(false);
    }, 500);
  };

  const executeActionWithAnimation = async (
    action: BattleAction,
    isPlayer: boolean,
    state: BattleState,
    logs: string[]
  ) => {
    const actingTeam = isPlayer ? state.playerTeam : state.aiTeam;
    const targetTeam = isPlayer ? state.aiTeam : state.playerTeam;

    if (action.type === 'move') {
      const attacker = actingTeam.selectedForBattle.find(p => p.isActive)!;
      const defender = targetTeam.selectedForBattle.find(p => p.isActive)!;
      const move = attacker.selectedMoves[action.moveIndex!];

      // Attack animation
      setAnimations(prev => ({
        ...prev,
        [isPlayer ? 'playerAttack' : 'aiAttack']: true
      }));

      await new Promise(resolve => setTimeout(resolve, 300));

      const damageCalc = calculateDamage(attacker, defender, move);
      logs.push(damageCalc.description);

      // Damage animation
      setAnimations(prev => ({
        ...prev,
        [isPlayer ? 'aiDamage' : 'playerDamage']: true,
        damageNumber: {
          value: damageCalc.damage,
          x: isPlayer ? 70 : 30,
          y: 40,
          isCritical: damageCalc.isCritical
        },
        effectText: damageCalc.effectiveness > 1
          ? "Super Effective!"
          : damageCalc.effectiveness < 1 && damageCalc.effectiveness > 0
          ? "Not very effective..."
          : null
      }));

      await new Promise(resolve => setTimeout(resolve, 800));

      applyDamage(defender, damageCalc.damage);

      if (defender.isFainted) {
        logs.push(`${defender.name} fainted!`);

        const nextPokemon = targetTeam.selectedForBattle.find(p => !p.isFainted && !p.isActive);
        if (nextPokemon) {
          defender.isActive = false;
          nextPokemon.isActive = true;
          logs.push(`${isPlayer ? 'Opponent' : 'You'} sent out ${nextPokemon.name}!`);
        }
      }

      // Reset animations
      setAnimations({
        playerAttack: false,
        aiAttack: false,
        playerDamage: false,
        aiDamage: false,
        damageNumber: null,
        effectText: null
      });
    } else if (action.type === 'switch') {
      const current = actingTeam.selectedForBattle.find(p => p.isActive)!;
      const switchTo = actingTeam.selectedForBattle[action.switchToIndex!];

      current.isActive = false;
      switchTo.isActive = true;

      logs.push(`${isPlayer ? 'You' : 'Opponent'} switched to ${switchTo.name}!`);
    } else if (action.type === 'item' && isPlayer) {
      const item = ALL_ITEMS.find(i => i.id === action.itemId);
      const target = actingTeam.selectedForBattle[action.targetIndex || 0];

      if (item) {
        if (item.category === 'healing') {
          const healed = healPokemon(target, item.power || 0);
          logs.push(`Used ${item.name}! ${target.name} restored ${healed} HP!`);
        } else if (item.category === 'status') {
          cureStatus(target);
          logs.push(`Used ${item.name}! ${target.name}'s status was cured!`);
        }

        const itemIndex = actingTeam.items.findIndex(i => i.id === item.id);
        if (itemIndex !== -1) {
          actingTeam.items.splice(itemIndex, 1);
        }
      }
    }
  };

  if (gameState === 'menu') {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.bgPrimary}, ${theme.colors.bgSecondary})`,
          minHeight: '100vh',
        }}
      >
        <Card
          className="text-center p-5 slide-in-left"
          style={{
            background: theme.colors.bgCard,
            border: `2px solid ${theme.colors.primary}`,
            borderRadius: '24px',
            maxWidth: '600px',
            boxShadow: `0 20px 60px ${theme.colors.shadow}`,
          }}
        >
          <div className="mb-4">
            <h1
              style={{
                fontSize: '3rem',
                fontWeight: 900,
                background: theme.gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '16px',
              }}
            >
              ⚔️ POKEMON CHAMPIONS ⚔️
            </h1>
            <p style={{ color: theme.colors.textSecondary, fontSize: '1.2rem' }}>
              VGC Battle System
            </p>
          </div>

          <div className="mb-4" style={{ color: theme.colors.textPrimary }}>
            <p><Zap className="me-2" size={20} />Complete battle animations</p>
            <p><Swords className="me-2" size={20} />Real-time damage calculation</p>
            <p><Shield className="me-2" size={20} />Type effectiveness indicators</p>
            <p><Heart className="me-2" size={20} />Items & status effects</p>
          </div>

          <Button
            size="lg"
            onClick={startGame}
            disabled={team.length < 6}
            style={{
              background: theme.gradients.primary,
              border: 'none',
              padding: '18px 50px',
              fontSize: '1.3rem',
              fontWeight: 700,
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
            }}
          >
            {team.length < 6 ? 'Need 6 Pokemon to Battle' : 'START BATTLE'}
          </Button>

          {team.length < 6 && (
            <Alert variant="warning" className="mt-4">
              Go to Team Builder and add {6 - team.length} more Pokemon!
            </Alert>
          )}
        </Card>
      </div>
    );
  }

  if (gameState === 'team-select') {
    return (
      <Container className="py-5">
        <Card style={{ background: theme.colors.bgCard, border: `2px solid ${theme.colors.border}`, borderRadius: '16px' }}>
          <Card.Header style={{ background: theme.colors.bgTertiary, borderBottom: `2px solid ${theme.colors.border}` }}>
            <h3 style={{ color: theme.colors.textPrimary, margin: 0 }}>
              Select 4 Pokemon for Battle ({selectedForBattle.length}/4)
            </h3>
          </Card.Header>
          <Card.Body>
            <Row xs={2} md={3} lg={6} className="g-3 mb-4">
              {team.map((pokemon, index) => {
                const isSelected = selectedForBattle.includes(index);
                return (
                  <Col key={pokemon.id}>
                    <Card
                      onClick={() => {
                        if (isSelected) {
                          setSelectedForBattle(selectedForBattle.filter(i => i !== index));
                        } else if (selectedForBattle.length < 4) {
                          setSelectedForBattle([...selectedForBattle, index]);
                        }
                      }}
                      style={{
                        background: isSelected ? theme.colors.primary : theme.colors.bgTertiary,
                        border: `3px solid ${isSelected ? theme.colors.primary : theme.colors.border}`,
                        cursor: 'pointer',
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.3s ease',
                      }}
                      className="text-center p-3 card-hover"
                    >
                      <img
                        src={pokemon.artwork || pokemon.sprite}
                        alt={pokemon.name}
                        style={{ width: '100%', height: 'auto', maxWidth: '120px', margin: '0 auto' }}
                      />
                      <h6 style={{ color: isSelected ? '#FFFFFF' : theme.colors.textPrimary, marginTop: '8px', textTransform: 'capitalize' }}>
                        {pokemon.name}
                      </h6>
                      <div className="d-flex gap-1 justify-content-center flex-wrap">
                        {pokemon.types.map(type => (
                          <Badge key={type} style={{ background: typeColors[type], fontSize: '0.7rem' }}>
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            <div className="text-center">
              <Button
                size="lg"
                onClick={confirmTeamSelection}
                disabled={selectedForBattle.length !== 4}
                style={{
                  background: theme.gradients.primary,
                  border: 'none',
                  padding: '15px 40px',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                }}
              >
                Continue ({selectedForBattle.length}/4)
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (gameState === 'moveset-select') {
    const currentPokemon = teamWithMovesets[currentMovesetIndex];

    return (
      <Container className="py-5">
        <Alert variant="info" className="text-center mb-4">
          <strong>Step {currentMovesetIndex + 1} of 4:</strong> Select moves for {currentPokemon.name}
        </Alert>

        <MovesetSelector
          pokemon={currentPokemon}
          onConfirm={handleMovesetConfirm}
          show={true}
          onHide={() => {}}
        />
      </Container>
    );
  }

  // BATTLE SCREEN - The actual game!
  if (gameState === 'battle' && battleState) {
    const playerActive = battleState.playerTeam.selectedForBattle.find(p => p.isActive);
    const aiActive = battleState.aiTeam.selectedForBattle.find(p => p.isActive);

    return (
      <div style={{ background: theme.colors.bgPrimary, minHeight: '100vh', paddingTop: '20px' }}>
        <style>{`
          @import url('/src/styles/battle-animations.css');
        `}</style>

        <Container fluid>
          {/* Battle Field */}
          <div className="battle-field mb-4" style={{ position: 'relative', minHeight: '500px' }}>
            {/* AI Pokemon (Top) */}
            <Row className="mb-5">
              <Col md={{ span: 4, offset: 8 }} className="text-end">
                <div className="slide-in-right">
                  <div style={{ display: 'inline-block', position: 'relative' }}>
                    <img
                      src={aiActive?.sprite}
                      alt={aiActive?.name}
                      className={`sprite-float ${animations.aiAttack ? 'attack-special-anim' : ''} ${animations.aiDamage ? 'sprite-damage sprite-shake' : ''}`}
                      style={{ width: '180px', height: '180px', imageRendering: 'pixelated', filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.3))' }}
                    />
                    <div className="pokemon-platform"></div>
                  </div>

                  <Card style={{ background: 'rgba(0,0,0,0.7)', border: 'none', marginTop: '16px', backdropFilter: 'blur(10px)' }}>
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <h4 style={{ color: '#FFFFFF', margin: 0, textTransform: 'capitalize' }}>
                            {aiActive?.name}
                            <Badge bg="danger" className="ms-2">Lv{aiActive?.level}</Badge>
                          </h4>
                          <div className="d-flex gap-1 mt-1">
                            {aiActive?.types.map(type => (
                              <Badge key={type} style={{ background: typeColors[type] }}>{type}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div style={{ position: 'relative' }}>
                        <small style={{ color: '#FFFFFF' }}>
                          HP: {aiActive?.currentHp}/{aiActive?.maxHp}
                        </small>
                        <ProgressBar
                          now={(aiActive!.currentHp / aiActive!.maxHp) * 100}
                          variant={
                            (aiActive!.currentHp / aiActive!.maxHp) > 0.5
                              ? 'success'
                              : (aiActive!.currentHp / aiActive!.maxHp) > 0.2
                              ? 'warning'
                              : 'danger'
                          }
                          style={{ height: '24px', fontSize: '1rem', fontWeight: 'bold' }}
                          className={animations.aiDamage ? 'hp-bar-decrease' : ''}
                        />
                      </div>

                      {aiActive?.status.name && (
                        <Badge className={`status-icon status-${aiActive.status.name} mt-2`}>
                          {aiActive.status.name.toUpperCase()}
                        </Badge>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              </Col>
            </Row>

            {/* Damage Numbers & Effects */}
            {animations.damageNumber && (
              <div
                className={`damage-number ${animations.damageNumber.isCritical ? 'damage-critical' : ''}`}
                style={{
                  left: `${animations.damageNumber.x}%`,
                  top: `${animations.damageNumber.y}%`,
                }}
              >
                {animations.damageNumber.isCritical && '☆ '}{animations.damageNumber.value}{animations.damageNumber.isCritical && ' ☆'}
              </div>
            )}

            {animations.effectText && (
              <div
                className="battle-text-popup"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: animations.effectText.includes('Super') ? '#ff4444' : '#888888',
                  fontSize: '3rem',
                }}
              >
                {animations.effectText}
              </div>
            )}

            {/* Player Pokemon (Bottom) */}
            <Row>
              <Col md={{ span: 4 }}>
                <div className="slide-in-left">
                  <Card style={{ background: 'rgba(0,0,0,0.7)', border: 'none', backdropFilter: 'blur(10px)' }}>
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <h4 style={{ color: '#FFFFFF', margin: 0, textTransform: 'capitalize' }}>
                            {playerActive?.name}
                            <Badge bg="primary" className="ms-2">Lv{playerActive?.level}</Badge>
                          </h4>
                          <div className="d-flex gap-1 mt-1">
                            {playerActive?.types.map(type => (
                              <Badge key={type} style={{ background: typeColors[type] }}>{type}</Badge>
                            ))}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline-light"
                          onClick={() => setShowWeaknessPanel(!showWeaknessPanel)}
                        >
                          <Shield size={16} /> Weaknesses
                        </Button>
                      </div>

                      {showWeaknessPanel && playerActive && (
                        <Alert variant="dark" className="mt-2 mb-2" style={{ fontSize: '0.85rem' }}>
                          <strong>Weak to:</strong>{' '}
                          {playerActive.typeEffectiveness.weakTo.map(type => (
                            <Badge key={type} style={{ background: typeColors[type], marginRight: '4px' }}>
                              {type} 2x
                            </Badge>
                          ))}
                          {playerActive.typeEffectiveness.doubleWeakTo.map(type => (
                            <Badge key={type} style={{ background: typeColors[type], marginRight: '4px' }}>
                              {type} 4x
                            </Badge>
                          ))}
                          <br />
                          <strong>Resists:</strong>{' '}
                          {playerActive.typeEffectiveness.resistantTo.map(type => (
                            <Badge key={type} bg="success" style={{ marginRight: '4px' }}>
                              {type}
                            </Badge>
                          ))}
                        </Alert>
                      )}

                      <div style={{ position: 'relative' }}>
                        <small style={{ color: '#FFFFFF' }}>
                          HP: {playerActive?.currentHp}/{playerActive?.maxHp}
                        </small>
                        <ProgressBar
                          now={(playerActive!.currentHp / playerActive!.maxHp) * 100}
                          variant={
                            (playerActive!.currentHp / playerActive!.maxHp) > 0.5
                              ? 'success'
                              : (playerActive!.currentHp / playerActive!.maxHp) > 0.2
                              ? 'warning'
                              : 'danger'
                          }
                          style={{ height: '24px', fontSize: '1rem', fontWeight: 'bold' }}
                          className={animations.playerDamage ? 'hp-bar-decrease' : ''}
                        />
                      </div>

                      {playerActive?.status.name && (
                        <Badge className={`status-icon status-${playerActive.status.name} mt-2`}>
                          {playerActive.status.name.toUpperCase()}
                        </Badge>
                      )}

                      {playerActive?.heldItem && (
                        <Badge bg="info" className="mt-2 ms-2">
                          📦 {playerActive.heldItem.name}
                        </Badge>
                      )}
                    </Card.Body>
                  </Card>

                  <div style={{ display: 'inline-block', position: 'relative', marginTop: '16px' }}>
                    <img
                      src={playerActive?.sprite}
                      alt={playerActive?.name}
                      className={`sprite-float ${animations.playerAttack ? 'attack-physical-anim' : ''} ${animations.playerDamage ? 'sprite-damage sprite-shake' : ''}`}
                      style={{ width: '180px', height: '180px', imageRendering: 'pixelated', filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.3))' }}
                    />
                    <div className="pokemon-platform"></div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {/* Battle Controls */}
          <Row>
            <Col md={6}>
              <Card
                style={{
                  background: theme.colors.bgCard,
                  border: `2px solid ${theme.colors.border}`,
                  maxHeight: '280px',
                  overflow: 'auto',
                }}
              >
                <Card.Header style={{ background: theme.colors.bgTertiary, position: 'sticky', top: 0, zIndex: 10 }}>
                  <strong>Battle Log - Turn {battleState.currentTurn}</strong>
                </Card.Header>
                <Card.Body>
                  {battleLog.slice(-12).map((log, i) => (
                    <div key={i} style={{ color: theme.colors.textPrimary, marginBottom: '6px', fontSize: '0.95rem' }}>
                      ▸ {log}
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <div className="d-grid gap-3">
                <Button
                  size="lg"
                  disabled={isProcessing}
                  onClick={() => setShowMoveSelect(true)}
                  style={{
                    background: 'linear-gradient(135deg, #ff4444, #cc0000)',
                    border: 'none',
                    padding: '20px',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                  }}
                >
                  <Swords size={24} className="me-2" />
                  FIGHT
                </Button>

                <Row className="g-3">
                  <Col>
                    <Button
                      size="lg"
                      disabled
                      variant="success"
                      className="w-100"
                      style={{ padding: '15px', fontSize: '1.1rem', fontWeight: 600 }}
                    >
                      <Package size={20} className="me-2" />
                      ITEMS ({battleState.playerTeam.items.length})
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      size="lg"
                      disabled
                      variant="info"
                      className="w-100"
                      style={{ padding: '15px', fontSize: '1.1rem', fontWeight: 600 }}
                    >
                      <ArrowLeftRight size={20} className="me-2" />
                      SWITCH
                    </Button>
                  </Col>
                </Row>

                <div className="text-center mt-2" style={{ color: theme.colors.textSecondary }}>
                  <small>
                    Team: {battleState.playerTeam.selectedForBattle.filter(p => !p.isFainted).length}/4 |
                    Opponent: {battleState.aiTeam.selectedForBattle.filter(p => !p.isFainted).length}/4
                  </small>
                </div>
              </div>
            </Col>
          </Row>
        </Container>

        {/* Move Selection Modal with Type Effectiveness */}
        <Modal show={showMoveSelect} onHide={() => setShowMoveSelect(false)} centered size="lg">
          <Modal.Header closeButton style={{ background: theme.colors.bgCard }}>
            <Modal.Title style={{ color: theme.colors.textPrimary }}>
              Select Move - {playerActive?.name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: theme.colors.bgCard }}>
            <div className="d-grid gap-3">
              {playerActive?.selectedMoves.map((move, index) => {
                const effectiveness = getEffectivenessMultiplier(move.type, aiActive?.types || []);
                let effectBadge = null;

                if (effectiveness >= 2) {
                  effectBadge = <Badge className="effectiveness-badge effectiveness-super">SUPER EFFECTIVE!</Badge>;
                } else if (effectiveness === 0) {
                  effectBadge = <Badge className="effectiveness-badge effectiveness-immune">NO EFFECT</Badge>;
                } else if (effectiveness < 1) {
                  effectBadge = <Badge className="effectiveness-badge effectiveness-not">Not Very Effective</Badge>;
                } else {
                  effectBadge = <Badge className="effectiveness-badge effectiveness-normal">NORMAL</Badge>;
                }

                const hasSTAB = playerActive.types.includes(move.type);

                return (
                  <Button
                    key={index}
                    onClick={() => handleMoveSelect(index)}
                    style={{
                      background: `linear-gradient(135deg, ${typeColors[move.type]}, ${typeColors[move.type]}CC)`,
                      border: 'none',
                      padding: '20px',
                      textAlign: 'left',
                    }}
                    className="card-hover"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong style={{ fontSize: '1.2rem' }}>{move.name}</strong>
                        {hasSTAB && <Badge bg="warning" text="dark" className="ms-2">STAB 1.5x</Badge>}
                        {effectBadge}
                        <br />
                        <small>
                          {move.category === 'physical' ? '⚔️ Physical' : '✨ Special'} |
                          Power: {move.power || '-'} |
                          Accuracy: {move.accuracy || '-'}%
                        </small>
                      </div>
                      <Badge bg="dark" style={{ fontSize: '1rem', padding: '8px 12px' }}>
                        {move.type.toUpperCase()}
                      </Badge>
                    </div>
                  </Button>
                );
              })}
            </div>
          </Modal.Body>
        </Modal>

        {/* Items & Switch modals (same as before but styled) */}
        {/* ... other modals ... */}
      </div>
    );
  }

  // Victory/Defeat Screen
  if (gameState === 'ended' && battleState) {
    const playerWon = battleState.winner === 'player';

    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          background: `linear-gradient(135deg, ${playerWon ? '#4CAF50' : '#F44336'}, ${theme.colors.bgPrimary})`,
          minHeight: '100vh',
        }}
      >
        <Card
          className="text-center p-5 bounce-in"
          style={{
            background: theme.colors.bgCard,
            border: `4px solid ${playerWon ? '#4CAF50' : '#F44336'}`,
            borderRadius: '24px',
            maxWidth: '500px',
          }}
        >
          <h1 style={{ fontSize: '4rem', marginBottom: '20px' }}>
            {playerWon ? '🏆' : '💀'}
          </h1>
          <h2 style={{ color: theme.colors.textPrimary, fontWeight: 900, fontSize: '2.5rem' }}>
            {playerWon ? 'VICTORY!' : 'DEFEAT!'}
          </h2>
          <p style={{ color: theme.colors.textSecondary, fontSize: '1.2rem', marginTop: '16px' }}>
            {playerWon
              ? 'You are a Pokemon Champion!'
              : 'Better luck next time, Trainer!'}
          </p>

          <Button
            size="lg"
            onClick={() => {
              setGameState('menu');
              setBattleState(null);
              setSelectedForBattle([]);
            }}
            style={{
              background: theme.gradients.primary,
              border: 'none',
              padding: '15px 40px',
              fontSize: '1.2rem',
              fontWeight: 700,
              marginTop: '24px',
            }}
          >
            NEW BATTLE
          </Button>
        </Card>
      </div>
    );
  }

  return null;
}
