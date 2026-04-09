import React, { useState, useEffect } from 'react';
import RoastCard from '../components/RoastCard';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import { Loader, TrendingUp, BookOpen, ShieldAlert } from 'lucide-react';

const Home = () => {
  const [topRoasts, setTopRoasts] = useState([]);
  const [trendingTeachers, setTrendingTeachers] = useState([]);
  const [stats, setStats] = useState({ female: 0, male: 0, roastsToday: 0, totalStaff: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [roastsRes, teachersRes] = await Promise.all([
          api.get('/reviews', { params: { sort: 'hot' } }),
          api.get('/teachers')
        ]);

        setTopRoasts(roastsRes.data.slice(0, 5));
        
        const allTeachers = teachersRes.data;
        setTrendingTeachers(allTeachers.slice(0, 3)); // Mock trending for now
        
        setStats({
          female: allTeachers.filter(t => t.gender === 'Female').length,
          male: allTeachers.filter(t => t.gender === 'Male').length,
          roastsToday: roastsRes.data.length, // Simple mock
          totalStaff: allTeachers.length
        });
      } catch (err) {
        console.error("Failed to fetch home data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="home-container" style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <section className="main-feed">
        <div className="feed-header flex justify-between items-center mb-6">
          <h2 className="flex items-center gap-2">🔥 Top Roasts</h2>
          <select className="bg-transparent border border-muted p-2 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
            <option>Hot</option>
            <option>New</option>
            <option>Top All Time</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <Loader size={32} style={{ animation: 'spin 0.8s linear infinite', marginBottom: '12px' }} />
            <p>Fetching the latest roasts...</p>
          </div>
        ) : (
          <div className="feed-list" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {topRoasts.map((roast) => (
              <RoastCard key={roast._id} roast={roast} />
            ))}
            {topRoasts.length === 0 && (
              <div className="card text-center p-8" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-muted">No roasts found. Be the first to start the fire! 🔥</p>
                <Link to="/directory" className="btn btn-primary mt-4 inline-block">Visit Directory</Link>
              </div>
            )}
          </div>
        )}
      </section>

      <aside className="right-sidebar">
        <div className="card mb-6" style={{ padding: '24px' }}>
          <h3 className="mb-4 flex items-center gap-2"><BookOpen size={18} /> Directory Breakdown</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li className="flex justify-between items-center">
               <span>👩‍🏫 Female Faculty</span>
               <span className="text-success font-bold">{stats.female}</span>
            </li>
            <li className="flex justify-between items-center">
               <span>👨‍🏫 Male Faculty</span>
               <span className="text-primary font-bold">{stats.male}</span>
            </li>
            <li className="flex justify-between items-center">
               <span>📝 Total Staff</span>
               <span className="text-danger font-bold">{stats.totalStaff}</span>
            </li>
          </ul>
        </div>
        
        <div className="card mb-6" style={{ padding: '24px' }}>
          <h3 className="mb-4 flex items-center gap-2"><TrendingUp size={18} /> Trending Now 📈</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {trendingTeachers.map((t, i) => (
              <li key={t._id}>
                <Link to={`/teacher/${t._id}`} className="flex justify-between items-center group" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-muted font-bold">#{i + 1}</span>
                    <span className="group-hover:text-primary transition-colors">{t.name}</span>
                  </div>
                  <span className="text-danger text-sm font-bold">+{Math.floor(Math.random() * 50) + 10}🔥</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ padding: '24px' }}>
           <h3 className="mb-4 flex items-center gap-2"><ShieldAlert size={18} /> Campus Rules 📜</h3>
           <ol style={{ paddingLeft: '16px', color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
             <li>1. Keep it anonymous. Don't dox yourself.</li>
             <li>2. Roast the teaching, not personal appearance.</li>
             <li>3. Memes are highly encouraged.</li>
             <li>4. No snitching to the Dean.</li>
           </ol>
        </div>
      </aside>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Home;
