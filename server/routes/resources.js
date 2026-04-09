import express from 'express';
import Resource from '../models/Resource.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const BADGES = [
  '🦊 SleeplessSloth', '🦉 NightOwl99', '🐢 MarksCrusher',
  '🦋 QuietGenius', '🐉 Topper Dragon', '🦁 SemSurvivor',
  '🐺 CodefoxAlpha', '🐸 MidnightCoder',
];

// GET /api/resources  — with filters ?type=&semester=&search=
router.get('/', async (req, res) => {
  try {
    const { type, semester, search } = req.query;
    const filter = {};
    if (type && type !== 'All') filter.type = type;
    if (semester && semester !== 'All') filter.semester = semester;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }
    const resources = await Resource.find(filter).sort({ downloads: -1, createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/resources
router.post('/', protect, async (req, res) => {
  try {
    const { title, subject, semester, type, desc } = req.body;
    if (!title || !subject || !semester || !type)
      return res.status(400).json({ error: 'title, subject, semester and type are required.' });
    const badge = BADGES[Math.floor(Math.random() * BADGES.length)];
    const resource = await Resource.create({ title, subject, semester, type, desc: desc || '', uploaderBadge: badge });
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/resources/:id/download  — increment counter
router.post('/:id/download', async (req, res) => {
  try {
    const r = await Resource.findByIdAndUpdate(
      req.params.id, { $inc: { downloads: 1 } }, { new: true }
    );
    if (!r) return res.status(404).json({ error: 'Resource not found.' });
    res.json({ downloads: r.downloads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
