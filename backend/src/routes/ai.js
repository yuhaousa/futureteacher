import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const ai = new Hono();

// POST /api/ai/chat
ai.post('/chat', authMiddleware, async (c) => {
  const { message } = await c.req.json();
  if (!message) return c.json({ error: 'Message required' }, 400);

  const { results: courses } = await c.env.DB.prepare(`SELECT title, category, modality, description FROM courses WHERE status = 'published' LIMIT 20`).all();

  const msg = message.toLowerCase();
  let reply = '';

  if (msg.includes('course') || msg.includes('learn') || msg.includes('recommend')) {
    const keyword = msg.split(' ').find(w => w.length > 4) || '';
    const relevant = courses.filter(c =>
      c.title.toLowerCase().includes(keyword) ||
      (c.category && msg.includes(c.category.toLowerCase()))
    ).slice(0, 3);
    if (relevant.length > 0) {
      reply = `Based on your query, I recommend these courses:\n\n${relevant.map(c => `**${c.title}** - ${c.category} (${c.modality})\n${c.description || ''}`).join('\n\n')}\n\nYou can find these in the Discover section!`;
    } else {
      reply = `Here are some available courses on the platform:\n\n${courses.slice(0, 3).map(c => `**${c.title}** (${c.category})`).join('\n')}\n\nVisit Discover to explore all courses!`;
    }
  } else if (msg.includes('assessment')) {
    reply = `**Formative Assessment** is a key teaching strategy. On this platform, we have courses covering:\n- Exit tickets and digital polling\n- Think-pair-share strategies\n- Metacognitive reflection\n- Data-driven instruction\n\nSearch for "assessment" in Discover to find relevant courses!`;
  } else if (msg.includes('differentiat')) {
    reply = `**Differentiated Instruction** helps reach every learner. Key strategies include:\n- Tiered activities based on readiness\n- Choice boards for student agency\n- Flexible grouping strategies\n- Universal Design for Learning (UDL)\n\nCheck our "Differentiated Instruction" course in Discover!`;
  } else if (msg.includes('pathway') || msg.includes('plan')) {
    reply = `Learning Pathways are curated sequences of courses designed for specific professional goals. Visit the **Pathways** section to explore structured learning journeys tailored for teachers!`;
  } else if (msg.includes('community') || msg.includes('colleague')) {
    reply = `Connect with fellow educators in our **Communities** section! You can join topic-based groups, share resources, and discuss best practices with colleagues around the world.`;
  } else {
    reply = `Hello! I'm your AI learning assistant for EduLearn Pro. I can help you:\n\n- ðŸ” **Find courses** on any teaching topic\n- ðŸ“š **Recommend learning pathways** for your goals\n- ðŸ’¡ **Answer questions** about pedagogy and teaching strategies\n- ðŸ¤ **Connect you** with learning communities\n\nWhat would you like to explore today?`;
  }

  return c.json({ reply, timestamp: new Date().toISOString() });
});

