import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, BookOpen, Users, Map, Sparkles, Play, ArrowRight, CheckCircle, Star, Zap, Shield, Globe } from 'lucide-react';
import api from '../api/client';

const CATEGORIES = [
  { key: 'assessment',   label: 'Assessment',       icon: '📊', color: '#e8f4fd', text: '#1a7fc1' },
  { key: 'pedagogy',     label: 'Pedagogy',         icon: '🧑‍🏫', color: '#fde8f5', text: '#c11a8a' },
  { key: 'technology',   label: 'EdTech',           icon: '💻', color: '#e8fdf0', text: '#1ac14e' },
  { key: 'wellbeing',    label: 'Wellbeing',        icon: '🌱', color: '#fdf5e8', text: '#c17c1a' },
  { key: 'leadership',   label: 'Leadership',       icon: '🏆', color: '#eee8fd', text: '#6c1ac1' },
  { key: 'curriculum',   label: 'Curriculum',       icon: '📚', color: '#fde8e8', text: '#c11a1a' },
  { key: 'special needs','label': 'Inclusive Ed',   icon: '♿', color: '#e8fdfd', text: '#1ac1b4' },
];

const FEATURES = [
  {
    icon: BookOpen, color: '#6c63ff',
    title: 'Expert-Curated Courses',
    desc: 'Every course is designed by experienced educators and aligned to professional teaching standards.',
  },
  {
    icon: Zap, color: '#f5a623',
    title: 'AI-Powered Content',
    desc: 'Generate structured lesson modules instantly with our AI assistant, tailored to your subject and level.',
  },
  {
    icon: Users, color: '#2ecc71',
    title: 'Peer Learning Communities',
    desc: 'Connect with educators worldwide, share strategies, and grow together in topic-based communities.',
  },
  {
    icon: Map, color: '#e74c3c',
    title: 'Structured Pathways',
    desc: 'Follow curated learning sequences that guide you from beginner to expert in key competency areas.',
  },
  {
    icon: Shield, color: '#1abc9c',
    title: 'Verified Completions',
    desc: 'Track your progress module-by-module and earn completion records to showcase your professional growth.',
  },
  {
    icon: Globe, color: '#9b59b6',
    title: 'Learn Anywhere',
    desc: 'Fully online and mobile-friendly — access your courses and communities from any device, any time.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Your Account', desc: 'Sign up in seconds. Browse courses immediately — no setup required.' },
  { step: '02', title: 'Enrol in Courses', desc: 'Choose from expert-led courses across 7 professional teaching domains.' },
  { step: '03', title: 'Learn & Grow', desc: 'Watch videos, read course materials, complete modules, and track your progress.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/home'} replace />;
  const [stats, setStats] = useState({ courses: 0, communities: 0 });
  const [featuredCourses, setFeaturedCourses] = useState([]);

  useEffect(() => {
    api.get('/courses?limit=3').then(res => {
      setFeaturedCourses(res.data.courses || []);
      setStats(s => ({ ...s, courses: res.data.total || 0 }));
    }).catch(() => {});
    api.get('/communities').then(res => {
      setStats(s => ({ ...s, communities: Array.isArray(res.data) ? res.data.length : 0 }));
    }).catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif", color: '#1a2035', background: '#fff' }}>

      {/* ── Navbar ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #eee', padding: '0 40px', display: 'flex', alignItems: 'center', height: 64, gap: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{ background: '#6c63ff', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#1a2035', letterSpacing: -0.3 }}>EduLearn <span style={{ color: '#6c63ff' }}>Pro</span></span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/login')}
            style={{ background: 'none', border: '1.5px solid #e0e3ea', color: '#1a2035', borderRadius: 9, padding: '8px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Sign In
          </button>
          <button onClick={() => navigate('/register')}
            style={{ background: '#6c63ff', border: 'none', color: '#fff', borderRadius: 9, padding: '8px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(135deg, #0f1628 0%, #1e2a55 50%, #2d1b6e 100%)', padding: '96px 40px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(108,99,255,0.25) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 350, height: 350, background: 'radial-gradient(circle, rgba(46,204,113,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.4)', borderRadius: 30, padding: '6px 16px', marginBottom: 28 }}>
            <Sparkles size={14} color="#a09aff" />
            <span style={{ color: '#a09aff', fontSize: 13, fontWeight: 600 }}>Professional Learning for Educators</span>
          </div>

          <h1 style={{ color: '#fff', fontSize: 52, fontWeight: 800, lineHeight: 1.15, margin: '0 0 22px', letterSpacing: -1 }}>
            Empower Every Teacher.<br />
            <span style={{ background: 'linear-gradient(90deg, #a09aff, #68d6ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Transform Every Classroom.
            </span>
          </h1>
          <p style={{ color: '#a0aec0', fontSize: 19, lineHeight: 1.7, margin: '0 0 40px', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
            A platform built for educators — expert courses, AI-generated content, peer communities, and structured learning pathways all in one place.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')}
              style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 32px', fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 30px rgba(108,99,255,0.45)' }}>
              Start Learning Free <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/discover')}
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '14px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(8px)' }}>
              <Play size={16} /> Browse Courses
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ background: '#6c63ff', padding: '32px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
          {[
            { value: stats.courses > 0 ? `${stats.courses}+` : '20+', label: 'Expert Courses' },
            { value: '7', label: 'Subject Domains' },
            { value: stats.communities > 0 ? `${stats.communities}+` : '5+', label: 'Communities' },
            { value: '100%', label: 'Online & Free' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.2)' : 'none', padding: '8px 0' }}>
              <div style={{ color: '#fff', fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 6, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Category grid ── */}
      <section style={{ padding: '80px 40px', background: '#f8f9fc' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, margin: '0 0 12px', color: '#1a2035' }}>Browse by Domain</h2>
            <p style={{ color: '#7a8294', fontSize: 16, margin: 0 }}>7 professional teaching areas, hundreds of practical strategies</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => navigate(`/discover?category=${cat.key}`)}
                style={{ background: '#fff', border: `1.5px solid ${cat.color}`, borderRadius: 14, padding: '22px 18px', cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s, box-shadow 0.15s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{cat.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a2035', marginBottom: 4 }}>{cat.label}</div>
                <div style={{ fontSize: 12, color: cat.text, background: cat.color, display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>Explore →</div>
              </button>
            ))}
            {/* 8th cell — CTA */}
            <button onClick={() => navigate('/discover')}
              style={{ background: 'linear-gradient(135deg, #6c63ff, #4c3fe0)', border: 'none', borderRadius: 14, padding: '22px 18px', cursor: 'pointer', textAlign: 'left', color: '#fff', boxShadow: '0 4px 20px rgba(108,99,255,0.35)' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🔍</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>All Courses</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>View everything →</div>
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '80px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, margin: '0 0 12px', color: '#1a2035' }}>Everything You Need to Grow</h2>
            <p style={{ color: '#7a8294', fontSize: 16, margin: 0 }}>A complete professional development ecosystem for modern educators</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} style={{ background: '#f8f9fc', borderRadius: 16, padding: '28px 24px', border: '1px solid #eef0f6' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <Icon size={24} color={color} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 10px', color: '#1a2035' }}>{title}</h3>
                <p style={{ color: '#7a8294', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Courses ── */}
      {featuredCourses.length > 0 && (
        <section style={{ padding: '80px 40px', background: '#f8f9fc' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
              <div>
                <h2 style={{ fontSize: 34, fontWeight: 800, margin: '0 0 8px', color: '#1a2035' }}>Featured Courses</h2>
                <p style={{ color: '#7a8294', fontSize: 16, margin: 0 }}>Start with these popular picks</p>
              </div>
              <button onClick={() => navigate('/discover')}
                style={{ background: 'none', border: 'none', color: '#6c63ff', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                View all <ArrowRight size={16} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {featuredCourses.map(course => (
                <div key={course.id}
                  onClick={() => navigate('/login')}
                  style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}>
                  <div style={{ height: 160, background: '#1a2035', position: 'relative', overflow: 'hidden' }}>
                    {course.image_url && <img src={course.image_url} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />}
                    {course.category && (
                      <span style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                        {course.category}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '16px 18px 20px' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2035', margin: '0 0 8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {course.title}
                    </h3>
                    <div style={{ display: 'flex', gap: 14, color: '#9aa2b4', fontSize: 12 }}>
                      <span>⏱ {course.duration_hours}h</span>
                      <span>⭐ {course.rating}/5</span>
                      <span>👥 {course.enrolled_count} enrolled</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ── */}
      <section style={{ padding: '80px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, margin: '0 0 12px', color: '#1a2035' }}>Get Started in Minutes</h2>
          <p style={{ color: '#7a8294', fontSize: 16, margin: '0 0 56px' }}>No credit card. No complicated setup. Just learning.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <div key={step} style={{ position: 'relative' }}>
                {i < 2 && (
                  <div style={{ position: 'absolute', top: 24, left: '60%', width: '80%', height: 2, background: 'linear-gradient(90deg, #6c63ff44, transparent)', pointerEvents: 'none' }} />
                )}
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #4c3fe0)', color: '#fff', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 16px rgba(108,99,255,0.35)' }}>
                  {step}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 10px', color: '#1a2035' }}>{title}</h3>
                <p style={{ color: '#7a8294', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '80px 40px', background: 'linear-gradient(135deg, #1a2035, #2d1b6e)', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ color: '#fff', fontSize: 36, fontWeight: 800, margin: '0 0 16px', lineHeight: 1.25 }}>
            Ready to Elevate Your Teaching?
          </h2>
          <p style={{ color: '#a0aec0', fontSize: 17, margin: '0 0 36px', lineHeight: 1.6 }}>
            Join educators who are growing their practice with expert courses, AI tools, and a supportive community.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')}
              style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 34px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 8px 30px rgba(108,99,255,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
              Create Free Account <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/login')}
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: 12, padding: '14px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0f1628', padding: '40px 40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#6c63ff', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={16} color="#fff" />
            </div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>EduLearn Pro</span>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            {[
              { label: 'Browse Courses', path: '/discover' },
              { label: 'Sign In', path: '/login' },
              { label: 'Register', path: '/register' },
            ].map(({ label, path }) => (
              <button key={label} onClick={() => navigate(path)}
                style={{ background: 'none', border: 'none', color: '#7a8294', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                {label}
              </button>
            ))}
          </div>
          <span style={{ color: '#4a5568', fontSize: 12 }}>© 2026 EduLearn Pro. All rights reserved.</span>
        </div>
      </footer>

    </div>
  );
}
