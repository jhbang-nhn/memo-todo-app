// 전역 변수
let currentDate = new Date();
let selectedDate = new Date();
let currentUser = null;
let supabaseClient = null;

// 공휴일 데이터는 constants.js에서 관리

// DOM 요소들
const loginScreen = document.getElementById('loginScreen');
const appScreen = document.getElementById('appScreen');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const currentMonthEl = document.getElementById('currentMonth');
const calendarDaysEl = document.getElementById('calendarDays');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const selectedDateTitle = document.getElementById('selectedDateTitle');

// TODO 관련 요소들
const todoList = document.getElementById('todoList');
const addTodoBtn = document.getElementById('addTodoBtn');
const addTodoForm = document.getElementById('addTodoForm');
const todoTitle = document.getElementById('todoTitle');
const todoDescription = document.getElementById('todoDescription');
const saveTodoBtn = document.getElementById('saveTodoBtn');
const cancelTodoBtn = document.getElementById('cancelTodoBtn');

// 메모 관련 요소들
const memoList = document.getElementById('memoList');
const addMemoBtn = document.getElementById('addMemoBtn');
const addMemoForm = document.getElementById('addMemoForm');
const memoContent = document.getElementById('memoContent');
const saveMemoBtn = document.getElementById('saveMemoBtn');
const cancelMemoBtn = document.getElementById('cancelMemoBtn');

// 모달 관련 요소들
const editModal = document.getElementById('editModal');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.getElementById('closeModal');
const editTodoForm = document.getElementById('editTodoForm');
const editMemoForm = document.getElementById('editMemoForm');
const editTodoTitle = document.getElementById('editTodoTitle');
const editTodoDescription = document.getElementById('editTodoDescription');
const editMemoContent = document.getElementById('editMemoContent');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// 커스텀 휴일 관련 요소들
const addHolidayBtn = document.getElementById('addHolidayBtn');
const addHolidayForm = document.getElementById('addHolidayForm');
const customHolidaysList = document.getElementById('customHolidaysList');
const holidayDate = document.getElementById('holidayDate');
const holidayColor = document.getElementById('holidayColor');
const holidayName = document.getElementById('holidayName');
const saveHolidayBtn = document.getElementById('saveHolidayBtn');
const cancelHolidayBtn = document.getElementById('cancelHolidayBtn');

// 선택된 날짜 휴일 표시 요소들
const selectedDateHoliday = document.getElementById('selectedDateHoliday');
let holidayColorDot, holidayNameSpan;

// DOM이 로드된 후 요소들 초기화
function initializeHolidayElements() {
    if (selectedDateHoliday) {
        holidayColorDot = selectedDateHoliday.querySelector('.holiday-color-dot');
        holidayNameSpan = selectedDateHoliday.querySelector('.holiday-name');
    }
}

// 편집 중인 아이템 정보
let editingItem = null;

// 커스텀 휴일 목록
let customHolidays = [];

// 현재 메모 데이터
let currentMemos = [];

// Range 휴일 관련 변수
let rangeSelection = {
    startDate: null,
    endDate: null,
    isSelecting: false
};

// 커스텀 날짜 선택기 관련 변수
let datePickerStates = {};

// 휴일 달력 상태 관리
let holidayCalendarState = {
    currentMonth: new Date(),
    selectedDates: [], // 범위 선택을 위한 배열
    selectionMode: 'single' // 'single' 또는 'range'
};

// 날짜 선택기 표시
function showDatePicker(inputId) {
    // 다른 모든 날짜 선택기 숨기기
    document.querySelectorAll('.date-picker-popup').forEach(popup => {
        popup.classList.add('hidden');
    });
    
    const popupId = inputId + 'Picker';
    const popup = document.getElementById(popupId);
    if (!popup) return;
    
    // 현재 날짜로 초기화
    const currentValue = document.getElementById(inputId).value;
    const currentDate = currentValue ? new Date(currentValue) : new Date();
    
    if (!datePickerStates[inputId]) {
        datePickerStates[inputId] = {
            currentMonth: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        };
    }
    
    renderDatePicker(inputId);
    popup.classList.remove('hidden');
    
    // 외부 클릭 시 닫기
    setTimeout(() => {
        document.addEventListener('click', function closeDatePicker(e) {
            if (!popup.contains(e.target) && !e.target.closest('.custom-date-picker')) {
                popup.classList.add('hidden');
                document.removeEventListener('click', closeDatePicker);
            }
        });
    }, 100);
}

// 날짜 선택기 렌더링
function renderDatePicker(inputId) {
    const state = datePickerStates[inputId];
    if (!state) return;
    
    const monthEl = document.getElementById(inputId + 'PickerMonth');
    const daysEl = document.getElementById(inputId + 'PickerDays');
    
    if (!monthEl || !daysEl) return;
    
    const year = state.currentMonth.getFullYear();
    const month = state.currentMonth.getMonth();
    
    monthEl.textContent = `${year}년 ${month + 1}월`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // 일요일부터 시작하도록 조정
    const firstDayOfWeek = firstDay.getDay();
    startDate.setDate(startDate.getDate() - firstDayOfWeek);
    
    let daysHTML = '';
    
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const isCurrentMonth = date.getMonth() === month;
        const isToday = isSameDate(date, new Date());
        const currentValue = document.getElementById(inputId).value;
        const isSelected = currentValue && isSameDate(date, new Date(currentValue));
        
        let className = 'date-picker-day';
        if (!isCurrentMonth) className += ' other-month';
        if (isToday) className += ' today';
        if (isSelected) className += ' selected';
        
        daysHTML += `<div class="${className}" data-date="${formatDateForDB(date)}" onclick="selectDate('${inputId}', '${formatDateForDB(date)}')">${date.getDate()}</div>`;
    }
    
    daysEl.innerHTML = daysHTML;
}

// 날짜 선택
function selectDate(inputId, dateStr) {
    document.getElementById(inputId).value = dateStr;
    document.getElementById(inputId + 'Picker').classList.add('hidden');
    
    // Range 기간 계산 업데이트
    if (inputId === 'holidayStartDate' || inputId === 'holidayEndDate') {
        updateRangeDuration();
    }
}

// 날짜 선택기 월 변경
function changePickerMonth(inputId, delta) {
    const state = datePickerStates[inputId];
    if (!state) return;
    
    state.currentMonth.setMonth(state.currentMonth.getMonth() + delta);
    renderDatePicker(inputId);
}

// 휴일 달력 월 변경
function changeHolidayCalendarMonth(delta) {
    holidayCalendarState.currentMonth.setMonth(holidayCalendarState.currentMonth.getMonth() + delta);
    renderHolidayCalendar();
}

