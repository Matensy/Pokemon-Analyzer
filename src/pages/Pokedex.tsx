import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Pagination } from 'react-bootstrap';
import { Search, Filter } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useTeamStore } from '../store/teamStore';
import { fetchPokemon, fetchPokemonByGeneration } from '../services/pokeapi';
import { generateMovesets } from '../services/movesetService';
import { Pokemon, PokemonType, Generation } from '../types/pokemon';
import PokemonCard from '../components/PokemonCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ITEMS_PER_PAGE = 24;

export default function Pokedex() {
  const { theme } = useThemeStore();
  const { addPokemon } = useTeamStore();

  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PokemonType | 'all'>('all');
  const [selectedGen, setSelectedGen] = useState<Generation | 'all'>('all');

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
      // Load first 151 Pokemon initially for performance
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
    setLoading(true);
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
    } catch (error) {
      console.error('Error loading more Pokemon:', error);
    } finally {
      setLoading(false);
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

  return (
    <div style={{ background: theme.colors.bgPrimary, minHeight: '100vh', paddingTop: '30px' }}>
      <Container>
        {/* Header */}
        <div className="text-center mb-4">
          <h1 style={{ color: theme.colors.textPrimary, fontWeight: 700 }}>
            National Pokédex
          </h1>
          <p style={{ color: theme.colors.textSecondary }}>
            Complete database of all {pokemon.length} Pokemon (Gen 1-9)
          </p>
        </div>

        {/* Filters */}
        <div
          className="p-4 mb-4"
          style={{
            background: theme.colors.bgCard,
            borderRadius: '16px',
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ color: theme.colors.textPrimary, fontWeight: 600 }}>
                  <Search size={16} className="me-2" />
                  Search Pokemon
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: theme.colors.bgPrimary,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.textPrimary,
                  }}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ color: theme.colors.textPrimary, fontWeight: 600 }}>
                  <Filter size={16} className="me-2" />
                  Type
                </Form.Label>
                <Form.Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  style={{
                    background: theme.colors.bgPrimary,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.textPrimary,
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
                <Form.Label style={{ color: theme.colors.textPrimary, fontWeight: 600 }}>
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
                    background: theme.colors.bgPrimary,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.textPrimary,
                  }}
                >
                  <option value="all">All Generations</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((gen) => (
                    <option key={gen} value={gen}>
                      Generation {gen}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Pokemon Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <Row xs={1} sm={2} md={3} lg={4} className="g-4 mb-4">
              {currentPokemon.map((p) => (
                <Col key={p.id}>
                  <PokemonCard
                    pokemon={p}
                    onClick={() => addPokemon(p)}
                  />
                </Col>
              ))}
            </Row>

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

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage <= 3
                      ? i + 1
                      : Math.min(currentPage - 2 + i, totalPages - 4 + i);
                    return (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => setCurrentPage(page)}
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
    </div>
  );
}
