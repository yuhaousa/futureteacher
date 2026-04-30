import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import api from '../api/client';
import CourseCard from '../components/CourseCard';

const CATEGORIES = ['all', 'assessment', 'pedagogy', 'technology', 'wellbeing', 'leadership', 'curriculum', 'special needs'];
const MODALITIES = ['all', 'Self-Paced', 'Blended', 'Video', 'Live Session', 'Microlearning'];

export default function Discover() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [modality, setModality] = useState('all');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category !== 'all') params.set('category', category);
    if (modality !== 'all') params.set('modality', modality);
    api.get(`/courses?${params}`).then(res => {
      setCourses(res.data.courses);
      setTotal(res.data.total);
    }).finally(() => setLoading(false));
  }, [search, category, modality]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a2035', margin: 0 }}>Discover Learning</h1>
        <p style={{ color: '#7a8294', marginTop: 6 }}>Explore courses, resources and learning opportunities</p>
      </div>

      {/* Search bar */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: '#f5f6fa', borderRadius: 8, padding: '10px 16px' }}>
            <Search size={18} color="#9aa2b4" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by topic, skill, or ask a question..."
              style={{ border: 'none', background: 'none', flex: 1, fontSize: 14, color: '#1a2035', outline: 'none' }}
            />
          </div>
          <button style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} /> AI Search
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select value={category} onChange={e => setCategory(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e0e3ea', fontSize: 13, color: '#1a2035', background: '#fff', cursor: 'pointer' }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <select value={modality} onChange={e => setModality(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e0e3ea', fontSize: 13, color: '#1a2035', background: '#fff', cursor: 'pointer' }}>
            {MODALITIES.map(m => <option key={m} value={m}>{m === 'all' ? 'All Modalities' : m}</option>)}
          </select>
        </div>
      </div>

      <p style={{ color: '#7a8294', fontSize: 14, marginBottom: 20 }}>
        {loading ? 'Loading...' : `${total} course${total !== 1 ? 's' : ''} found`}
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Loading courses...</div>
      ) : courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>No courses found. Try a different search.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {courses.map(c => <CourseCard key={c.id} course={c} onClick={() => navigate(`/course/${c.id}`)} />)}
        </div>
      )}
    </div>
  );
}
