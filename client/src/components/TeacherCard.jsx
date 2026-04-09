import React from 'react';
import { Link } from 'react-router-dom';

const TeacherCard = ({ teacher }) => {
  const { id, name, subject, rating, tags, comment, reactions, reviewCount } = teacher;

  return (
    <Link to={`/teacher/${id}`} style={{ textDecoration: 'none' }}>
      <div className="teacher-card animate-slide-down">
        <div className="tc-header flex justify-between items-center">
          <div>
            <h3>{name}</h3>
            <p className="subject">{subject}</p>
          </div>
          <div className="rating">
            ⭐ {rating.toFixed(1)}
          </div>
        </div>

        <div className="tags flex gap-2 mt-4">
          {tags.map((tag, i) => (
            <span key={i} className={`tag ${getTagType(tag)}`}>{tag}</span>
          ))}
        </div>

        <div className="review snippet mt-4">
          <p>"{comment}"</p>
        </div>

        <div className="tc-footer flex justify-between items-center mt-6">
          <div className="reactions flex gap-3">
            <span className="reaction">😂 {reactions.laugh}</span>
            <span className="reaction">💯 {reactions.hundred}</span>
            <span className="reaction">💀 {reactions.skull}</span>
          </div>
          <div className="comments-count">
            💬 {reviewCount} reviews
          </div>
        </div>
      </div>
    </Link>
  );
};

export function getTagType(tag) {
  const lowerTag = tag.toLowerCase();
  if (lowerTag.includes('strict') || lowerTag.includes('destroyer') || lowerTag.includes('fear') || lowerTag.includes('freak')) return 'danger';
  if (lowerTag.includes('chill') || lowerTag.includes('easy') || lowerTag.includes('lenient')) return 'success';
  return 'accent';
}

export default TeacherCard;
