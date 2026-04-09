import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import AddReviewModal from '../components/AddReviewModal';
import { ArrowLeft, Share2, Loader, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const getTagType = (tag) => {
  const danger = ['Strict', 'GPA Destroyer', 'Heavy Homework', 'Nightmare'];
  const accent = ['Chill', 'Fair', 'Genius', 'Meme God'];
  if (danger.some(d => tag.includes(d))) return 'danger';
  if (accent.some(a => tag.includes(a))) return 'accent';
  return '';
};

const Bar = ({ label, value, color = 'var(--primary)' }) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
      <span style={{ fontSize: '14px' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 700 }}>{value.toFixed(1)}/5</span>
    </div>
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${(value / 5) * 100}%`, backgroundColor: color }} />
    </div>
  </div>
);

const TeacherProfile = () => {
  const { id } = useParams();
  const { user, setIsAuthModalOpen } = useAuth();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/teachers/${id}`),
      api.get(`/reviews`, { params: { teacherId: id } }),
    ]).then(([tRes, rRes]) => {
      setTeacher(tRes.data);
      setReviews(rRes.data);
    }).catch(() => navigate('/directory'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRoastClick = () => {
    if (!user) setIsAuthModalOpen(true);
    else setIsModalOpen(true);
  };

  const handleReviewPosted = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    // Refresh teacher to get updated averages
    api.get(`/teachers/${id}`).then(r => setTeacher(r.data)).catch(() => {});
  };

  const handleVote = async (reviewId, dir) => {
    try {
      const { data } = await api.post(`/reviews/${reviewId}/vote`, { dir });
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, ...data } : r));
    } catch {}
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
      <Loader size={32} style={{ animation: 'spin 0.8s linear infinite', marginBottom: '12px' }} />
      <p>Loading profile...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!teacher) return null;

  const tags = teacher.avgStrictness > 3.5
    ? ['Strict ⚠️', 'Heavy Homework 📚']
    : teacher.avgTeachingQuality > 4
    ? ['Chill 😎', 'Highly Rated ⭐']
    : ['Fair Player ⚖️'];

  return (
    <div className="profile-container animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '24px', gap: '6px' }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header card */}
      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius)', padding: '36px 40px', display: 'flex', gap: '32px', alignItems: 'flex-start', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.07)', boxShadow: 'var(--shadow-md)' }}>
        <img src={teacher.imgUrl} alt={teacher.name} onError={e => e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${teacher.name}`} style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid var(--primary)', objectFit: 'cover', flexShrink: 0, backgroundColor: 'var(--card-bg)' }} />
        <div style={{ flex: 1 }}>
          <h1 style={{ marginBottom: '4px', fontSize: '28px' }}>{teacher.name}</h1>
          <p style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '12px', fontSize: '15px' }}>
            {teacher.subject} · {teacher.designation}
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tags.map(tag => (
              <span key={tag} className={`tag ${getTagType(tag)}`}>{tag}</span>
            ))}
          </div>
          {teacher.reviewCount > 0 && (
            <div style={{ marginTop: '12px', color: '#FCD34D', fontWeight: 700, fontSize: '18px' }}>
              ⭐ {teacher.avgRating.toFixed(1)} <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 400 }}>({teacher.reviewCount} reviews)</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="btn btn-primary" onClick={handleRoastClick}>Roast this Instructor 🔥</button>
          <button className="btn btn-secondary btn-icon" onClick={() => { navigator.clipboard.writeText(window.location.href); }}>
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Ratings breakdown */}
      {teacher.reviewCount > 0 && (
        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius)', padding: '28px', marginBottom: '28px', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 style={{ marginBottom: '20px' }}>Rating Breakdown</h3>
          <Bar label="Teaching Quality" value={teacher.avgTeachingQuality} color="var(--primary)" />
          <Bar label="Strictness" value={teacher.avgStrictness} color="var(--danger)" />
          <Bar label="Marks Leniency" value={teacher.avgMarksLeniency} color="var(--success)" />
        </div>
      )}

      {/* AI summary */}
      <div style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: '28px' }}>
        <h4 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '15px' }}>✨ AI Review Summary</h4>
        <p>
          {teacher.reviewCount === 0
            ? `No reviews yet for ${teacher.name}. Be the first to leave one!`
            : teacher.avgRating >= 4
            ? `Most students rate ${teacher.name} highly. Excellent teaching quality with ${teacher.avgRating.toFixed(1)}/5 average rating.`
            : `${teacher.name} has a mixed reputation. Known for ${teacher.avgStrictness > 3.5 ? 'being strict' : 'fair grading'}.`
          }
        </p>
      </div>

      {/* Reviews */}
      <div>
        <h3 style={{ marginBottom: '20px' }}>Student Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p>No reviews yet. Drop the first roast 🔥</p>
            <button className="btn btn-primary" onClick={handleRoastClick} style={{ marginTop: '16px' }}>Rate This Teacher</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map(review => (
              <div key={review._id} style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius)', padding: '22px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.authorName}`} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{review.authorName}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                        {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ color: s <= Math.round(review.teachingQuality || 3) ? '#FCD34D' : 'rgba(255,255,255,0.15)' }}>★</span>
                    ))}
                  </div>
                </div>
                <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>{review.title}</h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '14px' }}>{review.content}</p>
                {review.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {review.tags.map(tag => <span key={tag} className={`tag ${getTagType(tag)}`}>{tag}</span>)}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleVote(review._id, 'up')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ⬆️ {review.upvotes}
                  </button>
                  <button onClick={() => handleVote(review._id, 'down')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ⬇️ {review.downvotes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <AddReviewModal
          onClose={() => setIsModalOpen(false)}
          teacherName={teacher.name}
          teacherId={teacher._id}
          onReviewPosted={handleReviewPosted}
        />
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default TeacherProfile;
