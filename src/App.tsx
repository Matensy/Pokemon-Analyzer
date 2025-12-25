import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import Header from './components/Header';
import Home from './pages/Home';
import Pokedex from './pages/Pokedex';
import PokemonDetails from './pages/PokemonDetails';
import TeamBuilder from './pages/TeamBuilder';
import Battle from './pages/Battle';
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
          <Route path="/" element={<Home />} />
          <Route path="/pokedex" element={<Pokedex />} />
          <Route path="/pokemon/:id" element={<PokemonDetails />} />
          <Route path="/team-builder" element={<TeamBuilder />} />
          <Route path="/battle" element={<Battle />} />
        </Routes>
      </div>
    </Router>
  );
}
