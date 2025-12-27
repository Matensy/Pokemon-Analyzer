import { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, ProgressBar } from 'react-bootstrap';
import { Calculator, Zap, Shield, Flame, Droplets, Wind, Snowflake, Sun, CloudRain, Target, TrendingUp, RotateCcw } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useTeamStore } from '../store/teamStore';
import { Pokemon, PokemonType, Move } from '../types/pokemon';
import { BattlePokemon, FieldState, ExtendedDamageCalc } from '../types/battle';
import { calculateDamageV2, createInitialFieldState } from '../services/battleEngineV2';
import { WeatherType, WEATHER_EFFECTS, TERRAINS } from '../data/weather';
import { HELD_ITEMS } from '../data/items';
import { ABILITIES } from '../data/abilities';
import { typeColors } from '../styles/themes';
import { getLearnableMoves } from '../services/moveValidator';

export default function DamageCalculator() {
  const { theme } = useThemeStore();
  const { team } = useTeamStore();

  // Attacker state
  const [attackerPokemon, setAttackerPokemon] = useState<Pokemon | null>(null);
  const [attackerMoves, setAttackerMoves] = useState<Move[]>([]);
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [attackerItem, setAttackerItem] = useState<string>('');
  const [attackerAbility, setAttackerAbility] = useState<string>('');
  const [attackerLevel, setAttackerLevel] = useState(50);
  const [attackerStats, setAttackerStats] = useState({ atk: 0, spa: 0 });
  const [attackerStages, setAttackerStages] = useState({ atk: 0, spa: 0 });
  const [attackerStatus, setAttackerStatus] = useState<string>('none');

  // Defender state
  const [defenderPokemon, setDefenderPokemon] = useState<Pokemon | null>(null);
  const [defenderItem, setDefenderItem] = useState<string>('');
  const [defenderAbility, setDefenderAbility] = useState<string>('');
  const [defenderLevel, setDefenderLevel] = useState(50);
  const [defenderStats, setDefenderStats] = useState({ def: 0, spd: 0, hp: 0 });
  const [defenderStages, setDefenderStages] = useState({ def: 0, spd: 0 });
  const [defenderHpPercent, setDefenderHpPercent] = useState(100);

  // Field state
  const [weather, setWeather] = useState<WeatherType>(null);
  const [terrain, setTerrain] = useState<string>('');
  const [isDoubles, setIsDoubles] = useState(true);
  const [hasReflect, setHasReflect] = useState(false);
  const [hasLightScreen, setHasLightScreen] = useState(false);
  const [hasAuroraVeil, setHasAuroraVeil] = useState(false);

  // Calculation result
  const [calcResult, setCalcResult] = useState<ExtendedDamageCalc | null>(null);

  // Load attacker moves when Pokemon changes
  useEffect(() => {
    if (attackerPokemon) {
      getLearnableMoves(attackerPokemon.name).then(moves => {
        setAttackerMoves(moves);
        if (moves.length > 0) setSelectedMove(moves[0]);
      });
      setAttackerStats({
        atk: attackerPokemon.stats.attack,
        spa: attackerPokemon.stats.specialAttack
      });
      if (attackerPokemon.abilities.length > 0) {
        setAttackerAbility(attackerPokemon.abilities[0].name);
      }
    }
  }, [attackerPokemon]);

  // Update defender stats when Pokemon changes
  useEffect(() => {
    if (defenderPokemon) {
      setDefenderStats({
        def: defenderPokemon.stats.defense,
        spd: defenderPokemon.stats.specialDefense,
        hp: defenderPokemon.stats.hp
      });
      if (defenderPokemon.abilities.length > 0) {
        setDefenderAbility(defenderPokemon.abilities[0].name);
      }
    }
  }, [defenderPokemon]);

  // Calculate damage
  const calculateDamage = () => {
    if (!attackerPokemon || !defenderPokemon || !selectedMove) return;

    // Create battle Pokemon
    const attacker = createBattlePokemon(attackerPokemon, attackerLevel, attackerItem, attackerAbility, attackerStages, attackerStatus);
    const defender = createBattlePokemon(defenderPokemon, defenderLevel, defenderItem, defenderAbility, defenderStages, 'none');

    // Set HP based on percentage
    defender.currentHp = Math.floor(defender.maxHp * (defenderHpPercent / 100));

    // Create field state
    const field = createFieldState();

    // Calculate
    const result = calculateDamageV2(attacker, defender, selectedMove, field, isDoubles, [defender]);
    setCalcResult(result);
  };

  const createBattlePokemon = (
    pokemon: Pokemon,
    level: number,
    itemId: string,
    ability: string,
    stages: { atk?: number; spa?: number; def?: number; spd?: number },
    status: string
  ): BattlePokemon => {
    const maxHp = Math.floor(((2 * pokemon.stats.hp + 31 + 63) * level) / 100) + level + 10;
    const item = HELD_ITEMS.find(i => i.id === itemId);

    return {
      ...pokemon,
      currentHp: maxHp,
      maxHp,
      level,
      status: { name: status === 'none' ? null : status as any },
      statStages: {
        attack: stages.atk || 0,
        defense: stages.def || 0,
        specialAttack: stages.spa || 0,
        specialDefense: stages.spd || 0,
        speed: 0,
        accuracy: 0,
        evasion: 0
      },
      heldItem: item,
      selectedMoves: [],
      isActive: true,
      isFainted: false,
      activeAbility: ability.toLowerCase().replace(/\s+/g, '-'),
      abilityActivated: false,
      megaState: { isMega: false },
      dynamaxState: { isDynamaxed: false, turnsRemaining: 0 },
      teraState: { isTerastallized: false, teraType: null },
      canMegaEvolve: false,
      isGrounded: !pokemon.types.includes('flying') && ability !== 'levitate',
      hasSubstitute: false,
      substituteHp: 0,
      protectCount: 0,
      position: 0
    };
  };

  const createFieldState = (): FieldState => {
    const field = createInitialFieldState();
    field.weather = weather;
    field.weatherTurns = weather ? 5 : 0;
    field.terrain = terrain as any;
    field.terrainTurns = terrain ? 5 : 0;
    field.aiSide.reflect = hasReflect ? 5 : 0;
    field.aiSide.lightScreen = hasLightScreen ? 5 : 0;
    field.aiSide.auroraVeil = hasAuroraVeil ? 5 : 0;
    return field;
  };

  const getKOMessage = () => {
    if (!calcResult || !defenderPokemon) return null;

    const { koChance, minDamage, maxDamage } = calcResult;
    const currentHp = Math.floor(defenderStats.hp * (defenderHpPercent / 100));

    if (koChance >= 100) {
      return { text: 'Guaranteed OHKO', color: '#22C55E' };
    } else if (koChance >= 75) {
      return { text: `${koChance}% chance to OHKO`, color: '#84CC16' };
    } else if (koChance >= 25) {
      return { text: `${koChance}% chance to OHKO`, color: '#F59E0B' };
    } else if (minDamage * 2 >= currentHp) {
      return { text: 'Guaranteed 2HKO', color: '#3B82F6' };
    } else if (minDamage * 3 >= currentHp) {
      return { text: 'Guaranteed 3HKO', color: '#8B5CF6' };
    } else {
      return { text: `${koChance}% chance to OHKO`, color: '#EF4444' };
    }
  };

  return (
    <div style={{ background: theme.colors.bgPrimary, minHeight: '100vh', padding: '24px' }}>
      <Container>
        <div className="text-center mb-4">
          <h1 style={{ color: theme.colors.textPrimary, fontWeight: 800 }}>
            <Calculator size={32} className="me-2" />
            VGC Damage Calculator
          </h1>
          <p style={{ color: theme.colors.textSecondary }}>
            Calculate exact damage ranges with all VGC mechanics
          </p>
        </div>

        <Row className="g-4">
          {/* Attacker Panel */}
          <Col md={5}>
            <Card style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}` }}>
              <Card.Header style={{ background: '#EF4444', color: 'white', fontWeight: 700 }}>
                <Zap size={18} className="me-2" />
                Attacker
              </Card.Header>
              <Card.Body>
                {/* Pokemon Selection */}
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: theme.colors.textSecondary }}>Pokemon</Form.Label>
                  <Form.Select
                    value={attackerPokemon?.id || ''}
                    onChange={(e) => {
                      const p = team.find(p => p.id === Number(e.target.value));
                      setAttackerPokemon(p || null);
                    }}
                    style={{ background: theme.colors.bgPrimary, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                  >
                    <option value="">Select Pokemon from team...</option>
                    {team.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {attackerPokemon && (
                  <>
                    {/* Pokemon Display */}
                    <div className="text-center mb-3">
                      <img
                        src={attackerPokemon.artwork || attackerPokemon.sprite}
                        alt={attackerPokemon.name}
                        style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                      />
                      <div className="d-flex gap-1 justify-content-center mt-2">
                        {attackerPokemon.types.map(type => (
                          <Badge key={type} style={{ background: typeColors[type] }}>{type}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Move Selection */}
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: theme.colors.textSecondary }}>Move</Form.Label>
                      <Form.Select
                        value={selectedMove?.name || ''}
                        onChange={(e) => {
                          const m = attackerMoves.find(m => m.name === e.target.value);
                          setSelectedMove(m || null);
                        }}
                        style={{ background: theme.colors.bgPrimary, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                      >
                        {attackerMoves.filter(m => m.power).map(m => (
                          <option key={m.name} value={m.name}>
                            {m.name} ({m.type}) - {m.power} BP
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    {selectedMove && (
                      <div className="mb-3 p-2 rounded" style={{ background: typeColors[selectedMove.type], color: 'white' }}>
                        <div className="d-flex justify-content-between">
                          <span><strong>{selectedMove.name}</strong></span>
                          <span>{selectedMove.category === 'physical' ? '⚔️ Physical' : '✨ Special'}</span>
                        </div>
                        <div className="d-flex justify-content-between small">
                          <span>Power: {selectedMove.power}</span>
                          <span>Accuracy: {selectedMove.accuracy}%</span>
                        </div>
                      </div>
                    )}

                    {/* Item */}
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: theme.colors.textSecondary }}>Held Item</Form.Label>
                      <Form.Select
                        value={attackerItem}
                        onChange={(e) => setAttackerItem(e.target.value)}
                        style={{ background: theme.colors.bgPrimary, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                      >
                        <option value="">No Item</option>
                        {HELD_ITEMS.map(item => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    {/* Ability */}
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: theme.colors.textSecondary }}>Ability</Form.Label>
                      <Form.Select
                        value={attackerAbility}
                        onChange={(e) => setAttackerAbility(e.target.value)}
                        style={{ background: theme.colors.bgPrimary, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                      >
                        {attackerPokemon.abilities.map(a => (
                          <option key={a.name} value={a.name}>{a.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    {/* Stat Stages */}
                    <Row className="mb-3">
                      <Col>
                        <Form.Label style={{ color: theme.colors.textSecondary, fontSize: '0.85rem' }}>Atk Stage</Form.Label>
                        <Form.Select
                          size="sm"
                          value={attackerStages.atk}
                          onChange={(e) => setAttackerStages({ ...attackerStages, atk: Number(e.target.value) })}
                          style={{ background: theme.colors.bgPrimary, color: theme.colors.textPrimary }}
                        >
                          {[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6].map(s => (
                            <option key={s} value={s}>{s >= 0 ? `+${s}` : s}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col>
                        <Form.Label style={{ color: theme.colors.textSecondary, fontSize: '0.85rem' }}>SpA Stage</Form.Label>
                        <Form.Select
                          size="sm"
                          value={attackerStages.spa}
                          onChange={(e) => setAttackerStages({ ...attackerStages, spa: Number(e.target.value) })}
                          style={{ background: theme.colors.bgPrimary, color: theme.colors.textPrimary }}
                        >
                          {[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6].map(s => (
                            <option key={s} value={s}>{s >= 0 ? `+${s}` : s}</option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>

                    {/* Status */}
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: theme.colors.textSecondary }}>Status</Form.Label>
                      <Form.Select
                        value={attackerStatus}
                        onChange={(e) => setAttackerStatus(e.target.value)}
                        style={{ background: theme.colors.bgPrimary, color: theme.colors.textPrimary }}
                      >
                        <option value="none">None</option>
                        <option value="burn">Burn</option>
                        <option value="paralysis">Paralysis</option>
                        <option value="poison">Poison</option>
                      </Form.Select>
                    </Form.Group>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Defender Panel */}
          <Col md={5}>
            <Card style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}` }}>
              <Card.Header style={{ background: '#3B82F6', color: 'white', fontWeight: 700 }}>
                <Shield size={18} className="me-2" />
                Defender
              </Card.Header>
              <Card.Body>
                {/* Pokemon Selection */}
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: theme.colors.textSecondary }}>Pokemon</Form.Label>
                  <Form.Select
                    value={defenderPokemon?.id || ''}
                    onChange={(e) => {
                      const p = team.find(p => p.id === Number(e.target.value));
                      setDefenderPokemon(p || null);
                    }}
                    style={{ background: theme.colors.bgPrimary, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                  >
                    <option value="">Select Pokemon from team...</option>
                    {team.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {defenderPokemon && (
                  <>
                    {/* Pokemon Display */}
                    <div className="text-center mb-3">
                      <img
                        src={defenderPokemon.artwork || defenderPokemon.sprite}
                        alt={defenderPokemon.name}
                        style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                      />
                      <div className="d-flex gap-1 justify-content-center mt-2">
                        {defenderPokemon.types.map(type => (
                          <Badge key={type} style={{ background: typeColors[type] }}>{type}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* HP Slider */}
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: theme.colors.textSecondary }}>
                        HP: {defenderHpPercent}%
                      </Form.Label>
                      <Form.Range
                        value={defenderHpPercent}
                        onChange={(e) => setDefenderHpPercent(Number(e.target.value))}
                        min={1}
                        max={100}
                      />
                    </Form.Group>

                    {/* Item */}
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: theme.colors.textSecondary }}>Held Item</Form.Label>
                      <Form.Select
                        value={defenderItem}
                        onChange={(e) => setDefenderItem(e.target.value)}
                        style={{ background: theme.colors.bgPrimary, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                      >
                        <option value="">No Item</option>
                        {HELD_ITEMS.map(item => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    {/* Ability */}
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: theme.colors.textSecondary }}>Ability</Form.Label>
                      <Form.Select
                        value={defenderAbility}
                        onChange={(e) => setDefenderAbility(e.target.value)}
                        style={{ background: theme.colors.bgPrimary, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                      >
                        {defenderPokemon.abilities.map(a => (
                          <option key={a.name} value={a.name}>{a.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    {/* Stat Stages */}
                    <Row className="mb-3">
                      <Col>
                        <Form.Label style={{ color: theme.colors.textSecondary, fontSize: '0.85rem' }}>Def Stage</Form.Label>
                        <Form.Select
                          size="sm"
                          value={defenderStages.def}
                          onChange={(e) => setDefenderStages({ ...defenderStages, def: Number(e.target.value) })}
                          style={{ background: theme.colors.bgPrimary, color: theme.colors.textPrimary }}
                        >
                          {[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6].map(s => (
                            <option key={s} value={s}>{s >= 0 ? `+${s}` : s}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col>
                        <Form.Label style={{ color: theme.colors.textSecondary, fontSize: '0.85rem' }}>SpD Stage</Form.Label>
                        <Form.Select
                          size="sm"
                          value={defenderStages.spd}
                          onChange={(e) => setDefenderStages({ ...defenderStages, spd: Number(e.target.value) })}
                          style={{ background: theme.colors.bgPrimary, color: theme.colors.textPrimary }}
                        >
                          {[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6].map(s => (
                            <option key={s} value={s}>{s >= 0 ? `+${s}` : s}</option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>

                    {/* Screens */}
                    <div className="mb-3">
                      <Form.Label style={{ color: theme.colors.textSecondary }}>Active Screens</Form.Label>
                      <div className="d-flex gap-2 flex-wrap">
                        <Form.Check
                          type="checkbox"
                          label="Reflect"
                          checked={hasReflect}
                          onChange={(e) => setHasReflect(e.target.checked)}
                          style={{ color: theme.colors.textPrimary }}
                        />
                        <Form.Check
                          type="checkbox"
                          label="Light Screen"
                          checked={hasLightScreen}
                          onChange={(e) => setHasLightScreen(e.target.checked)}
                          style={{ color: theme.colors.textPrimary }}
                        />
                        <Form.Check
                          type="checkbox"
                          label="Aurora Veil"
                          checked={hasAuroraVeil}
                          onChange={(e) => setHasAuroraVeil(e.target.checked)}
                          style={{ color: theme.colors.textPrimary }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Field & Results Panel */}
          <Col md={2}>
            <Card style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}`, marginBottom: '16px' }}>
              <Card.Header style={{ background: theme.colors.primary, color: 'white', fontWeight: 700 }}>
                Field
              </Card.Header>
              <Card.Body className="p-2">
                {/* Weather */}
                <Form.Group className="mb-2">
                  <Form.Label style={{ color: theme.colors.textSecondary, fontSize: '0.8rem' }}>Weather</Form.Label>
                  <Form.Select
                    size="sm"
                    value={weather || ''}
                    onChange={(e) => setWeather(e.target.value as WeatherType)}
                    style={{ background: theme.colors.bgPrimary, color: theme.colors.textPrimary }}
                  >
                    <option value="">None</option>
                    <option value="sun">☀️ Sun</option>
                    <option value="rain">🌧️ Rain</option>
                    <option value="sandstorm">🏜️ Sand</option>
                    <option value="snow">❄️ Snow</option>
                  </Form.Select>
                </Form.Group>

                {/* Terrain */}
                <Form.Group className="mb-2">
                  <Form.Label style={{ color: theme.colors.textSecondary, fontSize: '0.8rem' }}>Terrain</Form.Label>
                  <Form.Select
                    size="sm"
                    value={terrain}
                    onChange={(e) => setTerrain(e.target.value)}
                    style={{ background: theme.colors.bgPrimary, color: theme.colors.textPrimary }}
                  >
                    <option value="">None</option>
                    <option value="electric">⚡ Electric</option>
                    <option value="grassy">🌿 Grassy</option>
                    <option value="psychic">🔮 Psychic</option>
                    <option value="misty">🌫️ Misty</option>
                  </Form.Select>
                </Form.Group>

                {/* Format */}
                <Form.Check
                  type="checkbox"
                  label="Doubles"
                  checked={isDoubles}
                  onChange={(e) => setIsDoubles(e.target.checked)}
                  style={{ color: theme.colors.textPrimary, fontSize: '0.85rem' }}
                />
              </Card.Body>
            </Card>

            <Button
              onClick={calculateDamage}
              disabled={!attackerPokemon || !defenderPokemon || !selectedMove}
              style={{ background: theme.gradients.primary, border: 'none', width: '100%', fontWeight: 700 }}
            >
              <Calculator size={16} className="me-1" />
              Calculate
            </Button>
          </Col>
        </Row>

        {/* Results */}
        {calcResult && (
          <Card className="mt-4" style={{ background: theme.colors.bgCard, border: `2px solid ${theme.colors.primary}` }}>
            <Card.Body>
              <h4 style={{ color: theme.colors.textPrimary, marginBottom: '20px' }}>
                <Target size={20} className="me-2" />
                Damage Result
              </h4>

              <Row>
                <Col md={6}>
                  {/* Damage Range */}
                  <div className="mb-4">
                    <h5 style={{ color: theme.colors.textSecondary }}>Damage Range</h5>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: theme.colors.primary }}>
                      {calcResult.minDamage} - {calcResult.maxDamage}
                    </div>
                    <div style={{ color: theme.colors.textSecondary }}>
                      ({((calcResult.minDamage / (defenderStats.hp * defenderHpPercent / 100)) * 100).toFixed(1)}% -
                      {((calcResult.maxDamage / (defenderStats.hp * defenderHpPercent / 100)) * 100).toFixed(1)}% HP)
                    </div>
                  </div>

                  {/* KO Chance */}
                  {getKOMessage() && (
                    <div className="mb-4">
                      <h5 style={{ color: theme.colors.textSecondary }}>KO Chance</h5>
                      <Badge style={{ background: getKOMessage()!.color, fontSize: '1rem', padding: '8px 16px' }}>
                        {getKOMessage()!.text}
                      </Badge>
                      <ProgressBar
                        now={calcResult.koChance}
                        variant={calcResult.koChance >= 75 ? 'success' : calcResult.koChance >= 50 ? 'warning' : 'danger'}
                        className="mt-2"
                        style={{ height: '8px' }}
                      />
                    </div>
                  )}
                </Col>

                <Col md={6}>
                  {/* Modifiers Breakdown */}
                  <h5 style={{ color: theme.colors.textSecondary }}>Modifiers Applied</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {calcResult.stab && (
                      <Badge bg="warning">STAB (1.5x)</Badge>
                    )}
                    {calcResult.effectiveness > 1 && (
                      <Badge bg="danger">{calcResult.effectiveness}x Super Effective</Badge>
                    )}
                    {calcResult.effectiveness < 1 && calcResult.effectiveness > 0 && (
                      <Badge bg="secondary">{calcResult.effectiveness}x Resisted</Badge>
                    )}
                    {calcResult.weatherBoost !== 1 && (
                      <Badge bg="info">Weather {calcResult.weatherBoost}x</Badge>
                    )}
                    {calcResult.terrainBoost !== 1 && (
                      <Badge bg="success">Terrain {calcResult.terrainBoost}x</Badge>
                    )}
                    {calcResult.abilityModifier !== 1 && (
                      <Badge bg="purple" style={{ background: '#8B5CF6' }}>Ability {calcResult.abilityModifier}x</Badge>
                    )}
                    {calcResult.itemModifier !== 1 && (
                      <Badge bg="primary">Item {calcResult.itemModifier}x</Badge>
                    )}
                    {calcResult.burnPenalty && (
                      <Badge bg="danger">Burn (0.5x)</Badge>
                    )}
                    {calcResult.screenReduction && (
                      <Badge bg="info">Screen Active</Badge>
                    )}
                    {calcResult.isCritical && (
                      <Badge bg="warning">Critical Hit!</Badge>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mt-4 p-3 rounded" style={{ background: theme.colors.bgPrimary }}>
                    <p style={{ color: theme.colors.textPrimary, margin: 0, fontStyle: 'italic' }}>
                      {calcResult.description}
                    </p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
}
