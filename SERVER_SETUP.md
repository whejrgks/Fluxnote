# 서버 실행 가이드

## 🚀 빠른 시작

### 방법 1: 프론트엔드와 백엔드를 함께 실행 (권장)

```bash
npm run dev
```

이 명령어는 백엔드 서버와 프론트엔드를 동시에 실행합니다.

### 방법 2: 별도로 실행

**터미널 1 - 백엔드 서버:**
```bash
npm run server
```

**터미널 2 - 프론트엔드:**
```bash
npm start
```

## ✅ 서버가 정상 실행되었는지 확인

서버가 정상적으로 실행되면 다음과 같은 메시지가 표시됩니다:

```
🚀 Server is running on port 5000
📡 API endpoint: http://localhost:5000/api
💚 Health check: http://localhost:5000/api/health
✅ PostgreSQL 연결 성공
✅ 데이터베이스 테이블 초기화 완료
```

## 🔧 문제 해결

### 1. "서버 연결에 실패했습니다" 오류

**원인:** 백엔드 서버가 실행되지 않았습니다.

**해결 방법:**
1. 새 터미널 창을 엽니다
2. 프로젝트 폴더로 이동합니다
3. 다음 명령어를 실행합니다:
   ```bash
   npm run server
   ```
4. 서버가 실행되는지 확인합니다 (위의 메시지가 표시되어야 함)

### 2. PostgreSQL 연결 실패

**원인:** PostgreSQL이 설치되지 않았거나 실행되지 않았습니다.

**해결 방법:**

#### Windows:
1. PostgreSQL 설치 확인:
   ```powershell
   # PostgreSQL 서비스 확인
   Get-Service -Name postgresql*
   ```

2. PostgreSQL 서비스 시작:
   ```powershell
   # 서비스 이름이 다를 수 있으므로 확인 후 실행
   Start-Service postgresql-x64-14  # 버전에 따라 다름
   ```

3. 데이터베이스 생성:
   ```bash
   createdb -U postgres fluxnote_db
   ```

#### macOS:
```bash
# PostgreSQL 시작
brew services start postgresql

# 데이터베이스 생성
createdb fluxnote_db
```

#### Linux:
```bash
# PostgreSQL 시작
sudo systemctl start postgresql

# 데이터베이스 생성
sudo -u postgres createdb fluxnote_db
```

### 3. 포트 5000이 이미 사용 중

**오류 메시지:** `Error: listen EADDRINUSE: address already in use :::5000`

**해결 방법:**
1. 포트를 사용하는 프로세스 찾기:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # macOS/Linux
   lsof -i :5000
   ```

2. 프로세스 종료 또는 다른 포트 사용:
   - `.env` 파일에서 `PORT=5001`로 변경

### 4. .env 파일이 없음

**해결 방법:**
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fluxnote_db
DB_USER=postgres
DB_PASSWORD=postgresql
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
```

## 📝 체크리스트

서버 실행 전 확인 사항:

- [ ] Node.js가 설치되어 있음 (`node --version`)
- [ ] npm 패키지가 설치되어 있음 (`npm install` 실행)
- [ ] `.env` 파일이 생성되어 있음
- [ ] PostgreSQL이 설치되어 있고 실행 중
- [ ] `fluxnote_db` 데이터베이스가 생성되어 있음
- [ ] 포트 5000이 사용 가능함

## 🧪 서버 연결 테스트

브라우저에서 다음 URL을 열어 서버가 실행 중인지 확인:

```
http://localhost:5000/api/health
```

정상 응답:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## 💡 팁

- 개발 중에는 `npm run dev`를 사용하면 프론트엔드와 백엔드를 한 번에 실행할 수 있습니다
- 서버 로그를 확인하여 오류 메시지를 확인하세요
- 데이터베이스 연결 실패 시에도 서버는 실행되지만, 회원가입/로그인 기능은 작동하지 않습니다

