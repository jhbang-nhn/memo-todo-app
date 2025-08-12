const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = 8000;

// JSON 파싱 미들웨어
app.use(express.json());

// CORS 헤더 설정
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// 메인 페이지 - 기본 HTML 제공
app.get('/', (req, res) => {
    try {
        const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        res.send(html);
    } catch (error) {
        console.error('Error serving index.html:', error);
        res.status(500).send('Internal Server Error');
    }
});

// 환경변수 API 엔드포인트 - 로그인 시에만 사용
app.post('/api/auth/validate', (req, res) => {
    const { username, password } = req.body;
    
    // 필수 필드 검증
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: '사용자명과 비밀번호를 입력해주세요.'
        });
    }

    // 환경변수 검증
    if (!process.env.ADMIN_PASSWORD) {
        console.error('❌ ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.');
        return res.status(500).json({
            success: false,
            message: '서버 설정 오류가 발생했습니다.'
        });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
        return res.status(500).json({
            success: false,
            message: '데이터베이스 설정 오류가 발생했습니다.'
        });
    }

    if (username === 'admin' && password === process.env.ADMIN_PASSWORD) {
        res.json({
            success: true,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: '잘못된 사용자명 또는 비밀번호입니다.' 
        });
    }
});

// 정적 파일 제공 (메인 페이지 이후에 설정)
app.use(express.static('.'));

app.listen(PORT, () => {
    console.log(`🚀 Local Server running at http://localhost:${PORT}`);
    console.log('📝 환경변수 확인:');
    console.log(`   - SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 설정됨' : '❌ 설정되지 않음'}`);
    console.log(`   - SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 설정됨' : '❌ 설정되지 않음'}`);
    console.log(`   - ADMIN_PASSWORD: ${process.env.ADMIN_PASSWORD ? '✅ 설정됨' : '❌ 설정되지 않음'}`);
    console.log('\n💡 사용법:');
    console.log('   - 로컬 개발: npm run dev:local');
    console.log('   - Vercel 개발: npm run dev');
    console.log('   - Vercel 배포: npm run deploy');
});
