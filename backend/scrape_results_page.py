"""
Swimming NZ Archive Results Page Scraper
抓取 https://archive.swimming.org.nz/results.html 页面上的所有年份链接，
以及每个年份页面中的比赛名称和文件下载链接。
"""
import requests
from bs4 import BeautifulSoup
import csv
import time
from typing import List, Dict, Optional
from urllib.parse import urljoin, urlparse
import sys


class ResultsPageScraper:
    def __init__(self, base_url: str = "https://archive.swimming.org.nz"):
        self.base_url = base_url
        self.results_page_url = f"{base_url}/results.html"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        self.all_results = []

    def fetch_page(self, url: str, retries: int = 3) -> Optional[BeautifulSoup]:
        """获取并解析 HTML 页面，包含重试机制"""
        for attempt in range(retries):
            try:
                response = self.session.get(url, timeout=15)
                response.raise_for_status()
                return BeautifulSoup(response.content, 'html.parser')
            except requests.exceptions.RequestException as e:
                print(f"  错误：获取页面失败 (尝试 {attempt + 1}/{retries}): {e}")
                if attempt < retries - 1:
                    time.sleep(2)  # 等待2秒后重试
                else:
                    return None
            except Exception as e:
                print(f"  错误：解析页面时发生意外错误: {e}")
                return None
        return None

    def find_year_links(self, soup: BeautifulSoup) -> List[Dict[str, str]]:
        """在主页面中查找所有年份链接"""
        year_links = []
        
        if not soup:
            return year_links
        
        # 尝试多种可能的选择器来查找年份链接
        # 方法1: 查找包含年份数字的链接
        all_links = soup.find_all('a', href=True)
        
        for link in all_links:
            href = link.get('href', '')
            link_text = link.get_text(strip=True)
            
            # 检查链接文本或href中是否包含年份（4位数字，通常在1900-2100之间）
            import re
            year_match = re.search(r'\b(19|20)\d{2}\b', link_text + ' ' + href)
            
            if year_match:
                year = year_match.group(0)
                full_url = urljoin(self.results_page_url, href)
                
                # 避免重复添加相同的年份
                if not any(yl['year'] == year for yl in year_links):
                    year_links.append({
                        'year': year,
                        'url': full_url,
                        'text': link_text
                    })
                    print(f"  找到年份链接: {year} -> {link_text}")
        
        # 如果没有找到，尝试查找包含 "year" 或 "results" 的链接
        if not year_links:
            print("  警告：未通过年份匹配找到链接，尝试其他方法...")
            for link in all_links:
                href = link.get('href', '').lower()
                link_text = link.get_text(strip=True).lower()
                
                if 'result' in href or 'result' in link_text or 'year' in href or 'year' in link_text:
                    full_url = urljoin(self.results_page_url, link.get('href', ''))
                    year_links.append({
                        'year': link_text or href,
                        'url': full_url,
                        'text': link.get_text(strip=True)
                    })
        
        return sorted(year_links, key=lambda x: x['year'], reverse=True)

    def find_competition_links(self, soup: BeautifulSoup, year: str) -> List[Dict[str, str]]:
        """在年份页面中查找所有比赛名称和下载链接"""
        competitions = []
        
        if not soup:
            return competitions
        
        # 尝试多种方法来查找比赛信息
        # 方法1: 查找所有链接，过滤可能的下载链接或比赛链接
        all_links = soup.find_all('a', href=True)
        
        for link in all_links:
            href = link.get('href', '')
            link_text = link.get_text(strip=True)
            
            # 检查是否是文件下载链接（常见格式）
            href_lower = href.lower()
            is_download_link = any(ext in href_lower for ext in ['.pdf', '.xls', '.xlsx', '.csv', '.txt', '.zip'])
            
            # 或者链接文本包含比赛相关信息
            text_lower = link_text.lower()
            is_competition = any(keyword in text_lower for keyword in ['meet', 'championship', 'competition', 'event', 'result'])
            
            if is_download_link or is_competition or link_text:
                full_url = urljoin(self.base_url, href)
                
                # 避免添加导航链接或重复链接
                if not any(skip in href_lower for skip in ['#', 'mailto:', 'javascript:', '../']):
                    competitions.append({
                        'year': year,
                        'competition_name': link_text if link_text else href,
                        'download_link': full_url
                    })
        
        # 方法2: 查找表格中的比赛信息
        tables = soup.find_all('table')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 2:
                    # 假设第一列是比赛名称，最后一列或包含链接的是下载链接
                    name_cell = cells[0]
                    competition_name = name_cell.get_text(strip=True)
                    
                    # 查找下载链接（可能在任意单元格中）
                    download_link = None
                    for cell in cells:
                        link_tag = cell.find('a', href=True)
                        if link_tag:
                            href = link_tag.get('href', '')
                            if any(ext in href.lower() for ext in ['.pdf', '.xls', '.xlsx', '.csv', '.txt', '.zip']):
                                download_link = urljoin(self.base_url, href)
                                break
                    
                    if competition_name and download_link:
                        competitions.append({
                            'year': year,
                            'competition_name': competition_name,
                            'download_link': download_link
                        })
        
        # 去重（基于下载链接）
        seen_links = set()
        unique_competitions = []
        for comp in competitions:
            if comp['download_link'] not in seen_links:
                seen_links.add(comp['download_link'])
                unique_competitions.append(comp)
        
        return unique_competitions

    def scrape_all(self) -> List[Dict[str, str]]:
        """抓取所有数据"""
        print(f"正在访问主页面: {self.results_page_url}")
        
        # 1. 获取主页面
        main_soup = self.fetch_page(self.results_page_url)
        if not main_soup:
            print("错误：无法访问主页面，程序退出")
            return []
        
        # 2. 查找所有年份链接
        print("\n正在查找年份链接...")
        year_links = self.find_year_links(main_soup)
        
        if not year_links:
            print("警告：未找到任何年份链接，请检查网页结构")
            return []
        
        print(f"找到 {len(year_links)} 个年份链接\n")
        
        # 3. 遍历每个年份页面
        all_results = []
        for idx, year_info in enumerate(year_links, 1):
            year = year_info['year']
            year_url = year_info['url']
            
            print(f"[{idx}/{len(year_links)}] 正在处理年份: {year}")
            print(f"  访问链接: {year_url}")
            
            # 获取年份页面
            year_soup = self.fetch_page(year_url)
            if not year_soup:
                print(f"  警告：无法访问年份页面 {year}，跳过")
                continue
            
            # 查找该年份的所有比赛
            competitions = self.find_competition_links(year_soup, year)
            print(f"  找到 {len(competitions)} 个比赛/文件链接")
            
            all_results.extend(competitions)
            
            # 添加延迟，避免对服务器造成过大压力
            time.sleep(1)
        
        return all_results

    def save_to_csv(self, results: List[Dict[str, str]], filename: str = "swimming_results.csv"):
        """将结果保存到CSV文件"""
        if not results:
            print("警告：没有数据可保存")
            return
        
        try:
            with open(filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
                fieldnames = ['year', 'competition_name', 'download_link']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                for result in results:
                    writer.writerow(result)
            
            print(f"\n成功！共保存 {len(results)} 条记录到 {filename}")
        except Exception as e:
            print(f"错误：保存CSV文件时发生错误: {e}")
            sys.exit(1)


def main():
    """主函数"""
    print("=" * 60)
    print("Swimming NZ Archive Results Page Scraper")
    print("=" * 60)
    
    scraper = ResultsPageScraper()
    
    try:
        # 抓取所有数据
        results = scraper.scrape_all()
        
        # 保存到CSV
        if results:
            scraper.save_to_csv(results, "swimming_results.csv")
        else:
            print("\n警告：未抓取到任何数据，请检查网络连接或网页结构")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n\n用户中断程序")
        sys.exit(0)
    except Exception as e:
        print(f"\n错误：程序执行过程中发生意外错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
