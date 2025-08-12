// 전역 변수
let currentDate = new Date();
let selectedDate = new Date();
let currentUser = null;
let supabaseClient = null;

// 한국 공휴일 목록 (2025년 기준)
const HOLIDAYS_2025 = {
    '2025-01-01': '신정',
    '2025-02-09': '설날',
    '2025-02-10': '설날',
    '2025-02-11': '설날',
    '2025-03-01': '삼일절',
    '2025-05-05': '어린이날',
    '2025-05-19': '부처님오신날',
    '2025-06-06': '현충일',
    '2025-08-15': '광복절',
    '2025-10-03': '개천절',
    '2025-10-09': '한글날',
    '2025-12-25': '크리스마스'
};

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
const holidayColorDot = selectedDateHoliday.querySelector('.holiday-color-dot');
const holidayNameSpan = selectedDateHoliday.querySelector('.holiday-name');

// 편집 중인 아이템 정보
let editingItem = null;

// 커스텀 휴일 목록
let customHolidays = [];

// 현재 메모 데이터
let currentMemos = [];

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
function init() {
    // 로그인 상태 확인
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        // 저장된 사용자가 있으면 Supabase 초기화 시도
        supabaseClient = initializeSupabase();
        if (supabaseClient) {
            showApp();
        } else {
            // Supabase 초기화 실패 시 로그인 화면으로
            localStorage.removeItem('currentUser');
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
    showLogin();
}

// 화면 전환
function showLogin() {
    loginScreen.classList.remove('hidden');
    appScreen.classList.add('hidden');
}

async function showApp() {
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    await loadCustomHolidays();
    await renderCalendar();
    loadDataForDate(selectedDate);
}

// 달력 렌더링
async function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    currentMonthEl.textContent = `${year}년 ${month + 1}월`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    let calendarHTML = '';
    
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const isCurrentMonth = date.getMonth() === month;
        const isToday = isSameDate(date, new Date());
        const isSelected = isSameDate(date, selectedDate);
        const isSunday = date.getDay() === 0;
        const isSaturday = date.getDay() === 6;
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
        
        // 커스텀 휴일인 경우 인라인 스타일로 색상 적용
        let styleAttr = '';
        if (customHolidayInfo) {
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
    return HOLIDAYS_2025[dateStr] || false;
}

// 공휴일 이름 가져오기
function getHolidayName(date) {
    const dateStr = formatDateForDB(date);
    return HOLIDAYS_2025[dateStr] || '';
}

// 커스텀 휴일 확인
function isCustomHoliday(date) {
    const dateStr = formatDateForDB(date);
    return customHolidays.find(holiday => holiday.date === dateStr) || false;
}

// 커스텀 휴일 정보 가져오기
function getCustomHolidayInfo(date) {
    const dateStr = formatDateForDB(date);
    return customHolidays.find(holiday => holiday.date === dateStr) || null;
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
        const { error } = await supabaseClient
            .from('todos')
            .insert({
                user_id: currentUser.id,
                date: dateStr,
                title: title,
                description: todoDescription.value.trim()
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
    editTodoDescription.value = descriptionEl ? descriptionEl.textContent : '';
    
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
            
            const { error } = await supabaseClient
                .from('todos')
                .update({
                    title: title,
                    description: editTodoDescription.value.trim()
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

// 커스텀 휴일 로드
async function loadCustomHolidays() {
    try {
        const { data: holidays, error } = await supabaseClient
            .from('custom_holidays')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('date', { ascending: true });
        
        if (error) throw error;
        
        customHolidays = holidays || [];
        renderCustomHolidaysList();
    } catch (error) {
        console.error('커스텀 휴일 로드 중 오류:', error);
        customHolidays = [];
    }
}

// 커스텀 휴일 리스트 렌더링
function renderCustomHolidaysList() {
    if (customHolidays.length === 0) {
        customHolidaysList.innerHTML = '<p style="color: #666; text-align: center; padding: 10px;">등록된 커스텀 휴일이 없습니다.</p>';
        return;
    }
    
    customHolidaysList.innerHTML = customHolidays.map(holiday => {
        const date = new Date(holiday.date);
        const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
        
        return `
            <div class="custom-holiday-item" style="border-left-color: ${holiday.color}">
                <div class="custom-holiday-color" style="background-color: ${holiday.color}"></div>
                <div class="custom-holiday-info">
                    <div class="custom-holiday-date">${formattedDate}</div>
                    <div class="custom-holiday-name">${escapeHtml(holiday.name)}</div>
                </div>
                <div class="custom-holiday-actions">
                    <button onclick="deleteCustomHoliday('${holiday.id}')" title="삭제">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

// 커스텀 휴일 추가 폼 표시/숨김
function showAddHolidayForm() {
    addHolidayForm.classList.remove('hidden');
    holidayDate.focus();
    resetColorSelection();
}

function hideAddHolidayForm() {
    addHolidayForm.classList.add('hidden');
    holidayDate.value = '';
    holidayName.value = '';
    holidayColor.value = '#ff6b6b';
    resetColorSelection();
    
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
    const date = holidayDate.value;
    const name = holidayName.value.trim();
    const color = holidayColor.value;
    const isEditMode = saveHolidayBtn.dataset.editMode === 'true';
    const editId = saveHolidayBtn.dataset.editId;
    
    if (!date || !name) {
        alert('날짜와 기념일 이름을 입력해주세요.');
        return;
    }
    
    try {
        let error;
        
        if (isEditMode) {
            // 수정 모드
            const { error: updateError } = await supabaseClient
                .from('custom_holidays')
                .update({
                    date: date,
                    name: name,
                    color: color
                })
                .eq('id', editId);
            error = updateError;
        } else {
            // 추가 모드
            const { error: insertError } = await supabaseClient
                .from('custom_holidays')
                .insert({
                    user_id: currentUser.id,
                    date: date,
                    name: name,
                    color: color
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
    
    if (customHolidayInfo) {
        // 휴일 정보 표시
        holidayColorDot.style.backgroundColor = customHolidayInfo.color;
        holidayNameSpan.textContent = customHolidayInfo.name;
        selectedDateHoliday.style.borderLeftColor = customHolidayInfo.color;
        selectedDateHoliday.classList.remove('hidden');
        
        // 휴일 ID를 요소에 저장
        selectedDateHoliday.dataset.holidayId = customHolidayInfo.id;
    } else {
        // 휴일이 없으면 숨김
        selectedDateHoliday.classList.add('hidden');
    }
}

// 선택된 날짜의 휴일 수정
function editSelectedDateHoliday() {
    const holidayId = selectedDateHoliday.dataset.holidayId;
    if (!holidayId) return;
    
    const holiday = customHolidays.find(h => h.id === holidayId);
    if (!holiday) return;
    
    // 수정 폼에 현재 값 설정
    holidayDate.value = holiday.date;
    holidayName.value = holiday.name;
    holidayColor.value = holiday.color;
    
    // 색상 선택 버튼 업데이트
    resetColorSelection();
    const colorBtn = document.querySelector(`[data-color="${holiday.color}"]`);
    if (colorBtn) {
        colorBtn.classList.add('selected');
    }
    
    // 폼 표시
    addHolidayForm.classList.remove('hidden');
    holidayDate.focus();
    
    // 저장 버튼을 수정 모드로 변경
    saveHolidayBtn.textContent = '수정';
    saveHolidayBtn.dataset.editMode = 'true';
    saveHolidayBtn.dataset.editId = holidayId;
}
