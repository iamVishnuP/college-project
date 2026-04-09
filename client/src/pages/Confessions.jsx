import React, { useState, useEffect } from 'react';
import { ThumbsUp, Flag, MessageCircle, Crown, Flame, Plus, X, Send, Loader } from 'lucide-react';
import api from '../lib/api';

const REACTIONS = ['😂', '💀', '😬', '🤝', '💯'];
const FLAG_THRESHOLD = 3;

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

const ConfessionCard = ({ confession, isWinner, onUpvote, onReact, onFlag }) => {
  const isHotDebate = confession.replyCount > 10;
  const isFlagged = confession.flags >= FLAG_THRESHOLD;

  return (
    <div
      className="confession-card animate-fade-in"
      style={{
        backgroundColor: 'var(--card-bg)',
        border: isWinner ? '2px solid #F59E0B' : '1px solid rgba(255,255,255,0.07)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        position: 'relative',
        boxShadow: isWinner ? '0 0 24px rgba(245,158,11,0.25)' : 'var(--shadow-md)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        overflow: 'hidden',
      }}
    >
      {isFlagged && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(4px)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: 'var(--radius)' }}>
          <Flag size={28} color="#EF4444" />
          <span style={{ color: '#EF4444', fontWeight: 700 }}>Flagged for Review</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>This confession is under moderation</span>
        </div>
      )}

      {isWinner && (
        <div style={{ position: 'absolute', top: 0, right: 0, background: 'linear-gradient(135deg, #F59E0B, #D97706)', padding: '6px 16px', borderBottomLeftRadius: '12px', fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Crown size={14} /> Confession of the Week
        </div>
      )}

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: 'var(--primary)', borderRadius: '99px', padding: '3px 12px', fontSize: '12px', fontWeight: 700 }}>
            Anonymous 👤
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{timeAgo(confession.createdAt)}</span>
          {isHotDebate && (
            <span style={{ background: 'linear-gradient(135deg,#f97316,#ef4444)', color: '#fff', borderRadius: '99px', padding: '3px 10px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Flame size={11} /> Hot Debate 🔥
            </span>
          )}
        </div>

        <p style={{ color: 'var(--text-main)', fontSize: '15px', lineHeight: '1.65', marginBottom: '16px' }}>
          {confession.text}
        </p>

        {/* Reactions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          {REACTIONS.map((r) => (
            <button key={r} onClick={() => onReact(confession._id, r)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '99px', padding: '5px 12px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '5px', transition: 'background 0.2s', fontFamily: 'var(--font-main)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              {r}
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {confession.reactions?.[r] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => onUpvote(confession._id)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--font-main)', padding: '6px 0' }}>
            <ThumbsUp size={15} /> {confession.upvotes}
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <MessageCircle size={14} /> {confession.replyCount} replies
          </span>
          <button onClick={() => onFlag(confession._id)} style={{ background: 'none', border: 'none', color: confession.flags > 0 ? '#EF4444' : 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto', fontFamily: 'var(--font-main)', padding: '6px 0' }}>
            <Flag size={13} /> {confession.flags > 0 ? `${confession.flags} flag${confession.flags > 1 ? 's' : ''}` : 'Flag'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Confessions = () => {
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newText, setNewText] = useState('');
  const [error, setError] = useState('');
  const [posting, setPosting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get('/confessions')
      .then(r => setConfessions(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const topByVotes = confessions.length > 0
    ? confessions.reduce((a, b) => (a.upvotes > b.upvotes ? a : b))
    : null;

  const handleUpvote = async (id) => {
    try {
      const { data } = await api.post(`/confessions/${id}/upvote`);
      setConfessions(prev => prev.map(c => c._id === id ? { ...c, upvotes: data.upvotes } : c));
    } catch {}
  };

  const handleReact = async (id, emoji) => {
    try {
      const { data } = await api.post(`/confessions/${id}/react`, { emoji });
      setConfessions(prev => prev.map(c => c._id === id ? { ...c, reactions: data.reactions } : c));
    } catch {}
  };

  const handleFlag = async (id) => {
    try {
      const { data } = await api.post(`/confessions/${id}/flag`);
      setConfessions(prev => prev.map(c => c._id === id ? { ...c, flags: data.flags } : c));
    } catch {}
  };

  const handleSubmit = async () => {
    setError('');
    setPosting(true);
    try {
      const { data } = await api.post('/confessions', { text: newText });
      setConfessions(prev => [data, ...prev]);
      setNewText('');
      setShowForm(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post confession.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>🤫 Confessions Wall</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 24px' }}>
          Confess anonymously. No usernames, no judgement — just the raw campus truth.
        </p>
        <button className="btn btn-primary" onClick={() => { setShowForm(v => !v); setError(''); }} style={{ gap: '8px' }}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Post a Confession'}
        </button>
      </div>

      {submitted && (
        <div className="animate-slide-down" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', padding: '14px 20px', color: '#22C55E', fontWeight: 600, marginBottom: '20px', textAlign: 'center' }}>
          ✅ Confession posted anonymously!
        </div>
      )}

      {showForm && (
        <div className="animate-slide-down" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 'var(--radius)', padding: '24px', marginBottom: '28px', boxShadow: '0 0 20px rgba(56,189,248,0.1)' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>🤫 Your Secret is Safe Here</h3>
          <textarea value={newText} onChange={e => { setNewText(e.target.value); setError(''); }} placeholder="Spill it... (minimum 20 words)" rows={5} style={{ resize: 'vertical', marginBottom: '10px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {newText.trim().split(/\s+/).filter(Boolean).length} / 20 words minimum
            </span>
            {error && <span style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: 600 }}>⚠ {error}</span>}
          </div>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={posting} style={{ marginTop: '14px', width: '100%' }}>
            {posting ? <Loader size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <><Send size={15} /> Post Anonymously</>}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Loader size={28} style={{ animation: 'spin 0.8s linear infinite', marginBottom: '12px' }} />
          <p>Loading confessions...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {confessions.map(c => (
            <ConfessionCard
              key={c._id}
              confession={c}
              isWinner={topByVotes && c._id === topByVotes._id}
              onUpvote={handleUpvote}
              onReact={handleReact}
              onFlag={handleFlag}
            />
          ))}
          {confessions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <p>No confessions yet. Be the first to spill. 🤫</p>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Confessions;
