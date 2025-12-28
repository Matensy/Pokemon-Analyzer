import { useState } from 'react';
import { Navbar, Container, Nav, Offcanvas } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, BookOpen, Users, BarChart3, Zap, Sparkles } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useTeamStore } from '../store/teamStore';

export default function Header() {
  const { isDark, toggleTheme, theme } = useThemeStore();
  const { team } = useTeamStore();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const navLinks = [
    { path: '/team-builder', label: 'Team Builder', icon: <Users size={18} /> },
    { path: '/pokedex', label: 'Pokedex', icon: <BookOpen size={18} /> },
    { path: '/stats', label: 'VGC Stats', icon: <BarChart3 size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <Navbar
        expand="lg"
        style={{
          background: theme.colors.navBg,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${theme.colors.navBorder}`,
          padding: '12px 0',
        }}
        sticky="top"
      >
        <Container>
          {/* Brand */}
          <Link
            to="/"
            style={{ textDecoration: 'none' }}
            className="d-flex align-items-center gap-2"
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: theme.gradients.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={22} color="white" />
            </div>
            <div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  background: theme.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px',
                }}
              >
                Pokemon VGC
              </span>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: theme.colors.textMuted,
                  fontWeight: 500,
                  marginTop: '-4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={10} />
                AI Team Builder
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <Nav className="ms-auto d-none d-lg-flex align-items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: isActive(link.path)
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
                  background: isActive(link.path)
                    ? `${theme.colors.primary}15`
                    : 'transparent',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(link.path)) {
                    e.currentTarget.style.background = theme.colors.bgHover;
                    e.currentTarget.style.color = theme.colors.textPrimary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.path)) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }
                }}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {/* Team Counter */}
            {team.length > 0 && (
              <div
                style={{
                  background: theme.gradients.primary,
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginLeft: '8px',
                }}
              >
                Team: {team.length}/6
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                background: theme.colors.bgHover,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '10px',
                padding: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.colors.textPrimary,
                marginLeft: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.primary;
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = theme.colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.colors.bgHover;
                e.currentTarget.style.color = theme.colors.textPrimary;
                e.currentTarget.style.borderColor = theme.colors.border;
              }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </Nav>

          {/* Mobile Menu Button */}
          <button
            className="d-lg-none"
            onClick={() => setShowMenu(true)}
            style={{
              background: theme.colors.bgHover,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: theme.colors.textPrimary,
            }}
          >
            <Menu size={22} />
          </button>
        </Container>
      </Navbar>

      {/* Mobile Menu Offcanvas */}
      <Offcanvas
        show={showMenu}
        onHide={() => setShowMenu(false)}
        placement="end"
        style={{
          background: theme.colors.bgPrimary,
          width: '280px',
        }}
      >
        <Offcanvas.Header
          closeButton
          style={{
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          <Offcanvas.Title
            style={{
              color: theme.colors.textPrimary,
              fontWeight: 700,
            }}
          >
            Menu
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setShowMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  color: isActive(link.path)
                    ? theme.colors.primary
                    : theme.colors.textPrimary,
                  background: isActive(link.path)
                    ? `${theme.colors.primary}15`
                    : 'transparent',
                }}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            <hr style={{ borderColor: theme.colors.border }} />

            {/* Theme Toggle Mobile */}
            <button
              onClick={() => {
                toggleTheme();
                setShowMenu(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                border: 'none',
                background: theme.colors.bgHover,
                color: theme.colors.textPrimary,
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              }}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
