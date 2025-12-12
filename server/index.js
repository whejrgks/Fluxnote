const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS 설정 - 개발 환경에서는 모든 localhost 포트 허용
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];

app.use(cors({
  origin: function (origin, callback) {
    // origin이 없는 경우 (같은 origin에서 요청) 또는 허용된 origin인 경우
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // 개발 환경에서는 localhost면 모두 허용
      if (origin && origin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(new Error('CORS 정책에 의해 차단되었습니다.'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error('서버 오류:', err);
  res.status(500).json({ 
    success: false, 
    message: '서버 내부 오류가 발생했습니다.' 
  });
});

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  
  // Database connection test (비동기로 실행, 서버 시작을 막지 않음)
  db.connect()
    .then(() => {
      console.log('✅ PostgreSQL 연결 성공');
      // 테이블 생성
      return db.initTables();
    })
    .catch((err) => {
      console.error('❌ PostgreSQL 연결 실패:', err.message);
      console.error('⚠️  서버는 실행 중이지만 데이터베이스 기능을 사용할 수 없습니다.');
      console.error('💡 해결 방법:');
      console.error('   1. PostgreSQL이 설치되어 있고 실행 중인지 확인');
      console.error('   2. .env 파일의 데이터베이스 설정 확인');
      console.error('   3. 데이터베이스가 생성되었는지 확인: createdb fluxnote_db');
    });
});

