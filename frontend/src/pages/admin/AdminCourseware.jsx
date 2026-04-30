import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Upload, Sparkles, ChevronUp, ChevronDown, Save, FileText, Video, X, Tag, Edit2, Check, Library, HelpCircle, ClipboardList, Target, Clock, RotateCcw, ChevronRight } from 'lucide-react';
import api from '../../api/client';

const EMPTY_MODULE = { title: '', description: '', content: '', duration_mins: 30, video_url: '', order_index: 0 };
const EMPTY_Q = { question_text: '', question_type: 'multiple_choice', options: ['', '', '', ''], correct_answer: '0', explanation: '', points: 1 };
const EMPTY_QUIZ = { title: '', description: '', quiz_type: 'quiz', time_limit_mins: 0, pass_score: 70, randomize: false, module_id: '' };

const LABELS = ['Reading', 'Video Lecture', 'Template', 'Activity', 'Assessment', 'Reference', 'Worksheet', 'Presentation'];
const Q_TYPES = { multiple_choice: 'Multiple Choice', true_false: 'True / False', short_answer: 'Short Answer' };

export default function AdminCourseware() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [tab, setTab] = useState('modules'); // 'modules' | 'resources'

  // ── Modules state ──────────────────────────────────────────────────────────
  const [modules, setModules] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [editing, setEditing] = useState({});
  const [newModule, setNewModule] = useState(null);
  const [generating, setGenerating] = useState({});
  const [saving, setSaving] = useState({});
  const [uploading, setUploading] = useState({});
  const fileRefs = useRef({});

  // ── Resources state ────────────────────────────────────────────────────────
  const [resources, setResources] = useState([]);
  const [resUploading, setResUploading] = useState(false);
  const resFileRef = useRef(null);
  const [resForm, setResForm] = useState({ name: '', description: '', label: '', tagInput: '', tags: [] });
  const [editingRes, setEditingRes] = useState(null); // { id, name, description, label, tagInput, tags, file_url, file_type, size_bytes }
  const [resReplacing, setResReplacing] = useState(false);
  const resReplaceRef = useRef(null);
  const [resFilter, setResFilter] = useState({ tag: '', label: '', type: '', search: '' });

  // ── Question Bank state ────────────────────────────────────────────────────
  const [questions, setQuestions] = useState([]);
  const [showQForm, setShowQForm] = useState(false);
  const [qForm, setQForm] = useState({ ...EMPTY_Q });
  const [editingQ, setEditingQ] = useState(null);
  const [qFilter, setQFilter] = useState({ type: '', search: '' });
  const [qSaving, setQSaving] = useState(false);

  // ── Quizzes state ──────────────────────────────────────────────────────────
  const [quizzes, setQuizzes] = useState([]);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizForm, setQuizForm] = useState({ ...EMPTY_QUIZ });
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [quizDetail, setQuizDetail] = useState({}); // { [qzid]: { questions: [] } }
  const [quizSaving, setQuizSaving] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  useEffect(() => {
    api.get(`/courses/${courseId}`).then(r => setCourse(r.data));
    loadModules();
    loadResources();
    loadQuestions();
    loadQuizzes();
  }, [courseId]);

  const loadModules = () =>
    api.get(`/courses/${courseId}/modules`).then(r => setModules(r.data));

  const loadResources = () =>
    api.get(`/courses/${courseId}/resources`).then(r => setResources(r.data));

  const loadQuestions = () =>
    api.get(`/courses/${courseId}/questions`).then(r => setQuestions(r.data));

  const loadQuizzes = () =>
    api.get(`/courses/${courseId}/quizzes`).then(r => setQuizzes(r.data));

  // ─── Module handlers (unchanged) ──────────────────────────────────────────
  const toggleExpand = (m) => {
    if (expandedId === m.id) { setExpandedId(null); return; }
    setExpandedId(m.id);
    if (!editing[m.id]) setEditing(prev => ({ ...prev, [m.id]: { ...m } }));
  };
  const updateField = (id, field, value) =>
    setEditing(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  const saveModule = async (id) => {
    setSaving(prev => ({ ...prev, [id]: true }));
    try {
      const form = editing[id];
      const r = await api.put(`/courses/${courseId}/modules/${id}`, form);
      setModules(prev => prev.map(m => m.id === id ? { ...r.data, files: m.files } : m));
    } catch (e) { alert(e.response?.data?.error || 'Save failed'); }
    finally { setSaving(prev => ({ ...prev, [id]: false })); }
  };
  const addModule = async () => {
    if (!newModule?.title?.trim()) { alert('Module title is required'); return; }
    try {
      const r = await api.post(`/courses/${courseId}/modules`, { ...newModule, order_index: modules.length });
      setModules(prev => [...prev, r.data]);
      setNewModule(null);
      setExpandedId(r.data.id);
      setEditing(prev => ({ ...prev, [r.data.id]: r.data }));
    } catch (e) { alert(e.response?.data?.error || 'Failed to add module'); }
  };
  const deleteModule = async (id) => {
    if (!confirm('Delete this module and all its files?')) return;
    await api.delete(`/courses/${courseId}/modules/${id}`);
    setModules(prev => prev.filter(m => m.id !== id));
    if (expandedId === id) setExpandedId(null);
  };
  const moveModule = async (idx, dir) => {
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= modules.length) return;
    const updated = [...modules];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    setModules(updated);
    await Promise.all([
      api.put(`/courses/${courseId}/modules/${updated[idx].id}`, { ...editing[updated[idx].id] || updated[idx], order_index: idx }),
      api.put(`/courses/${courseId}/modules/${updated[swapIdx].id}`, { ...editing[updated[swapIdx].id] || updated[swapIdx], order_index: swapIdx }),
    ]);
  };
  const generateContent = async (id) => {
    const form = editing[id];
    if (!form?.title) { alert('Module title is required to generate content'); return; }
    setGenerating(prev => ({ ...prev, [id]: true }));
    try {
      const r = await api.post('/ai/generate-module', {
        course_title: course?.title, module_title: form.title, category: course?.category,
        course_description: course?.description, module_index: modules.findIndex(m => m.id === id),
      });
      updateField(id, 'content', r.data.content);
    } catch (e) { alert(e.response?.data?.error || 'AI generation failed'); }
    finally { setGenerating(prev => ({ ...prev, [id]: false })); }
  };
  const uploadFile = async (moduleId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(prev => ({ ...prev, [moduleId]: true }));
    try {
      const fd = new FormData();
      fd.append('file', file);
      const uploadR = await api.post('/upload/file', fd);
      await api.post(`/courses/${courseId}/modules/${moduleId}/files`, {
        name: file.name, file_url: uploadR.data.url, file_type: uploadR.data.file_type, size_bytes: uploadR.data.size_bytes,
      });
      const modR = await api.get(`/courses/${courseId}/modules`);
      setModules(modR.data);
    } catch (e) { alert(e.response?.data?.error || 'Upload failed'); }
    finally {
      setUploading(prev => ({ ...prev, [moduleId]: false }));
      if (fileRefs.current[moduleId]) fileRefs.current[moduleId].value = '';
    }
  };
  const deleteFile = async (moduleId, fileId) => {
    if (!confirm('Remove this file?')) return;
    await api.delete(`/courses/${courseId}/modules/${moduleId}/files/${fileId}`);
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, files: m.files.filter(f => f.id !== fileId) } : m));
  };

  // ─── Resource handlers ────────────────────────────────────────────────────
  const addResTag = (tag, isEdit) => {
    const t = tag.trim().toLowerCase().replace(/\s+/g, '-');
    if (!t) return;
    if (isEdit) {
      setEditingRes(prev => ({ ...prev, tags: prev.tags.includes(t) ? prev.tags : [...prev.tags, t], tagInput: '' }));
    } else {
      setResForm(prev => ({ ...prev, tags: prev.tags.includes(t) ? prev.tags : [...prev.tags, t], tagInput: '' }));
    }
  };
  const removeResTag = (tag, isEdit) => {
    if (isEdit) setEditingRes(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    else setResForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const uploadResource = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!resForm.name.trim()) { alert('Please enter a resource name first'); resFileRef.current.value = ''; return; }
    setResUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const uploadR = await api.post('/upload/file', fd);
      await api.post(`/courses/${courseId}/resources`, {
        name: resForm.name.trim(),
        description: resForm.description.trim() || null,
        file_url: uploadR.data.url,
        file_type: uploadR.data.file_type,
        label: resForm.label || null,
        tags: resForm.tags,
        size_bytes: uploadR.data.size_bytes,
      });
      setResForm({ name: '', description: '', label: '', tagInput: '', tags: [] });
      loadResources();
    } catch (e) { alert(e.response?.data?.error || 'Upload failed'); }
    finally { setResUploading(false); if (resFileRef.current) resFileRef.current.value = ''; }
  };

  const replaceResFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResReplacing(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const uploadR = await api.post('/upload/file', fd);
      setEditingRes(prev => ({ ...prev, file_url: uploadR.data.url, file_type: uploadR.data.file_type, size_bytes: uploadR.data.size_bytes, _newFile: file.name }));
    } catch (e) { alert(e.response?.data?.error || 'Upload failed'); }
    finally { setResReplacing(false); if (resReplaceRef.current) resReplaceRef.current.value = ''; }
  };

  const saveResEdit = async () => {
    if (!editingRes) return;
    try {
      const payload = { name: editingRes.name, description: editingRes.description, label: editingRes.label, tags: editingRes.tags };
      if (editingRes._newFile) {
        payload.file_url = editingRes.file_url;
        payload.file_type = editingRes.file_type;
        payload.size_bytes = editingRes.size_bytes;
      }
      await api.put(`/courses/${courseId}/resources/${editingRes.id}`, payload);
      setEditingRes(null);
      loadResources();
    } catch (e) { alert(e.response?.data?.error || 'Save failed'); }
  };

  const deleteResource = async (id) => {
    if (!confirm('Delete this resource?')) return;
    await api.delete(`/courses/${courseId}/resources/${id}`);
    setResources(prev => prev.filter(r => r.id !== id));
  };

  // ─── Question Bank handlers ───────────────────────────────────────────────
  const normaliseQ = (form) => ({
    ...form,
    options: form.question_type === 'multiple_choice' ? form.options : [],
    correct_answer: form.question_type === 'true_false'
      ? (form.correct_answer === 'true' ? 'true' : 'false')
      : form.correct_answer,
  });

  const addQuestion = async () => {
    if (!qForm.question_text.trim()) { alert('Question text is required'); return; }
    if (qForm.question_type === 'multiple_choice' && qForm.options.some(o => !o.trim())) {
      alert('All 4 options must be filled in'); return;
    }
    setQSaving(true);
    try {
      await api.post(`/courses/${courseId}/questions`, normaliseQ(qForm));
      setQForm({ ...EMPTY_Q });
      setShowQForm(false);
      loadQuestions();
    } catch (e) { alert(e.response?.data?.error || 'Failed to save question'); }
    finally { setQSaving(false); }
  };

  const saveQEdit = async () => {
    if (!editingQ?.question_text?.trim()) return;
    setQSaving(true);
    try {
      await api.put(`/courses/${courseId}/questions/${editingQ.id}`, normaliseQ(editingQ));
      setEditingQ(null);
      loadQuestions();
    } catch (e) { alert(e.response?.data?.error || 'Failed to save'); }
    finally { setQSaving(false); }
  };

  const deleteQuestion = async (id) => {
    if (!confirm('Delete this question? It will be removed from all quizzes.')) return;
    await api.delete(`/courses/${courseId}/questions/${id}`);
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  // ─── Quiz / Exam handlers ─────────────────────────────────────────────────
  const addQuiz = async () => {
    if (!quizForm.title.trim()) { alert('Title is required'); return; }
    setQuizSaving(true);
    try {
      const r = await api.post(`/courses/${courseId}/quizzes`, quizForm);
      setQuizzes(prev => [r.data, ...prev]);
      setQuizForm({ ...EMPTY_QUIZ });
      setShowQuizForm(false);
    } catch (e) { alert(e.response?.data?.error || 'Failed to create quiz'); }
    finally { setQuizSaving(false); }
  };

  const saveQuizEdit = async () => {
    if (!editingQuiz?.title?.trim()) return;
    setQuizSaving(true);
    try {
      const r = await api.put(`/courses/${courseId}/quizzes/${editingQuiz.id}`, editingQuiz);
      setQuizzes(prev => prev.map(z => z.id === editingQuiz.id ? { ...r.data, question_count: z.question_count } : z));
      setEditingQuiz(null);
    } catch (e) { alert(e.response?.data?.error || 'Failed to save'); }
    finally { setQuizSaving(false); }
  };

  const deleteQuiz = async (id) => {
    if (!confirm('Delete this quiz?')) return;
    await api.delete(`/courses/${courseId}/quizzes/${id}`);
    setQuizzes(prev => prev.filter(z => z.id !== id));
    if (expandedQuiz === id) setExpandedQuiz(null);
  };

  const openQuizDetail = async (qzid) => {
    if (expandedQuiz === qzid) { setExpandedQuiz(null); return; }
    setExpandedQuiz(qzid);
    if (!quizDetail[qzid]) {
      const r = await api.get(`/courses/${courseId}/quizzes/${qzid}/full`);
      setQuizDetail(prev => ({ ...prev, [qzid]: r.data }));
    }
  };

  const addQToQuiz = async (qzid, questionId) => {
    try {
      await api.post(`/courses/${courseId}/quizzes/${qzid}/questions`, { question_id: questionId });
      const r = await api.get(`/courses/${courseId}/quizzes/${qzid}/full`);
      setQuizDetail(prev => ({ ...prev, [qzid]: r.data }));
      setQuizzes(prev => prev.map(z => z.id === qzid ? { ...z, question_count: (z.question_count || 0) + 1 } : z));
    } catch (e) { alert(e.response?.data?.error || 'Failed to add question'); }
  };

  const removeQFromQuiz = async (qzid, questionId) => {
    await api.delete(`/courses/${courseId}/quizzes/${qzid}/questions/${questionId}`);
    setQuizDetail(prev => ({ ...prev, [qzid]: { ...prev[qzid], questions: prev[qzid].questions.filter(q => q.id !== questionId) } }));
    setQuizzes(prev => prev.map(z => z.id === qzid ? { ...z, question_count: Math.max(0, (z.question_count || 1) - 1) } : z));
  };

  // All tags used across resources (for filter pills)
  const allTags = [...new Set(resources.flatMap(r => r.tags || []))].sort();
  const allLabels = [...new Set(resources.map(r => r.label).filter(Boolean))].sort();

  // Client-side filtered resources
  const filteredResources = resources.filter(r => {
    if (resFilter.label && r.label !== resFilter.label) return false;
    if (resFilter.type && r.file_type !== resFilter.type) return false;
    if (resFilter.tag && !(r.tags || []).includes(resFilter.tag)) return false;
    if (resFilter.search) {
      const s = resFilter.search.toLowerCase();
      return r.name.toLowerCase().includes(s) || (r.description || '').toLowerCase().includes(s) || (r.tags || []).join(' ').includes(s);
    }
    return true;
  });

  const inp = { width: '100%', padding: '8px 11px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#fff' };

  if (!course) return <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <button onClick={() => navigate('/admin/courses')}
          style={{ background: '#f0eeff', color: '#6c63ff', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13 }}>
          <ArrowLeft size={15} /> Back
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a2035', margin: 0 }}>Courseware</h1>
          <p style={{ fontSize: 13, color: '#7a8294', margin: 0 }}>{course.title}</p>
        </div>
        {tab === 'modules' && (
          <button onClick={() => setNewModule({ ...EMPTY_MODULE })}
            style={{ marginLeft: 'auto', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
            <Plus size={15} /> Add Module
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #e8eaf0', marginBottom: 22 }}>
        {[
          { key: 'modules', label: `Modules (${modules.length})` },
          { key: 'resources', label: `Resource Library (${resources.length})` },
          { key: 'questions', label: `Question Bank (${questions.length})` },
          { key: 'quizzes', label: `Quizzes (${quizzes.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '9px 20px', border: 'none', background: 'none', fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? '#6c63ff' : '#7a8294', borderBottom: tab === t.key ? '2px solid #6c63ff' : '2px solid transparent', marginBottom: -2, cursor: 'pointer', fontSize: 14 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ MODULES TAB ═══════════════════════════════════════════════════════ */}
      {tab === 'modules' && (
        <>
          {newModule && (
            <div style={{ background: '#f0eeff', border: '2px dashed #6c63ff', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#6c63ff', marginBottom: 10 }}>New Module</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Title *</label>
                  <input value={newModule.title} onChange={e => setNewModule(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Introduction to Formative Assessment" style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Duration (mins)</label>
                  <input type="number" value={newModule.duration_mins} onChange={e => setNewModule(f => ({ ...f, duration_mins: Number(e.target.value) }))} style={inp} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={addModule} style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Add</button>
                  <button onClick={() => setNewModule(null)} style={{ background: '#fff', color: '#7a8294', border: '1.5px solid #e0e3ea', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}><X size={14} /></button>
                </div>
              </div>
            </div>
          )}

          {modules.length === 0 && !newModule && (
            <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📚</div>
              <p style={{ color: '#9aa2b4', marginBottom: 16 }}>No modules yet.</p>
              <button onClick={() => setNewModule({ ...EMPTY_MODULE })} style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, cursor: 'pointer' }}>Add First Module</button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {modules.map((m, idx) => {
              const form = editing[m.id] || m;
              const isOpen = expandedId === m.id;
              return (
                <div key={m.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden', border: isOpen ? '2px solid #6c63ff' : '2px solid transparent' }}>
                  <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => toggleExpand(m)}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f0eeff', color: '#6c63ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{idx + 1}</div>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: '#1a2035' }}>{m.title}</span>
                    <span style={{ fontSize: 12, color: '#9aa2b4', marginRight: 4 }}>{m.duration_mins} min</span>
                    {m.files?.length > 0 && <span style={{ fontSize: 11, background: '#e8f5e9', color: '#2ecc71', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>{m.files.length} file{m.files.length > 1 ? 's' : ''}</span>}
                    {m.content && <span style={{ fontSize: 11, background: '#e8f0ff', color: '#6c63ff', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>content</span>}
                    <button onClick={e => { e.stopPropagation(); moveModule(idx, -1); }} disabled={idx === 0} style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1, padding: 2 }}><ChevronUp size={15} color="#9aa2b4" /></button>
                    <button onClick={e => { e.stopPropagation(); moveModule(idx, 1); }} disabled={idx === modules.length - 1} style={{ background: 'none', border: 'none', cursor: idx === modules.length - 1 ? 'default' : 'pointer', opacity: idx === modules.length - 1 ? 0.3 : 1, padding: 2 }}><ChevronDown size={15} color="#9aa2b4" /></button>
                    <button onClick={e => { e.stopPropagation(); deleteModule(m.id); }} style={{ background: '#fdeaea', color: '#e74c3c', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', marginLeft: 4 }}><Trash2 size={13} /></button>
                  </div>

                  {isOpen && (
                    <div style={{ padding: '0 18px 20px', borderTop: '1px solid #f0f2f7' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Module Title</label>
                          <input value={form.title} onChange={e => updateField(m.id, 'title', e.target.value)} style={inp} />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Duration (mins)</label>
                          <input type="number" value={form.duration_mins} onChange={e => updateField(m.id, 'duration_mins', Number(e.target.value))} style={inp} />
                        </div>
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Short Description</label>
                        <input value={form.description || ''} onChange={e => updateField(m.id, 'description', e.target.value)} style={inp} placeholder="Visible to students in the module list" />
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Video URL <span style={{ fontWeight: 400, color: '#9aa2b4' }}>(YouTube embed or MP4)</span></label>
                        <input value={form.video_url || ''} onChange={e => updateField(m.id, 'video_url', e.target.value)} placeholder="https://www.youtube.com/embed/..." style={inp} />
                      </div>
                      <div style={{ marginTop: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480' }}>Module Content <span style={{ fontWeight: 400, color: '#9aa2b4' }}>(Markdown)</span></label>
                          <button onClick={() => generateContent(m.id)} disabled={generating[m.id]}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, background: generating[m.id] ? '#e8e5ff' : 'linear-gradient(135deg, #6c63ff, #a78bfa)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: generating[m.id] ? 0.7 : 1 }}>
                            <Sparkles size={13} /> {generating[m.id] ? 'Generating…' : 'Generate with AI'}
                          </button>
                        </div>
                        <textarea value={form.content || ''} onChange={e => updateField(m.id, 'content', e.target.value)}
                          placeholder="Write content here or click 'Generate with AI'..."
                          style={{ ...inp, minHeight: 260, resize: 'vertical', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6 }} />
                      </div>
                      <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480' }}>Attachments <span style={{ fontWeight: 400, color: '#9aa2b4' }}>(PDF or video)</span></label>
                          <div>
                            <input ref={el => fileRefs.current[m.id] = el} type="file" accept=".pdf,video/mp4,video/webm,video/ogg" style={{ display: 'none' }} onChange={e => uploadFile(m.id, e)} />
                            <button onClick={() => fileRefs.current[m.id]?.click()} disabled={uploading[m.id]}
                              style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f0eeff', color: '#6c63ff', border: '1.5px dashed #6c63ff', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: uploading[m.id] ? 0.6 : 1 }}>
                              <Upload size={13} /> {uploading[m.id] ? 'Uploading…' : 'Upload File'}
                            </button>
                          </div>
                        </div>
                        {m.files?.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {m.files.map(f => (
                              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8f9fc', borderRadius: 8, padding: '8px 12px' }}>
                                {f.file_type === 'pdf' ? <FileText size={16} color="#e74c3c" /> : <Video size={16} color="#6c63ff" />}
                                <a href={f.file_url} target="_blank" rel="noreferrer" style={{ flex: 1, fontSize: 13, color: '#3a4260', fontWeight: 500, textDecoration: 'none' }}>{f.name}</a>
                                <span style={{ fontSize: 11, color: '#9aa2b4' }}>{f.file_type?.toUpperCase()}</span>
                                {f.size_bytes > 0 && <span style={{ fontSize: 11, color: '#9aa2b4' }}>{(f.size_bytes / 1024 / 1024).toFixed(1)} MB</span>}
                                <button onClick={() => deleteFile(m.id, f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', padding: 2 }}><X size={13} /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                        <button onClick={() => saveModule(m.id)} disabled={saving[m.id]}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer', opacity: saving[m.id] ? 0.7 : 1 }}>
                          <Save size={14} /> {saving[m.id] ? 'Saving…' : 'Save Module'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ═══ RESOURCE LIBRARY TAB ═════════════════════════════════════════════ */}
      {tab === 'resources' && (
        <div>
          {/* Upload + metadata form */}
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: 24, marginBottom: 22 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a2035', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Library size={17} color="#6c63ff" /> Upload New Resource
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Resource Name *</label>
                <input value={resForm.name} onChange={e => setResForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Exit Ticket Template" style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Label</label>
                <select value={resForm.label} onChange={e => setResForm(f => ({ ...f, label: e.target.value }))}
                  style={{ ...inp, background: '#fff' }}>
                  <option value="">— Select label —</option>
                  {LABELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Description</label>
              <input value={resForm.description} onChange={e => setResForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of this resource" style={inp} />
            </div>
            {/* Tag input */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 6 }}>Tags <span style={{ fontWeight: 400, color: '#9aa2b4' }}>(press Enter or comma to add)</span></label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '8px 10px', border: '1.5px solid #e0e3ea', borderRadius: 8, background: '#fff', minHeight: 40, alignItems: 'center' }}>
                {resForm.tags.map(t => (
                  <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f0eeff', color: '#6c63ff', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                    {t} <button onClick={() => removeResTag(t, false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c63ff', padding: 0, lineHeight: 1 }}>×</button>
                  </span>
                ))}
                <input
                  value={resForm.tagInput}
                  onChange={e => setResForm(f => ({ ...f, tagInput: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addResTag(resForm.tagInput, false); } }}
                  placeholder={resForm.tags.length === 0 ? 'formative, grade-3, reading…' : ''}
                  style={{ border: 'none', outline: 'none', fontSize: 13, flex: 1, minWidth: 120 }}
                />
              </div>
            </div>
            {/* File upload */}
            <input ref={resFileRef} type="file" accept=".pdf,video/mp4,video/webm,video/ogg" style={{ display: 'none' }} onChange={uploadResource} />
            <button onClick={() => { if (!resForm.name.trim()) { alert('Enter a resource name first'); return; } resFileRef.current?.click(); }}
              disabled={resUploading}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: resUploading ? '#e8e5ff' : '#6c63ff', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: resUploading ? 0.7 : 1 }}>
              <Upload size={16} /> {resUploading ? 'Uploading…' : 'Choose File & Upload'}
            </button>
            <p style={{ fontSize: 12, color: '#9aa2b4', marginTop: 8 }}>PDF (max 20 MB) · Video MP4/WebM (max 200 MB)</p>
          </div>

          {/* Filter bar */}
          {resources.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <input value={resFilter.search} onChange={e => setResFilter(f => ({ ...f, search: e.target.value }))}
                placeholder="Search resources…" style={{ ...inp, width: 200, flex: 'none' }} />
              <select value={resFilter.label} onChange={e => setResFilter(f => ({ ...f, label: e.target.value }))} style={{ ...inp, width: 160, flex: 'none', background: '#fff' }}>
                <option value="">All labels</option>
                {allLabels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select value={resFilter.type} onChange={e => setResFilter(f => ({ ...f, type: e.target.value }))} style={{ ...inp, width: 130, flex: 'none', background: '#fff' }}>
                <option value="">All types</option>
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
              </select>
              {allTags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                  {allTags.map(t => (
                    <button key={t} onClick={() => setResFilter(f => ({ ...f, tag: f.tag === t ? '' : t }))}
                      style={{ background: resFilter.tag === t ? '#6c63ff' : '#f0f2f7', color: resFilter.tag === t ? '#fff' : '#5a6480', border: 'none', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      #{t}
                    </button>
                  ))}
                </div>
              )}
              {(resFilter.search || resFilter.label || resFilter.type || resFilter.tag) && (
                <button onClick={() => setResFilter({ tag: '', label: '', type: '', search: '' })}
                  style={{ background: '#fdeaea', color: '#e74c3c', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Resource list */}
          {filteredResources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 50, background: '#fff', borderRadius: 14, color: '#9aa2b4' }}>
              <Library size={32} color="#d0d4e0" style={{ marginBottom: 12 }} />
              <p style={{ margin: 0 }}>{resources.length === 0 ? 'No resources yet. Upload your first resource above.' : 'No resources match the current filters.'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredResources.map(r => {
                const isEditingThis = editingRes?.id === r.id;
                return (
                  <div key={r.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '14px 18px', border: isEditingThis ? '2px solid #6c63ff' : '2px solid transparent' }}>
                    {isEditingThis ? (
                      // Inline edit mode
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 3 }}>Name</label>
                            <input value={editingRes.name} onChange={e => setEditingRes(f => ({ ...f, name: e.target.value }))} style={inp} />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 3 }}>Label</label>
                            <select value={editingRes.label || ''} onChange={e => setEditingRes(f => ({ ...f, label: e.target.value }))} style={{ ...inp, background: '#fff' }}>
                              <option value="">— None —</option>
                              {LABELS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                          </div>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 3 }}>Description</label>
                          <input value={editingRes.description || ''} onChange={e => setEditingRes(f => ({ ...f, description: e.target.value }))} style={inp} />
                        </div>
                        {/* File replacement */}
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 6 }}>File</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8f9fc', borderRadius: 8, padding: '8px 12px', border: '1.5px solid #e0e3ea' }}>
                            <div style={{ width: 30, height: 30, borderRadius: 7, background: editingRes.file_type === 'video' ? '#eeeeff' : '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {editingRes.file_type === 'video' ? <Video size={14} color="#6c63ff" /> : <FileText size={14} color="#e74c3c" />}
                            </div>
                            <span style={{ flex: 1, fontSize: 12, color: '#3a4260', fontWeight: editingRes._newFile ? 700 : 400 }}>
                              {editingRes._newFile ? `✓ Replaced: ${editingRes._newFile}` : <a href={editingRes.file_url} target="_blank" rel="noreferrer" style={{ color: '#3a4260', textDecoration: 'none' }}>Current file ({editingRes.file_type?.toUpperCase()})</a>}
                            </span>
                            <input ref={resReplaceRef} type="file" accept=".pdf,video/mp4,video/webm,video/ogg" style={{ display: 'none' }} onChange={replaceResFile} />
                            <button onClick={() => resReplaceRef.current?.click()} disabled={resReplacing}
                              style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f0eeff', color: '#6c63ff', border: '1.5px dashed #6c63ff', borderRadius: 7, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', opacity: resReplacing ? 0.6 : 1, whiteSpace: 'nowrap' }}>
                              <Upload size={11} /> {resReplacing ? 'Uploading…' : 'Replace'}
                            </button>
                          </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Tags</label>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '7px 9px', border: '1.5px solid #e0e3ea', borderRadius: 8, background: '#fff', minHeight: 38, alignItems: 'center' }}>
                            {editingRes.tags.map(t => (
                              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f0eeff', color: '#6c63ff', borderRadius: 20, padding: '2px 9px', fontSize: 12, fontWeight: 600 }}>
                                {t} <button onClick={() => removeResTag(t, true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c63ff', padding: 0 }}>×</button>
                              </span>
                            ))}
                            <input value={editingRes.tagInput} onChange={e => setEditingRes(f => ({ ...f, tagInput: e.target.value }))}
                              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addResTag(editingRes.tagInput, true); } }}
                              style={{ border: 'none', outline: 'none', fontSize: 12, flex: 1, minWidth: 100 }} placeholder="add tag…" />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={saveResEdit} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}><Check size={13} /> Save</button>
                          <button onClick={() => setEditingRes(null)} style={{ background: '#f0f2f7', color: '#5a6480', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      // Display mode
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: r.file_type === 'video' ? '#eeeeff' : '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {r.file_type === 'video' ? <Video size={20} color="#6c63ff" /> : <FileText size={20} color="#e74c3c" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <a href={r.file_url} target="_blank" rel="noreferrer" style={{ fontWeight: 700, fontSize: 14, color: '#1a2035', textDecoration: 'none' }}>{r.name}</a>
                            {r.label && <span style={{ fontSize: 11, background: '#f0eeff', color: '#6c63ff', borderRadius: 20, padding: '2px 9px', fontWeight: 600 }}>{r.label}</span>}
                            <span style={{ fontSize: 11, background: '#f0f2f7', color: '#7a8294', borderRadius: 20, padding: '2px 9px', fontWeight: 600 }}>{r.file_type?.toUpperCase()}</span>
                            {r.size_bytes > 0 && <span style={{ fontSize: 11, color: '#9aa2b4' }}>{(r.size_bytes / 1024 / 1024).toFixed(1)} MB</span>}
                          </div>
                          {r.description && <div style={{ fontSize: 12, color: '#7a8294', marginBottom: 4 }}>{r.description}</div>}
                          {r.tags?.length > 0 && (
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              {r.tags.map(t => (
                                <span key={t} style={{ fontSize: 11, background: '#f8f9fc', color: '#5a6480', border: '1px solid #e0e3ea', borderRadius: 20, padding: '1px 8px' }}>#{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button onClick={() => setEditingRes({ ...r, tagInput: '', _newFile: null })}
                            style={{ background: '#f0eeff', color: '#6c63ff', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer' }}>
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => deleteResource(r.id)}
                            style={{ background: '#fdeaea', color: '#e74c3c', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ QUESTION BANK TAB ═══════════════════════════════════════════════ */}
      {tab === 'questions' && (() => {
        const QOptionEditor = ({ form, setForm }) => (
          <div>
            {form.question_type === 'multiple_choice' && (
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 6 }}>Options & Correct Answer</label>
                {form.options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <input type="radio" name={`correct_${form.question_text?.slice(0,8) || 'q'}`} checked={form.correct_answer === String(i)} onChange={() => setForm(f => ({ ...f, correct_answer: String(i) }))} style={{ cursor: 'pointer', accentColor: '#6c63ff' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#6c63ff', width: 20 }}>{String.fromCharCode(65 + i)}.</span>
                    <input value={opt} onChange={e => setForm(f => ({ ...f, options: f.options.map((o, j) => j === i ? e.target.value : o) }))}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      style={{ flex: 1, padding: '6px 10px', border: `1.5px solid ${form.correct_answer === String(i) ? '#6c63ff' : '#e0e3ea'}`, borderRadius: 7, fontSize: 13, outline: 'none', background: form.correct_answer === String(i) ? '#f8f7ff' : '#fff' }} />
                    {form.correct_answer === String(i) && <Check size={13} color="#6c63ff" />}
                  </div>
                ))}
                <p style={{ fontSize: 11, color: '#9aa2b4', margin: '4px 0 0' }}>Click the radio button to mark the correct option.</p>
              </div>
            )}
            {form.question_type === 'true_false' && (
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 6 }}>Correct Answer</label>
                <div style={{ display: 'flex', gap: 16 }}>
                  {['true', 'false'].map(v => (
                    <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', padding: '8px 18px', borderRadius: 8, border: `2px solid ${form.correct_answer === v ? '#6c63ff' : '#e0e3ea'}`, background: form.correct_answer === v ? '#f0eeff' : '#fff' }}>
                      <input type="radio" checked={form.correct_answer === v} onChange={() => setForm(f => ({ ...f, correct_answer: v }))} style={{ accentColor: '#6c63ff' }} />
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{v === 'true' ? 'True' : 'False'}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {form.question_type === 'short_answer' && (
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Expected Answer (for auto-grading)</label>
                <input value={form.correct_answer} onChange={e => setForm(f => ({ ...f, correct_answer: e.target.value }))} placeholder="The exact text students must enter" style={{ width: '100%', padding: '8px 11px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}
          </div>
        );

        const filteredQs = questions.filter(q => {
          if (qFilter.type && q.question_type !== qFilter.type) return false;
          if (qFilter.search && !q.question_text.toLowerCase().includes(qFilter.search.toLowerCase())) return false;
          return true;
        });

        return (
          <div>
            {/* Add question form */}
            <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showQForm ? 16 : 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a2035', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HelpCircle size={17} color="#6c63ff" /> Add New Question
                </div>
                <button onClick={() => setShowQForm(v => !v)}
                  style={{ background: showQForm ? '#f0f2f7' : '#6c63ff', color: showQForm ? '#5a6480' : '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {showQForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add Question</>}
                </button>
              </div>
              {showQForm && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Question Text *</label>
                      <input value={qForm.question_text} onChange={e => setQForm(f => ({ ...f, question_text: e.target.value }))} placeholder="e.g. What is formative assessment?" style={{ width: '100%', padding: '8px 11px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Type</label>
                      <select value={qForm.question_type} onChange={e => setQForm(f => ({ ...f, question_type: e.target.value, correct_answer: e.target.value === 'true_false' ? 'true' : e.target.value === 'multiple_choice' ? '0' : '', options: e.target.value === 'multiple_choice' ? ['', '', '', ''] : [] }))}
                        style={{ width: '100%', padding: '8px 11px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' }}>
                        {Object.entries(Q_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Points</label>
                      <input type="number" min={1} value={qForm.points} onChange={e => setQForm(f => ({ ...f, points: Number(e.target.value) }))} style={{ width: '100%', padding: '8px 11px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <QOptionEditor form={qForm} setForm={setQForm} />
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Explanation <span style={{ fontWeight: 400, color: '#9aa2b4' }}>(shown to students after answering)</span></label>
                    <input value={qForm.explanation} onChange={e => setQForm(f => ({ ...f, explanation: e.target.value }))} placeholder="Optional: explain why this answer is correct" style={{ width: '100%', padding: '8px 11px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <button onClick={addQuestion} disabled={qSaving}
                    style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: qSaving ? 0.7 : 1 }}>
                    {qSaving ? 'Saving…' : 'Save Question'}
                  </button>
                </div>
              )}
            </div>

            {/* Filter bar */}
            {questions.length > 0 && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
                <input value={qFilter.search} onChange={e => setQFilter(f => ({ ...f, search: e.target.value }))} placeholder="Search questions…"
                  style={{ padding: '7px 11px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 12, outline: 'none', width: 200 }} />
                <select value={qFilter.type} onChange={e => setQFilter(f => ({ ...f, type: e.target.value }))}
                  style={{ padding: '7px 11px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 12, background: '#fff', outline: 'none' }}>
                  <option value="">All types</option>
                  {Object.entries(Q_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <span style={{ fontSize: 12, color: '#9aa2b4' }}>{filteredQs.length} question{filteredQs.length !== 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Question list */}
            {filteredQs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 50, background: '#fff', borderRadius: 14, color: '#9aa2b4' }}>
                <HelpCircle size={32} color="#d0d4e0" style={{ marginBottom: 10 }} />
                <p style={{ margin: 0 }}>{questions.length === 0 ? 'No questions yet. Add your first question above.' : 'No questions match the filter.'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredQs.map((q, qi) => {
                  const isEditing = editingQ?.id === q.id;
                  const typeBg = q.question_type === 'multiple_choice' ? '#e8f0ff' : q.question_type === 'true_false' ? '#e8fff4' : '#fff8e8';
                  const typeColor = q.question_type === 'multiple_choice' ? '#3a6aff' : q.question_type === 'true_false' ? '#2ecc71' : '#f0a500';
                  return (
                    <div key={q.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '14px 18px', border: isEditing ? '2px solid #6c63ff' : '2px solid transparent' }}>
                      {isEditing ? (
                        <div>
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px', gap: 10, marginBottom: 10 }}>
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 3 }}>Question Text</label>
                              <input value={editingQ.question_text} onChange={e => setEditingQ(f => ({ ...f, question_text: e.target.value }))} style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #e0e3ea', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 3 }}>Type</label>
                              <select value={editingQ.question_type} onChange={e => setEditingQ(f => ({ ...f, question_type: e.target.value, correct_answer: e.target.value === 'true_false' ? 'true' : e.target.value === 'multiple_choice' ? '0' : '', options: e.target.value === 'multiple_choice' ? (f.options?.length === 4 ? f.options : ['', '', '', '']) : [] }))}
                                style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #e0e3ea', borderRadius: 7, fontSize: 13, background: '#fff', outline: 'none' }}>
                                {Object.entries(Q_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 3 }}>Points</label>
                              <input type="number" min={1} value={editingQ.points} onChange={e => setEditingQ(f => ({ ...f, points: Number(e.target.value) }))} style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #e0e3ea', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                          </div>
                          <QOptionEditor form={editingQ} setForm={setEditingQ} />
                          <div style={{ marginBottom: 10 }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 3 }}>Explanation</label>
                            <input value={editingQ.explanation || ''} onChange={e => setEditingQ(f => ({ ...f, explanation: e.target.value }))} style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #e0e3ea', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={saveQEdit} disabled={qSaving} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}><Check size={13} /> Save</button>
                            <button onClick={() => setEditingQ(null)} style={{ background: '#f0f2f7', color: '#5a6480', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <span style={{ fontWeight: 700, fontSize: 12, color: '#9aa2b4', minWidth: 24, paddingTop: 2 }}>Q{qi + 1}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 600, fontSize: 14, color: '#1a2035' }}>{q.question_text}</span>
                                <span style={{ fontSize: 11, background: typeBg, color: typeColor, borderRadius: 20, padding: '2px 9px', fontWeight: 600 }}>{Q_TYPES[q.question_type]}</span>
                                <span style={{ fontSize: 11, color: '#9aa2b4' }}>{q.points} pt{q.points !== 1 ? 's' : ''}</span>
                              </div>
                              {q.question_type === 'multiple_choice' && (
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                                  {q.options.map((opt, i) => (
                                    <span key={i} style={{ fontSize: 12, padding: '2px 10px', borderRadius: 7, border: `1.5px solid ${String(q.correct_answer) === String(i) ? '#6c63ff' : '#e0e3ea'}`, background: String(q.correct_answer) === String(i) ? '#f0eeff' : '#f8f9fc', color: String(q.correct_answer) === String(i) ? '#6c63ff' : '#5a6480', fontWeight: String(q.correct_answer) === String(i) ? 700 : 400 }}>
                                      {String.fromCharCode(65 + i)}. {opt}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {q.question_type === 'true_false' && (
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#2ecc71' }}>✓ {q.correct_answer === 'true' ? 'True' : 'False'}</span>
                              )}
                              {q.question_type === 'short_answer' && (
                                <span style={{ fontSize: 12, color: '#7a8294' }}>Answer: <strong style={{ color: '#1a2035' }}>{q.correct_answer}</strong></span>
                              )}
                              {q.explanation && <div style={{ fontSize: 12, color: '#9aa2b4', marginTop: 4 }}>💡 {q.explanation}</div>}
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                              <button onClick={() => setEditingQ({ ...q })} style={{ background: '#f0eeff', color: '#6c63ff', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer' }}><Edit2 size={13} /></button>
                              <button onClick={() => deleteQuestion(q.id)} style={{ background: '#fdeaea', color: '#e74c3c', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer' }}><Trash2 size={13} /></button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* ═══ QUIZZES TAB ═════════════════════════════════════════════════════ */}
      {tab === 'quizzes' && (
        <div>
          {/* Create quiz form */}
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showQuizForm ? 16 : 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a2035', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClipboardList size={17} color="#6c63ff" /> Create Quiz / Exam
              </div>
              <button onClick={() => setShowQuizForm(v => !v)}
                style={{ background: showQuizForm ? '#f0f2f7' : '#6c63ff', color: showQuizForm ? '#5a6480' : '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                {showQuizForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> New Quiz</>}
              </button>
            </div>
            {showQuizForm && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Title *</label>
                    <input value={quizForm.title} onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Module 1 Quiz" style={{ width: '100%', padding: '8px 11px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Type</label>
                    <select value={quizForm.quiz_type} onChange={e => setQuizForm(f => ({ ...f, quiz_type: e.target.value }))} style={{ width: '100%', padding: '8px 11px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none' }}>
                      <option value="quiz">Quiz (practice)</option>
                      <option value="exam">Exam (formal)</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Description</label>
                  <input value={quizForm.description} onChange={e => setQuizForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional instructions for students" style={{ width: '100%', padding: '8px 11px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Linked Module</label>
                    <select value={quizForm.module_id} onChange={e => setQuizForm(f => ({ ...f, module_id: e.target.value }))} style={{ width: '100%', padding: '8px 11px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none' }}>
                      <option value="">Course-level</option>
                      {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Time Limit (mins, 0=none)</label>
                    <input type="number" min={0} value={quizForm.time_limit_mins} onChange={e => setQuizForm(f => ({ ...f, time_limit_mins: Number(e.target.value) }))} style={{ width: '100%', padding: '8px 11px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 4 }}>Pass Score (%)</label>
                    <input type="number" min={0} max={100} value={quizForm.pass_score} onChange={e => setQuizForm(f => ({ ...f, pass_score: Number(e.target.value) }))} style={{ width: '100%', padding: '8px 11px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 16 }}>
                  <input type="checkbox" checked={quizForm.randomize} onChange={e => setQuizForm(f => ({ ...f, randomize: e.target.checked }))} style={{ accentColor: '#6c63ff', width: 15, height: 15 }} />
                  <span style={{ fontSize: 13, color: '#5a6480', fontWeight: 500 }}>Randomize question order for each attempt</span>
                </label>
                <button onClick={addQuiz} disabled={quizSaving}
                  style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: quizSaving ? 0.7 : 1 }}>
                  {quizSaving ? 'Creating…' : 'Create Quiz'}
                </button>
              </div>
            )}
          </div>

          {/* Quiz list */}
          {quizzes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 50, background: '#fff', borderRadius: 14, color: '#9aa2b4' }}>
              <ClipboardList size={32} color="#d0d4e0" style={{ marginBottom: 10 }} />
              <p style={{ margin: 0 }}>No quizzes yet. Create your first quiz above, then add questions from the Question Bank.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {quizzes.map(z => {
                const isOpen = expandedQuiz === z.id;
                const detail = quizDetail[z.id];
                const inQuizIds = new Set((detail?.questions || []).map(q => q.id));
                const bankAvailable = questions.filter(q => !inQuizIds.has(q.id));
                const typeBg = z.quiz_type === 'exam' ? '#fff3e0' : '#f0eeff';
                const typeColor = z.quiz_type === 'exam' ? '#f0a500' : '#6c63ff';

                return (
                  <div key={z.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: isOpen ? '2px solid #6c63ff' : '2px solid transparent', overflow: 'hidden' }}>
                    {/* Quiz header */}
                    <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => openQuizDetail(z.id)}>
                      <span style={{ fontSize: 11, background: typeBg, color: typeColor, borderRadius: 20, padding: '3px 10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 0 }}>{z.quiz_type}</span>
                      <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: '#1a2035' }}>{z.title}</span>
                      <span style={{ fontSize: 12, color: '#9aa2b4', display: 'flex', alignItems: 'center', gap: 4 }}><HelpCircle size={12} /> {z.question_count || 0}q</span>
                      {z.time_limit_mins > 0 && <span style={{ fontSize: 12, color: '#9aa2b4', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {z.time_limit_mins}m</span>}
                      <span style={{ fontSize: 12, color: '#9aa2b4', display: 'flex', alignItems: 'center', gap: 4 }}><Target size={12} /> {z.pass_score}%</span>
                      {isOpen ? <ChevronUp size={15} color="#9aa2b4" /> : <ChevronDown size={15} color="#9aa2b4" />}
                      <button onClick={e => { e.stopPropagation(); deleteQuiz(z.id); }} style={{ background: '#fdeaea', color: '#e74c3c', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', marginLeft: 4 }}><Trash2 size={13} /></button>
                    </div>

                    {isOpen && (
                      <div style={{ padding: '0 18px 20px', borderTop: '1px solid #f0f2f7' }}>
                        {/* Edit quiz metadata */}
                        {editingQuiz?.id === z.id ? (
                          <div style={{ marginTop: 14, padding: 14, background: '#f8f9fc', borderRadius: 10, marginBottom: 16 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 3 }}>Title</label>
                                <input value={editingQuiz.title} onChange={e => setEditingQuiz(f => ({ ...f, title: e.target.value }))} style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #e0e3ea', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                              </div>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 3 }}>Type</label>
                                <select value={editingQuiz.quiz_type} onChange={e => setEditingQuiz(f => ({ ...f, quiz_type: e.target.value }))} style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #e0e3ea', borderRadius: 7, fontSize: 13, background: '#fff', outline: 'none' }}>
                                  <option value="quiz">Quiz</option><option value="exam">Exam</option>
                                </select>
                              </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                              <div><label style={{ fontSize: 11, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 3 }}>Time Limit (mins)</label><input type="number" min={0} value={editingQuiz.time_limit_mins} onChange={e => setEditingQuiz(f => ({ ...f, time_limit_mins: Number(e.target.value) }))} style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #e0e3ea', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} /></div>
                              <div><label style={{ fontSize: 11, fontWeight: 600, color: '#5a6480', display: 'block', marginBottom: 3 }}>Pass Score (%)</label><input type="number" min={0} max={100} value={editingQuiz.pass_score} onChange={e => setEditingQuiz(f => ({ ...f, pass_score: Number(e.target.value) }))} style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #e0e3ea', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} /></div>
                              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}><label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><input type="checkbox" checked={!!editingQuiz.randomize} onChange={e => setEditingQuiz(f => ({ ...f, randomize: e.target.checked }))} style={{ accentColor: '#6c63ff' }} /><span style={{ fontSize: 12, color: '#5a6480' }}>Randomize</span></label></div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={saveQuizEdit} disabled={quizSaving} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}><Check size={13} /> Save</button>
                              <button onClick={() => setEditingQuiz(null)} style={{ background: '#f0f2f7', color: '#5a6480', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ marginTop: 12, marginBottom: 14, display: 'flex', gap: 8 }}>
                            <button onClick={() => setEditingQuiz({ ...z })} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f0eeff', color: '#6c63ff', border: 'none', borderRadius: 7, padding: '6px 13px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}><Edit2 size={12} /> Edit Settings</button>
                          </div>
                        )}

                        {/* Questions in this quiz */}
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2035', marginBottom: 8 }}>Questions in this quiz ({detail?.questions?.length || 0})</div>
                        {!detail ? (
                          <div style={{ color: '#9aa2b4', fontSize: 13 }}>Loading…</div>
                        ) : detail.questions.length === 0 ? (
                          <div style={{ color: '#9aa2b4', fontSize: 13, background: '#f8f9fc', padding: '12px 16px', borderRadius: 8 }}>No questions added yet. Add from the bank below.</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                            {detail.questions.map((q, qi) => (
                              <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8f9fc', borderRadius: 8, padding: '9px 13px' }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#9aa2b4', minWidth: 22 }}>Q{qi + 1}</span>
                                <span style={{ flex: 1, fontSize: 13, color: '#1a2035' }}>{q.question_text}</span>
                                <span style={{ fontSize: 11, color: '#7a8294', background: '#eff1f7', borderRadius: 20, padding: '1px 8px' }}>{Q_TYPES[q.question_type]}</span>
                                <span style={{ fontSize: 11, color: '#9aa2b4' }}>{q.points}pt</span>
                                <button onClick={() => removeQFromQuiz(z.id, q.id)} style={{ background: '#fdeaea', color: '#e74c3c', border: 'none', borderRadius: 6, padding: '4px 7px', cursor: 'pointer' }}><X size={11} /></button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add from bank */}
                        {bankAvailable.length > 0 && (
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#5a6480', marginBottom: 8 }}>Add from Question Bank ({bankAvailable.length} available)</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 260, overflowY: 'auto', border: '1px solid #e8eaf0', borderRadius: 9, padding: 8 }}>
                              {bankAvailable.map((q, qi) => (
                                <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7, background: '#fff', border: '1px solid #f0f2f7' }}>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: '#c0c8dc', minWidth: 22 }}>{qi + 1}</span>
                                  <span style={{ flex: 1, fontSize: 13, color: '#3a4260' }}>{q.question_text}</span>
                                  <span style={{ fontSize: 11, color: '#7a8294', background: '#f0f2f7', borderRadius: 20, padding: '1px 8px', flexShrink: 0 }}>{Q_TYPES[q.question_type]}</span>
                                  <button onClick={() => addQToQuiz(z.id, q.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f0eeff', color: '#6c63ff', border: 'none', borderRadius: 6, padding: '5px 10px', fontWeight: 600, fontSize: 12, cursor: 'pointer', flexShrink: 0 }}><Plus size={11} /> Add</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {bankAvailable.length === 0 && questions.length === 0 && (
                          <p style={{ fontSize: 13, color: '#9aa2b4', margin: 0 }}>Go to the <strong>Question Bank</strong> tab to create questions first.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
