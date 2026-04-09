import React, { useState } from 'react';
import teachersData from '../data/teachers.json';
import { Shield, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const mockReportedRoasts = [
  { id: 101, author: 'SleeplessFreshman', target: 'Prof. Margaret "The Sentinel" Smith', content: 'Do NOT take this class unless you enjoy the feeling of impending doom before the sun even rises.', reports: 4 },
  { id: 102, author: 'TrollMaster', target: 'Dr. Johnathan "Compiler" Doe', content: 'He is actually a robot in disguise. I saw his metal arm.', reports: 12 }
];

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('flagged');

  if (!user || !user.isAdmin) {
    return (
      <div className="container text-center pt-8">
        <h1 className="text-danger">Access Denied 🛑</h1>
        <p>You need Administrator privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-container animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="flex items-center gap-3 mb-8">
        <Shield size={32} className="text-primary" />
        <div>
          <h1>Admin Command Center</h1>
          <p className="text-muted">Moderate roasts, manage faculty directory, and oversee campus chaos.</p>
        </div>
      </div>

      <div className="tabs flex gap-4 mb-8">
        <button 
          className={`btn ${activeTab === 'flagged' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('flagged')}
        >
          <AlertTriangle size={16} /> Flagged Content
        </button>
        <button 
          className={`btn ${activeTab === 'teachers' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('teachers')}
        >
           Manage Teachers
        </button>
      </div>

      {activeTab === 'flagged' && (
        <div className="admin-section flex flex-col gap-4">
          <h3 className="mb-2">Pending Reports ({mockReportedRoasts.length})</h3>
          {mockReportedRoasts.map(post => (
            <div key={post.id} className="card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--danger)', padding: '20px', borderRadius: '8px' }}>
              <div className="flex justify-between items-center mb-2">
                <div className="text-danger font-bold flex items-center gap-2">
                  <AlertTriangle size={16} /> {post.reports} Reports
                </div>
                <span className="text-muted">ID: {post.id}</span>
              </div>
              <p className="mb-2"><strong>Target:</strong> {post.target} | <strong>Author:</strong> u/{post.author}</p>
              <div className="bg-black bg-opacity-20 p-4 rounded italic mb-4">"{post.content}"</div>
              <div className="flex gap-3">
                <button className="btn btn-danger"><Trash2 size={16} /> Delete Roast</button>
                <button className="btn btn-secondary">Ignore / Resolve</button>
                <button className="btn btn-secondary">Ban User</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'teachers' && (
        <div className="admin-section">
           <div className="flex justify-between items-center mb-4">
             <h3>Faculty Directory ({teachersData.length})</h3>
             <button className="btn btn-primary">Add New Teacher</button>
           </div>
           
           <div className="grid" style={{ gridTemplateColumns: 'repeat(1, 1fr)', gap: '12px' }}>
             {teachersData.map(teacher => (
               <div key={teacher.id} className="card flex justify-between items-center" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: '8px' }}>
                 <div className="flex items-center gap-4">
                   <img src={teacher.imgUrl} alt="avatar" style={{width: 40, height: 40, borderRadius: '50%'}} />
                   <div>
                     <div className="font-bold">{teacher.name}</div>
                     <div className="text-muted" style={{fontSize: 12}}>{teacher.designation} • {teacher.subject}</div>
                   </div>
                 </div>
                 <div className="flex gap-2">
                   <button className="btn btn-icon"><Edit size={16} /></button>
                   <button className="btn btn-icon text-danger"><Trash2 size={16} /></button>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
