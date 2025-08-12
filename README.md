# for PURIN - TODO 앱

HTML, CSS, JavaScript로 만든 간단하고 강력한 TODO 앱입니다. 달력 기반의 직관적인 인터페이스와 마크다운 지원 메모 기능을 제공합니다.

## ✨ 주요 기능

### 📅 달력 기반 관리
- 월별 달력 뷰로 직관적인 날짜 선택
- 오늘 날짜 하이라이트
- 주말 및 공휴일 색상 구분 (토요일: 파란색, 일요일/공휴일: 빨간색)
- 데이터가 있는 날짜 점 표시
- 커스텀 휴일 추가 및 색상 지정

### ✅ TODO 관리
- 날짜별 TODO 항목 추가/수정/삭제
- 완료 상태 토글
- 제목과 설명 분리 입력
- 클릭으로 편집 모달 열기

### 📝 마크다운 메모
- 마크다운 문법 지원
- 실시간 미리보기 (좌우 분할 에디터)
- 툴바 버튼 및 키보드 단축키
- 지원 문법: 굵게, 기울임, 코드, 링크, 목록, 제목, 인용

### 🎨 커스텀 휴일
- 개인 기념일 추가
- 10가지 색상 선택
- 달력에 색상 반영
- 선택된 날짜에서 휴일 정보 표시 및 편집

### 🔐 보안 로그인
- 관리자 전용 로그인
- 환경변수 기반 보안 설정
- 서버 사이드 인증

## 🛠 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: Flexbox, Grid, 반응형 디자인
- **Vanilla JavaScript**: ES6+ 문법, 모듈 패턴

### Backend
- **Node.js Express**: 환경변수 주입 및 API 서버
- **Python Flask**: 대안 서버 (선택사항)

### Database
- **Supabase**: PostgreSQL 기반 백엔드
- **Real-time**: 실시간 데이터 동기화

### External Libraries
- **@supabase/supabase-js@2**: Supabase 클라이언트
- **marked@4.3.0**: 마크다운 파싱

## 📁 프로젝트 구조

```
daily-memo/
├── index.html          # 메인 HTML 파일
├── styles.css          # 스타일시트
├── app.js              # 메인 애플리케이션 로직
├── config.js           # 설정 및 환경변수 관리
├── server.js           # Node.js Express 서버
├── server.py           # Python Flask 서버 (대안)
├── package.json        # Node.js 의존성 관리
├── .env.local          # 환경변수 (Git에서 제외)
├── .gitignore          # Git 제외 파일 목록
└── README.md           # 프로젝트 문서
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

### 방법 1: Node.js Express 서버 사용 (권장)

1. **Node.js 설치 확인**
   ```bash
   node --version
   npm --version
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **프로젝트 실행**
   ```bash
   # 개발 모드
   npm start
   
   # 또는
   npm run dev
   ```

4. **브라우저에서 접속**
   - `http://localhost:8000` 으로 접속
   - 로그인 후 사용 시작

### 방법 2: Python Flask 서버 사용

1. **Python 설치 확인**
   ```bash
   python3 --version
   ```

2. **가상환경 생성 및 의존성 설치**
   ```bash
   # 가상환경 생성
   python3 -m venv venv
   
   # 가상환경 활성화
   source venv/bin/activate
   
   # 의존성 설치
   pip install flask python-dotenv
   ```

3. **프로젝트 실행**
   ```bash
   python3 server.py
   ```

4. **브라우저에서 접속**
   - `http://localhost:8000` 으로 접속
   - 로그인 후 사용 시작

## 🚀 사용법

### 1. 로그인
- 사용자명: `admin` (고정)
- 비밀번호: `.env.local` 파일의 `ADMIN_PASSWORD` 값

### 2. 달력 사용
- 달력에서 날짜를 클릭하여 해당 날짜의 TODO와 메모를 확인
- 데이터가 있는 날짜는 작은 점으로 표시됨
- 오늘 날짜는 빨간색으로 표시됨
- 주말과 공휴일은 색상으로 구분됨

