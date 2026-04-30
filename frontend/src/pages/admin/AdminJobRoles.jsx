import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../api/client';

const LEVELS = ['basic', 'intermediate', 'advanced', 'expert'];
const LEVEL_COLORS = { basic: '#2ecc71', intermediate: '#3498db', advanced: '#9b59b6', expert: '#e74c3c' };
const CATEGORIES = ['Pedagogy', 'Technology', 'Leadership', 'Communication', 'Assessment', 'Curriculum', 'Administration', 'Other'];
const ROLE_LEVELS = ['entry', 'mid', 'senior', 'lead', 'manager'];

const EMPTY_ROLE = { title: '', description: '', department: '', level: 'entry', skills: [] };
const EMPTY_SKILL = { skill_name: '', category: '', required_level: 'basic', description: '' };

function SkillRow({ skill, onChange, onRemove }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 2fr auto', gap: 8, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f2f7' }}>
      <input value={skill.skill_name} onChange={e => onChange({ ...skill, skill_name: e.target.value })}
        placeholder="Skill name" style={{ padding: '7px 10px', border: '1.5px solid #e0e3ea', borderRadius: 7, fontSize: 13 }} />
      <select value={skill.category} onChange={e => onChange({ ...skill, category: e.target.value })}
        style={{ padding: '7px 10px', border: '1.5px solid #e0e3ea', borderRadius: 7, fontSize: 13 }}>
        <option value="">Category</option>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={skill.required_level} onChange={e => onChange({ ...skill, required_level: e.target.value })}
        style={{ padding: '7px 10px', border: '1.5px solid #e0e3ea', borderRadius: 7, fontSize: 13, color: LEVEL_COLORS[skill.required_level] || '#1a2035', fontWeight: 600 }}>
        {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
      </select>
      <input value={skill.description} onChange={e => onChange({ ...skill, description: e.target.value })}
        placeholder="Description (optional)" style={{ padding: '7px 10px', border: '1.5px solid #e0e3ea', borderRadius: 7, fontSize: 13 }} />
      <button onClick={onRemove} style={{ background: '#fdeaea', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#e74c3c' }}><X size={13} /></button>
    </div>
  );
}

function RoleModal({ role, onClose, onSave }) {
  const [form, setForm] = useState(role || EMPTY_ROLE);
  const [saving, setSaving] = useState(false);

  const addSkill = () => setForm(f => ({ ...f, skills: [...f.skills, { ...EMPTY_SKILL }] }));
  const updateSkill = (i, s) => setForm(f => ({ ...f, skills: f.skills.map((sk, idx) => idx === i ? s : sk) }));
  const removeSkill = (i) => setForm(f => ({ ...f, skills: f.skills.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      let res;
      if (form.id) {
        res = await api.put(`/job-roles/${form.id}`, form);
      } else {
        res = await api.post('/job-roles', form);
      }
      onSave(res.data);
    } finally {
      setSaving(false);
    }
  };

  const inp = { padding: '9px 12px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2035', margin: 0 }}>{form.id ? 'Edit Job Role' : 'New Job Role'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aa2b4' }}><X size={20} /></button>
        </div>

        {/* Role details */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 5 }}>Job Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Senior Teacher" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 5 }}>Department</label>
            <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Science" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 5 }}>Career Level</label>
            <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} style={inp}>
              {ROLE_LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 5 }}>Job Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3} placeholder="Describe the role responsibilities and expectations…"
            style={{ ...inp, resize: 'vertical' }} />
        </div>

        {/* Skill map */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2035', margin: 0 }}>Skill Map ({form.skills.length})</h3>
            <button onClick={addSkill}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0eeff', color: '#6c63ff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={13} /> Add Skill
            </button>
          </div>
          {form.skills.length > 0 && (
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9aa2b4', display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 2fr auto', gap: 8, padding: '0 0 6px', textTransform: 'uppercase' }}>
              <span>Skill</span><span>Category</span><span>Level</span><span>Description</span><span></span>
            </div>
          )}
          {form.skills.length === 0
            ? <p style={{ color: '#b0b7c3', fontSize: 13, fontStyle: 'italic' }}>No skills defined yet. Click "Add Skill" to build the skill map.</p>
            : form.skills.map((s, i) => (
              <SkillRow key={i} skill={s} onChange={sk => updateSkill(i, sk)} onRemove={() => removeSkill(i)} />
            ))
          }
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '10px 22px', border: '1.5px solid #e0e3ea', borderRadius: 9, background: '#fff', color: '#5a6480', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.title.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, cursor: 'pointer', fontSize: 14, opacity: (saving || !form.title.trim()) ? 0.7 : 1 }}>
            <Save size={14} /> {saving ? 'Saving…' : 'Save Role'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminJobRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | role object
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    api.get('/job-roles').then(r => setRoles(r.data)).finally(() => setLoading(false));
  }, []);

  const handleSave = (saved) => {
    setRoles(prev => {
      const idx = prev.findIndex(r => r.id === saved.id);
      return idx >= 0 ? prev.map(r => r.id === saved.id ? saved : r) : [...prev, saved];
    });
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this job role and all its skills?')) return;
    await api.delete(`/job-roles/${id}`);
    setRoles(prev => prev.filter(r => r.id !== id));
  };

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2035', margin: '0 0 4px' }}>Job Roles</h1>
          <p style={{ color: '#7a8294', fontSize: 13, margin: 0 }}>Define job titles, descriptions, and competency skill maps for each role</p>
        </div>
        <button onClick={() => setModal('new')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          <Plus size={16} /> New Job Role
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Loading…</div>
      ) : roles.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 60, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#1a2035', margin: '0 0 8px' }}>No job roles yet</p>
          <p style={{ color: '#7a8294', fontSize: 14 }}>Create your first job role to define competency requirements.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {roles.map(role => (
            <div key={role.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              {/* Role header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', cursor: 'pointer' }} onClick={() => toggle(role.id)}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#1a2035' }}>{role.title}</span>
                    {role.department && <span style={{ fontSize: 12, background: '#f0f2f7', color: '#5a6480', borderRadius: 20, padding: '2px 10px', fontWeight: 600 }}>{role.department}</span>}
                    <span style={{ fontSize: 12, background: '#f0eeff', color: '#6c63ff', borderRadius: 20, padding: '2px 10px', fontWeight: 600, textTransform: 'capitalize' }}>{role.level}</span>
                    <span style={{ fontSize: 12, color: '#9aa2b4' }}>{role.skills?.length || 0} skills</span>
                  </div>
                  {role.description && <p style={{ fontSize: 13, color: '#7a8294', margin: '4px 0 0', lineHeight: 1.5 }}>{role.description.slice(0, 120)}{role.description.length > 120 ? '…' : ''}</p>}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={e => { e.stopPropagation(); setModal(role); }}
                    style={{ background: '#f0eeff', color: '#6c63ff', border: 'none', borderRadius: 7, padding: '7px 10px', cursor: 'pointer' }}><Pencil size={14} /></button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(role.id); }}
                    style={{ background: '#fdeaea', color: '#e74c3c', border: 'none', borderRadius: 7, padding: '7px 10px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  {expanded[role.id] ? <ChevronUp size={18} color="#9aa2b4" /> : <ChevronDown size={18} color="#9aa2b4" />}
                </div>
              </div>

              {/* Expanded skill map */}
              {expanded[role.id] && role.skills?.length > 0 && (
                <div style={{ borderTop: '1px solid #f0f2f7', padding: '16px 22px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#9aa2b4', display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 2fr', gap: 12, padding: '0 0 8px', textTransform: 'uppercase' }}>
                    <span>Skill</span><span>Category</span><span>Required Level</span><span>Description</span>
                  </div>
                  {role.skills.map((s, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 2fr', gap: 12, padding: '9px 0', borderTop: '1px solid #f8f9fc', alignItems: 'start' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1a2035' }}>{s.skill_name}</span>
                      <span style={{ fontSize: 13, color: '#7a8294' }}>{s.category || '—'}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: LEVEL_COLORS[s.required_level] || '#5a6480', textTransform: 'capitalize' }}>{s.required_level}</span>
                      <span style={{ fontSize: 13, color: '#7a8294' }}>{s.description || '—'}</span>
                    </div>
                  ))}
                </div>
              )}
              {expanded[role.id] && role.skills?.length === 0 && (
                <div style={{ borderTop: '1px solid #f0f2f7', padding: '16px 22px', color: '#b0b7c3', fontSize: 13, fontStyle: 'italic' }}>No skills defined for this role.</div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <RoleModal
          role={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
