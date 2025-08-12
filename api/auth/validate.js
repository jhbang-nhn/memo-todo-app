// Vercel API Route for authentication
module.exports = function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리 (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 메서드만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // 요청 본문에서 사용자 정보 추출
    const { username, password } = req.body;

    // 필수 필드 검증
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '사용자명과 비밀번호를 입력해주세요.'
      });
    }

    // 환경변수에서 설정값 가져오기
    const adminPassword = process.env.ADMIN_PASSWORD;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 환경변수 검증
    if (!adminPassword) {
      console.error('❌ ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.');
      return res.status(500).json({
        success: false,
        message: '서버 설정 오류가 발생했습니다.'
      });
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
      return res.status(500).json({
        success: false,
        message: '데이터베이스 설정 오류가 발생했습니다.'
      });
    }

    // 인증 로직
    if (username === 'admin' && password === adminPassword) {
      // 성공 응답
      return res.status(200).json({
        success: true,
        supabaseUrl,
        supabaseAnonKey
      });
    } else {
      // 실패 응답
      return res.status(401).json({
        success: false,
        message: '잘못된 사용자명 또는 비밀번호입니다.'
      });
    }

  } catch (error) {
    console.error('❌ 인증 처리 중 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}
