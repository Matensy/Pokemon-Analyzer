import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Swords, Trophy } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export default function Home() {
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  const features = [
    {
      icon: <BookOpen size={48} />,
      title: 'Complete Pokédex',
      description: 'All 1,025 Pokémon from Gen 1-9 with full stats, movesets, and type effectiveness',
      action: () => navigate('/pokedex'),
      buttonText: 'Explore Pokédex',
    },
    {
      icon: <Users size={48} />,
      title: 'Team Builder',
      description: 'Build competitive teams with AI-powered analysis and recommendations',
      action: () => navigate('/team-builder'),
      buttonText: 'Build Team',
    },
    {
      icon: <Swords size={48} />,
      title: 'Battle Simulator',
      description: 'Battle against AI opponents with full damage calculation and strategy',
      action: () => navigate('/battle'),
      buttonText: 'Start Battle',
    },
    {
      icon: <Trophy size={48} />,
      title: 'Pokemon Champions',
      description: 'Train your competitive teams for the upcoming Pokemon Champions game',
      action: () => navigate('/team-builder'),
      buttonText: 'Train Now',
    },
  ];

  return (
    <div
      style={{
        background: theme.colors.bgPrimary,
        minHeight: '100vh',
        paddingTop: '60px',
        paddingBottom: '60px',
      }}
    >
      <Container>
        {/* Hero Section */}
        <div className="text-center mb-5">
          <div
            style={{
              fontSize: '4rem',
              marginBottom: '20px',
            }}
          >
            ⚡
          </div>
          <h1
            style={{
              fontSize: '3.5rem',
              fontWeight: 800,
              background: theme.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '20px',
            }}
          >
            Pokemon Champions Trainer
          </h1>
          <p
            style={{
              fontSize: '1.3rem',
              color: theme.colors.textSecondary,
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.6',
            }}
          >
            The ultimate Pokemon competitive training platform. Build teams, analyze strategies,
            and battle with AI-powered insights.
          </p>
        </div>

        {/* Stats Banner */}
        <div
          className="p-4 mb-5"
          style={{
            background: theme.gradients.card,
            border: `2px solid ${theme.colors.border}`,
            borderRadius: '20px',
            boxShadow: `0 10px 30px ${theme.colors.shadow}`,
          }}
        >
          <Row className="text-center">
            <Col md={3} xs={6} className="mb-3 mb-md-0">
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: theme.colors.primary,
                }}
              >
                1,025
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  color: theme.colors.textSecondary,
                  fontWeight: 600,
                }}
              >
                Pokémon
              </div>
            </Col>
            <Col md={3} xs={6} className="mb-3 mb-md-0">
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: theme.colors.accent2,
                }}
              >
                9
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  color: theme.colors.textSecondary,
                  fontWeight: 600,
                }}
              >
                Generations
              </div>
            </Col>
            <Col md={3} xs={6}>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: theme.colors.accent4,
                }}
              >
                18
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  color: theme.colors.textSecondary,
                  fontWeight: 600,
                }}
              >
                Types
              </div>
            </Col>
            <Col md={3} xs={6}>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: theme.colors.accent3,
                }}
              >
                AI
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  color: theme.colors.textSecondary,
                  fontWeight: 600,
                }}
              >
                Powered
              </div>
            </Col>
          </Row>
        </div>

        {/* Features Grid */}
        <Row className="g-4">
          {features.map((feature, idx) => (
            <Col key={idx} md={6}>
              <div
                className="h-100 p-4"
                style={{
                  background: theme.colors.bgCard,
                  border: `2px solid ${theme.colors.border}`,
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: `0 4px 20px ${theme.colors.shadow}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = `0 12px 40px ${theme.colors.shadowHover}`;
                  e.currentTarget.style.borderColor = theme.colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 20px ${theme.colors.shadow}`;
                  e.currentTarget.style.borderColor = theme.colors.border;
                }}
              >
                <div
                  style={{
                    color: theme.colors.primary,
                    marginBottom: '20px',
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    color: theme.colors.textPrimary,
                    fontWeight: 700,
                    marginBottom: '15px',
                    fontSize: '1.5rem',
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    color: theme.colors.textSecondary,
                    marginBottom: '25px',
                    lineHeight: '1.6',
                  }}
                >
                  {feature.description}
                </p>
                <Button
                  onClick={feature.action}
                  style={{
                    background: theme.gradients.primary,
                    border: 'none',
                    padding: '12px 30px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    boxShadow: `0 4px 15px ${theme.colors.shadow}`,
                  }}
                >
                  {feature.buttonText}
                </Button>
              </div>
            </Col>
          ))}
        </Row>

        {/* About Section */}
        <div
          className="mt-5 p-5 text-center"
          style={{
            background: theme.gradients.secondary,
            borderRadius: '20px',
            border: `2px solid ${theme.colors.border}`,
          }}
        >
          <h2
            style={{
              color: theme.colors.textPrimary,
              fontWeight: 700,
              marginBottom: '20px',
            }}
          >
            Prepare for Pokemon Champions
          </h2>
          <p
            style={{
              color: theme.colors.textSecondary,
              fontSize: '1.1rem',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.8',
            }}
          >
            Train your competitive teams for the upcoming Pokemon Champions game. Our AI-powered
            analysis engine helps you build balanced teams, identify weaknesses, and develop
            winning strategies. Just like Pokemon Showdown, but with advanced team analysis and
            battle simulation.
          </p>
        </div>
      </Container>
    </div>
  );
}
