# 문제 해결 가이드

## 현재 상태 확인

✅ **서버 상태**: 포트 5000에서 정상 실행 중
✅ **서버 응답**: Health check 엔드포인트 정상 작동
✅ **.env 파일**: 존재함

## 문제 진단

### 1. 프론트엔드 포트 확인

프론트엔드가 실행 중인 포트를 확인하세요:
- 기본: `http://localhost:3000`
- 다른 포트일 수 있음: `http://localhost:3001` 등

### 2. 브라우저 콘솔 확인

브라우저 개발자 도구(F12)를 열고 Console 탭에서 오류 메시지를 확인하세요.

### 3. 네트워크 탭 확인

브라우저 개발자 도구의 Network 탭에서:
- `/api/auth/register` 또는 `/api/auth/login` 요청이 있는지 확인
- 요청 상태 코드 확인 (200, 404, 500 등)
- CORS 오류가 있는지 확인

## 해결 방법

### 방법 1: 프론트엔드 재시작

프론트엔드를 재시작하세요:
```bash
# Ctrl+C로 중지 후
npm start
```

### 방법 2: 서버 재시작

서버를 재시작하세요:
```bash
# 서버가 실행 중인 터미널에서 Ctrl+C로 중지 후
npm run server
```

### 방법 3: 함께 실행

프론트엔드와 백엔드를 함께 실행:
```bash
npm run dev
```

### 방법 4: 브라우저 캐시 삭제

브라우저에서:
1. 개발자 도구 열기 (F12)
2. Network 탭에서 "Disable cache" 체크
3. 페이지 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)

## 예상되는 오류와 해결책

### 오류 1: "서버에 연결할 수 없습니다"

**원인**: 백엔드 서버가 실행되지 않음

**해결**:
```bash
npm run server
```

### 오류 2: CORS 오류

**원인**: 프론트엔드 포트가 CORS 허용 목록에 없음

**해결**: 서버의 CORS 설정이 모든 localhost 포트를 허용하도록 업데이트되었습니다. 서버를 재시작하세요.

### 오류 3: "네트워크 오류가 발생했습니다"

**원인**: 
- 서버가 실행 중이지만 응답하지 않음
- 방화벽 문제
- 포트 충돌

**해결**:
1. 서버가 실행 중인지 확인: `netstat -ano | findstr :5000`
2. 서버 로그 확인
3. 다른 포트 사용: `.env` 파일에서 `PORT=5001`로 변경

## 테스트

### 1. 서버 Health Check

브라우저에서 다음 URL을 열어보세요:
```
http://localhost:5000/api/health
```

정상 응답:
```json
{"status":"OK","message":"Server is running"}
```

### 2. 회원가입 API 테스트

터미널에서:
```bash
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"test\",\"email\":\"test@test.com\",\"password\":\"test123\"}"
```

## 추가 디버깅

### 서버 로그 확인

서버 터미널에서 다음 메시지들을 확인하세요:
- `🚀 Server is running on port 5000`
- `✅ PostgreSQL 연결 성공` (또는 `❌ PostgreSQL 연결 실패`)

### 프론트엔드 로그 확인

브라우저 콘솔에서:
- `서버 연결 확인 오류:` 메시지 확인
- 네트워크 요청 실패 원인 확인

## 여전히 문제가 있다면

1. **서버와 프론트엔드가 모두 실행 중인지 확인**
2. **브라우저 콘솔의 정확한 오류 메시지 확인**
3. **서버 터미널의 오류 메시지 확인**
4. **.env 파일이 올바르게 설정되었는지 확인**

