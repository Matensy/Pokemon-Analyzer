import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Pagination } from 'react-bootstrap';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useTeamStore } from '../store/teamStore';
import { fetchPokemon, fetchPokemonByGeneration } from '../services/pokeapi';
import { generateMovesets } from '../services/movesetService';
import { Pokemon, PokemonType, Generation } from '../types/pokemon';
import PokemonCard from '../components/PokemonCard';
import PokemonDetailModal from '../components/PokemonDetailModal';
import LoadingSpinner from '../components/LoadingSpinner';

const ITEMS_PER_PAGE = 24;

export default function Pokedex() {
  const { theme } = useThemeStore();
  const { addPokemon } = useTeamStore();

  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PokemonType | 'all'>('all');
  const [selectedGen, setSelectedGen] = useState<Generation | 'all'>('all');

  // Modal
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Track loaded generations
  const [loadedGens, setLoadedGens] = useState<Set<number>>(new Set([1]));

  // Load initial Pokemon
  useEffect(() => {
    loadPokemon();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [pokemon, searchQuery, selectedType, selectedGen]);

  async function loadPokemon() {
    setLoading(true);
    try {
      // Load first 151 Pokemon initially
      const promises = Array.from({ length: 151 }, (_, i) =>
        fetchPokemon(i + 1).then((p) => {
          p.recommendedMovesets = generateMovesets(p);
          return p;
        })
      );

      const results = await Promise.all(promises);
      setPokemon(results);
    } catch (error) {
      console.error('Error loading Pokemon:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMorePokemon(gen: Generation) {
    if (loadedGens.has(gen)) return;

    setLoadingMore(true);
    try {
      const ids = await fetchPokemonByGeneration(gen);
      const promises = ids.map((id) =>
        fetchPokemon(id).then((p) => {
          p.recommendedMovesets = generateMovesets(p);
          return p;
        })
      );

      const results = await Promise.all(promises);
      setPokemon((prev) => {
        const newPokemon = results.filter(
          (r) => !prev.some((p) => p.id === r.id)
        );
        return [...prev, ...newPokemon].sort((a, b) => a.id - b.id);
      });
      setLoadedGens((prev) => new Set([...prev, gen]));
    } catch (error) {
      console.error('Error loading more Pokemon:', error);
    } finally {
      setLoadingMore(false);
    }
  }

  function applyFilters() {
    let filtered = [...pokemon];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toString().includes(searchQuery)
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter((p) => p.types.includes(selectedType));
    }

    // Generation filter
    if (selectedGen !== 'all') {
      filtered = filtered.filter((p) => p.generation === selectedGen);
    }

    setFilteredPokemon(filtered);
    setCurrentPage(1);
  }

  function handlePokemonClick(p: Pokemon) {
    setSelectedPokemon(p);
    setShowModal(true);
  }

  function handleAddToTeam(p: Pokemon) {
    addPokemon(p);
  }

  // Pagination
  const totalPages = Math.ceil(filteredPokemon.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPokemon = filteredPokemon.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const types: PokemonType[] = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic',
    'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
  ];

  const generationNames: Record<number, string> = {
    1: 'Kanto',
    2: 'Johto',
    3: 'Hoenn',
    4: 'Sinnoh',
    5: 'Unova',
    6: 'Kalos',
    7: 'Alola',
    8: 'Galar',
    9: 'Paldea'
  };

  return (
    <div style={{ background: theme.colors.bgPrimary, minHeight: '100vh', paddingTop: '30px' }}>
      <Container>
        {/* Header */}
        <div className="text-center mb-4">
          <h1
            className="gradient-text mb-2"
            style={{ fontWeight: 800, fontSize: '2.5rem' }}
          >
            National Pokedex
          </h1>
          <p style={{ color: theme.colors.textSecondary }}>
            Complete database with {pokemon.length} Pokemon | Click to view details
          </p>
        </div>

        {/* Filters */}
        <div
          className="p-4 mb-4"
          style={{
            background: theme.colors.bgCard,
            borderRadius: '16px',
            border: `1px solid ${theme.colors.border}`,
            boxShadow: theme.colors.shadowCard,
          }}
        >
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label
                  style={{ color: theme.colors.textPrimary, fontWeight: 600 }}
                  className="d-flex align-items-center gap-2"
                >
                  <Search size={16} />
                  Search Pokemon
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: theme.colors.inputBg,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.textPrimary,
                    borderRadius: '12px',
                    padding: '12px 16px',
                  }}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label
                  style={{ color: theme.colors.textPrimary, fontWeight: 600 }}
                  className="d-flex align-items-center gap-2"
                >
                  <Filter size={16} />
                  Type
                </Form.Label>
                <Form.Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  style={{
                    background: theme.colors.inputBg,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.textPrimary,
                    borderRadius: '12px',
                    padding: '12px 16px',
                  }}
                >
                  <option value="all">All Types</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label
                  style={{ color: theme.colors.textPrimary, fontWeight: 600 }}
                >
                  Generation
                </Form.Label>
                <Form.Select
                  value={selectedGen}
                  onChange={(e) => {
                    const gen = e.target.value as any;
                    setSelectedGen(gen);
                    if (gen !== 'all' && gen !== '1') {
                      loadMorePokemon(parseInt(gen) as Generation);
                    }
                  }}
                  style={{
                    background: theme.colors.inputBg,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.textPrimary,
                    borderRadius: '12px',
                    padding: '12px 16px',
                  }}
                >
                  <option value="all">All Generations</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((gen) => (
                    <option key={gen} value={gen}>
                      Gen {gen} - {generationNames[gen]}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Quick Gen Buttons */}
          <div className="mt-3 d-flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((gen) => (
              <button
                key={gen}
                onClick={() => {
                  if (!loadedGens.has(gen)) {
                    loadMorePokemon(gen as Generation);
                  }
                  setSelectedGen(gen as Generation);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: selectedGen === gen
                    ? theme.gradients.primary
                    : theme.colors.bgHover,
                  color: selectedGen === gen
                    ? 'white'
                    : theme.colors.textSecondary,
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Gen {gen}
                {loadedGens.has(gen) && (
                  <span style={{ marginLeft: '4px', opacity: 0.7 }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Loading More Indicator */}
        {loadingMore && (
          <div
            className="text-center py-3 mb-3"
            style={{
              background: theme.colors.bgCard,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <Loader2 className="spinner-sm me-2" size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: theme.colors.textSecondary }}>
              Loading more Pokemon...
            </span>
          </div>
        )}

        {/* Results Count */}
        <div
          className="mb-3 d-flex justify-content-between align-items-center"
          style={{ color: theme.colors.textSecondary }}
        >
          <span>
            Showing {currentPokemon.length} of {filteredPokemon.length} Pokemon
          </span>
          <span>
            Page {currentPage} of {totalPages || 1}
          </span>
        </div>

        {/* Pokemon Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <Row xs={1} sm={2} md={3} lg={4} className="g-4 mb-4">
              {currentPokemon.map((p, index) => (
                <Col key={p.id} className={`fade-in stagger-${(index % 5) + 1}`}>
                  <PokemonCard
                    pokemon={p}
                    onClick={() => handlePokemonClick(p)}
                  />
                </Col>
              ))}
            </Row>

            {filteredPokemon.length === 0 && (
              <div
                className="text-center py-5"
                style={{ color: theme.colors.textSecondary }}
              >
                <p style={{ fontSize: '1.2rem' }}>No Pokemon found</p>
                <p>Try adjusting your search or filters</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mb-4">
                <Pagination>
                  <Pagination.First
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  />

                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 7) {
                      page = i + 1;
                    } else if (currentPage <= 4) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      page = totalPages - 6 + i;
                    } else {
                      page = currentPage - 3 + i;
                    }
                    return (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          background: page === currentPage ? theme.colors.primary : undefined,
                        }}
                      >
                        {page}
                      </Pagination.Item>
                    );
                  })}

                  <Pagination.Next
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </>
        )}
      </Container>

      {/* Pokemon Detail Modal */}
      <PokemonDetailModal
        pokemon={selectedPokemon}
        show={showModal}
        onHide={() => setShowModal(false)}
        onAddToTeam={handleAddToTeam}
      />
    </div>
  );
}