### 3. TODO 관리
- "+" 버튼을 클릭하여 새로운 TODO 추가
- 체크박스를 클릭하여 완료 상태 토글
- TODO 항목을 클릭하여 편집 (모달 창)
- 🗑️ 버튼으로 삭제

### 4. 마크다운 메모 관리
- "+" 버튼을 클릭하여 새로운 메모 추가
- **좌우 분할 에디터**에서 마크다운 작성
- 툴바 버튼이나 키보드 단축키로 마크다운 적용
- 실시간 미리보기로 결과 확인
- 메모 항목을 클릭하여 편집

### 5. 커스텀 휴일 관리
- 달력 아래 "Add Holiday" 버튼으로 휴일 추가
- 날짜, 이름, 색상 선택 (10가지 색상 제공)
- 달력에 색상 반영
- 선택된 날짜에서 휴일 정보 표시 및 편집

## 🗄 데이터베이스 스키마

### users 테이블
- `id` (UUID, Primary Key): 사용자 고유 ID
- `username` (VARCHAR): 사용자명 (고유)
- `password_hash` (VARCHAR): 비밀번호 해시
- `created_at` (TIMESTAMP): 생성 시간

### todos 테이블
- `id` (UUID, Primary Key): TODO 고유 ID
- `user_id` (UUID, Foreign Key): 사용자 ID
- `date` (DATE): 날짜
- `title` (VARCHAR): TODO 제목
- `description` (TEXT): TODO 설명
- `completed` (BOOLEAN): 완료 상태
- `created_at` (TIMESTAMP): 생성 시간
- `updated_at` (TIMESTAMP): 수정 시간

### memos 테이블
- `id` (UUID, Primary Key): 메모 고유 ID
- `user_id` (UUID, Foreign Key): 사용자 ID
- `date` (DATE): 날짜
- `content` (TEXT): 마크다운 메모 내용
- `created_at` (TIMESTAMP): 생성 시간
- `updated_at` (TIMESTAMP): 수정 시간

### custom_holidays 테이블
- `id` (UUID, Primary Key): 휴일 고유 ID
- `user_id` (UUID, Foreign Key): 사용자 ID
- `date` (DATE): 날짜
- `name` (VARCHAR): 휴일 이름
- `color` (VARCHAR): 색상 코드
- `created_at` (TIMESTAMP): 생성 시간

## 🔒 보안 기능

### 환경변수 기반 보안
- 모든 시크릿 값은 `.env.local` 파일에서 관리
- HTML에 환경변수 직접 주입하지 않음
- 로그인 성공 시에만 필요한 정보를 API로 제공

### 서버 사이드 인증
- 클라이언트에서 비밀번호 검증하지 않음
- 서버 API를 통한 안전한 인증
- 세션 기반 사용자 관리

## 🎨 UI/UX 특징

### 반응형 디자인
- 데스크톱과 모바일 모두 지원
- Flexbox 기반 레이아웃
- 직관적인 사용자 인터페이스

### 접근성
- 키보드 단축키 지원
- 시맨틱 HTML 구조
- 색상 대비 고려

### 사용자 경험
- 실시간 미리보기
- 드래그 앤 드롭 없이 클릭 기반
- 모달 기반 편집 인터페이스

## 🚀 배포

### 로컬 개발
```bash
npm start
```

### 프로덕션 배포
1. 환경변수 설정
2. Node.js 서버 실행
3. 리버스 프록시 설정 (Nginx 등)

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 👨‍💻 개발자 정보

- **프로젝트명**: for PURIN - TODO 앱
- **버전**: 1.0.0
- **라이선스**: MIT
- **기술 스택**: HTML5, CSS3, JavaScript, Node.js, Supabase

## 📞 지원

문제가 발생하거나 질문이 있으시면 GitHub Issues를 통해 문의해주세요.

---

**for PURIN** - 간단하고 강력한 TODO 앱 🚀
