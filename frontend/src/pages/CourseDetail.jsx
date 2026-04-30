import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Star, BookOpen, ChevronDown, ChevronUp, Send, FileText, Video, Play, X, Maximize2, Minimize2, Library, ClipboardList, CheckCircle, XCircle, RotateCcw, Target, HelpCircle, Calendar, MapPin, ExternalLink, Radio, Zap } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [tab, setTab] = useState('overview');
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [discussions, setDiscussions] = useState([]);
  const [comment, setComment] = useState('');
  const [expandedModule, setExpandedModule] = useState(null);
  const [moduleProgress, setModuleProgress] = useState({});
  const [enrollment, setEnrollment] = useState(null);
  const [mediaModal, setMediaModal] = useState(null); // { file, files, moduleTitle }
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef(null);
  const [resources, setResources] = useState([]);
  const [resFilter, setResFilter] = useState({ tag: '', label: '', type: '', search: '' });

  // ── Quiz state ─────────────────────────────────────────────────────────
  const [quizzes, setQuizzes] = useState([]);
  const [quizView, setQuizView] = useState('list'); // 'list' | 'taking' | 'results'
  const [activeQuiz, setActiveQuiz] = useState(null); // full quiz with questions (no correct_answer)
  const [quizAnswers, setQuizAnswers] = useState({}); // { qId: answer }
  const [quizResult, setQuizResult] = useState(null); // { score, passed, feedback }
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizStep, setQuizStep] = useState(0); // current question index
  const [quizAttempts, setQuizAttempts] = useState({}); // { quizId: attempt }  

  const openMedia = (file, allFiles, moduleTitle) => {
    setMediaModal({ file, files: allFiles, moduleTitle });
    setIsFullscreen(false);
  };

  const toggleFullscreen = useCallback(() => {
    const el = playerRef.current;
    if (!el) return;
    const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    if (!fsEl) {
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      req?.call(el);
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      exit?.call(document);
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  useEffect(() => {
    api.get(`/courses/${id}`).then(res => setCourse(res.data));
    api.get(`/courses/${id}/discussions`).then(res => setDiscussions(res.data));
    api.get(`/courses/${id}/resources`).then(res => setResources(res.data)).catch(() => {});
    api.get(`/courses/${id}/quizzes`).then(res => {
      setQuizzes(res.data);
      res.data.forEach(z => {
        api.get(`/courses/${id}/quizzes/${z.id}/attempts/my`).then(r => {
          if (r.data) setQuizAttempts(prev => ({ ...prev, [z.id]: r.data }));
        }).catch(() => {});
      });
    }).catch(() => {});
    api.get('/enrollments/my').then(res => {
      const e = res.data.find(e => e.course_id === Number(id));
      if (e) { setEnrolled(true); setEnrollment(e); }
    }).catch(() => {});
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll`);
      setEnrolled(true);
    } catch (e) {
      if (e.response?.status === 409) setEnrolled(true);
    } finally { setEnrolling(false); }
  };

  const handleCompleteModule = async (moduleId) => {
    await api.post(`/enrollments/${id}/module/${moduleId}/complete`);
    setModuleProgress(prev => ({ ...prev, [moduleId]: true }));
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    const res = await api.post(`/courses/${id}/discussions`, { content: comment });
    setDiscussions(prev => [{ ...res.data, replies: [] }, ...prev]);
    setComment('');
  };

  if (!course) return <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>

      {/* ── Media Modal ── */}
      {mediaModal && (
        <div
          onClick={() => setMediaModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#1a2035', borderRadius: 18, width: '100%', maxWidth: 660, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>

            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px 10px' }}>
              <div>
                <div style={{ fontSize: 11, color: '#7a8294', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>Course Preview</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{course.title}</div>
              </div>
              <button onClick={() => setMediaModal(null)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {/* Player / Viewer */}
            <div ref={playerRef} style={{ background: '#0d1120', position: 'relative', ...(isFullscreen && { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }) }}>
              {mediaModal.file.file_type === 'video' ? (
                <video key={mediaModal.file.file_url} controls autoPlay
                  style={{ width: '100%', display: 'block', background: '#000', ...(isFullscreen ? { height: '100%', maxHeight: 'none' } : { maxHeight: 360 }) }}>
                  <source src={mediaModal.file.file_url} />
                  Your browser does not support video playback.
                </video>
              ) : (
                <iframe
                  key={mediaModal.file.file_url}
                  src={mediaModal.file.file_url}
                  title={mediaModal.file.name}
                  allowFullScreen
                  style={{ display: 'block', border: 'none', width: '100%', ...(isFullscreen ? { height: '100%' } : { height: 380 }) }} />
              )}
              {/* Fullscreen button */}
              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: 7, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)', zIndex: 10 }}>
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            </div>

            {/* Now playing label */}
            <div style={{ padding: '10px 20px 6px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 12, color: '#9aa2b4' }}>Now viewing</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginTop: 2 }}>{mediaModal.file.name}</div>
            </div>

            {/* File list */}
            {mediaModal.files.length > 1 && (
              <div style={{ padding: '14px 20px 20px' }}>
                <div style={{ color: '#9aa2b4', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Course Materials:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {mediaModal.files.map((f, fi) => {
                    const active = mediaModal.file.id === f.id;
                    return (
                      <div key={f.id}
                        onClick={() => setMediaModal(prev => ({ ...prev, file: f }))}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', background: active ? 'rgba(108,99,255,0.25)' : 'rgba(255,255,255,0.04)', border: active ? '1px solid rgba(108,99,255,0.5)' : '1px solid transparent', transition: 'background 0.15s' }}>
                        {/* Thumbnail icon */}
                        <div style={{ width: 50, height: 36, borderRadius: 7, background: active ? 'rgba(108,99,255,0.3)' : '#2a3250', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                          {f.file_type === 'video'
                            ? <Video size={16} color={active ? '#a09aff' : '#5a6480'} />
                            : <FileText size={16} color={active ? '#ff8a80' : '#5a6480'} />}
                          {active && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(108,99,255,0.2)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Play size={12} color="#fff" style={{ marginLeft: 2 }} />
                            </div>
                          )}
                        </div>
                        <span style={{ flex: 1, color: active ? '#fff' : '#c0c8dc', fontSize: 13, fontWeight: active ? 600 : 400, lineHeight: 1.4 }}>{f.name}</span>
                        <span style={{ fontSize: 11, color: '#5a6480', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 20 }}>{f.file_type?.toUpperCase()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6c63ff', cursor: 'pointer', fontSize: 14, marginBottom: 20, padding: 0 }}>
        <ArrowLeft size={16} /> Back to Discover
      </button>

      {/* Hero */}
      <div style={{ borderRadius: 16, overflow: 'hidden', height: 260, position: 'relative', marginBottom: 28, background: '#1a2035' }}>
        {course.image_url && <img src={course.image_url} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />}
        <div style={{ position: 'absolute', inset: 0, padding: '24px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {[course.category, course.level].filter(Boolean).map(tag => (
              <span key={tag} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, padding: '3px 10px', borderRadius: 20 }}>{tag}</span>
            ))}
          </div>
          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 700, margin: 0, maxWidth: 700, lineHeight: 1.3 }}>{course.title}</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28 }}>
        {/* Left */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #e8eaf0', marginBottom: 24 }}>
            {['overview', `modules (${course.modules?.length || 0})`, `resources (${resources.length})`, `quizzes (${quizzes.length})`, 'discussion'].map(t => {
              const key = t.split(' ')[0];
              return (
                <button key={key} onClick={() => setTab(key)}
                  style={{ padding: '10px 20px', border: 'none', background: 'none', fontWeight: tab === key ? 700 : 400, color: tab === key ? '#6c63ff' : '#7a8294', borderBottom: tab === key ? '2px solid #6c63ff' : '2px solid transparent', marginBottom: -2, cursor: 'pointer', fontSize: 14 }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              );
            })}
          </div>

          {tab === 'overview' && (
            <div>
              {/* ── Modality-specific info card ── */}
              {course.modality === 'Live Session' && (
                <div style={{ background: 'linear-gradient(135deg,#f5f4ff,#ede9fe)', borderRadius: 12, padding: 20, marginBottom: 16, border: '1.5px solid #d4d0ff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#6c63ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Radio size={16} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#1a2035' }}>Live Session</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {course.start_time && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Calendar size={15} color="#6c63ff" />
                        <div>
                          <div style={{ fontSize: 12, color: '#7a8294' }}>Starts</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a2035' }}>{new Date(course.start_time).toLocaleString()}</div>
                        </div>
                      </div>
                    )}
                    {course.end_time && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Clock size={15} color="#6c63ff" />
                        <div>
                          <div style={{ fontSize: 12, color: '#7a8294' }}>Ends</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a2035' }}>{new Date(course.end_time).toLocaleString()}</div>
                        </div>
                      </div>
                    )}
                    {course.max_seats && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Users size={15} color="#6c63ff" />
                        <div>
                          <div style={{ fontSize: 12, color: '#7a8294' }}>Capacity</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a2035' }}>
                            {course.enrolled_count} / {course.max_seats} seats
                            {course.enrolled_count >= course.max_seats && <span style={{ marginLeft: 8, background: '#fdeaea', color: '#e74c3c', fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>Full</span>}
                          </div>
                        </div>
                      </div>
                    )}
                    {course.meeting_url && enrolled && (
                      <a href={course.meeting_url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 4, background: '#6c63ff', color: '#fff', borderRadius: 9, padding: '10px 18px', fontWeight: 700, fontSize: 14, textDecoration: 'none', width: 'fit-content' }}>
                        <ExternalLink size={14} /> Join Session
                      </a>
                    )}
                    {course.meeting_url && !enrolled && (
                      <p style={{ fontSize: 13, color: '#7a8294', margin: '4px 0 0' }}>Enroll to access the meeting link.</p>
                    )}
                  </div>
                </div>
              )}

              {course.modality === 'Blended' && (course.location || course.start_time) && (
                <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius: 12, padding: 20, marginBottom: 16, border: '1.5px solid #a7f3c8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={16} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#1a2035' }}>Blended Learning</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {course.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <MapPin size={15} color="#27ae60" />
                        <div>
                          <div style={{ fontSize: 12, color: '#7a8294' }}>Location</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a2035' }}>{course.location}</div>
                        </div>
                      </div>
                    )}
                    {course.start_time && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Calendar size={15} color="#27ae60" />
                        <div>
                          <div style={{ fontSize: 12, color: '#7a8294' }}>Session date</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a2035' }}>
                            {new Date(course.start_time).toLocaleString()}
                            {course.end_time && <span style={{ color: '#7a8294', fontWeight: 400 }}> – {new Date(course.end_time).toLocaleTimeString()}</span>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {course.modality === 'Microlearning' && (
                <div style={{ background: 'linear-gradient(135deg,#fff7ed,#fef3c7)', borderRadius: 12, padding: 16, marginBottom: 16, border: '1.5px solid #fcd34d', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Zap size={18} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1a2035' }}>Microlearning Format</div>
                    <div style={{ fontSize: 13, color: '#7a8294', marginTop: 2 }}>Short, focused modules designed to be completed in under 10 minutes each.</div>
                  </div>
                </div>
              )}

              {course.modality === 'Video' && (
                <div style={{ background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)', borderRadius: 12, padding: 16, marginBottom: 16, border: '1.5px solid #7dd3fc', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Video size={18} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1a2035' }}>Video Course</div>
                    <div style={{ fontSize: 13, color: '#7a8294', marginTop: 2 }}>Learn at your own pace through on-demand video lectures.</div>
                  </div>
                </div>
              )}

              <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>About This Course</h3>
                <p style={{ color: '#5a6480', lineHeight: 1.7, margin: 0 }}>{course.description}</p>
              </div>
              {course.competency_tags?.length > 0 && (
                <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>Competency Areas</h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {course.competency_tags.map(tag => (
                      <span key={tag} style={{ background: '#f0eeff', color: '#6c63ff', padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'modules' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {course.modules?.map((m, i) => (
                <div key={m.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                  <div
                    onClick={() => setExpandedModule(expandedModule === m.id ? null : m.id)}
                    style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: moduleProgress[m.id] ? '#2ecc71' : '#f0eeff', color: moduleProgress[m.id] ? '#fff' : '#6c63ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {moduleProgress[m.id] ? '✓' : i + 1}
                    </div>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: '#1a2035' }}>{m.title}</span>
                    <span style={{ fontSize: 12, color: '#9aa2b4', marginRight: 8 }}>{m.duration_mins} min</span>
                    {expandedModule === m.id ? <ChevronUp size={16} color="#9aa2b4" /> : <ChevronDown size={16} color="#9aa2b4" />}
                  </div>
                  {expandedModule === m.id && (
                    <div style={{ padding: '0 20px 20px 62px' }}>
                      {/* Description */}
                      {m.description && (
                        <p style={{ color: '#5a6480', fontSize: 13, margin: '0 0 14px', lineHeight: 1.6 }}>{m.description}</p>
                      )}

                      {/* Video embed — click thumbnail to open modal */}
                      {m.video_url && (
                        <div style={{ marginBottom: 16, position: 'relative', cursor: 'pointer', borderRadius: 10, overflow: 'hidden', background: '#0d1120' }}
                          onClick={() => openMedia({ id: 'intro', name: 'Intro Video', file_url: m.video_url, file_type: 'video' }, [{ id: 'intro', name: 'Intro Video', file_url: m.video_url, file_type: 'video' }, ...(m.files || [])], m.title)}>
                          <div style={{ width: '100%', paddingTop: '42%', position: 'relative' }}>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1a2035,#2a3050)' }}>
                              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(108,99,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Play size={22} color="#fff" style={{ marginLeft: 3 }} />
                              </div>
                            </div>
                          </div>
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 14px', background: 'linear-gradient(transparent,rgba(0,0,0,0.7))', color: '#fff', fontSize: 12, fontWeight: 600 }}>Click to play intro video</div>
                        </div>
                      )}

                      {/* Module content */}
                      {m.content && (
                        <div style={{ background: '#f8f9fc', borderRadius: 10, padding: '16px 20px', marginBottom: 14, fontSize: 13, color: '#3a4260', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'inherit', border: '1px solid #e8eaf0' }}>
                          {m.content}
                        </div>
                      )}

                      {/* File attachments — click to open media modal */}
                      {m.files?.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#7a8294', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Course Materials</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {m.files.map((f, fi) => (
                              <div key={f.id}
                                onClick={() => openMedia(f, m.video_url ? [{ id: 'intro', name: 'Intro Video', file_url: m.video_url, file_type: 'video' }, ...m.files] : m.files, m.title)}
                                style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #e0e3ea', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#6c63ff'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#e0e3ea'}>
                                <div style={{ width: 38, height: 28, borderRadius: 6, background: f.file_type === 'video' ? '#eeeeff' : '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  {f.file_type === 'video'
                                    ? <Play size={13} color="#6c63ff" />
                                    : <FileText size={13} color="#e74c3c" />}
                                </div>
                                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#1a2035' }}>{f.name}</span>
                                <span style={{ fontSize: 11, color: '#9aa2b4', background: '#f0f2f7', padding: '2px 8px', borderRadius: 20 }}>{f.file_type?.toUpperCase()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mark complete */}
                      {enrolled && !moduleProgress[m.id] && (
                        <button onClick={() => handleCompleteModule(m.id)}
                          style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                          Mark Complete
                        </button>
                      )}
                      {moduleProgress[m.id] && (
                        <span style={{ fontSize: 13, color: '#2ecc71', fontWeight: 600 }}>✓ Completed</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'resources' && (() => {
            const allTags = [...new Set(resources.flatMap(r => r.tags || []))].sort();
            const allLabels = [...new Set(resources.map(r => r.label).filter(Boolean))].sort();
            const filtered = resources.filter(r => {
              if (resFilter.label && r.label !== resFilter.label) return false;
              if (resFilter.type && r.file_type !== resFilter.type) return false;
              if (resFilter.tag && !(r.tags || []).includes(resFilter.tag)) return false;
              if (resFilter.search) {
                const s = resFilter.search.toLowerCase();
                return r.name.toLowerCase().includes(s) || (r.description || '').toLowerCase().includes(s) || (r.tags || []).join(' ').includes(s);
              }
              return true;
            });
            return (
              <div>
                {/* Filter bar */}
                {resources.length > 0 && (
                  <div style={{ background: '#fff', borderRadius: 12, padding: '12px 16px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input value={resFilter.search} onChange={e => setResFilter(f => ({ ...f, search: e.target.value }))}
                      placeholder="Search resources…"
                      style={{ padding: '7px 11px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 12, outline: 'none', width: 180, flex: 'none' }} />
                    {allLabels.length > 0 && (
                      <select value={resFilter.label} onChange={e => setResFilter(f => ({ ...f, label: e.target.value }))}
                        style={{ padding: '7px 11px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 12, background: '#fff', outline: 'none', flex: 'none' }}>
                        <option value="">All labels</option>
                        {allLabels.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    )}
                    <select value={resFilter.type} onChange={e => setResFilter(f => ({ ...f, type: e.target.value }))}
                      style={{ padding: '7px 11px', border: '1.5px solid #e0e3ea', borderRadius: 8, fontSize: 12, background: '#fff', outline: 'none', flex: 'none' }}>
                      <option value="">All types</option>
                      <option value="pdf">PDF</option>
                      <option value="video">Video</option>
                    </select>
                    {allTags.map(t => (
                      <button key={t} onClick={() => setResFilter(f => ({ ...f, tag: f.tag === t ? '' : t }))}
                        style={{ background: resFilter.tag === t ? '#6c63ff' : '#f0f2f7', color: resFilter.tag === t ? '#fff' : '#5a6480', border: 'none', borderRadius: 20, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        #{t}
                      </button>
                    ))}
                    {(resFilter.search || resFilter.label || resFilter.type || resFilter.tag) && (
                      <button onClick={() => setResFilter({ tag: '', label: '', type: '', search: '' })}
                        style={{ background: '#fdeaea', color: '#e74c3c', border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        Clear
                      </button>
                    )}
                  </div>
                )}

                {/* Resource cards */}
                {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 50, background: '#fff', borderRadius: 14, color: '#9aa2b4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <Library size={32} color="#d0d4e0" style={{ marginBottom: 10 }} />
                    <p style={{ margin: 0 }}>{resources.length === 0 ? 'No resources have been added to this course yet.' : 'No resources match the current filters.'}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filtered.map(r => (
                      <div key={r.id}
                        onClick={() => openMedia(r, filtered, course.title)}
                        style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 12, padding: '14px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer', border: '2px solid transparent', transition: 'border-color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#6c63ff'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                        <div style={{ width: 46, height: 46, borderRadius: 10, background: r.file_type === 'video' ? '#eeeeff' : '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {r.file_type === 'video' ? <Play size={20} color="#6c63ff" /> : <FileText size={20} color="#e74c3c" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: '#1a2035' }}>{r.name}</span>
                            {r.label && <span style={{ fontSize: 11, background: '#f0eeff', color: '#6c63ff', borderRadius: 20, padding: '2px 9px', fontWeight: 600 }}>{r.label}</span>}
                            <span style={{ fontSize: 11, background: '#f0f2f7', color: '#7a8294', borderRadius: 20, padding: '2px 9px', fontWeight: 600 }}>{r.file_type?.toUpperCase()}</span>
                          </div>
                          {r.description && <div style={{ fontSize: 12, color: '#7a8294', marginBottom: 5 }}>{r.description}</div>}
                          {r.tags?.length > 0 && (
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              {r.tags.map(t => (
                                <span key={t} style={{ fontSize: 11, background: '#f8f9fc', color: '#5a6480', border: '1px solid #e0e3ea', borderRadius: 20, padding: '1px 8px' }}>#{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ color: '#6c63ff', flexShrink: 0, opacity: 0.7 }}>
                          {r.file_type === 'video' ? <Play size={16} /> : <FileText size={16} />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── QUIZZES TAB ── */}
          {tab === 'quizzes' && (() => {
            const startQuiz = async (z) => {
              const r = await api.get(`/courses/${id}/quizzes/${z.id}`);
              setActiveQuiz(r.data);
              setQuizAnswers({});
              setQuizResult(null);
              setQuizStep(0);
              setQuizView('taking');
            };
            const submitQuiz = async () => {
              setQuizSubmitting(true);
              try {
                const r = await api.post(`/courses/${id}/quizzes/${activeQuiz.id}/attempt`, { answers: quizAnswers });
                setQuizResult(r.data);
                setQuizAttempts(prev => ({ ...prev, [activeQuiz.id]: r.data }));
                setQuizView('results');
              } catch (e) { alert(e.response?.data?.error || 'Submission failed'); }
              finally { setQuizSubmitting(false); }
            };

            if (quizView === 'taking' && activeQuiz) {
              const qs = activeQuiz.questions || [];
              const q = qs[quizStep];
              const answered = Object.keys(quizAnswers).length;
              const progress = qs.length > 0 ? Math.round((answered / qs.length) * 100) : 0;
              return (
                <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  {/* Quiz header bar */}
                  <div style={{ background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{activeQuiz.quiz_type}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{activeQuiz.title}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {activeQuiz.time_limit_mins > 0 && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={13} /> {activeQuiz.time_limit_mins}m</span>}
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>{quizStep + 1} / {qs.length}</span>
                      <button onClick={() => setQuizView('list')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}>Exit</button>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 4, background: '#e8eaf0' }}><div style={{ height: '100%', background: '#6c63ff', width: `${progress}%`, transition: 'width 0.3s' }} /></div>
                  {/* Question */}
                  <div style={{ padding: '28px 28px 20px' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#9aa2b4', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Question {quizStep + 1}</div>
                    <div style={{ fontSize: 17, fontWeight: 600, color: '#1a2035', lineHeight: 1.5, marginBottom: 22 }}>{q?.question_text}</div>
                    {/* Options */}
                    {q?.question_type === 'multiple_choice' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(q.options || []).map((opt, i) => {
                          const sel = quizAnswers[q.id] === String(i);
                          return (
                            <div key={i} onClick={() => setQuizAnswers(a => ({ ...a, [q.id]: String(i) }))}
                              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', borderRadius: 10, border: `2px solid ${sel ? '#6c63ff' : '#e8eaf0'}`, background: sel ? '#f0eeff' : '#f8f9fc', cursor: 'pointer', transition: 'all 0.15s' }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${sel ? '#6c63ff' : '#d0d4e0'}`, background: sel ? '#6c63ff' : '#fff', color: sel ? '#fff' : '#9aa2b4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{String.fromCharCode(65 + i)}</div>
                              <span style={{ fontSize: 14, color: sel ? '#1a2035' : '#3a4260', fontWeight: sel ? 600 : 400 }}>{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {q?.question_type === 'true_false' && (
                      <div style={{ display: 'flex', gap: 12 }}>
                        {['true', 'false'].map(v => {
                          const sel = quizAnswers[q.id] === v;
                          return (
                            <div key={v} onClick={() => setQuizAnswers(a => ({ ...a, [q.id]: v }))}
                              style={{ flex: 1, padding: '16px', borderRadius: 10, border: `2px solid ${sel ? '#6c63ff' : '#e8eaf0'}`, background: sel ? '#f0eeff' : '#f8f9fc', cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: 15, color: sel ? '#6c63ff' : '#5a6480', transition: 'all 0.15s' }}>
                              {v === 'true' ? '✓ True' : '✗ False'}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {q?.question_type === 'short_answer' && (
                      <input value={quizAnswers[q.id] || ''} onChange={e => setQuizAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                        placeholder="Type your answer here…"
                        style={{ width: '100%', padding: '13px 16px', border: '2px solid #e8eaf0', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                    )}
                  </div>
                  {/* Navigation */}
                  <div style={{ padding: '0 28px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={() => setQuizStep(s => Math.max(0, s - 1))} disabled={quizStep === 0}
                      style={{ background: '#f0f2f7', color: '#5a6480', border: 'none', borderRadius: 9, padding: '10px 20px', fontWeight: 600, cursor: quizStep === 0 ? 'default' : 'pointer', opacity: quizStep === 0 ? 0.4 : 1 }}>← Previous</button>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 300 }}>
                      {qs.map((qq, i) => (
                        <div key={i} onClick={() => setQuizStep(i)}
                          style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${i === quizStep ? '#6c63ff' : quizAnswers[qq.id] !== undefined ? '#2ecc71' : '#e0e3ea'}`, background: i === quizStep ? '#6c63ff' : quizAnswers[qq.id] !== undefined ? '#e8fff4' : '#fff', color: i === quizStep ? '#fff' : '#5a6480', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    {quizStep < qs.length - 1
                      ? <button onClick={() => setQuizStep(s => s + 1)} style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>Next →</button>
                      : <button onClick={submitQuiz} disabled={quizSubmitting || answered < qs.length}
                          style={{ background: answered < qs.length ? '#d0d4e0' : '#2ecc71', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 20px', fontWeight: 700, cursor: answered < qs.length ? 'default' : 'pointer' }}>
                          {quizSubmitting ? 'Submitting…' : `Submit (${answered}/${qs.length})`}
                        </button>}
                  </div>
                </div>
              );
            }

            if (quizView === 'results' && quizResult && activeQuiz) {
              const qs = activeQuiz.questions || [];
              return (
                <div>
                  {/* Score card */}
                  <div style={{ background: quizResult.passed ? 'linear-gradient(135deg,#2ecc71,#27ae60)' : 'linear-gradient(135deg,#e74c3c,#c0392b)', borderRadius: 14, padding: '28px 28px 24px', marginBottom: 20, color: '#fff', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{activeQuiz.title}</div>
                    <div style={{ fontSize: 56, fontWeight: 900, marginBottom: 6 }}>{quizResult.score}%</div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{quizResult.passed ? '🎉 Passed!' : '❌ Not passed'}</div>
                    <div style={{ fontSize: 13, opacity: 0.8 }}>Pass score: {activeQuiz.pass_score}%</div>
                  </div>
                  {/* Per-question review */}
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2035', marginBottom: 12 }}>Review</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    {qs.map((q, qi) => {
                      const fb = quizResult.feedback?.[q.id];
                      const correct = fb?.correct;
                      const myAnswer = quizAnswers[q.id];
                      const correctAnswer = fb?.correct_answer;
                      return (
                        <div key={q.id} style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderLeft: `4px solid ${correct ? '#2ecc71' : '#e74c3c'}` }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            {correct ? <CheckCircle size={18} color="#2ecc71" style={{ flexShrink: 0, marginTop: 2 }} /> : <XCircle size={18} color="#e74c3c" style={{ flexShrink: 0, marginTop: 2 }} />}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 14, color: '#1a2035', marginBottom: 6 }}>Q{qi + 1}. {q.question_text}</div>
                              {q.question_type === 'multiple_choice' && (
                                <div style={{ fontSize: 13 }}>
                                  <span style={{ color: '#9aa2b4' }}>Your answer: </span>
                                  <span style={{ fontWeight: 600, color: correct ? '#2ecc71' : '#e74c3c' }}>
                                    {myAnswer !== undefined ? `${String.fromCharCode(65 + Number(myAnswer))}. ${q.options?.[Number(myAnswer)] || '—'}` : '—'}
                                  </span>
                                  {!correct && <span style={{ color: '#9aa2b4' }}> · Correct: <strong style={{ color: '#2ecc71' }}>{String.fromCharCode(65 + Number(correctAnswer))}. {q.options?.[Number(correctAnswer)]}</strong></span>}
                                </div>
                              )}
                              {q.question_type === 'true_false' && (
                                <div style={{ fontSize: 13 }}>
                                  <span style={{ color: '#9aa2b4' }}>Your answer: </span>
                                  <span style={{ fontWeight: 600, color: correct ? '#2ecc71' : '#e74c3c' }}>{myAnswer === 'true' ? 'True' : myAnswer === 'false' ? 'False' : '—'}</span>
                                  {!correct && <span style={{ color: '#9aa2b4' }}> · Correct: <strong style={{ color: '#2ecc71' }}>{correctAnswer === 'true' ? 'True' : 'False'}</strong></span>}
                                </div>
                              )}
                              {q.question_type === 'short_answer' && (
                                <div style={{ fontSize: 13 }}>
                                  <span style={{ color: '#9aa2b4' }}>Your answer: </span><span style={{ fontWeight: 600, color: correct ? '#2ecc71' : '#e74c3c' }}>{myAnswer || '—'}</span>
                                  {!correct && <span style={{ color: '#9aa2b4' }}> · Expected: <strong style={{ color: '#2ecc71' }}>{correctAnswer}</strong></span>}
                                </div>
                              )}
                              {q.explanation && <div style={{ fontSize: 12, color: '#7a8294', marginTop: 6, background: '#f8f9fc', borderRadius: 6, padding: '6px 10px' }}>💡 {q.explanation}</div>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => { setQuizView('list'); setActiveQuiz(null); }} style={{ background: '#f0f2f7', color: '#5a6480', border: 'none', borderRadius: 9, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>← All Quizzes</button>
                    <button onClick={() => startQuiz(activeQuiz)} style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><RotateCcw size={14} /> Retry</button>
                  </div>
                </div>
              );
            }

            // Quiz list view
            return (
              <div>
                {quizzes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 50, background: '#fff', borderRadius: 14, color: '#9aa2b4' }}>
                    <ClipboardList size={32} color="#d0d4e0" style={{ marginBottom: 10 }} />
                    <p style={{ margin: 0 }}>No quizzes available for this course yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {quizzes.map(z => {
                      const attempt = quizAttempts[z.id];
                      const typeBg = z.quiz_type === 'exam' ? '#fff3e0' : '#f0eeff';
                      const typeColor = z.quiz_type === 'exam' ? '#f0a500' : '#6c63ff';
                      return (
                        <div key={z.id} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ width: 50, height: 50, borderRadius: 12, background: typeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <ClipboardList size={22} color={typeColor} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, fontSize: 15, color: '#1a2035' }}>{z.title}</span>
                              <span style={{ fontSize: 11, background: typeBg, color: typeColor, borderRadius: 20, padding: '2px 9px', fontWeight: 700, textTransform: 'uppercase' }}>{z.quiz_type}</span>
                              {attempt && <span style={{ fontSize: 11, background: attempt.passed ? '#e8fff4' : '#fdeaea', color: attempt.passed ? '#2ecc71' : '#e74c3c', borderRadius: 20, padding: '2px 9px', fontWeight: 700 }}>Best: {attempt.score}%</span>}
                            </div>
                            {z.description && <div style={{ fontSize: 13, color: '#7a8294', marginBottom: 4 }}>{z.description}</div>}
                            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 12, color: '#9aa2b4', display: 'flex', alignItems: 'center', gap: 4 }}><HelpCircle size={12} /> {z.question_count || 0} questions</span>
                              {z.time_limit_mins > 0 && <span style={{ fontSize: 12, color: '#9aa2b4', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {z.time_limit_mins} min</span>}
                              <span style={{ fontSize: 12, color: '#9aa2b4', display: 'flex', alignItems: 'center', gap: 4 }}><Target size={12} /> Pass: {z.pass_score}%</span>
                            </div>
                          </div>
                          <button onClick={() => startQuiz(z)} disabled={!z.question_count}
                            style={{ background: z.question_count ? '#6c63ff' : '#e0e3ea', color: z.question_count ? '#fff' : '#9aa2b4', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: z.question_count ? 'pointer' : 'default', flexShrink: 0 }}>
                            {attempt ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><RotateCcw size={13} /> Retry</span> : 'Start'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {tab === 'discussion' && (
            <div>
              {enrolled && (
                <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Share your thoughts or ask a question..."
                    style={{ width: '100%', border: '1px solid #e0e3ea', borderRadius: 8, padding: 12, fontSize: 14, resize: 'vertical', minHeight: 80, outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button onClick={handleComment} style={{ marginTop: 10, background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Send size={14} /> Post
                  </button>
                </div>
              )}
              {discussions.map(d => (
                <div key={d.id} style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6c63ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{d.user_name?.[0]}</div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{d.user_name}</span>
                    <span style={{ fontSize: 12, color: '#9aa2b4' }}>{new Date(d.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ margin: 0, color: '#3a4260', fontSize: 14, lineHeight: 1.6 }}>{d.content}</p>
                  {d.replies?.map(r => (
                    <div key={r.id} style={{ marginLeft: 42, marginTop: 10, paddingLeft: 14, borderLeft: '3px solid #f0eeff' }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{r.user_name}: </span>
                      <span style={{ fontSize: 13, color: '#5a6480' }}>{r.content}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ alignSelf: 'start', position: 'sticky', top: 20 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            {/* Modality badge */}
            {course.modality && (() => {
              const modalityConfig = {
                'Live Session': { bg: '#f5f4ff', color: '#6c63ff', border: '#d4d0ff', Icon: Radio },
                'Blended': { bg: '#f0fdf4', color: '#27ae60', border: '#a7f3c8', Icon: BookOpen },
                'Microlearning': { bg: '#fff7ed', color: '#f59e0b', border: '#fcd34d', Icon: Zap },
                'Video': { bg: '#f0f9ff', color: '#0284c7', border: '#7dd3fc', Icon: Video },
                'Self-Paced': { bg: '#f8f9fc', color: '#5a6480', border: '#e0e3ea', Icon: Clock },
              };
              const cfg = modalityConfig[course.modality] || modalityConfig['Self-Paced'];
              const { bg, color, border, Icon: MIcon } = cfg;
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: bg, border: `1.5px solid ${border}`, borderRadius: 10, padding: '9px 14px', marginBottom: 16 }}>
                  <MIcon size={15} color={color} />
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{course.modality}</span>
                </div>
              );
            })()}

            {[
              { icon: Clock, label: 'Duration', value: `${course.duration_hours}h` },
              { icon: Users, label: 'Enrolled', value: course.max_seats ? `${course.enrolled_count} / ${course.max_seats}` : course.enrolled_count },
              { icon: Star, label: 'Rating', value: `${course.rating}/5` },
              { icon: BookOpen, label: 'Modules', value: course.modules?.length || 0 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f2f7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7a8294', fontSize: 14 }}>
                  <Icon size={16} /> {label}
                </div>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#1a2035' }}>{value}</span>
              </div>
            ))}

            {/* Live Session schedule in sidebar */}
            {course.modality === 'Live Session' && course.start_time && (
              <div style={{ padding: '12px 0', borderBottom: '1px solid #f0f2f7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7a8294', fontSize: 13, marginBottom: 4 }}>
                  <Calendar size={14} /> Schedule
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2035' }}>{new Date(course.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div style={{ fontSize: 12, color: '#5a6480', marginTop: 2 }}>
                  {new Date(course.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  {course.end_time && ` – ${new Date(course.end_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`}
                </div>
              </div>
            )}

            {/* Blended location in sidebar */}
            {course.modality === 'Blended' && course.location && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f2f7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7a8294', fontSize: 14 }}>
                  <MapPin size={16} /> Location
                </div>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#1a2035', textAlign: 'right', maxWidth: 140 }}>{course.location}</span>
              </div>
            )}

            {enrolled ? (
              <div style={{ marginTop: 20, background: '#f0fdf4', borderRadius: 8, padding: '10px 16px', textAlign: 'center', color: '#2ecc71', fontWeight: 600 }}>
                ✓ Enrolled {enrollment?.progress > 0 ? `(${enrollment.progress}%)` : ''}
              </div>
            ) : (
              <button onClick={handleEnroll} disabled={enrolling || (course.modality === 'Live Session' && course.max_seats && course.enrolled_count >= course.max_seats)}
                style={{ width: '100%', marginTop: 20, background: (course.modality === 'Live Session' && course.max_seats && course.enrolled_count >= course.max_seats) ? '#d0d4e0' : '#6c63ff', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontWeight: 700, fontSize: 15, cursor: (course.modality === 'Live Session' && course.max_seats && course.enrolled_count >= course.max_seats) ? 'default' : 'pointer' }}>
                {enrolling ? 'Enrolling...' : (course.modality === 'Live Session' && course.max_seats && course.enrolled_count >= course.max_seats) ? 'Session Full' : 'Enroll Now'}
              </button>
            )}

            {/* Live Session join button in sidebar */}
            {course.modality === 'Live Session' && course.meeting_url && enrolled && (
              <a href={course.meeting_url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10, background: '#f5f4ff', color: '#6c63ff', border: '1.5px solid #d4d0ff', borderRadius: 10, padding: '11px', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                <ExternalLink size={14} /> Join Session
              </a>
            )}

            {course.instructor_name && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f0f2f7' }}>
                <div style={{ fontSize: 12, color: '#9aa2b4', marginBottom: 4 }}>Instructor</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#1a2035' }}>{course.instructor_name}</div>
                {course.instructor_bio && <p style={{ fontSize: 12, color: '#7a8294', marginTop: 4, lineHeight: 1.5 }}>{course.instructor_bio}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
