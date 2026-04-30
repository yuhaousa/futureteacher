const CATEGORY_COLORS = {
  assessment: '#e8f4fd',
  pedagogy: '#fde8f5',
  technology: '#e8fdf0',
  wellbeing: '#fdf5e8',
  leadership: '#eee8fd',
  curriculum: '#fde8e8',
  'special needs': '#e8fdfd',
};
const CATEGORY_TEXT = {
  assessment: '#1a7fc1',
  pedagogy: '#c11a8a',
  technology: '#1ac14e',
  wellbeing: '#c17c1a',
  leadership: '#6c1ac1',
  curriculum: '#c11a1a',
  'special needs': '#1ac1b4',
};

export default function CourseCard({ course, onClick }) {
  const catColor = CATEGORY_COLORS[course.category] || '#f0f0f0';
  const catText = CATEGORY_TEXT[course.category] || '#555';

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
    >
      <div style={{ position: 'relative', height: 160, overflow: 'hidden', background: '#ddd' }}>
        {course.image_url && (
          <img src={course.image_url} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span style={{ background: catColor, color: catText, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>
            {course.category}
          </span>
        </div>
        {course.modality && (
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '3px 8px', borderRadius: 20 }}>
              {course.modality}
            </span>
          </div>
        )}
      </div>
      <div style={{ padding: '14px 16px' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: '#1a2035', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.title}
        </h3>
        <p style={{ margin: '0 0 10px', fontSize: 12, color: '#7a8294', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#9aa2b4' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <span>⏱ {course.duration_hours}h</span>
            <span>👥 {course.enrolled_count}</span>
          </div>
          {course.rating > 0 && (
            <span style={{ color: '#f5a623', fontWeight: 600 }}>★ {course.rating}</span>
          )}
        </div>
      </div>
    </div>
  );
}
