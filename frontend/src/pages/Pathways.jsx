import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Pathways() {
  const navigate = useNavigate();
  const [pathways, setPathways] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pathways').then(res => setPathways(res.data)).finally(() => setLoading(false));
  }, []);

  const handleEnroll = async (e, id) => {
    e.stopPropagation();
    try { await api.post(`/pathways/${id}/enroll`); alert('Enrolled in pathway!'); }
    catch (err) { if (err.response?.status === 409) alert('Already enrolled.'); }
  };

  const levelColor = { beginner: '#2ecc71', intermediate: '#f5a623', advanced: '#e74c3c' };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a2035', margin: 0 }}>Learning Pathways</h1>
        <p style={{ color: '#7a8294', marginTop: 6 }}>Structured learning journeys for your professional goals</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {pathways.map(p => (
            <div key={p.id} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 160, overflow: 'hidden', position: 'relative', background: '#1a2035' }}>
                {p.image_url && <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />}
                <div style={{ position: 'absolute', top: 12, left: 12 }}>
                  <span style={{ background: (levelColor[p.level] || '#aaa') + '33', color: levelColor[p.level] || '#aaa', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                    {p.level}
                  </span>
                </div>
              </div>
              <div style={{ padding: '20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2035', margin: '0 0 8px', lineHeight: 1.3 }}>{p.title}</h3>
                <p style={{ color: '#7a8294', fontSize: 13, lineHeight: 1.6, margin: '0 0 14px', flex: 1 }}>{p.description}</p>
                <div style={{ fontSize: 12, color: '#9aa2b4', marginBottom: 14 }}>
                  <span style={{ marginRight: 12 }}>⏱ {p.duration_hours}h total</span>
                  <span>📚 {p.courses?.length || 0} courses</span>
                </div>
                {p.courses?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    {p.courses.slice(0, 3).map((c, i) => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: i < 2 ? '1px solid #f0f2f7' : 'none' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#f0eeff', color: '#6c63ff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
                        <span style={{ fontSize: 12, color: '#5a6480', flex: 1 }}>{c.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={e => handleEnroll(e, p.id)}
                  style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontWeight: 600, cursor: 'pointer', fontSize: 14, width: '100%' }}>
                  Enroll in Pathway
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
