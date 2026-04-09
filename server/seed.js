/**
 * seed.js — Run once to populate MongoDB with all data from teachers.json
 * Usage: node server/seed.js
 */
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import Teacher from './models/Teacher.js';
import Confession from './models/Confession.js';
import Resource from './models/Resource.js';
import Event from './models/Event.js';
import LostItem from './models/LostItem.js';
import Review from './models/Review.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ Seed failed: MONGO_URI not found in .env");
  process.exit(1);
}

const teachersRaw = JSON.parse(
  readFileSync(join(__dirname, '../client/src/data/teachers.json'), 'utf-8')
);

/* ─── Mock seed data ─── */
const CONFESSIONS_SEED = [
  { text: "I've been copying my lab records from the same guy for 3 semesters and the teacher thinks I'm her best student 💀", upvotes: 142, reactions: { '😂': 45, '💀': 38, '😬': 12, '🤝': 5, '💯': 9 }, replyCount: 23, flags: 0 },
  { text: "Our HOD doesn't know that half the department uses ChatGPT for every assignment. We even share the same prompt.", upvotes: 98, reactions: { '😂': 60, '💀': 20, '😬': 8, '🤝': 3, '💯': 7 }, replyCount: 15, flags: 0 },
  { text: "I slept through every 8 AM class this semester and still passed because my friend marks proxy for me every single day.", upvotes: 211, reactions: { '😂': 70, '💀': 55, '😬': 20, '🤝': 45, '💯': 21 }, replyCount: 31, flags: 0 },
  { text: "The WiFi password in the library is written behind the librarian's desk nameplate. I'm not telling which one.", upvotes: 175, reactions: { '😂': 30, '💀': 10, '😬': 5, '🤝': 100, '💯': 30 }, replyCount: 42, flags: 0 },
  { text: "I accidentally called my teacher 'mom' in front of the whole class during viva and she just... went with it.", upvotes: 320, reactions: { '😂': 200, '💀': 60, '😬': 30, '🤝': 10, '💯': 20 }, replyCount: 8, flags: 0 },
  { text: "I've been wearing the same hoodie to college for 2 months straight. Nobody noticed.", upvotes: 67, reactions: { '😂': 20, '💀': 5, '😬': 3, '🤝': 30, '💯': 9 }, replyCount: 5, flags: 0 },
  { text: "There's a secret canteen that opens at 6 PM after the official one closes. Third year students know.", upvotes: 89, reactions: { '😂': 15, '💀': 10, '😬': 5, '🤝': 50, '💯': 9 }, replyCount: 18, flags: 0 },
  { text: "I wrote an entire mini project in one night powered by 3 Red Bulls and existential dread. Got an A+.", upvotes: 258, reactions: { '😂': 80, '💀': 90, '😬': 30, '🤝': 28, '💯': 30 }, replyCount: 11, flags: 0 },
  { text: "I've never actually read any textbook recommended by any professor. Still somehow here.", upvotes: 190, reactions: { '😂': 50, '💀': 40, '😬': 15, '🤝': 60, '💯': 25 }, replyCount: 7, flags: 0 },
  { text: "Our entire batch submitted the exact same viva answers last semester. The teacher passed everyone.", upvotes: 145, reactions: { '😂': 55, '💀': 30, '😬': 10, '🤝': 35, '💯': 15 }, replyCount: 13, flags: 0 },
];

const RESOURCES_SEED = [
  { title: 'DS & Algorithms Complete Notes', subject: 'CSE', semester: '3', type: 'Notes', downloads: 234, rating: 4.8, desc: 'Covers all modules with diagrams and examples.', uploaderBadge: '🦊 SleeplessSloth' },
  { title: 'Signals & Systems PYQ 2019-2024', subject: 'ECE', semester: '4', type: 'PYQ', downloads: 87, rating: 4.5, desc: 'All previous year questions with solved answers.', uploaderBadge: '🦉 NightOwl99' },
  { title: 'DBMS Lab File S5', subject: 'CSE', semester: '5', type: 'Lab File', downloads: 61, rating: 4.2, desc: '15 experiments fully completed with output.', uploaderBadge: '🐢 MarksCrusher' },
  { title: 'Engineering Maths Module 1', subject: 'Applied Science', semester: '1', type: 'Notes', downloads: 312, rating: 4.9, desc: 'Best maths notes for S1, super clean handwriting.', uploaderBadge: '🦋 QuietGenius' },
  { title: 'Fluid Mechanics Assignment', subject: 'Civil', semester: '4', type: 'Assignment', downloads: 44, rating: 3.9, desc: 'Complete solved assignment, citation included.', uploaderBadge: '🐉 Topper Dragon' },
  { title: 'Basic Circuits PYQ 2020-2024', subject: 'EEE', semester: '2', type: 'PYQ', downloads: 58, rating: 4.1, desc: 'Sorted by year and topic for easy revision.', uploaderBadge: '🦁 SemSurvivor' },
  { title: 'OS Lab File complete', subject: 'CSE', semester: '6', type: 'Lab File', downloads: 130, rating: 4.6, desc: 'All programs with output screenshots attached.', uploaderBadge: '🐺 CodefoxAlpha' },
  { title: 'Thermodynamics Short Notes', subject: 'Mechanical', semester: '3', type: 'Notes', downloads: 76, rating: 4.4, desc: 'One-page summary per chapter, exam-ready.', uploaderBadge: '🐸 MidnightCoder' },
  { title: 'Computer Networks S7 Module Notes', subject: 'CSE', semester: '7', type: 'Notes', downloads: 53, rating: 4.7, desc: 'Module-wise notes with KTU syllabus.', uploaderBadge: '🦊 SleeplessSloth' },
  { title: 'Structural Analysis PYQ', subject: 'Civil', semester: '5', type: 'PYQ', downloads: 39, rating: 4.0, desc: '2018 to 2024 solutions compiled.', uploaderBadge: '🦉 NightOwl99' },
  { title: 'Machine Learning Assignment S7', subject: 'CSE', semester: '7', type: 'Assignment', downloads: 99, rating: 4.5, desc: 'Supervised learning practicals done cleanly.', uploaderBadge: '🐢 MarksCrusher' },
  { title: 'Applied Physics S1 Notes', subject: 'Applied Science', semester: '1', type: 'Notes', downloads: 280, rating: 4.8, desc: 'Covers all chapters, ideal for quick revision.', uploaderBadge: '🦋 QuietGenius' },
];

