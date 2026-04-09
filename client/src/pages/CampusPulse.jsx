import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Plus, MapPin, CheckCircle, Clock, Wifi, Loader } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

/* ─── Static data (canteen & wifi don't need backend) ─── */
const CANTEEN_ITEMS = [
  { id: 1, name: 'Masala Dosa', price: 30, emoji: '🫓', baseRating: 4.5 },
  { id: 2, name: 'Chicken Biriyani', price: 80, emoji: '🍛', baseRating: 4.8 },
  { id: 3, name: 'Veg Noodles', price: 45, emoji: '🍜', baseRating: 3.2 },
  { id: 4, name: 'Black Coffee', price: 15, emoji: '☕', baseRating: 4.0 },
  { id: 5, name: 'Samosa', price: 12, emoji: '🥟', baseRating: 3.8 },
  { id: 6, name: 'Egg Curry Rice', price: 55, emoji: '🍳', baseRating: 4.1 },
  { id: 7, name: 'Shawarma', price: 60, emoji: '🌯', baseRating: 4.6 },
  { id: 8, name: 'Lime Juice', price: 20, emoji: '🍋', baseRating: 1.9 },
];

const LOCATIONS = [
  { id: 1, name: 'Block A', wifi: '✅ Working', wifiLevel: 'good', classStatus: '🟢 Happening' },
  { id: 2, name: 'Block B', wifi: '⚠️ Slow', wifiLevel: 'slow', classStatus: '🔴 Cancelled' },
  { id: 3, name: 'Library', wifi: '✅ Working', wifiLevel: 'good', classStatus: '🟢 Happening' },
  { id: 4, name: 'Lab', wifi: '💀 Dead', wifiLevel: 'dead', classStatus: '🟢 Happening' },
  { id: 5, name: 'Canteen', wifi: '⚠️ Slow', wifiLevel: 'slow', classStatus: '🔴 Cancelled' },
];

const LF_CATEGORIES = ['Electronics', 'Stationary', 'Clothing', 'ID Card', 'Other'];
const LF_CAT_COLORS = {
  Electronics: { bg: 'rgba(56,189,248,0.15)', color: '#38BDF8' },
  Stationary: { bg: 'rgba(168,85,247,0.15)', color: '#A855F7' },
  Clothing: { bg: 'rgba(34,197,94,0.15)', color: '#22C55E' },
  'ID Card': { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
  Other: { bg: 'rgba(255,255,255,0.08)', color: '#94A3B8' },
};

const EVENT_FILTERS = ['All', 'Today', 'This Week', 'Fests', 'Academic', 'Club'];

const useCountdown = () => {
  const [seconds, setSeconds] = useState(3 * 3600);
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s > 0 ? s - 1 : 3 * 3600), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};

const StarPicker = ({ value, onChange }) => (
  <span style={{ display: 'inline-flex', gap: '3px' }}>
    {[1,2,3,4,5].map(s => (
      <span key={s} onClick={() => onChange(s)} style={{ cursor:'pointer', fontSize:'18px', color: s <= value ? '#FCD34D' : 'rgba(255,255,255,0.2)', transition:'color 0.15s' }}>★</span>
    ))}
  </span>
);

const TABS = [
  { id: 'events', label: '📅 Events' },
  { id: 'lostfound', label: '📦 Lost & Found' },
  { id: 'canteen', label: '🍽️ Canteen' },
  { id: 'wifi', label: '📶 WiFi / Class' },
];

