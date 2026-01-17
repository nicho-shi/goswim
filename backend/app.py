"""
Flask API 服务器
提供游泳成绩爬取 API
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from scraper import SwimmingArchiveScraper
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # 允许跨域请求

scraper = SwimmingArchiveScraper()


@app.route('/api/health', methods=['GET'])
def health():
    """健康检查端点"""
    return jsonify({'status': 'ok', 'message': 'Swimming Archive API is running'})


@app.route('/api/search', methods=['GET'])
def search_athlete():
    """搜索运动员成绩"""
    athlete_name = request.args.get('name', '').strip()
    club = request.args.get('club', '').strip() or None
    
    if not athlete_name:
        return jsonify({'error': 'Athlete name is required'}), 400
    
    try:
        results = scraper.search_athlete(athlete_name, club)
        return jsonify({
            'success': True,
            'count': len(results),
            'results': results
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/personal-bests', methods=['GET'])
def get_personal_bests():
    """获取运动员个人最佳成绩"""
    athlete_name = request.args.get('name', '').strip()
    club = request.args.get('club', '').strip() or None
    
    if not athlete_name:
        return jsonify({'error': 'Athlete name is required'}), 400
    
    try:
        pbs = scraper.get_personal_bests(athlete_name, club)
        return jsonify({
            'success': True,
            'count': len(pbs),
            'personal_bests': pbs
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/scrape-page', methods=['POST'])
def scrape_page():
    """爬取指定页面的结果"""
    data = request.get_json()
    url = data.get('url', '').strip()
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    try:
        soup = scraper.fetch_page(url)
        if not soup:
            return jsonify({'error': 'Failed to fetch page'}), 500
        
        table = scraper.find_results_table(soup)
        if not table:
            return jsonify({'error': 'No results table found'}), 404
        
        results = scraper.extract_table_data(table)
        return jsonify({
            'success': True,
            'count': len(results),
            'results': results
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
