import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../lib/api';
import { Search, Loader } from 'lucide-react';

const Directory = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q) setSearchTerm(q);
  }, [location.search]);

  useEffect(() => {
    api.get('/teachers/subjects').then(r => setSubjects(['All', ...r.data])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (filterDept !== 'All') params.subject = filterDept;
    api.get('/teachers', { params })
      .then(r => setTeachers(r.data))
      .catch(() => setTeachers([]))
      .finally(() => setLoading(false));
  }, [searchTerm, filterDept]);

  return (
    <div className="directory-container animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>Faculty Directory 🎯</h1>
          <p>Find your teacher. Roast them.</p>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{teachers.length} staff found</span>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="search-bar" style={{ flex: 1, maxWidth: 'none', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '48px', width: '100%' }} />
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', borderRadius: '8px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.1)', minWidth: '200px' }}>
          {subjects.map((dept, i) => <option key={i} value={dept}>{dept}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Loader size={32} style={{ animation: 'spin 0.8s linear infinite', marginBottom: '12px' }} />
          <p>Loading faculty...</p>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
          {teachers.map((teacher, index) => (
            <Link to={`/teacher/${teacher._id}`} key={teacher._id} style={{ textDecoration: 'none', gridColumn: 'span 4' }}>
              <div className="card teacher-card flex flex-col items-center animate-slide-down" style={{ animationDelay: `${(index % 10) * 0.05}s` }}>
                <img src={teacher.imgUrl} alt={teacher.name} className="avatar mb-4" onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${teacher.name}`; }} style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid var(--primary)', backgroundColor: 'var(--card-bg)' }} />
                <h3 className="text-center" style={{ fontSize: '16px', marginBottom: '4px', color: 'var(--text-main)' }}>{teacher.name}</h3>
                <p className="text-center text-muted" style={{ fontSize: '13px', marginBottom: '10px' }}>{teacher.subject}</p>
                <span className="tag" style={{ backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '11px' }}>{teacher.designation}</span>
                {teacher.reviewCount > 0 && (
                  <span style={{ color: '#FCD34D', fontSize: '13px', marginTop: '8px', fontWeight: 700 }}>
                    ⭐ {teacher.avgRating.toFixed(1)} ({teacher.reviewCount})
                  </span>
                )}
              </div>
            </Link>
          ))}
          {!loading && teachers.length === 0 && (
            <div style={{ gridColumn: 'span 12', textAlign: 'center', padding: '40px' }} className="text-muted">
              No teachers found matching your criteria 💀
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Directory;