const CampusPulse = () => {
  const { user, setIsAuthModalOpen } = useAuth();
  const [activeTab, setActiveTab] = useState('events');

  // Events
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState('All');
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title:'', date:'', location:'', club:'', category:'Club' });
  const [postingEvent, setPostingEvent] = useState(false);

  // Lost & Found
  const [lostItems, setLostItems] = useState([]);
  const [lostLoading, setLostLoading] = useState(true);
  const [showLostForm, setShowLostForm] = useState(false);
  const [newLost, setNewLost] = useState({ desc:'', category:'Electronics' });

  // Canteen
  const [ratings, setRatings] = useState(() => Object.fromEntries(CANTEEN_ITEMS.map(i => [i.id, i.baseRating])));

  // WiFi
  const [votes, setVotes] = useState(() => Object.fromEntries(LOCATIONS.map(l => [l.id, { up: 0, down: 0 }])));
  const countdown = useCountdown();

  // Fetch events
  const fetchEvents = (cat = eventFilter) => {
    setEventsLoading(true);
    const params = cat !== 'All' ? { category: cat } : {};
    api.get('/pulse/events', { params })
      .then(r => setEvents(r.data))
      .catch(() => {})
      .finally(() => setEventsLoading(false));
  };

  // Fetch lost items
  const fetchLost = () => {
    setLostLoading(true);
    api.get('/pulse/lostitems')
      .then(r => setLostItems(r.data))
      .catch(() => {})
      .finally(() => setLostLoading(false));
  };

  useEffect(() => { fetchEvents(); }, [eventFilter]);
  useEffect(() => { if (activeTab === 'lostfound') fetchLost(); }, [activeTab]);

  const handlePostEvent = async () => {
    if (!user) { setIsAuthModalOpen(true); return; }
    if (!newEvent.title || !newEvent.date || !newEvent.location) return;
    setPostingEvent(true);
    try {
      const { data } = await api.post('/pulse/events', newEvent);
      setEvents(prev => [data, ...prev]);
      setNewEvent({ title:'', date:'', location:'', club:'', category:'Club' });
      setShowEventForm(false);
    } catch {}
    finally { setPostingEvent(false); }
  };

  const handleEventUpvote = async (id) => {
    try {
      const { data } = await api.post(`/pulse/events/${id}/upvote`);
      setEvents(prev => prev.map(e => e._id === id ? { ...e, upvotes: data.upvotes } : e));
    } catch {}
  };

  const handleReportLost = async () => {
    if (!newLost.desc) return;
    try {
      const { data } = await api.post('/pulse/lostitems', newLost);
      setLostItems(prev => [data, ...prev]);
      setNewLost({ desc:'', category:'Electronics' });
      setShowLostForm(false);
    } catch {}
  };

  const handleFoundIt = async (id) => {
    try {
      const { data } = await api.put(`/pulse/lostitems/${id}/found`);
      setLostItems(prev => prev.map(i => i._id === id ? data : i));
    } catch {}
  };

  const canteenWithRatings = CANTEEN_ITEMS.map(i => ({ ...i, rating: ratings[i.id] }));
  const minRating = Math.min(...canteenWithRatings.map(i => i.rating));
  const maxRating = Math.max(...canteenWithRatings.map(i => i.rating));

  const wifiBg = { good: 'rgba(34,197,94,0.1)', slow: 'rgba(245,158,11,0.1)', dead: 'rgba(239,68,68,0.1)' };

  return (
    <div className="animate-fade-in">
      <div style={{ textAlign:'center', marginBottom:'36px' }}>
        <h1 style={{ fontSize:'36px', marginBottom:'8px' }}>📡 Campus Pulse</h1>
        <p style={{ color:'var(--text-muted)' }}>Everything happening on campus — live, crowd-powered.</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'32px', flexWrap:'wrap', justifyContent:'center' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}>{tab.label}</button>
        ))}
      </div>

      {/* ── EVENTS ── */}
      {activeTab === 'events' && (
        <div className="animate-fade-in">
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center', marginBottom:'24px' }}>
            {EVENT_FILTERS.map(f => (
              <button key={f} onClick={() => setEventFilter(f)} style={{ padding:'6px 14px', borderRadius:'99px', border: eventFilter===f ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.12)', background: eventFilter===f ? 'rgba(56,189,248,0.15)' : 'transparent', color: eventFilter===f ? 'var(--primary)' : 'var(--text-muted)', cursor:'pointer', fontSize:'13px', fontWeight:600, fontFamily:'var(--font-main)', transition:'all 0.2s' }}>{f}</button>
            ))}
            <button className="btn btn-primary" style={{ marginLeft:'auto', gap:'6px' }} onClick={() => setShowEventForm(v => !v)}>
              <Plus size={14} /> Post Event
            </button>
          </div>

          {showEventForm && (
            <div className="animate-slide-down" style={{ backgroundColor:'var(--card-bg)', border:'1px solid rgba(56,189,248,0.25)', borderRadius:'var(--radius)', padding:'24px', marginBottom:'24px' }}>
              <h3 style={{ marginBottom:'16px', fontSize:'16px' }}>📅 Post an Event</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <input type="text" placeholder="Event Title *" value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} />
                <input type="date" value={newEvent.date} onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))} />
                <input type="text" placeholder="Location *" value={newEvent.location} onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))} />
                <input type="text" placeholder="Club/Organizer" value={newEvent.club} onChange={e => setNewEvent(p => ({ ...p, club: e.target.value }))} />
                <select value={newEvent.category} onChange={e => setNewEvent(p => ({ ...p, category: e.target.value }))}>
                  {['Club','Academic','Fests','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" style={{ width:'100%' }} onClick={handlePostEvent} disabled={postingEvent}>
                {postingEvent ? <Loader size={14} style={{ animation:'spin 0.8s linear infinite' }} /> : 'Post Event'}
              </button>
            </div>
          )}

          {eventsLoading ? (
            <div style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)' }}><Loader size={24} style={{ animation:'spin 0.8s linear infinite' }} /></div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'16px' }}>
              {events.map(event => (
                <div key={event._id} className="animate-fade-in" style={{ backgroundColor:'var(--card-bg)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'var(--radius)', padding:'20px', display:'flex', flexDirection:'column', gap:'12px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <h4 style={{ fontSize:'15px', flex:1, marginRight:'8px' }}>{event.title}</h4>
                    <span style={{ background:'rgba(255,255,255,0.08)', borderRadius:'99px', padding:'3px 10px', fontSize:'11px', color:'var(--text-muted)', whiteSpace:'nowrap' }}>{event.category}</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                    <span style={{ fontSize:'13px', color:'var(--text-muted)' }}>📅 {event.date}</span>
                    <span style={{ fontSize:'13px', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'6px' }}><MapPin size={13} /> {event.location}</span>
                    {event.club && <span style={{ fontSize:'12px', color:'var(--primary)', fontWeight:600 }}>🏷 {event.club}</span>}
                  </div>
                  <button onClick={() => handleEventUpvote(event._id)} style={{ background:'rgba(56,189,248,0.1)', border:'1px solid rgba(56,189,248,0.25)', borderRadius:'8px', padding:'8px 14px', color:'var(--primary)', cursor:'pointer', fontWeight:700, fontSize:'13px', display:'flex', alignItems:'center', gap:'6px', fontFamily:'var(--font-main)', width:'fit-content' }}>
                    <ThumbsUp size={13} /> {event.upvotes}
                  </button>
                </div>
              ))}
              {events.length === 0 && <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'40px', color:'var(--text-muted)' }}>No events found.</div>}
            </div>
          )}
        </div>
      )}

      {/* ── LOST & FOUND ── */}
      {activeTab === 'lostfound' && (
        <div className="animate-fade-in">
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'20px' }}>
            <button className="btn btn-primary" style={{ gap:'6px' }} onClick={() => setShowLostForm(v => !v)}><Plus size={14} /> Report Lost Item</button>
          </div>
          {showLostForm && (
            <div className="animate-slide-down" style={{ backgroundColor:'var(--card-bg)', border:'1px solid rgba(56,189,248,0.25)', borderRadius:'var(--radius)', padding:'24px', marginBottom:'24px' }}>
              <h3 style={{ marginBottom:'16px', fontSize:'16px' }}>📦 Report a Lost Item</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                <textarea placeholder="Describe the item in detail... *" rows={3} value={newLost.desc} onChange={e => setNewLost(p => ({ ...p, desc: e.target.value }))} style={{ resize:'vertical' }} />
                <select value={newLost.category} onChange={e => setNewLost(p => ({ ...p, category: e.target.value }))}>
                  {LF_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button className="btn btn-primary" onClick={handleReportLost}>Submit Report</button>
              </div>
            </div>
          )}
          {lostLoading ? (
            <div style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)' }}><Loader size={24} style={{ animation:'spin 0.8s linear infinite' }} /></div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {lostItems.map(item => {
                const cat = LF_CAT_COLORS[item.category] || LF_CAT_COLORS.Other;
                return (
                  <div key={item._id} className="animate-fade-in" style={{ backgroundColor:'var(--card-bg)', border:`1px solid ${item.found ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius:'var(--radius)', padding:'18px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', flexWrap:'wrap' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
                        <span style={{ background:cat.bg, color:cat.color, borderRadius:'99px', padding:'3px 10px', fontSize:'11px', fontWeight:700 }}>{item.category}</span>
                        {item.found && <span style={{ background:'rgba(34,197,94,0.15)', color:'#22C55E', borderRadius:'99px', padding:'3px 10px', fontSize:'11px', fontWeight:700, display:'flex', alignItems:'center', gap:'4px' }}><CheckCircle size={11} /> Found!</span>}
                      </div>
                      <p style={{ color:'var(--text-main)', fontSize:'14px' }}>{item.desc}</p>
                    </div>
                    {!item.found && (
                      <button className="btn btn-secondary" style={{ gap:'6px', whiteSpace:'nowrap', borderColor:'rgba(34,197,94,0.4)', color:'#22C55E' }} onClick={() => handleFoundIt(item._id)}>
                        <CheckCircle size={14} /> Found it!
                      </button>
                    )}
                  </div>
                );
              })}
              {lostItems.length === 0 && <div style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)' }}>No lost items reported.</div>}
            </div>
          )}
        </div>
      )}

      {/* ── CANTEEN ── */}
      {activeTab === 'canteen' && (
        <div className="animate-fade-in">
          <p style={{ color:'var(--text-muted)', textAlign:'center', marginBottom:'28px', fontSize:'14px' }}>Rate today's menu items. Crowd ratings update in real time.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'16px' }}>
            {canteenWithRatings.map(item => {
              const isWorst = item.rating === minRating, isBest = item.rating === maxRating;
              return (
                <div key={item.id} className="animate-fade-in" style={{ backgroundColor:'var(--card-bg)', border: isBest ? '1px solid rgba(252,211,77,0.4)' : isWorst ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(255,255,255,0.07)', borderRadius:'var(--radius)', padding:'20px', display:'flex', flexDirection:'column', gap:'10px', alignItems:'center', textAlign:'center' }}>
                  <span style={{ fontSize:'40px' }}>{item.emoji}</span>
                  <h4 style={{ fontSize:'15px', marginBottom:'2px' }}>{item.name}</h4>
                  <span style={{ color:'#FCD34D', fontWeight:700, fontSize:'20px' }}>₹{item.price}</span>
                  {isBest && <span style={{ fontSize:'13px', color:'#FCD34D', fontWeight:700 }}>🌟 Best Rated</span>}
                  {isWorst && <span style={{ fontSize:'13px', color:'#EF4444', fontWeight:700 }}>💀 Avoid Today</span>}
                  <div>
                    <StarPicker value={Math.round(ratings[item.id])} onChange={v => setRatings(r => ({ ...r, [item.id]: v }))} />
                    <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'4px' }}>{ratings[item.id].toFixed(1)} / 5.0</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── WIFI / CLASS ── */}
      {activeTab === 'wifi' && (
        <div className="animate-fade-in">
          <div style={{ textAlign:'center', marginBottom:'28px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
            <Clock size={16} style={{ color:'var(--text-muted)' }} />
            <span style={{ color:'var(--text-muted)', fontSize:'14px' }}>
              Crowd data resets in <span style={{ color:'var(--primary)', fontWeight:700, fontFamily:'monospace', fontSize:'16px' }}>{countdown}</span>
            </span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'16px' }}>
            {LOCATIONS.map(loc => {
              const v = votes[loc.id];
              const total = v.up + v.down + 1;
              const conf = Math.round((v.up / total) * 100);
              return (
                <div key={loc.id} className="animate-fade-in" style={{ backgroundColor:'var(--card-bg)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'var(--radius)', padding:'22px', display:'flex', flexDirection:'column', gap:'14px' }}>
                  <h4 style={{ fontSize:'16px', display:'flex', alignItems:'center', gap:'8px' }}><MapPin size={15} style={{ color:'var(--primary)' }} /> {loc.name}</h4>
                  <div style={{ background: wifiBg[loc.wifiLevel] || 'rgba(255,255,255,0.05)', borderRadius:'10px', padding:'10px 14px', fontSize:'14px', fontWeight:600, display:'flex', alignItems:'center', gap:'8px' }}><Wifi size={15} /> {loc.wifi}</div>
                  <div style={{ background: loc.classStatus.includes('Happening') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', borderRadius:'10px', padding:'10px 14px', fontSize:'14px', fontWeight:600 }}>{loc.classStatus}</div>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button onClick={() => setVotes(p => ({ ...p, [loc.id]: { ...p[loc.id], up: p[loc.id].up + 1 } }))} style={{ flex:1, background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:'8px', padding:'8px', color:'#22C55E', cursor:'pointer', fontWeight:700, fontSize:'13px', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', fontFamily:'var(--font-main)' }}>
                      <ThumbsUp size={13} /> {v.up}
                    </button>
                    <button onClick={() => setVotes(p => ({ ...p, [loc.id]: { ...p[loc.id], down: p[loc.id].down + 1 } }))} style={{ flex:1, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', padding:'8px', color:'#EF4444', cursor:'pointer', fontWeight:700, fontSize:'13px', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', fontFamily:'var(--font-main)' }}>
                      <ThumbsDown size={13} /> {v.down}
                    </button>
                  </div>
                  <div style={{ fontSize:'11px', color:'var(--text-muted)', textAlign:'center' }}>{conf}% confirmed by crowd</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CampusPulse;
