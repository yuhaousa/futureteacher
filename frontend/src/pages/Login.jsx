import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      const dest = data.user.role === 'admin' ? '/admin' : '/home';
      window.location.href = dest;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a2035 0%, #2d3561 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '40px 44px', width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ background: '#6c63ff', borderRadius: 14, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <GraduationCap size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2035', margin: 0 }}>EduLearn Pro</h1>
          <p style={{ color: '#7a8294', fontSize: 13, marginTop: 4 }}>Professional Learning Platform</p>
        </div>

        {error && <div style={{ background: '#fdeaea', color: '#e74c3c', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {[{ label: 'Email', value: email, set: setEmail, type: 'email' }, { label: 'Password', value: password, set: setPassword, type: 'password' }].map(({ label, value, set, type }) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 6 }}>{label}</label>
              <input type={type} value={value} onChange={e => set(e.target.value)} required
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 14, color: '#1a2035', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = '#6c63ff'}
                onBlur={e => e.target.style.borderColor = '#e0e3ea'}
              />
            </div>
          ))}
          <button type="submit" disabled={loading}
            style={{ width: '100%', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#7a8294' }}>
          Don't have an account? <Link to="/register" style={{ color: '#6c63ff', fontWeight: 600 }}>Sign up</Link>
        </p>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 16 }}>
          Demo: admin@edulearn.pro / admin123
        </p>
      </div>
    </div>
  );
}
