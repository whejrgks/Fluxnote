const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// 서버 연결 확인
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
    // 다른 오류는 실제 요청에서 처리
    return false;
  }
};

// 토큰 저장
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// 토큰 가져오기
export const getToken = () => {
  return localStorage.getItem('token');
};

// 토큰 삭제
export const removeToken = () => {
  localStorage.removeItem('token');
};

// 회원가입
export const register = async (username, email, password) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
    
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    // 응답이 JSON인지 확인
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { 
        success: false, 
        message: '서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.' 
      };
    }

    const data = await response.json();

    if (data.success) {
      setToken(data.token);
      return { success: true, user: data.user };
    } else {
      return { success: false, message: data.message || '회원가입에 실패했습니다.' };
    }
  } catch (error) {
    console.error('회원가입 오류:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { 
        success: false, 
        message: '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요. (포트 5000)' 
      };
    }
    return { success: false, message: '네트워크 오류가 발생했습니다.' };
  }
};

// 로그인
export const login = async (email, password) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    // 응답이 JSON인지 확인
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { 
        success: false, 
        message: '서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.' 
      };
    }

    const data = await response.json();

    if (data.success) {
      setToken(data.token);
      return { success: true, user: data.user };
    } else {
      return { success: false, message: data.message || '로그인에 실패했습니다.' };
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { 
        success: false, 
        message: '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요. (포트 5000)' 
      };
    }
    return { success: false, message: '네트워크 오류가 발생했습니다.' };
  }
};

// 로그아웃
export const logout = async () => {
  try {
    const token = getToken();
    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('로그아웃 오류:', error);
  } finally {
    removeToken();
  }
};

// 사용자 정보 조회
export const getCurrentUser = async () => {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, user: null };
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // 응답이 JSON인지 확인
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // 서버 연결 실패 시 토큰은 유지 (서버 문제일 수 있음)
      return { success: false, user: null };
    }

    const data = await response.json();

    if (data.success) {
      return { success: true, user: data.user };
    } else {
      removeToken();
      return { success: false, user: null };
    }
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    // 네트워크 오류 시 토큰은 유지 (서버 재시작 시 자동 재연결)
    return { success: false, user: null };
  }
};

