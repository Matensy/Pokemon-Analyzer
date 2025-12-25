import { useState } from 'react';
import { Modal, Button, Card, Row, Col, Badge, Alert } from 'react-bootstrap';
import { Pokemon, Move } from '../types/pokemon';
import { useThemeStore } from '../store/themeStore';
import { typeColors } from '../styles/themes';

interface MovesetSelectorProps {
  pokemon: Pokemon;
  onConfirm: (selectedMoves: Move[]) => void;
  show: boolean;
  onHide: () => void;
}

export default function MovesetSelector({ pokemon, onConfirm, show, onHide }: MovesetSelectorProps) {
  const { theme } = useThemeStore();
  const [selectedMoves, setSelectedMoves] = useState<Move[]>([]);

  const availableMoves = pokemon.moves.filter(m => m.power && m.power > 0);

  const toggleMove = (move: Move) => {
    if (selectedMoves.find(m => m.name === move.name)) {
      setSelectedMoves(selectedMoves.filter(m => m.name !== move.name));
    } else if (selectedMoves.length < 4) {
      setSelectedMoves([...selectedMoves, move]);
    }
  };

  const handleConfirm = () => {
    if (selectedMoves.length === 4) {
      onConfirm(selectedMoves);
      onHide();
    }
  };

  const getMoveCategoryIcon = (category: string) => {
    if (category === 'physical') return '⚔️';
    if (category === 'special') return '✨';
    return '🔧';
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header
        closeButton
        style={{
          background: theme.colors.bgCard,
          borderBottom: `2px solid ${theme.colors.border}`,
        }}
      >
        <Modal.Title style={{ color: theme.colors.textPrimary }}>
          <img src={pokemon.sprite} alt={pokemon.name} style={{ width: '48px', marginRight: '12px' }} />
          Select 4 Moves for {pokemon.name}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ background: theme.colors.bgPrimary, maxHeight: '70vh', overflowY: 'auto' }}>
        <Alert variant="info" className="mb-4">
          <strong>Selected: {selectedMoves.length}/4</strong>
          <div className="mt-2">
            {selectedMoves.map((move, i) => (
              <Badge
                key={i}
                style={{ background: typeColors[move.type], marginRight: '8px', fontSize: '0.9rem' }}
              >
                {move.name}
              </Badge>
            ))}
          </div>
        </Alert>

        <Row xs={1} md={2} className="g-3">
          {availableMoves.map((move, index) => {
            const isSelected = selectedMoves.find(m => m.name === move.name);
            const hasSTAB = pokemon.types.includes(move.type);

            return (
              <Col key={index}>
                <Card
                  onClick={() => toggleMove(move)}
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${typeColors[move.type]}, ${typeColors[move.type]}CC)`
                      : theme.colors.bgCard,
                    border: `2px solid ${isSelected ? typeColors[move.type] : theme.colors.border}`,
                    cursor: 'pointer',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    boxShadow: isSelected ? `0 0 20px ${typeColors[move.type]}80` : 'none',
                  }}
                  className="h-100"
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h5 style={{ color: isSelected ? '#FFFFFF' : theme.colors.textPrimary, marginBottom: '4px' }}>
                          {getMoveCategoryIcon(move.category)} {move.name}
                        </h5>
                        <div className="d-flex gap-2 flex-wrap">
                          <Badge style={{ background: typeColors[move.type] }}>
                            {move.type.toUpperCase()}
                          </Badge>
                          {hasSTAB && (
                            <Badge bg="warning" text="dark">
                              STAB 1.5x
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            background: '#4CAF50',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </div>

                    <div className="mb-2">
                      <small style={{ color: isSelected ? '#FFFFFFCC' : theme.colors.textSecondary }}>
                        {move.description}
                      </small>
                    </div>

                    <div className="d-flex justify-content-between mt-3">
                      <div>
                        <small style={{ color: isSelected ? '#FFFFFF' : theme.colors.textSecondary }}>
                          <strong>Power:</strong> {move.power || '-'}
                        </small>
                      </div>
                      <div>
                        <small style={{ color: isSelected ? '#FFFFFF' : theme.colors.textSecondary }}>
                          <strong>Accuracy:</strong> {move.accuracy || '-'}%
                        </small>
                      </div>
                      <div>
                        <small style={{ color: isSelected ? '#FFFFFF' : theme.colors.textSecondary }}>
                          <strong>PP:</strong> {move.pp}
                        </small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        {availableMoves.length === 0 && (
          <Alert variant="warning">
            This Pokemon has no attacking moves available. Using default moveset.
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer style={{ background: theme.colors.bgCard, borderTop: `2px solid ${theme.colors.border}` }}>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          style={{ background: theme.gradients.primary, border: 'none' }}
          onClick={handleConfirm}
          disabled={selectedMoves.length !== 4}
        >
          Confirm Moveset ({selectedMoves.length}/4)
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
