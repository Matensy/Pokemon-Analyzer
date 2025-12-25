import { useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Badge } from 'react-bootstrap';
import { Swords, Shield, RefreshCw, Zap, Check, X, Sparkles, Flame, Diamond } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useTeamStore } from '../store/teamStore';
import { BattleState, BattlePokemon, BattleAction, MEGA_POKEMON, getDynamaxMove } from '../types/battle';
import { Pokemon, Move, PokemonType } from '../types/pokemon';
import { generateAITeam } from '../services/aiTeamGenerator';
import { getAIAction } from '../services/battleAI';
import { calculateDamage, applyDamage, processEndOfTurn, checkBattleEnd, getSpeedOrder } from '../services/battleEngine';
import { STARTER_ITEMS } from '../data/items';
import { typeColors } from '../styles/themes';
import '../styles/battle-animations.css';

export default function BattleGame() {
  const { theme } = useThemeStore();
  const { team } = useTeamStore();

  const [gameState, setGameState] = useState<'menu' | 'team-select' | 'moveset-select' | 'battle' | 'ended'>('menu');
  const [selectedForBattle, setSelectedForBattle] = useState<number[]>([]);
  const [currentMovesetIndex, setCurrentMovesetIndex] = useState(0);
  const [teamWithMovesets, setTeamWithMovesets] = useState<Pokemon[]>([]);
  const [selectedMoves, setSelectedMoves] = useState<Move[]>([]);

  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showTeraModal, setShowTeraModal] = useState(false);

  // Mechanic toggles for next attack
  const [useMegaNext, setUseMegaNext] = useState(false);
  const [useDynamaxNext, setUseDynamaxNext] = useState(false);
  const [useTeraNext, setUseTeraNext] = useState(false);
  const [selectedTeraType, setSelectedTeraType] = useState<PokemonType | null>(null);

  const [animations, setAnimations] = useState({
    playerAttack: false,
    aiAttack: false,
    playerDamage: false,
    aiDamage: false,
    effectText: ''
  });

  const allTypes: PokemonType[] = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic',
    'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  const startGame = () => {
    if (team.length < 4) {
      alert('You need at least 4 Pokemon!');
      return;
    }
    setGameState('team-select');
    setSelectedForBattle([]);
  };

  const confirmTeamSelection = () => {
    if (selectedForBattle.length !== 4) {
      alert('Select exactly 4 Pokemon!');
      return;
    }
    const selected = selectedForBattle.map(i => team[i]);
    setTeamWithMovesets(selected);
    setCurrentMovesetIndex(0);
    setSelectedMoves([]);
    setGameState('moveset-select');
  };

  const toggleMoveSelection = (move: Move) => {
    if (selectedMoves.find(m => m.name === move.name)) {
      setSelectedMoves(selectedMoves.filter(m => m.name !== move.name));
    } else if (selectedMoves.length < 4) {
      setSelectedMoves([...selectedMoves, move]);
    }
  };

  const confirmMoveset = () => {
    if (selectedMoves.length !== 4) return;

    const updated = [...teamWithMovesets];
    updated[currentMovesetIndex] = { ...updated[currentMovesetIndex], moves: selectedMoves };
    setTeamWithMovesets(updated);

    if (currentMovesetIndex < 3) {
      setCurrentMovesetIndex(currentMovesetIndex + 1);
      setSelectedMoves([]);
    } else {
      initializeBattle(updated);
    }
  };

  const autoSelectMoves = () => {
    const pokemon = teamWithMovesets[currentMovesetIndex];
    const attackingMoves = pokemon.moves.filter(m => m.power && m.power > 0);
    const bestMoves = attackingMoves
      .sort((a, b) => (b.power || 0) - (a.power || 0))
      .slice(0, 4);

    if (bestMoves.length >= 4) {
      setSelectedMoves(bestMoves);
    } else {
      const remaining = pokemon.moves.filter(m => !bestMoves.includes(m));
      setSelectedMoves([...bestMoves, ...remaining.slice(0, 4 - bestMoves.length)]);
    }
  };

  const initializeBattle = async (playerPokemon: Pokemon[]) => {
    const playerTeamBattle = playerPokemon.map(convertToBattlePokemon);
    const aiPokemon = await generateAITeam(playerPokemon);
    const aiSelected = aiPokemon.slice(0, 4);

    playerTeamBattle[0].isActive = true;
    aiSelected[0].isActive = true;

    const initialState: BattleState = {
      playerTeam: {
        pokemon: playerTeamBattle,
        selectedForBattle: playerTeamBattle,
        items: [...STARTER_ITEMS],
        remainingPokemon: 4,
        hasMegaEvolved: false,
        hasDynamaxed: false,
        hasTerastallized: false
      },
      aiTeam: {
        pokemon: aiPokemon,
        selectedForBattle: aiSelected,
        items: [],
        remainingPokemon: 4,
        hasMegaEvolved: false,
        hasDynamaxed: false,
        hasTerastallized: false
      },
      currentTurn: 1,
      battleLog: ['Battle Start!', `Go ${playerTeamBattle[0].name}!`, `Opponent sent ${aiSelected[0].name}!`],
      isPlayerTurn: true,
      battleEnded: false,
      format: 'vgc'
    };

    setBattleState(initialState);
    setBattleLog(initialState.battleLog);
    setGameState('battle');
    // Reset mechanic toggles
    setUseMegaNext(false);
    setUseDynamaxNext(false);
    setUseTeraNext(false);
    setSelectedTeraType(null);
  };

  const convertToBattlePokemon = (pokemon: Pokemon): BattlePokemon => {
    const level = 50;
    const maxHp = Math.floor(((2 * pokemon.stats.hp + 31 + 63) * level) / 100) + level + 10;
    const canMega = MEGA_POKEMON[pokemon.name.toLowerCase()] !== undefined;

    return {
      ...pokemon,
      currentHp: maxHp,
      maxHp,
      level,
      status: { name: null },
      statStages: { attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0, accuracy: 0, evasion: 0 },
      selectedMoves: pokemon.moves.slice(0, 4),
      isActive: false,
      isFainted: false,
      canMegaEvolve: canMega,
      megaState: { isMega: false },
      dynamaxState: { isDynamaxed: false, turnsRemaining: 0 },
      teraState: { isTerastallized: false, teraType: null }
    };
  };

  const handleMoveSelect = async (moveIndex: number) => {
    if (!battleState || isProcessing) return;
    setIsProcessing(true);

    const playerAction: BattleAction = {
      type: 'move',
      pokemonIndex: 0,
      moveIndex,
      targetIndex: 0,
      useMega: useMegaNext,
      useDynamax: useDynamaxNext,
      useTera: useTeraNext,
      teraType: selectedTeraType || undefined
    };

    // Reset mechanic toggles
    setUseMegaNext(false);
    setUseDynamaxNext(false);
    setUseTeraNext(false);
    setSelectedTeraType(null);

    await processTurn(playerAction);
  };

  const handleSwitch = async (pokemonIndex: number) => {
    if (!battleState || isProcessing) return;
    setShowSwitchModal(false);
    setIsProcessing(true);

    const playerAction: BattleAction = { type: 'switch', pokemonIndex: 0, switchToIndex: pokemonIndex };
    await processTurn(playerAction);
  };

  const processTurn = async (playerAction: BattleAction) => {
    if (!battleState) return;

    const newState = { ...battleState };
    const logs: string[] = [];

    // Apply player mechanics before turn
    if (playerAction.useMega) {
      applyMegaEvolution(newState.playerTeam, logs);
    }
    if (playerAction.useDynamax) {
      applyDynamax(newState.playerTeam, logs);
    }
    if (playerAction.useTera && playerAction.teraType) {
      applyTerastallization(newState.playerTeam, playerAction.teraType, logs);
    }

    const aiDecision = getAIAction(newState.aiTeam, newState.playerTeam);
    const playerActive = newState.playerTeam.selectedForBattle.find(p => p.isActive)!;
    const aiActive = newState.aiTeam.selectedForBattle.find(p => p.isActive)!;

    const [first] = getSpeedOrder(playerActive, aiActive);
    const firstAction = first === playerActive ? playerAction : aiDecision.action;
    const secondAction = first === playerActive ? aiDecision.action : playerAction;
    const firstIsPlayer = first === playerActive;

    await executeAction(firstAction, firstIsPlayer, newState, logs);

    if (!checkBattleEnd(newState)) {
      await new Promise(r => setTimeout(r, 800));
      await executeAction(secondAction, !firstIsPlayer, newState, logs);
    }

    // Process Dynamax turn countdown
    processDynamaxTurns(newState.playerTeam, logs);
    processDynamaxTurns(newState.aiTeam, logs);

    const endTurnLogs = processEndOfTurn(newState);
    logs.push(...endTurnLogs);
    checkBattleEnd(newState);

    if (newState.battleEnded) setGameState('ended');

    newState.currentTurn++;
    newState.battleLog.push(...logs);
    setBattleState(newState);
    setBattleLog([...newState.battleLog]);
    setIsProcessing(false);
  };

  const applyMegaEvolution = (team: BattleState['playerTeam'], logs: string[]) => {
    if (team.hasMegaEvolved) return;

    const active = team.selectedForBattle.find(p => p.isActive);
    if (!active || !active.canMegaEvolve) return;

    const megaData = MEGA_POKEMON[active.name.toLowerCase()];
    if (!megaData) return;

    active.megaState = {
      isMega: true,
      originalStats: { ...active.stats }
    };

    // Apply stat boosts
    Object.entries(megaData.statBoost).forEach(([stat, boost]) => {
      if (stat in active.stats) {
        (active.stats as any)[stat] += boost;
      }
    });

    team.hasMegaEvolved = true;
    logs.push(`${active.name} Mega Evolved!`);
  };

  const applyDynamax = (team: BattleState['playerTeam'], logs: string[]) => {
    if (team.hasDynamaxed) return;

    const active = team.selectedForBattle.find(p => p.isActive);
    if (!active) return;

    active.dynamaxState = {
      isDynamaxed: true,
      turnsRemaining: 3,
      originalMoves: [...active.selectedMoves],
      originalHp: active.maxHp
    };

    // Double HP
    const hpRatio = active.currentHp / active.maxHp;
    active.maxHp *= 2;
    active.currentHp = Math.floor(active.maxHp * hpRatio);

    // Convert moves to Max Moves
    active.selectedMoves = active.selectedMoves.map(move =>
      getDynamaxMove(move, active.types)
    );

    team.hasDynamaxed = true;
    logs.push(`${active.name} Dynamaxed!`);
  };

  const applyTerastallization = (team: BattleState['playerTeam'], teraType: PokemonType, logs: string[]) => {
    if (team.hasTerastallized) return;

    const active = team.selectedForBattle.find(p => p.isActive);
    if (!active) return;

    active.teraState = {
      isTerastallized: true,
      teraType: teraType,
      originalTypes: [...active.types]
    };

    // Change type to Tera type
    active.types = [teraType];

    team.hasTerastallized = true;
    logs.push(`${active.name} Terastallized into ${teraType.toUpperCase()} type!`);
  };

  const processDynamaxTurns = (team: BattleState['playerTeam'], logs: string[]) => {
    const active = team.selectedForBattle.find(p => p.isActive);
    if (!active || !active.dynamaxState.isDynamaxed) return;

    active.dynamaxState.turnsRemaining--;

    if (active.dynamaxState.turnsRemaining <= 0) {
      // Revert Dynamax
      const originalHp = active.dynamaxState.originalHp || active.maxHp / 2;
      const hpRatio = active.currentHp / active.maxHp;
      active.maxHp = originalHp;
      active.currentHp = Math.max(1, Math.floor(active.maxHp * hpRatio));

      if (active.dynamaxState.originalMoves) {
        active.selectedMoves = active.dynamaxState.originalMoves;
      }

      active.dynamaxState = { isDynamaxed: false, turnsRemaining: 0 };
      logs.push(`${active.name}'s Dynamax ended!`);
    }
  };

  const executeAction = async (action: BattleAction, isPlayer: boolean, state: BattleState, logs: string[]) => {
    const actingTeam = isPlayer ? state.playerTeam : state.aiTeam;
    const targetTeam = isPlayer ? state.aiTeam : state.playerTeam;

    if (action.type === 'move') {
      const attacker = actingTeam.selectedForBattle.find(p => p.isActive)!;
      const defender = targetTeam.selectedForBattle.find(p => p.isActive)!;
      const move = attacker.selectedMoves[action.moveIndex!];

      setAnimations(prev => ({ ...prev, [isPlayer ? 'playerAttack' : 'aiAttack']: true }));
      await new Promise(r => setTimeout(r, 300));

      const damageCalc = calculateDamage(attacker, defender, move);
      logs.push(damageCalc.description);

      setAnimations(prev => ({
        ...prev,
        [isPlayer ? 'aiDamage' : 'playerDamage']: true,
        effectText: damageCalc.effectiveness > 1 ? 'Super Effective!' : damageCalc.effectiveness < 1 ? 'Not very effective...' : ''
      }));

      await new Promise(r => setTimeout(r, 600));
      applyDamage(defender, damageCalc.damage);

      if (defender.isFainted) {
        logs.push(`${defender.name} fainted!`);
        const next = targetTeam.selectedForBattle.find(p => !p.isFainted && !p.isActive);
        if (next) {
          defender.isActive = false;
          next.isActive = true;
          logs.push(`${isPlayer ? 'Opponent' : 'You'} sent out ${next.name}!`);
        }
      }

      setAnimations({ playerAttack: false, aiAttack: false, playerDamage: false, aiDamage: false, effectText: '' });
    } else if (action.type === 'switch') {
      const current = actingTeam.selectedForBattle.find(p => p.isActive)!;
      const switchTo = actingTeam.selectedForBattle[action.switchToIndex!];
      current.isActive = false;
      switchTo.isActive = true;
      logs.push(`${isPlayer ? 'You' : 'Opponent'} switched to ${switchTo.name}!`);
    }
  };

  // MENU SCREEN
  if (gameState === 'menu') {
    return (
      <div style={{ background: theme.colors.bgPrimary, minHeight: '100vh' }} className="d-flex align-items-center justify-content-center p-4">
        <Card style={{ background: theme.colors.bgCard, border: `2px solid ${theme.colors.primary}`, borderRadius: '24px', maxWidth: '500px', width: '100%' }} className="p-4 text-center">
          <div style={{ background: theme.gradients.primary, borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
            <h1 style={{ color: 'white', fontWeight: 800, fontSize: '2rem', margin: 0 }}>Pokemon Champions</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0' }}>VGC Battle Simulator</p>
          </div>

          <div style={{ color: theme.colors.textSecondary, marginBottom: '24px' }}>
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2"><Swords size={18} /> Real damage calculation</div>
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2"><Sparkles size={18} /> Mega Evolution & Dynamax</div>
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2"><Diamond size={18} /> Terastallization</div>
            <div className="d-flex align-items-center justify-content-center gap-2"><Zap size={18} /> AI opponent</div>
          </div>

          <Button size="lg" onClick={startGame} disabled={team.length < 4} style={{ background: theme.gradients.primary, border: 'none', padding: '16px 32px', fontWeight: 700, borderRadius: '12px' }}>
            {team.length < 4 ? `Need ${4 - team.length} more Pokemon` : 'Start Battle'}
          </Button>
        </Card>
      </div>
    );
  }

  // TEAM SELECT SCREEN
  if (gameState === 'team-select') {
    return (
      <div style={{ background: theme.colors.bgPrimary, minHeight: '100vh', padding: '24px' }}>
        <Container>
          <h2 style={{ color: theme.colors.textPrimary, marginBottom: '8px' }}>Select Your Team</h2>
          <p style={{ color: theme.colors.textSecondary, marginBottom: '24px' }}>Choose 4 Pokemon for battle ({selectedForBattle.length}/4)</p>

          <Row xs={2} md={3} lg={6} className="g-3 mb-4">
            {team.map((pokemon, index) => {
              const isSelected = selectedForBattle.includes(index);
              const order = selectedForBattle.indexOf(index) + 1;
              const canMega = MEGA_POKEMON[pokemon.name.toLowerCase()] !== undefined;
              return (
                <Col key={pokemon.id}>
                  <Card onClick={() => { if (isSelected) setSelectedForBattle(selectedForBattle.filter(i => i !== index)); else if (selectedForBattle.length < 4) setSelectedForBattle([...selectedForBattle, index]); }} style={{ background: isSelected ? theme.colors.primary : theme.colors.bgCard, border: `3px solid ${isSelected ? theme.colors.primary : theme.colors.border}`, cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }} className="text-center p-3">
                    {isSelected && <div style={{ position: 'absolute', top: 8, right: 8, background: '#22C55E', color: 'white', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{order}</div>}
                    {canMega && <div style={{ position: 'absolute', top: 8, left: 8, background: '#EC4899', color: 'white', padding: '2px 6px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700 }}>MEGA</div>}
                    <img src={pokemon.artwork || pokemon.sprite} alt={pokemon.name} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                    <div style={{ color: isSelected ? 'white' : theme.colors.textPrimary, fontWeight: 600, textTransform: 'capitalize', marginTop: '8px' }}>{pokemon.name}</div>
                    <div className="d-flex gap-1 justify-content-center mt-1">{pokemon.types.map(type => <span key={type} style={{ background: typeColors[type], color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 600 }}>{type}</span>)}</div>
                  </Card>
                </Col>
              );
            })}
          </Row>

          <div className="text-center">
            <Button size="lg" onClick={confirmTeamSelection} disabled={selectedForBattle.length !== 4} style={{ background: theme.gradients.primary, border: 'none', padding: '16px 48px', fontWeight: 700 }}>Continue</Button>
          </div>
        </Container>
      </div>
    );
  }

  // MOVESET SELECT SCREEN
  if (gameState === 'moveset-select') {
    const currentPokemon = teamWithMovesets[currentMovesetIndex];
    const attackingMoves = currentPokemon.moves.filter(m => m.power && m.power > 0);
    const statusMoves = currentPokemon.moves.filter(m => !m.power || m.power === 0);

    return (
      <div style={{ background: theme.colors.bgPrimary, minHeight: '100vh', padding: '24px' }}>
        <Container>
          {/* Progress */}
          <div className="d-flex gap-2 mb-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ flex: 1, height: '8px', borderRadius: '4px', background: i <= currentMovesetIndex ? theme.colors.primary : theme.colors.border }} />
            ))}
          </div>

          {/* Pokemon Header */}
          <Card style={{ background: theme.gradients.primary, border: 'none', borderRadius: '16px', marginBottom: '24px' }} className="p-4">
            <Row className="align-items-center">
              <Col xs="auto">
                <img src={currentPokemon.artwork || currentPokemon.sprite} alt={currentPokemon.name} style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
              </Col>
              <Col>
                <h3 style={{ color: 'white', margin: 0, textTransform: 'capitalize' }}>{currentPokemon.name}</h3>
                <div className="d-flex gap-2 mt-2">
                  {currentPokemon.types.map(type => <span key={type} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontWeight: 600 }}>{type}</span>)}
                </div>
              </Col>
              <Col xs="auto">
                <Button variant="light" onClick={autoSelectMoves} style={{ fontWeight: 600 }}><Zap size={16} className="me-2" />Auto-Select</Button>
              </Col>
            </Row>
          </Card>

          {/* Selected Moves */}
          <div style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}`, borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span style={{ color: theme.colors.textPrimary, fontWeight: 600 }}>Selected Moves ({selectedMoves.length}/4)</span>
              {selectedMoves.length > 0 && <Button variant="link" size="sm" onClick={() => setSelectedMoves([])}>Clear All</Button>}
            </div>
            <div className="d-flex gap-2 flex-wrap">
              {selectedMoves.length === 0 ? (
                <span style={{ color: theme.colors.textMuted }}>Click moves below to select</span>
              ) : selectedMoves.map((move, i) => (
                <div key={i} onClick={() => toggleMoveSelection(move)} style={{ background: typeColors[move.type], color: 'white', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  {move.name}<X size={14} />
                </div>
              ))}
            </div>
          </div>

          {/* Attacking Moves */}
          {attackingMoves.length > 0 && (
            <div className="mb-4">
              <h5 style={{ color: theme.colors.textPrimary, marginBottom: '12px' }}><Swords size={18} className="me-2" />Attacking Moves</h5>
              <Row xs={1} md={2} lg={3} className="g-3">
                {attackingMoves.map((move, index) => {
                  const isSelected = selectedMoves.find(m => m.name === move.name);
                  const hasSTAB = currentPokemon.types.includes(move.type);
                  const isDisabled = selectedMoves.length >= 4 && !isSelected;

                  return (
                    <Col key={index}>
                      <Card onClick={() => !isDisabled && toggleMoveSelection(move)} style={{ background: isSelected ? typeColors[move.type] : theme.colors.bgCard, border: `2px solid ${isSelected ? typeColors[move.type] : theme.colors.border}`, cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.5 : 1, transition: 'all 0.2s' }} className="p-3 h-100">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <div style={{ fontWeight: 700, color: isSelected ? 'white' : theme.colors.textPrimary, fontSize: '1rem' }}>
                              {move.category === 'physical' ? '⚔️' : '✨'} {move.name}
                            </div>
                            <div className="d-flex gap-2 flex-wrap mt-1">
                              <span style={{ background: isSelected ? 'rgba(255,255,255,0.25)' : typeColors[move.type], color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}>{move.type}</span>
                              {hasSTAB && <span style={{ background: '#F59E0B', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}>STAB</span>}
                            </div>
                          </div>
                          {isSelected && <div style={{ background: '#22C55E', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14} color="white" /></div>}
                        </div>
                        <div className="d-flex gap-3 mt-2" style={{ color: isSelected ? 'rgba(255,255,255,0.9)' : theme.colors.textSecondary, fontSize: '0.85rem' }}>
                          <span>Pwr: <strong>{move.power}</strong></span>
                          <span>Acc: <strong>{move.accuracy}%</strong></span>
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          )}

          {/* Status Moves */}
          {statusMoves.length > 0 && (
            <div className="mb-4">
              <h5 style={{ color: theme.colors.textPrimary, marginBottom: '12px' }}><Shield size={18} className="me-2" />Status Moves</h5>
              <Row xs={1} md={2} lg={3} className="g-3">
                {statusMoves.slice(0, 6).map((move, index) => {
                  const isSelected = selectedMoves.find(m => m.name === move.name);
                  const isDisabled = selectedMoves.length >= 4 && !isSelected;

                  return (
                    <Col key={index}>
                      <Card onClick={() => !isDisabled && toggleMoveSelection(move)} style={{ background: isSelected ? theme.colors.primary : theme.colors.bgCard, border: `2px solid ${isSelected ? theme.colors.primary : theme.colors.border}`, cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.5 : 1 }} className="p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div style={{ fontWeight: 600, color: isSelected ? 'white' : theme.colors.textPrimary }}>{move.name}</div>
                            <span style={{ fontSize: '0.75rem', color: isSelected ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary }}>{move.type}</span>
                          </div>
                          {isSelected && <Check size={18} color="white" />}
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          )}

          <div className="text-center mt-4">
            <Button size="lg" onClick={confirmMoveset} disabled={selectedMoves.length !== 4} style={{ background: theme.gradients.primary, border: 'none', padding: '16px 48px', fontWeight: 700 }}>
              {currentMovesetIndex < 3 ? `Next Pokemon (${currentMovesetIndex + 2}/4)` : 'Start Battle!'}
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  // BATTLE SCREEN WITH MECHANICS
  if (gameState === 'battle' && battleState) {
    const playerActive = battleState.playerTeam.selectedForBattle.find(p => p.isActive);
    const aiActive = battleState.aiTeam.selectedForBattle.find(p => p.isActive);

    const canMega = playerActive?.canMegaEvolve && !battleState.playerTeam.hasMegaEvolved && !playerActive.megaState.isMega;
    const canDynamax = !battleState.playerTeam.hasDynamaxed && !playerActive?.dynamaxState.isDynamaxed;
    const canTera = !battleState.playerTeam.hasTerastallized && !playerActive?.teraState.isTerastallized;

    const getHpColor = (current: number, max: number) => {
      const pct = current / max;
      if (pct > 0.5) return '#22C55E';
      if (pct > 0.2) return '#F59E0B';
      return '#EF4444';
    };

    // Get display moves (show Max moves if dynamaxed)
    const displayMoves = playerActive?.selectedMoves || [];

    return (
      <div style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)', minHeight: '100vh', padding: '16px' }}>
        <Container fluid style={{ maxWidth: '1000px' }}>
          {/* Turn Indicator */}
          <div className="text-center mb-3">
            <Badge style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '8px 20px', fontSize: '0.9rem' }}>Turn {battleState.currentTurn}</Badge>
          </div>

          {/* Battle Arena */}
          <div style={{ background: 'linear-gradient(180deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.05) 100%)', borderRadius: '24px', padding: '24px', marginBottom: '16px', position: 'relative', minHeight: '380px' }}>

            {/* Opponent Pokemon */}
            <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div className="d-flex align-items-center gap-2 justify-content-end">
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', textTransform: 'capitalize' }}>{aiActive?.name}</div>
                  {aiActive?.megaState.isMega && <Badge bg="danger">MEGA</Badge>}
                  {aiActive?.dynamaxState.isDynamaxed && <Badge style={{ background: '#EC4899' }}>DMAX</Badge>}
                  {aiActive?.teraState.isTerastallized && <Badge style={{ background: typeColors[aiActive.teraState.teraType!] }}>TERA</Badge>}
                </div>
                <div className="d-flex gap-1 justify-content-end mb-2">
                  {aiActive?.types.map(type => <span key={type} style={{ background: typeColors[type], color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 600 }}>{type}</span>)}
                </div>
                <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '8px', padding: '8px 12px', width: '180px' }}>
                  <div style={{ color: '#ccc', fontSize: '0.75rem', marginBottom: '4px' }}>HP {aiActive?.currentHp}/{aiActive?.maxHp}</div>
                  <div style={{ background: '#1f2937', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${(aiActive!.currentHp / aiActive!.maxHp) * 100}%`, height: '100%', background: getHpColor(aiActive!.currentHp, aiActive!.maxHp), transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </div>
              <div className={animations.aiDamage ? 'animate-shake' : ''}>
                <img src={aiActive?.artwork || aiActive?.sprite} alt={aiActive?.name} style={{ width: aiActive?.dynamaxState.isDynamaxed ? '180px' : '140px', height: aiActive?.dynamaxState.isDynamaxed ? '180px' : '140px', objectFit: 'contain', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))', transition: 'all 0.3s ease' }} />
              </div>
            </div>

            {/* Effect Text */}
            {animations.effectText && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
                <span style={{ color: animations.effectText.includes('Super') ? '#EF4444' : '#94A3B8', fontSize: '1.5rem', fontWeight: 800, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{animations.effectText}</span>
              </div>
            )}

            {/* Player Pokemon */}
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
              <div className={animations.playerDamage ? 'animate-shake' : ''}>
                <img src={playerActive?.artwork || playerActive?.sprite} alt={playerActive?.name} style={{ width: playerActive?.dynamaxState.isDynamaxed ? '200px' : '160px', height: playerActive?.dynamaxState.isDynamaxed ? '200px' : '160px', objectFit: 'contain', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))', transition: 'all 0.3s ease' }} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem', textTransform: 'capitalize' }}>{playerActive?.name}</div>
                  {playerActive?.megaState.isMega && <Badge bg="danger">MEGA</Badge>}
                  {playerActive?.dynamaxState.isDynamaxed && <Badge style={{ background: '#EC4899' }}>DMAX {playerActive.dynamaxState.turnsRemaining}T</Badge>}
                  {playerActive?.teraState.isTerastallized && <Badge style={{ background: typeColors[playerActive.teraState.teraType!] }}>TERA</Badge>}
                </div>
                <div className="d-flex gap-1 mb-2">
                  {playerActive?.types.map(type => <span key={type} style={{ background: typeColors[type], color: 'white', padding: '3px 12px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 600 }}>{type}</span>)}
                </div>
                <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '8px', padding: '10px 14px', width: '200px' }}>
                  <div style={{ color: '#ccc', fontSize: '0.8rem', marginBottom: '4px' }}>HP {playerActive?.currentHp}/{playerActive?.maxHp}</div>
                  <div style={{ background: '#1f2937', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${(playerActive!.currentHp / playerActive!.maxHp) * 100}%`, height: '100%', background: getHpColor(playerActive!.currentHp, playerActive!.maxHp), transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Team Pokeballs */}
            <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
              <div className="d-flex gap-1 justify-content-end mb-1">
                {battleState.aiTeam.selectedForBattle.map((p, i) => (
                  <div key={i} style={{ width: '20px', height: '20px', borderRadius: '50%', background: p.isFainted ? '#374151' : p.isActive ? '#EF4444' : '#F97316' }} />
                ))}
              </div>
            </div>
            <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
              <div className="d-flex gap-1">
                {battleState.playerTeam.selectedForBattle.map((p, i) => (
                  <div key={i} style={{ width: '20px', height: '20px', borderRadius: '50%', background: p.isFainted ? '#374151' : p.isActive ? '#3B82F6' : '#22C55E' }} />
                ))}
              </div>
            </div>
          </div>

          {/* Mechanics Buttons */}
          <div className="d-flex gap-2 justify-content-center mb-3">
            {canMega && (
              <Button variant={useMegaNext ? 'danger' : 'outline-danger'} onClick={() => { setUseMegaNext(!useMegaNext); setUseDynamaxNext(false); }} disabled={isProcessing}>
                <Flame size={16} className="me-1" />Mega {useMegaNext && '✓'}
              </Button>
            )}
            {canDynamax && (
              <Button variant={useDynamaxNext ? 'info' : 'outline-info'} onClick={() => { setUseDynamaxNext(!useDynamaxNext); setUseMegaNext(false); }} disabled={isProcessing} style={{ background: useDynamaxNext ? '#EC4899' : 'transparent', borderColor: '#EC4899' }}>
                <Sparkles size={16} className="me-1" />Dynamax {useDynamaxNext && '✓'}
              </Button>
            )}
            {canTera && (
              <Button variant={useTeraNext ? 'warning' : 'outline-warning'} onClick={() => setShowTeraModal(true)} disabled={isProcessing}>
                <Diamond size={16} className="me-1" />Tera {useTeraNext && selectedTeraType && `(${selectedTeraType})`}
              </Button>
            )}
          </div>

          {/* Controls */}
          <Row className="g-3">
            {/* Move Buttons */}
            <Col md={8}>
              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '12px' }}>What will {playerActive?.name} do?</div>
                <Row xs={2} className="g-2">
                  {displayMoves.map((move, index) => {
                    const hasSTAB = playerActive?.types.includes(move.type);
                    return (
                      <Col key={index}>
                        <Button onClick={() => handleMoveSelect(index)} disabled={isProcessing} style={{ background: typeColors[move.type], border: 'none', width: '100%', padding: '14px 12px', textAlign: 'left', opacity: isProcessing ? 0.6 : 1 }} className="h-100">
                          <div style={{ fontWeight: 700, marginBottom: '2px' }}>{move.name}</div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                            {move.category === 'physical' ? '⚔️' : '✨'} {move.power || '-'} PWR | {move.accuracy || '∞'}% ACC{hasSTAB && ' | STAB'}
                          </div>
                        </Button>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            </Col>

            {/* Side Panel */}
            <Col md={4}>
              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: '16px', height: '100%' }}>
                <Button variant="outline-light" className="w-100 mb-3" onClick={() => setShowSwitchModal(true)} disabled={isProcessing}>
                  <RefreshCw size={16} className="me-2" />Switch
                </Button>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px', maxHeight: '120px', overflowY: 'auto' }}>
                  {battleLog.slice(-4).map((log, i) => (
                    <div key={i} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginBottom: '4px' }}>{log}</div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Container>

        {/* Switch Modal */}
        <Modal show={showSwitchModal} onHide={() => setShowSwitchModal(false)} centered>
          <Modal.Header closeButton style={{ background: theme.colors.bgCard, borderBottom: `1px solid ${theme.colors.border}` }}>
            <Modal.Title style={{ color: theme.colors.textPrimary }}>Switch Pokemon</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: theme.colors.bgPrimary }}>
            <Row xs={2} className="g-2">
              {battleState.playerTeam.selectedForBattle.map((p, i) => (
                <Col key={i}>
                  <Card onClick={() => !p.isActive && !p.isFainted && handleSwitch(i)} style={{ background: p.isActive || p.isFainted ? theme.colors.bgHover : theme.colors.bgCard, border: `2px solid ${p.isActive ? theme.colors.primary : theme.colors.border}`, cursor: p.isActive || p.isFainted ? 'not-allowed' : 'pointer', opacity: p.isFainted ? 0.4 : 1 }} className="p-2 text-center">
                    <img src={p.artwork || p.sprite} alt={p.name} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    <div style={{ color: theme.colors.textPrimary, fontWeight: 600, textTransform: 'capitalize', fontSize: '0.85rem' }}>{p.name}</div>
                    <div style={{ color: theme.colors.textSecondary, fontSize: '0.75rem' }}>{p.currentHp}/{p.maxHp} HP</div>
                    {p.isActive && <Badge bg="primary" className="mt-1">Active</Badge>}
                    {p.isFainted && <Badge bg="danger" className="mt-1">Fainted</Badge>}
                  </Card>
                </Col>
              ))}
            </Row>
          </Modal.Body>
        </Modal>

        {/* Tera Type Selection Modal */}
        <Modal show={showTeraModal} onHide={() => setShowTeraModal(false)} centered size="lg">
          <Modal.Header closeButton style={{ background: theme.colors.bgCard, borderBottom: `1px solid ${theme.colors.border}` }}>
            <Modal.Title style={{ color: theme.colors.textPrimary }}>
              <Diamond size={20} className="me-2" />
              Select Tera Type
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: theme.colors.bgPrimary }}>
            <Row xs={3} md={6} className="g-2">
              {allTypes.map((type) => (
                <Col key={type}>
                  <Button
                    onClick={() => {
                      setSelectedTeraType(type);
                      setUseTeraNext(true);
                      setShowTeraModal(false);
                    }}
                    style={{
                      background: typeColors[type],
                      border: 'none',
                      width: '100%',
                      padding: '12px',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}
                  >
                    {type}
                  </Button>
                </Col>
              ))}
            </Row>
          </Modal.Body>
        </Modal>
      </div>
    );
  }

  // END SCREEN
  if (gameState === 'ended' && battleState) {
    const playerWon = battleState.winner === 'player';
    return (
      <div style={{ background: `linear-gradient(180deg, ${playerWon ? '#166534' : '#991B1B'} 0%, ${theme.colors.bgPrimary} 100%)`, minHeight: '100vh' }} className="d-flex align-items-center justify-content-center p-4">
        <Card style={{ background: theme.colors.bgCard, borderRadius: '24px', maxWidth: '400px', width: '100%', border: `4px solid ${playerWon ? '#22C55E' : '#EF4444'}` }} className="p-5 text-center">
          <div style={{ fontSize: '5rem', marginBottom: '16px' }}>{playerWon ? '🏆' : '💀'}</div>
          <h1 style={{ color: theme.colors.textPrimary, fontWeight: 800, marginBottom: '8px' }}>{playerWon ? 'Victory!' : 'Defeat'}</h1>
          <p style={{ color: theme.colors.textSecondary, marginBottom: '24px' }}>{playerWon ? 'You are a Pokemon Champion!' : 'Better luck next time!'}</p>
          <Button size="lg" onClick={() => { setGameState('menu'); setBattleState(null); setSelectedForBattle([]); }} style={{ background: theme.gradients.primary, border: 'none', fontWeight: 700 }}>Play Again</Button>
        </Card>
      </div>
    );
  }

  return null;
}
