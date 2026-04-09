import React, { useState } from 'react';
import { X, Loader, AlertCircle } from 'lucide-react';
import api from '../lib/api';

const VIBE_TAGS = ['Chill 😎', 'Easy A ✅', 'GPA Destroyer 📉', 'Surprise Tests 😱', 'Strict ⚠️', 'Meme God 🎭', 'Heavy Homework 📚', 'Fair Player ⚖️'];

const getEmoji = (val) => {
  if (val <= 1) return '😭';
  if (val <= 2) return '😬';
  if (val <= 3) return '😐';
  if (val <= 4) return '🙂';
  return '🤩';
};

const AddReviewModal = ({ onClose, teacherName, teacherId, onReviewPosted }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [teachingQuality, setTeachingQuality] = useState(3);
  const [strictness, setStrictness] = useState(3);
  const [marksLeniency, setMarksLeniency] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setError('Title and content are required.'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/reviews', {
        teacherId,
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags,
        teachingQuality: Number(teachingQuality),
        strictness: Number(strictness),
        marksLeniency: Number(marksLeniency),
      });
      onReviewPosted?.(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post review. Are you logged in?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content animate-slide-down" style={{ maxWidth: '560px' }}>
        <button onClick={onClose} className="btn-icon" style={{ position: 'absolute', top: '16px', right: '16px' }}><X size={20} /></button>

        <h2 style={{ marginBottom: '6px' }}>Drop a Roast 🔥</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
          Target: <strong style={{ color: 'var(--text-main)' }}>{teacherName}</strong> · Stay anonymous. Keep it real.
        </p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#EF4444', fontSize: '14px' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Post Title *</label>
            <input type="text" placeholder="e.g., I blinked and missed 3 chapters..." value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          {/* Rating sliders */}
          {[
            { label: 'Teaching Quality', val: teachingQuality, set: setTeachingQuality },
            { label: 'Strictness', val: strictness, set: setStrictness },
            { label: 'Marks Leniency', val: marksLeniency, set: setMarksLeniency },
          ].map(({ label, val, set }) => (
            <div key={label} style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600 }}>{label}</label>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{getEmoji(Number(val))} {Number(val).toFixed(1)}/5</span>
              </div>
              <input type="range" min="1" max="5" step="0.5" value={val} onChange={e => set(e.target.value)} />
            </div>
          ))}

          {/* Tags */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vibe Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {VIBE_TAGS.map(tag => (
                <span key={tag} onClick={() => toggleTag(tag)} style={{ cursor: 'pointer', padding: '5px 13px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, border: selectedTags.includes(tag) ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.12)', background: selectedTags.includes(tag) ? 'rgba(56,189,248,0.15)' : 'transparent', color: selectedTags.includes(tag) ? 'var(--primary)' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Review body */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>The Roast *</label>
            <textarea rows={4} placeholder="Spill the tea here..." value={content} onChange={e => setContent(e.target.value)} required style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '130px' }}>
              {loading ? <Loader size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : 'Post Roast 🚀'}
            </button>
          </div>
        </form>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default AddReviewModal;
