import mongoose from 'mongoose';

const lostItemSchema = new mongoose.Schema({
  desc: { type: String, required: true },
  category: {
    type: String,
    enum: ['Electronics', 'Stationary', 'Clothing', 'ID Card', 'Other'],
    default: 'Other',
  },
  found: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('LostItem', lostItemSchema);
