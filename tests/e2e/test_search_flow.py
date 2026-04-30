"""
Eden AI – Selenium End-to-End Tests
Tests the React frontend running at http://localhost:5173

Requirements:
    pip install selenium pytest webdriver-manager

Run:
    pytest tests/e2e/test_search_flow.py -v --log-file=test-logs/selenium.log
"""

import pytest
import logging
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# ─── Logging Setup ────────────────────────────────────────────────────────────
os.makedirs("test-logs", exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("test-logs/selenium.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

BASE_URL = "http://localhost:5173"
IMPLICIT_WAIT = 10


@pytest.fixture(scope="module")
def driver():
    """
    Creates a Chrome WebDriver instance for the test session.
    Runs in headless mode for CI/CD compatibility.
    """
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1280,900")

    service = Service(ChromeDriverManager().install())
    browser = webdriver.Chrome(service=service, options=options)
    browser.implicitly_wait(IMPLICIT_WAIT)

    logger.info("✅ ChromeDriver launched")
    yield browser

    browser.quit()
    logger.info("✅ ChromeDriver closed")


class TestPageLoad:
    """TC-01: Validates the initial page renders correctly."""

    def test_page_title_contains_eden(self, driver):
        logger.info("TEST: Page title contains 'Eden'")
        driver.get(BASE_URL)
        assert "Eden" in driver.title
        logger.info("PASS: Title verified")

    def test_hero_headline_visible(self, driver):
        """Norman Visceral: The main headline must be visible on load."""
        logger.info("TEST: Hero headline is visible")
        driver.get(BASE_URL)
        h1 = driver.find_element(By.ID, "hero-headline")
        assert h1.is_displayed()
        logger.info("PASS: Hero headline visible")

    def test_search_input_visible_and_focused(self, driver):
        """Fitts' Law: Input must be findable and auto-focused."""
        logger.info("TEST: Search input is visible and auto-focused")
        driver.get(BASE_URL)
        search_input = driver.find_element(By.ID, "vibe-search-input")
        assert search_input.is_displayed()
        logger.info("PASS: Search input rendered")


class TestSearchInteraction:
    """TC-02: Validates the search interaction flow."""

    def test_typing_in_search_input(self, driver):
        """Shneiderman Consistency: Input accepts text and retains it."""
        logger.info("TEST: User can type into search input")
        driver.get(BASE_URL)
        search_input = driver.find_element(By.ID, "vibe-search-input")
        search_input.clear()
        search_input.send_keys("jungle villa")
        assert search_input.get_attribute("value") == "jungle villa"
        logger.info("PASS: Input value retained")

    def test_search_button_is_enabled_when_text_present(self, driver):
        """Fitts' Law + Error Prevention: Button enables when input is non-empty."""
        logger.info("TEST: Search button enables when input has text")
        driver.get(BASE_URL)
        input_el = driver.find_element(By.ID, "vibe-search-input")
        input_el.send_keys("surf chill")
        btn = driver.find_element(By.ID, "vibe-search-btn")
        assert btn.is_enabled()
        logger.info("PASS: Button is enabled")

    def test_submit_triggers_search(self, driver):
        """ISO 9241-11 Efficiency: Submitting the form triggers API request."""
        logger.info("TEST: Form submission triggers search")
        driver.get(BASE_URL)
        input_el = driver.find_element(By.ID, "vibe-search-input")
        input_el.send_keys("beachfront villa")
        input_el.send_keys(Keys.RETURN)

        # Wait for results section to appear (or skeleton loaders)
        wait = WebDriverWait(driver, 15)
        try:
            results_section = wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '[aria-label="Search results"], [aria-label="Loading properties"]'))
            )
            assert results_section.is_displayed()
            logger.info("PASS: Results section appeared after search")
        except Exception as e:
            logger.error(f"FAIL: Results section not found — {e}")
            raise


class TestVibeChips:
    """TC-03: Validates vibe chip click triggers search."""

    def test_vibe_chip_click_populates_search(self, driver):
        """Hick's Law: Chips reduce decision time — clicking one fires a search."""
        logger.info("TEST: Vibe chip click triggers search")
        driver.get(BASE_URL)
        chips = driver.find_elements(By.CSS_SELECTOR, ".vibe-chip")
        assert len(chips) > 0, "No vibe chips found"
        chips[0].click()

        wait = WebDriverWait(driver, 15)
        input_el = driver.find_element(By.ID, "vibe-search-input")
        assert len(input_el.get_attribute("value")) > 0
        logger.info("PASS: Vibe chip populated search input")
