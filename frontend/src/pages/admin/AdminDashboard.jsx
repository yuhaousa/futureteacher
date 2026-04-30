import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, TrendingUp, Users2 } from 'lucide-react';
import api from '../../api/client';

function BarChart({ data, color, label }) {
  const max = Math.max(...data.map(d => d.count), 1);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2035', margin: '0 0 16px' }}>{label}</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
        {data.map((d, i) => {
          const pct = max > 0 ? (d.count / max) * 100 : 0;
          const date = new Date(d.day + 'T00:00:00');
          const dayLabel = days[date.getDay()];
          return (
            <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: d.count > 0 ? color : '#c0c6d4' }}>{d.count > 0 ? d.count : ''}</span>
              <div style={{ width: '100%', position: 'relative', flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                <div
                  title={`${d.day}: ${d.count}`}
                  style={{
                    width: '100%',
                    height: `${Math.max(pct, d.count > 0 ? 6 : 2)}%`,
                    background: d.count > 0
                      ? `linear-gradient(180deg, ${color}cc, ${color})`
                      : '#f0f2f7',
                    borderRadius: '4px 4px 2px 2px',
                    transition: 'height 0.4s ease',
                    minHeight: 3,
                  }}
                />
              </div>
              <span style={{ fontSize: 11, color: '#9aa2b4', marginTop: 2 }}>{dayLabel}</span>
            </div>
          );
        })}
      </div>
      {/* Date range label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 10, color: '#b0b7c3' }}>{data[0]?.day?.slice(5)}</span>
        <span style={{ fontSize: 10, color: '#b0b7c3' }}>{data[data.length - 1]?.day?.slice(5)}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/users/stats').then(res => setStats(res.data));
  }, []);

  const cards = stats ? [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: '#6c63ff', to: '/admin/users' },
    { icon: BookOpen, label: 'Total Courses', value: stats.totalCourses, color: '#f5a623', to: '/admin/courses' },
    { icon: TrendingUp, label: 'Enrollments', value: stats.totalEnrollments, color: '#2ecc71', to: null },
    { icon: Users2, label: 'Communities', value: stats.totalCommunities, color: '#e74c3c', to: '/admin/communities' },
  ] : [];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a2035', margin: '0 0 8px' }}>Dashboard</h1>
      <p style={{ color: '#7a8294', marginBottom: 28 }}>Platform overview and statistics</p>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {cards.map(({ icon: Icon, label, value, color, to }) => (
          <div key={label} onClick={() => to && navigate(to)}
            style={{ background: '#fff', borderRadius: 12, padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: to ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: color + '20', borderRadius: 10, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={24} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#1a2035' }}>{value ?? '...'}</div>
              <div style={{ fontSize: 12, color: '#7a8294' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {stats?.weeklyLoginData
            ? <BarChart data={stats.weeklyLoginData} color="#6c63ff" label="User Logins — Last 7 Days" />
            : <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13 }}>Loading…</div>
          }
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {stats?.weeklyCourseData
            ? <BarChart data={stats.weeklyCourseData} color="#f5a623" label="New Courses Added — Last 7 Days" />
            : <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13 }}>Loading…</div>
          }
        </div>
      </div>

      {/* Recent enrollments */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2035', margin: '0 0 20px' }}>Recent Enrollments</h2>
        {stats?.recentEnrollments?.length === 0 ? (
          <p style={{ color: '#aaa' }}>No enrollments yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f2f7' }}>
                {['User', 'Course', 'Date'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#9aa2b4', fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats?.recentEnrollments?.map((e, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f2f7' }}>
                  <td style={{ padding: '12px', fontSize: 14, color: '#1a2035', fontWeight: 500 }}>{e.user_name}</td>
                  <td style={{ padding: '12px', fontSize: 14, color: '#5a6480' }}>{e.course_title}</td>
                  <td style={{ padding: '12px', fontSize: 13, color: '#9aa2b4' }}>{new Date(e.enrolled_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

