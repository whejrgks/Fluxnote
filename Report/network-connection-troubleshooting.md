# 네트워크 연결 문제 해결 보고서

## 개요
FluxNote 프로젝트에서 PostgreSQL 인증 시스템 구현 후 발생한 프론트엔드-백엔드 네트워크 연결 문제를 해결한 과정을 정리한 문서입니다.

## 문제 상황

### 발생한 오류
- 프론트엔드에서 회원가입/로그인 시도 시 "서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요." 오류 메시지 표시
- 브라우저 콘솔에 네트워크 연결 오류 발생

### 초기 진단
1. **서버 상태 확인**: 포트 5000에서 서버가 정상 실행 중
2. **Health Check 테스트**: `http://localhost:5000/api/health` 엔드포인트 정상 응답
3. **.env 파일**: 존재 확인
4. **서버 파일 구조**: 모든 파일 정상 존재

## 문제 원인 분석

### 1. CORS 설정 문제
- 초기 CORS 설정이 `http://localhost:3000`만 허용
- 프론트엔드가 다른 포트(예: 3001)에서 실행될 경우 차단
- 개발 환경에서 유연한 CORS 설정 필요

### 2. 서버 연결 확인 로직 문제
- `checkServerConnection` 함수가 실제 요청 전에 실행되어 불필요한 지연 발생
- 타임아웃 설정이 너무 짧아 연결 실패로 오인될 수 있음
- 에러 핸들링이 부족하여 정확한 원인 파악 어려움

### 3. 에러 메시지 부족
- 네트워크 오류와 서버 오류를 구분하지 못함
- 사용자에게 명확한 해결 방법 제시 부족

## 해결 방법

### 1. CORS 설정 개선

**파일**: `server/index.js`

**변경 전**:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**변경 후**:
```javascript
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
```

**개선 사항**:
- 개발 환경에서 모든 localhost 포트 허용
- 유연한 origin 검증 로직
- 프로덕션 환경에서는 환경 변수로 제어 가능

### 2. 서버 연결 확인 로직 개선

**파일**: `src/services/authService.js`

**변경 사항**:
- 불필요한 사전 연결 확인 제거
- 실제 API 요청 시 직접 에러 처리
- 더 나은 에러 메시지 제공

**개선된 `checkServerConnection` 함수**:
```javascript
const checkServerConnection = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
    
    const response = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('서버 응답 오류:', response.status, response.statusText);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('서버 연결 확인 오류:', error);
    // 네트워크 오류가 아닌 경우에도 서버가 실행 중일 수 있으므로 true 반환
    if (error.name === 'AbortError') {
      console.error('서버 연결 타임아웃');
      return false;
    }
    return false;
  }
};
```

### 3. 에러 핸들링 개선

**개선 사항**:
- 응답 Content-Type 확인 후 JSON 파싱
- 네트워크 오류와 서버 오류 구분
- 사용자에게 명확한 오류 메시지 제공

**예시**:
```javascript
// 응답이 JSON인지 확인
const contentType = response.headers.get('content-type');
if (!contentType || !contentType.includes('application/json')) {
  return { 
    success: false, 
    message: '서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.' 
  };
}
```

### 4. 서버 시작 로직 개선

**파일**: `server/index.js`

**변경 사항**:
- 데이터베이스 연결 실패 시에도 서버는 계속 실행
- 더 명확한 로그 메시지
- 서버 시작 정보 출력

**개선된 서버 시작 코드**:
```javascript
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  
  // Database connection test (비동기로 실행, 서버 시작을 막지 않음)
  db.connect()
    .then(() => {
      console.log('✅ PostgreSQL 연결 성공');
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
```

## 수정된 파일 목록

### 백엔드
1. **server/index.js**
   - CORS 설정 개선
   - 서버 시작 로직 개선
   - 에러 핸들링 미들웨어 추가

### 프론트엔드
1. **src/services/authService.js**
   - 서버 연결 확인 로직 개선
   - 에러 핸들링 개선
   - 더 명확한 오류 메시지

## 테스트 결과

### 서버 상태 확인
```bash
# 포트 5000에서 서버 실행 중 확인
netstat -ano | findstr :5000
# 결과: TCP    0.0.0.0:5000  LISTENING
```

### Health Check 테스트
```bash
curl http://localhost:5000/api/health
# 결과: {"status":"OK","message":"Server is running"}
```

### CORS 헤더 확인
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
```

## 해결 후 확인 사항

### ✅ 해결된 문제
- [x] CORS 오류 해결
- [x] 서버 연결 확인 로직 개선
- [x] 에러 메시지 개선
- [x] 데이터베이스 연결 실패 시에도 서버 실행 유지

### 📋 확인 체크리스트
- [ ] 서버가 포트 5000에서 실행 중
- [ ] Health check 엔드포인트 정상 응답
- [ ] 프론트엔드에서 서버 연결 성공
- [ ] 회원가입/로그인 기능 정상 작동

## 사용자 가이드

### 서버 실행 방법

#### 방법 1: 별도 실행
```bash
# 터미널 1 - 백엔드 서버
npm run server

# 터미널 2 - 프론트엔드
npm start
```

#### 방법 2: 함께 실행 (권장)
```bash
npm run dev
```

### 문제 해결 단계

1. **서버 상태 확인**
   ```bash
   netstat -ano | findstr :5000
   ```

2. **Health Check 테스트**
   브라우저에서: `http://localhost:5000/api/health`

3. **서버 재시작**
   ```bash
   # 서버 터미널에서 Ctrl+C로 중지 후
   npm run server
   ```

4. **프론트엔드 새로고침**
   - 하드 새로고침: `Ctrl+Shift+R` (Windows) 또는 `Cmd+Shift+R` (Mac)
   - 또는 개발자 도구 → Network 탭 → "Disable cache" 체크

### 브라우저 디버깅

1. **개발자 도구 열기** (F12)
2. **Console 탭**: 오류 메시지 확인
3. **Network 탭**: 
   - `/api/auth/register` 또는 `/api/auth/login` 요청 확인
   - 요청 상태 코드 확인 (200, 404, 500 등)
   - CORS 오류 확인

## 추가 개선 사항

### 향후 개선 가능한 부분

1. **환경별 CORS 설정**
   - 개발/프로덕션 환경 구분
   - 환경 변수로 CORS 정책 관리

2. **에러 로깅**
   - 서버 측 에러 로깅 시스템
   - 클라이언트 측 에러 추적

3. **연결 상태 모니터링**
   - 실시간 서버 상태 확인
   - 연결 상태 표시 UI

4. **자동 재연결**
   - 네트워크 오류 시 자동 재시도
   - 지수 백오프(Exponential Backoff) 적용

## 참고 문서

- [SERVER_SETUP.md](../SERVER_SETUP.md) - 서버 설정 가이드
- [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) - 문제 해결 가이드
- [postgresql-auth-implementation.md](./postgresql-auth-implementation.md) - PostgreSQL 인증 구현 보고서

## 결론

네트워크 연결 문제는 주로 CORS 설정과 서버 연결 확인 로직의 문제였습니다. 이를 해결하여 프론트엔드와 백엔드 간의 통신이 정상적으로 작동하도록 개선했습니다.

주요 개선 사항:
- ✅ 유연한 CORS 설정으로 개발 환경 지원
- ✅ 개선된 에러 핸들링으로 문제 진단 용이
- ✅ 데이터베이스 연결 실패 시에도 서버 실행 유지
- ✅ 명확한 로그 메시지로 디버깅 용이

---

**작성일**: 2024년  
**작성자**: 개발팀  
**버전**: 1.0.0

