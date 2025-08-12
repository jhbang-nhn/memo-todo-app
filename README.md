# for PURIN - Daily Memo & TODO App

✨ **간단하고 아름다운 일일 메모 및 TODO 앱**

## ✨ 주요 기능

- 📅 **인터랙티브 캘린더**: 월별 보기, 날짜 선택, 데이터 표시
- ✅ **TODO 관리**: 추가, 완료, 수정, 삭제
- 📝 **메모 관리**: 마크다운 에디터 지원, 실시간 미리보기
- 🎨 **커스텀 휴일**: 개인 기념일 설정 및 색상 지정
- 🔒 **보안 로그인**: 관리자 전용 접근
- 🌐 **반응형 디자인**: 모든 디바이스에서 완벽 작동
- 💾 **Supabase 연동**: 실시간 데이터베이스 동기화

## 🛠 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Node.js Express (로컬), Vercel Functions (배포)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: 서버 사이드 인증
- **Markdown**: marked.js 라이브러리
- **Deployment**: Vercel

## 📁 프로젝트 구조

```
daily-memo/
├── api/
│   └── auth/
│       └── validate.js          # Vercel API Route
├── index.html                   # 메인 HTML 파일
├── styles.css                   # 스타일시트
├── app.js                       # 메인 애플리케이션 로직
├── config.js                    # Supabase 설정
├── server.js                    # 로컬 개발 서버
├── package.json                 # Node.js 의존성
├── vercel.json                  # Vercel 배포 설정
├── .env.local                   # 환경변수 (로컬)
└── README.md                    # 프로젝트 문서
```

## 🚀 설치 및 실행

### 0. 환경 변수 설정 (필수)
보안을 위해 모든 시크릿 값은 환경 변수에서 가져옵니다.

```bash
# .env.local 파일 생성 (프로젝트 루트에)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
ADMIN_PASSWORD=your_admin_password
```

**⚠️ 중요**: `.env.local` 파일이 없으면 애플리케이션이 작동하지 않습니다.

### 1. 의존성 설치

```bash
# Node.js 의존성 설치
npm install

# Vercel CLI 설치 (전역)
npm install -g vercel
```

### 2. 실행 방법

#### 🏠 로컬 개발 환경
```bash
# 로컬 Express 서버 실행 (포트 8000)
npm run dev:local
# 또는
npm run start:local
```

#### 🌐 Vercel 개발 환경
```bash
# Vercel 로컬 개발 서버 실행
npm run dev
# 또는
npm start
```

#### 🚀 Vercel 배포
```bash
# 프로덕션 배포
npm run deploy
```

## 🚀 사용법

### 로그인
- **사용자명**: `admin` (고정)
- **비밀번호**: `.env.local`에 설정한 `ADMIN_PASSWORD`

### 기본 기능
1. **달력 네비게이션**: 월 이동, 날짜 선택
2. **TODO 관리**: 
   - 추가: 날짜 선택 후 TODO 입력
   - 완료: 체크박스 클릭
   - 수정: TODO 항목 클릭
   - 삭제: 삭제 버튼 클릭
3. **메모 관리**:
   - 추가: 날짜 선택 후 메모 입력
   - 수정: 메모 항목 클릭 (마크다운 에디터)
   - 삭제: 삭제 버튼 클릭
4. **커스텀 휴일**:
   - 추가: 날짜, 이름, 색상 선택
   - 수정: 휴일 이름 클릭
   - 삭제: 삭제 버튼 클릭

### 마크다운 에디터
메모 편집 시 사용 가능한 마크다운 기능:
- **굵게**: `**텍스트**` 또는 툴바 B 버튼
- **기울임**: `*텍스트*` 또는 툴바 I 버튼
- **코드**: `` `코드` `` 또는 툴바 ` 버튼
- **링크**: `[텍스트](URL)` 또는 툴바 🔗 버튼
- **목록**: `- 항목` 또는 툴바 • 버튼
- **제목**: `# 제목` 또는 툴바 H 버튼
- **인용**: `> 인용문` 또는 툴바 " 버튼

## 🗄 데이터베이스 스키마

### users 테이블
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### todos 테이블
```sql
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### memos 테이블
```sql
CREATE TABLE memos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### custom_holidays 테이블
```sql
CREATE TABLE custom_holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, date)
);
```

## 🔒 보안 기능

- **서버 사이드 인증**: 비밀번호는 클라이언트에 노출되지 않음
- **환경변수 보안**: 모든 시크릿 값은 환경변수로 관리
- **API 기반 인증**: 로그인 시에만 환경변수 제공
- **CORS 설정**: 적절한 보안 헤더 설정

## 🎨 UI/UX 특징

- **직관적인 인터페이스**: 깔끔하고 사용하기 쉬운 디자인
- **반응형 레이아웃**: 데스크톱, 태블릿, 모바일 완벽 지원
- **실시간 피드백**: 사용자 액션에 대한 즉각적인 반응
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원
- **다크 모드 준비**: CSS 변수 기반 테마 시스템

## 🚀 배포

### Vercel 배포 (권장)
1. **GitHub 연동**: Vercel에서 GitHub 저장소 연결
2. **환경변수 설정**: Vercel 대시보드에서 환경변수 추가
3. **자동 배포**: Git push 시 자동 배포

### 환경변수 설정 (Vercel)
Vercel 대시보드 → Settings → Environment Variables에서 다음 설정:
- `ADMIN_PASSWORD`: 관리자 비밀번호
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key

### 로컬 vs Vercel
- **로컬 개발**: `npm run dev:local` (포트 8000)
- **Vercel 개발**: `npm run dev` (Vercel Functions)
- **프로덕션**: Vercel 자동 배포

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 👨‍💻 개발자 정보

- **프로젝트**: for PURIN - Daily Memo & TODO App
- **기술 스택**: HTML, CSS, JavaScript, Node.js, Supabase, Vercel
- **라이선스**: MIT License

---

**💡 팁**: 로컬 개발 시에는 `npm run dev:local`, Vercel 배포 시에는 `npm run deploy`를 사용하세요!
