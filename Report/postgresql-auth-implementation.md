# PostgreSQL 인증 시스템 구현 보고서

## 개요
FluxNote 프로젝트에 PostgreSQL 데이터베이스를 연동하고, 회원가입, 로그인, 로그아웃 기능을 구현했습니다.

## 구현 일자
2024년 (구현 완료 시점)

## 데이터베이스 설정

### 환경 변수
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fluxnote_db
DB_USER=postgres
DB_PASSWORD=postgresql
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
```

### 데이터베이스 스키마

#### users 테이블
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### notes 테이블 (향후 사용)
```sql
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 백엔드 구현

### 설치된 패키지
- `express`: 웹 서버 프레임워크
- `pg`: PostgreSQL 클라이언트
- `bcrypt`: 비밀번호 해싱
- `jsonwebtoken`: JWT 토큰 생성 및 검증
- `cors`: CORS 설정
- `dotenv`: 환경 변수 관리
- `body-parser`: 요청 본문 파싱

### 서버 구조
```
server/
├── index.js              # Express 서버 메인 파일
├── config/
│   └── database.js       # PostgreSQL 연결 및 테이블 초기화
└── routes/
    └── auth.js           # 인증 관련 API 엔드포인트
```

### API 엔드포인트

#### 1. 회원가입
- **URL**: `POST /api/auth/register`
- **요청 본문**:
  ```json
  {
    "username": "사용자명",
    "email": "이메일@example.com",
    "password": "비밀번호"
  }
  ```
- **응답**:
  ```json
  {
    "success": true,
    "message": "회원가입이 완료되었습니다.",
    "token": "JWT 토큰",
    "user": {
      "id": 1,
      "username": "사용자명",
      "email": "이메일@example.com"
    }
  }
  ```
- **검증 사항**:
  - 모든 필드 필수 입력
  - 이메일 형식 검증
  - 비밀번호 최소 6자 이상
  - 사용자명 및 이메일 중복 확인

#### 2. 로그인
- **URL**: `POST /api/auth/login`
- **요청 본문**:
  ```json
  {
    "email": "이메일@example.com",
    "password": "비밀번호"
  }
  ```
- **응답**:
  ```json
  {
    "success": true,
    "message": "로그인 성공",
    "token": "JWT 토큰",
    "user": {
      "id": 1,
      "username": "사용자명",
      "email": "이메일@example.com"
    }
  }
  ```

#### 3. 사용자 정보 조회
- **URL**: `GET /api/auth/me`
- **헤더**: `Authorization: Bearer {토큰}`
- **응답**:
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "username": "사용자명",
      "email": "이메일@example.com",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

#### 4. 로그아웃
- **URL**: `POST /api/auth/logout`
- **헤더**: `Authorization: Bearer {토큰}`
- **응답**:
  ```json
  {
    "success": true,
    "message": "로그아웃되었습니다."
  }
  ```

### 보안 기능
- 비밀번호는 bcrypt로 해싱하여 저장 (salt rounds: 10)
- JWT 토큰 기반 인증 (만료 시간: 7일)
- 토큰 검증 미들웨어를 통한 보호된 라우트

## 프론트엔드 구현

### 새로운 컴포넌트

#### Auth.js
- 회원가입 및 로그인 폼을 제공하는 컴포넌트
- 로그인/회원가입 모드 전환 기능
- 입력 검증 및 에러 메시지 표시
- Tailwind CSS를 사용한 반응형 디자인

### 새로운 서비스

#### authService.js
- `register(username, email, password)`: 회원가입
- `login(email, password)`: 로그인
- `logout()`: 로그아웃
- `getCurrentUser()`: 현재 사용자 정보 조회
- `setToken(token)`, `getToken()`, `removeToken()`: 토큰 관리

### App.js 수정 사항
- 사용자 인증 상태 관리 추가
- 로그인하지 않은 사용자에게 Auth 컴포넌트 표시
- 로그인한 사용자에게 노트 앱 표시
- 헤더에 사용자명 및 로그아웃 버튼 추가
- 사용자별로 노트를 localStorage에 저장 (키: `fluxnote-notes-{userId}`)

## 실행 방법

### 1. 데이터베이스 설정
```bash
# PostgreSQL이 설치되어 있어야 합니다
# 데이터베이스 생성
createdb fluxnote_db
```

### 2. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fluxnote_db
DB_USER=postgres
DB_PASSWORD=postgresql
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
```

### 3. 패키지 설치
```bash
npm install
```

### 4. 서버 실행
```bash
# 백엔드 서버만 실행
npm run server

# 또는 프론트엔드와 함께 실행 (concurrently 필요)
npm run dev
```

### 5. 프론트엔드 실행
```bash
npm start
```

## 파일 구조

```
FluxNote/
├── server/
│   ├── index.js
│   ├── config/
│   │   └── database.js
│   └── routes/
│       └── auth.js
├── src/
│   ├── components/
│   │   └── Auth.js
│   └── services/
│       └── authService.js
├── .env (생성 필요)
├── .env.example
└── package.json
```

## 주요 기능

### ✅ 구현 완료
- [x] PostgreSQL 데이터베이스 연결
- [x] users 테이블 생성
- [x] 회원가입 API
- [x] 로그인 API
- [x] 로그아웃 API
- [x] JWT 토큰 기반 인증
- [x] 비밀번호 해싱 (bcrypt)
- [x] 프론트엔드 인증 UI
- [x] 사용자별 노트 저장

### 🔄 향후 개선 사항
- [ ] 노트를 데이터베이스에 저장 (현재는 localStorage 사용)
- [ ] 비밀번호 재설정 기능
- [ ] 이메일 인증
- [ ] 소셜 로그인 (Google, GitHub 등)
- [ ] 세션 관리 개선
- [ ] API 요청 에러 핸들링 개선

## 보안 고려사항

1. **비밀번호 보안**
   - bcrypt를 사용한 해싱
   - 평문 비밀번호는 절대 저장하지 않음

2. **토큰 관리**
   - JWT 토큰은 localStorage에 저장
   - 프로덕션 환경에서는 httpOnly 쿠키 사용 고려

3. **입력 검증**
   - 서버 측에서 모든 입력 검증
   - SQL 인젝션 방지를 위한 파라미터화된 쿼리 사용

4. **환경 변수**
   - 민감한 정보는 환경 변수로 관리
   - `.env` 파일은 버전 관리에 포함하지 않음

## 문제 해결

### PostgreSQL 연결 오류
- PostgreSQL 서비스가 실행 중인지 확인
- 데이터베이스가 생성되었는지 확인
- 환경 변수가 올바르게 설정되었는지 확인

### CORS 오류
- `server/index.js`에서 CORS 미들웨어가 설정되어 있는지 확인
- 프론트엔드 URL이 허용 목록에 포함되어 있는지 확인

### 토큰 검증 실패
- JWT_SECRET이 올바르게 설정되었는지 확인
- 토큰이 만료되지 않았는지 확인

## 참고 자료

- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [Express.js 공식 문서](https://expressjs.com/)
- [JWT.io](https://jwt.io/)
- [bcrypt 문서](https://www.npmjs.com/package/bcrypt)

