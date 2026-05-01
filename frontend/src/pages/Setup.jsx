import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export default function Setup() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect away if setup is already done
    axios.get(`${API_URL}/api/auth/setup-status`).then(res => {
      if (!res.data.needsSetup) navigate('/login');
    }).catch(() => {}).finally(() => setChecking(false));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/setup`, { password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/admin';
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a' }}>
        <p style={{ color: '#94a3b8' }}>Checking setup status...</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: '#1e293b', borderRadius: 12, padding: '2.5rem',
        width: '100%', maxWidth: 420, boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎓</div>
          <h1 style={{ color: '#f1f5f9', fontSize: '1.5rem', margin: '0 0 8px' }}>EduLearn Pro Setup</h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
            Set your admin password to activate the platform
          </p>
        </div>

        {error && (
          <div style={{
            background: '#450a0a', border: '1px solid #991b1b',
            borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem',
            color: '#fca5a5', fontSize: '0.875rem',
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: 6 }}>
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              style={{
                width: '100%', padding: '0.75rem 1rem', background: '#0f172a',
                border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9',
                fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: 6 }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              required
              style={{
                width: '100%', padding: '0.75rem 1rem', background: '#0f172a',
                border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9',
                fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.875rem', background: loading ? '#334155' : '#6366f1',
              color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem',
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Setting up...' : 'Activate Platform'}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem', padding: '1rem', background: '#0f172a',
          borderRadius: 8, fontSize: '0.8rem', color: '#64748b',
        }}>
          <strong style={{ color: '#94a3b8' }}>Instructor accounts</strong> will be activated with
          password <code style={{ color: '#818cf8' }}>teacher123</code>
        </div>
      </div>
    </div>
  );
}
