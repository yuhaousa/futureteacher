import { useState } from 'react';
import { Save, Lock, User, CheckCircle, AlertCircle, X, Eye, EyeOff } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const SECTIONS = [
  { key: 'profile', label: 'Profile Info', icon: User },
  { key: 'security', label: 'Password', icon: Lock },
];

function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 32, right: 32, zIndex: 9000,
      background: type === 'success' ? '#1a2035' : '#2d1a1a',
      color: '#fff', borderRadius: 12, padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)', minWidth: 280,
      animation: 'fadeIn 0.2s ease',
    }}>
      {type === 'success' ? <CheckCircle size={18} color="#2ecc71" /> : <AlertCircle size={18} color="#e74c3c" />}
      <span style={{ flex: 1, fontSize: 14 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: 0 }}><X size={14} /></button>
    </div>
  );
}

export default function AdminSettings() {
  const { user, updateUser } = useAuth();
  const [section, setSection] = useState('profile');
  const [toast, setToast] = useState(null);

  const [info, setInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    school: user?.school || '',
  });
  const [savingInfo, setSavingInfo] = useState(false);

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });
  const [savingPwd, setSavingPwd] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveInfo = async () => {
    if (!info.name.trim()) return showToast('Name is required', 'error');
    setSavingInfo(true);
    try {
      const res = await api.put(`/users/${user.id}`, {
        name: info.name,
        bio: info.bio,
        phone: info.phone,
        school: info.school,
      });
      updateUser(res.data);
      showToast('Profile updated successfully');
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to save profile', 'error');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwd.current || !pwd.next || !pwd.confirm) return showToast('All fields are required', 'error');
    if (pwd.next !== pwd.confirm) return showToast('New passwords do not match', 'error');
    if (pwd.next.length < 6) return showToast('New password must be at least 6 characters', 'error');
    setSavingPwd(true);
    try {
      await api.post('/auth/change-password', { currentPassword: pwd.current, newPassword: pwd.next });
      setPwd({ current: '', next: '', confirm: '' });
      showToast('Password changed successfully');
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setSavingPwd(false);
    }
  };

  const inp = {
    width: '100%', padding: '10px 13px', border: '1.5px solid #e0e3ea',
    borderRadius: 9, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    background: '#fff', color: '#1a2035',
  };

  const initials = (user?.name || 'A').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div>
      <style>{`
        input:focus, textarea:focus { border-color: #6c63ff !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2035', margin: '0 0 4px' }}>Settings</h1>
        <p style={{ color: '#7a8294', fontSize: 13, margin: 0 }}>Manage your admin account and credentials</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Left sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Avatar card */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '20px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', marginBottom: 8 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 auto 10px' }}>
              {initials}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2035' }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: '#9aa2b4', marginTop: 2 }}>{user?.email}</div>
            <span style={{ display: 'inline-block', marginTop: 8, background: '#fdf5e8', color: '#f5a623', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Admin</span>
          </div>

          {/* Section tabs */}
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setSection(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                background: section === key ? '#f0eeff' : '#fff',
                color: section === key ? '#6c63ff' : '#5a6480',
                border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13,
                fontWeight: section === key ? 700 : 400,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)', textAlign: 'left',
              }}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>

          {section === 'profile' && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2035', margin: '0 0 20px' }}>Profile Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 5 }}>Full Name *</label>
                  <input value={info.name} onChange={e => setInfo(f => ({ ...f, name: e.target.value }))} placeholder="Your name" style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 5 }}>Email</label>
                  <input value={info.email} readOnly style={{ ...inp, background: '#f8f9fc', color: '#9aa2b4', cursor: 'not-allowed' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 5 }}>Phone</label>
                  <input value={info.phone} onChange={e => setInfo(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. +1 555 0100" style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 5 }}>School / Organisation</label>
                  <input value={info.school} onChange={e => setInfo(f => ({ ...f, school: e.target.value }))} placeholder="e.g. Springfield Academy" style={inp} />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 5 }}>Bio</label>
                <textarea value={info.bio} onChange={e => setInfo(f => ({ ...f, bio: e.target.value }))}
                  rows={3} placeholder="A short bio about yourself…"
                  style={{ ...inp, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSaveInfo} disabled={savingInfo}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: savingInfo ? 0.7 : 1 }}>
                  <Save size={14} />{savingInfo ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </>
          )}

          {section === 'security' && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2035', margin: '0 0 6px' }}>Change Password</h2>
              <p style={{ fontSize: 13, color: '#7a8294', margin: '0 0 20px' }}>Use a strong password of at least 6 characters.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                {[
                  { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                  { key: 'next', label: 'New Password', placeholder: 'Enter new password' },
                  { key: 'confirm', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 5 }}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPwd[key] ? 'text' : 'password'}
                        value={pwd[key]}
                        onChange={e => setPwd(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        style={{ ...inp, paddingRight: 40 }}
                      />
                      <button onClick={() => setShowPwd(s => ({ ...s, [key]: !s[key] }))}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9aa2b4', padding: 0 }}>
                        {showPwd[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button onClick={handleChangePassword} disabled={savingPwd}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: savingPwd ? 0.7 : 1 }}>
                  <Lock size={14} />{savingPwd ? 'Saving…' : 'Update Password'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
