import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Pagination, Spinner, ListGroup } from 'react-bootstrap';
import { Search, Filter, Globe, X } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useTeamStore } from '../store/teamStore';
import { fetchPokemonBatch, fetchPokemon } from '../services/pokeapi';
import { loadPokemonIndex, searchPokemonGlobal, PokemonEntry } from '../services/pokemonIndex';
import { generateMovesets } from '../services/movesetService';
import { Pokemon, PokemonType, Generation } from '../types/pokemon';
import PokemonCard from '../components/PokemonCard';
import PokemonDetailModal from '../components/PokemonDetailModal';

const ITEMS_PER_PAGE = 24;

// Generation ranges
const GEN_RANGES: Record<number, [number, number]> = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 905],
  9: [906, 1025]
};

export default function Pokedex() {
  const { theme } = useThemeStore();
  const { addPokemon } = useTeamStore();

  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(151);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PokemonType | 'all'>('all');
  const [selectedGen, setSelectedGen] = useState<Generation>(1);

  // Global search
  const [searchResults, setSearchResults] = useState<PokemonEntry[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [globalSearchPokemon, setGlobalSearchPokemon] = useState<Pokemon[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Modal
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Pre-load Pokemon index on mount
  useEffect(() => {
    loadPokemonIndex();
  }, []);

  // Load Pokemon for current page
  const loadPage = useCallback(async (gen: Generation, page: number) => {
    setLoading(true);
    try {
      const [start, end] = GEN_RANGES[gen];
      const genSize = end - start + 1;
      setTotalCount(genSize);

      const pageStart = start + (page - 1) * ITEMS_PER_PAGE;
      const pageEnd = Math.min(pageStart + ITEMS_PER_PAGE - 1, end);

      if (pageStart > end) {
        setPokemon([]);
        setLoading(false);
        return;
      }

      const ids = Array.from({ length: pageEnd - pageStart + 1 }, (_, i) => pageStart + i);
      const results = await fetchPokemonBatch(ids, 8);
      setPokemon(results);
    } catch (error) {
      console.error('Error loading Pokemon:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadPage(1, 1);
  }, [loadPage]);

  // Handle search input change
  const handleSearchChange = async (value: string) => {
    setSearchQuery(value);

    if (value.length >= 2) {
      const results = await searchPokemonGlobal(value);
      setSearchResults(results.slice(0, 10)); // Show top 10 results
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);

      // If search is cleared and was in global search mode, go back to normal
      if (value.length === 0 && isGlobalSearch) {
        setIsGlobalSearch(false);
        setGlobalSearchPokemon([]);
      }
    }
  };

  // Handle selecting a search result
  const handleSelectSearchResult = async (entry: PokemonEntry) => {
    setShowSearchResults(false);
    setLoadingSearch(true);
    setIsGlobalSearch(true);
    setSearchQuery(entry.name);

    try {
      const fullPokemon = await fetchPokemon(entry.id);
      fullPokemon.recommendedMovesets = generateMovesets(fullPokemon);
      setGlobalSearchPokemon([fullPokemon]);
    } catch (error) {
      console.error('Error loading Pokemon:', error);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Handle global search (Enter key or search button)
  const handleGlobalSearch = async () => {
    if (searchQuery.length < 2) return;

    setShowSearchResults(false);
    setLoadingSearch(true);
    setIsGlobalSearch(true);

    try {
      const results = await searchPokemonGlobal(searchQuery);
      if (results.length > 0) {
        // Load first 24 results
        const idsToLoad = results.slice(0, 24).map(r => r.id);
        const pokemonResults = await fetchPokemonBatch(idsToLoad, 8);
        setGlobalSearchPokemon(pokemonResults);
      } else {
        setGlobalSearchPokemon([]);
      }
    } catch (error) {
      console.error('Error in global search:', error);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Clear global search
  const clearGlobalSearch = () => {
    setSearchQuery('');
    setIsGlobalSearch(false);
    setGlobalSearchPokemon([]);
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Filter by type (client-side for current page)
  const filteredPokemon = (isGlobalSearch ? globalSearchPokemon : pokemon).filter(p => {
    if (selectedType !== 'all' && !p.types.includes(selectedType)) {
      return false;
    }
    return true;
  });

  // Change generation
  const handleGenChange = (gen: Generation) => {
    setSelectedGen(gen);
    setCurrentPage(1);
    clearGlobalSearch();
    setSelectedType('all');
    loadPage(gen, 1);
  };

  // Change page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadPage(selectedGen, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Pokemon details with full data
  const handlePokemonClick = async (p: Pokemon) => {
    setLoadingDetails(true);
    setShowModal(true);
    try {
      const fullPokemon = await fetchPokemon(p.id);
      fullPokemon.recommendedMovesets = generateMovesets(fullPokemon);
      setSelectedPokemon(fullPokemon);
    } catch {
      setSelectedPokemon(p);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAddToTeam = (p: Pokemon) => {
    addPokemon(p);
  };

  const types: PokemonType[] = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic',
    'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  const generationNames: Record<number, string> = {
    1: 'Kanto', 2: 'Johto', 3: 'Hoenn', 4: 'Sinnoh',
    5: 'Unova', 6: 'Kalos', 7: 'Alola', 8: 'Galar', 9: 'Paldea'
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div style={{ background: theme.colors.bgPrimary, minHeight: '100vh', paddingTop: '30px' }}>
      <Container>
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="gradient-text mb-2" style={{ fontWeight: 800, fontSize: '2.5rem' }}>
            National Pokedex
          </h1>
          <p style={{ color: theme.colors.textSecondary }}>
            Browse all 1025 Pokemon across 9 generations
          </p>
        </div>

        {/* Generation Selector - only show when not in global search */}
        {!isGlobalSearch && (
          <div className="d-flex flex-wrap gap-2 justify-content-center mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((gen) => (
              <button
                key={gen}
                onClick={() => handleGenChange(gen as Generation)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: selectedGen === gen ? theme.gradients.primary : theme.colors.bgCard,
                  color: selectedGen === gen ? 'white' : theme.colors.textPrimary,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedGen === gen ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
                }}
              >
                Gen {gen}
                <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.8 }}>
                  {generationNames[gen]}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Global Search Banner when active */}
        {isGlobalSearch && (
          <div
            className="mb-4 p-3 d-flex align-items-center justify-content-between"
            style={{
              background: theme.gradients.primary,
              borderRadius: '12px',
              color: 'white'
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <Globe size={20} />
              <span>Global Search Results for: <strong>"{searchQuery}"</strong></span>
              <span className="ms-2">({globalSearchPokemon.length} found)</span>
            </div>
            <button
              onClick={clearGlobalSearch}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <X size={16} />
              Clear Search
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="p-4 mb-4" style={{ background: theme.colors.bgCard, borderRadius: '16px', border: `1px solid ${theme.colors.border}`, position: 'relative' }}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group style={{ position: 'relative' }}>
                <Form.Label style={{ color: theme.colors.textPrimary, fontWeight: 600 }} className="d-flex align-items-center gap-2">
                  <Search size={16} />
                  Search Pokemon (Global)
                </Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    placeholder="Search any Pokemon by name or ID..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
                    style={{ background: theme.colors.inputBg, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, borderRadius: '12px', padding: '12px 16px' }}
                  />
                  <button
                    onClick={handleGlobalSearch}
                    disabled={searchQuery.length < 2}
                    style={{
                      background: theme.gradients.primary,
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 20px',
                      color: 'white',
                      fontWeight: 600,
                      cursor: searchQuery.length >= 2 ? 'pointer' : 'not-allowed',
                      opacity: searchQuery.length >= 2 ? 1 : 0.5
                    }}
                  >
                    <Globe size={18} />
                  </button>
                </div>

                {/* Search Autocomplete Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <ListGroup
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      maxHeight: '300px',
                      overflowY: 'auto',
                      borderRadius: '12px',
                      marginTop: '4px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}
                  >
                    {searchResults.map((entry) => (
                      <ListGroup.Item
                        key={entry.id}
                        action
                        onClick={() => handleSelectSearchResult(entry)}
                        style={{
                          background: theme.colors.bgCard,
                          color: theme.colors.textPrimary,
                          border: `1px solid ${theme.colors.border}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px'
                        }}
                      >
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.id}.png`}
                          alt={entry.name}
                          style={{ width: '40px', height: '40px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{entry.name.replace(/-/g, ' ')}</div>
                          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>#{entry.id} • {generationNames[entry.generation]}</div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ color: theme.colors.textPrimary, fontWeight: 600 }} className="d-flex align-items-center gap-2">
                  <Filter size={16} />Type Filter
                </Form.Label>
                <Form.Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as PokemonType | 'all')}
                  style={{ background: theme.colors.inputBg, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, borderRadius: '12px', padding: '12px 16px' }}
                >
                  <option value="all">All Types</option>
                  {types.map((type) => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Results Count */}
        <div className="mb-3 d-flex justify-content-between align-items-center" style={{ color: theme.colors.textSecondary }}>
          <span>{filteredPokemon.length} Pokemon {selectedType !== 'all' && `(${selectedType} type)`}</span>
          {!isGlobalSearch && <span>Page {currentPage} of {totalPages}</span>}
        </div>

        {/* Pokemon Grid */}
        {(loading || loadingSearch) ? (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: theme.colors.primary, width: '48px', height: '48px' }} />
            <p className="mt-3" style={{ color: theme.colors.textSecondary }}>
              {loadingSearch ? 'Searching all Pokemon...' : 'Loading Pokemon...'}
            </p>
          </div>
        ) : (
          <>
            <Row xs={1} sm={2} md={3} lg={4} className="g-4 mb-4">
              {filteredPokemon.map((p, index) => (
                <Col key={p.id} className="fade-in" style={{ animationDelay: `${index * 0.03}s` }}>
                  <PokemonCard pokemon={p} onClick={() => handlePokemonClick(p)} />
                </Col>
              ))}
            </Row>

            {filteredPokemon.length === 0 && (
              <div className="text-center py-5" style={{ color: theme.colors.textSecondary }}>
                <p style={{ fontSize: '1.2rem' }}>No Pokemon found</p>
                <p>Try adjusting your search or filters</p>
              </div>
            )}

            {/* Pagination - only show when not in global search */}
            {!isGlobalSearch && totalPages > 1 && (
              <div className="d-flex justify-content-center mb-4">
                <Pagination>
                  <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                  <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) page = i + 1;
                    else if (currentPage <= 3) page = i + 1;
                    else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                    else page = currentPage - 2 + i;
                    return (
                      <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                        {page}
                      </Pagination.Item>
                    );
                  })}

                  <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                  <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
              </div>
            )}
          </>
        )}
      </Container>

      {/* Pokemon Detail Modal */}
      <PokemonDetailModal
        pokemon={loadingDetails ? null : selectedPokemon}
        show={showModal}
        onHide={() => { setShowModal(false); setSelectedPokemon(null); }}
        onAddToTeam={handleAddToTeam}
      />

      {/* Loading overlay for details */}
      {loadingDetails && showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="text-center">
            <Spinner animation="border" style={{ color: 'white', width: '48px', height: '48px' }} />
            <p className="mt-3" style={{ color: 'white' }}>Loading Pokemon details...</p>
          </div>
        </div>
      )}
    </div>
  );
}
