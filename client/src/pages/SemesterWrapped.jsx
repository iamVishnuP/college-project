import React, { useState, useEffect } from 'react';
import { Sparkles, Share2, RefreshCw, CheckCircle } from 'lucide-react';

/* ─── Verdict logic ─── */
const getVerdict = (profs, reviews, resources) => {
  const score = profs * 1.5 + reviews * 2 + resources;
  if (score >= 50) return { title: 'Certified Survivor 🎖️', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' };
  if (score >= 25) return { title: 'Silent Observer 🫥', color: '#38BDF8', bg: 'rgba(56,189,248,0.12)' };
  return { title: 'Campus Ghost 👻', color: '#A855F7', bg: 'rgba(168,85,247,0.12)' };
};

const MOODS = ['😤 Stressed Out', '😴 Chronically Tired', '🔥 On Fire', '🥲 Barely Made It', '😎 Thriving', '🤯 Overwhelmed', '😶 Surviving', '🧠 Big Brain Mode'];

const FUNNY_STATS = [
  { profs: 8, reviews: 14, resources: 22, mood: '🥲 Barely Made It' },
  { profs: 6, reviews: 5, resources: 9, mood: '😴 Chronically Tired' },
  { profs: 10, reviews: 20, resources: 35, mood: '🔥 On Fire' },
  { profs: 4, reviews: 2, resources: 3, mood: '👻 Campus Ghost' },
  { profs: 7, reviews: 11, resources: 18, mood: '🧠 Big Brain Mode' },
];

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ─── Animated number ─── */
const AnimatedStat = ({ label, value, suffix = '' }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = Number(value);
    if (end === 0) return;
    const step = Math.ceil(end / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1, color: 'var(--text-main)' }}>
        {display}{suffix}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
    </div>
  );
};

/* ─── Stat card (shareable output) ─── */
const WrappedCard = ({ stats, verdict, visible }) => (
  <div
    id="wrapped-card"
    style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      border: '2px solid rgba(168,85,247,0.4)',
      borderRadius: '24px',
      padding: '40px 36px',
      maxWidth: '480px',
      margin: '0 auto',
      boxShadow: '0 0 60px rgba(168,85,247,0.2), 0 0 120px rgba(56,189,248,0.1)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.96)',
      transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Decorative blobs */}
    <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(168,85,247,0.15)', filter: 'blur(30px)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(56,189,248,0.12)', filter: 'blur(25px)', pointerEvents: 'none' }} />

    {/* Header */}
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <div style={{ fontSize: '28px', marginBottom: '6px' }}>🎓</div>
      <h2 style={{ fontSize: '22px', fontWeight: 800, background: 'linear-gradient(90deg, #A855F7, #38BDF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '4px' }}>
        Semester Wrapped 2025
      </h2>
      <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>campusRoast · Your Year in Review</div>
    </div>

    {/* Stats grid */}
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        padding: '24px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.07)',
        marginBottom: '24px',
      }}
    >
      <AnimatedStat label="Professors Survived" value={stats.profs} />
      <AnimatedStat label="Reviews Written" value={stats.reviews} />
      <AnimatedStat label="Resources Downloaded" value={stats.resources} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '28px', lineHeight: 1 }}>{stats.mood.split(' ')[0]}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Mood</div>
        <div style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '3px' }}>{stats.mood.split(' ').slice(1).join(' ')}</div>
      </div>
    </div>

    {/* Verdict */}
    <div
      style={{
        background: verdict.bg,
        border: `1px solid ${verdict.color}40`,
        borderRadius: '14px',
        padding: '18px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.5px' }}>
        YOUR VERDICT
      </div>
      <div style={{ fontSize: '22px', fontWeight: 800, color: verdict.color }}>
        {verdict.title}
      </div>
    </div>

    {/* Footer */}
    <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
      campusroast.app · {new Date().getFullYear()}
    </div>
  </div>
);