// 휴일 달력 렌더링
function renderHolidayCalendar() {
    const monthEl = document.getElementById('holidayCalendarMonth');
    const daysEl = document.getElementById('holidayCalendarDays');
    
    if (!monthEl || !daysEl) {
        return;
    }
    
    const year = holidayCalendarState.currentMonth.getFullYear();
    const month = holidayCalendarState.currentMonth.getMonth();
    
    monthEl.textContent = `${year}년 ${month + 1}월`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // 일요일부터 시작하도록 조정
    const firstDayOfWeek = firstDay.getDay();
    startDate.setDate(startDate.getDate() - firstDayOfWeek);
    
    let daysHTML = '';
    
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const isCurrentMonth = date.getMonth() === month;
        const isToday = isSameDate(date, new Date());
        const dayOfWeek = date.getDay();
        const isSunday = dayOfWeek === 0; // 일요일
        const isSaturday = dayOfWeek === 6; // 토요일
        const dateStr = formatDateForDB(date);
        
        // 선택된 날짜 확인
        let isSelected = false;
        if (holidayCalendarState.selectionMode === 'single') {
            isSelected = holidayCalendarState.selectedDates.includes(dateStr);
        } else {
            isSelected = holidayCalendarState.selectedDates.includes(dateStr);
        }
        
        let classes = ['calendar-day'];
        if (!isCurrentMonth) classes.push('other-month');
        if (isToday) classes.push('today');
        if (isSunday) classes.push('sunday'); // 일요일은 빨간색
        if (isSaturday) classes.push('saturday'); // 토요일은 파란색
        if (isSelected) classes.push('selected');
        
        daysHTML += `<div class="${classes.join(' ')}" data-date="${dateStr}" onclick="selectHolidayDate('${dateStr}')">${date.getDate()}</div>`;
    }
    
    daysEl.innerHTML = daysHTML;
}

// 휴일 날짜 선택
function selectHolidayDate(dateStr) {
    if (holidayCalendarState.selectionMode === 'single') {
        // 단일 날짜 선택
        holidayCalendarState.selectedDates = [dateStr];
        document.getElementById('holidayDate').value = dateStr;
    } else {
        // 범위 날짜 선택
        if (holidayCalendarState.selectedDates.length === 0) {
            // 첫 번째 날짜 선택
            holidayCalendarState.selectedDates = [dateStr];
            document.getElementById('holidayStartDate').value = dateStr;
            document.getElementById('holidayEndDate').value = '';
            document.getElementById('rangeDuration').textContent = '종료일을 선택해주세요';
        } else if (holidayCalendarState.selectedDates.length === 1) {
            // 두 번째 날짜 선택
            const startDate = new Date(holidayCalendarState.selectedDates[0]);
            const endDate = new Date(dateStr);
            
            if (startDate <= endDate) {
                // 정상 순서
                holidayCalendarState.selectedDates = [holidayCalendarState.selectedDates[0], dateStr];
                document.getElementById('holidayEndDate').value = dateStr;
                
                // 범위 내 모든 날짜 추가
                const allDates = [];
                const currentDate = new Date(startDate);
                while (currentDate <= endDate) {
                    allDates.push(formatDateForDB(currentDate));
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                holidayCalendarState.selectedDates = allDates;
                
                // 기간 계산
                const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                document.getElementById('rangeDuration').textContent = `기간: ${duration}일`;
            } else {
                // 역순이면 새로 시작
                holidayCalendarState.selectedDates = [dateStr];
                document.getElementById('holidayStartDate').value = dateStr;
                document.getElementById('holidayEndDate').value = '';
                document.getElementById('rangeDuration').textContent = '종료일을 선택해주세요';
            }
        } else {
            // 이미 범위가 선택되어 있으면 새로 시작
            holidayCalendarState.selectedDates = [dateStr];
            document.getElementById('holidayStartDate').value = dateStr;
            document.getElementById('holidayEndDate').value = '';
            document.getElementById('rangeDuration').textContent = '종료일을 선택해주세요';
        }
    }
    
    renderHolidayCalendar();
}

// 휴일 달력 초기화
function initializeHolidayCalendar() {
    // DOM 요소 존재 확인
    const monthEl = document.getElementById('holidayCalendarMonth');
    const daysEl = document.getElementById('holidayCalendarDays');
    
    if (!monthEl || !daysEl) {
        setTimeout(initializeHolidayCalendar, 100);
        return;
    }
    
    holidayCalendarState.currentMonth = new Date();
    holidayCalendarState.selectedDates = [];
    holidayCalendarState.selectionMode = 'single';
    renderHolidayCalendar();
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', init);
loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
prevMonthBtn.addEventListener('click', () => changeMonth(-1));
nextMonthBtn.addEventListener('click', () => changeMonth(1));
addTodoBtn.addEventListener('click', showAddTodoForm);
addMemoBtn.addEventListener('click', showAddMemoForm);
saveTodoBtn.addEventListener('click', saveTodo);
saveMemoBtn.addEventListener('click', saveMemo);
cancelTodoBtn.addEventListener('click', hideAddTodoForm);
cancelMemoBtn.addEventListener('click', hideAddMemoForm);

// 모달 이벤트 리스너
closeModal.addEventListener('click', hideEditModal);
cancelEditBtn.addEventListener('click', hideEditModal);
saveEditBtn.addEventListener('click', saveEdit);
editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
        hideEditModal();
    }
});

// 커스텀 휴일 이벤트 리스너
addHolidayBtn.addEventListener('click', showAddHolidayForm);
saveHolidayBtn.addEventListener('click', saveHoliday);
cancelHolidayBtn.addEventListener('click', hideAddHolidayForm);

// 휴일 타입 변경 이벤트 리스너
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('type-btn')) {
        e.preventDefault();
        
        // 모든 버튼에서 active 클래스 제거
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 클릭된 버튼에 active 클래스 추가
        e.target.classList.add('active');
        
        // hidden input 값 업데이트
        const type = e.target.dataset.type;
        document.querySelector('input[name="holidayType"]').value = type;
        
        // 입력 필드 토글 (달력 모드도 함께 변경됨)
        toggleHolidayTypeInput(type);
    }
});

// Range 날짜 변경 이벤트 리스너
document.addEventListener('input', (e) => {
    if (e.target.id === 'holidayStartDate' || e.target.id === 'holidayEndDate') {
        updateRangeDuration();
    }
});

// 색상 선택 버튼 이벤트 리스너
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('color-btn')) {
        e.preventDefault();
        selectColor(e.target);
    }
    
    // 마크다운 에디터 툴바 버튼 이벤트
    if (e.target.classList.contains('toolbar-btn')) {
        e.preventDefault();
        handleToolbarAction(e.target);
    }
});

// 마크다운 에디터 키보드 단축키 및 실시간 미리보기
document.addEventListener('keydown', function(e) {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.tagName === 'TEXTAREA' && activeElement.closest('.markdown-editor')) {
        const editor = activeElement.closest('.markdown-editor');
        const textarea = activeElement;
        const preview = editor.querySelector('.markdown-preview');
        
        // Ctrl+B: 굵게
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            applyMarkdownFormat(textarea, '**', '**');
        }
        // Ctrl+I: 기울임
        else if (e.ctrlKey && e.key === 'i') {
            e.preventDefault();
            applyMarkdownFormat(textarea, '*', '*');
        }
        // Ctrl+`: 코드
        else if (e.ctrlKey && e.key === '`') {
            e.preventDefault();
            applyMarkdownFormat(textarea, '`', '`');
        }

    }
});

