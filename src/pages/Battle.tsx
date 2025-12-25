import { useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, ProgressBar, Badge, Alert } from 'react-bootstrap';
import { Swords, ArrowLeftRight, Package } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useTeamStore } from '../store/teamStore';
import { BattleState, BattlePokemon, BattleAction } from '../types/battle';
import { generateAITeam } from '../services/aiTeamGenerator';
import { getAIAction } from '../services/battleAI';
import { calculateDamage, applyDamage, healPokemon, cureStatus, processEndOfTurn, checkBattleEnd, getSpeedOrder } from '../services/battleEngine';
import { STARTER_ITEMS, ALL_ITEMS } from '../data/items';
import { typeColors } from '../styles/themes';
import { Pokemon } from '../types/pokemon';

export default function Battle() {
  const { theme } = useThemeStore();
  const { team } = useTeamStore();

  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [showTeamSelect, setShowTeamSelect] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<number[]>([]);
  const [showMoveSelect, setShowMoveSelect] = useState(false);
  const [showItemSelect, setShowItemSelect] = useState(false);
  const [showSwitchSelect, setShowSwitchSelect] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize battle
  const startBattle = async () => {
    if (team.length < 6) {
      alert('You need a full team of 6 Pokemon to battle!');
      return;
    }

    setShowTeamSelect(true);
  };

  const confirmTeamSelection = async () => {
    if (selectedPokemon.length !== 4) {
      alert('Select exactly 4 Pokemon for VGC format!');
      return;
    }

    setShowTeamSelect(false);

    // Convert to BattlePokemon
    const playerBattlePokemon = selectedPokemon.map(index => convertToBattlePokemon(team[index]));

    // Generate AI team
    const aiPokemon = await generateAITeam(team);

    // AI also selects 4 from 6
    const aiSelected = selectAITeam(aiPokemon);

    // Set first pokemon as active
    playerBattlePokemon[0].isActive = true;
    aiSelected[0].isActive = true;

    const initialState: BattleState = {
      playerTeam: {
        pokemon: playerBattlePokemon,
        selectedForBattle: playerBattlePokemon,
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
      battleLog: ['Battle started!', `Go! ${playerBattlePokemon[0].name}!`, `Opponent sent out ${aiSelected[0].name}!`],
      isPlayerTurn: true,
      battleEnded: false,
      format: 'vgc'
    };

    setBattleState(initialState);
    setBattleLog(initialState.battleLog);
  };

  const selectAITeam = (fullTeam: BattlePokemon[]): BattlePokemon[] => {
    // AI intelligently selects 4 from 6
    // Prioritize type coverage and synergy
    const scores = fullTeam.map((p, index) => ({
      index,
      score: p.stats.total + Math.random() * 100 // Add randomness
    }));

    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, 4).map(s => fullTeam[s.index]);
  };

  const convertToBattlePokemon = (pokemon: Pokemon): BattlePokemon => {
    const level = 50;
    const maxHp = Math.floor(((2 * pokemon.stats.hp + 31 + 63) * level) / 100) + level + 10;

    const selectedMoves = pokemon.moves.filter(m => m.power).slice(0, 4);

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
      selectedMoves,
      isActive: false,
      isFainted: false
    };
  };

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

  const handleItemUse = (itemId: string, targetIndex: number) => {
    if (!battleState || isProcessing) return;

    setShowItemSelect(false);
    setIsProcessing(true);

    const playerAction: BattleAction = {
      type: 'item',
      pokemonIndex: 0,
      itemId,
      targetIndex
    };

    processTurn(playerAction);
  };

  const handleSwitch = (switchToIndex: number) => {
    if (!battleState || isProcessing) return;

    setShowSwitchSelect(false);
    setIsProcessing(true);

    const playerAction: BattleAction = {
      type: 'switch',
      pokemonIndex: 0,
      switchToIndex
    };

    processTurn(playerAction);
  };

  const processTurn = (playerAction: BattleAction) => {
    if (!battleState) return;

    setTimeout(() => {
      const newState = { ...battleState };
      const logs: string[] = [];

      // Get AI action
      const aiDecision = getAIAction(newState.aiTeam, newState.playerTeam);
      logs.push(`AI: ${aiDecision.reasoning}`);

      // Execute actions based on speed
      const playerActive = newState.playerTeam.selectedForBattle.find(p => p.isActive)!;
      const aiActive = newState.aiTeam.selectedForBattle.find(p => p.isActive)!;

      const [first] = getSpeedOrder(playerActive, aiActive);
      const firstAction = first === playerActive ? playerAction : aiDecision.action;
      const secondAction = first === playerActive ? aiDecision.action : playerAction;
      const firstIsPlayer = first === playerActive;

      // Execute first action
      executeAction(firstAction, firstIsPlayer, newState, logs);

      // Check if battle ended
      if (!checkBattleEnd(newState)) {
        // Execute second action
        executeAction(secondAction, !firstIsPlayer, newState, logs);
      }

      // End of turn effects
      const endTurnLogs = processEndOfTurn(newState);
      logs.push(...endTurnLogs);

      // Check battle end
      checkBattleEnd(newState);

      newState.currentTurn++;
      newState.battleLog.push(...logs);

      setBattleState(newState);
      setBattleLog([...newState.battleLog]);
      setIsProcessing(false);
    }, 1000);
  };

  const executeAction = (action: BattleAction, isPlayer: boolean, state: BattleState, logs: string[]) => {
    const actingTeam = isPlayer ? state.playerTeam : state.aiTeam;
    const targetTeam = isPlayer ? state.aiTeam : state.playerTeam;

    if (action.type === 'move') {
      const attacker = actingTeam.selectedForBattle.find(p => p.isActive)!;
      const defender = targetTeam.selectedForBattle.find(p => p.isActive)!;
      const move = attacker.selectedMoves[action.moveIndex!];

      const damageCalc = calculateDamage(attacker, defender, move);
      logs.push(damageCalc.description);

      applyDamage(defender, damageCalc.damage);

      if (defender.isFainted) {
        logs.push(`${defender.name} fainted!`);

        // Force switch
        const nextPokemon = targetTeam.selectedForBattle.find(p => !p.isFainted && !p.isActive);
        if (nextPokemon) {
          defender.isActive = false;
          nextPokemon.isActive = true;
          logs.push(`${isPlayer ? 'Opponent' : 'You'} sent out ${nextPokemon.name}!`);
        }
      }
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
          logs.push(`Used ${item.name}! ${target.name} status was cured!`);
        }

        // Remove item from inventory
        const itemIndex = actingTeam.items.findIndex(i => i.id === item.id);
        if (itemIndex !== -1) {
          actingTeam.items.splice(itemIndex, 1);
        }
      }
    }
  };

  if (!battleState && team.length >= 6) {
    return (
      <div style={{ background: theme.colors.bgPrimary, minHeight: '100vh', paddingTop: '30px' }}>
        <Container>
          <Card
            className="text-center p-5"
            style={{
              background: theme.colors.bgCard,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '16px',
            }}
          >
            <h1 style={{ color: theme.colors.textPrimary, marginBottom: '20px' }}>
              ⚔️ VGC Battle Arena
            </h1>
            <p style={{ color: theme.colors.textSecondary, fontSize: '1.1rem', marginBottom: '30px' }}>
              Challenge the AI in official VGC format!<br />
              <small>Select 4 Pokemon from your team of 6</small>
            </p>

            <Button
              size="lg"
              style={{
                background: theme.gradients.primary,
                border: 'none',
                padding: '15px 40px',
                fontSize: '1.2rem',
                fontWeight: 600,
              }}
              onClick={startBattle}
            >
              <Swords className="me-2" />
              Start Battle
            </Button>
          </Card>
        </Container>

        {/* Team Selection Modal */}
        <Modal
          show={showTeamSelect}
          onHide={() => setShowTeamSelect(false)}
          size="lg"
          centered
        >
          <Modal.Header
            closeButton
            style={{ background: theme.colors.bgCard, borderBottom: `1px solid ${theme.colors.border}` }}
          >
            <Modal.Title style={{ color: theme.colors.textPrimary }}>
              Select 4 Pokemon for Battle ({selectedPokemon.length}/4)
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: theme.colors.bgCard }}>
            <Row xs={2} md={3} className="g-3">
              {team.map((pokemon, index) => (
                <Col key={pokemon.id}>
                  <Card
                    onClick={() => {
                      if (selectedPokemon.includes(index)) {
                        setSelectedPokemon(selectedPokemon.filter(i => i !== index));
                      } else if (selectedPokemon.length < 4) {
                        setSelectedPokemon([...selectedPokemon, index]);
                      }
                    }}
                    style={{
                      background: selectedPokemon.includes(index)
                        ? theme.colors.primary
                        : theme.colors.bgTertiary,
                      border: `2px solid ${
                        selectedPokemon.includes(index) ? theme.colors.primary : theme.colors.border
                      }`,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    className="text-center p-3"
                  >
                    <img
                      src={pokemon.sprite}
                      alt={pokemon.name}
                      style={{ width: '80px', height: '80px' }}
                    />
                    <div style={{ color: theme.colors.textPrimary, fontWeight: 600, marginTop: '8px' }}>
                      {pokemon.name}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Modal.Body>
          <Modal.Footer style={{ background: theme.colors.bgCard, borderTop: `1px solid ${theme.colors.border}` }}>
            <Button
              variant="success"
              onClick={confirmTeamSelection}
              disabled={selectedPokemon.length !== 4}
            >
              Confirm Team
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

  if (!battleState) {
    return (
      <div style={{ background: theme.colors.bgPrimary, minHeight: '100vh', paddingTop: '30px' }}>
        <Container>
          <Alert variant="warning">
            You need a full team of 6 Pokemon to start a battle. Go to Team Builder first!
          </Alert>
        </Container>
      </div>
    );
  }

  const playerActive = battleState.playerTeam.selectedForBattle.find(p => p.isActive);
  const aiActive = battleState.aiTeam.selectedForBattle.find(p => p.isActive);

  return (
    <div style={{ background: theme.colors.bgPrimary, minHeight: '100vh', paddingTop: '20px' }}>
      <Container fluid>
        {/* Battle Field */}
        <Row className="mb-3">
          {/* AI Pokemon */}
          <Col md={6}>
            <Card style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}` }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h4 style={{ color: theme.colors.textPrimary }}>
                      {aiActive?.name}
                      <Badge bg="danger" className="ms-2">Lv{aiActive?.level}</Badge>
                    </h4>
                    <div className="d-flex gap-2">
                      {aiActive?.types.map(type => (
                        <Badge key={type} style={{ background: typeColors[type] }}>
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <img
                    src={aiActive?.sprite}
                    alt={aiActive?.name}
                    style={{ width: '120px', height: '120px' }}
                  />
                </div>

                <div className="mb-2">
                  <small style={{ color: theme.colors.textSecondary }}>
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
                  />
                </div>

                {aiActive?.status.name && (
                  <Badge bg="warning">{aiActive.status.name}</Badge>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Player Pokemon */}
          <Col md={6}>
            <Card style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}` }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <img
                    src={playerActive?.sprite}
                    alt={playerActive?.name}
                    style={{ width: '120px', height: '120px' }}
                  />
                  <div className="text-end">
                    <h4 style={{ color: theme.colors.textPrimary }}>
                      {playerActive?.name}
                      <Badge bg="primary" className="ms-2">Lv{playerActive?.level}</Badge>
                    </h4>
                    <div className="d-flex gap-2 justify-content-end">
                      {playerActive?.types.map(type => (
                        <Badge key={type} style={{ background: typeColors[type] }}>
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-2">
                  <small style={{ color: theme.colors.textSecondary }}>
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
                  />
                </div>

                {playerActive?.status.name && (
                  <Badge bg="warning">{playerActive.status.name}</Badge>
                )}

                {playerActive?.heldItem && (
                  <Badge bg="info" className="ms-2">
                    {playerActive.heldItem.name}
                  </Badge>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Battle Log */}
          <Col md={6}>
            <Card
              style={{
                background: theme.colors.bgCard,
                border: `1px solid ${theme.colors.border}`,
                height: '300px',
                overflow: 'auto',
              }}
            >
              <Card.Header style={{ background: theme.colors.bgTertiary }}>
                <strong>Battle Log</strong>
              </Card.Header>
              <Card.Body>
                {battleLog.slice(-15).map((log, i) => (
                  <div key={i} style={{ color: theme.colors.textSecondary, marginBottom: '8px' }}>
                    {log}
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>

          {/* Actions */}
          <Col md={6}>
            {battleState.battleEnded ? (
              <Card style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}` }}>
                <Card.Body className="text-center p-5">
                  <h2 style={{ color: battleState.winner === 'player' ? theme.colors.success : theme.colors.error }}>
                    {battleState.winner === 'player' ? '🎉 Victory!' : '😢 Defeat!'}
                  </h2>
                  <Button
                    onClick={() => setBattleState(null)}
                    style={{ background: theme.gradients.primary, border: 'none' }}
                    className="mt-3"
                  >
                    New Battle
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              <div className="d-grid gap-3">
                <Button
                  size="lg"
                  disabled={isProcessing}
                  onClick={() => setShowMoveSelect(true)}
                  style={{ background: theme.colors.error, border: 'none' }}
                >
                  <Swords size={20} className="me-2" />
                  Fight
                </Button>

                <Button
                  size="lg"
                  disabled={isProcessing}
                  onClick={() => setShowItemSelect(true)}
                  variant="success"
                >
                  <Package size={20} className="me-2" />
                  Items ({battleState.playerTeam.items.length})
                </Button>

                <Button
                  size="lg"
                  disabled={isProcessing}
                  onClick={() => setShowSwitchSelect(true)}
                  variant="info"
                >
                  <ArrowLeftRight size={20} className="me-2" />
                  Switch Pokemon
                </Button>
              </div>
            )}
          </Col>
        </Row>

        {/* Move Selection Modal */}
        <Modal show={showMoveSelect} onHide={() => setShowMoveSelect(false)} centered>
          <Modal.Header closeButton style={{ background: theme.colors.bgCard }}>
            <Modal.Title style={{ color: theme.colors.textPrimary }}>Select Move</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: theme.colors.bgCard }}>
            <div className="d-grid gap-2">
              {playerActive?.selectedMoves.map((move, index) => (
                <Button
                  key={index}
                  onClick={() => handleMoveSelect(index)}
                  style={{
                    background: typeColors[move.type],
                    border: 'none',
                    padding: '15px',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{move.name}</strong>
                      <br />
                      <small>{move.category} | Power: {move.power || '-'}</small>
                    </div>
                    <Badge bg="dark">{move.type}</Badge>
                  </div>
                </Button>
              ))}
            </div>
          </Modal.Body>
        </Modal>

        {/* Item Selection Modal */}
        <Modal show={showItemSelect} onHide={() => setShowItemSelect(false)} centered>
          <Modal.Header closeButton style={{ background: theme.colors.bgCard }}>
            <Modal.Title style={{ color: theme.colors.textPrimary }}>Select Item</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: theme.colors.bgCard }}>
            <div className="d-grid gap-2">
              {battleState.playerTeam.items.slice(0, 10).map((item, index) => (
                <Button
                  key={index}
                  onClick={() => handleItemUse(item.id, 0)}
                  variant="outline-primary"
                >
                  {item.name} - {item.description}
                </Button>
              ))}
            </div>
          </Modal.Body>
        </Modal>

        {/* Switch Pokemon Modal */}
        <Modal show={showSwitchSelect} onHide={() => setShowSwitchSelect(false)} centered>
          <Modal.Header closeButton style={{ background: theme.colors.bgCard }}>
            <Modal.Title style={{ color: theme.colors.textPrimary }}>Switch Pokemon</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: theme.colors.bgCard }}>
            <Row xs={2} className="g-2">
              {battleState.playerTeam.selectedForBattle.map((pokemon, index) => (
                !pokemon.isActive && !pokemon.isFainted && (
                  <Col key={index}>
                    <Card
                      onClick={() => handleSwitch(index)}
                      style={{
                        background: theme.colors.bgTertiary,
                        cursor: 'pointer',
                        border: `1px solid ${theme.colors.border}`,
                      }}
                      className="text-center p-2"
                    >
                      <img src={pokemon.sprite} alt={pokemon.name} style={{ width: '60px', height: '60px' }} />
                      <small style={{ color: theme.colors.textPrimary }}>{pokemon.name}</small>
                      <small style={{ color: theme.colors.textSecondary }}>
                        {pokemon.currentHp}/{pokemon.maxHp} HP
                      </small>
                    </Card>
                  </Col>
                )
              ))}
            </Row>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
}