/* ─── Main page ─── */
const SemesterWrapped = () => {
  const [step, setStep] = useState('input'); // 'input' | 'result'
  const [cardVisible, setCardVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ profs: 7, reviews: 10, resources: 18, mood: MOODS[0] });

  const verdict = getVerdict(stats.profs, stats.reviews, stats.resources);

  const handleGenerate = () => {
    setStep('result');
    setTimeout(() => setCardVisible(true), 80);
  };

  const handleAutoGenerate = () => {
    const s = random(FUNNY_STATS);
    setStats(s);
    setStep('result');
    setTimeout(() => setCardVisible(true), 80);
  };

  const handleReset = () => {
    setCardVisible(false);
    setTimeout(() => { setStep('input'); setStats({ profs: 7, reviews: 10, resources: 18, mood: MOODS[0] }); }, 350);
  };

  const handleShare = () => {
    const text = `🎓 Semester Wrapped 2025\n\n👨‍🏫 ${stats.profs} Professors Survived\n✍️ ${stats.reviews} Reviews Written\n📥 ${stats.resources} Resources Downloaded\n😭 Mood: ${stats.mood}\n\n🏆 Verdict: ${verdict.title}\n\ncampusRoast.app`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div
      className="animate-fade-in"
      style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '60px' }}
    >
      {/* Page header */}
      <div style={{ textAlign: 'center', marginBottom: '44px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(56,189,248,0.15))',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: '99px',
            padding: '6px 18px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#A855F7',
            marginBottom: '16px',
          }}
        >
          <Sparkles size={13} /> Exclusive Feature
        </div>
        <h1
          style={{
            fontSize: '40px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #A855F7 0%, #38BDF8 60%, #22C55E 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px',
            lineHeight: 1.15,
          }}
        >
          Semester Wrapped 🎓
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Your campus year, summarized in one card. Share it. Flex it. Cry about it.
        </p>
      </div>

      {/* ── INPUT STEP ── */}
      {step === 'input' && (
        <div
          className="animate-slide-down"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '36px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <h3 style={{ fontSize: '16px', marginBottom: '24px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Enter Your Stats
          </h3>

          {/* Professors */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600 }}>👨‍🏫 Professors Survived</label>
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>{stats.profs}</span>
            </div>
            <input
              type="range" min={1} max={20} value={stats.profs}
              onChange={(e) => setStats(s => ({ ...s, profs: Number(e.target.value) }))}
            />
          </div>

          {/* Reviews */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600 }}>✍️ Reviews Written</label>
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>{stats.reviews}</span>
            </div>
            <input
              type="range" min={0} max={40} value={stats.reviews}
              onChange={(e) => setStats(s => ({ ...s, reviews: Number(e.target.value) }))}
            />
          </div>

          {/* Resources */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600 }}>📥 Resources Downloaded</label>
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>{stats.resources}</span>
            </div>
            <input
              type="range" min={0} max={60} value={stats.resources}
              onChange={(e) => setStats(s => ({ ...s, resources: Number(e.target.value) }))}
            />
          </div>

          {/* Mood */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              😭 Top Mood Tag
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setStats(s => ({ ...s, mood: m }))}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '99px',
                    border: stats.mood === m ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.12)',
                    background: stats.mood === m ? 'rgba(56,189,248,0.15)' : 'transparent',
                    color: stats.mood === m ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-main)',
                    transition: 'all 0.2s',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Verdict preview */}
          <div
            style={{
              background: verdict.bg,
              border: `1px solid ${verdict.color}40`,
              borderRadius: '12px',
              padding: '12px 18px',
              marginBottom: '24px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 700,
              color: verdict.color,
            }}
          >
            Predicted Verdict → {verdict.title}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleGenerate}>
              <Sparkles size={15} /> Generate My Wrapped
            </button>
            <button
              className="btn btn-secondary"
              style={{ gap: '6px' }}
              onClick={handleAutoGenerate}
              title="Auto-generate with random funny stats"
            >
              <RefreshCw size={14} /> Random
            </button>
          </div>
        </div>
      )}

      {/* ── RESULT STEP ── */}
      {step === 'result' && (
        <div className="animate-fade-in">
          <WrappedCard stats={stats} verdict={verdict} visible={cardVisible} />

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '28px' }}>
            <button
              className="btn btn-primary"
              style={{ gap: '8px', padding: '12px 28px' }}
              onClick={handleShare}
            >
              {copied ? <CheckCircle size={15} /> : <Share2 size={15} />}
              {copied ? 'Copied to clipboard!' : 'Share'}
            </button>
            <button className="btn btn-secondary" style={{ gap: '6px' }} onClick={handleReset}>
              <RefreshCw size={14} /> Redo
            </button>
          </div>

          {copied && (
            <div
              className="animate-slide-down"
              style={{
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: '10px',
                padding: '10px 18px',
                textAlign: 'center',
                color: '#22C55E',
                fontWeight: 600,
                fontSize: '13px',
                marginTop: '16px',
              }}
            >
              ✅ Stats copied! Paste anywhere to flex on your friends.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SemesterWrapped;
