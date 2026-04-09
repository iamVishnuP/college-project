import express from 'express';
import Teacher from '../models/Teacher.js';
import Review from '../models/Review.js';

const router = express.Router();

// GET /api/teachers  — all teachers, with optional ?search= and ?subject=
router.get('/', async (req, res) => {
  try {
    const { search, subject } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (subject && subject !== 'All') filter.subject = subject;
    const teachers = await Teacher.find(filter).sort({ name: 1 });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/teachers/subjects — unique subject list
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Teacher.distinct('subject');
    res.json(subjects.sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/teachers/:id
router.get('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found.' });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
