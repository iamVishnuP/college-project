import React, { useState, useRef, useEffect } from 'react';
import { Search, Flame, TrendingUp, Users, Shield, ChevronDown, MessageSquare, BookOpen, Activity, Sparkles, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, setIsAuthModalOpen, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      navigate(`/directory?search=${searchQuery}`);
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isActive = (path) => location.pathname === path;

  const moreLinks = [
    { to: '/confessions', icon: <MessageSquare size={15} />, label: 'Confessions' },
    { to: '/resources', icon: <BookOpen size={15} />, label: 'Resources' },
    { to: '/pulse', icon: <Activity size={15} />, label: 'Campus Pulse' },
    { to: '/wrapped', icon: <Sparkles size={15} />, label: 'Sem Wrapped' },
  ];

  return (
    <nav className="navbar animate-fade-in">
      <Link to="/" className="nav-brand">
        campus<span>Roast</span> 🔥
      </Link>
      
      <div className="search-bar">
        <Search size={20} />
        <input 
          type="search" 
          placeholder="Search for teachers to roast..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="nav-actions">
        {user?.isAdmin && (
          <Link to="/admin" className="btn" style={{ color: 'var(--danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <Shield size={16} /> Admin Panel
          </Link>
        )}
        <Link to="/directory" className={`btn ${isActive('/directory') ? 'btn-primary' : 'btn-secondary'}`}>
          <Users size={16} /> Directory
        </Link>
        <Link to="/leaderboard" className={`btn ${isActive('/leaderboard') ? 'btn-primary' : 'btn-secondary'}`}>
          <TrendingUp size={16} /> Hall of Shame
        </Link>
        <Link to="/memes" className={`btn ${isActive('/memes') ? 'btn-primary' : 'btn-secondary'}`}>
          <Flame size={16} /> Top Roasts
        </Link>

        {/* More Dropdown */}
        <div ref={moreRef} style={{ position: 'relative' }}>
          <button
            className={`btn btn-secondary`}
            style={moreLinks.some(l => isActive(l.to)) ? { backgroundColor: 'rgba(56,189,248,0.15)', color: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
            onClick={() => setMoreOpen(v => !v)}
          >
            More <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: moreOpen ? 'rotate(180deg)' : 'none' }} />
          </button>
          {moreOpen && (
            <div className="more-dropdown animate-slide-down">
              {moreLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="more-dropdown-item"
                  style={isActive(link.to) ? { color: 'var(--primary)' } : {}}
                  onClick={() => setMoreOpen(false)}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <button className="btn btn-primary" onClick={() => {
            if (!user) setIsAuthModalOpen(true);
            else navigate('/create-roast');
        }}>
          Drop a Roast
        </button>
        
        {user ? (
          <div className="flex items-center gap-3 cursor-pointer" onClick={logout} title="Click to logout">
            <span className="font-bold text-main">{user.characterName}</span>
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.characterName}`} 
              alt="Avatar" 
              className="avatar" 
            />
          </div>
        ) : (
          <button className="btn btn-secondary" onClick={() => setIsAuthModalOpen(true)}>
             Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
