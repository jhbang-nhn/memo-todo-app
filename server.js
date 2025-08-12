const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = 8000;

// JSON 파싱 미들웨어
app.use(express.json());

// 정적 파일 제공
app.use(express.static('.'));

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
    
    if (username === 'admin' && password === process.env.ADMIN_PASSWORD) {
        res.json({
            success: true,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        });
    } else {
        res.status(401).json({ success: false, message: '잘못된 사용자명 또는 비밀번호입니다.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log('📝 환경변수 확인:');
    console.log(`   - SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 설정됨' : '❌ 설정되지 않음'}`);
    console.log(`   - SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 설정됨' : '❌ 설정되지 않음'}`);
    console.log(`   - ADMIN_PASSWORD: ${process.env.ADMIN_PASSWORD ? '✅ 설정됨' : '❌ 설정되지 않음'}`);
});
