# for PURIN - TODO 앱

HTML, CSS, JavaScript만 사용하여 만든 간단한 TODO 앱입니다. Supabase를 백엔드로 사용하여 데이터를 저장합니다.

## 🌟 주요 기능

- 📅 **달력 기반 인터페이스**: 왼쪽에 달력, 오른쪽에 TODO와 메모
- ✅ **TODO 관리**: 추가, 완료 체크, 편집, 삭제
- 📝 **마크다운 메모**: 마크다운 에디터로 풍부한 메모 작성
- 🎨 **커스텀 휴일**: 개인 휴일 추가 및 색상 지정
- 🔐 **간단한 로그인**: 어드민 계정으로 로그인
- 📱 **반응형 디자인**: 모바일에서도 사용 가능
- 💾 **Supabase 연동**: 클라우드 데이터베이스에 데이터 저장

## 📋 상세 기능

### 📅 달력 기능
- 월별 달력 보기 및 네비게이션
- 오늘 날짜 하이라이트
- 주말 및 공휴일 색상 구분 (토요일: 파란색, 일요일/공휴일: 빨간색)
- 데이터가 있는 날짜 점 표시
- 커스텀 휴일 색상 적용

### ✅ TODO 관리
- 제목과 설명이 있는 TODO 추가
- 완료 상태 토글
- 클릭으로 편집 (모달 창)
- 삭제 기능

### 📝 마크다운 메모
- **좌우 분할 에디터**: 왼쪽 편집, 오른쪽 실시간 미리보기
- **마크다운 지원**: 제목, 굵게, 기울임, 코드, 링크, 목록, 인용문
- **키보드 단축키**: Ctrl+B (굵게), Ctrl+I (기울임), Ctrl+` (코드)
- **툴바 버튼**: 마크다운 문법 쉽게 적용
- **실시간 미리보기**: 타이핑할 때마다 즉시 반영

### 🎨 커스텀 휴일
- 개인 휴일 추가 (날짜, 이름, 색상)
- 10가지 색상 선택 가능
- 달력에 색상 반영
- 선택된 날짜에서 휴일 정보 표시 및 편집

## 프로젝트 구조

```
daily-memo/
├── index.html          # 메인 HTML 파일
├── styles.css          # CSS 스타일
├── config.js           # Supabase 설정
├── app.js              # 메인 JavaScript 로직
├── package.json        # Node.js 프로젝트 설정
└── README.md           # 프로젝트 설명
```

## 🗄️ 데이터베이스 스키마

### users 테이블
- `id`: UUID (Primary Key)
- `username`: VARCHAR(50) (Unique)
- `password_hash`: VARCHAR(255)
- `created_at`: TIMESTAMP

### todos 테이블
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key)
- `date`: DATE
- `title`: VARCHAR(255)
- `description`: TEXT
- `completed`: BOOLEAN
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### memos 테이블
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key)
- `date`: DATE
- `content`: TEXT (마크다운 지원)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### custom_holidays 테이블
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key)
- `date`: DATE
- `name`: VARCHAR(255)
- `color`: VARCHAR(7) (HEX 색상 코드)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## 🚀 사용법

### 1. 로그인
- 사용자명: `admin`
- 비밀번호: `admin123`

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

## 설치 및 실행

### 방법 1: Node.js 사용 (권장)

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
   # 개발 모드 (캐시 비활성화)
   npm run dev
   
   # 또는 일반 실행
   npm start
   
   # 또는 직접 실행
   npm run serve
   ```

4. **브라우저에서 접속**
   - `http://localhost:8000` 으로 접속
   - 로그인 후 사용 시작

### 방법 2: Python 사용

1. **Python 설치 확인**
   ```bash
   python3 --version
   ```

2. **프로젝트 실행**
   ```bash
   python3 -m http.server 8000
   ```

3. **브라우저에서 접속**
   - `http://localhost:8000` 으로 접속
   - 로그인 후 사용 시작

### 방법 3: Live Server (VS Code 확장)

1. **VS Code에서 Live Server 확장 설치**
2. **index.html 파일 우클릭**
3. **"Open with Live Server" 선택**
4. **자동으로 브라우저에서 열림**

### 로그인 정보
- 사용자명: `admin`
- 비밀번호: `admin123`

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: 간단한 클라이언트 사이드 인증
- **Database**: Supabase PostgreSQL
- **Markdown**: marked.js 라이브러리

## ✨ 주요 특징

- **순수 JavaScript**: 프레임워크 없이 구현
- **반응형 디자인**: 모바일 친화적 UI
- **실시간 데이터**: Supabase를 통한 실시간 데이터 동기화
- **마크다운 지원**: 풍부한 텍스트 편집 기능
- **커스텀 휴일**: 개인화된 달력 관리
- **사용자 친화적**: 직관적인 인터페이스
- **확장 가능**: 모듈화된 코드 구조

## 📸 스크린샷

### 메인 화면
- 달력과 TODO/메모 분할 화면
- 마크다운 메모 실시간 미리보기
- 커스텀 휴일 색상 표시

### 마크다운 에디터
- 좌우 분할 편집 화면
- 툴바와 키보드 단축키 지원
- 실시간 미리보기

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 👨‍💻 개발자 정보

이 프로젝트는 HTML, CSS, JavaScript만을 사용하여 구현되었으며, Supabase를 백엔드로 활용하여 데이터를 저장합니다.

### 주요 기능 구현
- **달력 시스템**: 월별 네비게이션, 날짜 선택, 색상 구분
- **마크다운 에디터**: 좌우 분할 화면, 실시간 미리보기, 키보드 단축키
- **커스텀 휴일**: 개인 휴일 관리, 색상 선택, 달력 반영
- **데이터 관리**: Supabase 연동, CRUD 작업, 실시간 동기화
