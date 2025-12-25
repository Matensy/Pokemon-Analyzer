import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import Header from './components/Header';
import Pokedex from './pages/Pokedex';
import TeamBuilder from './pages/TeamBuilder';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';

export default function App() {
  const { theme } = useThemeStore();

  // Apply theme to body
  useEffect(() => {
    document.body.style.background = theme.colors.bgPrimary;
    document.body.style.color = theme.colors.textPrimary;
  }, [theme]);

  return (
    <Router>
      <div style={{ minHeight: '100vh', background: theme.colors.bgPrimary }}>
        <Header />

        <Routes>
          <Route path="/" element={<Navigate to="/pokedex" replace />} />
          <Route path="/pokedex" element={<Pokedex />} />
          <Route path="/team-builder" element={<TeamBuilder />} />
        </Routes>
      </div>
    </Router>
  );
}
