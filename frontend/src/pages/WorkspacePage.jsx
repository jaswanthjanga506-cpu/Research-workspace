import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../store/authStore';
import {
  FileText, Database, Users, Plus, Trash2, Edit2, X,
  FolderGit2, ChevronRight, ExternalLink,
} from 'lucide-react';

const timeAgo = (ts) => {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

/* ── Modal ─────────────────────────────────────────────────────────────────── */
function Modal({ title, icon, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-2xl relative overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-[3px]"
             style={{ background: 'linear-gradient(90deg, var(--primary), var(--gold))' }} />
        <div className="flex items-center justify-between px-5 py-4"
             style={{ borderBottom: '1px solid var(--bg-border)' }}>
          <div className="flex items-center gap-2.5">
            {icon && (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                   style={{ background: 'rgba(194,105,42,0.1)' }}>
                {icon}
              </div>
            )}
            <h3 className="font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h3>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5" style={{ width: 30, height: 30 }}>
            <X size={15} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </motion.div>
  );
}

/* ── Empty State ───────────────────────────────────────────────────────────── */
function Empty({ icon, label, subtitle, action, actionLabel }) {
  return (
    <div className="text-center py-16 flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
           style={{ background: 'var(--bg-hover)', color: 'var(--text-faint)' }}>
        {icon}
      </div>
      <p className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {subtitle && <p className="text-xs mb-5" style={{ color: 'var(--text-faint)' }}>{subtitle}</p>}
      <button onClick={action} className="btn-primary gap-2 text-sm">
        <Plus size={14} /> {actionLabel}
      </button>
    </div>
  );
}

/* ── WorkspacePage ─────────────────────────────────────────────────────────── */
export default function WorkspacePage() {
  const { workspaceId } = useParams();
  const navigate        = useNavigate();
  const { user }        = useAuth();

  const [ws, setWs]           = useState(null);
  const [tab, setTab]         = useState('notes');
  const [notes, setNotes]     = useState([]);
  const [docs, setDocs]       = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);

  const [newTitle, setNewTitle] = useState('');
  const [newName, setNewName]   = useState('');
  const [newDesc, setNewDesc]   = useState('');
  const [newUrl, setNewUrl]     = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole]   = useState('member');
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [wsRes, nRes, dRes, dsRes, mRes] = await Promise.all([
        api.get(`/workspaces/${workspaceId}`),
        api.get(`/notes/workspace/${workspaceId}`),
        api.get(`/documents/workspace/${workspaceId}`),
        api.get(`/datasets/workspace/${workspaceId}`),
        api.get(`/workspaces/${workspaceId}/members`),
      ]);
      setWs(wsRes.data.data);
      setNotes(nRes.data.data || []);
      setDocs(dRes.data.data || []);
      setDatasets(dsRes.data.data || []);
      setMembers(mRes.data.data || []);
    } catch { navigate('/dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [workspaceId]);

  const closeModal = () => {
    setModal(null); setNewTitle(''); setNewName(''); setNewDesc('');
    setNewUrl(''); setNewEmail(''); setErr('');
  };

  const createNote = async () => {
    if (!newTitle.trim()) { setErr('Title required'); return; }
    setSaving(true);
    try {
      const res = await api.post('/notes/', { title: newTitle, content: '', workspace_id: parseInt(workspaceId) });
      closeModal();
      navigate(`/workspaces/${workspaceId}/notes/${res.data.data.id}`);
    } catch (e) { setErr(e.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const createDoc = async () => {
    if (!newTitle.trim()) { setErr('Title required'); return; }
    setSaving(true);
    try {
      const res = await api.post('/documents/', { title: newTitle, content: '', workspace_id: parseInt(workspaceId) });
      closeModal();
      navigate(`/workspaces/${workspaceId}/documents/${res.data.data.id}`);
    } catch (e) { setErr(e.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const createDataset = async () => {
    if (!newName.trim()) { setErr('Name required'); return; }
    setSaving(true);
    try {
      await api.post('/datasets/', { name: newName, description: newDesc, source_url: newUrl, workspace_id: parseInt(workspaceId) });
      closeModal(); load();
    } catch (e) { setErr(e.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const addMember = async () => {
    if (!newEmail.trim()) { setErr('Email required'); return; }
    setSaving(true);
    try {
      await api.post(`/workspaces/${workspaceId}/members`, { email: newEmail, ws_role: newRole });
      closeModal(); load();
    } catch (e) { setErr(e.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const deleteNote    = async (id) => { await api.delete(`/notes/${id}`); load(); };
  const deleteDoc     = async (id) => { await api.delete(`/documents/${id}`); load(); };
  const deleteDataset = async (id) => { await api.delete(`/datasets/${id}`); load(); };
  const removeMember  = async (id) => {
    await api.delete(`/workspaces/${workspaceId}/members/${id}`); load();
  };

  const tabs = [
    { id: 'notes',    label: 'Notes',    count: notes.length,   icon: <FileText size={14} /> },
    { id: 'docs',     label: 'Documents',count: docs.length,    icon: <FileText size={14} /> },
    { id: 'datasets', label: 'Datasets', count: datasets.length,icon: <Database size={14} /> },
    { id: 'members',  label: 'Members',  count: members.length, icon: <Users size={14} /> },
  ];

  const addLabel = tab === 'notes' ? 'New Note' : tab === 'docs' ? 'New Document'
                  : tab === 'datasets' ? 'Add Dataset' : 'Add Member';
  const addAction = () => setModal(tab === 'notes' ? 'note' : tab === 'docs' ? 'doc'
                              : tab === 'datasets' ? 'dataset' : 'member');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 text-xs font-medium"
                  style={{ color: 'var(--text-faint)' }}>
        <Link to="/dashboard" className="hover:underline transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color='var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
          Dashboard
        </Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-primary)' }}>{ws?.name || '…'}</span>
      </motion.div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0"
               style={{ background: 'linear-gradient(135deg, rgba(194,105,42,0.18), rgba(201,162,39,0.12))', color: 'var(--primary)' }}>
            {ws?.name?.slice(0,1)?.toUpperCase() || <FolderGit2 size={22} />}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              {ws?.name || '…'}
            </h1>
            {ws?.description && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{ws.description}</p>
            )}
          </div>
        </div>
        <button onClick={addAction} className="btn-primary shrink-0 gap-1.5 text-sm">
          <Plus size={15} /> {addLabel}
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }}>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-hover)' }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex-1 justify-center"
              style={{
                background: tab === t.id ? 'var(--bg-card)' : 'transparent',
                color: tab === t.id ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: tab === t.id ? '0 1px 6px rgba(0,0,0,0.07)' : 'none',
              }}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[11px] px-1.5"
                    style={{
                      background: tab === t.id ? 'rgba(194,105,42,0.15)' : 'var(--bg-border)',
                      color: tab === t.id ? 'var(--primary)' : 'var(--text-faint)',
                    }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>

          {loading && (
            <div className="space-y-2.5">
              {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          )}

          {!loading && tab === 'notes' && (
            notes.length === 0
              ? <Empty icon={<FileText size={28} />} label="No notes yet" subtitle="Create your first note to get started"
                       action={() => setModal('note')} actionLabel="Create Note" />
              : <div className="space-y-2">
                  {notes.map((n) => (
                    <ContentRow key={n.id} icon={<FileText size={17} style={{ color: 'var(--accent)' }} />}
                      title={n.title} subtitle={timeAgo(n.updated_at || n.created_at)}
                      to={`/workspaces/${workspaceId}/notes/${n.id}`}
                      onDelete={() => deleteNote(n.id)} />
                  ))}
                </div>
          )}

          {!loading && tab === 'docs' && (
            docs.length === 0
              ? <Empty icon={<FileText size={28} />} label="No documents yet" subtitle="Create a structured document for your research"
                       action={() => setModal('doc')} actionLabel="Create Document" />
              : <div className="space-y-2">
                  {docs.map((d) => (
                    <ContentRow key={d.id} icon={<FileText size={17} style={{ color: 'var(--secondary)' }} />}
                      title={d.title} subtitle={timeAgo(d.updated_at || d.created_at)}
                      to={`/workspaces/${workspaceId}/documents/${d.id}`}
                      onDelete={() => deleteDoc(d.id)} />
                  ))}
                </div>
          )}

          {!loading && tab === 'datasets' && (
            datasets.length === 0
              ? <Empty icon={<Database size={28} />} label="No datasets yet" subtitle="Link a dataset to this workspace"
                       action={() => setModal('dataset')} actionLabel="Add Dataset" />
              : <div className="space-y-2">
                  {datasets.map((d) => (
                    <div key={d.id} className="flex items-center gap-4 p-4 rounded-xl group transition-all"
                         style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)' }}
                         onMouseEnter={e => e.currentTarget.style.borderColor='rgba(194,105,42,0.2)'}
                         onMouseLeave={e => e.currentTarget.style.borderColor='var(--bg-border)'}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                           style={{ background: 'rgba(201,162,39,0.12)' }}>
                        <Database size={17} style={{ color: 'var(--gold)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{d.name}</div>
                        {d.description && <div className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{d.description}</div>}
                        {d.source_url && (
                          <a href={d.source_url} target="_blank" rel="noreferrer"
                             className="inline-flex items-center gap-1 text-xs mt-1 transition-colors"
                             style={{ color: 'var(--primary)' }}
                             onMouseEnter={e => e.currentTarget.style.textDecoration='underline'}
                             onMouseLeave={e => e.currentTarget.style.textDecoration='none'}>
                            <ExternalLink size={10} /> Source
                          </a>
                        )}
                      </div>
                      <button onClick={() => deleteDataset(d.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
                        style={{ color: 'var(--danger)' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(192,57,43,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background=''}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
          )}

          {!loading && tab === 'members' && (
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-4 p-4 rounded-xl group transition-all"
                     style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)' }}
                     onMouseEnter={e => e.currentTarget.style.borderColor='rgba(194,105,42,0.15)'}
                     onMouseLeave={e => e.currentTarget.style.borderColor='var(--bg-border)'}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm uppercase shrink-0 text-white"
                       style={{ background: 'linear-gradient(135deg, var(--primary), var(--gold))' }}>
                    {m.username?.slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{m.username}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.email}</div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={{
                          background: m.ws_role === 'admin' ? 'rgba(201,162,39,0.15)' : m.ws_role === 'viewer' ? 'var(--bg-hover)' : 'rgba(194,105,42,0.12)',
                          color: m.ws_role === 'admin' ? 'var(--gold)' : m.ws_role === 'viewer' ? 'var(--text-muted)' : 'var(--primary)',
                        }}>
                    {m.ws_role}
                  </span>
                  {ws?.owner_id !== m.id && user?.role === 'admin' && (
                    <button onClick={() => removeMember(m.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
                      style={{ color: 'var(--danger)' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(192,57,43,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background=''}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => setModal('member')} className="btn-outline w-full gap-2 mt-2">
                <Plus size={14} /> Add Member
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {modal === 'note' && (
          <Modal title="New Note" icon={<FileText size={14} style={{ color: 'var(--primary)' }} />} onClose={closeModal}>
            {err && <p className="text-sm mb-3" style={{ color: 'var(--danger)' }}>{err}</p>}
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Title</label>
            <input className="input w-full mb-4" placeholder="Note title…" value={newTitle}
                   onChange={e => setNewTitle(e.target.value)} autoFocus />
            <div className="flex gap-3">
              <button onClick={createNote} disabled={saving} className="btn-primary flex-1">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create & Edit'}
              </button>
              <button onClick={closeModal} className="btn-ghost flex-1">Cancel</button>
            </div>
          </Modal>
        )}
        {modal === 'doc' && (
          <Modal title="New Document" icon={<FileText size={14} style={{ color: 'var(--primary)' }} />} onClose={closeModal}>
            {err && <p className="text-sm mb-3" style={{ color: 'var(--danger)' }}>{err}</p>}
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Title</label>
            <input className="input w-full mb-4" placeholder="Document title…" value={newTitle}
                   onChange={e => setNewTitle(e.target.value)} autoFocus />
            <div className="flex gap-3">
              <button onClick={createDoc} disabled={saving} className="btn-primary flex-1">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create & Edit'}
              </button>
              <button onClick={closeModal} className="btn-ghost flex-1">Cancel</button>
            </div>
          </Modal>
        )}
        {modal === 'dataset' && (
          <Modal title="Add Dataset" icon={<Database size={14} style={{ color: 'var(--gold)' }} />} onClose={closeModal}>
            {err && <p className="text-sm mb-3" style={{ color: 'var(--danger)' }}>{err}</p>}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Name *</label>
                <input className="input w-full" placeholder="Dataset name" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Description</label>
                <input className="input w-full" placeholder="Optional description" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Source URL</label>
                <input className="input w-full" placeholder="https://…" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={createDataset} disabled={saving} className="btn-primary flex-1">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Add Dataset'}
              </button>
              <button onClick={closeModal} className="btn-ghost flex-1">Cancel</button>
            </div>
          </Modal>
        )}
        {modal === 'member' && (
          <Modal title="Add Member" icon={<Users size={14} style={{ color: 'var(--primary)' }} />} onClose={closeModal}>
            {err && <p className="text-sm mb-3" style={{ color: 'var(--danger)' }}>{err}</p>}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Email *</label>
                <input className="input w-full" placeholder="member@email.com" type="email"
                       value={newEmail} onChange={e => setNewEmail(e.target.value)} autoFocus />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Role</label>
                <select className="input w-full" value={newRole} onChange={e => setNewRole(e.target.value)}>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={addMember} disabled={saving} className="btn-primary flex-1">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Add Member'}
              </button>
              <button onClick={closeModal} className="btn-ghost flex-1">Cancel</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Content Row (shared for notes + docs) ─────────────────────────────────── */
function ContentRow({ icon, title, subtitle, to, onDelete }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl group transition-all"
         style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)' }}
         onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(194,105,42,0.22)'; e.currentTarget.style.transform='translateX(2px)'; }}
         onMouseLeave={e => { e.currentTarget.style.borderColor='var(--bg-border)'; e.currentTarget.style.transform=''; }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
           style={{ background: 'var(--bg-hover)' }}>
        {icon}
      </div>
      <Link to={to} className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{title}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{subtitle}</div>
      </Link>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link to={to} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='var(--text-muted)'; }}>
          <Edit2 size={13} />
        </Link>
        <button onClick={onDelete} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(192,57,43,0.08)'; e.currentTarget.style.color='var(--danger)'; }}
                onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='var(--text-muted)'; }}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}