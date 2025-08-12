// Supabase 설정 - API 호출을 통해 가져옴
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

// 간단한 로그인 정보 - 고정된 관리자 계정
const VALID_CREDENTIALS = {
    username: 'admin',
    password: '' // API 호출을 통해 검증됨
};

// 환경변수 검증 함수 - 로그인 후 호출됨
function validateEnvironmentVariables() {
    if (!SUPABASE_URL) {
        console.error('❌ Supabase URL이 설정되지 않았습니다.');
        return false;
    }
    if (!SUPABASE_ANON_KEY) {
        console.error('❌ Supabase Anon Key가 설정되지 않았습니다.');
        return false;
    }
    return true;
}

// Supabase에서 admin 사용자의 UUID를 조회하는 함수
async function getAdminUserId() {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('id')
            .eq('username', 'admin')
            .single();
        if (error) {
            console.error('❌ admin 사용자 조회 실패:', error);
            return null;
        }
        return data.id;
    } catch (error) {
        console.error('❌ admin 사용자 조회 중 오류:', error);
        return null;
    }
}

// Supabase 클라이언트 초기화 함수
function initializeSupabase() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error('❌ Supabase 설정이 완료되지 않았습니다.');
        return null;
    }
    if (typeof supabase !== 'undefined') {
        return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error('Supabase 라이브러리가 로드되지 않았습니다.');
        return null;
    }
}
