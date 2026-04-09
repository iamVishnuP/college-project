import express from 'express';
import Review from '../models/Review.js';
import Teacher from '../models/Teacher.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/reviews?teacherId=X&sort=hot|new
router.get('/', async (req, res) => {
  try {
    const { teacherId, sort = 'hot' } = req.query;
    const filter = {};
    if (teacherId) filter.teacherId = teacherId;
    const sortOpt = sort === 'new' ? { createdAt: -1 } : { upvotes: -1, createdAt: -1 };
    const reviews = await Review.find(filter).sort(sortOpt).limit(50);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews  — create a review/roast
router.post('/', protect, async (req, res) => {
  try {
    const { teacherId, title, content, tags, memeUrl, teachingQuality, strictness, marksLeniency } = req.body;
    if (!teacherId || !title || !content)
      return res.status(400).json({ error: 'teacherId, title, and content are required.' });

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found.' });

    const review = await Review.create({
      teacherId,
      teacherLegacyId: teacher.legacyId,
      authorId: req.user.id,
      authorName: req.user.characterName,
      title,
      content,
      tags: tags || [],
      memeUrl: memeUrl || '',
      teachingQuality: teachingQuality || 3,
      strictness: strictness || 3,
      marksLeniency: marksLeniency || 3,
    });

    // Recompute teacher aggregates
    const all = await Review.find({ teacherId });
    const count = all.length;
    const avg = (field) => all.reduce((s, r) => s + (r[field] || 3), 0) / count;
    await Teacher.findByIdAndUpdate(teacherId, {
      reviewCount: count,
      avgTeachingQuality: +avg('teachingQuality').toFixed(2),
      avgStrictness: +avg('strictness').toFixed(2),
      avgMarksLeniency: +avg('marksLeniency').toFixed(2),
      avgRating: +((avg('teachingQuality') + avg('marksLeniency') + (5 - avg('strictness') + 1)) / 3).toFixed(2),
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews/:id/vote  — upvote or downvote
router.post('/:id/vote', optionalAuth, async (req, res) => {
  try {
    const { dir } = req.body; // 'up' or 'down'
    const inc = dir === 'up' ? { upvotes: 1 } : { downvotes: 1 };
    const review = await Review.findByIdAndUpdate(req.params.id, { $inc: inc }, { new: true });
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    res.json({ upvotes: review.upvotes, downvotes: review.downvotes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
