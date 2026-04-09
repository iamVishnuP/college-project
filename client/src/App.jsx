import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import TeacherProfile from './pages/TeacherProfile';
import Leaderboard from './pages/Leaderboard';
import MemeFeed from './pages/MemeFeed';
import Directory from './pages/Directory';
import AdminPanel from './pages/AdminPanel';
import CreateRoast from './pages/CreateRoast';
import Confessions from './pages/Confessions';
import Resources from './pages/Resources';
import CampusPulse from './pages/CampusPulse';
import SemesterWrapped from './pages/SemesterWrapped';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthModalOpen, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#0a0a0f', color: 'var(--text-muted)' }}>
        <div className="text-center">
          <div className="animate-spin mb-4" style={{ fontSize: '32px' }}>🔥</div>
          <p className="text-xs uppercase tracking-widest font-bold">Stoking the Roasts...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        {isAuthModalOpen && <AuthModal />}
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/create-roast" element={<CreateRoast />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/teacher/:id" element={<TeacherProfile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/memes" element={<MemeFeed />} />
            <Route path="/confessions" element={<Confessions />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/pulse" element={<CampusPulse />} />
            <Route path="/wrapped" element={<SemesterWrapped />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
