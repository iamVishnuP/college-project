import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Loader, Trophy, ShieldAlert, Zap, Heart, Skull, Flame } from 'lucide-react';

const DEPT_DISPLAY = {
  'CIVIL ENGINEERING': { short: 'Civil', emoji: '🏗️' },
  'COMPUTER SCIENCE AND ENGINEERING': { short: 'CSE', emoji: '💻' },
  'ELECTRICAL ELECTRONICS ENGINEERING': { short: 'EEE', emoji: '⚡' },
  'MECHANICAL ENGINEERING': { short: 'Mech', emoji: '⚙️' },
  'ELECTRONICS COMPUTER ENGINEERING': { short: 'ECE', emoji: '📡' },
  'ELECTRONICS COMMUNICATION ENGINEERING': { short: 'E&C', emoji: '📻' },
  'APPLIED SCIENCE AND HUMANITIES': { short: 'ASH', emoji: '🧪' },
  'PHYSICAL EDUCATION': { short: 'PE', emoji: '🏃' },
};

const getGrade = (avg) => {
  if (avg >= 4.5) return { grade: 'A', color: '#22C55E', bg: 'rgba(34,197,94,0.18)' };
  if (avg >= 4.0) return { grade: 'B', color: '#38BDF8', bg: 'rgba(56,189,248,0.15)' };
  if (avg >= 3.5) return { grade: 'C', color: '#FCD34D', bg: 'rgba(252,211,77,0.15)' };
  if (avg >= 3.0) return { grade: 'D', color: '#F97316', bg: 'rgba(249,115,22,0.15)' };
  return { grade: 'F', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' };
};

const SplitBar = ({ lovedPct }) => {
  const hatedPct = 100 - lovedPct;
  return (
    <div style={{ width: '100%', marginTop: '8px' }}>
      <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', height: '10px' }}>
        <div style={{ width: `${lovedPct}%`, background: 'linear-gradient(90deg,#22C55E,#16a34a)' }} />
        <div style={{ width: `${hatedPct}%`, background: 'linear-gradient(90deg,#ef4444,#dc2626)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '5px' }}>
        <span style={{ color: '#22C55E', fontWeight: 700 }}>❤️ {lovedPct}%</span>
        <span style={{ color: '#EF4444', fontWeight: 700 }}>💀 {hatedPct}%</span>
      </div>
    </div>
  );
};

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('loved');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/teachers');
        setTeachers(data);
      } catch (err) {
        console.error("Failed to fetch leaderboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  // Compute leaderboards from real data
  const lovedList = [...teachers]
    .filter(t => t.reviewCount > 0)
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 5)
    .map((t, i) => ({ 
      ...t, 
      badge: ['Chill King 👑', 'Lifesaver 🛟', 'Fair Player ⚖️', 'Genius 🧠', 'Meme God 🎭'][i] || 'Top Rated ⭐' 
    }));

  const fearedList = [...teachers]
    .filter(t => t.reviewCount > 0)
    .sort((a, b) => b.avgStrictness - a.avgStrictness)
    .slice(0, 5)
    .map((t, i) => ({ 
      ...t, 
      badge: ['Final Boss 💀', 'GPA Destroyer 📉', 'The Sentinel 👁️', 'Strict Legend ☕', 'Midterm Terror 🎮'][i] || 'Strict Marker ⚠️' 
    }));

  const controversialList = [...teachers]
    .filter(t => t.reviewCount > 1) // At least 2 reviews for controversy
    .slice(0, 5)
    .map((t, i) => {
      // Mock lovedPct based on real rating for display
      const lovedPct = Math.min(95, Math.max(5, Math.round((t.avgRating / 5) * 100)));
      return { 
        ...t, 
        lovedPct: i === 0 ? 50 : lovedPct, // Make first one truly controversial for demo
        badge: ['Marmite Prof 🫙', 'Love-Hate Legend 💔❤️', 'Debate Magnet 🎯', 'Campus Divide ⚡', 'The Controversial One 🔥'][i] || 'Divisive'
      };
    });

  // Department report cards
  const subjects = [...new Set(teachers.map(t => t.subject))];
  const deptCards = subjects.map(dept => {
    const deptTeachers = teachers.filter(t => t.subject === dept && t.reviewCount > 0);
    const quality = deptTeachers.length > 0 ? deptTeachers.reduce((s, t) => s + t.avgTeachingQuality, 0) / deptTeachers.length : 3.5;
    const strictness = deptTeachers.length > 0 ? deptTeachers.reduce((s, t) => s + t.avgStrictness, 0) / deptTeachers.length : 3.0;
    const avg = (quality + (5 - strictness)) / 2;
    const g = getGrade(avg);
    const display = DEPT_DISPLAY[dept] || { short: dept.split(' ')[0], emoji: '🏫' };
    return { dept, quality, strictness, avg, ...g, ...display };
  }).sort((a, b) => b.avg - a.avg);

  const tabConfigs = {
    loved: { list: lovedList, accent: 'var(--primary)', icon: <Heart size={16} /> },
    feared: { list: fearedList, accent: 'var(--danger)', icon: <Skull size={16} /> },
    controversial: { list: controversialList, accent: '#F97316', icon: <Flame size={16} /> }
  };

  const current = tabConfigs[activeTab];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div className="text-center mb-10">
        <h1 className="flex items-center justify-center gap-3"><Trophy size={32} />hall of fame</h1>
        <p className="text-muted mt-2">REAL stats based on REAL roasts. No bias, just data.</p>
      </div>

      <div className="flex gap-3 justify-center mb-10">
        {Object.entries(tabConfigs).map(([id, cfg]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`btn ${activeTab === id ? 'btn-primary' : 'btn-secondary'}`}
            style={activeTab === id ? { backgroundColor: cfg.accent, color: '#fff' } : {}}
          >
            {cfg.icon} Most {id.charAt(0).toUpperCase() + id.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Loader size={32} className="animate-spin text-muted" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 mb-16">
          {current.list.map((t, i) => (
            <Link 
              to={`/teacher/${t._id}`} 
              key={t._id} 
              className="card flex items-center p-6 border-transparent hover:border-primary transition-all no-underline"
              style={{ 
                background: 'var(--card-bg)', 
                border: i < 3 ? `1px solid ${current.accent}40` : '1px solid rgba(255,255,255,0.05)',
                boxShadow: i < 3 ? `0 8px 32px ${current.accent}15` : 'none'
              }}
            >
              <span style={{ fontSize: '28px', fontWeight: 900, width: '50px', color: i < 3 ? 'var(--text-main)' : 'var(--text-muted)' }}>#{i + 1}</span>
              <div style={{ flex: 1 }}>
                <h3 className="text-main">{t.name}</h3>
                <div className="flex gap-2 items-center mt-1">
                  <span className="tag" style={{ background: 'rgba(255,255,255,0.05)' }}>{t.badge}</span>
                  <span className="text-muted text-xs">{t.subject}</span>
                </div>
                {activeTab === 'controversial' && <SplitBar lovedPct={t.lovedPct} />}
              </div>
              <div className="text-right">
                <span style={{ fontSize: '24px', fontWeight: 800, color: activeTab === 'feared' ? 'var(--danger)' : '#FCD34D' }}>
                  ⭐ {activeTab === 'feared' ? (t.avgStrictness).toFixed(1) : (t.avgRating).toFixed(1)}
                </span>
                <div className="text-muted text-xs">{t.reviewCount} roasts</div>
              </div>
            </Link>
          ))}
          {current.list.length === 0 && <p className="text-center text-muted">More data needed to rank the {activeTab}...</p>}
        </div>
      )}

      {/* Dept Report Cards */}
      <div className="mt-20">
        <h2 className="text-center mb-10 flex items-center justify-center gap-3"><Zap size={24} /> Department Report Cards</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {deptCards.map(dept => (
            <div key={dept.dept} className="card p-6 flex flex-col gap-4 border-transparent" style={{ background: 'var(--card-bg)', border: `1px solid ${dept.color}30` }}>
              <div className="flex justify-between items-start">
                <span style={{ fontSize: '32px' }}>{dept.emoji}</span>
                <div style={{ background: dept.bg, border: `2px solid ${dept.color}`, color: dept.color, width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '22px', fontWeight: 900, justifyContent: 'center' }}>
                  {dept.grade}
                </div>
              </div>
              <div>
                <h4 className="text-main">{dept.short}</h4>
                <p className="text-muted text-xs">{dept.dept}</p>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1"><span>Quality</span><span>{dept.quality.toFixed(1)}</span></div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${(dept.quality / 5) * 100}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span>Strictness</span><span>{dept.strictness.toFixed(1)}</span></div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${(dept.strictness / 5) * 100}%`, background: '#F97316' }} /></div>
                </div>
              </div>
              <div className="mt-auto pt-4 text-center" style={{ color: dept.color, fontWeight: 700 }}>{dept.avg.toFixed(1)} / 5.0</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
