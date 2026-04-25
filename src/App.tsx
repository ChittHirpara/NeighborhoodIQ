import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Search from './pages/Search';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Embed from './pages/Embed';
import Compare from './pages/Compare';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<Search />} />
        <Route path="/embed" element={<Embed />} />
        <Route path="/compare" element={<Compare />} />
      </Routes>
    </Router>
  );
}
