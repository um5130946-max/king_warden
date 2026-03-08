"""
네이버 '왕과사는남자' 댓글 크롤러
- 네이버 검색 → 검색어 입력 → 더보기 클릭 → 스포일러 포함 토글 → 댓글 수집
"""
import time
import json
from datetime import datetime
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import (
    TimeoutException,
    NoSuchElementException,
    ElementClickInterceptedException,
    InvalidSessionIdException,
    WebDriverException,
)


class NaverCommentCrawler:
    """네이버 댓글 크롤러"""

    def __init__(self, headless: bool = False):
        """
        Args:
            headless: True면 브라우저 창 숨김
        """
        self.headless = headless
        self.driver = None
        self.comments: list[str] = []

    def _init_driver(self):
        """Chrome WebDriver 초기화"""
        options = Options()
        if self.headless:
            options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--disable-extensions")
        options.add_argument("--window-size=1440,2400")
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_argument(
            "user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )

        self.driver = webdriver.Chrome(options=options)
        self.driver.implicitly_wait(10)
        self.driver.maximize_window()

    def _wait_and_click(self, by: By, value: str, timeout: int = 15):
        """요소가 클릭 가능할 때까지 대기 후 클릭"""
        try:
            elem = WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable((by, value))
            )
            self.driver.execute_script("arguments[0].click();", elem)
            return True
        except (TimeoutException, NoSuchElementException) as e:
            print(f"  ⚠️ 클릭 실패 ({value}): {e}")
            return False

    def _scroll_to_element(self, element):
        """요소까지 스크롤"""
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block: 'center'});", element
        )

    def crawl(self, keyword: str = "왕과사는남자", max_scroll: int = 300) -> list[str]:
        """
        댓글 크롤링 메인 로직

        Args:
            keyword: 검색어 (기본: 왕과사는남자)
            max_scroll: 최대 스크롤 횟수 (더 많은 댓글 로드)

        Returns:
            수집된 댓글 리스트
        """
        self.comments = []

        try:
            self._init_driver()
            wait = WebDriverWait(self.driver, 15)

            # 1. 네이버 접속
            print("1️⃣ 네이버 접속 중...")
            self.driver.get("https://www.naver.com")
            time.sleep(2)

            # 2. 검색어 입력 (input#query)
            print(f"2️⃣ 검색어 '{keyword}' 입력 중...")
            search_input = wait.until(
                EC.presence_of_element_located((By.ID, "query"))
            )
            search_input.clear()
            search_input.send_keys(keyword)
            search_input.send_keys(Keys.RETURN)
            time.sleep(3)

            # 3. 관람평 더보기 링크 클릭 (댓글이 있는 평점 페이지로 이동)
            print("3️⃣ 관람평 더보기 클릭 중...")
            more_clicked = False
            prev_url = self.driver.current_url

            # 사용자가 준 실제 HTML 기준:
            # <a class="more_link" onclick="...realcardgo..." href="?where=nexearch...pkid=68&os=...">
            more_selectors = [
                "a.more_link[onclick*='realcardgo'][href*='pkid=68'][href*='os=']",
                "a.more_link[onclick*='realcardgo']",
                "a.more_link[href*='pkid=68'][href*='os=']",
                "//a[contains(@class,'more_link') and contains(@onclick,'realcardgo')]",
                "//a[contains(@class,'more_link') and contains(@href,'pkid=68') and contains(@href,'os=')]",
            ]

            for sel in more_selectors:
                try:
                    elems = (
                        self.driver.find_elements(By.XPATH, sel)
                        if sel.startswith("//")
                        else self.driver.find_elements(By.CSS_SELECTOR, sel)
                    )
                    for elem in elems:
                        href = (elem.get_attribute("href") or "").lower()
                        onclick = (elem.get_attribute("onclick") or "").lower()
                        if "realcardgo" in onclick or ("pkid=68" in href and "os=" in href):
                            self._scroll_to_element(elem)
                            time.sleep(0.5)
                            self.driver.execute_script("arguments[0].click();", elem)
                            more_clicked = True
                            break
                    if more_clicked:
                        break
                except Exception:
                    continue

            if not more_clicked:
                raise RuntimeError(
                    "관람평 더보기를 못 찾았습니다. 'a.more_link[onclick*=realcardgo]'가 보이는지 확인해주세요."
                )

            # 새 탭이 열리면 전환, 아니면 동일 탭 URL 변경 대기
            if len(self.driver.window_handles) > 1:
                self.driver.switch_to.window(self.driver.window_handles[-1])
            else:
                WebDriverWait(self.driver, 10).until(lambda d: d.current_url != prev_url)
            print(f"  ✅ 관람평 페이지 이동 완료: {self.driver.current_url}")
            time.sleep(2)

            # 4. 스포일러 포함 토글 클릭 (필수)
            print("4️⃣ 스포일러 포함 토글 클릭 중...")
            spoiler_clicked = False
            # span.txt "스포일러 포함" 텍스트를 가진 요소의 부모 버튼 클릭
            spoiler_xpaths = [
                "//span[contains(@class,'txt') and contains(text(),'스포일러 포함')]/parent::button",
                "//span[contains(@class,'txt') and contains(text(),'스포일러 포함')]/..",
                "//span[contains(text(),'스포일러 포함')]/ancestor::button",
                "//span[contains(text(),'스포일러 포함')]/parent::*",
                "//div[contains(@class,'_spoiler_switch')]//button",
                "//div[contains(@class,'lego_toggle_sort')]//span[contains(text(),'스포일러')]/..",
            ]
            for xpath in spoiler_xpaths:
                try:
                    elem = self.driver.find_element(By.XPATH, xpath)
                    self._scroll_to_element(elem)
                    time.sleep(0.5)
                    self.driver.execute_script("arguments[0].click();", elem)
                    spoiler_clicked = True
                    print("  ✅ 스포일러 포함 토글 클릭 완료")
                    break
                except NoSuchElementException:
                    continue

            if not spoiler_clicked:
                raise RuntimeError("스포일러 포함 토글을 찾지 못했습니다. 페이지 구조를 확인해주세요.")

            time.sleep(2)

            # 5. 댓글 영역 스크롤 컨테이너 찾기 (댓글이 별도 스크롤 영역에 있음)
            scroll_target = None
            scroll_script = "window.scrollBy(0, 400);"
            try:
                # scrollHeight > clientHeight 인 스크롤 가능한 div 찾기 (댓글 영역 우선)
                find_scrollable = """
                var candidates = [];
                var divs = document.querySelectorAll('div');
                for (var i = 0; i < divs.length; i++) {
                    var d = divs[i];
                    if (d.scrollHeight > d.clientHeight && d.clientHeight > 200) {
                        var c = (d.className || '') + ' ' + (d.id || '');
                        var score = (c.match(/list|score|comment|review|reple|area/i) ? 10 : 0)
                            + d.scrollHeight;
                        candidates.push({el: d, score: score});
                    }
                }
                candidates.sort(function(a,b) { return b.score - a.score; });
                return candidates.length ? candidates[0].el : null;
                """
                scroll_target = self.driver.execute_script(find_scrollable)
                if scroll_target:
                    scroll_script = "arguments[0].scrollTop = arguments[0].scrollTop + 400;"
                    print("  📜 댓글 스크롤 영역 감지됨 (컨테이너 내부 스크롤)")
                else:
                    print("  📜 전체 페이지 스크롤 사용")
            except Exception:
                pass

            # 6. 댓글 수집 + 스크롤로 추가 로드
            print("5️⃣ 댓글 수집 및 스크롤 중...")
            comment_selectors = [
                "span.desc._text",           # 사용자 제공
                "span._text",
                "p.desc",
                "span.txt",
                ".score_reple p",            # 구 네이버 영화
                "li p",                      # li 내 댓글 텍스트
                "[class*='comment'] p",
                "[class*='reple'] p",
            ]
            seen = set()
            stagnant_rounds = 0
            max_stagnant_rounds = 12

            for scroll_idx in range(max_scroll):
                if not self.driver.window_handles:
                    print("  ⚠️ 브라우저 창이 닫혀 수집을 종료합니다.")
                    break

                # 현재 화면의 댓글 수집 (여러 선택자 시도)
                for sel in comment_selectors:
                    try:
                        comment_elems = self.driver.find_elements(
                            By.CSS_SELECTOR, sel
                        )
                        for elem in comment_elems:
                            text = elem.text.strip()
                            # 평점/숫자/짧은 메타 텍스트 제외 (실제 댓글은 보통 10자 이상)
                            if text and len(text) >= 10 and text not in seen:
                                # "평점은 영화별로", "신고", "스포일러 포함" 등 제외
                                if ("평점은" not in text and "신고" not in text and "등록" not in text
                                        and "스포일러 포함" not in text):
                                    seen.add(text)
                                    self.comments.append(text)
                    except NoSuchElementException:
                        pass
                    except (InvalidSessionIdException, WebDriverException):
                        print("  ⚠️ 브라우저 세션이 종료되어 수집을 중단합니다.")
                        break

                prev_count = len(self.comments)

                # 댓글 영역 내부 또는 페이지 스크롤
                try:
                    if scroll_target is not None:
                        moved = self.driver.execute_script(
                            """
                            const el = arguments[0];
                            const before = el.scrollTop;
                            const step = Math.max(350, Math.floor(el.clientHeight * 0.9));
                            el.scrollTop = el.scrollTop + step;
                            el.dispatchEvent(new Event('scroll'));
                            return el.scrollTop > before;
                            """,
                            scroll_target,
                        )
                        # 내부 스크롤이 끝에 도달하면 페이지도 같이 내려 로딩 트리거
                        if not moved:
                            self.driver.execute_script("window.scrollBy(0, 300);")
                    else:
                        self.driver.execute_script(scroll_script)
                except (InvalidSessionIdException, WebDriverException):
                    print("  ⚠️ 스크롤 중 브라우저 세션 종료됨. 현재까지 수집값으로 종료합니다.")
                    break
                time.sleep(1.2)

                # 스크롤 후 다시 수집
                for sel in comment_selectors:
                    try:
                        comment_elems = self.driver.find_elements(By.CSS_SELECTOR, sel)
                        for elem in comment_elems:
                            text = elem.text.strip()
                            if text and len(text) >= 10 and text not in seen:
                                if ("평점은" not in text and "신고" not in text and "등록" not in text
                                        and "스포일러 포함" not in text):
                                    seen.add(text)
                                    self.comments.append(text)
                    except NoSuchElementException:
                        pass
                    except (InvalidSessionIdException, WebDriverException):
                        print("  ⚠️ 브라우저 세션이 종료되어 추가 수집을 중단합니다.")
                        break

                # 새 댓글이 일정 횟수 이상 안 늘어나면 종료
                if len(self.comments) == prev_count:
                    stagnant_rounds += 1
                else:
                    stagnant_rounds = 0

                if (scroll_idx + 1) % 5 == 0:
                    print(f"  📥 스크롤 {scroll_idx + 1}/{max_scroll}, 수집 댓글: {len(self.comments)}개")
                if stagnant_rounds >= max_stagnant_rounds:
                    print(f"  🛑 새 댓글 증가 없음 {stagnant_rounds}회 연속 → 스크롤 종료")
                    break

            # 스크롤 후 한 번 더 수집 (마지막 로드된 댓글)
            for sel in comment_selectors:
                try:
                    comment_elems = self.driver.find_elements(By.CSS_SELECTOR, sel)
                    for elem in comment_elems:
                        text = elem.text.strip()
                        if text and len(text) >= 10 and text not in seen:
                            if "평점은" not in text and "신고" not in text and "등록" not in text:
                                seen.add(text)
                                self.comments.append(text)
                except NoSuchElementException:
                    pass

            print(f"\n✅ 총 {len(self.comments)}개 댓글 수집 완료")

        except InvalidSessionIdException:
            print("⚠️ 크롬 세션이 비정상 종료되었습니다. 현재까지 수집한 댓글을 반환합니다.")
        except WebDriverException as e:
            if "disconnected" in str(e).lower() or "invalid session id" in str(e).lower():
                print("⚠️ 브라우저 연결이 끊겼습니다. 현재까지 수집한 댓글을 반환합니다.")
            else:
                print(f"❌ 크롤링 오류: {e}")
                raise
        except Exception as e:
            print(f"❌ 크롤링 오류: {e}")
            raise
        finally:
            if self.driver:
                try:
                    self.driver.quit()
                except Exception:
                    pass

        return self.comments

    def save_comments(self, filepath: str | Path | None = None) -> Path:
        """
        댓글을 JSON 파일로 저장

        Args:
            filepath: 저장 경로 (없으면 자동 생성)

        Returns:
            저장된 파일 경로
        """
        if filepath is None:
            filepath = Path(__file__).parent / f"comments_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        filepath = Path(filepath)
        data = {
            "keyword": "왕과사는남자",
            "crawled_at": datetime.now().isoformat(),
            "count": len(self.comments),
            "comments": self.comments,
        }
        filepath.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"💾 저장 완료: {filepath}")
        return filepath


def main():
    crawler = NaverCommentCrawler(headless=False)
    comments = crawler.crawl(keyword="왕과사는남자", max_scroll=300)
    if comments:
        crawler.save_comments()
        print("\n샘플 댓글 (처음 5개):")
        for i, c in enumerate(comments[:5], 1):
            print(f"  {i}. {c[:60]}{'...' if len(c) > 60 else ''}")


if __name__ == "__main__":
    main()