// 마크다운 에디터 실시간 미리보기
document.addEventListener('input', function(e) {
    if (e.target.tagName === 'TEXTAREA' && e.target.closest('.markdown-editor')) {
        const editor = e.target.closest('.markdown-editor');
        const textarea = e.target;
        const preview = editor.querySelector('.markdown-preview');
        
        // 실시간 미리보기 업데이트
        updatePreview(textarea, preview);
    }
});

// 초기화
async function init() {
    // DOM 요소 초기화
    initializeHolidayElements();
    
    // 로그인 상태 확인
    const savedUser = localStorage.getItem('currentUser');
    const savedCredentials = localStorage.getItem('userCredentials');
    
    if (savedUser && savedCredentials) {
        try {
            currentUser = JSON.parse(savedUser);
            const credentials = JSON.parse(savedCredentials);
            
            // 저장된 자격증명으로 Supabase 초기화
            SUPABASE_URL = credentials.supabaseUrl;
            SUPABASE_ANON_KEY = credentials.supabaseAnonKey;
            
            // 환경변수 검증
            if (!validateEnvironmentVariables()) {
                throw new Error('환경변수 검증 실패');
            }
            
            // Supabase 클라이언트 초기화
            supabaseClient = initializeSupabase();
            if (!supabaseClient) {
                throw new Error('Supabase 클라이언트 초기화 실패');
            }
            
            // 사용자 ID 재확인
            const adminUserId = await getAdminUserId();
            if (!adminUserId) {
                throw new Error('사용자 ID 확인 실패');
            }
            
            // 사용자 ID 업데이트
            currentUser.id = adminUserId;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showApp();
        } catch (error) {
            console.error('❌ 자동 로그인 실패:', error);
            // 저장된 정보 삭제
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userCredentials');
            showLogin();
        }
    } else {
        showLogin();
    }
}

// API 엔드포인트 URL 동적 설정
function getApiUrl() {
    // 로컬 개발 환경 (포트 8000)
    if (window.location.hostname === 'localhost' && window.location.port === '8000') {
        return 'http://localhost:8000/api/auth/validate';
    }
    // Vercel 배포 환경
    return '/api/auth/validate';
}

// 로그인 처리
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // 동적 API URL 사용
        const apiUrl = getApiUrl();
        console.log('🔗 API URL:', apiUrl);
        
        // 서버 API를 통해 로그인 검증 및 환경변수 가져오기
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            // 환경변수 설정
            SUPABASE_URL = data.supabaseUrl;
            SUPABASE_ANON_KEY = data.supabaseAnonKey;
            
            // 환경변수 검증
            if (!validateEnvironmentVariables()) {
                alert('❌ 환경변수 설정에 문제가 있습니다.');
                return;
            }

            // Supabase 클라이언트 초기화
            supabaseClient = initializeSupabase();
            if (!supabaseClient) {
                alert('❌ Supabase 클라이언트 초기화에 실패했습니다.');
                return;
            }

            // 데이터베이스에서 admin 사용자의 UUID 조회
            const adminUserId = await getAdminUserId();
            
            if (!adminUserId) {
                alert('❌ admin 사용자를 찾을 수 없습니다. 데이터베이스를 확인해주세요.');
                return;
            }
            
            currentUser = { id: adminUserId, username: username };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // 자격증명 저장 (새로고침 후 자동 로그인용)
            const credentials = {
                supabaseUrl: SUPABASE_URL,
                supabaseAnonKey: SUPABASE_ANON_KEY
            };
            localStorage.setItem('userCredentials', JSON.stringify(credentials));
            
            showApp();
        } else {
            alert(data.message || '잘못된 사용자명 또는 비밀번호입니다.');
        }
    } catch (error) {
        console.error('❌ 로그인 중 오류:', error);
        alert('❌ 로그인 중 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.');
    }
}

// 로그아웃 처리
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userCredentials');
    showLogin();
}

// 화면 전환
function showLogin() {
    loginScreen.classList.remove('hidden');
    appScreen.classList.add('hidden');
}

async function showApp() {
    console.log('🚀 showApp 함수 시작');
    
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    
    // DOM 요소 재초기화 (화면 전환 후)
    initializeHolidayElements();
    console.log('✅ DOM 요소 초기화 완료');
    
    try {
        await loadCustomHolidays();
        console.log('✅ 커스텀 휴일 로드 완료');
        
        await renderCalendar();
        console.log('✅ 달력 렌더링 완료');
        
        await loadDataForDate(selectedDate);
        console.log('✅ 선택된 날짜 데이터 로드 완료');
    } catch (error) {
        console.error('❌ showApp 중 오류:', error);
    }
}

// 달력 렌더링
async function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    currentMonthEl.textContent = `${year}년 ${month + 1}월`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // 일요일부터 시작하도록 조정 (일요일=0, 월요일=1, ..., 토요일=6)
    const firstDayOfWeek = firstDay.getDay(); // 일요일=0, 월요일=1, ..., 토요일=6
    startDate.setDate(startDate.getDate() - firstDayOfWeek);
    
    let calendarHTML = '';
    
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const isCurrentMonth = date.getMonth() === month;
        const isToday = isSameDate(date, new Date());
        const isSelected = isSameDate(date, selectedDate);
        const isSunday = date.getDay() === 0; // 일요일
        const isSaturday = date.getDay() === 6; // 토요일
        const isHolidayDate = isHoliday(date);
        const isCustomHolidayDate = isCustomHoliday(date);
        const customHolidayInfo = getCustomHolidayInfo(date);
        
        let className = 'calendar-day';
        if (!isCurrentMonth) className += ' other-month';
        if (isToday) className += ' today';
        if (isSelected) className += ' selected';
        if (isSunday || isHolidayDate) className += ' sunday-holiday';
        if (isSaturday) className += ' saturday';
        if (isCustomHolidayDate) className += ' custom-holiday';
        
        let holidayTooltip = '';
        if (customHolidayInfo) {
            holidayTooltip = ` title="${customHolidayInfo.name}"`;
        } else if (getHolidayName(date)) {
            holidayTooltip = ` title="${getHolidayName(date)}"`;
        }
        
        // 커스텀 휴일인 경우 인라인 스타일로 색상 적용 (단, Range 휴일은 제외)
        let styleAttr = '';
        if (customHolidayInfo && !customHolidayInfo.is_range) {
            // 다른 달의 커스텀 휴일은 투명도 적용
            const opacity = !isCurrentMonth ? '0.6' : '1';
            styleAttr = ` style="color: ${customHolidayInfo.color} !important; opacity: ${opacity};"`;
        }
        
        calendarHTML += `<div class="${className}" data-date="${formatDateForDB(date)}"${holidayTooltip}${styleAttr}>${date.getDate()}</div>`;
    }
    
    calendarDaysEl.innerHTML = calendarHTML;
    
    // 날짜 클릭 이벤트 추가
    calendarDaysEl.addEventListener('click', handleDateClick);
    
    // 데이터가 있는 날짜 표시
    await markDatesWithData();
    
    // Range 휴일 그라데이션 적용
    await applyRangeHolidayGradients();
}

// 날짜 클릭 처리
function handleDateClick(e) {
    if (e.target.classList.contains('calendar-day')) {
        const dateStr = e.target.dataset.date;
        // YYYY-MM-DD 형식을 파싱하여 로컬 시간대로 Date 객체 생성
        const [year, month, day] = dateStr.split('-').map(Number);
        selectedDate = new Date(year, month - 1, day);
        
        // 선택된 날짜 표시 업데이트
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        e.target.classList.add('selected');
        
        // 해당 날짜의 데이터 로드
        loadDataForDate(selectedDate);
    }
}