// POST /api/ai/generate-module — generate structured module content for courseware
ai.post('/generate-module', authMiddleware, adminMiddleware, async (c) => {
  const { course_title, module_title, category, course_description, module_index } = await c.req.json();
  if (!course_title || !module_title) return c.json({ error: 'course_title and module_title required' }, 400);

  const cat = (category || 'general').toLowerCase();
  const idx = module_index ?? 1;

  // Category-specific strategy/activity banks
  const strategies = {
    assessment: ['Exit ticket reflection', 'Think-pair-share activity', 'Peer feedback protocol', 'Digital polling exercise', 'Formative checkpoint quiz'],
    pedagogy: ['Collaborative learning task', 'Differentiated instruction activity', 'Inquiry-based exploration', 'Socratic seminar discussion', 'Project-based application'],
    technology: ['Hands-on tool exploration', 'Digital creation task', 'Tech integration scenario', 'Blended learning design', 'Digital workflow exercise'],
    wellbeing: ['Mindfulness practice', 'Reflective journaling', 'Peer support discussion', 'Stress-mapping activity', 'Wellbeing action planning'],
    leadership: ['Case study analysis', 'Stakeholder communication exercise', 'Change management scenario', 'Vision-setting workshop', 'Coaching conversation role-play'],
    curriculum: ['Backward design exercise', 'Learning objective writing', 'Alignment audit activity', 'Scope-and-sequence mapping', 'Resource curation task'],
    'special needs': ['Universal Design for Learning (UDL) application', 'Differentiation planning activity', 'Accommodation strategy mapping', 'Inclusive classroom audit', 'Co-teaching protocol design'],
  };

  const catStrategies = strategies[cat] || strategies['pedagogy'];
  const activity1 = catStrategies[idx % catStrategies.length];
  const activity2 = catStrategies[(idx + 2) % catStrategies.length];

  const keyConceptMap = {
    assessment: ['formative assessment', 'feedback loops', 'learning evidence', 'student self-assessment', 'data-driven instruction'],
    pedagogy: ['active learning', 'student engagement', 'scaffolding', 'metacognition', 'inclusive practice'],
    technology: ['digital literacy', 'EdTech integration', 'blended learning', 'digital citizenship', 'learning management systems'],
    wellbeing: ['teacher resilience', 'work-life balance', 'positive psychology', 'growth mindset', 'social-emotional learning'],
    leadership: ['instructional leadership', 'distributed leadership', 'professional learning communities', 'change management', 'coaching culture'],
    curriculum: ['learning outcomes', 'backward design', 'curriculum coherence', 'assessment alignment', 'differentiated curriculum'],
    'special needs': ['inclusive education', 'Universal Design for Learning', 'Individual Education Plans', 'tiered support', 'co-teaching models'],
  };

  const concepts = (keyConceptMap[cat] || keyConceptMap['pedagogy']).slice(0, 3);

  const content = `## ${module_title}

### Overview
This module is part of **${course_title}**, focusing on practical strategies within the **${category || 'professional learning'}** domain. By the end of this module, you will be able to apply key concepts directly to your classroom or school context.

---

### Learning Objectives
By completing this module, you will be able to:
1. Explain the core principles of ${concepts[0]} as they apply to ${module_title.toLowerCase()}.
2. Analyse how ${concepts[1]} supports effective professional practice.
3. Design and implement at least one strategy from this module in your teaching context.
4. Reflect on your current practice using evidence-informed frameworks.

---

### Key Concepts

**${concepts[0].charAt(0).toUpperCase() + concepts[0].slice(1)}**
${concepts[0].charAt(0).toUpperCase() + concepts[0].slice(1)} is fundamental to ${module_title.toLowerCase()}. Research shows that educators who consistently apply this approach see measurable improvements in student outcomes and professional satisfaction. Consider how this concept manifests in your current practice and where growth opportunities exist.

**${concepts[1].charAt(0).toUpperCase() + concepts[1].slice(1)}**
Understanding ${concepts[1]} allows educators to move beyond surface-level implementation and create sustainable change. When integrated thoughtfully, ${concepts[1]} can transform both the learning environment and professional culture within a school.

**${concepts[2].charAt(0).toUpperCase() + concepts[2].slice(1)}**
${concepts[2].charAt(0).toUpperCase() + concepts[2].slice(1)} provides the framework that ties the other concepts together. Use this lens when evaluating resources, designing lessons, and collaborating with colleagues.

---

### Core Content

${module_title} requires educators to move from awareness to application. Begin by auditing your current practice:

- What does this look like in an **effective** classroom?
- What evidence would demonstrate **mastery** of this skill?
- What **barriers** exist in your current context, and how might you address them?

The research base for ${module_title.toLowerCase()} draws on constructivist learning theory, cognitive load theory, and evidence from high-performing school systems globally. Singapore's Ministry of Education frameworks, for instance, emphasise ${concepts[0]} as a cornerstone of teacher professional growth.

**Implementation Framework:**
1. **Explore** — Understand the theory and evidence base
2. **Examine** — Look at examples from high-performing contexts
3. **Apply** — Try a targeted strategy in your classroom
4. **Reflect** — Use data and peer feedback to evaluate impact
5. **Share** — Contribute to your professional learning community

---

### Activities

**Activity 1 — ${activity1}** *(15–20 minutes)*
Using what you have learned in this module, complete the following:
> Identify one aspect of your current practice related to ${module_title.toLowerCase()}. Write a brief description of how it currently works, then outline two specific changes you could make based on the concepts covered in this module. Share your thinking with a colleague or post to the community forum.

**Activity 2 — ${activity2}** *(25–30 minutes)*
> Review the provided resources (see attachments below). Select one strategy or framework that resonates with your context. Design a short implementation plan: what will you try, with which students or colleagues, over what timeframe, and how will you know if it is working?

---

### Reflection Questions
Take a few minutes to consider:
- How does ${module_title.toLowerCase()} connect to your school's current strategic priorities?
- What support would help you implement these ideas more effectively?
- Which colleagues might benefit from exploring these concepts together?
- How will you document and share your learning?

---

### Further Reading
- Ministry of Education Singapore — *Professional Learning Framework for Teachers*
- Hattie, J. — *Visible Learning for Teachers* (key chapters on ${concepts[0]})
- Fullan, M. — *The Principal: Three Keys to Maximising Impact*
- Dylan Wiliam — *Embedding Formative Assessment* (if assessment-related)

---

*Module generated for ${course_title} | ${new Date().toLocaleDateString('en-SG', { year: 'numeric', month: 'long' })}*`;

  return c.json({ content });
});

export default ai;

