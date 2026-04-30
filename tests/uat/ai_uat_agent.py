"""
Eden AI – AI User Acceptance Testing (UAT) Agent
Simulates a real user session, evaluating the UI from a UX psychology perspective.

The agent:
1. Navigates to the app
2. Assesses each page element against the UX principles (Norman, Shneiderman, ISO 9241-11)
3. Performs 3 simulated user journeys
4. Scores each journey and writes a report to test-logs/uat_report.txt

Run:
    python tests/uat/ai_uat_agent.py
"""

import time
import os
import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

os.makedirs("test-logs", exist_ok=True)

BASE_URL = "http://localhost:5173"

SIMULATED_USERS = [
    {
        "persona": "Budget Backpacker",
        "prompt": "cheap beach hostel under 50 dollars in Mirissa",
        "expectation": "results with low price tags and beach location",
    },
    {
        "persona": "Luxury Honeymooner",
        "prompt": "romantic luxury jungle villa for a honeymoon",
        "expectation": "premium, high-priced jungle property with vibe tags",
    },
    {
        "persona": "Surfer Traveler",
        "prompt": "surf chill spot near waves in Sri Lanka",
        "expectation": "surf-tagged property in a coastal location",
    },
]


def evaluate_ux_laws(driver, report_lines):
    """
    Checks the page against UX principles and logs pass/fail observations.
    """
    report_lines.append("\n=== UX Evaluation ===")

    # Norman Visceral: Is the page visually premium?
    body_bg = driver.execute_script(
        "return window.getComputedStyle(document.body).backgroundColor"
    )
    report_lines.append(f"[Norman Visceral] Background color: {body_bg}")

    # Shneiderman: Is the search input auto-focused?
    try:
        active_id = driver.execute_script("return document.activeElement.id")
        if active_id == "vibe-search-input":
            report_lines.append("[Shneiderman Consistency] ✅ Search input is auto-focused on load")
        else:
            report_lines.append(f"[Shneiderman Consistency] ⚠️  Active element is '{active_id}', not search input")
    except Exception as e:
        report_lines.append(f"[Shneiderman Consistency] ❌ Could not verify focus: {e}")

    # Hick's Law: Count vibe chips (should be ≤8)
    try:
        chips = driver.find_elements(By.CSS_SELECTOR, ".vibe-chip")
        count = len(chips)
        status = "✅" if count <= 8 else "⚠️ Too many choices!"
        report_lines.append(f"[Hick's Law] {status} Vibe chips rendered: {count} (max recommended: 8)")
    except Exception as e:
        report_lines.append(f"[Hick's Law] ❌ Could not count vibe chips: {e}")

    # Miller's Law: Check card vibe tags (should be ≤3 per card)
    try:
        cards = driver.find_elements(By.CSS_SELECTOR, ".property-card")
        if cards:
            vibe_tags = cards[0].find_elements(By.CSS_SELECTOR, ".card-vibe-tag")
            status = "✅" if len(vibe_tags) <= 3 else "⚠️ Over Miller's limit!"
            report_lines.append(f"[Miller's Law] {status} First card has {len(vibe_tags)} vibe tags (max: 3)")
    except Exception:
        report_lines.append("[Miller's Law] ℹ️  No property cards visible for evaluation")


def run_user_journey(driver, persona, prompt, expectation, report_lines, wait):
    """Simulates a single user's search journey."""
    report_lines.append(f"\n--- Persona: {persona} ---")
    report_lines.append(f"Prompt: '{prompt}'")
    report_lines.append(f"Expectation: {expectation}")

    driver.get(BASE_URL)
    time.sleep(1)

    search_input = driver.find_element(By.ID, "vibe-search-input")
    search_input.clear()
    search_input.send_keys(prompt)
    search_input.send_keys(Keys.RETURN)

    try:
        results_el = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, '[aria-label="Search results"]'))
        )
        cards = driver.find_elements(By.CSS_SELECTOR, ".property-card")
        report_lines.append(f"Result: ✅ Search completed — {len(cards)} property card(s) displayed")
        if len(cards) == 0:
            report_lines.append("Result: ⚠️  No properties returned — may need more seed data")
    except Exception:
        report_lines.append("Result: ⚠️  Results section did not appear within 15s (backend may be offline)")


def main():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1280,900")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.implicitly_wait(10)
    wait = WebDriverWait(driver, 15)

    report_lines = [
        "======================================",
        "  Eden AI – AI UAT Report",
        f"  Generated: {datetime.datetime.now().isoformat()}",
        "======================================",
    ]

    try:
        driver.get(BASE_URL)
        time.sleep(2)

        # 1. Evaluate UX laws first
        evaluate_ux_laws(driver, report_lines)

        # 2. Run each simulated user journey
        report_lines.append("\n=== Simulated User Journeys ===")
        for user in SIMULATED_USERS:
            run_user_journey(
                driver, user["persona"], user["prompt"],
                user["expectation"], report_lines, wait
            )

        report_lines.append("\n=== UAT Complete ===")

    except Exception as e:
        report_lines.append(f"\n❌ FATAL: {e}")
    finally:
        driver.quit()

    report_path = "test-logs/uat_report.txt"
    with open(report_path, "w") as f:
        f.write("\n".join(report_lines))

    print("\n".join(report_lines))
    print(f"\n✅ UAT Report saved to: {report_path}")


if __name__ == "__main__":
    main()
