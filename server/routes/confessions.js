import express from 'express';
import Confession from '../models/Confession.js';

const router = express.Router();

const BLOCKED_WORDS = ['spam', 'hate', 'slur', 'abuse', 'idiot', 'stupid', 'dumb'];
const hasProfanity = (t) => BLOCKED_WORDS.some((w) => t.toLowerCase().includes(w));
const wordCount = (t) => t.trim().split(/\s+/).filter(Boolean).length;

// GET /api/confessions
router.get('/', async (req, res) => {
  try {
    const confessions = await Confession.find().sort({ createdAt: -1 }).limit(100);
    res.json(confessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/confessions
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required.' });
    if (wordCount(text) < 20)
      return res.status(400).json({ error: `Minimum 20 words required. You have ${wordCount(text)}.` });
    if (hasProfanity(text))
      return res.status(400).json({ error: 'Confession contains blocked words. Please rephrase.' });

    const confession = await Confession.create({ text });
    res.status(201).json(confession);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/confessions/:id/upvote
router.post('/:id/upvote', async (req, res) => {
  try {
    const c = await Confession.findByIdAndUpdate(
      req.params.id, { $inc: { upvotes: 1 } }, { new: true }
    );
    if (!c) return res.status(404).json({ error: 'Not found.' });
    res.json({ upvotes: c.upvotes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/confessions/:id/react   body: { emoji }
router.post('/:id/react', async (req, res) => {
  try {
    const { emoji } = req.body;
    const allowed = ['😂', '💀', '😬', '🤝', '💯'];
    if (!allowed.includes(emoji)) return res.status(400).json({ error: 'Invalid emoji.' });
    const field = `reactions.${emoji}`;
    const c = await Confession.findByIdAndUpdate(
      req.params.id, { $inc: { [field]: 1 } }, { new: true }
    );
    if (!c) return res.status(404).json({ error: 'Not found.' });
    res.json({ reactions: c.reactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/confessions/:id/flag
router.post('/:id/flag', async (req, res) => {
  try {
    const c = await Confession.findByIdAndUpdate(
      req.params.id, { $inc: { flags: 1 } }, { new: true }
    );
    if (!c) return res.status(404).json({ error: 'Not found.' });
    res.json({ flags: c.flags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
