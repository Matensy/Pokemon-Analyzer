import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { Trash2, Sparkles, Download, Upload } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useTeamStore } from '../store/teamStore';
import { analyzeTeam } from '../services/aiAnalysisService';
import PokemonCard from '../components/PokemonCard';
import { typeColors } from '../styles/themes';

export default function TeamBuilder() {
  const { theme } = useThemeStore();
  const { team, removePokemon, clearTeam } = useTeamStore();

  const analysis = analyzeTeam(team);

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.info;
    if (score >= 40) return theme.colors.warning;
    return theme.colors.error;
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'danger';
    if (priority === 'medium') return 'warning';
    return 'info';
  };

  return (
    <div style={{ background: theme.colors.bgPrimary, minHeight: '100vh', paddingTop: '30px' }}>
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 style={{ color: theme.colors.textPrimary, fontWeight: 700 }}>
              Team Builder
            </h1>
            <p style={{ color: theme.colors.textSecondary }}>
              Build your competitive team ({team.length}/6)
            </p>
          </div>

          <div className="d-flex gap-2">
            <Button variant="outline-danger" onClick={clearTeam} disabled={team.length === 0}>
              <Trash2 size={18} className="me-2" />
              Clear Team
            </Button>
          </div>
        </div>

        <Row>
          {/* Team Pokemon */}
          <Col lg={8}>
            <div
              className="p-4 mb-4"
              style={{
                background: theme.colors.bgCard,
                borderRadius: '16px',
                border: `1px solid ${theme.colors.border}`,
                minHeight: '400px',
              }}
            >
              <h4 style={{ color: theme.colors.textPrimary, marginBottom: '20px' }}>
                Your Team
              </h4>

              {team.length === 0 ? (
                <div className="text-center py-5">
                  <p style={{ color: theme.colors.textSecondary, fontSize: '1.1rem' }}>
                    No Pokemon in your team yet. Add Pokemon from the Pokédex!
                  </p>
                </div>
              ) : (
                <Row xs={1} md={2} lg={3} className="g-3">
                  {team.map((pokemon) => (
                    <Col key={pokemon.id}>
                      <div className="position-relative">
                        <PokemonCard pokemon={pokemon} />
                        <Button
                          variant="danger"
                          size="sm"
                          className="position-absolute top-0 end-0 m-2"
                          onClick={() => removePokemon(pokemon.id)}
                          style={{ zIndex: 10 }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </Col>
                  ))}

                  {/* Empty slots */}
                  {Array.from({ length: 6 - team.length }).map((_, i) => (
                    <Col key={`empty-${i}`}>
                      <div
                        style={{
                          background: theme.colors.bgTertiary,
                          border: `2px dashed ${theme.colors.border}`,
                          borderRadius: '16px',
                          height: '100%',
                          minHeight: '300px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span style={{ color: theme.colors.textMuted, fontSize: '2rem' }}>
                          +
                        </span>
                      </div>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </Col>

          {/* AI Analysis */}
          <Col lg={4}>
            <div
              className="p-4 mb-4"
              style={{
                background: theme.colors.bgCard,
                borderRadius: '16px',
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <div className="d-flex align-items-center mb-3">
                <Sparkles size={20} color={theme.colors.primary} className="me-2" />
                <h4 style={{ color: theme.colors.textPrimary, margin: 0 }}>
                  AI Analysis
                </h4>
              </div>

              {/* Overall Score */}
              <div className="text-center mb-4">
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    margin: '0 auto',
                    borderRadius: '50%',
                    background: `conic-gradient(${getScoreColor(analysis.overallScore)} ${analysis.overallScore}%, ${theme.colors.bgTertiary} 0)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      background: theme.colors.bgCard,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: getScoreColor(analysis.overallScore) }}>
                      {analysis.overallScore}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: theme.colors.textSecondary }}>
                      Score
                    </div>
                  </div>
                </div>
              </div>

              {/* Weaknesses */}
              {analysis.weaknesses.length > 0 && (
                <div className="mb-4">
                  <h6 style={{ color: theme.colors.textPrimary, marginBottom: '12px' }}>
                    ⚠️ Shared Weaknesses
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {analysis.weaknesses.map((w) => (
                      <Badge
                        key={w.type}
                        bg=""
                        style={{
                          background: typeColors[w.type],
                          padding: '8px 12px',
                          fontSize: '0.85rem',
                        }}
                      >
                        {w.type} ({w.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {analysis.strengths.length > 0 && (
                <div className="mb-4">
                  <h6 style={{ color: theme.colors.textPrimary, marginBottom: '12px' }}>
                    ✅ Team Strengths
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {analysis.strengths.map((type) => (
                      <Badge
                        key={type}
                        bg=""
                        style={{
                          background: typeColors[type],
                          padding: '8px 12px',
                          fontSize: '0.85rem',
                        }}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Synergies */}
              {analysis.synergies.length > 0 && (
                <div className="mb-4">
                  <h6 style={{ color: theme.colors.textPrimary, marginBottom: '12px' }}>
                    🔗 Synergies
                  </h6>
                  {analysis.synergies.slice(0, 3).map((syn, i) => (
                    <Alert
                      key={i}
                      variant="info"
                      style={{
                        background: `${theme.colors.info}22`,
                        border: `1px solid ${theme.colors.info}`,
                        fontSize: '0.85rem',
                        marginBottom: '8px',
                      }}
                    >
                      <strong>{syn.pokemon1}</strong> + <strong>{syn.pokemon2}</strong>
                      <br />
                      <small>{syn.description}</small>
                    </Alert>
                  ))}
                </div>
              )}

              {/* AI Recommendations */}
              {analysis.recommendations.length > 0 && (
                <div className="mb-4">
                  <h6 style={{ color: theme.colors.textPrimary, marginBottom: '12px' }}>
                    💡 AI Recommendations
                  </h6>
                  {analysis.recommendations.slice(0, 4).map((rec, i) => (
                    <Alert
                      key={i}
                      variant={getPriorityColor(rec.priority)}
                      style={{ fontSize: '0.85rem', marginBottom: '8px' }}
                    >
                      {rec.message}
                    </Alert>
                  ))}
                </div>
              )}

              {/* Threats */}
              {analysis.threats.length > 0 && (
                <div>
                  <h6 style={{ color: theme.colors.textPrimary, marginBottom: '12px' }}>
                    🎯 Meta Threats
                  </h6>
                  {analysis.threats.slice(0, 3).map((threat, i) => (
                    <Alert
                      key={i}
                      variant={threat.severity === 'critical' ? 'danger' : 'warning'}
                      style={{ fontSize: '0.85rem', marginBottom: '8px' }}
                    >
                      <strong>{threat.pokemon}</strong>
                      <br />
                      <small>{threat.reason}</small>
                    </Alert>
                  ))}
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
