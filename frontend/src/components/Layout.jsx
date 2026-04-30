import { Outlet, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Redirect admin immediately — don't wait for loading
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f6fa' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #6c63ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>
      <Sidebar collapsed={collapsed} onCollapse={() => setCollapsed(c => !c)} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
        <Outlet />
      </main>
    </div>
  );
}
