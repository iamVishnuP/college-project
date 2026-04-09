import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Image as ImageIcon, Loader, ChevronDown } from 'lucide-react';
import api from '../lib/api';

const CreateRoast = () => {
  const { user, setIsAuthModalOpen } = useAuth();
  const navigate = useNavigate();
  
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [teachingQuality, setTeachingQuality] = useState(3);
  const [strictness, setStrictness] = useState(3);
  const [marksLeniency, setMarksLeniency] = useState(3);
  
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [error, setError] = useState('');
  
  const availableTags = ['Chill 😎', 'Easy A ✅', 'GPA Destroyer 📉', 'Surprise Tests 😱', 'Strict ⚠️', 'Meme God 🎭', 'Heavy Homework 📚', 'Fair Player ⚖️'];

  useEffect(() => {
    api.get('/teachers')
      .then(r => setTeachers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const getEmoji = (val) => {
    if (val <= 1) return '😭';
    if (val <= 2) return '😬';
    if (val <= 3) return '😐';
    if (val <= 4) return '🙂';
    return '🤩';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
       setIsAuthModalOpen(true);
       return;
    }
    if (!selectedTeacherId) { setError('Please select a teacher.'); return; }
    
    setSubmitting(true);
    setError('');
    
    try {
      await api.post('/reviews', {
        teacherId: selectedTeacherId,
        title,
        content,
        tags: selectedTags,
        teachingQuality: Number(teachingQuality),
        strictness: Number(strictness),
        marksLeniency: Number(marksLeniency)
      });
      alert('Roast successfully dropped! 🔥 The tea has been served.');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post roast.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-roast-container animate-fade-in" style={{ maxWidth: '800px', margin: '40px auto' }}>
      <h1 className="mb-2">Drop a Roast 🔥</h1>
      <p className="mb-8 text-muted">Spill the tea. Keep it anonymous. Keep it funny.</p>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '14px 20px', color: '#EF4444', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-8" style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        
        <div className="form-group mb-6">
          <label className="mb-2 block font-bold">Select Target (Teacher)</label>
          <div style={{ position: 'relative' }}>
            <select 
              required 
              value={selectedTeacherId} 
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full p-3 rounded"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: loading ? 'wait' : 'default' }}
              disabled={loading}
            >
              <option value="" disabled>Search or choose a teacher...</option>
              {teachers.map(teacher => (
                <option key={teacher._id} value={teacher._id}>{teacher.name} ({teacher.subject})</option>
              ))}
            </select>
            {loading && <Loader size={16} className="animate-spin" style={{ position: 'absolute', right: '35px', top: '15px', color: 'var(--text-muted)' }} />}
          </div>
        </div>

        <div className="form-group mb-6">
          <label className="mb-2 block font-bold">Post Title</label>
          <input 
            type="text" 
            placeholder="e.g., I blinked and missed 3 chapters..." 
            className="w-full p-3 rounded" 
            required 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {[
            { label: 'Teaching Quality', val: teachingQuality, set: setTeachingQuality },
            { label: 'Strictness', val: strictness, set: setStrictness },
            { label: 'Marks Leniency', val: marksLeniency, set: setMarksLeniency }
          ].map(({ label, val, set }) => (
            <div key={label} className="form-group">
              <label className="flex justify-between mb-2">
                <span className="font-bold text-xs uppercase text-muted">{label}</span>
                <span className="text-xs">{getEmoji(val)} {val}/5</span>
              </label>
              <input 
                type="range" 
                min="1" max="5" step="0.5" 
                value={val} 
                onChange={(e) => set(e.target.value)} 
              />
            </div>
          ))}
        </div>

        <div className="form-group mb-6">
          <label className="mb-2 block font-bold">Vibe Tags (Select all that apply)</label>
          <div className="flex gap-2 flex-wrap mt-2">
            {availableTags.map(tag => (
              <span 
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`tag ${selectedTags.includes(tag) ? 'accent' : ''}`} 
                style={{ 
                  cursor:'pointer', 
                  opacity: selectedTags.includes(tag) ? 1 : 0.5,
                  border: selectedTags.includes(tag) ? '1px solid var(--primary)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  fontSize: '12px',
                  padding: '6px 14px'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="form-group mb-6">
          <label className="mb-2 block font-bold">The Roast</label>
          <textarea 
            rows="6" 
            placeholder="Spill the tea here... Be specific but stay anonymous!"
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 rounded"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
          ></textarea>
        </div>

        <div className="form-group mb-8">
           <button type="button" className="btn btn-secondary w-full" style={{ border: '1px dashed rgba(255,255,255,0.2)' }}>
              <ImageIcon size={18} /> Attach Meme / Screenshot (Optional)
           </button>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <Loader size={16} className="animate-spin" /> : 'Post Roast 🚀'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoast;
