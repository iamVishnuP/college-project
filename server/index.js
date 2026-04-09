import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import teacherRoutes from './routes/teachers.js';
import reviewRoutes from './routes/reviews.js';
import confessionRoutes from './routes/confessions.js';
import resourceRoutes from './routes/resources.js';
import pulseRoutes from './routes/pulse.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://rooney:vishnu@clg-org.mfzgumx.mongodb.net/campusroast?retryWrites=true&w=majority';

/* ── Middleware ── */
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '10mb' }));

/* ── Routes ── */
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/confessions', confessionRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/pulse', pulseRoutes);

/* ── Health check ── */
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

/* ── 404 fallback ── */
app.use((req, res) => res.status(404).json({ error: `Route ${req.path} not found` }));

/* ── Global error handler ── */
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  res.status(500).json({ error: 'Internal server error' });
});

/* ── Connect & start ── */
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
