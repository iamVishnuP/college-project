import React, { useState, useEffect } from 'react';
import { Search, Download, Star, Upload, Filter, Trophy, BookOpen, FileText, FlaskConical, ClipboardList, Loader } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const SEMESTERS = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];
const TYPES = ['All', 'Notes', 'PYQ', 'Lab File', 'Assignment'];

const TYPE_ICONS = {
  Notes: <BookOpen size={13} />,
  PYQ: <FileText size={13} />,
  'Lab File': <FlaskConical size={13} />,
  Assignment: <ClipboardList size={13} />,
};

const TYPE_COLORS = {
  Notes: { bg: 'rgba(56,189,248,0.15)', color: 'var(--primary)' },
  PYQ: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
  'Lab File': { bg: 'rgba(34,197,94,0.15)', color: '#22C55E' },
  Assignment: { bg: 'rgba(168,85,247,0.15)', color: '#A855F7' },
};

const StarDisplay = ({ rating }) => (
  <span style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
    {[1, 2, 3, 4, 5].map(s => (
      <span key={s} style={{ color: s <= Math.round(rating) ? '#FCD34D' : 'rgba(255,255,255,0.15)', fontSize: '13px' }}>★</span>
    ))}
    <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: '4px' }}>{Number(rating).toFixed(1)}</span>
  </span>
);

const ResourceCard = ({ resource, onDownload }) => {
  const isLifesaver = resource.downloads >= 50;
  const typeMeta = TYPE_COLORS[resource.type] || {};

  return (
    <div
      style={{ backgroundColor: 'var(--card-bg)', border: `1px solid ${isLifesaver ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 'var(--radius)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: isLifesaver ? '0 0 18px rgba(245,158,11,0.15)' : 'var(--shadow-sm)', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isLifesaver ? '0 0 18px rgba(245,158,11,0.15)' : 'var(--shadow-sm)'; }}
    >
      {isLifesaver && (
        <div style={{ position: 'absolute', top: 0, right: 0, background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0F172A', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderBottomLeftRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Trophy size={11} /> Lifesaver
        </div>
      )}

      <div>
        <h4 style={{ fontSize: '15px', marginBottom: '4px', paddingRight: isLifesaver ? '90px' : '0' }}>{resource.title}</h4>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{resource.desc}</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        <span style={{ background: typeMeta.bg, color: typeMeta.color, borderRadius: '99px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
          {TYPE_ICONS[resource.type]} {resource.type}
        </span>
        <span style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text-muted)', borderRadius: '99px', padding: '3px 10px', fontSize: '11px', fontWeight: 600 }}>S{resource.semester}</span>
        <span style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text-muted)', borderRadius: '99px', padding: '3px 10px', fontSize: '11px' }}>{resource.subject}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <StarDisplay rating={resource.rating} />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>📥 {resource.downloads} downloads</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{resource.uploaderBadge}</div>
        </div>
        <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px', gap: '6px' }} onClick={() => onDownload(resource._id)}>
          <Download size={13} /> Download
        </button>
      </div>
    </div>
  );
};

const Resources = () => {
  const { user, setIsAuthModalOpen } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterSem, setFilterSem] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', subject: '', semester: '1', type: 'Notes', desc: '' });
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchResources = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (filterType !== 'All') params.type = filterType;
    if (filterSem !== 'All') params.semester = filterSem;
    api.get('/resources', { params })
      .then(r => setResources(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchResources(); }, [search, filterType, filterSem]);

  const handleDownload = async (id) => {
    try {
      const { data } = await api.post(`/resources/${id}/download`);
      setResources(prev => prev.map(r => r._id === id ? { ...r, downloads: data.downloads } : r));
    } catch {}
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!user) { setIsAuthModalOpen(true); return; }
    setUploading(true);
    try {
      await api.post('/resources', uploadForm);
      setUploadSuccess(true);
      setShowUpload(false);
      setUploadForm({ title: '', subject: '', semester: '1', type: 'Notes', desc: '' });
      fetchResources();
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>📚 Notes & Resources Hub</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 24px' }}>
          Share and access notes, PYQs, lab files and assignments — all in one place.
        </p>
        <button className="btn btn-primary" onClick={() => { if (!user) setIsAuthModalOpen(true); else setShowUpload(v => !v); }} style={{ gap: '8px' }}>
          <Upload size={15} /> {showUpload ? 'Cancel Upload' : 'Upload Resource'}
        </button>
      </div>

      {uploadSuccess && (
        <div className="animate-slide-down" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', padding: '14px 20px', color: '#22C55E', fontWeight: 600, marginBottom: '24px', textAlign: 'center' }}>
          ✅ Resource uploaded successfully!
        </div>
      )}

      {showUpload && (
        <div className="animate-slide-down" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: 'var(--radius)', padding: '28px', marginBottom: '36px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '17px' }}>📤 Upload a Resource</h3>
          <form onSubmit={handleUpload}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Title *</label>
                <input type="text" required placeholder="e.g. DS Notes Module 3" value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Subject *</label>
                <input type="text" required placeholder="e.g. Data Structures" value={uploadForm.subject} onChange={e => setUploadForm(f => ({ ...f, subject: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Semester *</label>
                <select value={uploadForm.semester} onChange={e => setUploadForm(f => ({ ...f, semester: e.target.value }))}>
                  {['1','2','3','4','5','6','7','8'].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Type *</label>
                <select value={uploadForm.type} onChange={e => setUploadForm(f => ({ ...f, type: e.target.value }))}>
                  {['Notes', 'PYQ', 'Lab File', 'Assignment'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Description</label>
              <textarea placeholder="Briefly describe..." rows={2} value={uploadForm.desc} onChange={e => setUploadForm(f => ({ ...f, desc: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={uploading}>
              {uploading ? <Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <><Upload size={14} /> Submit Resource</>}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '28px', backgroundColor: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="search" placeholder="Search by subject or keyword..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '38px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 'auto', padding: '10px 14px' }}>
            {TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
          </select>
          <select value={filterSem} onChange={e => setFilterSem(e.target.value)} style={{ width: 'auto', padding: '10px 14px' }}>
            {SEMESTERS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Semesters' : `Sem ${s}`}</option>)}
          </select>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{resources.length} resource{resources.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Loader size={28} style={{ animation: 'spin 0.8s linear infinite', marginBottom: '12px' }} />
          <p>Loading resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <BookOpen size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No resources found. Adjust your filters or be the first to upload!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {resources.map(r => <ResourceCard key={r._id} resource={r} onDownload={handleDownload} />)}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Resources;
