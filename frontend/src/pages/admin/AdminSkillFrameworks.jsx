import React, { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Save, ChevronDown, ChevronUp, Layers, Search,
  ToggleLeft, ToggleRight, Download, Upload, Copy, BookOpen, GitBranch,
  Link, Unlink, BookMarked, Route } from 'lucide-react';
import api from '../../api/client';

const CATEGORIES = [
  'Pedagogy', 'Assessment', 'Curriculum', 'Classroom Management',
  'Student Development', 'Technology', 'ICT Integration',
  'Leadership', 'Professional Learning', 'Communication',
  'Community Engagement', 'Administration', 'Other',
];
const LEVEL_COLORS = { basic: '#2ecc71', intermediate: '#3498db', advanced: '#9b59b6', expert: '#e74c3c' };
const LEVELS = ['basic', 'intermediate', 'advanced', 'expert'];

const EMPTY_FRAMEWORK = { name: '', description: '', source_standard: '', version: '', is_active: 1, skills: [] };
const EMPTY_SKILL = { name: '', category: 'Pedagogy', description: '', level_basic: '', level_intermediate: '', level_advanced: '', level_expert: '' };

// ── Pre-built framework templates (Q7: natively supports standard competency frameworks) ──
const FRAMEWORK_TEMPLATES = [
  {
    name: 'Singapore Teaching Practice (STP)',
    source_standard: 'Singapore Teaching Practice',
    version: '2024 Edition',
    description: "A comprehensive framework describing the professional practice of teaching in Singapore schools, aligned to MOE's vision of nurturing every child.",
    skills: [
      { name: 'Curriculum Understanding', category: 'Curriculum', description: 'Demonstrates deep understanding of subject matter and curriculum requirements', level_basic: 'Understands syllabus content and learning objectives', level_intermediate: 'Connects subject concepts across topics and year levels', level_advanced: 'Integrates interdisciplinary connections and higher-order concepts', level_expert: 'Develops curriculum innovations and contributes to national curriculum design' },
      { name: 'Lesson Planning', category: 'Curriculum', description: 'Plans coherent and purposeful lessons aligned to intended learning outcomes', level_basic: 'Plans lessons with clear objectives and basic structure', level_intermediate: 'Designs varied activities that differentiate for diverse learner needs', level_advanced: 'Creates learning sequences with formative checkpoints and adaptive strategies', level_expert: 'Leads curriculum planning teams and mentors colleagues in lesson design' },
      { name: 'Pedagogical Approaches', category: 'Pedagogy', description: 'Selects and applies appropriate teaching strategies to optimise student learning', level_basic: 'Uses a range of basic instructional strategies effectively', level_intermediate: 'Applies evidence-based practices and adapts to learner feedback', level_advanced: 'Innovates pedagogical approaches and evaluates their impact on outcomes', level_expert: 'Models expert pedagogy and contributes to professional knowledge in the field' },
      { name: 'Classroom Climate', category: 'Classroom Management', description: 'Establishes a safe, inclusive, and engaging learning environment', level_basic: 'Maintains orderly environment with clear expectations and routines', level_intermediate: 'Builds positive relationships and responds proactively to individual needs', level_advanced: 'Creates a community of learners with shared responsibility for learning', level_expert: 'Champions inclusive practices and advises on school-wide approaches' },
      { name: 'Assessment for Learning', category: 'Assessment', description: 'Uses assessment strategically to monitor and enhance student progress', level_basic: 'Conducts summative assessments and provides timely feedback', level_intermediate: 'Uses formative assessment to adjust instruction in real-time', level_advanced: 'Designs assessment systems that drive learning and motivate students', level_expert: 'Leads assessment reform initiatives and builds school assessment culture' },
      { name: 'Student-Centric Facilitation', category: 'Student Development', description: 'Facilitates student-centred learning that develops agency and metacognition', level_basic: 'Involves students in learning activities and class discussions', level_intermediate: 'Scaffolds student-directed inquiry and collaborative learning experiences', level_advanced: 'Develops student capacity for self-directed learning and goal-setting', level_expert: 'Pioneers student voice initiatives and shares practice across the school' },
      { name: 'ICT Integration', category: 'ICT Integration', description: 'Integrates digital technologies purposefully to enhance teaching and learning', level_basic: 'Uses ICT tools for lesson delivery and basic student activities', level_intermediate: 'Designs ICT-enriched activities that deepen and extend learning', level_advanced: 'Leads digital transformation in learning experiences and data-informed practice', level_expert: 'Drives school-wide EdTech strategy and contributes to national ICT initiatives' },
      { name: 'Reflective Practice', category: 'Professional Learning', description: 'Engages in systematic reflection to continuously improve professional practice', level_basic: 'Reflects on lessons and identifies key areas for improvement', level_intermediate: 'Uses structured reflection frameworks and actively seeks peer feedback', level_advanced: 'Conducts practitioner research to inform and refine classroom practice', level_expert: 'Builds reflective cultures in teams and leads action research programmes' },
      { name: 'Collaboration & PLCs', category: 'Professional Learning', description: 'Collaborates with colleagues in professional learning communities to improve practice', level_basic: 'Participates constructively in team discussions and professional sharing', level_intermediate: 'Contributes resources and leads discussions within PLCs', level_advanced: 'Facilitates PLCs and drives collaborative inquiry cycles', level_expert: 'Designs and sustains high-impact PLC structures across the school' },
      { name: 'Community Partnership', category: 'Community Engagement', description: 'Builds meaningful partnerships with parents and community stakeholders', level_basic: 'Communicates with parents regularly about student progress', level_intermediate: 'Engages parents as active partners in supporting student learning', level_advanced: 'Develops community programmes that enrich student learning experiences', level_expert: 'Leads school-community partnership strategy and drives systemic engagement' },
    ],
  },
  {
    name: 'ISTE Standards for Educators',
    source_standard: 'ISTE Standards',
    version: '2024',
    description: 'The ISTE Standards for Educators define the learning and teaching skills needed to use technology effectively for student success.',
    skills: [
      { name: 'Learner', category: 'Professional Learning', description: 'Educators continually improve their practice by learning from and with others', level_basic: 'Seeks out professional learning opportunities in EdTech', level_intermediate: 'Applies new knowledge to innovate classroom practices', level_advanced: 'Contributes to the EdTech professional learning community', level_expert: 'Leads learning at system level and publishes insights' },
      { name: 'Leader', category: 'Leadership', description: 'Educators seek out opportunities for leadership to support student empowerment', level_basic: 'Models digital tools and shares practices with colleagues', level_intermediate: 'Champions technology use in school-wide contexts', level_advanced: 'Leads digital transformation initiatives at school or cluster level', level_expert: 'Drives policy and strategy for EdTech at national level' },
      { name: 'Citizen', category: 'Student Development', description: 'Educators inspire students to contribute positively to the digital world', level_basic: 'Models digital citizenship and discusses online safety', level_intermediate: 'Integrates digital citizenship into subject teaching', level_advanced: 'Develops school programmes for responsible digital engagement', level_expert: 'Shapes national frameworks for digital citizenship education' },
      { name: 'Collaborator', category: 'Professional Learning', description: 'Educators dedicate time to collaborate with colleagues and students to improve practice', level_basic: 'Uses technology to collaborate with peers within school', level_intermediate: 'Leads collaborative projects using digital tools', level_advanced: 'Builds inter-school collaboration networks using platforms', level_expert: 'Designs and sustains international collaboration ecosystems' },
      { name: 'Designer', category: 'Pedagogy', description: 'Educators design authentic, learner-driven activities and environments', level_basic: 'Designs basic technology-enhanced learning activities', level_intermediate: 'Creates project-based, technology-rich learning experiences', level_advanced: 'Develops innovative learning environments using emerging technologies', level_expert: 'Pioneers learning design frameworks adopted by others' },
      { name: 'Facilitator', category: 'Pedagogy', description: 'Educators facilitate learning with technology to support student achievement', level_basic: 'Uses technology to support instruction effectively', level_intermediate: 'Employs technology to personalise learning experiences', level_advanced: 'Creates adaptive learning environments driven by data', level_expert: 'Models expert facilitation for complex, AI-enhanced learning' },
      { name: 'Analyst', category: 'Assessment', description: 'Educators understand and use data to drive their instruction and support students', level_basic: 'Uses data dashboards to monitor student progress', level_intermediate: 'Analyses learning data to adapt teaching strategies', level_advanced: 'Applies predictive analytics to personalise interventions', level_expert: 'Leads data literacy initiatives and develops school analytics capability' },
    ],
  },
  {
    name: 'Teaching Competency Framework (Generic)',
    source_standard: 'Generic Teaching Standards',
    version: '1.0',
    description: 'A general-purpose teaching competency framework suitable for any school or educational organisation.',
    skills: [
      { name: 'Subject Mastery', category: 'Curriculum', description: 'Demonstrates expert knowledge of the subject content', level_basic: 'Covers curriculum content accurately and coherently', level_intermediate: 'Contextualises subject within real-world applications', level_advanced: 'Extends learners beyond syllabus with enrichment content', level_expert: 'Contributes to subject curriculum development at school or national level' },
      { name: 'Instructional Design', category: 'Pedagogy', description: 'Designs effective and engaging learning experiences', level_basic: 'Plans lessons with clear objectives and structured activities', level_intermediate: 'Designs differentiated learning pathways for diverse learners', level_advanced: 'Creates innovative learning sequences based on current research', level_expert: 'Leads instructional design at organisational level' },
      { name: 'Formative Assessment', category: 'Assessment', description: 'Uses ongoing assessment to monitor and support learning', level_basic: 'Checks for understanding during lessons using varied techniques', level_intermediate: 'Uses varied assessment techniques to adapt teaching in the moment', level_advanced: 'Develops assessment frameworks that promote ongoing learner growth', level_expert: 'Mentors colleagues in assessment for learning practices' },
      { name: 'Communication', category: 'Communication', description: 'Communicates clearly and effectively with diverse audiences', level_basic: 'Explains concepts clearly to students at appropriate level', level_intermediate: 'Adapts communication style for different learners and contexts', level_advanced: 'Facilitates complex discussions and productive debates', level_expert: 'Represents the school in professional forums and publications' },
      { name: 'Technology Proficiency', category: 'Technology', description: 'Uses technology tools effectively to support teaching and administration', level_basic: 'Uses standard office and teaching tools proficiently', level_intermediate: 'Integrates specialised EdTech tools into day-to-day teaching', level_advanced: 'Evaluates and selects tools to optimise learning outcomes', level_expert: 'Leads technology adoption and training programmes for peers' },
    ],
  },
];

