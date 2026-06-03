import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Shield, Users, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data.data || []);
    } catch { showToast('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (userId, role) => {
    try {
      await api.put(`/auth/users/${userId}/role`, { role });
      setUsers(u => u.map(x => x.id === userId ? { ...x, role } : x));
      showToast('Role updated');
    } catch (e) { showToast(e.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={24} className="text-danger" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <button onClick={load} className="btn-ghost flex items-center gap-2 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-bg-border flex items-center gap-2">
          <Users size={16} className="text-text-muted" />
          <span className="font-semibold text-sm">All Users ({users.length})</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-text-muted text-sm">Loading…</div>
        ) : (
          <div className="divide-y divide-bg-border">
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-4 p-4">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary shrink-0 uppercase">
                  {u.username?.slice(0,2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{u.username}</div>
                  <div className="text-xs text-text-muted">{u.email}</div>
                </div>
                <select
                  value={u.role}
                  onChange={e => changeRole(u.id, e.target.value)}
                  className="text-xs bg-bg border border-bg-border rounded-lg px-2 py-1 text-text-primary"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-bg-card border border-bg-border text-sm px-4 py-2 rounded-xl shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
