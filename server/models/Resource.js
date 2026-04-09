import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  semester: { type: String, required: true },
  type: { type: String, enum: ['Notes', 'PYQ', 'Lab File', 'Assignment'], required: true },
  desc: { type: String, default: '' },
  downloads: { type: Number, default: 0 },
  rating: { type: Number, default: 4.0 },
  uploaderBadge: { type: String, default: '🦊 SleeplessSloth' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Resource', resourceSchema);
