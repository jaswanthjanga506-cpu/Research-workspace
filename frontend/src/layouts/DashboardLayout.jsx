import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/authStore';
import api from '../services/api';
import Logo from '../components/Logo';
import {
  LayoutDashboard,
  FolderGit2,
  ShieldAlert,
  LogOut,
  Bell,
  Search,
  Plus,
  User,
  X,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from 'lucide-react';

/* ── Create Workspace Modal ───────────────────────────────────────────────── */
function CreateWorkspaceModal({ onClose, onCreated }) {
  const [name, setName]     = useState('');
  const [desc, setDesc]     = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleCreate = async () => {
    if (!name.trim()) { setError('Workspace name is required'); return; }
    setSaving(true); setError('');
    try {
      const res = await api.post('/workspaces/', { name: name.trim(), description: desc.trim() });
      onCreated(res.data.data);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create workspace');
    } finally { setSaving(false); }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleCreate();
    if (e.key === 'Escape') onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-2xl relative overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKey}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px]"
             style={{ background: 'linear-gradient(90deg, var(--primary), var(--gold))' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
             style={{ borderBottom: '1px solid var(--bg-border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: 'rgba(194, 105, 42, 0.12)' }}>
              <FolderGit2 size={16} style={{ color: 'var(--primary)' }} />
            </div>
            <h2 className="font-semibold text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
              New Workspace
            </h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg" style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm"
                 style={{ background: 'rgba(192,57,43,0.09)', border: '1px solid rgba(192,57,43,0.25)', color: 'var(--danger)' }}>
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                   style={{ color: 'var(--text-muted)' }}>
              Name <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input autoFocus className="input w-full"
                   placeholder="e.g. Climate Research Q3"
                   value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                   style={{ color: 'var(--text-muted)' }}>
              Description{' '}
              <span className="normal-case font-normal tracking-normal" style={{ color: 'var(--text-faint)' }}>
                (optional)
              </span>
            </label>
            <textarea className="input w-full resize-none" rows={3}
                      placeholder="What is this workspace for?"
                      value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
            Tip: Press ⌘ Enter to create
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={handleCreate} disabled={saving || !name.trim()} className="btn-primary flex-1">
            {saving
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Plus size={15} /> Create Workspace</>
            }
          </button>
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main Layout ──────────────────────────────────────────────────────────── */
const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const [sidebarOpen, setSidebarOpen]             = useState(true);
  const [workspaces, setWorkspaces]               = useState([]);
  const [unreadNotifs, setUnreadNotifs]           = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications]         = useState([]);
  const [showCreateWs, setShowCreateWs]           = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('collab_work_theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark'); root.classList.remove('light');
    } else {
      root.classList.add('light'); root.classList.remove('dark');
    }
    localStorage.setItem('collab_work_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get('/workspaces/');
      setWorkspaces(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/dashboard/notifications?unread=true');
      setNotifications(res.data.data || []);
      setUnreadNotifs((res.data.data || []).length);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchWorkspaces();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45_000);
    const handleRefreshWs    = () => fetchWorkspaces();
    const handleOpenCreateWs = () => setShowCreateWs(true);
    window.addEventListener('refresh_workspaces', handleRefreshWs);
    window.addEventListener('open_create_ws_modal', handleOpenCreateWs);
    return () => {
      clearInterval(interval);
      window.removeEventListener('refresh_workspaces', handleRefreshWs);
      window.removeEventListener('open_create_ws_modal', handleOpenCreateWs);
    };
  }, [user, navigate]);

  useEffect(() => {
    if (!showNotifDropdown) return;
    const close = () => setShowNotifDropdown(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showNotifDropdown]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const markAllRead = async () => {
    try {
      await api.put('/dashboard/notifications/read-all');
      setUnreadNotifs(0); setNotifications([]); setShowNotifDropdown(false);
    } catch (err) { console.error(err); }
  };

  const handleWorkspaceCreated = (newWs) => {
    setWorkspaces((prev) => [newWs, ...prev]);
    window.dispatchEvent(new CustomEvent('refresh_workspaces'));
    navigate(`/workspaces/${newWs.id}`);
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path;
  const isWorkspaceActive = (id) => location.pathname.startsWith(`/workspaces/${id}`);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: sidebarOpen ? 256 : 72 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col shrink-0 z-20 overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--bg-border)',
        }}
      >
        {/* Logo row */}
        <div className="h-[62px] flex items-center justify-between px-4 shrink-0"
             style={{ borderBottom: '1px solid var(--bg-border)' }}>
          <Link to="/dashboard" className="flex items-center gap-2.5 select-none min-w-0">
            <Logo size={30} className="shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}
                  className="text-gradient font-bold text-lg tracking-tight truncate"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Collab Work
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="shrink-0 p-1.5 rounded-lg transition-colors duration-150"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='var(--text-muted)'; }}
          >
            {sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-hide">

          {/* Main */}
          <div className="space-y-0.5">
            <Link to="/dashboard"
              className={`sidebar-item ${isActive('/dashboard') ? 'active' : ''}`}>
              <LayoutDashboard size={19} className="shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                               transition={{ duration: 0.15 }}>
                    Dashboard
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>

          {/* Workspaces */}
          <div>
            {sidebarOpen && (
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
                  Workspaces
                </span>
                <button onClick={() => setShowCreateWs(true)}
                  className="p-1 rounded-md transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.color='var(--primary)'; e.currentTarget.style.background='rgba(194,105,42,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.background=''; }}
                  title="New Workspace">
                  <Plus size={14} />
                </button>
              </div>
            )}

            <div className="space-y-0.5">
              {workspaces.map((ws) => (
                <Link key={ws.id} to={`/workspaces/${ws.id}`} title={ws.name}
                  className={`sidebar-item ${isWorkspaceActive(ws.id) ? 'active' : ''}`}>
                  <div className="shrink-0 w-[19px] h-[19px] rounded-md flex items-center justify-center text-[10px] font-bold"
                       style={{
                         background: isWorkspaceActive(ws.id) ? 'rgba(194,105,42,0.2)' : 'var(--bg-hover)',
                         color: isWorkspaceActive(ws.id) ? 'var(--primary)' : 'var(--text-muted)',
                       }}>
                    {ws.name.slice(0,1).toUpperCase()}
                  </div>
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                   transition={{ duration: 0.15 }}
                                   className="truncate text-sm">
                        {ws.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              ))}
              {workspaces.length === 0 && sidebarOpen && (
                <button onClick={() => setShowCreateWs(true)}
                  className="w-full text-left text-xs px-3 py-2 italic rounded-lg transition-colors"
                  style={{ color: 'var(--text-faint)' }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--text-muted)'}
                  onMouseLeave={e => e.currentTarget.style.color='var(--text-faint)'}>
                  + Create a workspace
                </button>
              )}
            </div>
          </div>

          {/* Account */}
          <div>
            {sidebarOpen && (
              <span className="block px-3 mb-2 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: 'var(--text-faint)' }}>Account</span>
            )}
            <div className="space-y-0.5">
              <Link to="/profile" className={`sidebar-item ${isActive('/profile') ? 'active' : ''}`}>
                <User size={18} className="shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                 transition={{ duration: 0.15 }} className="text-sm">
                      My Profile
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin"
                  className="sidebar-item"
                  style={isActive('/admin') ? { color: 'var(--danger)', background: 'rgba(192,57,43,0.08)', fontWeight: 600 } : {}}>
                  <ShieldAlert size={18} className="shrink-0" style={{ color: 'var(--danger)' }} />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                   transition={{ duration: 0.15 }} className="text-sm">
                        Admin Panel
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* User footer */}
        <div className="p-3 shrink-0" style={{ borderTop: '1px solid var(--bg-border)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs uppercase overflow-hidden text-white"
                 style={{ background: 'linear-gradient(135deg, var(--primary), var(--gold))' }}>
              {user.avatar_url
                ? <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                : user.username.slice(0, 2)
              }
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }} className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {user.username}
                  </div>
                  <div className="text-xs capitalize truncate" style={{ color: 'var(--text-faint)' }}>
                    {user.role}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg transition-colors shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.color='var(--danger)'; e.currentTarget.style.background='rgba(192,57,43,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.background=''; }}
                  title="Sign out">
                  <LogOut size={15} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          {!sidebarOpen && (
            <button onClick={handleLogout}
              className="mt-2.5 w-full flex justify-center py-2 rounded-xl transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.color='var(--danger)'; e.currentTarget.style.background='rgba(192,57,43,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.background=''; }}
              title="Sign out">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </motion.aside>

      {/* ── MAIN ─────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header className="h-[62px] flex items-center justify-between px-6 shrink-0"
                style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--bg-border)' }}>
          <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color: 'var(--gold)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Research Portal
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open_search_modal'))}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-all duration-150"
              style={{
                background: 'var(--bg-hover)',
                border: '1px solid var(--bg-border)',
                color: 'var(--text-muted)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(194,105,42,0.3)'; e.currentTarget.style.color='var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--bg-border)'; e.currentTarget.style.color='var(--text-muted)'; }}
            >
              <Search size={13} />
              <span className="hidden sm:inline">Search…</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono"
                   style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', color: 'var(--text-faint)' }}>
                ⌘K
              </kbd>
            </button>

            {/* New workspace */}
            <button onClick={() => setShowCreateWs(true)} className="btn-primary gap-1.5 hidden sm:flex"
                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem', borderRadius: '10px' }}>
              <Plus size={13} /> New Workspace
            </button>

            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden transition-all"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='var(--text-muted)'; }}
              title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.span key="moon" initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
                               animate={{ rotate: 0, opacity: 1, scale: 1 }}
                               exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
                               transition={{ duration: 0.22 }}>
                    <Moon size={17} style={{ color: 'var(--primary-light)' }} />
                  </motion.span>
                ) : (
                  <motion.span key="sun" initial={{ rotate: 30, opacity: 0, scale: 0.7 }}
                               animate={{ rotate: 0, opacity: 1, scale: 1 }}
                               exit={{ rotate: -30, opacity: 0, scale: 0.7 }}
                               transition={{ duration: 0.22 }}>
                    <Sun size={17} style={{ color: 'var(--gold)' }} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowNotifDropdown((v) => !v); }}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='var(--text-muted)'; }}
              >
                <Bell size={18} />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse-glow"
                        style={{ background: 'var(--danger)' }} />
                )}
              </button>

              <AnimatePresence>
                {showNotifDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 mt-2 w-80 rounded-2xl z-30 overflow-hidden"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--bg-border)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08)',
                      transformOrigin: 'top right',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between px-4 py-3.5"
                         style={{ borderBottom: '1px solid var(--bg-border)' }}>
                      <span className="font-semibold text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Notifications
                        {unreadNotifs > 0 && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                                style={{ background: 'rgba(194,105,42,0.15)', color: 'var(--primary)' }}>
                            {unreadNotifs}
                          </span>
                        )}
                      </span>
                      {unreadNotifs > 0 && (
                        <button onClick={markAllRead} className="text-xs font-medium transition-colors"
                                style={{ color: 'var(--primary)' }}
                                onMouseEnter={e => e.currentTarget.style.textDecoration='underline'}
                                onMouseLeave={e => e.currentTarget.style.textDecoration='none'}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className="px-4 py-3.5 text-xs transition-colors"
                             style={{ borderBottom: '1px solid var(--bg-border)' }}
                             onMouseEnter={e => e.currentTarget.style.background='var(--bg-hover)'}
                             onMouseLeave={e => e.currentTarget.style.background=''}>
                          <p className="leading-relaxed mb-1" style={{ color: 'var(--text-primary)' }}>{n.message}</p>
                          <span style={{ color: 'var(--text-faint)' }}>Just now</span>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>
                          No unread notifications
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8" style={{ background: 'var(--bg)' }}>
          <Outlet />
        </main>
      </div>

      {/* Create Workspace Modal */}
      <AnimatePresence>
        {showCreateWs && (
          <CreateWorkspaceModal
            onClose={() => setShowCreateWs(false)}
            onCreated={handleWorkspaceCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;