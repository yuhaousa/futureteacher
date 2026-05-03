import { useState, useEffect } from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BookOpen, Users, Map, Users2, ArrowLeft, Briefcase, Award, Settings, LogOut, Library } from 'lucide-react';

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/pathways', icon: Map, label: 'Pathways' },
  { to: '/admin/communities', icon: Users2, label: 'Communities' },
  { to: '/admin/job-roles', icon: Briefcase, label: 'Job Roles' },
  { to: '/admin/skill-frameworks', icon: Award, label: 'Skill Frameworks' },
  { to: '/admin/resources', icon: Library, label: 'Resource Library' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f6fa' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #6c63ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>
      <aside style={{ width: 220, background: '#1a2035', color: '#c8d0e0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 20px 12px' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Admin Panel</div>
          <div style={{ fontSize: 12, color: '#5a6480', marginTop: 2 }}>EduLearn Pro</div>
        </div>
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {adminNav.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
                color: isActive ? '#fff' : '#8892a4',
                background: isActive ? '#6c63ff' : 'transparent',
                borderRadius: 8, margin: '2px 8px', textDecoration: 'none',
                fontWeight: isActive ? 600 : 400, fontSize: 14,
              })}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '8px 8px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', color: '#8892a4', background: 'none', border: 'none', borderRadius: 8, width: '100%', cursor: 'pointer', fontSize: 14 }}>
            <ArrowLeft size={18} /> Back to Site
          </button>
          <button onClick={() => { logout(); navigate('/login'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', color: '#e74c3c', background: 'none', border: 'none', borderRadius: 8, width: '100%', cursor: 'pointer', fontSize: 14 }}>
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
        <Outlet />
      </main>
    </div>
  );
}