// 월 변경
async function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    await renderCalendar();
    
    // 월 변경 시 커스텀 휴일 리스트 필터링 업데이트
    if (currentUser) {
        renderCustomHolidaysList();
    }
}

// 날짜 비교
function isSameDate(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

// 날짜 포맷팅 (화면 표시용)
function formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

// 날짜 포맷팅 (데이터베이스용)
function formatDateForDB(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// 공휴일 확인
function isHoliday(date) {
    const dateStr = formatDateForDB(date);
    const year = date.getFullYear();
    const yearHolidays = HolidayUtils.getHolidaysForYear(year);
    return yearHolidays[dateStr] || false;
}

// 공휴일 이름 가져오기
function getHolidayName(date) {
    const dateStr = formatDateForDB(date);
    const year = date.getFullYear();
    const yearHolidays = HolidayUtils.getHolidaysForYear(year);
    return yearHolidays[dateStr] || '';
}

// 커스텀 휴일 확인
function isCustomHoliday(date) {
    const dateStr = formatDateForDB(date);
    return customHolidays.find(holiday => holiday.date === dateStr) || false;
}

// 커스텀 휴일 정보 가져오기 (Range 휴일 지원)
function getCustomHolidayInfo(date) {
    const dateStr = formatDateForDB(date);
    
    // Range 휴일 우선 검색
    const rangeHoliday = customHolidays.find(holiday => {
        if (!holiday.is_range || !holiday.end_date) return false;
        const startDate = new Date(holiday.start_date);
        const endDate = new Date(holiday.end_date);
        const targetDate = new Date(dateStr);
        return targetDate >= startDate && targetDate <= endDate;
    });
    
    if (rangeHoliday) return rangeHoliday;
    
    // 단일 휴일 검색
    return customHolidays.find(holiday => holiday.start_date === dateStr) || null;
}

// 데이터가 있는 날짜 표시
async function markDatesWithData() {
    try {
        const { data: todos } = await supabaseClient
            .from('todos')
            .select('date')
            .eq('user_id', currentUser.id);
            
        const { data: memos } = await supabaseClient
            .from('memos')
            .select('date')
            .eq('user_id', currentUser.id);
        
        const datesWithData = new Set();
        
        if (todos) {
            todos.forEach(todo => datesWithData.add(todo.date));
        }
        
        if (memos) {
            memos.forEach(memo => datesWithData.add(memo.date));
        }
        
        // 달력에서 데이터가 있는 날짜 표시 (모든 점을 먼저 제거하고 다시 추가)
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('has-data');
            const dateStr = day.dataset.date;
            if (datesWithData.has(dateStr)) {
                day.classList.add('has-data');
            }
        });
    } catch (error) {
        console.error('데이터가 있는 날짜 표시 중 오류:', error);
    }
}

// 선택된 날짜의 데이터 로드
async function loadDataForDate(date) {
    selectedDateTitle.textContent = formatDate(date);
    
    // 선택된 날짜의 커스텀 휴일 표시
    showSelectedDateHoliday(date);
    
    await Promise.all([
        loadTodosForDate(date),
        loadMemosForDate(date)
    ]);
}

// TODO 데이터 로드
async function loadTodosForDate(date) {
    try {
        const dateStr = formatDateForDB(date);
        const { data: todos, error } = await supabaseClient
            .from('todos')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('date', dateStr)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        renderTodoList(todos || []);
    } catch (error) {
        console.error('TODO 로드 중 오류:', error);
        renderTodoList([]);
    }
}

// 메모 데이터 로드
async function loadMemosForDate(date) {
    try {
        const dateStr = formatDateForDB(date);
        const { data: memos, error } = await supabaseClient
            .from('memos')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('date', dateStr)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        currentMemos = memos || [];
        renderMemoList(currentMemos);
    } catch (error) {
        console.error('메모 로드 중 오류:', error);
        currentMemos = [];
        renderMemoList(currentMemos);
    }
}

