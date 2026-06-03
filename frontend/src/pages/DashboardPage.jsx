import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../store/authStore';
import api from '../services/api';
import { FolderGit2, FileText, Database, Plus, ArrowRight, TrendingUp } from 'lucide-react';

const listVariants = {
  animate: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  initial: { opacity: 0, y: 14, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

function StatCard({ icon, label, value, color, gradient, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl p-5 group"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--bg-border)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(194,105,42,0.25)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.09)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--bg-border)';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Gradient corner glow */}
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20 transition-opacity duration-300 group-hover:opacity-35"
           style={{ background: gradient }} />

      <div className="relative flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
             style={{ background: color }}>
          {icon}
        </div>
        <TrendingUp size={14} style={{ color: 'var(--text-faint)' }} className="mt-1" />
      </div>

      <div className="relative">
        <div className="text-3xl font-bold mb-0.5" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
          {value ?? '—'}
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [stats, setStats]           = useState({ notes: 0, docs: 0, datasets: 0 });
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const wsRes  = await api.get('/workspaces/');
        const wsList = wsRes.data.data || [];
        setWorkspaces(wsList);

        let notes = 0, docs = 0, datasets = 0;
        await Promise.all(wsList.map(async (ws) => {
          const [nr, dr, dsr] = await Promise.all([
            api.get(`/notes/workspace/${ws.id}`).catch(() => ({ data: { data: [] } })),
            api.get(`/documents/workspace/${ws.id}`).catch(() => ({ data: { data: [] } })),
            api.get(`/datasets/workspace/${ws.id}`).catch(() => ({ data: { data: [] } })),
          ]);
          notes    += (nr.data.data  || []).length;
          docs     += (dr.data.data  || []).length;
          datasets += (dsr.data.data || []).length;
        }));
        setStats({ notes, docs, datasets });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
    const handler = () => load();
    window.addEventListener('refresh_workspaces', handler);
    return () => window.removeEventListener('refresh_workspaces', handler);
  }, []);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-1.5"
                style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
              {greeting}, <span className="text-gradient">{user?.username}</span> 👋
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Here's what's happening in your research workspace.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium"
               style={{ background: 'rgba(194,105,42,0.1)', color: 'var(--primary)', border: '1px solid rgba(194,105,42,0.2)' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--primary)' }} />
            Live
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard delay={0}    gradient="var(--primary)"   color="rgba(194,105,42,0.12)"
                  icon={<FolderGit2 size={22} style={{ color: 'var(--primary)' }} />}
                  label="Workspaces" value={workspaces.length} />
        <StatCard delay={0.07} gradient="var(--accent)"    color="rgba(58,173,169,0.12)"
                  icon={<FileText   size={22} style={{ color: 'var(--accent)' }} />}
                  label="Notes"      value={stats.notes} />
        <StatCard delay={0.14} gradient="var(--secondary)" color="rgba(200,180,154,0.15)"
                  icon={<FileText   size={22} style={{ color: 'var(--secondary)' }} />}
                  label="Documents"  value={stats.docs} />
        <StatCard delay={0.21} gradient="var(--gold)"      color="rgba(201,162,39,0.12)"
                  icon={<Database   size={22} style={{ color: 'var(--gold)' }} />}
                  label="Datasets"   value={stats.datasets} />
      </div>

      {/* Two-column section */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Recent Workspaces */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-4"
               style={{ borderBottom: '1px solid var(--bg-border)' }}>
            <h3 className="font-semibold text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
              Recent Workspaces
            </h3>
            <button onClick={() => window.dispatchEvent(new CustomEvent('open_create_ws_modal'))}
                    className="btn-ghost text-xs gap-1.5 py-1.5 px-2.5">
              <Plus size={13} /> New
            </button>
          </div>

          <div className="p-3">
            {loading ? (
              <div className="space-y-2.5 p-2">
                {[1,2,3].map((i) => (
                  <div key={i} className="skeleton h-12 w-full" />
                ))}
              </div>
            ) : workspaces.length === 0 ? (
              <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                <FolderGit2 size={34} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No workspaces yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Create one to get started</p>
              </div>
            ) : (
              <motion.div variants={listVariants} animate="animate" className="space-y-0.5">
                {workspaces.slice(0, 6).map((ws) => (
                  <motion.div key={ws.id} variants={itemVariants}>
                    <Link to={`/workspaces/${ws.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
                      onMouseEnter={e => e.currentTarget.style.background='var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background=''}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                           style={{ background: 'linear-gradient(135deg, rgba(194,105,42,0.15), rgba(201,162,39,0.1))', color: 'var(--primary)' }}>
                        {ws.name.slice(0,1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                          {ws.name}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-faint)' }}>
                          {ws.member_count} member{ws.member_count !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--text-faint)' }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 transition-transform duration-150" />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.34, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--bg-border)' }}>
            <h3 className="font-semibold text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
              Quick Actions
            </h3>
          </div>

          <div className="p-4 space-y-3">
            {[
              {
                label: 'New Workspace',
                desc:  'Start a new research project',
                icon:  <FolderGit2 size={19} />,
                color: 'var(--primary)',
                bg:    'rgba(194,105,42,0.1)',
                action: () => window.dispatchEvent(new CustomEvent('open_create_ws_modal')),
              },
            ].map((item, i) => (
              <button key={i} onClick={item.action}
                className="w-full flex items-center gap-4 p-4 rounded-xl text-left group transition-all duration-200"
                style={{ border: '1.5px solid var(--bg-border)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(194,105,42,0.3)';
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--bg-border)';
                  e.currentTarget.style.background = '';
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                     style={{ background: item.bg, color: item.color }}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {item.label}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
                <ArrowRight size={15} style={{ color: 'var(--text-faint)' }}
                            className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150" />
              </button>
            ))}

            {/* Tips card */}
            <div className="mt-2 rounded-xl p-4 relative overflow-hidden"
                 style={{ background: 'linear-gradient(135deg, rgba(194,105,42,0.08) 0%, rgba(201,162,39,0.06) 100%)', border: '1px solid rgba(194,105,42,0.15)' }}>
              <div className="flex gap-3">
                <span className="text-lg shrink-0">💡</span>
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--primary)' }}>Pro tip</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Organize your research by creating separate workspaces for each project. Invite collaborators to share notes and documents.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}