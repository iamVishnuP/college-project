import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  legacyId: { type: Number, unique: true },   // matches teachers.json id
  name: { type: String, required: true },
  subject: { type: String, required: true },
  designation: { type: String, default: '' },
  gender: { type: String, default: 'Unknown' },
  imgUrl: { type: String, default: '' },
  // Aggregated stats (recomputed on review submit)
  avgRating: { type: Number, default: 0 },
  avgTeachingQuality: { type: Number, default: 0 },
  avgStrictness: { type: Number, default: 0 },
  avgMarksLeniency: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
});

export default mongoose.model('Teacher', teacherSchema);
