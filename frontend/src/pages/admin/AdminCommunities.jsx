import { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';

const EMPTY = { name: '', description: '', category: 'pedagogy', image_url: '' };

export default function AdminCommunities() {
  const [communities, setCommunities] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => { api.get('/communities').then(r => setCommunities(r.data)); }, []);

  const openCreate = () => { setForm(EMPTY); setImagePreview(''); setModal('create'); };
  const openEdit = (c) => { setForm(c); setImagePreview(c.image_url || ''); setModal(c); };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await api.post('/upload', fd);
      setForm(f => ({ ...f, image_url: r.data.url }));
      setImagePreview(r.data.url);
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
      setImagePreview(form.image_url || '');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'create') {
        const r = await api.post('/communities', form);
        const updated = await api.get('/communities');
        setCommunities(updated.data);
      } else {
        await api.put(`/communities/${modal.id}`, form);
        setCommunities(prev => prev.map(c => c.id === modal.id ? { ...c, ...form } : c));
      }
      setModal(null);
    } catch (e) { alert(e.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete community?')) return;
    await api.delete(`/communities/${id}`);
    setCommunities(prev => prev.filter(c => c.id !== id));
  };

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2035', margin: 0 }}>Communities</h1>
        <button onClick={openCreate} style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Community
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {communities.map(c => (
          <div key={c.id} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {c.image_url && <img src={c.image_url} alt={c.name} style={{ width: '100%', height: 100, objectFit: 'cover' }} />}
            <div style={{ padding: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2035', margin: '0 0 4px' }}>{c.name}</h3>
              <p style={{ fontSize: 12, color: '#7a8294', margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>
              <p style={{ fontSize: 12, color: '#9aa2b4', margin: '0 0 10px' }}>👥 {c.member_count} members · {c.category}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(c)} style={{ flex: 1, background: '#f0eeff', color: '#6c63ff', border: 'none', borderRadius: 6, padding: '7px', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Pencil size={13} /> Edit</button>
                <button onClick={() => handleDelete(c.id)} style={{ background: '#fdeaea', color: '#e74c3c', border: 'none', borderRadius: 6, padding: '7px 10px', cursor: 'pointer' }}><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 32, width: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2035', margin: 0 }}>{modal === 'create' ? 'Add Community' : 'Edit Community'}</h2>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#9aa2b4" /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Cover Photo</label>
                {imagePreview && (
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />
                    <button type="button" onClick={() => { setImagePreview(''); setForm(f => ({ ...f, image_url: '' })); }}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                      <X size={13} />
                    </button>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 12px', border: '1.5px dashed #6c63ff', borderRadius: 8, background: '#f5f4ff', color: '#6c63ff', fontWeight: 600, fontSize: 13, cursor: 'pointer', opacity: uploading ? 0.6 : 1 }}>
                    <Upload size={15} /> {uploading ? 'Uploading…' : 'Upload Image'}
                  </button>
                  <input value={form.image_url} onChange={e => { setForm(f => ({ ...f, image_url: e.target.value })); setImagePreview(e.target.value); }}
                    placeholder="or paste URL" style={{ ...inputStyle, flex: 2 }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                  {['assessment', 'pedagogy', 'technology', 'wellbeing', 'leadership', 'curriculum', 'special needs'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={{ padding: '10px 20px', border: '1.5px solid #e0e3ea', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#5a6480' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
