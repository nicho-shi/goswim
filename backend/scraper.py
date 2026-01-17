"""
Swimming NZ Archive Scraper
使用 BeautifulSoup 解析游泳比赛结果页面
"""
import requests
from bs4 import BeautifulSoup
import json
import re
from typing import List, Dict, Optional
from urllib.parse import urljoin, urlparse


class SwimmingArchiveScraper:
    def __init__(self, base_url: str = "https://archive.swimming.org.nz"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })

    def fetch_page(self, url: str) -> Optional[BeautifulSoup]:
        """获取并解析 HTML 页面"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'lxml')
        except Exception as e:
            print(f"Error fetching page: {e}")
            return None

    def find_results_table(self, soup: BeautifulSoup) -> Optional:
        """查找结果表格"""
        # 尝试多种可能的表格选择器
        selectors = [
            {'class': 'results-table'},
            {'class': 'results'},
            {'id': 'results-table'},
            {'id': 'results'},
        ]
        
        for selector in selectors:
            table = soup.find('table', selector)
            if table:
                return table
        
        # 如果找不到特定类名的表格，查找所有表格
        tables = soup.find_all('table')
        if tables:
            # 返回最大的表格（通常是结果表格）
            return max(tables, key=lambda t: len(t.find_all('tr')))
        
        return None

    def parse_time(self, time_str: str) -> Optional[str]:
        """解析时间格式，统一为 MM:SS.hh 或 SS.hh"""
        if not time_str:
            return None
        
        # 清理字符串
        time_str = time_str.strip().replace(' ', '')
        
        # 匹配各种时间格式
        # 格式1: MM:SS.hh (如 1:02.15)
        pattern1 = r'(\d+):(\d{2})\.(\d{2})'
        match1 = re.match(pattern1, time_str)
        if match1:
            return time_str
        
        # 格式2: SS.hh (如 58.45)
        pattern2 = r'(\d+)\.(\d{2})'
        match2 = re.match(pattern2, time_str)
        if match2:
            return time_str
        
        # 格式3: MM:SS:hh (如 1:02:15)
        pattern3 = r'(\d+):(\d{2}):(\d{2})'
        match3 = re.match(pattern3, time_str)
        if match3:
            minutes, seconds, hundredths = match3.groups()
            return f"{minutes}:{seconds}.{hundredths}"
        
        return time_str

    def parse_event(self, event_str: str) -> Dict[str, str]:
        """解析项目名称，提取距离、泳姿和课程类型"""
        if not event_str:
            return {'distance': '', 'stroke': '', 'course': 'SCM'}
        
        event_str = event_str.strip()
        
        # 提取距离
        distance_match = re.search(r'(\d+)\s*m', event_str, re.IGNORECASE)
        distance = distance_match.group(0) if distance_match else ''
        
        # 提取泳姿
        strokes = {
            'freestyle': 'Freestyle',
            'free': 'Freestyle',
            'backstroke': 'Backstroke',
            'back': 'Backstroke',
            'breaststroke': 'Breaststroke',
            'breast': 'Breaststroke',
            'butterfly': 'Butterfly',
            'fly': 'Butterfly',
            'individual medley': 'IM',
            'im': 'IM',
            'medley': 'IM'
        }
        
        stroke = ''
        event_lower = event_str.lower()
        for key, value in strokes.items():
            if key in event_lower:
                stroke = value
                break
        
        # 提取课程类型
        course = 'SCM'  # 默认短池
        if 'long course' in event_lower or 'lcm' in event_lower or '50m' in event_str:
            course = 'LCM'
        elif 'short course' in event_lower or 'scm' in event_lower or '25m' in event_str:
            course = 'SCM'
        
        return {
            'distance': distance,
            'stroke': stroke,
            'course': course,
            'event': event_str
        }

    def extract_table_data(self, table) -> List[Dict]:
        """从表格中提取数据"""
        results = []
        
        if not table:
            return results
        
        rows = table.find_all('tr')
        if not rows:
            return results
        
        # 查找表头，确定列索引
        header_row = rows[0]
        headers = []
        for th in header_row.find_all(['th', 'td']):
            header_text = th.get_text(strip=True).lower()
            headers.append(header_text)
        
        # 确定各列的索引
        name_idx = None
        event_idx = None
        time_idx = None
        splits_idx = None
        club_idx = None
        date_idx = None
        
        for i, header in enumerate(headers):
            if 'name' in header or 'swimmer' in header or 'athlete' in header:
                name_idx = i
            elif 'event' in header or 'race' in header:
                event_idx = i
            elif 'time' in header or 'result' in header:
                time_idx = i
            elif 'split' in header:
                splits_idx = i
            elif 'club' in header or 'team' in header:
                club_idx = i
            elif 'date' in header or 'meet' in header:
                date_idx = i
        
        # 如果找不到表头，尝试推断（假设第一列是姓名，第二列是项目等）
        if name_idx is None:
            name_idx = 0
        if event_idx is None:
            event_idx = 1
        if time_idx is None:
            time_idx = 2
        
        # 遍历数据行
        for row in rows[1:]:  # 跳过表头
            cells = row.find_all(['td', 'th'])
            if len(cells) < max(filter(None, [name_idx, event_idx, time_idx])) + 1:
                continue
            
            # 处理 colspan
            actual_cells = []
            for cell in cells:
                colspan = int(cell.get('colspan', 1))
                cell_text = cell.get_text(strip=True)
                actual_cells.extend([cell_text] * colspan)
            
            if len(actual_cells) <= max(filter(None, [name_idx, event_idx, time_idx])):
                continue
            
            # 提取数据
            name = actual_cells[name_idx] if name_idx < len(actual_cells) else ''
            event = actual_cells[event_idx] if event_idx < len(actual_cells) else ''
            time = actual_cells[time_idx] if time_idx < len(actual_cells) else ''
            splits = actual_cells[splits_idx] if splits_idx and splits_idx < len(actual_cells) else ''
            club = actual_cells[club_idx] if club_idx and club_idx < len(actual_cells) else ''
            date = actual_cells[date_idx] if date_idx and date_idx < len(actual_cells) else ''
            
            # 跳过空行或表头行
            if not name or not time:
                continue
            
            # 解析项目信息
            event_info = self.parse_event(event)
            
            # 解析时间
            parsed_time = self.parse_time(time)
            
            result = {
                'name': name,
                'event': event_info['event'],
                'distance': event_info['distance'],
                'stroke': event_info['stroke'],
                'course': event_info['course'],
                'time': parsed_time,
                'splits': splits,
                'club': club,
                'date': date
            }
            
            results.append(result)
        
        return results

    def search_athlete(self, athlete_name: str, club: Optional[str] = None) -> List[Dict]:
        """搜索特定运动员的成绩"""
        # 首先访问主页面
        main_page = self.fetch_page(f"{self.base_url}/results.html")
        if not main_page:
            return []
        
        # 查找所有结果链接
        results_links = []
        for link in main_page.find_all('a', href=True):
            href = link['href']
            if 'result' in href.lower() or 'meet' in href.lower():
                full_url = urljoin(self.base_url, href)
                results_links.append(full_url)
        
        all_results = []
        
        # 遍历结果页面
        for url in results_links[:10]:  # 限制前10个页面以避免过载
            soup = self.fetch_page(url)
            if not soup:
                continue
            
            table = self.find_results_table(soup)
            if not table:
                continue
            
            results = self.extract_table_data(table)
            
            # 过滤匹配的运动员
            for result in results:
                name_match = athlete_name.lower() in result['name'].lower()
                club_match = not club or (club and club.lower() in result['club'].lower())
                
                if name_match and club_match:
                    all_results.append(result)
        
        return all_results

    def get_personal_bests(self, athlete_name: str, club: Optional[str] = None) -> List[Dict]:
        """获取运动员的个人最佳成绩（PB）"""
        all_results = self.search_athlete(athlete_name, club)
        
        if not all_results:
            return []
        
        # 按项目分组，找出每个项目的最佳成绩
        pb_dict = {}
        
        for result in all_results:
            key = f"{result['distance']}_{result['stroke']}_{result['course']}"
            
            if key not in pb_dict:
                pb_dict[key] = result
            else:
                # 比较时间，保留更快的
                current_time = self.parse_time(result['time'])
                best_time = self.parse_time(pb_dict[key]['time'])
                
                if current_time and best_time:
                    # 转换为秒数进行比较
                    current_seconds = self.time_to_seconds(current_time)
                    best_seconds = self.time_to_seconds(best_time)
                    
                    if current_seconds and best_seconds and current_seconds < best_seconds:
                        pb_dict[key] = result
        
        return list(pb_dict.values())

    def time_to_seconds(self, time_str: str) -> Optional[float]:
        """将时间字符串转换为秒数"""
        if not time_str:
            return None
        
        try:
            if ':' in time_str:
                # MM:SS.hh 格式
                parts = time_str.split(':')
                minutes = int(parts[0])
                seconds_parts = parts[1].split('.')
                seconds = int(seconds_parts[0])
                hundredths = int(seconds_parts[1]) if len(seconds_parts) > 1 else 0
                return minutes * 60 + seconds + hundredths / 100
            else:
                # SS.hh 格式
                parts = time_str.split('.')
                seconds = int(parts[0])
                hundredths = int(parts[1]) if len(parts) > 1 else 0
                return seconds + hundredths / 100
        except:
            return None


if __name__ == "__main__":
    # 测试代码
    scraper = SwimmingArchiveScraper()
    
    # 测试搜索
    results = scraper.search_athlete("Michael", "North Shore")
    print(f"Found {len(results)} results")
    print(json.dumps(results[:5], indent=2, ensure_ascii=False))
    
    # 测试 PB
    pbs = scraper.get_personal_bests("Michael", "North Shore")
    print(f"\nFound {len(pbs)} personal bests")
    print(json.dumps(pbs, indent=2, ensure_ascii=False))
