import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden"
         style={{ background: 'var(--bg)' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.05]"
             style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10"
      >
        <div className="text-[120px] font-black leading-none mb-4 select-none"
             style={{
               fontFamily: "'Playfair Display', serif",
               background: 'linear-gradient(135deg, var(--bg-border) 0%, var(--bg-hover) 100%)',
               WebkitBackgroundClip: 'text',
               WebkitTextFillColor: 'transparent',
               backgroundClip: 'text',
             }}>
          404
        </div>

        <h1 className="text-2xl font-semibold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Page not found
        </h1>
        <p className="text-sm mb-8 max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex items-center gap-3 justify-center">
          <Link to="/dashboard" className="btn-primary gap-2">
            <Home size={15} /> Go to Dashboard
          </Link>
          <button onClick={() => window.history.back()} className="btn-outline gap-2">
            <ArrowLeft size={15} /> Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}