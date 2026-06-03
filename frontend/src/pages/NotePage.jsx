import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Save, Trash2, ArrowLeft, Tag, Plus, X, Send } from 'lucide-react';
import { useAuth } from '../store/authStore';

export default function NotePage() {
  const { workspaceId, noteId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [note,     setNote]     = useState(null);
  const [title,    setTitle]    = useState('');
  const [content,  setContent]  = useState('');
  const [tags,     setTags]     = useState([]);
  const [allTags,  setAllTags]  = useState([]);
  const [comments, setComments] = useState([]);
  const [newCmt,   setNewCmt]   = useState('');
  const [versions, setVersions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [dirty,    setDirty]    = useState(false);
  const [toast,    setToast]    = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const load = async () => {
    setLoading(true);
    try {
      const [nr, tr, cr, vr] = await Promise.all([
        api.get(`/notes/${noteId}`),
        api.get('/tags/'),
        api.get(`/comments/note/${noteId}`),
        api.get(`/versions/note/${noteId}`).catch(() => ({ data: { data: [] } })),
      ]);
      const n = nr.data.data;
      setNote(n);
      setTitle(n.title);
      setContent(n.content || '');
      setTags(n.tags || []);
      setAllTags(tr.data.data || []);
      setComments(cr.data.data || []);
      setVersions(vr.data.data || []);
    } catch { navigate(`/workspaces/${workspaceId}`); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [noteId]);

  // Auto-save after 2s idle
  useEffect(() => {
    if (!dirty || !note) return;
    const t = setTimeout(save, 2000);
    return () => clearTimeout(t);
  }, [title, content, dirty]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/notes/${noteId}`, { title, content });
      setDirty(false);
      showToast('Saved ✓');
    } catch { showToast('Save failed'); }
    setSaving(false);
  };

  const deleteNote = async () => {
    if (!confirm('Delete this note?')) return;
    await api.delete(`/notes/${noteId}`);
    navigate(`/workspaces/${workspaceId}`);
  };

  const addTag = async (tagId) => {
    await api.post(`/notes/${noteId}/tags/${tagId}`);
    const tag = allTags.find(t => t.id === tagId);
    if (tag && !tags.find(t => t.id === tagId)) setTags(prev => [...prev, tag]);
  };

  const removeTag = async (tagId) => {
    await api.delete(`/notes/${noteId}/tags/${tagId}`);
    setTags(prev => prev.filter(t => t.id !== tagId));
  };

  const postComment = async () => {
    if (!newCmt.trim()) return;
    try {
      const res = await api.post('/comments/', { content: newCmt, note_id: parseInt(noteId) });
      setComments(prev => [...prev, { ...res.data.data, author_name: user?.username }]);
      setNewCmt('');
    } catch { showToast('Failed to post comment'); }
  };

  const timeAgo = (iso) => {
    if (!iso) return '';
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    return `${Math.floor(diff/3600)}h ago`;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-[3px] border-bg-border border-t-primary animate-spin" /></div>;

  const unusedTags = allTags.filter(t => !tags.find(tt => tt.id === t.id));

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link to={`/workspaces/${workspaceId}`} className="btn-ghost flex items-center gap-2 text-sm">
          <ArrowLeft size={15} /> Back
        </Link>
        <div className="flex items-center gap-2">
          {dirty && <span className="text-xs text-text-muted animate-pulse">Unsaved…</span>}
          {saving && <span className="text-xs text-text-muted">Saving…</span>}
          <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
            <Save size={14} /> Save
          </button>
          <button onClick={deleteNote} className="btn-ghost text-danger hover:bg-danger/10 flex items-center gap-2 text-sm">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden">
        <input
          className="w-full px-6 pt-6 pb-3 text-2xl font-bold bg-transparent outline-none placeholder:text-text-muted"
          placeholder="Note title…"
          value={title}
          onChange={e => { setTitle(e.target.value); setDirty(true); }}
        />

        {/* Tags */}
        <div className="px-6 pb-3 flex flex-wrap gap-2 items-center border-b border-bg-border">
          {tags.map(t => (
            <span key={t.id} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              #{t.name}
              <button onClick={() => removeTag(t.id)} className="hover:text-danger"><X size={10} /></button>
            </span>
          ))}
          {unusedTags.length > 0 && (
            <select className="text-xs bg-transparent border border-bg-border rounded-full px-2 py-1 text-text-muted cursor-pointer"
              onChange={e => { if (e.target.value) addTag(parseInt(e.target.value)); e.target.value = ''; }}>
              <option value="">+ tag</option>
              {unusedTags.map(t => <option key={t.id} value={t.id}>#{t.name}</option>)}
            </select>
          )}
        </div>

        <textarea
          className="w-full px-6 py-5 min-h-[360px] bg-transparent outline-none resize-none text-text-primary leading-relaxed placeholder:text-text-muted font-mono text-sm"
          placeholder="Start writing your research observations…"
          value={content}
          onChange={e => { setContent(e.target.value); setDirty(true); }}
        />
      </div>

      {/* Version history */}
      {versions.length > 0 && (
        <div className="bg-bg-card border border-bg-border rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-3 text-text-muted">Version History ({versions.length})</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {versions.map(v => (
              <div key={v.id} className="text-xs text-text-muted border-b border-bg-border pb-1">
                {new Date(v.created_at).toLocaleString()} — {(v.content_snapshot || '').slice(0, 60)}…
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="bg-bg-card border border-bg-border rounded-xl p-5">
        <h3 className="font-semibold mb-4">Comments ({comments.length})</h3>
        <div className="space-y-4 mb-4">
          {comments.length === 0 && <p className="text-sm text-text-muted">No comments yet.</p>}
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-secondary/20 text-secondary font-bold flex items-center justify-center text-xs shrink-0 uppercase">
                {(c.author_name || 'U').slice(0,2)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium">{c.author_name || 'User'}</span>
                  <span className="text-xs text-text-muted">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-sm text-text-primary">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 border-t border-bg-border pt-4">
          <textarea
            className="input flex-1 resize-none text-sm"
            rows={2}
            placeholder="Add a comment…"
            value={newCmt}
            onChange={e => setNewCmt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) postComment(); }}
          />
          <button onClick={postComment} disabled={!newCmt.trim()} className="btn-primary self-end flex items-center gap-2">
            <Send size={14} /> Post
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-bg-card border border-bg-border text-sm px-4 py-2 rounded-xl shadow-xl text-text-primary">
          {toast}
        </div>
      )}
    </div>
  );
}
