import sys
from playwright.sync_api import sync_playwright
B="http://localhost:3112"; ok=[]
def t(n,c,e=""): ok.append(bool(c)); print(("PASS  " if c else "FAIL  ")+n+("" if c else "  <-- "+str(e)),flush=True)
with sync_playwright() as p:
    br=p.chromium.launch(); pg=br.new_page(viewport={"width":1366,"height":860}); errs=[]
    pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(B+"/rbw-fit-smoke",timeout=90000); pg.wait_for_selector(".rbw-fit__item",timeout=60000); pg.wait_for_timeout(1500)
    t("RBW fit selector (defaults): original heading 'SELECT YOUR FIT'", "select your fit" in pg.locator(".rbw-fit__heading").inner_text().lower())
    t("RBW fit selector (defaults): back button still says 'Washes'", pg.locator("button:has-text('Washes')").count()==1)
    sw=[x.strip().lower() for x in pg.locator(".rbw-fit header button").all_inner_texts() if x.strip()]
    t("RBW fit selector (defaults): raw / black / white wash switcher intact", all(w in sw for w in ["raw","black","white"]), sw)
    t("RBW fit selector (defaults): MEASUREMENTS buttons still shown", pg.locator(".rbw-fit__measure").count()==2, pg.locator(".rbw-fit__measure").count())
    t("RBW fit selector (defaults): uses RBW's own /fits/ images, not brand assets", pg.evaluate("[...document.querySelectorAll('.rbw-fit__img')].every(i=>i.getAttribute('src').includes('/fits/')||i.src.includes('/fits/'))"))
    t("RBW fit selector (defaults): grid keeps RBW's 6-column layout (no brand centering)", pg.evaluate("getComputedStyle(document.querySelector('.rbw-fit__grid')).gridTemplateColumns.split(' ').length")==6)
    pg.locator("button:has-text('Washes')").dispatch_event("click"); pg.wait_for_timeout(400)
    t("RBW fit selector (defaults): back still fires the RESET_RBW_STOREFRONT event", pg.locator("#smoke").get_attribute("data-fired")=="yes")
    t("RBW fit selector (defaults): no JS errors", not errs, errs[:2])
    br.close()
print(f"\n{sum(ok)} passed, {len(ok)-sum(ok)} failed"); sys.exit(0 if all(ok) else 1)
