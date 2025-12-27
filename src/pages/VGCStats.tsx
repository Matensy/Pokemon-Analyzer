import { useState } from 'react';
import { Container, Row, Col, Card, Badge, ProgressBar, Form, Tab, Tabs } from 'react-bootstrap';
import { TrendingUp, Award, Users, Target, Shield, Swords, BarChart3, ChevronRight } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { VGC_USAGE_DATA, TEAM_ARCHETYPES, SPEED_TIERS, UsageData, TeamArchetype } from '../data/vgcStats';
import { typeColors } from '../styles/themes';
import MatchupChart from '../components/MatchupChart';

export default function VGCStats() {
  const { theme } = useThemeStore();
  const [selectedTier, setSelectedTier] = useState<'all' | 'S' | 'A' | 'B' | 'C' | 'D'>('all');
  const [selectedPokemon, setSelectedPokemon] = useState<UsageData | null>(null);

  const filteredPokemon = selectedTier === 'all'
    ? VGC_USAGE_DATA
    : VGC_USAGE_DATA.filter(p => p.tier === selectedTier);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S': return '#FFD700';
      case 'A': return '#EF4444';
      case 'B': return '#3B82F6';
      case 'C': return '#22C55E';
      case 'D': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  return (
    <div style={{ background: theme.colors.bgPrimary, minHeight: '100vh', padding: '24px' }}>
      <Container>
        <div className="text-center mb-4">
          <h1 style={{ color: theme.colors.textPrimary, fontWeight: 800 }}>
            <BarChart3 size={32} className="me-2" />
            VGC Usage Statistics
          </h1>
          <p style={{ color: theme.colors.textSecondary }}>
            Meta analysis and usage data for competitive VGC battles
          </p>
        </div>

        <Tabs defaultActiveKey="usage" className="mb-4">
          {/* Usage Tab */}
          <Tab eventKey="usage" title={<span><TrendingUp size={16} className="me-1"/>Usage Rates</span>}>
            {/* Tier Filter */}
            <div className="d-flex gap-2 mb-4 flex-wrap">
              {['all', 'S', 'A', 'B', 'C', 'D'].map(tier => (
                <Badge
                  key={tier}
                  onClick={() => setSelectedTier(tier as any)}
                  style={{
                    background: selectedTier === tier ? getTierColor(tier === 'all' ? 'S' : tier) : theme.colors.bgCard,
                    color: selectedTier === tier ? 'white' : theme.colors.textSecondary,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    border: `1px solid ${theme.colors.border}`
                  }}
                >
                  {tier === 'all' ? 'All Tiers' : `${tier} Tier`}
                </Badge>
              ))}
            </div>

            <Row>
              {/* Pokemon List */}
              <Col lg={selectedPokemon ? 6 : 12}>
                <Row xs={1} md={2} lg={selectedPokemon ? 1 : 3} className="g-3">
                  {filteredPokemon.map((pokemon, index) => (
                    <Col key={pokemon.pokemon}>
                      <Card
                        onClick={() => setSelectedPokemon(pokemon)}
                        style={{
                          background: selectedPokemon?.pokemon === pokemon.pokemon
                            ? `${theme.colors.primary}20`
                            : theme.colors.bgCard,
                          border: `2px solid ${selectedPokemon?.pokemon === pokemon.pokemon ? theme.colors.primary : theme.colors.border}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        className="p-3"
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: getTierColor(pokemon.tier),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 800,
                              fontSize: '0.9rem'
                            }}
                          >
                            #{index + 1}
                          </div>
                          <div className="flex-grow-1">
                            <div style={{ color: theme.colors.textPrimary, fontWeight: 700, textTransform: 'capitalize' }}>
                              {pokemon.pokemon.replace(/-/g, ' ')}
                            </div>
                            <div className="d-flex gap-2 align-items-center">
                              <Badge style={{ background: getTierColor(pokemon.tier) }}>{pokemon.tier}</Badge>
                              <span style={{ color: theme.colors.textSecondary, fontSize: '0.85rem' }}>
                                {pokemon.usagePercent}% usage
                              </span>
                            </div>
                          </div>
                          <div className="text-end">
                            <div style={{ color: pokemon.winRate >= 50 ? '#22C55E' : '#EF4444', fontWeight: 600 }}>
                              {pokemon.winRate}%
                            </div>
                            <div style={{ color: theme.colors.textMuted, fontSize: '0.75rem' }}>Win Rate</div>
                          </div>
                          <ChevronRight size={20} style={{ color: theme.colors.textMuted }} />
                        </div>
                        <ProgressBar
                          now={pokemon.usagePercent}
                          variant={pokemon.tier === 'S' ? 'warning' : pokemon.tier === 'A' ? 'danger' : 'primary'}
                          style={{ height: '4px', marginTop: '12px' }}
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Col>

              {/* Pokemon Detail */}
              {selectedPokemon && (
                <Col lg={6}>
                  <Card style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}`, position: 'sticky', top: '100px' }}>
                    <Card.Header style={{ background: getTierColor(selectedPokemon.tier), color: 'white' }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0 text-capitalize">{selectedPokemon.pokemon.replace(/-/g, ' ')}</h4>
                        <Badge bg="light" text="dark">{selectedPokemon.tier} Tier</Badge>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      {/* Stats */}
                      <Row className="mb-4">
                        <Col xs={6}>
                          <div className="text-center p-3 rounded" style={{ background: theme.colors.bgPrimary }}>
                            <div style={{ color: theme.colors.textPrimary, fontSize: '1.5rem', fontWeight: 800 }}>
                              {selectedPokemon.usagePercent}%
                            </div>
                            <div style={{ color: theme.colors.textSecondary, fontSize: '0.85rem' }}>Usage Rate</div>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="text-center p-3 rounded" style={{ background: theme.colors.bgPrimary }}>
                            <div style={{
                              color: selectedPokemon.winRate >= 50 ? '#22C55E' : '#EF4444',
                              fontSize: '1.5rem',
                              fontWeight: 800
                            }}>
                              {selectedPokemon.winRate}%
                            </div>
                            <div style={{ color: theme.colors.textSecondary, fontSize: '0.85rem' }}>Win Rate</div>
                          </div>
                        </Col>
                      </Row>

                      {/* Roles */}
                      <div className="mb-4">
                        <h6 style={{ color: theme.colors.textSecondary }}>
                          <Target size={16} className="me-1" /> Roles
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                          {selectedPokemon.role.map(role => (
                            <Badge key={role} bg="primary" style={{ textTransform: 'capitalize' }}>
                              {role.replace(/-/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Common Moves */}
                      <div className="mb-4">
                        <h6 style={{ color: theme.colors.textSecondary }}>
                          <Swords size={16} className="me-1" /> Common Moves
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                          {selectedPokemon.commonMoves.slice(0, 6).map(move => (
                            <Badge key={move} style={{ background: theme.colors.bgPrimary, color: theme.colors.textPrimary }}>
                              {move.replace(/-/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Common Items */}
                      <div className="mb-4">
                        <h6 style={{ color: theme.colors.textSecondary }}>Common Items</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {selectedPokemon.commonItems.map(item => (
                            <Badge key={item} style={{ background: '#F59E0B', color: 'white' }}>
                              {item.replace(/-/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Teammates */}
                      <div className="mb-4">
                        <h6 style={{ color: theme.colors.textSecondary }}>
                          <Users size={16} className="me-1" /> Common Teammates
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                          {selectedPokemon.commonTeammates.map(teammate => (
                            <Badge
                              key={teammate}
                              style={{ background: '#22C55E', color: 'white', textTransform: 'capitalize' }}
                            >
                              {teammate.replace(/-/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Counters & Checks */}
                      <Row>
                        <Col xs={6}>
                          <h6 style={{ color: '#EF4444' }}>
                            <Shield size={16} className="me-1" /> Counters
                          </h6>
                          <div className="d-flex flex-wrap gap-1">
                            {selectedPokemon.counters.map(counter => (
                              <Badge
                                key={counter}
                                style={{ background: '#EF444420', color: '#EF4444', fontSize: '0.75rem' }}
                              >
                                {counter.replace(/-/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </Col>
                        <Col xs={6}>
                          <h6 style={{ color: '#F59E0B' }}>Checks</h6>
                          <div className="d-flex flex-wrap gap-1">
                            {selectedPokemon.checks.map(check => (
                              <Badge
                                key={check}
                                style={{ background: '#F59E0B20', color: '#F59E0B', fontSize: '0.75rem' }}
                              >
                                {check.replace(/-/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
          </Tab>

          {/* Team Archetypes Tab */}
          <Tab eventKey="archetypes" title={<span><Users size={16} className="me-1"/>Team Archetypes</span>}>
            <Row xs={1} md={2} className="g-4">
              {TEAM_ARCHETYPES.map((archetype) => (
                <Col key={archetype.name}>
                  <Card style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}`, height: '100%' }}>
                    <Card.Header style={{ background: theme.colors.primary, color: 'white', fontWeight: 700 }}>
                      {archetype.name}
                    </Card.Header>
                    <Card.Body>
                      <p style={{ color: theme.colors.textSecondary, marginBottom: '16px' }}>
                        {archetype.description}
                      </p>

                      <h6 style={{ color: theme.colors.textPrimary }}>Core Members</h6>
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {archetype.coreMembers.map(member => (
                          <Badge
                            key={member}
                            style={{ background: theme.colors.bgPrimary, color: theme.colors.textPrimary, textTransform: 'capitalize' }}
                          >
                            {member.replace(/-/g, ' ')}
                          </Badge>
                        ))}
                      </div>

                      <h6 style={{ color: theme.colors.textPrimary }}>Strategy</h6>
                      <p style={{ color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
                        {archetype.strategy}
                      </p>

                      <Row className="mt-3">
                        <Col xs={6}>
                          <h6 style={{ color: '#22C55E' }}>Strengths</h6>
                          <ul style={{ color: theme.colors.textSecondary, fontSize: '0.85rem', paddingLeft: '20px' }}>
                            {archetype.strengths.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </Col>
                        <Col xs={6}>
                          <h6 style={{ color: '#EF4444' }}>Weaknesses</h6>
                          <ul style={{ color: theme.colors.textSecondary, fontSize: '0.85rem', paddingLeft: '20px' }}>
                            {archetype.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                          </ul>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Tab>

          {/* Speed Tiers Tab */}
          <Tab eventKey="speed" title={<span><TrendingUp size={16} className="me-1"/>Speed Tiers</span>}>
            <Card style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}` }}>
              <Card.Body>
                <p style={{ color: theme.colors.textSecondary, marginBottom: '24px' }}>
                  Understanding speed tiers is crucial for VGC. These are base speeds at level 50.
                </p>

                {SPEED_TIERS.map((tier, index) => (
                  <div
                    key={tier.tier}
                    className="mb-4 p-3 rounded"
                    style={{ background: theme.colors.bgPrimary }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 style={{ color: theme.colors.textPrimary, margin: 0 }}>{tier.tier}</h5>
                      <Badge style={{ background: theme.colors.primary }}>
                        {tier.minSpeed}+ Base Speed
                      </Badge>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {tier.pokemon.map(p => (
                        <Badge
                          key={p}
                          style={{
                            background: theme.colors.bgCard,
                            color: theme.colors.textPrimary,
                            textTransform: 'capitalize',
                            padding: '6px 12px'
                          }}
                        >
                          {p.replace(/-/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                    <ProgressBar
                      now={(tier.minSpeed / 180) * 100}
                      variant={index === 0 ? 'danger' : index <= 2 ? 'warning' : 'primary'}
                      style={{ height: '4px', marginTop: '12px' }}
                    />
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Tab>

          {/* Type Chart Tab */}
          <Tab eventKey="types" title={<span><Shield size={16} className="me-1"/>Type Chart</span>}>
            <MatchupChart showFullChart={true} />
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
}
