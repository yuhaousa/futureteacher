import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { Plus, Pencil, Trash2, X, Upload, Link, BookOpen } from 'lucide-react';

const EMPTY = { title: '', description: '', category: 'assessment', modality: 'Self-Paced', level: 'beginner', duration_hours: 1, image_url: '', status: 'published', competency_tags: '', modules: [], start_time: '', end_time: '', meeting_url: '', max_seats: '', location: '' };

export default function AdminCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null); // null | 'create' | course object
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/courses?limit=100').then(r => setCourses(r.data.courses));
    api.get('/users').then(r => setUsers(r.data));
  }, []);

  const openCreate = () => { setForm(EMPTY); setImagePreview(''); setModal('create'); };
  const openEdit = (c) => {
    setForm({
      ...EMPTY, ...c,
      competency_tags: Array.isArray(c.competency_tags) ? c.competency_tags.join(', ') : '',
      start_time: c.start_time || '',
      end_time: c.end_time || '',
      meeting_url: c.meeting_url || '',
      max_seats: c.max_seats || '',
      location: c.location || '',
    });
    setImagePreview(c.image_url || '');
    setModal(c);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    // Upload to Worker / R2
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
    const payload = {
      ...form,
      duration_hours: Number(form.duration_hours),
      max_seats: form.max_seats ? Number(form.max_seats) : null,
      competency_tags: form.competency_tags ? form.competency_tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };
    try {
      if (modal === 'create') {
        const r = await api.post('/courses', payload);
        setCourses(prev => [r.data, ...prev]);
      } else {
        const r = await api.put(`/courses/${modal.id}`, payload);
        setCourses(prev => prev.map(c => c.id === modal.id ? r.data : c));
      }
      setModal(null);
    } catch (e) { alert(e.response?.data?.error || 'Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    await api.delete(`/courses/${id}`);
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2035', margin: 0 }}>Courses</h1>
          <p style={{ color: '#7a8294', marginTop: 4, fontSize: 13 }}>{courses.length} courses total</p>
        </div>
        <button onClick={openCreate}
          style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Course
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8f9fc' }}>
            <tr>{['Title', 'Category', 'Modality', 'Level', 'Enrolled', 'Rating', 'Status', ''].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#9aa2b4', fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f0f2f7' }}>
                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#1a2035', maxWidth: 260 }}>
                  <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.title}</div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13 }}><span style={{ background: '#f0eeff', color: '#6c63ff', padding: '3px 8px', borderRadius: 20, fontSize: 12 }}>{c.category}</span></td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#5a6480' }}>{c.modality}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#5a6480' }}>{c.level}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#5a6480' }}>{c.enrolled_count}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#f5a623', fontWeight: 600 }}>★ {c.rating}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ background: c.status === 'published' ? '#e8fdf0' : '#f0f0f5', color: c.status === 'published' ? '#2ecc71' : '#aaa', padding: '3px 8px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {c.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => navigate(`/admin/courseware/${c.id}`)} title="Manage Courseware" style={{ background: '#e8f5e9', color: '#27ae60', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}><BookOpen size={14} /></button>
                    <button onClick={() => openEdit(c)} style={{ background: '#f0eeff', color: '#6c63ff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(c.id)} style={{ background: '#fdeaea', color: '#e74c3c', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 32, width: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2035', margin: 0 }}>{modal === 'create' ? 'Add Course' : 'Edit Course'}</h2>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#9aa2b4" /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Title', field: 'title', type: 'text' },
                { label: 'Competency Tags (comma separated)', field: 'competency_tags', type: 'text' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>{label}</label>
                  <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} style={inputStyle} />
                </div>
              ))}

              {/* Cover Photo */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 8 }}>Cover Photo</label>
                {imagePreview && (
                  <div style={{ position: 'relative', marginBottom: 10 }}>
                    <img src={imagePreview} alt="Cover preview"
                      style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #e0e3ea' }} />
                    <button
                      onClick={() => { setImagePreview(''); setForm(f => ({ ...f, image_url: '' })); }}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <X size={14} color="#fff" />
                    </button>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 12px', border: '1.5px dashed #6c63ff', borderRadius: 8, background: '#f5f4ff', color: '#6c63ff', fontWeight: 600, fontSize: 13, cursor: 'pointer', opacity: uploading ? 0.6 : 1 }}>
                    <Upload size={15} /> {uploading ? 'Uploading…' : 'Upload Image'}
                  </button>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <Link size={13} color="#9aa2b4" />
                    <label style={{ fontSize: 12, color: '#9aa2b4', fontWeight: 600 }}>Or paste a URL</label>
                  </div>
                  <input type="text" value={form.image_url} placeholder="https://example.com/image.jpg"
                    onChange={e => { setForm(f => ({ ...f, image_url: e.target.value })); setImagePreview(e.target.value); }}
                    style={{ ...inputStyle, fontSize: 12, color: '#5a6480' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Category', field: 'category', options: ['assessment', 'pedagogy', 'technology', 'wellbeing', 'leadership', 'curriculum', 'special needs'] },
                  { label: 'Modality', field: 'modality', options: ['Self-Paced', 'Blended', 'Video', 'Live Session', 'Microlearning'] },
                  { label: 'Level', field: 'level', options: ['beginner', 'intermediate', 'advanced'] },
                  { label: 'Status', field: 'status', options: ['published', 'draft'] },
                ].map(({ label, field, options }) => (
                  <div key={field}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>{label}</label>
                    <select value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} style={{ ...inputStyle }}>
                      {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Duration (hours)</label>
                <input type="number" min="0" step="0.5" value={form.duration_hours} onChange={e => setForm(f => ({ ...f, duration_hours: e.target.value }))} style={inputStyle} />
              </div>

              {/* ── Modality-specific fields ── */}
              {form.modality === 'Live Session' && (
                <div style={{ background: '#f5f4ff', borderRadius: 10, padding: '16px', border: '1.5px solid #d4d0ff', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#6c63ff', textTransform: 'uppercase', letterSpacing: 0.8 }}>Live Session Details</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Start Time</label>
                      <input type="datetime-local" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>End Time</label>
                      <input type="datetime-local" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Meeting URL</label>
                    <input type="url" value={form.meeting_url} onChange={e => setForm(f => ({ ...f, meeting_url: e.target.value }))} placeholder="https://zoom.us/j/..." style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Max Seats</label>
                    <input type="number" min="1" value={form.max_seats} onChange={e => setForm(f => ({ ...f, max_seats: e.target.value }))} placeholder="e.g. 30" style={inputStyle} />
                  </div>
                </div>
              )}

              {form.modality === 'Blended' && (
                <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '16px', border: '1.5px solid #a7f3c8', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#27ae60', textTransform: 'uppercase', letterSpacing: 0.8 }}>Blended Learning Details</div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Location / Venue</label>
                    <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Room 204, Main Campus" style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Session Start</label>
                      <input type="datetime-local" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Session End</label>
                      <input type="datetime-local" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} style={inputStyle} />
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Instructor</label>
                <select value={form.instructor_id || ''} onChange={e => setForm(f => ({ ...f, instructor_id: e.target.value }))} style={inputStyle}>
                  <option value="">Select instructor</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={{ padding: '10px 20px', border: '1.5px solid #e0e3ea', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#5a6480' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving}
                style={{ padding: '10px 24px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