// TODO 리스트 렌더링
function renderTodoList(todos) {
    if (todos.length === 0) {
        todoList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">등록된 TODO가 없습니다.</p>';
        return;
    }
    
    todoList.innerHTML = todos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo('${todo.id}', this.checked)" onclick="event.stopPropagation()">
            <div class="todo-content" onclick="editTodo('${todo.id}')">
                <div class="todo-title">${escapeHtml(todo.title)}</div>
                ${todo.description ? `<div class="todo-description">${formatTextWithLineBreaks(todo.description)}</div>` : ''}
            </div>
            <div class="todo-actions">
                <button class="delete-btn" onclick="deleteTodo('${todo.id}'); event.stopPropagation()">🗑️</button>
            </div>
        </div>
    `).join('');
}

// 메모 리스트 렌더링
function renderMemoList(memos) {
    if (memos.length === 0) {
        memoList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">등록된 메모가 없습니다.</p>';
        return;
    }
    
    memoList.innerHTML = memos.map(memo => `
        <div class="memo-item" data-id="${memo.id}">
            <div class="memo-content" onclick="editMemo('${memo.id}')">${markdownToHtml(memo.content)}</div>
            <div class="memo-actions">
                <button onclick="deleteMemo('${memo.id}'); event.stopPropagation()" title="삭제">🗑️</button>
            </div>
        </div>
    `).join('');
}

// TODO 추가 폼 표시/숨김
function showAddTodoForm() {
    addTodoForm.classList.remove('hidden');
    todoTitle.focus();
}

function hideAddTodoForm() {
    addTodoForm.classList.add('hidden');
    todoTitle.value = '';
    todoDescription.value = '';
}

// 메모 추가 폼 표시/숨김
function showAddMemoForm() {
    addMemoForm.classList.remove('hidden');
    memoContent.value = '';
    memoContent.focus();
    
    // 초기 미리보기 업데이트
    setTimeout(() => {
        const preview = addMemoForm.querySelector('.markdown-preview');
        updatePreview(memoContent, preview);
    }, 100);
}

function hideAddMemoForm() {
    addMemoForm.classList.add('hidden');
    memoContent.value = '';
}

// TODO 저장
async function saveTodo() {
    const title = todoTitle.value.trim();
    if (!title) {
        alert('TODO 제목을 입력해주세요.');
        return;
    }
    
    try {
        const dateStr = formatDateForDB(selectedDate);
        // 줄바꿈을 <br> 태그로 변환하여 저장
        const description = todoDescription.value.trim().replace(/\n/g, '<br>');
        
        const { error } = await supabaseClient
            .from('todos')
            .insert({
                user_id: currentUser.id,
                date: dateStr,
                title: title,
                description: description
            });
        
        if (error) throw error;
        
        hideAddTodoForm();
        loadTodosForDate(selectedDate);
        await markDatesWithData();
    } catch (error) {
        console.error('TODO 저장 중 오류:', error);
        alert('TODO 저장 중 오류가 발생했습니다.');
    }
}

// 메모 저장
async function saveMemo() {
    const content = memoContent.value.trim();
    if (!content) {
        alert('메모 내용을 입력해주세요.');
        return;
    }
    
    try {
        const dateStr = formatDateForDB(selectedDate);
        const { error } = await supabaseClient
            .from('memos')
            .insert({
                user_id: currentUser.id,
                date: dateStr,
                content: content
            });
        
        if (error) throw error;
        
        hideAddMemoForm();
        loadMemosForDate(selectedDate);
        await markDatesWithData();
    } catch (error) {
        console.error('메모 저장 중 오류:', error);
        alert('메모 저장 중 오류가 발생했습니다.');
    }
}

// TODO 완료 상태 토글
async function toggleTodo(todoId, completed) {
    try {
        const { error } = await supabaseClient
            .from('todos')
            .update({ completed: completed })
            .eq('id', todoId);
        
        if (error) throw error;
        
        loadTodosForDate(selectedDate);
    } catch (error) {
        console.error('TODO 상태 변경 중 오류:', error);
        alert('TODO 상태 변경 중 오류가 발생했습니다.');
    }
}

// TODO 삭제
async function deleteTodo(todoId) {
    if (!confirm('이 TODO를 삭제하시겠습니까?')) return;
    
    try {
        const { error } = await supabaseClient
            .from('todos')
            .delete()
            .eq('id', todoId);
        
        if (error) throw error;
        
        loadTodosForDate(selectedDate);
        await markDatesWithData();
    } catch (error) {
        console.error('TODO 삭제 중 오류:', error);
        alert('TODO 삭제 중 오류가 발생했습니다.');
    }
}

// 메모 삭제
async function deleteMemo(memoId) {
    if (!confirm('이 메모를 삭제하시겠습니까?')) return;
    
    try {
        const { error } = await supabaseClient
            .from('memos')
            .delete()
            .eq('id', memoId);
        
        if (error) throw error;
        
        loadMemosForDate(selectedDate);
        await markDatesWithData();
    } catch (error) {
        console.error('메모 삭제 중 오류:', error);
        alert('메모 삭제 중 오류가 발생했습니다.');
    }
}

// TODO 편집
async function editTodo(todoId) {
    const todoItem = document.querySelector(`[data-id="${todoId}"]`);
    const titleEl = todoItem.querySelector('.todo-title');
    const descriptionEl = todoItem.querySelector('.todo-description');
    
    editingItem = { type: 'todo', id: todoId };
    
    // 모달에 현재 값 설정
    editTodoTitle.value = titleEl.textContent;
    // <br> 태그를 줄바꿈으로 변환하여 textarea에 표시
    const descriptionText = descriptionEl ? descriptionEl.innerHTML.replace(/<br\s*\/?>/gi, '\n') : '';
    editTodoDescription.value = descriptionText;
    
    // 모달 표시
    modalTitle.textContent = 'TODO 수정';
    editTodoForm.classList.remove('hidden');
    editMemoForm.classList.add('hidden');
    editModal.classList.remove('hidden');
    
    editTodoTitle.focus();
}

// 메모 편집
async function editMemo(memoId) {
    const memo = currentMemos.find(m => m.id === memoId);
    if (!memo) return;
    
    editingItem = { type: 'memo', id: memoId };
    
    // 모달에 현재 값 설정 (원본 마크다운 데이터 사용)
    editMemoContent.value = memo.content;
    
    // 모달 표시
    modalTitle.textContent = '메모 수정';
    editMemoForm.classList.remove('hidden');
    editTodoForm.classList.add('hidden');
    editModal.classList.remove('hidden');
    
    editMemoContent.focus();
    
    // 초기 미리보기 업데이트
    setTimeout(() => {
        const preview = editMemoForm.querySelector('.markdown-preview');
        updatePreview(editMemoContent, preview);
    }, 100);
}

// 모달 숨기기
function hideEditModal() {
    editModal.classList.add('hidden');
    editTodoForm.classList.add('hidden');
    editMemoForm.classList.add('hidden');
    editingItem = null;
}

// 편집 저장
async function saveEdit() {
    if (!editingItem) return;
    
    try {
        if (editingItem.type === 'todo') {
            const title = editTodoTitle.value.trim();
            if (!title) {
                alert('TODO 제목을 입력해주세요.');
                return;
            }
            
            // 줄바꿈을 <br> 태그로 변환하여 저장
            const description = editTodoDescription.value.trim().replace(/\n/g, '<br>');
            
            const { error } = await supabaseClient
                .from('todos')
                .update({
                    title: title,
                    description: description
                })
                .eq('id', editingItem.id);
            
            if (error) throw error;
            
            loadTodosForDate(selectedDate);
        } else if (editingItem.type === 'memo') {
            const content = editMemoContent.value.trim();
            if (!content) {
                alert('메모 내용을 입력해주세요.');
                return;
            }
            
            const { error } = await supabaseClient
                .from('memos')
                .update({ content: content })
                .eq('id', editingItem.id);
            
            if (error) throw error;
            
            loadMemosForDate(selectedDate);
        }
        
        hideEditModal();
    } catch (error) {
        console.error('수정 중 오류:', error);
        alert('수정 중 오류가 발생했습니다.');
    }
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 줄바꿈을 포함한 텍스트 포맷팅
function formatTextWithLineBreaks(text) {
    if (!text) return '';
    // 이미 <br> 태그가 있는 경우 그대로 사용, 없는 경우 \n을 <br>로 변환
    if (text.includes('<br>')) {
        return text; // 이미 HTML 형식이므로 그대로 반환
    }
    return escapeHtml(text).replace(/\n/g, '<br>');
}

// 마크다운 텍스트를 HTML로 변환
function markdownToHtml(text) {
    if (!text) return '';
    
    // marked.js 옵션 설정
    marked.setOptions({
        breaks: true,        // 줄바꿈을 <br>로 변환
        gfm: true,          // GitHub Flavored Markdown 지원
        headerIds: true,    // 헤더에 ID 추가
        mangle: false,      // 헤더 ID 난독화 비활성화
        sanitize: false,    // HTML 태그 허용
        smartLists: true,   // 스마트 리스트
        smartypants: true,  // 스마트 문장부호
        xhtml: false        // XHTML 출력 비활성화
    });
    
    return marked.parse(text);
}

// 툴바 액션 처리
function handleToolbarAction(button) {
    const action = button.dataset.action;
    const textarea = button.closest('.markdown-editor').querySelector('textarea');
    const preview = button.closest('.markdown-editor').querySelector('.markdown-preview');
    

    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    let replacement = '';
    let cursorOffset = 0;
    
    switch (action) {
        case 'bold':
            replacement = selectedText ? `**${selectedText}**` : '**굵은 텍스트**';
            cursorOffset = selectedText ? 2 : 2;
            break;
        case 'italic':
            replacement = selectedText ? `*${selectedText}*` : '*기울임 텍스트*';
            cursorOffset = selectedText ? 1 : 1;
            break;
        case 'code':
            replacement = selectedText ? `\`${selectedText}\`` : '`코드`';
            cursorOffset = selectedText ? 1 : 1;
            break;
        case 'link':
            replacement = selectedText ? `[${selectedText}](URL)` : '[링크 텍스트](URL)';
            cursorOffset = selectedText ? 0 : -3; // URL 부분으로 커서 이동
            break;
        case 'list':
            if (selectedText) {
                const lines = selectedText.split('\n');
                const listLines = lines.map(line => line.trim() ? `- ${line}` : line);
                replacement = listLines.join('\n');
            } else {
                replacement = '- 목록 항목';
            }
            cursorOffset = 0;
            break;
        case 'heading':
            if (selectedText) {
                const lines = selectedText.split('\n');
                const headingLines = lines.map(line => line.trim() ? `# ${line}` : line);
                replacement = headingLines.join('\n');
            } else {
                replacement = '# 제목';
            }
            cursorOffset = 0;
            break;
        case 'quote':
            if (selectedText) {
                const lines = selectedText.split('\n');
                const quoteLines = lines.map(line => line.trim() ? `> ${line}` : line);
                replacement = quoteLines.join('\n');
            } else {
                replacement = '> 인용문';
            }
            cursorOffset = 0;
            break;
    }
    
    textarea.value = beforeText + replacement + afterText;
    textarea.focus();
    
    const newCursorPos = start + replacement.length + cursorOffset;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    
    // 미리보기 업데이트
    updatePreview(textarea, preview);
}

