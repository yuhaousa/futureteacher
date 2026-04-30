import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home, Compass, BookOpen, Map, Users, Sparkles,
  Settings, ChevronLeft, GraduationCap, LogOut, UserCircle
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'LEARNING', items: [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/discover', icon: Compass, label: 'Discover' },
    { to: '/my-learning', icon: BookOpen, label: 'My Learning' },
    { to: '/pathways', icon: Map, label: 'Pathways' },
    { to: '/communities', icon: Users, label: 'Communities' },
    { to: '/ai-assistant', icon: Sparkles, label: 'AI Assistant' },
  ]},
];

export default function Sidebar({ collapsed, onCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      style={{
        width: collapsed ? 64 : 220,
        minHeight: '100vh',
        background: '#1a2035',
        color: '#c8d0e0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ background: '#6c63ff', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <GraduationCap size={20} color="#fff" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>EduLearn Pro</div>
            <div style={{ fontSize: 11, color: '#8892a4' }}>Professional Learning</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {navItems.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <div style={{ fontSize: 10, fontWeight: 700, color: '#5a6480', padding: '12px 20px 4px', letterSpacing: 1 }}>
                {group.label}
              </div>
            )}
            {group.items.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/home'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: collapsed ? '10px 0' : '10px 20px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: isActive ? '#fff' : '#8892a4',
                  background: isActive ? '#6c63ff' : 'transparent',
                  borderRadius: 8,
                  margin: '2px 8px',
                  textDecoration: 'none',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14,
                  transition: 'all 0.15s',
                })}
              >
                <Icon size={18} />
                {!collapsed && label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '8px 0 16px' }}>
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '10px 0' : '10px 20px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: isActive ? '#fff' : '#8892a4',
              background: isActive ? '#3b4260' : 'transparent',
              borderRadius: 8, margin: '2px 8px',
              textDecoration: 'none', fontSize: 14,
            })}
          >
            <Settings size={18} />
            {!collapsed && 'Admin Panel'}
          </NavLink>
        )}

        {/* User profile link */}
        <NavLink
          to="/profile"
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: collapsed ? '10px 0' : '8px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            textDecoration: 'none',
            borderRadius: 10, margin: '4px 8px',
            background: isActive ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.04)',
            border: isActive ? '1px solid rgba(108,99,255,0.3)' : '1px solid transparent',
            transition: 'all 0.15s',
          })}
        >
          {user?.avatar
            ? <img src={user.avatar} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(108,99,255,0.4)' }} />
            : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {(user?.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
              </div>
          }
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ color: '#e0e6f0', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ color: '#5a6480', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>View profile</div>
            </div>
          )}
        </NavLink>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: collapsed ? '10px 0' : '10px 20px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            color: '#8892a4', background: 'none', border: 'none',
            borderRadius: 8, margin: '2px 8px', width: 'calc(100% - 16px)',
            cursor: 'pointer', fontSize: 14,
          }}
        >
          <LogOut size={18} />
          {!collapsed && 'Logout'}
        </button>
        <button
          onClick={onCollapse}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: collapsed ? '10px 0' : '10px 20px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            color: '#5a6480', background: 'none', border: 'none',
            width: 'calc(100% - 16px)', margin: '2px 8px',
            cursor: 'pointer', fontSize: 13,
          }}
        >
          <ChevronLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  );
}
