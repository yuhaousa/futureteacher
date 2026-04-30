import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Trash2, Shield } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'admin' ? 'teacher' : 'admin';
    const r = await api.put(`/users/${user.id}`, { role: newRole });
    setUsers(prev => prev.map(u => u.id === user.id ? r.data : u));
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2035', margin: '0 0 8px' }}>Users</h1>
      <p style={{ color: '#7a8294', marginBottom: 24, fontSize: 13 }}>{users.length} registered users</p>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8f9fc' }}>
            <tr>{['Name', 'Email', 'Role', 'Joined', ''].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#9aa2b4', fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Loading...</td></tr>
            ) : users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f0f2f7' }}>
                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#1a2035' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6c63ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {u.name?.[0]}
                    </div>
                    {u.name}
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#5a6480' }}>{u.email}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ background: u.role === 'admin' ? '#fdf5e8' : '#f0eeff', color: u.role === 'admin' ? '#f5a623' : '#6c63ff', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#9aa2b4' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleRoleToggle(u)} title={u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                      style={{ background: '#f0eeff', color: '#6c63ff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}><Shield size={14} /></button>
                    <button onClick={() => handleDelete(u.id)}
                      style={{ background: '#fdeaea', color: '#e74c3c', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
