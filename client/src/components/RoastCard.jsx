import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, MessageSquare, Share, Flame } from 'lucide-react';
import { getTagType } from './TeacherCard';
import api from '../lib/api';

const timeAgo = (dateStr) => {
  if (!dateStr) return 'some time ago';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

const RoastCard = ({ roast }) => {
  const [upvotes, setUpvotes] = useState(roast.upvotes || 0);
  const [downvotes, setDownvotes] = useState(roast.downvotes || 0);
  const [voteStatus, setVoteStatus] = useState(0); // 1 for up, -1 for down, 0 none

  const handleVote = async (dir) => {
    // Optimistic UI for vote status
    const prevStatus = voteStatus;
    const newStatus = voteStatus === (dir === 'up' ? 1 : -1) ? 0 : (dir === 'up' ? 1 : -1);
    setVoteStatus(newStatus);

    try {
      const { data } = await api.post(`/reviews/${roast._id}/vote`, { dir });
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
    } catch (err) {
      console.error("Vote failed", err);
      // Revert if failed
      setVoteStatus(prevStatus);
    }
  };

  return (
    <div className="roast-card animate-slide-down">
      {/* Upvote side */}
      <div className="vote-column">
        <button 
          className={`vote-btn ${voteStatus === 1 ? 'upvoted' : ''}`} 
          onClick={() => handleVote('up')}
        >
          <ArrowUp size={24} strokeWidth={3} />
        </button>
        <span className={`vote-count ${voteStatus === 1 ? 'upvoted-text' : voteStatus === -1 ? 'downvoted-text' : ''}`}>
          {upvotes - downvotes}
        </span>
        <button 
          className={`vote-btn ${voteStatus === -1 ? 'downvoted' : ''}`} 
          onClick={() => handleVote('down')}
        >
          <ArrowDown size={24} strokeWidth={3} />
        </button>
      </div>

      {/* Main post body */}
      <div className="roast-content">
        <div className="roast-header">
          <Link to={`/teacher/${roast.teacherId}`} className="teacher-target">
            🎯 Target Teacher
          </Link>
          <span className="dot">•</span>
          <span className="posted-by">Posted by u/{roast.authorName || 'Anonymous'}</span>
          <span className="dot">•</span>
          <span className="time">{timeAgo(roast.createdAt)}</span>
        </div>

        <h3 className="roast-title">{roast.title}</h3>
        
        <div className="tags flex gap-2 mb-3">
          {(roast.tags || []).map((tag, i) => (
            <span key={i} className={`tag ${getTagType(tag)}`}>{tag}</span>
          ))}
        </div>

        <p className="roast-text">{roast.content}</p>

        {roast.memeUrl && (
          <div className="roast-meme">
            <img src={roast.memeUrl} alt="Roast attached meme" />
          </div>
        )}

        <div className="roast-actions">
          <button className="action-btn">
             <MessageSquare size={18} /> {roast.commentCount || 0} Comments
          </button>
          <button className="action-btn" onClick={() => { navigator.clipboard.writeText(window.location.href); }}>
             <Share size={18} /> Share
          </button>
          <button className="action-btn award-btn">
             <Flame size={18} /> Burn!
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoastCard;
