require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./src/db/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Initialize database
initDb();

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/courses', require('./src/routes/courses'));
app.use('/api/enrollments', require('./src/routes/enrollments'));
app.use('/api/pathways', require('./src/routes/pathways'));
app.use('/api/communities', require('./src/routes/communities'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/ai', require('./src/routes/ai'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`EduLearn Pro API running on http://localhost:${PORT}`);
});
