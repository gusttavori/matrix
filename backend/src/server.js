const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// AVISO PARA O RENDER: Confia no proxy para o express-rate-limit funcionar sem erros
app.set('trust proxy', 1);

// 1. CORS
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://educacaomatrix.vercel.app', 'https://educacaomatrix.com.br']
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado pela política de CORS'));
    }
  },
  credentials: true
}));

// 2. Proteção de Cabeçalhos HTTP
app.use(helmet());

// 3. Limite de Requisições
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { success: false, message: 'Muitas requisições deste IP, tente novamente mais tarde.' }
});
app.use('/api/', limiter);

app.use(express.json());

// Rota Base
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Educação Matrix API is running' });
});

// ==========================================
// IMPORTAÇÃO DE ROTAS (100% ATIVAS)
// ==========================================
const authRoutes = require('./routes/authRoutes');
const planRoutes = require('./routes/planRoutes');
const institutionRoutes = require('./routes/institutionRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const classRoutes = require('./routes/classRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const linkRoutes = require('./routes/linkRoutes');
const teacherPanelRoutes = require('./routes/teacherPanelRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const closingRoutes = require('./routes/closingRoutes');
const teacherReportRoutes = require('./routes/teacherReportRoutes');
const studentPanelRoutes = require('./routes/studentPanelRoutes'); // Painel do Aluno importado

// ==========================================
// APLICAÇÃO DAS ROTAS
// ==========================================
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/teacher-panel', teacherPanelRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/closing', closingRoutes);
app.use('/api/teacher-reports', teacherReportRoutes);
app.use('/api/student-panel', studentPanelRoutes); // Painel do Aluno ativado

// Middleware de erro global
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Educação Matrix API running on port ${PORT}`);
});

module.exports = app;