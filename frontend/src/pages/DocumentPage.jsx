import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Save, Trash2, ArrowLeft } from 'lucide-react';

export default function DocumentPage() {
  const { workspaceId, documentId } = useParams();
  const navigate = useNavigate();

  const [title,   setTitle]   = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [dirty,   setDirty]   = useState(false);
  const [toast,   setToast]   = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  useEffect(() => {
    api.get(`/documents/${documentId}`)
      .then(res => {
        setTitle(res.data.data.title);
        setContent(res.data.data.content || '');
      })
      .catch(() => navigate(`/workspaces/${workspaceId}`))
      .finally(() => setLoading(false));
  }, [documentId]);

  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(save, 2000);
    return () => clearTimeout(t);
  }, [title, content, dirty]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/documents/${documentId}`, { title, content });
      setDirty(false);
      showToast('Saved ✓');
    } catch { showToast('Save failed'); }
    setSaving(false);
  };

  const deleteDoc = async () => {
    if (!confirm('Delete this document?')) return;
    await api.delete(`/documents/${documentId}`);
    navigate(`/workspaces/${workspaceId}`);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-[3px] border-bg-border border-t-primary animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link to={`/workspaces/${workspaceId}`} className="btn-ghost flex items-center gap-2 text-sm">
          <ArrowLeft size={15} /> Back
        </Link>
        <div className="flex items-center gap-2">
          {dirty && <span className="text-xs text-text-muted animate-pulse">Unsaved…</span>}
          <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
            <Save size={14} /> Save
          </button>
          <button onClick={deleteDoc} className="btn-ghost text-danger hover:bg-danger/10">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden">
        <input
          className="w-full px-6 pt-6 pb-3 text-2xl font-bold bg-transparent outline-none placeholder:text-text-muted border-b border-bg-border"
          placeholder="Document title…"
          value={title}
          onChange={e => { setTitle(e.target.value); setDirty(true); }}
        />
        <textarea
          className="w-full px-6 py-5 min-h-[520px] bg-transparent outline-none resize-none text-text-primary leading-relaxed placeholder:text-text-muted"
          placeholder="Begin your research document…"
          value={content}
          onChange={e => { setContent(e.target.value); setDirty(true); }}
        />
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-bg-card border border-bg-border text-sm px-4 py-2 rounded-xl shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