const EVENTS_SEED = [
  { title: 'Techfest 2025 Hackathon', date: '2025-04-12', location: 'Main Auditorium', club: 'IEEE', upvotes: 87, category: 'Fests' },
  { title: 'Photography Workshop', date: '2025-04-10', location: 'Room 204', club: 'Photography Club', upvotes: 34, category: 'Club' },
  { title: 'Semester Project Submission', date: '2025-04-09', location: 'Online / HOD Office', club: 'Academic', upvotes: 120, category: 'Academic' },
  { title: 'NSS Blood Donation Camp', date: '2025-04-11', location: 'Ground Floor Lobby', club: 'NSS', upvotes: 65, category: 'Club' },
  { title: 'Career Guidance Seminar', date: '2025-04-14', location: 'Seminar Hall', club: 'Placement Cell', upvotes: 49, category: 'Academic' },
  { title: 'Culturals - Spandan 2025', date: '2025-04-18', location: 'College Ground', club: 'Student Council', upvotes: 200, category: 'Fests' },
];

const LOST_ITEMS_SEED = [
  { desc: 'Black OnePlus Nord 3 with cracked screen protector', category: 'Electronics', found: false },
  { desc: 'Blue Classmate notebook — has a sunflower sticker on cover', category: 'Stationary', found: false },
  { desc: 'ID Card — Arjun Menon, S5 CSE-A', category: 'ID Card', found: true },
  { desc: 'Navy blue hoodie left in the library reading room', category: 'Clothing', found: false },
  { desc: 'Apple earphones in white case, found near canteen', category: 'Electronics', found: true },
  { desc: 'Geometry box with name "Adithya" scratched on it', category: 'Stationary', found: false },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    /* ── Teachers ── */
    console.log(`\n📥 Seeding ${teachersRaw.length} teachers...`);
    let teachersDone = 0;
    for (const t of teachersRaw) {
      await Teacher.findOneAndUpdate(
        { legacyId: t.id },
        {
          legacyId: t.id,
          name: t.name,
          subject: t.subject,
          designation: t.designation || '',
          gender: t.gender || 'Unknown',
          imgUrl: t.imgUrl || '',
        },
        { upsert: true, new: true }
      );
      teachersDone++;
    }
    console.log(`✅ Teachers seeded: ${teachersDone}`);

    /* ── Confessions ── */
    const existingConf = await Confession.countDocuments();
    if (existingConf === 0) {
      await Confession.insertMany(CONFESSIONS_SEED);
      console.log(`✅ Confessions seeded: ${CONFESSIONS_SEED.length}`);
    } else {
      console.log(`⏭️  Confessions already exist (${existingConf}), skipping.`);
    }

    /* ── Resources ── */
    const existingRes = await Resource.countDocuments();
    if (existingRes === 0) {
      await Resource.insertMany(RESOURCES_SEED);
      console.log(`✅ Resources seeded: ${RESOURCES_SEED.length}`);
    } else {
      console.log(`⏭️  Resources already exist (${existingRes}), skipping.`);
    }

    /* ── Events ── */
    const existingEv = await Event.countDocuments();
    if (existingEv === 0) {
      await Event.insertMany(EVENTS_SEED);
      console.log(`✅ Events seeded: ${EVENTS_SEED.length}`);
    } else {
      console.log(`⏭️  Events already exist (${existingEv}), skipping.`);
    }

    /* ── Lost Items ── */
    const existingLost = await LostItem.countDocuments();
    if (existingLost === 0) {
      await LostItem.insertMany(LOST_ITEMS_SEED);
      console.log(`✅ Lost items seeded: ${LOST_ITEMS_SEED.length}`);
    } else {
      console.log(`⏭️  Lost items already exist (${existingLost}), skipping.`);
    }

    console.log('\n🎉 Seed complete!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
    process.exit(0);
  }
}

seed();
