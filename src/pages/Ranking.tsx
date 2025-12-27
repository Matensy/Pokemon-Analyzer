import { useState } from 'react';
import { Container, Row, Col, Card, Badge, ProgressBar, Button, Modal, Form, Table } from 'react-bootstrap';
import { Award, TrendingUp, TrendingDown, Trophy, Target, Flame, RotateCcw, Edit3, History, Star, Zap } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useRankingStore, getRankInfo, getNextRank, getEloProgress } from '../store/rankingStore';
import { RankTier } from '../types/battle';

export default function Ranking() {
  const { theme } = useThemeStore();
  const { player, updateUsername, resetStats, getWinRate, getStreak } = useRankingStore();
  const [showResetModal, setShowResetModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newUsername, setNewUsername] = useState(player.username);

  const rankInfo = getRankInfo(player.rank);
  const nextRank = getNextRank(player.rank);
  const eloProgress = getEloProgress(player.elo);
  const winRate = getWinRate();
  const streak = getStreak();
  const totalMatches = player.wins + player.losses + player.draws;

  const handleSaveUsername = () => {
    if (newUsername.trim()) {
      updateUsername(newUsername.trim());
      setShowEditModal(false);
    }
  };

  const handleReset = () => {
    resetStats();
    setShowResetModal(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRankBadge = (rank: RankTier) => {
    const info = getRankInfo(rank);
    return (
      <Badge style={{ background: info.gradient, padding: '6px 12px', fontSize: '0.85rem' }}>
        {info.icon} {rank}
      </Badge>
    );
  };

  return (
    <div style={{ background: theme.colors.bgPrimary, minHeight: '100vh', padding: '24px' }}>
      <Container>
        <div className="text-center mb-4">
          <h1 style={{ color: theme.colors.textPrimary, fontWeight: 800 }}>
            <Award size={32} className="me-2" />
            Trainer Rankings
          </h1>
          <p style={{ color: theme.colors.textSecondary }}>
            Track your battle performance and climb the ranks
          </p>
        </div>

        <Row className="g-4">
          {/* Main Profile Card */}
          <Col lg={5}>
            <Card style={{
              background: theme.colors.bgCard,
              border: `1px solid ${theme.colors.border}`,
              overflow: 'hidden'
            }}>
              {/* Rank Header */}
              <div style={{
                background: rankInfo.gradient,
                padding: '30px 20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>
                  {rankInfo.icon}
                </div>
                <h2 style={{ color: 'white', fontWeight: 800, marginBottom: '5px' }}>
                  {player.rank}
                </h2>
                <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.5rem', fontWeight: 600 }}>
                  {player.elo} ELO
                </div>
              </div>

              <Card.Body>
                {/* Username */}
                <div className="text-center mb-4">
                  <h3 style={{ color: theme.colors.textPrimary, marginBottom: '5px' }}>
                    {player.username}
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setNewUsername(player.username);
                        setShowEditModal(true);
                      }}
                      style={{ color: theme.colors.textMuted }}
                    >
                      <Edit3 size={16} />
                    </Button>
                  </h3>
                  <span style={{ color: theme.colors.textMuted, fontSize: '0.85rem' }}>
                    Trainer since {formatDate(player.createdAt)}
                  </span>
                </div>

                {/* ELO Progress to Next Rank */}
                {nextRank && (
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span style={{ color: theme.colors.textSecondary, fontSize: '0.85rem' }}>
                        Progress to {nextRank.rank}
                      </span>
                      <span style={{ color: theme.colors.textMuted, fontSize: '0.85rem' }}>
                        {nextRank.eloNeeded - player.elo} ELO needed
                      </span>
                    </div>
                    <ProgressBar
                      now={eloProgress.progress}
                      style={{ height: '10px' }}
                      variant="warning"
                    />
                    <div className="d-flex justify-content-between mt-1">
                      <span style={{ color: theme.colors.textMuted, fontSize: '0.75rem' }}>
                        {eloProgress.current}
                      </span>
                      <span style={{ color: theme.colors.textMuted, fontSize: '0.75rem' }}>
                        {eloProgress.next}
                      </span>
                    </div>
                  </div>
                )}

                {/* Stats Grid */}
                <Row className="g-3 mb-4">
                  <Col xs={6}>
                    <div className="text-center p-3 rounded" style={{ background: theme.colors.bgPrimary }}>
                      <Trophy size={24} style={{ color: '#22C55E', marginBottom: '8px' }} />
                      <div style={{ color: '#22C55E', fontSize: '1.5rem', fontWeight: 800 }}>
                        {player.wins}
                      </div>
                      <div style={{ color: theme.colors.textMuted, fontSize: '0.8rem' }}>Wins</div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="text-center p-3 rounded" style={{ background: theme.colors.bgPrimary }}>
                      <Target size={24} style={{ color: '#EF4444', marginBottom: '8px' }} />
                      <div style={{ color: '#EF4444', fontSize: '1.5rem', fontWeight: 800 }}>
                        {player.losses}
                      </div>
                      <div style={{ color: theme.colors.textMuted, fontSize: '0.8rem' }}>Losses</div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="text-center p-3 rounded" style={{ background: theme.colors.bgPrimary }}>
                      <Zap size={24} style={{ color: '#F59E0B', marginBottom: '8px' }} />
                      <div style={{ color: theme.colors.textPrimary, fontSize: '1.5rem', fontWeight: 800 }}>
                        {winRate}%
                      </div>
                      <div style={{ color: theme.colors.textMuted, fontSize: '0.8rem' }}>Win Rate</div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="text-center p-3 rounded" style={{ background: theme.colors.bgPrimary }}>
                      <Flame size={24} style={{ color: '#EC4899', marginBottom: '8px' }} />
                      <div style={{ color: theme.colors.textPrimary, fontSize: '1.5rem', fontWeight: 800 }}>
                        {streak.current}
                      </div>
                      <div style={{ color: theme.colors.textMuted, fontSize: '0.8rem' }}>Win Streak</div>
                    </div>
                  </Col>
                </Row>

                {/* Best Streak */}
                {streak.best > 0 && (
                  <div className="text-center p-3 rounded mb-3" style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: 'white'
                  }}>
                    <Star size={20} className="me-2" />
                    Best Win Streak: <strong>{streak.best}</strong>
                  </div>
                )}

                {/* Reset Button */}
                <Button
                  variant="outline-danger"
                  className="w-100"
                  onClick={() => setShowResetModal(true)}
                >
                  <RotateCcw size={16} className="me-2" />
                  Reset Stats
                </Button>
              </Card.Body>
            </Card>

            {/* Rank Tiers Info */}
            <Card className="mt-4" style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}` }}>
              <Card.Header style={{ background: theme.colors.bgPrimary, color: theme.colors.textPrimary, fontWeight: 700 }}>
                <Award size={18} className="me-2" />
                Rank Tiers
              </Card.Header>
              <Card.Body className="p-0">
                {['Legend', 'Elite', 'Champion', 'Master Ball', 'Ultra Ball', 'Great Ball', 'Poke Ball'].map((rank) => {
                  const info = getRankInfo(rank as RankTier);
                  const isCurrentRank = player.rank === rank;
                  const thresholds: Record<string, number> = {
                    'Legend': 1800, 'Elite': 1600, 'Champion': 1400,
                    'Master Ball': 1200, 'Ultra Ball': 1000, 'Great Ball': 800, 'Poke Ball': 0
                  };
                  return (
                    <div
                      key={rank}
                      className="d-flex align-items-center justify-content-between p-3"
                      style={{
                        background: isCurrentRank ? `${info.color}20` : 'transparent',
                        borderLeft: isCurrentRank ? `4px solid ${info.color}` : '4px solid transparent',
                        borderBottom: `1px solid ${theme.colors.border}`
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '1.2rem' }}>{info.icon}</span>
                        <span style={{
                          color: isCurrentRank ? info.color : theme.colors.textPrimary,
                          fontWeight: isCurrentRank ? 700 : 500
                        }}>
                          {rank}
                        </span>
                      </div>
                      <Badge style={{ background: theme.colors.bgPrimary, color: theme.colors.textSecondary }}>
                        {thresholds[rank]}+ ELO
                      </Badge>
                    </div>
                  );
                })}
              </Card.Body>
            </Card>
          </Col>

          {/* Match History */}
          <Col lg={7}>
            <Card style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}` }}>
              <Card.Header style={{ background: theme.colors.bgPrimary, color: theme.colors.textPrimary, fontWeight: 700 }}>
                <History size={18} className="me-2" />
                Match History
                <Badge bg="secondary" className="ms-2">{totalMatches} matches</Badge>
              </Card.Header>
              <Card.Body className="p-0">
                {player.matchHistory.length === 0 ? (
                  <div className="text-center p-5">
                    <Trophy size={48} style={{ color: theme.colors.textMuted, marginBottom: '16px' }} />
                    <h5 style={{ color: theme.colors.textSecondary }}>No Battles Yet</h5>
                    <p style={{ color: theme.colors.textMuted }}>
                      Start battling to build your match history!
                    </p>
                    <Button variant="primary" href="/Pokemon-Analyzer/battle">
                      Start Battle
                    </Button>
                  </div>
                ) : (
                  <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <Table hover responsive className="mb-0" style={{ color: theme.colors.textPrimary }}>
                      <thead style={{ background: theme.colors.bgPrimary, position: 'sticky', top: 0 }}>
                        <tr>
                          <th style={{ color: theme.colors.textSecondary }}>Result</th>
                          <th style={{ color: theme.colors.textSecondary }}>Format</th>
                          <th style={{ color: theme.colors.textSecondary }}>Team</th>
                          <th style={{ color: theme.colors.textSecondary }}>ELO</th>
                          <th style={{ color: theme.colors.textSecondary }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {player.matchHistory.map((match) => (
                          <tr key={match.id}>
                            <td>
                              {match.result === 'win' ? (
                                <Badge bg="success" className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                                  <TrendingUp size={14} /> WIN
                                </Badge>
                              ) : match.result === 'loss' ? (
                                <Badge bg="danger" className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                                  <TrendingDown size={14} /> LOSS
                                </Badge>
                              ) : (
                                <Badge bg="secondary">DRAW</Badge>
                              )}
                            </td>
                            <td>
                              <Badge style={{ background: theme.colors.bgPrimary, color: theme.colors.textPrimary }}>
                                {match.format}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex gap-1 flex-wrap">
                                {match.playerTeam.slice(0, 4).map((pokemon, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      fontSize: '0.75rem',
                                      color: theme.colors.textSecondary,
                                      textTransform: 'capitalize'
                                    }}
                                  >
                                    {pokemon.replace(/-/g, ' ')}{i < Math.min(match.playerTeam.length, 4) - 1 ? ',' : ''}
                                  </span>
                                ))}
                                {match.playerTeam.length > 4 && (
                                  <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>
                                    +{match.playerTeam.length - 4}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <span style={{
                                color: match.eloChange >= 0 ? '#22C55E' : '#EF4444',
                                fontWeight: 600
                              }}>
                                {match.eloChange >= 0 ? '+' : ''}{match.eloChange}
                              </span>
                            </td>
                            <td style={{ color: theme.colors.textMuted, fontSize: '0.85rem' }}>
                              {formatDate(match.date)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Quick Stats */}
            {totalMatches > 0 && (
              <Row className="g-3 mt-3">
                <Col md={4}>
                  <Card style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}` }}>
                    <Card.Body className="text-center">
                      <div style={{ color: theme.colors.textMuted, fontSize: '0.85rem' }}>Total Matches</div>
                      <div style={{ color: theme.colors.textPrimary, fontSize: '1.5rem', fontWeight: 700 }}>
                        {totalMatches}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}` }}>
                    <Card.Body className="text-center">
                      <div style={{ color: theme.colors.textMuted, fontSize: '0.85rem' }}>Draws</div>
                      <div style={{ color: theme.colors.textPrimary, fontSize: '1.5rem', fontWeight: 700 }}>
                        {player.draws}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card style={{ background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}` }}>
                    <Card.Body className="text-center">
                      <div style={{ color: theme.colors.textMuted, fontSize: '0.85rem' }}>Avg ELO Change</div>
                      <div style={{
                        color: player.matchHistory.length > 0
                          ? (player.matchHistory.reduce((sum, m) => sum + m.eloChange, 0) / player.matchHistory.length) >= 0
                            ? '#22C55E'
                            : '#EF4444'
                          : theme.colors.textPrimary,
                        fontSize: '1.5rem',
                        fontWeight: 700
                      }}>
                        {player.matchHistory.length > 0
                          ? (player.matchHistory.reduce((sum, m) => sum + m.eloChange, 0) / player.matchHistory.length).toFixed(1)
                          : 0}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
          </Col>
        </Row>

        {/* Reset Confirmation Modal */}
        <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
          <Modal.Header closeButton style={{ background: theme.colors.bgCard, borderColor: theme.colors.border }}>
            <Modal.Title style={{ color: theme.colors.textPrimary }}>Reset Stats?</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: theme.colors.bgCard, color: theme.colors.textSecondary }}>
            This will permanently delete all your battle history and reset your ELO to 1000. This action cannot be undone.
          </Modal.Body>
          <Modal.Footer style={{ background: theme.colors.bgCard, borderColor: theme.colors.border }}>
            <Button variant="secondary" onClick={() => setShowResetModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReset}>
              Reset Everything
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Username Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Modal.Header closeButton style={{ background: theme.colors.bgCard, borderColor: theme.colors.border }}>
            <Modal.Title style={{ color: theme.colors.textPrimary }}>Edit Username</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: theme.colors.bgCard }}>
            <Form.Control
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter your trainer name"
              maxLength={20}
              style={{
                background: theme.colors.bgPrimary,
                color: theme.colors.textPrimary,
                border: `1px solid ${theme.colors.border}`
              }}
            />
          </Modal.Body>
          <Modal.Footer style={{ background: theme.colors.bgCard, borderColor: theme.colors.border }}>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveUsername}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}
