import mongoose from 'mongoose';

const confessionSchema = new mongoose.Schema({
  text: { type: String, required: true, minlength: 1 },
  upvotes: { type: Number, default: 0 },
  reactions: {
    '😂': { type: Number, default: 0 },
    '💀': { type: Number, default: 0 },
    '😬': { type: Number, default: 0 },
    '🤝': { type: Number, default: 0 },
    '💯': { type: Number, default: 0 },
  },
  replyCount: { type: Number, default: 0 },
  flags: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Confession', confessionSchema);
