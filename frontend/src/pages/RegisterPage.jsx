import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../store/authStore';
import { UserPlus, Shield, Users, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';

const ROLES = [
  {
    value: 'admin',
    label: 'Admin',
    icon: Shield,
    desc: 'Full platform control',
    accentVar: '--warning',
  },
  {
    value: 'user',
    label: 'Member',
    icon: Users,
    desc: 'Create & collaborate',
    accentVar: '--primary',
  },
];

const containerVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.065 } },
};
const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

/* Reuse the same decorative bg */
function AuthBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full opacity-[0.07]"
           style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-60 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.06]"
           style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }} />
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({ username: '', email: '', password: '', role: 'user' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.role);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden"
         style={{ background: 'var(--bg)' }}>
      <AuthBackground />

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* Brand */}
        <motion.div variants={itemVariants} className="text-center mb-9 flex flex-col items-center select-none">
          <div className="mb-4 animate-float">
            <Logo size={50} />
          </div>
          <h1 className="text-gradient font-bold text-4xl tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}>
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
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
               style={{ background: 'linear-gradient(90deg, var(--accent), var(--gold), var(--primary))' }} />

          <h2 className="text-2xl font-semibold mb-1"
              style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
            Create your account
          </h2>
          <p className="text-sm mb-7" style={{ color: 'var(--text-muted)' }}>
            Join thousands of researchers and collaborators
          </p>

          {/* Alerts */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl px-4 py-3 mb-5 text-sm flex items-start gap-2"
              style={{ background: 'rgba(192, 57, 43, 0.09)', border: '1px solid rgba(192, 57, 43, 0.25)', color: 'var(--danger)' }}>
              <span className="mt-0.5">⚠</span><span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl px-4 py-3 mb-5 text-sm flex items-center gap-2"
              style={{ background: 'rgba(46, 125, 82, 0.09)', border: '1px solid rgba(46, 125, 82, 0.25)', color: 'var(--success)' }}>
              <CheckCircle2 size={16} className="shrink-0" />
              Account created! Redirecting to login…
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                     style={{ color: 'var(--text-muted)' }}>Username</label>
              <input type="text" name="username" required
                     value={form.username} onChange={handleChange}
                     placeholder="researcher42" className="input" />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                     style={{ color: 'var(--text-muted)' }}>Email address</label>
              <input type="email" name="email" required
                     value={form.email} onChange={handleChange}
                     placeholder="you@research.com" className="input" />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                     style={{ color: 'var(--text-muted)' }}>Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} name="password" required
                       value={form.password} onChange={handleChange}
                       placeholder="min. 6 characters" className="input pr-11" />
                <button type="button" onClick={() => setShowPw((v) => !v)} tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-faint)' }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color='var(--text-faint)'}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-3"
                     style={{ color: 'var(--text-muted)' }}>Account Role</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(({ value, label, icon: Icon, desc, accentVar }) => {
                  const isActive = form.role === value;
                  return (
                    <button
                      key={value} type="button"
                      onClick={() => setForm((f) => ({ ...f, role: value }))}
                      className="relative flex flex-col items-start gap-1.5 rounded-xl px-4 py-3.5 text-left transition-all duration-200"
                      style={{
                        border: isActive ? `1.5px solid color-mix(in srgb, var(${accentVar}) 50%, transparent)` : '1.5px solid var(--bg-border)',
                        background: isActive ? `color-mix(in srgb, var(${accentVar}) 10%, transparent)` : 'var(--bg-subtle)',
                        boxShadow: isActive ? `0 2px 12px color-mix(in srgb, var(${accentVar}) 15%, transparent)` : 'none',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={15} style={{ color: isActive ? `var(${accentVar})` : 'var(--text-muted)' }} />
                        <span className="text-sm font-semibold"
                              style={{ color: isActive ? `var(${accentVar})` : 'var(--text-primary)' }}>
                          {label}
                        </span>
                      </div>
                      <span className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>{desc}</span>
                      {isActive && (
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full"
                              style={{ background: `var(${accentVar})` }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={loading || success} className="btn-primary w-full"
                    style={{ padding: '0.75rem 1.25rem', borderRadius: '14px', fontSize: '0.9rem' }}>
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><UserPlus size={16} /><span>Create Account</span></>
              }
            </button>
          </form>

          <div className="divider my-6" />

          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline underline-offset-2"
                  style={{ color: 'var(--primary)' }}>
              Sign in →
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}