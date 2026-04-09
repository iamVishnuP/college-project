import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  teacherLegacyId: { type: Number },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, default: 'Anonymous' }, // character name
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: String }],
  memeUrl: { type: String, default: '' },
  teachingQuality: { type: Number, min: 1, max: 5, default: 3 },
  strictness: { type: Number, min: 1, max: 5, default: 3 },
  marksLeniency: { type: Number, min: 1, max: 5, default: 3 },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Review', reviewSchema);
