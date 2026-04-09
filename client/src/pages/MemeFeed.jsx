import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Loader, MessageSquare, Flame } from 'lucide-react';

const MemeFeed = () => {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reviews')
      .then(r => {
        // Filter reviews that have memeUrl or are particularly funny (mock filter for now)
        // In a real app, we might have a specific meme route
        const memesOnly = r.data.filter(review => review.memeUrl || review.tags?.includes('Meme God 🎭'));
        setMemes(memesOnly);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="meme-feed-container animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>Meme Central 🎭</h1>
          <p className="text-muted">The best (and worst) of campus humor.</p>
        </div>
        <Link to="/create-roast" className="btn btn-primary">Post a Meme</Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Loader size={32} className="animate-spin text-muted" />
        </div>
      ) : memes.length === 0 ? (
        <div className="card text-center p-12" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-muted mb-4">No memes found yet. Be the first to start the cult! 🎭</p>
          <Link to="/create-roast" className="btn btn-primary">Create a Meme Roast</Link>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {memes.map(meme => (
            <div key={meme._id} className="meme-card animate-slide-down" style={{ 
              backgroundColor: 'var(--card-bg)', 
              borderRadius: 'var(--radius)', 
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: 'var(--shadow-md)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            >
              <div style={{ height: '240px', width: '100%', overflow: 'hidden', background: '#000' }}>
                <img 
                  src={meme.memeUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${meme._id}`} 
                  alt="Meme" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} 
                />
              </div>
              <div className="p-4" style={{ padding: '16px' }}>
                <h4 style={{ color: 'var(--text-main)', fontWeight: '700', marginBottom: '4px', fontSize: '15px' }}>{meme.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px', lineHeight: 1.4 }}>{meme.content.slice(0, 100)}...</p>
                <div className="flex justify-between items-center">
                  <Link to={`/teacher/${meme.teacherId}`} className="text-primary" style={{ fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>
                    Target Context →
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1"><MessageSquare size={12} /> {meme.commentCount || 0}</span>
                    <span className="flex items-center gap-1 text-danger"><Flame size={12} /> {meme.upvotes}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default MemeFeed;
