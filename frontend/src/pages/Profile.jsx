import { useState, useRef, useEffect } from 'react';
import { User, BookOpen, Lock, Camera, Plus, X, Save, CheckCircle, AlertCircle, ChevronRight, Upload } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const SECTIONS = [
  { key: 'info', label: 'Personal Info', icon: User },
  { key: 'subjects', label: 'Teaching Subjects', icon: BookOpen },
  { key: 'security', label: 'Security', icon: Lock },
];

const SUBJECT_SUGGESTIONS = [
  'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
  'History', 'Geography', 'Art', 'Music', 'Physical Education', 'ICT',
  'Social Studies', 'Mandarin', 'Malay', 'Tamil', 'Economics', 'Literature',
  'Design & Technology', 'Home Economics',
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
      {type === 'success'
        ? <CheckCircle size={18} color="#2ecc71" />
        : <AlertCircle size={18} color="#e74c3c" />}
      <span style={{ flex: 1, fontSize: 14 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: 0 }}><X size={14} /></button>
    </div>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [section, setSection] = useState('info');
  const [toast, setToast] = useState(null);
  const avatarRef = useRef(null);

  // ── Personal Info state ──────────────────────────────────────────────
  const [info, setInfo] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    school: user?.school || '',
    department: user?.department || '',
    job_title: user?.job_title || '',
    avatar: user?.avatar || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);

  // ── Subjects state ───────────────────────────────────────────────────
  const [subjects, setSubjects] = useState(Array.isArray(user?.teaching_subjects) ? user.teaching_subjects : []);
  const [subjectInput, setSubjectInput] = useState('');
  const [savingSubjects, setSavingSubjects] = useState(false);

  // ── Security state ───────────────────────────────────────────────────
  const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingSecurity, setSavingSecurity] = useState(false);

  // ── Job roles for dropdown ───────────────────────────────────────────
  const [jobRoles, setJobRoles] = useState([]);
  useEffect(() => {
    api.get('/job-roles').then(r => setJobRoles(r.data || [])).catch(() => {});
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Handlers ────────────────────────────────────────────────────────
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await api.post('/upload/avatar', fd);
      setInfo(f => ({ ...f, avatar: r.data.url }));
      setAvatarPreview(r.data.url);
    } catch {
      showToast('Avatar upload failed', 'error');
      setAvatarPreview(user?.avatar || '');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    try {
      const res = await api.put(`/users/${user.id}`, {
        name: info.name,
        bio: info.bio,
        phone: info.phone,
        school: info.school,
        department: info.department,
        job_title: info.job_title,
        avatar: info.avatar,
      });
      updateUser(res.data);
      showToast('Profile updated successfully');
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to save profile', 'error');
    } finally {
      setSavingInfo(false);
    }
  };

  const addSubject = (s) => {
    const trimmed = s.trim();
    if (trimmed && !subjects.includes(trimmed)) setSubjects(prev => [...prev, trimmed]);
    setSubjectInput('');
  };

  const removeSubject = (s) => setSubjects(prev => prev.filter(x => x !== s));

  const handleSaveSubjects = async () => {
    setSavingSubjects(true);
    try {
      const res = await api.put(`/users/${user.id}`, { teaching_subjects: subjects });
      updateUser(res.data);
      showToast('Teaching subjects saved');
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to save subjects', 'error');
    } finally {
      setSavingSubjects(false);
    }
  };

  const handleChangePassword = async () => {
    if (!security.currentPassword || !security.newPassword || !security.confirmPassword)
      return showToast('All fields are required', 'error');
    if (security.newPassword !== security.confirmPassword)
      return showToast('New passwords do not match', 'error');
    if (security.newPassword.length < 6)
      return showToast('New password must be at least 6 characters', 'error');
    setSavingSecurity(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      });
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully');
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setSavingSecurity(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 13px', border: '1.5px solid #e0e3ea',
    borderRadius: 9, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    background: '#fff', color: '#1a2035', transition: 'border-color 0.15s',
  };

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <style>{`
        input:focus, textarea:focus, select:focus { border-color: #6c63ff !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2035', margin: 0 }}>Account Settings</h1>
        <p style={{ color: '#7a8294', marginTop: 4, fontSize: 14 }}>Manage your profile and preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>

        {/* Left menu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Avatar card */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '24px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', textAlign: 'center', marginBottom: 4 }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
              {avatarPreview
                ? <img src={avatarPreview} alt="Avatar" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #f0eeff' }} />
                : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', border: '3px solid #f0eeff' }}>{initials}</div>
              }
              <button
                onClick={() => avatarRef.current?.click()}
                disabled={uploadingAvatar}
                title="Change photo"
                style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#6c63ff', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={12} color="#fff" />
              </button>
              <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1a2035', lineHeight: 1.3 }}>{user?.name}</div>
            {user?.job_title && <div style={{ fontSize: 12, color: '#6c63ff', marginTop: 3, fontWeight: 600 }}>{user.job_title}</div>}
            <div style={{ fontSize: 12, color: '#7a8294', marginTop: 2 }}>{user?.email}</div>
            <span style={{ display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 700, background: '#f0eeff', color: '#6c63ff', borderRadius: 20, padding: '3px 10px', textTransform: 'capitalize' }}>{user?.role}</span>
          </div>

          {/* Nav items */}
          <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            {SECTIONS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSection(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '13px 16px',
                  background: section === key ? '#f5f4ff' : 'transparent',
                  border: 'none', borderLeft: section === key ? '3px solid #6c63ff' : '3px solid transparent',
                  color: section === key ? '#6c63ff' : '#5a6480', fontWeight: section === key ? 700 : 400,
                  cursor: 'pointer', fontSize: 14, textAlign: 'left', transition: 'all 0.15s',
                }}>
                <Icon size={16} />
                <span style={{ flex: 1 }}>{label}</span>
                {section === key && <ChevronRight size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* Right content */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>

          {/* ── Personal Info ── */}
          {section === 'info' && (
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a2035', margin: '0 0 22px' }}>Personal Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Portrait photo upload */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 10 }}>Profile Photo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    {/* Preview circle */}
                    <div style={{ flexShrink: 0, position: 'relative' }}>
                      {avatarPreview
                        ? <img src={avatarPreview} alt="Avatar" style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid #f0eeff' }} />
                        : <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', border: '3px solid #f0eeff' }}>{initials}</div>
                      }
                      {uploadingAvatar && (
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(108,99,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: 20, height: 20, border: '2.5px solid #fff', borderTop: '2.5px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        </div>
                      )}
                    </div>
                    {/* Drop zone */}
                    <div
                      onClick={() => avatarRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#6c63ff'; e.currentTarget.style.background = '#f5f4ff'; }}
                      onDragLeave={e => { e.currentTarget.style.borderColor = '#d0d4e0'; e.currentTarget.style.background = '#fafbff'; }}
                      onDrop={e => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#d0d4e0';
                        e.currentTarget.style.background = '#fafbff';
                        const dropped = e.dataTransfer.files?.[0];
                        if (dropped) handleAvatarUpload({ target: { files: [dropped] } });
                      }}
                      style={{ flex: 1, border: '2px dashed #d0d4e0', borderRadius: 12, padding: '18px 20px', cursor: 'pointer', background: '#fafbff', textAlign: 'center', transition: 'all 0.15s' }}>
                      <Upload size={22} color="#9aa2b4" style={{ marginBottom: 6 }} />
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#5a6480' }}>Click or drag to upload photo</p>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9aa2b4' }}>JPEG, PNG or WebP · max 5 MB</p>
                    </div>
                    <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 6 }}>Full Name</label>
                  <input type="text" value={info.name} onChange={e => setInfo(f => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Your full name" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 6 }}>Email Address</label>
                  <input type="email" value={user?.email || ''} disabled style={{ ...inputStyle, background: '#f8f9fc', color: '#9aa2b4', cursor: 'not-allowed' }} />
                  <p style={{ fontSize: 12, color: '#9aa2b4', marginTop: 4 }}>Email cannot be changed. Contact admin to update.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 6 }}>Phone Number</label>
                    <input type="tel" value={info.phone} onChange={e => setInfo(f => ({ ...f, phone: e.target.value }))} style={inputStyle} placeholder="+60 12-345 6789" />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 6 }}>School / Institution</label>
                    <input type="text" value={info.school} onChange={e => setInfo(f => ({ ...f, school: e.target.value }))} style={inputStyle} placeholder="e.g. SMK Damansara" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 6 }}>Department</label>
                    <input type="text" value={info.department} onChange={e => setInfo(f => ({ ...f, department: e.target.value }))} style={inputStyle} placeholder="e.g. Science Department" />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 6 }}>Job Title</label>
                    <select value={info.job_title} onChange={e => setInfo(f => ({ ...f, job_title: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="">— Select job title —</option>
                      {jobRoles.map(r => (
                        <option key={r.id} value={r.title}>{r.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 6 }}>Bio</label>
                  <textarea value={info.bio} onChange={e => setInfo(f => ({ ...f, bio: e.target.value }))} rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }} placeholder="Tell colleagues a little about yourself…" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                  <button onClick={handleSaveInfo} disabled={savingInfo}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: savingInfo ? 0.7 : 1 }}>
                    <Save size={15} /> {savingInfo ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Teaching Subjects ── */}
          {section === 'subjects' && (
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a2035', margin: '0 0 6px' }}>Teaching Subjects</h2>
              <p style={{ fontSize: 14, color: '#7a8294', margin: '0 0 22px', lineHeight: 1.6 }}>
                Add the subjects you teach. This helps the AI assistant and recommendations personalise content for you.
              </p>

              {/* Current subjects */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18, minHeight: 40 }}>
                {subjects.length === 0
                  ? <p style={{ fontSize: 13, color: '#b0b7c3', fontStyle: 'italic' }}>No subjects added yet.</p>
                  : subjects.map(s => (
                    <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0eeff', color: '#6c63ff', borderRadius: 20, padding: '6px 12px', fontSize: 13, fontWeight: 600 }}>
                      {s}
                      <button onClick={() => removeSubject(s)} style={{ background: 'none', border: 'none', color: '#a09aff', cursor: 'pointer', padding: 0, display: 'flex', lineHeight: 1 }}>
                        <X size={13} />
                      </button>
                    </span>
                  ))
                }
              </div>

              {/* Input */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                <input
                  value={subjectInput}
                  onChange={e => setSubjectInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubject(subjectInput); } }}
                  placeholder="Type a subject and press Enter…"
                  style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => addSubject(subjectInput)} disabled={!subjectInput.trim()}
                  style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 9, padding: '0 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 14, opacity: subjectInput.trim() ? 1 : 0.5 }}>
                  <Plus size={15} /> Add
                </button>
              </div>

              {/* Suggestions */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#9aa2b4', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Quick Add</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {SUBJECT_SUGGESTIONS.filter(s => !subjects.includes(s)).map(s => (
                    <button key={s} onClick={() => addSubject(s)}
                      style={{ background: '#f8f9fc', color: '#5a6480', border: '1px solid #e0e3ea', borderRadius: 20, padding: '5px 13px', fontSize: 12, cursor: 'pointer', fontWeight: 500, transition: 'all 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f0eeff'; e.currentTarget.style.color = '#6c63ff'; e.currentTarget.style.borderColor = '#d4d0ff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#f8f9fc'; e.currentTarget.style.color = '#5a6480'; e.currentTarget.style.borderColor = '#e0e3ea'; }}>
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 24, borderTop: '1px solid #f0f2f7', marginTop: 24 }}>
                <button onClick={handleSaveSubjects} disabled={savingSubjects}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: savingSubjects ? 0.7 : 1 }}>
                  <Save size={15} /> {savingSubjects ? 'Saving…' : 'Save Subjects'}
                </button>
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {section === 'security' && (
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a2035', margin: '0 0 6px' }}>Change Password</h2>
              <p style={{ fontSize: 14, color: '#7a8294', margin: '0 0 22px' }}>Choose a strong password with at least 6 characters.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                {[
                  { label: 'Current Password', key: 'currentPassword', placeholder: 'Enter current password' },
                  { label: 'New Password', key: 'newPassword', placeholder: 'At least 6 characters' },
                  { label: 'Confirm New Password', key: 'confirmPassword', placeholder: 'Repeat new password' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 6 }}>{label}</label>
                    <input
                      type="password"
                      value={security[key]}
                      onChange={e => setSecurity(s => ({ ...s, [key]: e.target.value }))}
                      placeholder={placeholder}
                      style={inputStyle} />
                  </div>
                ))}

                {/* Password strength indicator */}
                {security.newPassword && (() => {
                  const len = security.newPassword.length;
                  const hasUpper = /[A-Z]/.test(security.newPassword);
                  const hasNum = /[0-9]/.test(security.newPassword);
                  const hasSpecial = /[^A-Za-z0-9]/.test(security.newPassword);
                  const score = [len >= 8, hasUpper, hasNum, hasSpecial].filter(Boolean).length;
                  const levels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
                  const colors = ['', '#e74c3c', '#f0a500', '#27ae60', '#0284c7'];
                  return (
                    <div>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= score ? colors[score] : '#e0e3ea', transition: 'background 0.2s' }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 12, color: colors[score], fontWeight: 600 }}>{levels[score]}</div>
                    </div>
                  );
                })()}

                {security.confirmPassword && security.newPassword !== security.confirmPassword && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#e74c3c' }}>
                    <AlertCircle size={13} /> Passwords do not match
                  </div>
                )}

                <div style={{ paddingTop: 8 }}>
                  <button onClick={handleChangePassword} disabled={savingSecurity}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: savingSecurity ? 0.7 : 1 }}>
                    <Lock size={15} /> {savingSecurity ? 'Updating…' : 'Update Password'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