// 마크다운 포맷 적용 함수 (키보드 단축키용)
function applyMarkdownFormat(textarea, prefix, suffix) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let newText;
    if (selectedText) {
        // 선택된 텍스트가 있으면 포맷 적용
        newText = `${prefix}${selectedText}${suffix}`;
    } else {
        // 선택된 텍스트가 없으면 플레이스홀더 삽입
        newText = `${prefix}텍스트${suffix}`;
    }
    
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    textarea.value = beforeText + newText + afterText;
    textarea.focus();
    
    // 포맷 적용 후 텍스트 선택
    if (!selectedText) {
        const placeholderStart = start + prefix.length;
        const placeholderEnd = placeholderStart + 3; // "텍스트" 길이
        textarea.setSelectionRange(placeholderStart, placeholderEnd);
    } else {
        const newCursorPos = start + newText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    }
    
    // 미리보기 업데이트
    const editor = textarea.closest('.markdown-editor');
    const preview = editor.querySelector('.markdown-preview');
    updatePreview(textarea, preview);
}



// 미리보기 업데이트
function updatePreview(textarea, preview) {
    const text = textarea.value;
    if (!text.trim()) {
        preview.innerHTML = '';
        return;
    }
    
    try {
        const html = markdownToHtml(text);
        preview.innerHTML = html;
    } catch (error) {
        console.error('마크다운 렌더링 오류:', error);
        preview.innerHTML = '<p style="color: #e74c3c;">마크다운 렌더링 중 오류가 발생했습니다.</p>';
    }
}

// 전체 커스텀 휴일 로드
async function loadCustomHolidays() {
    try {
        const { data: holidays, error } = await supabaseClient
            .from('custom_holidays')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('start_date', { ascending: true });
        
        if (error) throw error;
        
        customHolidays = holidays || [];
        renderCustomHolidaysList();
        
        // Range 휴일 그라데이션 적용
        await applyRangeHolidayGradients();
    } catch (error) {
        console.error('커스텀 휴일 로드 중 오류:', error);
        customHolidays = [];
    }
}

// 현재 달 + 다음 달에 해당하는 커스텀 휴일 필터링 (클라이언트에서 처리)
function getFilteredCustomHolidays() {
    // 현재 달과 다음 달 범위 계산
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const nextMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);
    
    return customHolidays.filter(holiday => {
        const startDate = new Date(holiday.start_date);
        const endDate = holiday.end_date ? new Date(holiday.end_date) : startDate;
        
        // Range 휴일: 기간이 현재/다음 달과 겹치는지 확인
        if (holiday.is_range && holiday.end_date) {
            return (startDate <= nextMonthEnd && endDate >= currentMonthStart);
        }
        // 단일 휴일: 현재/다음 달에 포함되는지 확인
        else {
            return (startDate >= currentMonthStart && startDate <= nextMonthEnd);
        }
    });
}

