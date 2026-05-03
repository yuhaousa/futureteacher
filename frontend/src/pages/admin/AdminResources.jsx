import { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import { Plus, Pencil, Trash2, X, Upload, ExternalLink, FileText, Video, Image, FileSpreadsheet, Presentation, Link, Brain, Tag, Search, Filter } from 'lucide-react';

const FILE_TYPES = ['pdf', 'video', 'ppt', 'doc', 'xls', 'image', 'link'];
const CATEGORIES = ['pedagogy', 'assessment', 'technology', 'wellbeing', 'leadership', 'curriculum', 'special needs'];
const AUDIENCES  = ['all', 'primary', 'secondary', 'ite'];

const TYPE_META = {
  pdf:   { label: 'PDF',        icon: FileText,       color: '#e74c3c', bg: '#fdeaea' },
  video: { label: 'Video',      icon: Video,          color: '#3498db', bg: '#e8f4fd' },
  ppt:   { label: 'PowerPoint', icon: Presentation,   color: '#e67e22', bg: '#fef0e6' },
  doc:   { label: 'Word Doc',   icon: FileText,       color: '#2980b9', bg: '#e6f2fb' },
  xls:   { label: 'Spreadsheet',icon: FileSpreadsheet,color: '#27ae60', bg: '#e8fdf0' },
  image: { label: 'Image',      icon: Image,          color: '#9b59b6', bg: '#f4eefb' },
  link:  { label: 'Link',       icon: Link,           color: '#7f8c8d', bg: '#f0f2f5' },
};

// Fallback icons for missing lucide exports
function TypeIcon({ type, size = 16 }) {
  const m = TYPE_META[type] || TYPE_META.pdf;
  const Icon = m.icon;
  return <Icon size={size} color={m.color} />;
}

const EMPTY = {
  title: '', description: '', file_url: '', file_type: 'pdf', file_name: '', file_size: 0,
  category: '', subject_area: '', target_audience: 'all',
  tags: [], ai_context: '', is_ai_source: false,
};

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');
  const add = () => {
    const t = input.trim().toLowerCase();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput('');
  };
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
        {tags.map(t => (
          <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f0eeff', color: '#6c63ff', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            {t}
            <button onClick={() => onChange(tags.filter(x => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: '#6c63ff' }}><X size={10} /></button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="Type a tag and press Enter…"
          style={{ flex: 1, padding: '7px 10px', border: '1.5px solid #e0e3ea', borderRadius: 7, fontSize: 13 }} />
        <button type="button" onClick={add}
          style={{ padding: '7px 12px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 13 }}>Add</button>
      </div>
    </div>
  );
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | resource
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterAI, setFilterAI] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '200' });
    if (search) params.set('search', search);
    if (filterType) params.set('type', filterType);
    if (filterCat) params.set('category', filterCat);
    if (filterAI) params.set('ai_source', '1');
    const r = await api.get(`/library?${params}`);
    setResources(r.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [search, filterType, filterCat, filterAI]);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (r) => { setForm({ ...EMPTY, ...r, is_ai_source: !!r.is_ai_source }); setModal(r); };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(`Uploading ${file.name}…`);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await api.post('/upload/resource', fd);
      setForm(f => ({ ...f, file_url: r.data.url, file_type: r.data.file_type, file_name: r.data.file_name, file_size: r.data.file_size }));
      setUploadProgress('');
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { alert('Title is required'); return; }
    if (form.file_type !== 'link' && !form.file_url) { alert('Please upload a file or enter a URL'); return; }
    setSaving(true);
    const payload = { ...form, is_ai_source: form.is_ai_source ? 1 : 0 };
    try {
      if (modal === 'create') {
        const r = await api.post('/library', payload);
        setResources(prev => [r.data, ...prev]);
      } else {
        const r = await api.put(`/library/${modal.id}`, payload);
        setResources(prev => prev.map(x => x.id === modal.id ? r.data : x));
      }
      setModal(null);
    } catch (e) { alert(e.response?.data?.error || 'Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return;
    await api.delete(`/library/${id}`);
    setResources(prev => prev.filter(r => r.id !== id));
  };

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  const ACCEPT = '.pdf,.mp4,.webm,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2035', margin: 0 }}>Resource Library</h1>
          <p style={{ color: '#7a8294', marginTop: 4, fontSize: 13 }}>
            {resources.length} resource{resources.length !== 1 ? 's' : ''} — upload PDFs, videos, slides, and links for teaching &amp; AI context
          </p>
        </div>
        <button onClick={openCreate}
          style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Resource
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #e0e3ea', borderRadius: 9, padding: '8px 14px', flex: 1, minWidth: 200 }}>
          <Search size={15} color="#9aa2b4" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources…"
            style={{ border: 'none', outline: 'none', fontSize: 14, flex: 1, color: '#1a2035' }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          style={{ padding: '8px 12px', border: '1.5px solid #e0e3ea', borderRadius: 9, fontSize: 13, background: '#fff', color: '#5a6480' }}>
          <option value="">All Types</option>
          {FILE_TYPES.map(t => <option key={t} value={t}>{TYPE_META[t]?.label || t}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          style={{ padding: '8px 12px', border: '1.5px solid #e0e3ea', borderRadius: 9, fontSize: 13, background: '#fff', color: '#5a6480' }}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <button onClick={() => setFilterAI(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: `1.5px solid ${filterAI ? '#6c63ff' : '#e0e3ea'}`, borderRadius: 9, fontSize: 13, background: filterAI ? '#f0eeff' : '#fff', color: filterAI ? '#6c63ff' : '#5a6480', cursor: 'pointer', fontWeight: filterAI ? 700 : 400 }}>
          <Brain size={14} /> AI Sources Only
        </button>
      </div>

      {/* Resource grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9aa2b4' }}>Loading…</div>
      ) : resources.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9aa2b4' }}>
          <FileText size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600 }}>No resources found</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Upload your first resource to get started</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {resources.map(r => {
            const meta = TYPE_META[r.file_type] || TYPE_META.pdf;
            return (
              <div key={r.id} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Type header */}
                <div style={{ background: meta.bg, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f0f2f7' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: meta.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TypeIcon type={r.file_type} size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1a2035', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: meta.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>{meta.label}{r.file_size ? ` · ${formatSize(r.file_size)}` : ''}</div>
                  </div>
                  {r.is_ai_source ? (
                    <span title="Available as AI source" style={{ background: '#f0eeff', color: '#6c63ff', padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><Brain size={10} /> AI</span>
                  ) : null}
                </div>

                {/* Body */}
                <div style={{ padding: '14px 18px', flex: 1 }}>
                  {r.description && <p style={{ color: '#5a6480', fontSize: 13, margin: '0 0 10px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.description}</p>}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                    {r.category && <span style={{ background: '#f0eeff', color: '#6c63ff', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{r.category}</span>}
                    {r.target_audience && r.target_audience !== 'all' && <span style={{ background: '#e8fdf0', color: '#27ae60', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{r.target_audience}</span>}
                  </div>
                  {r.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {r.tags.map(t => <span key={t} style={{ background: '#f5f6fa', color: '#7a8294', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>#{t}</span>)}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ padding: '10px 18px', borderTop: '1px solid #f0f2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#b0b7c3' }}>{r.uploader_name || 'Admin'}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {r.file_url && (
                      <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                        style={{ background: '#e8f4fd', color: '#3498db', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ExternalLink size={13} />
                      </a>
                    )}
                    <button onClick={() => openEdit(r)} style={{ background: '#f0eeff', color: '#6c63ff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}><Pencil size={13} /></button>
                    <button onClick={() => handleDelete(r.id)} style={{ background: '#fdeaea', color: '#e74c3c', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 600, maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2035', margin: 0 }}>{modal === 'create' ? 'Add Resource' : 'Edit Resource'}</h2>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#9aa2b4" /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Title */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} placeholder="e.g. Formative Assessment Toolkit" />
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} placeholder="Brief description of what this resource covers…" />
              </div>

              {/* File Type */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Resource Type</label>
                <select value={form.file_type} onChange={e => setForm(f => ({ ...f, file_type: e.target.value }))} style={inputStyle}>
                  {FILE_TYPES.map(t => <option key={t} value={t}>{TYPE_META[t]?.label || t}</option>)}
                </select>
              </div>

              {/* File upload or Link URL */}
              {form.file_type === 'link' ? (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>URL *</label>
                  <input type="url" value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))}
                    style={inputStyle} placeholder="https://example.com/resource" />
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 8 }}>File</label>
                  <input ref={fileRef} type="file" accept={ACCEPT} style={{ display: 'none' }} onChange={handleFileUpload} />
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', border: '2px dashed #6c63ff', borderRadius: 10, background: '#f8f7ff', color: '#6c63ff', fontWeight: 600, fontSize: 14, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
                    <Upload size={16} /> {uploading ? uploadProgress : form.file_name ? `✓ ${form.file_name}` : 'Click to upload file'}
                  </button>
                  {form.file_url && !form.file_name && (
                    <input type="text" value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))}
                      style={{ ...inputStyle, marginTop: 8, fontSize: 12 }} placeholder="Or paste file URL" />
                  )}
                  {form.file_size > 0 && <div style={{ fontSize: 12, color: '#9aa2b4', marginTop: 4 }}>{formatSize(form.file_size)}</div>}
                </div>
              )}

              {/* Category & Audience */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                    <option value="">— Select —</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Target Audience</label>
                  <select value={form.target_audience} onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))} style={inputStyle}>
                    {AUDIENCES.map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              {/* Subject Area */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 5 }}>Subject Area</label>
                <input value={form.subject_area} onChange={e => setForm(f => ({ ...f, subject_area: e.target.value }))}
                  style={inputStyle} placeholder="e.g. Mathematics, English, Science…" />
              </div>

              {/* Tags */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#3a4260', display: 'block', marginBottom: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Tag size={13} /> Tags</span>
                </label>
                <TagInput tags={form.tags} onChange={tags => setForm(f => ({ ...f, tags }))} />
              </div>

              {/* AI Context */}
              <div style={{ border: '1.5px solid #d4d0ff', borderRadius: 10, padding: 16, background: '#faf9ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#6c63ff', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Brain size={14} /> AI Context
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#5a6480' }}>
                    <input type="checkbox" checked={form.is_ai_source} onChange={e => setForm(f => ({ ...f, is_ai_source: e.target.checked }))} style={{ accentColor: '#6c63ff' }} />
                    Use as AI knowledge source
                  </label>
                </div>
                <textarea value={form.ai_context} onChange={e => setForm(f => ({ ...f, ai_context: e.target.value }))}
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical', background: '#fff' }}
                  placeholder="Describe the key content of this resource so the AI can reference it when giving feedback and recommendations…" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={{ padding: '10px 20px', border: '1.5px solid #e0e3ea', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#5a6480' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving}
                style={{ padding: '10px 24px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : modal === 'create' ? 'Add Resource' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
