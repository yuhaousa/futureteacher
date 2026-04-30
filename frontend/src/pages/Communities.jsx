import { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Communities() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/communities').then(res => setCommunities(res.data)).finally(() => setLoading(false));
  }, []);

  const selectCommunity = async (id) => {
    const res = await api.get(`/communities/${id}`);
    setSelected(res.data);
    setPosts(res.data.posts || []);
  };

  const handleJoin = async (id) => {
    try {
      await api.post(`/communities/${id}/join`);
      setCommunities(prev => prev.map(c => c.id === id ? { ...c, member_count: c.member_count + 1 } : c));
    } catch (e) { if (e.response?.status !== 409) alert('Error joining community'); }
  };

  const handlePost = async () => {
    if (!newPost.trim() || !selected) return;
    const res = await api.post(`/communities/${selected.id}/posts`, { content: newPost });
    setPosts(prev => [{ ...res.data, replies: [] }, ...prev]);
    setNewPost('');
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a2035', margin: 0 }}>Communities</h1>
        <p style={{ color: '#7a8294', marginTop: 6 }}>Connect and learn with fellow educators</p>
      </div>

      {/* 4-column community grid */}
      {loading ? <div style={{ color: '#aaa', padding: 20 }}>Loading...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
          {communities.map(c => (
            <div key={c.id}
              onClick={() => selectCommunity(c.id)}
              style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', border: selected?.id === c.id ? '2px solid #6c63ff' : '2px solid transparent', transition: 'all 0.15s' }}
              onMouseEnter={e => { if (selected?.id !== c.id) e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { if (selected?.id !== c.id) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}>
              <div style={{ height: 120, background: '#f0eeff', overflow: 'hidden' }}>
                {c.image_url
                  ? <img src={c.image_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>👥</div>}
              </div>
              <div style={{ padding: '14px 16px' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2035', margin: '0 0 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</h3>
                <p style={{ fontSize: 12, color: '#7a8294', margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#9aa2b4' }}>👥 {c.member_count}</span>
                  <button
                    onClick={e => { e.stopPropagation(); handleJoin(c.id); }}
                    style={{ background: '#f0eeff', color: '#6c63ff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Join
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Community detail panel */}
      {selected && (
          <div>
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2035', margin: '0 0 8px' }}>{selected.name}</h2>
              <p style={{ color: '#7a8294', margin: '0 0 16px', fontSize: 14 }}>{selected.description}</p>
              <textarea
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="Share something with the community..."
                style={{ width: '100%', border: '1px solid #e0e3ea', borderRadius: 8, padding: 12, fontSize: 14, resize: 'vertical', minHeight: 72, outline: 'none', boxSizing: 'border-box' }}
              />
              <button onClick={handlePost} style={{ marginTop: 10, background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                Post
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {posts.map(p => (
                <div key={p.id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#6c63ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{p.user_name?.[0]}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#1a2035' }}>{p.user_name}</div>
                      <div style={{ fontSize: 12, color: '#9aa2b4' }}>{new Date(p.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <p style={{ margin: 0, color: '#3a4260', fontSize: 14, lineHeight: 1.6 }}>{p.content}</p>
                  {p.replies?.map(r => (
                    <div key={r.id} style={{ marginTop: 10, padding: '10px 14px', background: '#f8f9fc', borderRadius: 8, borderLeft: '3px solid #6c63ff' }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{r.user_name}: </span>
                      <span style={{ fontSize: 13, color: '#5a6480' }}>{r.content}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
