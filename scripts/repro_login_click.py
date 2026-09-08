"""Repro: click through the preview login gate in headless Chromium.

Captures console messages + page errors so a dead click leaves evidence.
Usage: python scripts/repro_login_click.py  (preview server must be up)
"""
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:8137/ui"

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    logs = []
    page.on("console", lambda m: logs.append(f"[{m.type}] {m.text}"))
    page.on("pageerror", lambda e: logs.append(f"[pageerror] {e}"))
    page.on("requestfailed", lambda r: logs.append(f"[reqfail] {r.url} {r.failure}"))

    page.goto(URL, wait_until="networkidle")
    print("gate visible:", page.is_visible("#login-gate"))
    print("login input visible:", page.is_visible("#login-token"))
    page.fill("#login-token", "vpn")
    page.click("#btn-login")
    page.wait_for_timeout(4000)
    print("btn text after click:", repr(page.text_content("#btn-login")))
    print("login err text:", repr(page.text_content("#login-err")))
    print("gate hidden:", not page.is_visible("#login-gate"))
    print("console visible:", page.is_visible("#console"))
    page.screenshot(path="/tmp/after_login.png")
    print("--- console/page errors ---")
    for line in logs:
        print(line)
    if not logs:
        print("(no console messages or page errors)")
    browser.close()
