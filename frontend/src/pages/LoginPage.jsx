import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../store/authStore';
import { LogIn, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

/* Decorative background blobs */
function AuthBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.07] dark:opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.06] dark:opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)' }}
      />
      {/* Subtle grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025] dark:opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

const containerVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function LoginPage() {
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
         style={{ background: 'var(--bg)' }}>
      <AuthBackground />

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* Brand lockup */}
        <motion.div variants={itemVariants} className="text-center mb-10 flex flex-col items-center select-none">
          <div className="mb-4 animate-float">
            <Logo size={52} />
          </div>
          <h1 className="text-gradient font-bold text-4xl tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Collab Work
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Collaborative Workspace Platform
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-8 relative overflow-hidden"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-border)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          {/* Top accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
            style={{ background: 'linear-gradient(90deg, var(--primary), var(--gold), var(--accent))' }}
          />

          <h2
            className="text-2xl font-semibold mb-1"
            style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
          >
            Welcome back
          </h2>
          <p className="text-sm mb-7" style={{ color: 'var(--text-muted)' }}>
            Sign in to continue to your workspace
          </p>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="rounded-xl px-4 py-3 mb-5 text-sm flex items-start gap-2"
              style={{
                background: 'rgba(192, 57, 43, 0.09)',
                border: '1px solid rgba(192, 57, 43, 0.25)',
                color: 'var(--danger)',
              }}
            >
              <span className="mt-0.5">⚠</span>
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                     style={{ color: 'var(--text-muted)' }}>
                Email address
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@research.com"
                className="input"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                     style={{ color: 'var(--text-muted)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150"
                  style={{ color: 'var(--text-faint)' }}
                  tabIndex={-1}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
              style={{ padding: '0.75rem 1.25rem', borderRadius: '14px', fontSize: '0.9rem' }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In</span>
                  <ArrowRight size={15} className="ml-auto opacity-60" />
                </>
              )}
            </button>
          </form>

          <div className="divider my-6" />

          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold transition-colors duration-150 hover:underline underline-offset-2"
              style={{ color: 'var(--primary)' }}
            >
              Create one →
            </Link>
          </p>
        </motion.div>

        {/* Footer hint */}
        <motion.p
          variants={itemVariants}
          className="text-center text-[11px] mt-6"
          style={{ color: 'var(--text-faint)' }}
        >
          Collab Work Platform · Secure · Private
        </motion.p>
      </motion.div>
    </div>
  );
}