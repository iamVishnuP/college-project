import express from 'express';
import User from '../models/User.js';
import { signToken, protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, characterName } = req.body;
    if (!email || !password || !characterName)
      return res.status(400).json({ error: 'All fields are required.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const existEmail = await User.findOne({ email: email.toLowerCase() });
    if (existEmail) return res.status(409).json({ error: 'Email already registered.' });

    const existName = await User.findOne({ characterName });
    if (existName) return res.status(409).json({ error: 'Character name already taken.' });

    const isAdmin = email.toLowerCase() === 'admin@campusroast.com';
    const user = await User.create({ email, password, characterName, isAdmin });
    const token = signToken(user);

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, characterName: user.characterName, isAdmin: user.isAdmin },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, email: user.email, characterName: user.characterName, isAdmin: user.isAdmin },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
