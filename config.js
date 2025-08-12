// Supabase 설정
const SUPABASE_URL = 'https://sdecxkwrhdewcakxigxh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZWN4a3dyaGRld2Nha3hpZ3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMjM4OTcsImV4cCI6MjA2OTU5OTg5N30.UIXMscgDLq1nBXKAdF50IyvP0Sd6DCBv4jxF8CHXRPU';

// 간단한 로그인 정보 (실제 프로덕션에서는 더 안전한 방법 사용)
const VALID_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// 사용자 ID (Supabase에서 생성된 실제 UUID)
const ADMIN_USER_ID = 'cafa3a09-21df-4df7-a2cf-e488ffc78821';

// Supabase 클라이언트 초기화 함수
function initializeSupabase() {
    if (typeof supabase !== 'undefined') {
        return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error('Supabase 라이브러리가 로드되지 않았습니다.');
        return null;
    }
}
