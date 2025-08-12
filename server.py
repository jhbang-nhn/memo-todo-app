from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv

# .env.local 파일 로드
load_dotenv('.env.local')

app = Flask(__name__)

@app.route('/')
def index():
    # HTML 파일 읽기
    with open('index.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    return html_content

@app.route('/api/auth/validate', methods=['POST'])
def validate_auth():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if username == 'admin' and password == os.getenv('ADMIN_PASSWORD'):
        return jsonify({
            'success': True,
            'supabaseUrl': os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
            'supabaseAnonKey': os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        })
    else:
        return jsonify({
            'success': False,
            'message': '잘못된 사용자명 또는 비밀번호입니다.'
        }), 401

@app.route('/<path:filename>')
def static_files(filename):
    return app.send_static_file(filename)

if __name__ == '__main__':
    print("🚀 Python Flask Server running at http://localhost:8000")
    print("📝 환경변수 확인:")
    print(f"   - SUPABASE_URL: {'✅ 설정됨' if os.getenv('NEXT_PUBLIC_SUPABASE_URL') else '❌ 설정되지 않음'}")
    print(f"   - SUPABASE_ANON_KEY: {'✅ 설정됨' if os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY') else '❌ 설정되지 않음'}")
    print(f"   - ADMIN_PASSWORD: {'✅ 설정됨' if os.getenv('ADMIN_PASSWORD') else '❌ 설정되지 않음'}")
    
    app.run(host='0.0.0.0', port=8000, debug=True)
