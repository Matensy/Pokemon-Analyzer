import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import Header from './components/Header';
import Pokedex from './pages/Pokedex';
import TeamBuilder from './pages/TeamBuilder';
import VGCStats from './pages/VGCStats';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';

export default function App() {
  const { theme } = useThemeStore();

  // Apply theme to body
  useEffect(() => {
    document.body.style.background = theme.colors.bgPrimary;
    document.body.style.color = theme.colors.textPrimary;

    // Set CSS variables for global use
    document.documentElement.style.setProperty('--bg-primary', theme.colors.bgPrimary);
    document.documentElement.style.setProperty('--bg-card', theme.colors.bgCard);
    document.documentElement.style.setProperty('--text-primary', theme.colors.textPrimary);
    document.documentElement.style.setProperty('--primary', theme.colors.primary);
  }, [theme]);

  return (
    <Router basename="/Pokemon-Analyzer">
      <div style={{ minHeight: '100vh', background: theme.colors.bgPrimary }}>
        <Header />

        <Routes>
          <Route path="/" element={<Navigate to="/team-builder" replace />} />
          <Route path="/pokedex" element={<Pokedex />} />
          <Route path="/team-builder" element={<TeamBuilder />} />
          <Route path="/stats" element={<VGCStats />} />
        </Routes>
      </div>
    </Router>
  );
}
