import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function MyLearning() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/enrollments/my').then(res => setEnrollments(res.data)).finally(() => setLoading(false));
  }, []);

  const filtered = enrollments.filter(e => {
    if (filter === 'in-progress') return e.progress > 0 && e.progress < 100;
    if (filter === 'completed') return e.progress >= 100;
    if (filter === 'not-started') return e.progress === 0;
    return true;
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a2035', margin: 0 }}>My Learning</h1>
        <p style={{ color: '#7a8294', marginTop: 6 }}>Track your professional development progress</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #e8eaf0', marginBottom: 28 }}>
        {[['all', 'All Courses'], ['in-progress', 'In Progress'], ['completed', 'Completed'], ['not-started', 'Not Started']].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            style={{ padding: '10px 20px', border: 'none', background: 'none', fontWeight: filter === key ? 700 : 400, color: filter === key ? '#6c63ff' : '#7a8294', borderBottom: filter === key ? '2px solid #6c63ff' : '2px solid transparent', marginBottom: -2, cursor: 'pointer', fontSize: 14 }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ color: '#aaa', marginBottom: 16 }}>No courses here yet.</p>
          <button onClick={() => navigate('/discover')} style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>
            Discover Courses
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {filtered.map(e => (
            <div key={e.id} onClick={() => navigate(`/course/${e.course_id}`)}
              style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 160, background: '#e8eaf0', overflow: 'hidden', position: 'relative' }}>
                {e.image_url
                  ? <img src={e.image_url} alt={e.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📚</div>}
                <div style={{ position: 'absolute', top: 10, right: 10, background: e.progress >= 100 ? '#2ecc71' : '#6c63ff', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px' }}>
                  {e.progress >= 100 ? 'Completed' : e.progress > 0 ? 'In Progress' : 'Not Started'}
                </div>
              </div>
              <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a2035', lineHeight: 1.4 }}>{e.title}</div>
                <div style={{ fontSize: 12, color: '#9aa2b4' }}>
                  <span style={{ marginRight: 10 }}>⏱ {e.duration_hours}h</span>
                  <span>{e.category}</span>
                </div>
                <div style={{ marginTop: 'auto', paddingTop: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#7a8294', marginBottom: 4 }}>
                    <span>Progress</span>
                    <span style={{ fontWeight: 700, color: e.progress >= 100 ? '#2ecc71' : '#6c63ff' }}>{e.progress || 0}%</span>
                  </div>
                  <div style={{ background: '#f0f0f5', borderRadius: 20, height: 6, overflow: 'hidden' }}>
                    <div style={{ background: e.progress >= 100 ? '#2ecc71' : '#6c63ff', height: '100%', width: `${e.progress || 0}%`, borderRadius: 20 }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
