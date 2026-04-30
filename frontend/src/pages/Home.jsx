import { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, TrendingUp, Award, Users } from 'lucide-react';
import CourseCard from '../components/CourseCard';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Guard: admins should never be on the user-side home
  useEffect(() => {
    if (user?.role === 'admin') navigate('/admin', { replace: true });
  }, [user, navigate]);
  const [enrollments, setEnrollments] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/enrollments/my').catch(() => ({ data: [] })),
      api.get('/courses?limit=4').catch(() => ({ data: { courses: [] } })),
    ]).then(([enr, crs]) => {
      setEnrollments(enr.data || []);
      setFeatured(crs.data.courses || []);
    }).finally(() => setLoading(false));
  }, []);

  const inProgress = enrollments.filter(e => e.progress > 0 && e.progress < 100);
  const completed = enrollments.filter(e => e.progress >= 100);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a2035', margin: 0 }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#7a8294', marginTop: 6 }}>Continue your professional learning journey</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
        {[
          { icon: BookOpen, label: 'Enrolled', value: enrollments.length, color: '#6c63ff' },
          { icon: TrendingUp, label: 'In Progress', value: inProgress.length, color: '#f5a623' },
          { icon: Award, label: 'Completed', value: completed.length, color: '#2ecc71' },
          { icon: Users, label: 'Communities', value: '—', color: '#e74c3c' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: color + '20', borderRadius: 10, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1a2035' }}>{value}</div>
              <div style={{ fontSize: 12, color: '#7a8294' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Learning */}
      {inProgress.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2035', marginBottom: 16 }}>Continue Learning</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {inProgress.slice(0, 3).map(e => (
              <div
                key={e.id}
                onClick={() => navigate(`/course/${e.course_id}`)}
                style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}
              >
                {e.image_url && <img src={e.image_url} alt={e.title} style={{ width: 64, height: 48, borderRadius: 8, objectFit: 'cover' }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1a2035', marginBottom: 6 }}>{e.title}</div>
                  <div style={{ background: '#f0f0f5', borderRadius: 20, height: 6, overflow: 'hidden' }}>
                    <div style={{ background: '#6c63ff', height: '100%', width: `${e.progress}%`, borderRadius: 20 }} />
                  </div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#6c63ff' }}>{e.progress}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Courses */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2035', margin: 0 }}>Featured Courses</h2>
          <button onClick={() => navigate('/discover')} style={{ background: 'none', border: 'none', color: '#6c63ff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>View all →</button>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {featured.map(c => <CourseCard key={c.id} course={c} onClick={() => navigate(`/course/${c.id}`)} />)}
          </div>
        )}
      </section>
    </div>
  );
}
