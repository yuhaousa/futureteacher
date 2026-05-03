import { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import {
  Search, X, Sparkles, FileText, FileVideo2, File, Globe,
  Bookmark, MoreHorizontal, ChevronDown, SlidersHorizontal,
  Clock, ArrowRight, CheckCircle2, BookOpen, Users,
} from 'lucide-react';

/* ─── helpers ────────────────────────────────────────────────── */
const FILE_ICONS = {
  pdf:   { bg: '#e74c3c', label: 'PDF' },
  video: { bg: '#9b59b6', label: 'VIDEO' },
  ppt:   { bg: '#e67e22', label: 'PPT' },
  doc:   { bg: '#2980b9', label: 'DOCX' },
  xls:   { bg: '#27ae60', label: 'XLS' },
  image: { bg: '#16a085', label: 'IMG' },
  link:  { bg: '#7f8c8d', label: 'WEB' },
  course:{ bg: '#6c63ff', label: 'COURSE' },
  community: { bg: '#1abc9c', label: 'COMMUNITY' },
};

function FileBadge({ type }) {
  const m = FILE_ICONS[type] || FILE_ICONS.link;
  return (
    <span style={{
      background: m.bg, color: '#fff', fontSize: 10, fontWeight: 700,
      borderRadius: 4, padding: '2px 6px', letterSpacing: 0.5, flexShrink: 0,
    }}>{m.label}</span>
  );
}

const TABS = ['All', 'Documents', 'Resources', 'Videos', 'Courses', 'Communities'];

const SUBJECT_TAGS = [
  'Inquiry-based learning', 'Hands-on activities', 'Science motivation',
  'Formative assessment', 'Real-world applications', 'Collaborative learning',
  'STEM engagement', 'Experiential learning',
];

const TOP_SOURCES = [
  { name: 'MOE Teaching Guides', count: 12, color: '#2980b9' },
  { name: 'National Institute of Education', count: 8, color: '#6c63ff' },
  { name: 'EdResearch Publications', count: 6, color: '#e67e22' },
  { name: 'School Shared Drive', count: 5, color: '#27ae60' },
  { name: 'External Websites', count: 5, color: '#7f8c8d' },
];

function tabFilter(tab, type) {
  if (tab === 'All') return true;
  if (tab === 'Documents') return ['pdf', 'doc', 'ppt', 'xls'].includes(type);
  if (tab === 'Resources') return !['course', 'community', 'video'].includes(type);
  if (tab === 'Videos') return type === 'video';
  if (tab === 'Courses') return type === 'course';
  if (tab === 'Communities') return type === 'community';
  return true;
}

function ResultRow({ item }) {
  const meta = FILE_ICONS[item.type] || FILE_ICONS.link;
  const Icon = item.type === 'video' ? FileVideo2
    : item.type === 'course' ? BookOpen
    : item.type === 'community' ? Users
    : item.type === 'link' ? Globe : FileText;

  return (
    <div style={{
      display: 'flex', gap: 14, padding: '16px 0',
      borderBottom: '1px solid #f0f2f5', alignItems: 'flex-start',
    }}>
      {/* icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 8, background: meta.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={20} color="#fff" />
      </div>

      {/* body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#1a2035' }}>{item.title}</span>
          {item.badge && (
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 600,
              background: '#eaf4ff', color: '#2980b9', border: '1px solid #bee3f8',
            }}>{item.badge}</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#8892a4', marginBottom: 5 }}>
          <FileBadge type={item.type} />
          {item.size && <span style={{ marginLeft: 6 }}>{item.size}</span>}
          {item.source && <span style={{ marginLeft: 8 }}>• {item.source}</span>}
        </div>
        {item.excerpt && (
          <div style={{ fontSize: 13, color: '#5a6480', lineHeight: 1.5 }}>
            ...{item.excerpt}...
          </div>
        )}
      </div>

      {/* actions */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0c7d4', padding: 6, borderRadius: 6 }}>
          <Bookmark size={16} />
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0c7d4', padding: 6, borderRadius: 6 }}>
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}

function Dropdown({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px',
      fontSize: 13, color: '#4a5568', cursor: 'pointer', background: '#fff',
      userSelect: 'none',
    }}>
      {label}
      <ChevronDown size={14} color="#8892a4" />
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────── */
export default function KnowledgeSearch() {
  const [query, setQuery]     = useState('');
  const [submitted, setSubmitted] = useState('');
  const [activeTab, setTab]   = useState('All');
  const [results, setResults] = useState([]);
  const [aiPoints, setAiPoints] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    { q: 'formative assessment examples', ago: '2 hours ago' },
    { q: 'inquiry based learning in science', ago: 'Yesterday' },
    { q: 'science lesson ideas primary 5', ago: '2 days ago' },
  ]);
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef();

  async function runSearch(q) {
    if (!q.trim()) return;
    setLoading(true);
    setAiLoading(true);
    setSubmitted(q);
    setHistory(h => [{ q, ago: 'Just now' }, ...h.filter(x => x.q !== q).slice(0, 4)]);

    const hits = [];
    try {
      const [libRes, courseRes] = await Promise.allSettled([
        api.get('/library', { params: { search: q, limit: 20 } }),
        api.get('/courses',  { params: { search: q, limit: 20 } }),
      ]);

      if (libRes.status === 'fulfilled') {
        const items = libRes.value.data?.resources || libRes.value.data || [];
        items.forEach(r => hits.push({
          id: `lib-${r.id}`, type: r.file_type || 'link',
          title: r.title,
          badge: r.category ? r.category.charAt(0).toUpperCase() + r.category.slice(1) : null,
          size: r.file_size ? formatBytes(r.file_size) : null,
          source: r.target_audience ? `${r.target_audience} audience` : 'MOE Library',
          excerpt: r.description?.substring(0, 120),
        }));
      }
      if (courseRes.status === 'fulfilled') {
        const items = courseRes.value.data?.courses || courseRes.value.data || [];
        items.forEach(c => hits.push({
          id: `course-${c.id}`, type: 'course',
          title: c.title,
          badge: c.category || null,
          source: 'Course Catalogue',
          excerpt: c.description?.substring(0, 120),
        }));
      }
    } catch {}
    setResults(hits);
    setLoading(false);

    // AI overview
    try {
      const r = await api.post('/ai/chat', { message: q });
      const raw = r.data?.reply || '';
      // extract bold-marked items "**Key** – detail"
      const parsed = [];
      raw.split('\n').forEach(line => {
        const m = line.match(/\*\*(.+?)\*\*\s*[–-]\s*(.+)/);
        if (m) parsed.push({ key: m[1], detail: m[2] });
      });
      setAiPoints(parsed.length ? parsed : [{ key: 'Summary', detail: raw.replace(/\*\*/g, '').substring(0, 200) }]);
    } catch {
      setAiPoints([]);
    }
    setAiLoading(false);
  }

  function formatBytes(b) {
    if (!b) return '';
    if (b > 1048576) return `${(b / 1048576).toFixed(1)} MB`;
    return `${(b / 1024).toFixed(0)} KB`;
  }

  const visible = results.filter(r => tabFilter(activeTab, r.type));
  const shown   = showAll ? visible : visible.slice(0, 5);

  return (
    <div style={{ minHeight: '100vh', background: '#f7f9fc', fontFamily: 'inherit' }}>
      {/* ── Page Header ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e9ecf0', padding: '28px 36px 0' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a2035' }}>Knowledge Search</h1>
        <p style={{ margin: '4px 0 20px', fontSize: 14, color: '#8892a4' }}>
          Search across all your trusted sources to find what you need.
        </p>

        {/* Search bar */}
        <div style={{ display: 'flex', gap: 10, maxWidth: 720, marginBottom: 20 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8,
            border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '8px 14px',
            background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <Search size={16} color="#8892a4" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runSearch(query)}
              placeholder="Search for strategies, resources, courses…"
              style={{
                flex: 1, border: 'none', outline: 'none',
                fontSize: 14, color: '#1a2035', background: 'transparent',
              }}
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); setSubmitted(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0c7d4', padding: 2 }}>
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => runSearch(query)}
            style={{
              background: '#2980b9', color: '#fff', border: 'none', borderRadius: 10,
              padding: '8px 22px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}>
            Search
          </button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setTab(tab)} style={{
              padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              background: 'none', borderBottom: tab === activeTab ? '2px solid #2980b9' : '2px solid transparent',
              color: tab === activeTab ? '#2980b9' : '#5a6480',
              marginBottom: -1, transition: 'all 0.15s',
            }}>{tab}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, maxWidth: 1200, margin: '0 auto', padding: '24px 36px', alignItems: 'flex-start' }}>

        {/* ── Main column ── */}
        <div style={{ flex: 1, minWidth: 0, marginRight: 24 }}>

          {/* Filter row */}
          {submitted && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <Dropdown label="All Sources" />
              <Dropdown label="All Types" />
              <Dropdown label="Any Time" />
              <Dropdown label="All Subjects" />
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px',
                fontSize: 13, color: '#4a5568', cursor: 'pointer', background: '#fff',
              }}>
                <SlidersHorizontal size={14} color="#6c63ff" />
                More Filters
              </div>
            </div>
          )}

          {/* AI Overview */}
          {submitted && (
            <div style={{
              background: '#fff', borderRadius: 14, padding: '20px 24px',
              border: '1px solid #e9ecf0', marginBottom: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  background: 'linear-gradient(135deg,#6c63ff,#a78bfa)',
                  borderRadius: 8, width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={14} color="#fff" />
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1a2035' }}>AI Overview</span>
              </div>

              {aiLoading ? (
                <div style={{ fontSize: 13, color: '#8892a4' }}>Generating overview…</div>
              ) : aiPoints.length > 0 ? (
                <>
                  <p style={{ fontSize: 13, color: '#5a6480', margin: '0 0 12px' }}>
                    Based on {results.length} sources, here are key insights for: <em>{submitted}</em>
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {aiPoints.slice(0, 5).map((pt, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <CheckCircle2 size={16} color="#27ae60" style={{ flexShrink: 0, marginTop: 1 }} />
                        <div style={{ fontSize: 13, color: '#1a2035' }}>
                          <strong>{pt.key}</strong>
                          {pt.detail && ` – ${pt.detail}`}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button style={{
                    marginTop: 14, background: 'none', border: '1px solid #e2e8f0',
                    borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer',
                    color: '#5a6480',
                  }}>
                    View all sources
                  </button>
                </>
              ) : (
                <p style={{ fontSize: 13, color: '#8892a4', margin: 0 }}>
                  No AI overview available for this query.
                </p>
              )}
            </div>
          )}

          {/* Results */}
          {!submitted && !loading && (
            <div style={{
              background: '#fff', borderRadius: 14, padding: '40px 24px',
              border: '1px solid #e9ecf0', textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <Search size={40} color="#c0c7d4" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 16, fontWeight: 600, color: '#5a6480', marginBottom: 6 }}>
                Search across all your sources
              </div>
              <div style={{ fontSize: 13, color: '#8892a4' }}>
                Type a query above to find documents, resources, courses, and more.
              </div>
              {history.length > 0 && (
                <div style={{ marginTop: 24, textAlign: 'left', maxWidth: 420, margin: '24px auto 0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#8892a4', marginBottom: 10, letterSpacing: 1 }}>
                    RECENT SEARCHES
                  </div>
                  {history.map((h, i) => (
                    <button key={i} onClick={() => { setQuery(h.q); runSearch(h.q); }} style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      background: 'none', border: 'none', padding: '7px 0', cursor: 'pointer',
                      fontSize: 13, color: '#4a5568', borderBottom: '1px solid #f0f2f5',
                    }}>
                      <Clock size={14} color="#c0c7d4" />
                      <span style={{ flex: 1, textAlign: 'left' }}>{h.q}</span>
                      <span style={{ fontSize: 11, color: '#c0c7d4' }}>{h.ago}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {loading && (
            <div style={{
              background: '#fff', borderRadius: 14, padding: '40px 24px', textAlign: 'center',
              border: '1px solid #e9ecf0',
            }}>
              <div style={{ fontSize: 14, color: '#8892a4' }}>Searching…</div>
            </div>
          )}

          {submitted && !loading && (
            <div style={{ background: '#fff', borderRadius: 14, padding: '0 24px', border: '1px solid #e9ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {shown.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center', fontSize: 14, color: '#8892a4' }}>
                  No results found for "{submitted}" in {activeTab}.
                </div>
              ) : (
                shown.map(item => <ResultRow key={item.id} item={item} />)
              )}

              {visible.length > 5 && (
                <div style={{ padding: '16px 0', textAlign: 'center' }}>
                  <button onClick={() => setShowAll(s => !s)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 13, color: '#2980b9', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto',
                  }}>
                    {showAll ? 'Show fewer results' : `Show more results (${visible.length - 5} more)`}
                    <ChevronDown size={14} style={{ transform: showAll ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right panel ── */}
        <div style={{ width: 280, flexShrink: 0 }}>

          {/* Refine your search */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #e9ecf0', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#1a2035' }}>Refine your search</span>
              <button onClick={() => { setQuery(''); setResults([]); setSubmitted(''); setTab('All'); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#2980b9', fontWeight: 500 }}>
                Reset
              </button>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#8892a4', marginBottom: 10, letterSpacing: 0.8 }}>
              RELATED TOPICS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUBJECT_TAGS.map(tag => (
                <button key={tag} onClick={() => { setQuery(tag); runSearch(tag); }} style={{
                  fontSize: 12, padding: '4px 10px', borderRadius: 20,
                  border: '1px solid #e2e8f0', background: '#f7f9fc',
                  color: '#4a5568', cursor: 'pointer', fontWeight: 400,
                  transition: 'all 0.15s',
                }}>{tag}</button>
              ))}
            </div>
          </div>

          {/* Top Sources */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #e9ecf0', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#1a2035' }}>Top Sources</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#2980b9', fontWeight: 500 }}>
                View all
              </button>
            </div>
            {TOP_SOURCES.map(src => (
              <div key={src.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: src.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Globe size={14} color="#fff" />
                </div>
                <div style={{ flex: 1, fontSize: 13, color: '#1a2035', lineHeight: 1.3 }}>{src.name}</div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#8892a4' }}>{src.count}</span>
              </div>
            ))}
          </div>

          {/* Search Activity */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #e9ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#1a2035' }}>Search Activity</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#2980b9', fontWeight: 500 }}>
                View all
              </button>
            </div>
            {history.map((h, i) => (
              <button key={i} onClick={() => { setQuery(h.q); runSearch(h.q); }} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                background: 'none', border: 'none', padding: '6px 0', cursor: 'pointer',
                borderBottom: i < history.length - 1 ? '1px solid #f0f2f5' : 'none',
              }}>
                <Clock size={13} color="#c0c7d4" style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12, color: '#4a5568', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {h.q}
                </span>
                <span style={{ fontSize: 11, color: '#c0c7d4', whiteSpace: 'nowrap' }}>{h.ago}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