// 커스텀 휴일 리스트 렌더링 (현재 달 + 다음 달만 표시)
function renderCustomHolidaysList() {
    const filteredHolidays = getFilteredCustomHolidays();
    
    if (filteredHolidays.length === 0) {
        customHolidaysList.innerHTML = '<p style="color: #666; text-align: center; padding: 10px;">이번 달과 다음 달에 등록된 커스텀 휴일이 없습니다.</p>';
        return;
    }
    
    customHolidaysList.innerHTML = filteredHolidays.map(holiday => {
        let dateDisplay;
        
        if (holiday.is_range && holiday.end_date) {
            const startDate = new Date(holiday.start_date);
            const endDate = new Date(holiday.end_date);
            const startFormatted = `${startDate.getFullYear()}년 ${startDate.getMonth() + 1}월 ${startDate.getDate()}일`;
            const endFormatted = `${endDate.getFullYear()}년 ${endDate.getMonth() + 1}월 ${endDate.getDate()}일`;
            const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            dateDisplay = `${startFormatted} ~ ${endFormatted} (${duration}일간)`;
        } else {
            const date = new Date(holiday.start_date);
            dateDisplay = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
        }
        
        return `
            <div class="custom-holiday-item" style="border-left-color: ${holiday.color}" onclick="editCustomHoliday('${holiday.id}')">
                <div class="custom-holiday-color" style="background-color: ${holiday.color}"></div>
                <div class="custom-holiday-info">
                    <div class="custom-holiday-date">${dateDisplay}</div>
                    <div class="custom-holiday-name">${escapeHtml(holiday.name)}</div>
                </div>
                <div class="custom-holiday-actions">
                    <button onclick="event.stopPropagation(); deleteCustomHoliday('${holiday.id}')" title="삭제">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

// 커스텀 휴일 추가 폼 표시/숨김
function showAddHolidayForm() {
    addHolidayForm.classList.remove('hidden');
    
    // 휴일 타입 초기화
    document.querySelector('input[name="holidayType"]').value = 'single';
    document.querySelector('.type-btn[data-type="single"]').classList.add('active');
    document.querySelector('.type-btn[data-type="range"]').classList.remove('active');
    toggleHolidayTypeInput('single');
    
    // 입력 필드 초기화
    document.getElementById('holidayDate').value = '';
    document.getElementById('holidayStartDate').value = '';
    document.getElementById('holidayEndDate').value = '';
    document.getElementById('rangeDuration').textContent = '날짜를 선택해주세요';
    
    resetColorSelection();
    
    // DOM이 준비된 후 달력 초기화 (비동기 실행)
    setTimeout(() => {
        initializeHolidayCalendar();
    }, 50);
}

function hideAddHolidayForm() {
    addHolidayForm.classList.add('hidden');
    
    // 입력 필드 초기화
    document.getElementById('holidayDate').value = '';
    document.getElementById('holidayStartDate').value = '';
    document.getElementById('holidayEndDate').value = '';
    holidayName.value = '';
    holidayColor.value = '#ff6b6b';
    resetColorSelection();
    
    // 휴일 타입 초기화
    document.querySelector('input[name="holidayType"]').value = 'single';
    document.querySelector('.type-btn[data-type="single"]').classList.add('active');
    document.querySelector('.type-btn[data-type="range"]').classList.remove('active');
    toggleHolidayTypeInput('single');
    
    // 수정 모드 초기화
    saveHolidayBtn.textContent = '저장';
    saveHolidayBtn.dataset.editMode = 'false';
    delete saveHolidayBtn.dataset.editId;
}

// 색상 선택
function selectColor(colorBtn) {
    // 모든 색상 버튼에서 선택 상태 제거
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // 클릭된 버튼을 선택 상태로 변경
    colorBtn.classList.add('selected');
    
    // hidden input에 선택된 색상 값 설정
    const selectedColor = colorBtn.dataset.color;
    holidayColor.value = selectedColor;
}

// 색상 선택 초기화
function resetColorSelection() {
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    // 첫 번째 색상(빨강)을 기본 선택으로 설정
    const firstColorBtn = document.querySelector('.color-btn');
    if (firstColorBtn) {
        firstColorBtn.classList.add('selected');
    }
}

// 커스텀 휴일 저장/수정
async function saveHoliday() {
    const holidayType = document.querySelector('input[name="holidayType"]').value;
    const name = holidayName.value.trim();
    const color = holidayColor.value;
    const isEditMode = saveHolidayBtn.dataset.editMode === 'true';
    const editId = saveHolidayBtn.dataset.editId;
    
    if (!name) {
        alert('기념일 이름을 입력해주세요.');
        return;
    }
    
    let startDate, endDate, isRange;
    
    if (holidayType === 'range') {
        startDate = document.getElementById('holidayStartDate').value;
        endDate = document.getElementById('holidayEndDate').value;
        isRange = true;
        
        if (!startDate || !endDate) {
            alert('시작일과 종료일을 입력해주세요.');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            alert('종료일은 시작일보다 늦어야 합니다.');
            return;
        }
    } else {
        startDate = document.getElementById('holidayDate').value;
        endDate = null;
        isRange = false;
        
        if (!startDate) {
            alert('날짜를 입력해주세요.');
            return;
        }
    }
    
    try {
        let error;
        
        if (isEditMode) {
            // 수정 모드
            const { error: updateError } = await supabaseClient
                .from('custom_holidays')
                .update({
                    start_date: startDate,
                    end_date: endDate,
                    name: name,
                    color: color,
                    is_range: isRange
                })
                .eq('id', editId);
            error = updateError;
        } else {
            // 추가 모드
            const { error: insertError } = await supabaseClient
                .from('custom_holidays')
                .insert({
                    user_id: currentUser.id,
                    start_date: startDate,
                    end_date: endDate,
                    name: name,
                    color: color,
                    is_range: isRange
                });
            error = insertError;
        }
        
        if (error) throw error;
        
        hideAddHolidayForm();
        await loadCustomHolidays();
        await renderCalendar();
        showSelectedDateHoliday(selectedDate); // 선택된 날짜 휴일 정보 업데이트
    } catch (error) {
        console.error('커스텀 휴일 저장 중 오류:', error);
        alert('커스텀 휴일 저장 중 오류가 발생했습니다.');
    }
}

// 커스텀 휴일 삭제
async function deleteCustomHoliday(holidayId) {
    if (!confirm('이 커스텀 휴일을 삭제하시겠습니까?')) return;
    
    try {
        const { error } = await supabaseClient
            .from('custom_holidays')
            .delete()
            .eq('id', holidayId);
        
        if (error) throw error;
        
        await loadCustomHolidays();
        await renderCalendar();
        showSelectedDateHoliday(selectedDate); // 선택된 날짜 휴일 정보 업데이트
    } catch (error) {
        console.error('커스텀 휴일 삭제 중 오류:', error);
        alert('커스텀 휴일 삭제 중 오류가 발생했습니다.');
    }
}

// 선택된 날짜의 커스텀 휴일 표시
function showSelectedDateHoliday(date) {
    const customHolidayInfo = getCustomHolidayInfo(date);
    
    if (customHolidayInfo && selectedDateHoliday && holidayColorDot && holidayNameSpan) {
        // 휴일 정보 표시
        holidayColorDot.style.backgroundColor = customHolidayInfo.color;
        holidayNameSpan.textContent = customHolidayInfo.name;
        selectedDateHoliday.style.borderLeftColor = customHolidayInfo.color;
        selectedDateHoliday.classList.remove('hidden');
        
        // 휴일 ID를 요소에 저장
        selectedDateHoliday.dataset.holidayId = customHolidayInfo.id;
    } else if (selectedDateHoliday) {
        // 휴일이 없으면 숨김
        selectedDateHoliday.classList.add('hidden');
    }
}

// 선택된 날짜의 휴일 수정
function editSelectedDateHoliday() {
    if (!selectedDateHoliday) return;
    
    const holidayId = selectedDateHoliday.dataset.holidayId;
    if (!holidayId) return;
    
    const holiday = customHolidays.find(h => h.id === holidayId);
    if (!holiday) return;
    
    // 수정 폼에 현재 값 설정
    holidayName.value = holiday.name;
    holidayColor.value = holiday.color;
    
    // 색상 선택 버튼 업데이트
    resetColorSelection();
    const colorBtn = document.querySelector(`[data-color="${holiday.color}"]`);
    if (colorBtn) {
        colorBtn.classList.add('selected');
    }
    
    // 휴일 타입에 따라 입력 필드 설정
    if (holiday.is_range && holiday.end_date) {
        // Range 휴일
        document.querySelector('input[name="holidayType"]').value = 'range';
        document.querySelector('.type-btn[data-type="range"]').classList.add('active');
        document.querySelector('.type-btn[data-type="single"]').classList.remove('active');
        toggleHolidayTypeInput('range');
        document.getElementById('holidayStartDate').value = holiday.start_date;
        document.getElementById('holidayEndDate').value = holiday.end_date;
        updateRangeDuration();
    } else {
        // 단일 휴일
        document.querySelector('input[name="holidayType"]').value = 'single';
        document.querySelector('.type-btn[data-type="single"]').classList.add('active');
        document.querySelector('.type-btn[data-type="range"]').classList.remove('active');
        toggleHolidayTypeInput('single');
        document.getElementById('holidayDate').value = holiday.start_date;
    }
    
    // 폼 표시
    showAddHolidayForm();
    
    // 저장 버튼을 수정 모드로 변경
    saveHolidayBtn.textContent = '수정';
    saveHolidayBtn.dataset.editMode = 'true';
    saveHolidayBtn.dataset.editId = holidayId;
}

// 커스텀 휴일 편집
async function editCustomHoliday(holidayId) {
    const holiday = customHolidays.find(h => h.id === holidayId);
    if (!holiday) return;
    
    // 편집 모드 설정
    saveHolidayBtn.textContent = '수정';
    saveHolidayBtn.dataset.editMode = 'true';
    saveHolidayBtn.dataset.editId = holidayId;
    
    // 폼에 기존 데이터 설정
    holidayName.value = holiday.name;
    holidayColor.value = holiday.color;
    
    // 색상 버튼 선택 상태 업데이트
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.color === holiday.color) {
            btn.classList.add('selected');
        }
    });
    
    // 폼 표시 (먼저 폼을 표시해서 DOM이 준비되도록 함)
    showAddHolidayForm();
    
    // 휴일 타입에 따라 입력 필드 설정
    if (holiday.is_range && holiday.end_date) {
        // Range 휴일
        document.querySelector('input[name="holidayType"]').value = 'range';
        document.querySelector('.type-btn[data-type="range"]').classList.add('active');
        document.querySelector('.type-btn[data-type="single"]').classList.remove('active');
        toggleHolidayTypeInput('range');
        
        // 범위 날짜들을 달력에 설정
        const startDate = new Date(holiday.start_date);
        const endDate = new Date(holiday.end_date);
        const selectedDates = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            selectedDates.push(formatDateForDB(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        holidayCalendarState.selectedDates = selectedDates;
        
        // 달력을 해당 월로 이동
        holidayCalendarState.currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        
        document.getElementById('holidayStartDate').value = holiday.start_date;
        document.getElementById('holidayEndDate').value = holiday.end_date;
        updateRangeDuration();
    } else {
        // 단일 휴일
        document.querySelector('input[name="holidayType"]').value = 'single';
        document.querySelector('.type-btn[data-type="single"]').classList.add('active');
        document.querySelector('.type-btn[data-type="range"]').classList.remove('active');
        toggleHolidayTypeInput('single');
        
        // 단일 날짜를 달력에 설정
        holidayCalendarState.selectedDates = [holiday.start_date];
        
        // 달력을 해당 월로 이동
        const date = new Date(holiday.start_date);
        holidayCalendarState.currentMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        
        document.getElementById('holidayDate').value = holiday.start_date;
    }
    
    // 달력 다시 렌더링
    renderHolidayCalendar();
}

// Range 휴일 그라데이션 적용
async function applyRangeHolidayGradients() {
    try {
        const rangeHolidays = await getRangeHolidays();
        
        if (!Array.isArray(rangeHolidays)) {
            console.warn('⚠️ Range 휴일 데이터가 배열이 아닙니다:', rangeHolidays);
            return;
        }
        
        rangeHolidays.forEach(holiday => {
            const dateRange = getDateRange(holiday.start_date, holiday.end_date);
            
            dateRange.forEach((date, index) => {
                const dayElement = getCalendarDayElement(date);
                if (!dayElement) return;
                
                // CSS 변수 설정
                dayElement.style.setProperty('--holiday-color', holiday.color);
                
                // Range 위치에 따른 클래스 적용
                if (dateRange.length === 1) {
                    dayElement.classList.add('range-single');
                } else if (index === 0) {
                    dayElement.classList.add('range-start');
                } else if (index === dateRange.length - 1) {
                    dayElement.classList.add('range-end');
                } else {
                    dayElement.classList.add('range-middle');
                }
                
                dayElement.classList.add('range-holiday');
                
                // 툴팁에 Range 정보 추가
                dayElement.title = `${holiday.name} (${holiday.start_date} ~ ${holiday.end_date})`;
            });
        });
    } catch (error) {
        console.error('❌ Range 휴일 그라데이션 적용 중 오류:', error);
    }
}

// 날짜 범위 생성
function getDateRange(startDate, endDate) {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    
    return dates;
}

// Range 휴일 조회
async function getRangeHolidays() {
    try {
        const { data, error } = await supabaseClient
            .from('custom_holidays')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('is_range', true);
        
        if (error) {
            console.error('❌ Range 휴일 조회 실패:', error);
            return [];
        }
        
        return data || [];
    } catch (error) {
        console.error('❌ Range 휴일 조회 중 오류:', error);
        return [];
    }
}

// 달력 날짜 요소 가져오기
function getCalendarDayElement(date) {
    const dateStr = formatDateForDB(date);
    return document.querySelector(`[data-date="${dateStr}"]`);
}

// 휴일 표시 정보 가져오기 (우선순위 적용)
function getHolidayDisplayInfo(date) {
    const holidays = getHolidaysForDate(date);
    
    // Range 휴일 우선
    const rangeHoliday = holidays.find(h => h.is_range);
    if (rangeHoliday) {
        return {
            type: 'range',
            holiday: rangeHoliday,
            position: getRangePosition(date, rangeHoliday)
        };
    }
    
    // 단일 휴일
    const singleHoliday = holidays.find(h => !h.is_range);
    if (singleHoliday) {
        return {
            type: 'single',
            holiday: singleHoliday
        };
    }
    
    return null;
}

// Range 위치 확인
function getRangePosition(date, holiday) {
    const dateRange = getDateRange(holiday.start_date, holiday.end_date);
    const dateIndex = dateRange.findIndex(d => formatDateForDB(d) === formatDateForDB(date));
    
    if (dateIndex === 0) return 'start';
    if (dateIndex === dateRange.length - 1) return 'end';
    return 'middle';
}

// 휴일 타입 입력 토글
function toggleHolidayTypeInput(type) {
    const singleInput = document.getElementById('singleDateInput');
    const rangeInput = document.getElementById('rangeDateInput');
    
    if (type === 'range') {
        singleInput.style.display = 'none';
        rangeInput.style.display = 'block';
        
        // 달력 선택 모드 변경
        holidayCalendarState.selectionMode = 'range';
        holidayCalendarState.selectedDates = [];
        
        // Range 입력 필드 초기화
        document.getElementById('holidayStartDate').value = '';
        document.getElementById('holidayEndDate').value = '';
        document.getElementById('rangeDuration').textContent = '날짜를 선택해주세요';
    } else {
        singleInput.style.display = 'block';
        rangeInput.style.display = 'none';
        
        // 달력 선택 모드 변경
        holidayCalendarState.selectionMode = 'single';
        holidayCalendarState.selectedDates = [];
        
        // 단일 날짜 입력 필드 초기화
        document.getElementById('holidayDate').value = '';
    }
    
    // 달력 다시 렌더링
    renderHolidayCalendar();
}

// Range 기간 계산 및 표시
function updateRangeDuration() {
    const startDate = document.getElementById('holidayStartDate').value;
    const endDate = document.getElementById('holidayEndDate').value;
    const durationElement = document.getElementById('rangeDuration');
    
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        if (duration > 0) {
            durationElement.textContent = `기간: ${duration}일`;
            durationElement.style.color = '#333';
        } else {
            durationElement.textContent = '기간: 잘못된 날짜';
            durationElement.style.color = '#e74c3c';
        }
    } else {
        durationElement.textContent = '기간: 날짜를 선택하세요';
        durationElement.style.color = '#666';
    }
}

// 특정 날짜의 모든 휴일 가져오기
function getHolidaysForDate(date) {
    const dateStr = formatDateForDB(date);
    const holidays = [];
    
    customHolidays.forEach(holiday => {
        if (holiday.is_range && holiday.end_date) {
            // Range 휴일 검사
            const startDate = new Date(holiday.start_date);
            const endDate = new Date(holiday.end_date);
            const targetDate = new Date(dateStr);
            
            if (targetDate >= startDate && targetDate <= endDate) {
                holidays.push(holiday);
            }
        } else {
            // 단일 휴일 검사
            if (holiday.start_date === dateStr) {
                holidays.push(holiday);
            }
        }
    });
    
    return holidays;
}
