import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User as UserIcon, AlertCircle, Loader } from 'lucide-react';

const AuthModal = () => {
  const { login, register, setIsAuthModalOpen } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!characterName.trim()) { setError('Character name is required.'); setLoading(false); return; }
        await register(email, password, characterName.trim());
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsAuthModalOpen(false)}>
      <div className="modal-content animate-slide-down" style={{ maxWidth: '420px' }}>
        <button onClick={() => setIsAuthModalOpen(false)} className="btn-icon" style={{ position: 'absolute', top: '16px', right: '16px' }}>
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>{mode === 'login' ? '💀' : '🔥'}</div>
          <h2 style={{ fontSize: '22px', marginBottom: '6px' }}>
            {mode === 'login' ? 'Welcome Back' : 'Join the Roast'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {mode === 'login' ? 'Log in with your alias.' : 'Create your anonymous identity.'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '10px', color: '#EF4444', fontSize: '14px',
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: '40px' }} />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="password" placeholder="••••••••" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft: '40px' }} />
            </div>
          </div>

          {/* Character name (sign up only) */}
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Character Name (public alias)
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="e.g. CaffeinatedCoder" required value={characterName} onChange={e => setCharacterName(e.target.value)} style={{ paddingLeft: '40px' }} />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>This is your anonymous identity. Choose wisely.</p>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '8px', height: '46px', fontSize: '15px' }} disabled={loading}>
            {loading ? <Loader size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
          {mode === 'login' ? (
            <span>New here? <button onClick={() => { setMode('signup'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-main)' }}>Create an alias</button></span>
          ) : (
            <span>Already have one? <button onClick={() => { setMode('login'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-main)' }}>Log in</button></span>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AuthModal;
