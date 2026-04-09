import express from 'express';
import Event from '../models/Event.js';
import LostItem from '../models/LostItem.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/* ─── EVENTS ─── */

// GET /api/pulse/events?category=
router.get('/events', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category && category !== 'All') {
      if (category === 'Today') {
        const today = new Date().toISOString().split('T')[0];
        filter.date = today;
      } else if (category !== 'This Week') {
        filter.category = category;
      }
    }
    const events = await Event.find(filter).sort({ upvotes: -1, createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pulse/events
router.post('/events', protect, async (req, res) => {
  try {
    const { title, date, location, club, category } = req.body;
    if (!title || !date || !location)
      return res.status(400).json({ error: 'title, date, location are required.' });
    const event = await Event.create({ title, date, location, club: club || '', category: category || 'Club' });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pulse/events/:id/upvote
router.post('/events/:id/upvote', async (req, res) => {
  try {
    const e = await Event.findByIdAndUpdate(req.params.id, { $inc: { upvotes: 1 } }, { new: true });
    if (!e) return res.status(404).json({ error: 'Event not found.' });
    res.json({ upvotes: e.upvotes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─── LOST & FOUND ─── */

// GET /api/pulse/lostitems
router.get('/lostitems', async (req, res) => {
  try {
    const items = await LostItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pulse/lostitems
router.post('/lostitems', async (req, res) => {
  try {
    const { desc, category } = req.body;
    if (!desc) return res.status(400).json({ error: 'Description is required.' });
    const item = await LostItem.create({ desc, category: category || 'Other' });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/pulse/lostitems/:id/found
router.put('/lostitems/:id/found', async (req, res) => {
  try {
    const item = await LostItem.findByIdAndUpdate(req.params.id, { found: true }, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
