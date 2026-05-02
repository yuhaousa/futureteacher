import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, ChevronDown, ChevronUp, Search, BarChart2 } from 'lucide-react';
import api from '../../api/client';

const LEVEL_VALUES = { basic: 1, intermediate: 2, advanced: 3, expert: 4 };

function wrapWords(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const candidate = cur ? cur + ' ' + w : w;
    if (candidate.length > maxChars) { if (cur) lines.push(cur); cur = w; }
    else cur = candidate;
  }
  if (cur) lines.push(cur);
  return lines;
}

function RadarChart({ skills }) {
  if (!skills || skills.length === 0) return <p style={{ textAlign: 'center', color: '#9aa2b4', fontStyle: 'italic' }}>No skills defined.</p>;

  const pad = 110; // padding on each side for labels
  const innerSize = 320;
  const size = innerSize + pad * 2;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = innerSize / 2;
  const levels = 4;
  const n = skills.length;
  const angleStep = (2 * Math.PI) / n;
  const levelColors = { basic: '#2ecc71', intermediate: '#3498db', advanced: '#9b59b6', expert: '#e74c3c' };

  const gridPolys = Array.from({ length: levels }, (_, li) => {
    const r = (maxR / levels) * (li + 1);
    return Array.from({ length: n }, (__, i) => {
      const a = i * angleStep - Math.PI / 2;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');
  });

  const axes = skills.map((_, i) => {
    const a = i * angleStep - Math.PI / 2;
    return { x2: cx + maxR * Math.cos(a), y2: cy + maxR * Math.sin(a) };
  });

  const dataPoints = skills.map((s, i) => {
    const val = LEVEL_VALUES[s.required_level] || 1;
    const r = (maxR / levels) * val;
    const a = i * angleStep - Math.PI / 2;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');

  const labelGap = 18;
  const labels = skills.map((s, i) => {
    const a = i * angleStep - Math.PI / 2;
    const r = maxR + labelGap;
    const x = cx + r * Math.cos(a);
    const baseY = cy + r * Math.sin(a);
    const cosA = Math.cos(a);
    const anchor = Math.abs(cosA) < 0.15 ? 'middle' : cosA > 0 ? 'start' : 'end';
    const lines = wrapWords(s.skill_name, 14);
    // vertical anchor: if pointing up, shift up by line count; if down, no shift
    const sinA = Math.sin(a);
    const lineH = 13;
    const yShift = sinA < -0.15 ? -(lines.length - 1) * lineH : sinA > 0.15 ? 0 : -(lines.length - 1) * lineH / 2;
    return { x, y: baseY + yShift, anchor, lines, level: s.required_level };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', width: '100%', maxWidth: size }}>
      {gridPolys.map((pts, i) => <polygon key={i} points={pts} fill="none" stroke="#e0e3ea" strokeWidth={1} />)}
      {axes.map((a, i) => <line key={i} x1={cx} y1={cy} x2={a.x2} y2={a.y2} stroke="#e0e3ea" strokeWidth={1} />)}
      {Array.from({ length: levels }, (_, li) => {
        const r = (maxR / levels) * (li + 1);
        return <text key={li} x={cx + 4} y={cy - r + 4} fontSize={9} fill="#c0c8dc">{['Basic','Interm.','Advanced','Expert'][li]}</text>;
      })}
      <polygon points={dataPoints} fill="#6c63ff22" stroke="#6c63ff" strokeWidth={2.5} />
      {skills.map((s, i) => {
        const val = LEVEL_VALUES[s.required_level] || 1;
        const r = (maxR / levels) * val;
        const a = i * angleStep - Math.PI / 2;
        return <circle key={i} cx={cx + r * Math.cos(a)} cy={cy + r * Math.sin(a)} r={5} fill={levelColors[s.required_level] || '#6c63ff'} stroke="#fff" strokeWidth={2} />;
      })}
      {labels.map((l, i) => (
        <text key={i} textAnchor={l.anchor} fontSize={11} fontWeight={600} fill="#2d3560">
          {l.lines.map((line, li) => <tspan key={li} x={l.x} y={l.y + li * 13}>{line}</tspan>)}
        </text>
      ))}
    </svg>
  );
}

function SkillRadarModal({ role, onClose }) {
  const levelColors = { basic: '#2ecc71', intermediate: '#3498db', advanced: '#9b59b6', expert: '#e74c3c' };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 720, maxHeight: '92vh', overflowY: 'auto', padding: '28px 32px', boxShadow: '0 8px 40px rgba(108,99,255,0.18)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1a2035' }}>{role.title}</h2>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#9aa2b4' }}>{role.department || ''}{role.department && role.level ? ' · ' : ''}<span style={{ textTransform: 'capitalize' }}>{role.level}</span></p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aa2b4', padding: 4 }}><X size={18} /></button>
        </div>
        <div style={{ marginBottom: 16 }}>
          <RadarChart skills={role.skills} />
        </div>
        {/* legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          {['basic', 'intermediate', 'advanced', 'expert'].map(l => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#5a6480' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: levelColors[l], display: 'inline-block' }} />
              <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{l}</span>
            </div>
          ))}
        </div>
        {/* skill list summary */}
        <div style={{ marginTop: 18, borderTop: '1px solid #f0f2f7', paddingTop: 14 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(role.skills || []).map((s, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f8f9fc', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#5a6480', border: '1px solid #e8eaf0' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: levelColors[s.required_level] || '#9aa2b4', flexShrink: 0 }} />
                {s.skill_name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const LEVELS = ['basic', 'intermediate', 'advanced', 'expert'];
const LEVEL_COLORS = { basic: '#2ecc71', intermediate: '#3498db', advanced: '#9b59b6', expert: '#e74c3c' };
const ROLE_LEVELS = ['entry', 'mid', 'senior', 'lead', 'manager'];

const EMPTY_ROLE = { title: '', description: '', department: '', level: 'entry', skills: [] };
const EMPTY_SKILL = { skill_name: '', category: '', required_level: 'basic', description: '' };

// Flatten all skills from all frameworks into a grouped option list
function buildSkillOptions(frameworks) {
  const groups = [];
  for (const fw of frameworks) {
    if (!fw.skills || fw.skills.length === 0) continue;
    groups.push({ label: fw.name, skills: fw.skills });
  }
  return groups;
}

function SkillRow({ skill, onChange, onRemove, skillGroups }) {
  // When a framework skill is selected, auto-fill category from framework skill
  const handleSelectSkill = (e) => {
    const val = e.target.value;
    if (!val) { onChange({ ...skill, skill_name: '', category: '' }); return; }
    // Find the matching framework skill to auto-fill category
    for (const g of skillGroups) {
      const found = g.skills.find(s => s.name === val);
      if (found) { onChange({ ...skill, skill_name: val, category: found.category || skill.category }); return; }
    }
    onChange({ ...skill, skill_name: val });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 2fr auto', gap: 8, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f2f7' }}>
      <select value={skill.skill_name} onChange={handleSelectSkill}
        style={{ padding: '7px 10px', border: '1.5px solid #e0e3ea', borderRadius: 7, fontSize: 13 }}>
        <option value="">— Select skill from framework —</option>
        {skillGroups.map(g => (
          <optgroup key={g.label} label={g.label}>
            {g.skills.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </optgroup>
        ))}
      </select>
      <select value={skill.required_level} onChange={e => onChange({ ...skill, required_level: e.target.value })}
        style={{ padding: '7px 10px', border: '1.5px solid #e0e3ea', borderRadius: 7, fontSize: 13, color: LEVEL_COLORS[skill.required_level] || '#1a2035', fontWeight: 600 }}>
        {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
      </select>
      <input value={skill.description} onChange={e => onChange({ ...skill, description: e.target.value })}
        placeholder="Notes (optional)" style={{ padding: '7px 10px', border: '1.5px solid #e0e3ea', borderRadius: 7, fontSize: 13 }} />
      <button onClick={onRemove} style={{ background: '#fdeaea', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#e74c3c' }}><X size={13} /></button>
    </div>
  );
}

function RoleModal({ role, onClose, onSave }) {
  const [form, setForm] = useState(role || EMPTY_ROLE);
  const [saving, setSaving] = useState(false);
  const [skillGroups, setSkillGroups] = useState([]);

  useEffect(() => {
    api.get('/skill-frameworks').then(r => setSkillGroups(buildSkillOptions(r.data))).catch(() => {});
  }, []);

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

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2035', margin: 0 }}>Skill Map ({form.skills.length})</h3>
            <button onClick={addSkill}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0eeff', color: '#6c63ff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={13} /> Add Skill
            </button>
          </div>
          {form.skills.length > 0 && (
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9aa2b4', display: 'grid', gridTemplateColumns: '2.5fr 1fr 2fr auto', gap: 8, padding: '0 0 6px', textTransform: 'uppercase' }}>
              <span>Skill (from Framework)</span><span>Required Level</span><span>Notes</span><span></span>
            </div>
          )}
          {form.skills.length === 0
            ? <p style={{ color: '#b0b7c3', fontSize: 13, fontStyle: 'italic' }}>No skills defined yet. Click "Add Skill" to select from your skill frameworks.</p>
            : form.skills.map((s, i) => (
              <SkillRow key={i} skill={s} onChange={sk => updateSkill(i, sk)} onRemove={() => removeSkill(i)} skillGroups={skillGroups} />
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
  const [modal, setModal] = useState(null);
  const [radarRole, setRadarRole] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterDept, setFilterDept] = useState('');

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

  const allDepts = [...new Set(roles.map(r => r.department).filter(Boolean))].sort();

  const filtered = roles.filter(r => {
    if (filterLevel && r.level !== filterLevel) return false;
    if (filterDept && r.department !== filterDept) return false;
    if (search) {
      const s = search.toLowerCase();
      return r.title.toLowerCase().includes(s) ||
        (r.department || '').toLowerCase().includes(s) ||
        (r.description || '').toLowerCase().includes(s);
    }
    return true;
  });

  const sel = { padding: '8px 12px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', color: '#1a2035', cursor: 'pointer' };
  const lbl = { fontSize: 11, fontWeight: 700, color: '#9aa2b4', textTransform: 'uppercase', display: 'block', marginBottom: 5 };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2035', margin: '0 0 4px' }}>Job Roles</h1>
          <p style={{ color: '#7a8294', fontSize: 13, margin: 0 }}>Define job titles, descriptions, and competency skill maps for each role</p>
        </div>
        <button onClick={() => setModal('new')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          <Plus size={16} /> New Job Role
        </button>
      </div>

      {/* Search & filter card */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '16px 20px', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>

          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180, maxWidth: 300 }}>
            <label style={lbl}>Search</label>
            <Search size={14} style={{ position: 'absolute', left: 10, bottom: 9, color: '#9aa2b4', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, department…"
              style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f8f9fc', boxSizing: 'border-box' }}
            />
          </div>

          {/* Level filter */}
          <div>
            <label style={lbl}>Level</label>
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} style={sel}>
              <option value="">All levels</option>
              {ROLE_LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
            </select>
          </div>

          {/* Department filter */}
          <div>
            <label style={lbl}>Department</label>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={sel}>
              <option value="">All departments</option>
              {allDepts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Clear + count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            {(search || filterLevel || filterDept) && (
              <button onClick={() => { setSearch(''); setFilterLevel(''); setFilterDept(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fdeaea', color: '#e74c3c', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <X size={12} /> Clear filters
              </button>
            )}
            <span style={{ fontSize: 13, color: '#9aa2b4', whiteSpace: 'nowrap' }}>
              {filtered.length} role{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
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
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8f9fc' }}>
              <tr>
                {['Job Title', 'Department', 'Career Level', 'Skills', 'Description', ''].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 3 ? 'center' : 'left', padding: '12px 16px', fontSize: 12, color: '#9aa2b4', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#aaa', fontSize: 14 }}>No roles match the current filters.</td></tr>
              ) : filtered.map(role => (<>
                <tr key={role.id} style={{ borderBottom: expanded[role.id] ? 'none' : '1px solid #f0f2f7', cursor: 'pointer' }} onClick={() => toggle(role.id)}>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#1a2035', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {expanded[role.id] ? <ChevronUp size={14} color="#9aa2b4" /> : <ChevronDown size={14} color="#9aa2b4" />}
                      {role.title}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {role.department
                      ? <span style={{ background: '#f0f2f7', color: '#5a6480', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{role.department}</span>
                      : <span style={{ color: '#c0c8dc', fontSize: 13 }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: '#f0eeff', color: '#6c63ff', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{role.level}</span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    {(role.skills?.length || 0) > 0
                      ? <span style={{ background: '#e8f5e9', color: '#2ecc71', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>{role.skills.length}</span>
                      : <span style={{ color: '#c0c8dc', fontSize: 13 }}>0</span>}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#7a8294', maxWidth: 300 }}>
                    {role.description
                      ? <span>{role.description.slice(0, 100)}{role.description.length > 100 ? '…' : ''}</span>
                      : <span style={{ color: '#c0c8dc' }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => setRadarRole(role)} title="Skill Radar Chart"
                        style={{ background: '#e8f5e9', color: '#27ae60', border: 'none', borderRadius: 7, padding: '7px 10px', cursor: 'pointer' }}><BarChart2 size={14} /></button>
                      <button onClick={() => setModal(role)}
                        style={{ background: '#f0eeff', color: '#6c63ff', border: 'none', borderRadius: 7, padding: '7px 10px', cursor: 'pointer' }}><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(role.id)}
                        style={{ background: '#fdeaea', color: '#e74c3c', border: 'none', borderRadius: 7, padding: '7px 10px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
                {expanded[role.id] && (
                  <tr key={`${role.id}-skills`} style={{ borderBottom: '1px solid #f0f2f7' }}>
                    <td colSpan={6} style={{ padding: '0 16px 16px 44px', background: '#fafbff' }}>
                      {role.skills?.length === 0 ? (
                        <p style={{ color: '#b0b7c3', fontSize: 13, fontStyle: 'italic', margin: '12px 0 0' }}>No skills defined for this role.</p>
                      ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
                          <thead>
                            <tr>
                              {['Skill', 'Category', 'Required Level', 'Description'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '6px 12px', fontSize: 11, color: '#9aa2b4', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #e8eaf0' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {role.skills.map((s, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #f0f2f7' }}>
                                <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600, color: '#1a2035' }}>{s.skill_name}</td>
                                <td style={{ padding: '8px 12px' }}>
                                  {s.category
                                    ? <span style={{ background: '#f0f2f7', color: '#5a6480', borderRadius: 20, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>{s.category}</span>
                                    : <span style={{ color: '#c0c8dc' }}>—</span>}
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: LEVEL_COLORS[s.required_level] || '#5a6480', textTransform: 'capitalize',
                                    background: `${LEVEL_COLORS[s.required_level]}18`, borderRadius: 20, padding: '2px 8px' }}>{s.required_level}</span>
                                </td>
                                <td style={{ padding: '8px 12px', fontSize: 13, color: '#7a8294' }}>{s.description || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </td>
                  </tr>
                )}
              </>))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <RoleModal
          role={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {radarRole && (
        <SkillRadarModal role={radarRole} onClose={() => setRadarRole(null)} />
      )}
    </div>
  );
}
