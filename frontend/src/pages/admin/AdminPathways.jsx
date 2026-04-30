import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const EMPTY = { title: '', description: '', category: 'pedagogy', level: 'beginner', duration_hours: 10, image_url: '', course_ids: [] };

export default function AdminPathways() {
  const [pathways, setPathways] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/pathways').then(r => setPathways(r.data));
    api.get('/courses?limit=100').then(r => setAllCourses(r.data.courses));
  }, []);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (p) => { setForm({ ...p, course_ids: p.courses?.map(c => c.id) || [] }); setModal(p); };

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, duration_hours: Number(form.duration_hours) };
    try {
      if (modal === 'create') {
        const r = await api.post('/pathways', payload);
        const updated = await api.get('/pathways');
        setPathways(updated.data);
      } else {
        await api.put(`/pathways/${modal.id}`, payload);
        const updated = await api.get('/pathways');
        setPathways(updated.data);
      }
      setModal(null);
    } catch (e) { alert(e.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete pathway?')) return;
    await api.delete(`/pathways/${id}`);
    setPathways(prev => prev.filter(p => p.id !== id));
  };

  const toggleCourse = (cid) => {
    setForm(f => ({ ...f, course_ids: f.course_ids.includes(cid) ? f.course_ids.filter(id => id !== cid) : [...f.course_ids, cid] }));
  };

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2035', margin: 0 }}>Learning Pathways</h1>
        <button onClick={openCreate} style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Pathway
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {pathways.map(p => (
          <div key={p.id} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {p.image_url && <img src={p.image_url} alt={p.title} style={{ width: '100%', height: 100, objectFit: 'cover' }} />}
            <div style={{ padding: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2035', margin: '0 0 6px' }}>{p.title}</h3>
              <p style={{ fontSize: 12, color: '#7a8294', margin: '0 0 8px' }}>{p.courses?.length || 0} courses · {p.duration_hours}h · {p.level}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(p)} style={{ flex: 1, background: '#f0eeff', color: '#6c63ff', border: 'none', borderRadius: 6, padding: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}><Pencil size={13} /> Edit</button>
                <button onClick={() => handleDelete(p.id)} style={{ background: '#fdeaea', color: '#e74c3c', border: 'none', borderRadius: 6, padding: '7px 10px', cursor: 'pointer' }}><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 32, width: 540, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2035', margin: 0 }}>{modal === 'create' ? 'Add Pathway' : 'Edit Pathway'}</h2>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#9aa2b4" /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[{ label: 'Title', field: 'title' }, { label: 'Image URL', field: 'image_url' }].map(({ label, field }) => (
                <div key={field}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>{label}</label>
                  <input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Category', field: 'category', options: ['assessment', 'pedagogy', 'technology', 'wellbeing', 'leadership', 'curriculum'] },
                  { label: 'Level', field: 'level', options: ['beginner', 'intermediate', 'advanced'] },
                ].map(({ label, field, options }) => (
                  <div key={field}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>{label}</label>
                    <select value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} style={inputStyle}>
                      {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Hours</label>
                  <input type="number" value={form.duration_hours} onChange={e => setForm(f => ({ ...f, duration_hours: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 8 }}>Courses in Pathway</label>
                <div style={{ maxHeight: 200, overflowY: 'auto', border: '1.5px solid #e0e3ea', borderRadius: 8, padding: 8 }}>
                  {allCourses.map(c => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.course_ids.includes(c.id)} onChange={() => toggleCourse(c.id)} />
                      <span style={{ fontSize: 13, color: '#3a4260' }}>{c.title}</span>
                    </label>
                  ))}
                </div>
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
