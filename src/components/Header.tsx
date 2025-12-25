import { Navbar, Container, Nav } from 'react-bootstrap';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export default function Header() {
  const { isDark, toggleTheme, theme } = useThemeStore();

  return (
    <Navbar
      expand="lg"
      style={{
        background: theme.gradients.primary,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
      sticky="top"
    >
      <Container fluid>
        <Navbar.Brand href="/" className="d-flex align-items-center">
          <span
            className="fw-bold fs-3"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '2px',
            }}
          >
            ⚔️ POKEMON CHAMPIONS
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-3">
            <Nav.Link href="#pokedex" style={{ color: '#FFFFFF', fontWeight: 500 }}>
              Pokédex
            </Nav.Link>
            <Nav.Link href="#team-builder" style={{ color: '#FFFFFF', fontWeight: 500 }}>
              Team Builder
            </Nav.Link>
            <Nav.Link href="#battle-sim" style={{ color: '#FFFFFF', fontWeight: 500 }}>
              Battle Sim
            </Nav.Link>

            <button
              onClick={toggleTheme}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#FFFFFF',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
              <span className="d-none d-md-inline">{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