// ── Template picker modal ─────────────────────────────────────────────────────
function TemplateModal({ onSelect, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 680, maxHeight: '80vh', overflowY: 'auto', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2035', margin: '0 0 4px' }}>Start from a Template</h2>
            <p style={{ fontSize: 13, color: '#7a8294', margin: 0 }}>Choose a standard framework to pre-populate your skills — you can customise everything after.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aa2b4' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FRAMEWORK_TEMPLATES.map((t, i) => (
            <div key={i} onClick={() => onSelect(t)}
              style={{ border: '1.5px solid #e0e3ea', borderRadius: 12, padding: '16px 20px', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6c63ff'; e.currentTarget.style.background = '#f9f8ff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e3ea'; e.currentTarget.style.background = '#fff'; }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ background: '#f0eeff', borderRadius: 8, padding: 8, flexShrink: 0 }}><Layers size={18} color="#6c63ff" /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1a2035' }}>{t.name}</span>
                    <span style={{ fontSize: 11, background: '#f0eeff', color: '#6c63ff', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>{t.version}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#7a8294', margin: '0 0 6px', lineHeight: 1.5 }}>{t.description}</p>
                  <span style={{ fontSize: 11, color: '#9aa2b4' }}>{t.skills.length} skills across {new Set(t.skills.map(s => s.category)).size} categories</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Skill editor row inside the framework modal ──────────────────────────────
function SkillFormRow({ skill, onChange, onRemove }) {
  const [open, setOpen] = useState(false);
  const inp = { padding: '6px 9px', border: '1.5px solid #e0e3ea', borderRadius: 7, fontSize: 13, width: '100%', boxSizing: 'border-box' };
  return (
    <div style={{ border: '1px solid #e8eaf0', borderRadius: 10, marginBottom: 8, overflow: 'hidden' }}>
      {/* Collapsed header */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr auto auto', gap: 8, alignItems: 'center', padding: '8px 10px', background: '#fafbff' }}>
        <input value={skill.name} onChange={e => onChange({ ...skill, name: e.target.value })}
          placeholder="Skill name *" style={inp} onClick={e => e.stopPropagation()} />
        <select value={skill.category} onChange={e => onChange({ ...skill, category: e.target.value })} style={inp}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => setOpen(o => !o)}
          style={{ background: open ? '#f0eeff' : '#f0f2f7', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: open ? '#6c63ff' : '#9aa2b4' }}>
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        <button onClick={onRemove} style={{ background: '#fdeaea', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#e74c3c' }}>
          <X size={13} />
        </button>
      </div>
      {/* Expanded: description + level descriptors */}
      {open && (
        <div style={{ padding: '10px 12px', borderTop: '1px solid #e8eaf0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input value={skill.description} onChange={e => onChange({ ...skill, description: e.target.value })}
            placeholder="Skill description (optional)" style={inp} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {LEVELS.map(lvl => (
              <div key={lvl}>
                <label style={{ fontSize: 11, fontWeight: 700, color: LEVEL_COLORS[lvl], textTransform: 'capitalize', display: 'block', marginBottom: 3 }}>{lvl}</label>
                <textarea
                  value={skill[`level_${lvl}`]}
                  onChange={e => onChange({ ...skill, [`level_${lvl}`]: e.target.value })}
                  placeholder={`What does ${lvl} look like?`}
                  rows={2}
                  style={{ ...inp, resize: 'vertical', fontSize: 12 }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Framework create / edit modal ─────────────────────────────────────────────
function FrameworkModal({ framework, onClose, onSave }) {
  const [form, setForm] = useState(framework || EMPTY_FRAMEWORK);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const fileRef = useRef(null);

  const addSkill = () => setForm(f => ({ ...f, skills: [...f.skills, { ...EMPTY_SKILL }] }));
  const updateSkill = (i, s) => setForm(f => ({ ...f, skills: f.skills.map((sk, idx) => idx === i ? s : sk) }));
  const removeSkill = (i) => setForm(f => ({ ...f, skills: f.skills.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, skills: form.skills.filter(s => s.name.trim()) };
      const res = form.id
        ? await api.put(`/skill-frameworks/${form.id}`, payload)
        : await api.post('/skill-frameworks', payload);
      onSave(res.data);
    } finally {
      setSaving(false);
    }
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        setForm(f => ({
          ...f,
          name: data.name || f.name,
          description: data.description || f.description,
          source_standard: data.source_standard || f.source_standard,
          version: data.version || f.version,
          skills: Array.isArray(data.skills)
            ? data.skills.map(s => ({ name: s.name || '', category: s.category || 'Other', description: s.description || '', level_basic: s.level_basic || '', level_intermediate: s.level_intermediate || '', level_advanced: s.level_advanced || '', level_expert: s.level_expert || '' }))
            : f.skills,
        }));
      } catch {
        alert('Invalid JSON file. Please check the format and try again.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const applyTemplate = (template) => {
    setForm(f => ({
      ...f,
      name: template.name,
      description: template.description,
      source_standard: template.source_standard,
      version: template.version,
      skills: template.skills.map(s => ({ ...EMPTY_SKILL, ...s })),
    }));
    setShowTemplates(false);
  };

  const inp = { padding: '9px 12px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box' };
  const visibleSkills = search
    ? form.skills.map((s, i) => ({ s, i })).filter(({ s }) => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()))
    : form.skills.map((s, i) => ({ s, i }));

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const inCat = visibleSkills.filter(({ s }) => s.category === cat);
    if (inCat.length) acc[cat] = inCat;
    return acc;
  }, {});

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 860, maxHeight: '92vh', overflowY: 'auto', padding: 32 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2035', margin: 0 }}>
            {form.id ? 'Edit Framework' : 'New Skill Framework'}
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {!form.id && (
              <button onClick={() => setShowTemplates(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#f0eeff', color: '#6c63ff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <BookMarked size={14} /> Start from Template
              </button>
            )}
            <button onClick={() => fileRef.current?.click()}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#f0f7ff', color: '#3498db', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Upload size={14} /> Import JSON
            </button>
            <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportJSON} />
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aa2b4' }}><X size={20} /></button>
          </div>
        </div>

        {/* Framework meta */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 5 }}>Framework Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Teaching Competency Framework 2025" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 5 }}>Status</label>
            <button onClick={() => setForm(f => ({ ...f, is_active: f.is_active ? 0 : 1 }))}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', border: '1.5px solid #e0e3ea', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: form.is_active ? '#2ecc71' : '#9aa2b4', width: '100%' }}>
              {form.is_active ? <ToggleRight size={18} color="#2ecc71" /> : <ToggleLeft size={18} color="#9aa2b4" />}
              {form.is_active ? 'Active' : 'Inactive'}
            </button>
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 5 }}>Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2} placeholder="Describe this framework's purpose and scope…"
            style={{ ...inp, resize: 'vertical' }} />
        </div>
        {/* Standard / version */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 24 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 5 }}>Based on Standard <span style={{ fontWeight: 400, color: '#b0b7c3' }}>(optional)</span></label>
            <input value={form.source_standard || ''} onChange={e => setForm(f => ({ ...f, source_standard: e.target.value }))}
              placeholder="e.g. Singapore Teaching Practice, ISTE Standards" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 5 }}>Version <span style={{ fontWeight: 400, color: '#b0b7c3' }}>(optional)</span></label>
            <input value={form.version || ''} onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
              placeholder="e.g. 2024 Edition, v1.0" style={inp} />
          </div>
        </div>

        {/* Skills section */}
        <div style={{ borderTop: '1px solid #f0f2f7', paddingTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2035', margin: '0 0 2px' }}>Skills ({form.skills.length})</h3>
              <p style={{ fontSize: 12, color: '#9aa2b4', margin: 0 }}>Define each skill with proficiency level descriptors</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {form.skills.length > 3 && (
                <div style={{ position: 'relative' }}>
                  <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#9aa2b4', pointerEvents: 'none' }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter skills…"
                    style={{ padding: '7px 10px 7px 26px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 12, outline: 'none', width: 160 }} />
                </div>
              )}
              <button onClick={addSkill}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0eeff', color: '#6c63ff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <Plus size={13} /> Add Skill
              </button>
            </div>
          </div>

          {form.skills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#b0b7c3', fontSize: 13, fontStyle: 'italic', border: '2px dashed #e8eaf0', borderRadius: 10 }}>
              No skills yet — click "Add Skill" to start building, or use "Start from Template" above.
            </div>
          ) : Object.keys(grouped).length > 0 ? (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9aa2b4', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, paddingLeft: 2 }}>{cat}</div>
                {items.map(({ s, i }) => (
                  <SkillFormRow key={i} skill={s} onChange={sk => updateSkill(i, sk)} onRemove={() => removeSkill(i)} />
                ))}
              </div>
            ))
          ) : (
            <p style={{ color: '#b0b7c3', fontSize: 13, fontStyle: 'italic' }}>No skills match the filter.</p>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 20, borderTop: '1px solid #f0f2f7', marginTop: 8 }}>
          <button onClick={onClose} style={{ padding: '10px 22px', border: '1.5px solid #e0e3ea', borderRadius: 9, background: '#fff', color: '#5a6480', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.name.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, cursor: 'pointer', fontSize: 14, opacity: (saving || !form.name.trim()) ? 0.7 : 1 }}>
            <Save size={14} /> {saving ? 'Saving…' : 'Save Framework'}
          </button>
        </div>
      </div>
      {showTemplates && <TemplateModal onSelect={applyTemplate} onClose={() => setShowTemplates(false)} />}
    </div>
  );
}

// ── Skills detail panel (read-only, expanded under a framework row) ────────────
function SkillsPanel({ skills }) {
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const inCat = skills.filter(s => s.category === cat);
    if (inCat.length) acc[cat] = inCat;
    return acc;
  }, {});

  if (skills.length === 0) {
    return <p style={{ color: '#b0b7c3', fontSize: 13, fontStyle: 'italic', margin: '12px 0 4px' }}>No skills defined for this framework.</p>;
  }

  return (
    <div style={{ marginTop: 10 }}>
      {Object.entries(grouped).map(([cat, catSkills]) => (
        <div key={cat} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9aa2b4', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{cat}</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Skill', 'Description', ...LEVELS.map(l => l.charAt(0).toUpperCase() + l.slice(1))].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '5px 10px', fontSize: 11, color: '#9aa2b4', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #e8eaf0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {catSkills.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f0f2f7' }}>
                  <td style={{ padding: '8px 10px', fontSize: 13, fontWeight: 600, color: '#1a2035', whiteSpace: 'nowrap' }}>{s.name}</td>
                  <td style={{ padding: '8px 10px', fontSize: 12, color: '#7a8294', maxWidth: 180 }}>{s.description || <span style={{ color: '#c0c8dc' }}>—</span>}</td>
                  {LEVELS.map(lvl => (
                    <td key={lvl} style={{ padding: '8px 10px', fontSize: 12, color: '#5a6480', maxWidth: 160, verticalAlign: 'top' }}>
                      {s[`level_${lvl}`]
                        ? <span style={{ display: 'block', borderLeft: `3px solid ${LEVEL_COLORS[lvl]}`, paddingLeft: 6, lineHeight: 1.4 }}>{s[`level_${lvl}`]}</span>
                        : <span style={{ color: '#c0c8dc' }}>—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

// ── Linked content panel — courses & pathways aligned to this framework ───────
function LinkedContentPanel({ frameworkId, onCountChange }) {
  const [data, setData] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [allPathways, setAllPathways] = useState([]);
  const [courseSearch, setCourseSearch] = useState('');
  const [pathwaySearch, setPathwaySearch] = useState('');
  const [addingCourse, setAddingCourse] = useState(false);
  const [addingPathway, setAddingPathway] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedPathway, setSelectedPathway] = useState('');

  useEffect(() => {
    api.get(`/skill-frameworks/${frameworkId}/linked-content`).then(r => setData(r.data)).catch(() => setData({ courses: [], pathways: [] }));
    api.get('/courses?limit=200').then(r => setAllCourses(r.data.courses || [])).catch(() => {});
    api.get('/pathways').then(r => setAllPathways(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, [frameworkId]);

  const refresh = () => {
    api.get(`/skill-frameworks/${frameworkId}/linked-content`).then(r => {
      setData(r.data);
      onCountChange?.(r.data.courses.length, r.data.pathways.length);
    }).catch(() => {});
  };

  const linkCourse = async () => {
    if (!selectedCourse) return;
    await api.post(`/skill-frameworks/${frameworkId}/link-course`, { course_id: Number(selectedCourse) });
    setSelectedCourse(''); setAddingCourse(false); refresh();
  };
  const unlinkCourse = async (courseId) => {
    await api.delete(`/skill-frameworks/${frameworkId}/unlink-course/${courseId}`);
    refresh();
  };
  const linkPathway = async () => {
    if (!selectedPathway) return;
    await api.post(`/skill-frameworks/${frameworkId}/link-pathway`, { pathway_id: Number(selectedPathway) });
    setSelectedPathway(''); setAddingPathway(false); refresh();
  };
  const unlinkPathway = async (pathwayId) => {
    await api.delete(`/skill-frameworks/${frameworkId}/unlink-pathway/${pathwayId}`);
    refresh();
  };

  if (!data) return <div style={{ padding: '20px 0', color: '#b0b7c3', fontSize: 13 }}>Loading linked content…</div>;

  const linkedCourseIds = new Set(data.courses.map(c => c.id));
  const linkedPathwayIds = new Set(data.pathways.map(p => p.id));
  const availableCourses = allCourses.filter(c => !linkedCourseIds.has(c.id));
  const availablePathways = allPathways.filter(p => !linkedPathwayIds.has(p.id));

  const filteredCourses = data.courses.filter(c => !courseSearch || c.title.toLowerCase().includes(courseSearch.toLowerCase()));
  const filteredPathways = data.pathways.filter(p => !pathwaySearch || p.title.toLowerCase().includes(pathwaySearch.toLowerCase()));

  const selStyle = { padding: '7px 10px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 13, flex: 1 };

  return (
    <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {/* Courses column */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={13} color="#3498db" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2035' }}>Courses ({data.courses.length})</span>
          </div>
          <button onClick={() => setAddingCourse(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: addingCourse ? '#fdeaea' : '#f0f7ff', color: addingCourse ? '#e74c3c' : '#3498db', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {addingCourse ? <><X size={12} /> Cancel</> : <><Link size={12} /> Link Course</>}
          </button>
        </div>
        {addingCourse && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} style={selStyle}>
              <option value="">Select a course…</option>
              {availableCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <button onClick={linkCourse} disabled={!selectedCourse}
              style={{ background: '#3498db', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: selectedCourse ? 1 : 0.5 }}>
              Add
            </button>
          </div>
        )}
        {data.courses.length > 3 && (
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#9aa2b4', pointerEvents: 'none' }} />
            <input value={courseSearch} onChange={e => setCourseSearch(e.target.value)} placeholder="Filter courses…"
              style={{ padding: '6px 8px 6px 26px', border: '1.5px solid #e0e3ea', borderRadius: 7, fontSize: 12, width: '100%', boxSizing: 'border-box' }} />
          </div>
        )}
        {filteredCourses.length === 0 ? (
          <p style={{ color: '#c0c8dc', fontSize: 12, fontStyle: 'italic', margin: '8px 0' }}>{data.courses.length === 0 ? 'No courses linked yet.' : 'No courses match the filter.'}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filteredCourses.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f8f9fc', borderRadius: 8, border: '1px solid #e8eaf0' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2035', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: '#9aa2b4' }}>{c.category}{c.level ? ` · ${c.level}` : ''}{c.duration_hours ? ` · ${c.duration_hours}h` : ''}</div>
                </div>
                <button onClick={() => unlinkCourse(c.id)}
                  style={{ background: '#fdeaea', color: '#e74c3c', border: 'none', borderRadius: 6, padding: '4px 7px', cursor: 'pointer', flexShrink: 0 }}
                  title="Remove link"><Unlink size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pathways column */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Route size={13} color="#9b59b6" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2035' }}>Pathways ({data.pathways.length})</span>
          </div>
          <button onClick={() => setAddingPathway(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: addingPathway ? '#fdeaea' : '#f5eeff', color: addingPathway ? '#e74c3c' : '#9b59b6', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {addingPathway ? <><X size={12} /> Cancel</> : <><Link size={12} /> Link Pathway</>}
          </button>
        </div>
        {addingPathway && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <select value={selectedPathway} onChange={e => setSelectedPathway(e.target.value)} style={selStyle}>
              <option value="">Select a pathway…</option>
              {availablePathways.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <button onClick={linkPathway} disabled={!selectedPathway}
              style={{ background: '#9b59b6', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: selectedPathway ? 1 : 0.5 }}>
              Add
            </button>
          </div>
        )}
        {data.pathways.length > 3 && (
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#9aa2b4', pointerEvents: 'none' }} />
            <input value={pathwaySearch} onChange={e => setPathwaySearch(e.target.value)} placeholder="Filter pathways…"
              style={{ padding: '6px 8px 6px 26px', border: '1.5px solid #e0e3ea', borderRadius: 7, fontSize: 12, width: '100%', boxSizing: 'border-box' }} />
          </div>
        )}
        {filteredPathways.length === 0 ? (
          <p style={{ color: '#c0c8dc', fontSize: 12, fontStyle: 'italic', margin: '8px 0' }}>{data.pathways.length === 0 ? 'No pathways linked yet.' : 'No pathways match the filter.'}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filteredPathways.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f8f9fc', borderRadius: 8, border: '1px solid #e8eaf0' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2035', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: '#9aa2b4' }}>{p.category}{p.level ? ` · ${p.level}` : ''}{p.duration_hours ? ` · ${p.duration_hours}h` : ''}</div>
                </div>
                <button onClick={() => unlinkPathway(p.id)}
                  style={{ background: '#fdeaea', color: '#e74c3c', border: 'none', borderRadius: 6, padding: '4px 7px', cursor: 'pointer', flexShrink: 0 }}
                  title="Remove link"><Unlink size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminSkillFrameworks() {
  const [frameworks, setFrameworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | framework object
  const [expanded, setExpanded] = useState({});
  const [expandedTab, setExpandedTab] = useState({}); // 'skills' | 'content'
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    api.get('/skill-frameworks').then(r => setFrameworks(r.data)).finally(() => setLoading(false));
  }, []);

  const handleSave = (saved) => {
    setFrameworks(prev => {
      const idx = prev.findIndex(f => f.id === saved.id);
      return idx >= 0 ? prev.map(f => f.id === saved.id ? saved : f) : [saved, ...prev];
    });
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this framework and all its skills?')) return;
    await api.delete(`/skill-frameworks/${id}`);
    setFrameworks(prev => prev.filter(f => f.id !== id));
  };

  const handleClone = async (fw) => {
    const payload = {
      name: `Copy of ${fw.name}`,
      description: fw.description,
      source_standard: fw.source_standard,
      version: fw.version,
      is_active: 0,
      skills: (fw.skills || []).map(({ name, category, description, level_basic, level_intermediate, level_advanced, level_expert }) =>
        ({ name, category, description, level_basic, level_intermediate, level_advanced, level_expert })),
    };
    const res = await api.post('/skill-frameworks', payload);
    setFrameworks(prev => [res.data, ...prev]);
  };

  const handleExport = (fw) => {
    const data = {
      name: fw.name, description: fw.description,
      source_standard: fw.source_standard, version: fw.version,
      skills: (fw.skills || []).map(({ name, category, description, level_basic, level_intermediate, level_advanced, level_expert }) =>
        ({ name, category, description, level_basic, level_intermediate, level_advanced, level_expert })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${fw.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));
  const getTab = (id) => expandedTab[id] || 'skills';
  const setTab = (id, tab) => setExpandedTab(e => ({ ...e, [id]: tab }));

  const updateLinkedCounts = (fwId, courses, pathways) => {
    setFrameworks(prev => prev.map(f => f.id === fwId
      ? { ...f, linked_courses_count: courses, linked_pathways_count: pathways }
      : f));
  };

  const filtered = frameworks.filter(f => {
    if (filterStatus === 'active' && !f.is_active) return false;
    if (filterStatus === 'inactive' && f.is_active) return false;
    if (search) {
      const s = search.toLowerCase();
      return f.name.toLowerCase().includes(s) || (f.description || '').toLowerCase().includes(s);
    }
    return true;
  });

  const lbl = { fontSize: 11, fontWeight: 700, color: '#9aa2b4', textTransform: 'uppercase', display: 'block', marginBottom: 5 };
  const sel = { padding: '8px 12px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', color: '#1a2035', cursor: 'pointer' };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2035', margin: '0 0 4px' }}>Skill Frameworks</h1>
          <p style={{ color: '#7a8294', fontSize: 13, margin: 0 }}>Define master competency frameworks with proficiency level descriptors for each skill</p>
        </div>
        <button onClick={() => setModal('new')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          <Plus size={16} /> New Framework
        </button>
      </div>

      {/* Search & filter card */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '16px 20px', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180, maxWidth: 320 }}>
            <label style={lbl}>Search</label>
            <Search size={14} style={{ position: 'absolute', left: 10, bottom: 9, color: '#9aa2b4', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search frameworks…"
              style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f8f9fc', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={lbl}>Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={sel}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            {(search || filterStatus) && (
              <button onClick={() => { setSearch(''); setFilterStatus(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fdeaea', color: '#e74c3c', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <X size={12} /> Clear
              </button>
            )}
            <span style={{ fontSize: 13, color: '#9aa2b4', whiteSpace: 'nowrap' }}>
              {filtered.length} framework{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Loading…</div>
      ) : frameworks.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 60, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Layers size={40} color="#e0e3ea" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: '#1a2035', margin: '0 0 8px' }}>No skill frameworks yet</p>
          <p style={{ color: '#7a8294', fontSize: 14 }}>Create your first framework to define competency standards.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8f9fc' }}>
              <tr>
                {['Framework Name', 'Description', 'Skills', 'Alignment', 'Status', ''].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 2 || i === 3 ? 'center' : 'left', padding: '12px 16px', fontSize: 12, color: '#9aa2b4', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#aaa', fontSize: 14 }}>No frameworks match the current filters.</td></tr>
              ) : filtered.map(fw => {
                const tab = getTab(fw.id);
                return (
                  <React.Fragment key={fw.id}>
                    <tr style={{ borderBottom: expanded[fw.id] ? 'none' : '1px solid #f0f2f7', cursor: 'pointer' }} onClick={() => toggle(fw.id)}>
                      {/* Name + standard badge */}
                      <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#1a2035', maxWidth: 260 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {expanded[fw.id] ? <ChevronUp size={14} color="#9aa2b4" /> : <ChevronDown size={14} color="#9aa2b4" />}
                          <Layers size={15} color="#6c63ff" />
                          <div>
                            <div>{fw.name}</div>
                            {fw.source_standard && (
                              <div style={{ fontSize: 11, color: '#9b59b6', fontWeight: 500, marginTop: 2 }}>
                                {fw.source_standard}{fw.version ? ` · ${fw.version}` : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Description */}
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#7a8294', maxWidth: 220 }}>
                        {fw.description
                          ? <span>{fw.description.slice(0, 80)}{fw.description.length > 80 ? '…' : ''}</span>
                          : <span style={{ color: '#c0c8dc' }}>—</span>}
                      </td>
                      {/* Skills count */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        {(fw.skills?.length || 0) > 0
                          ? <span style={{ background: '#e8f5e9', color: '#2ecc71', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>{fw.skills.length}</span>
                          : <span style={{ color: '#c0c8dc', fontSize: 13 }}>0</span>}
                      </td>
                      {/* Alignment (courses + pathways) */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <span style={{ background: '#e8f4ff', color: '#3498db', borderRadius: 20, padding: '3px 9px', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <BookOpen size={10} /> {fw.linked_courses_count || 0}
                          </span>
                          <span style={{ background: '#f5eeff', color: '#9b59b6', borderRadius: 20, padding: '3px 9px', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Route size={10} /> {fw.linked_pathways_count || 0}
                          </span>
                        </div>
                      </td>
                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: fw.is_active ? '#e8f5e9' : '#f5f6fa', color: fw.is_active ? '#2ecc71' : '#9aa2b4', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                          {fw.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleExport(fw)} title="Export JSON"
                            style={{ background: '#f0f7ff', color: '#3498db', border: 'none', borderRadius: 7, padding: '7px 9px', cursor: 'pointer' }}><Download size={13} /></button>
                          <button onClick={() => handleClone(fw)} title="Clone framework"
                            style={{ background: '#f0f7f0', color: '#27ae60', border: 'none', borderRadius: 7, padding: '7px 9px', cursor: 'pointer' }}><Copy size={13} /></button>
                          <button onClick={() => setModal(fw)} title="Edit"
                            style={{ background: '#f0eeff', color: '#6c63ff', border: 'none', borderRadius: 7, padding: '7px 9px', cursor: 'pointer' }}><Pencil size={13} /></button>
                          <button onClick={() => handleDelete(fw.id)} title="Delete"
                            style={{ background: '#fdeaea', color: '#e74c3c', border: 'none', borderRadius: 7, padding: '7px 9px', cursor: 'pointer' }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                    {expanded[fw.id] && (
                      <tr key={`${fw.id}-detail`} style={{ borderBottom: '1px solid #f0f2f7' }}>
                        <td colSpan={6} style={{ padding: '0 16px 20px 44px', background: '#fafbff' }}>
                          {/* Tabs */}
                          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e8eaf0', marginBottom: 14, marginTop: 8 }}>
                            {[{ key: 'skills', label: `Skills (${(fw.skills || []).length})`, icon: <Layers size={12} /> },
                              { key: 'content', label: `Linked Content`, icon: <Link size={12} /> }].map(t => (
                              <button key={t.key} onClick={e => { e.stopPropagation(); setTab(fw.id, t.key); }}
                                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 16px', border: 'none', borderBottom: tab === t.key ? '2px solid #6c63ff' : '2px solid transparent', background: 'none', color: tab === t.key ? '#6c63ff' : '#9aa2b4', fontWeight: tab === t.key ? 700 : 500, fontSize: 13, cursor: 'pointer', marginBottom: -1 }}>
                                {t.icon} {t.label}
                              </button>
                            ))}
                          </div>
                          {tab === 'skills'
                            ? <SkillsPanel skills={fw.skills || []} />
                            : <LinkedContentPanel frameworkId={fw.id} onCountChange={(c, p) => updateLinkedCounts(fw.id, c, p)} />
                          }
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <FrameworkModal
          framework={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
