import React from 'react';
import { useAuth } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Shield, Users } from 'lucide-react';

// Maps the backend "role" value to a human-friendly label + style
const ROLE_META = {
  admin: {
    label: 'Administrator',
    icon: Shield,
    color: 'text-warning',
    bg: 'bg-warning/10 border-warning/30',
    dot: 'bg-warning',
  },
  user: {
    label: 'Member',
    icon: Users,
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/30',
    dot: 'bg-primary',
  },
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleMeta = ROLE_META[user?.role] ?? ROLE_META['user'];
  const RoleIcon = roleMeta.icon;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div className="bg-bg-card border border-bg-border rounded-2xl p-6 space-y-5">
        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl uppercase">
            {user?.username?.slice(0, 2)}
          </div>
          <div>
            <div className="text-xl font-semibold">{user?.username}</div>
            <div className="text-sm text-text-muted">{user?.email}</div>
          </div>
        </div>

        <hr className="border-bg-border" />

        {/* Info rows */}
        {[
          { label: 'Username',     value: user?.username },
          { label: 'Email',        value: user?.email },
          { label: 'Member since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—' },
        ].map(r => (
          <div key={r.label} className="flex justify-between items-center">
            <span className="text-sm text-text-muted">{r.label}</span>
            <span className="text-sm font-medium">{r.value}</span>
          </div>
        ))}

        {/* Role badge — prominent, not just plain text */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-muted">Platform Role</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${roleMeta.bg} ${roleMeta.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${roleMeta.dot}`} />
            <RoleIcon size={12} />
            {roleMeta.label}
          </span>
        </div>

        {/* Admin banner */}
        {user?.role === 'admin' && (
          <div className="flex items-center gap-2 text-warning text-sm bg-warning/10 border border-warning/20 rounded-lg px-3 py-2">
            <Shield size={14} />
            <span>You have full platform administrator access.</span>
          </div>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="btn-ghost text-danger hover:bg-danger/10 flex items-center gap-2 w-full justify-center"
      >
        <LogOut size={16} /> Sign out
      </button>
    </div>
  );
}