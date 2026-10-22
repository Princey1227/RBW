import os, subprocess, time, sys, urllib.request
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

PORT = os.environ.get("PORT", "3112"); B = f"http://localhost:{PORT}"
SHOTS = "/tmp/t/shots2"; os.makedirs(SHOTS, exist_ok=True)
FIX = "/tmp/t/fix2"; os.makedirs(FIX, exist_ok=True)
res = []
def t(name, ok, extra=""):
    res.append(bool(ok)); print(("PASS  " if ok else "FAIL  ") + name + ("" if ok else "  <-- " + str(extra)), flush=True)

def garment(path, w, h, col, bg=(0, 0, 0, 0), jacket=False):
    im = Image.new("RGBA", (w, h), bg); d = ImageDraw.Draw(im)
    if jacket:
        d.polygon([(w*.2, h*.15), (w*.8, h*.15), (w*.95, h*.55), (w*.78, h*.6), (w*.75, h*.9), (w*.25, h*.9), (w*.22, h*.6), (w*.05, h*.55)], fill=col)
    else:
        d.polygon([(w*.28, h*.06), (w*.72, h*.06), (w*.8, h*.94), (w*.55, h*.94), (w*.5, h*.35), (w*.45, h*.94), (w*.2, h*.94)], fill=col)
    im.save(path)
garment(f"{FIX}/j-raw.png", 600, 900, (30, 48, 96, 255))
garment(f"{FIX}/j-raw2.png", 600, 900, (40, 60, 110, 255))
garment(f"{FIX}/j-raw3.png", 700, 900, (50, 70, 120, 255))
garment(f"{FIX}/j-blk.png", 600, 900, (20, 20, 24, 255))
garment(f"{FIX}/k-raw.png", 800, 800, (30, 48, 96, 255), jacket=True)
garment(f"{FIX}/k-blk.png", 800, 800, (20, 20, 24, 255), jacket=True)
lg = Image.new("RGBA", (400, 120), (0, 0, 0, 0)); d = ImageDraw.Draw(lg); d.rectangle([10, 30, 390, 90], fill=(20, 20, 20, 255)); lg.save(f"{FIX}/logo.png")

def server():
    subprocess.Popen(f"cd /tmp/t && . ./env.sh && NODE_ENV=production setsid nohup npx next start -p {PORT} > start.log 2>&1 &", shell=True)
    for _ in range(60):
        time.sleep(1)
        try: urllib.request.urlopen(B + "/", timeout=3); return
        except Exception: pass
    raise SystemExit("server did not start")
def stop(): subprocess.run("sh /tmp/t/killnext.sh", shell=True); time.sleep(2)

ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"]
subprocess.run("sh /tmp/t/killnext.sh; rm -rf /tmp/t-data", shell=True); time.sleep(1)
server()

with sync_playwright() as p:
    br = p.chromium.launch(args=ARGS)

    # ---------- RBW's own carousel with DEFAULT props is unchanged ----------
    sm = br.new_context(viewport={"width": 1366, "height": 860}).new_page(); serr = []
    sm.on("pageerror", lambda e: serr.append(str(e)))
    sm.goto(B + "/rbw-smoke", timeout=90000); sm.wait_for_selector("canvas", timeout=60000); sm.wait_for_timeout(4000)
    t("RBW default carousel still renders its WebGL canvas", sm.locator("canvas").count() >= 1)
    t("RBW default carousel shows RBW's own item (Raw jeans, ₹1,900)", sm.locator("text=/SHOP RAW JEANS/i").count() >= 1 or sm.locator("text=₹1,900").count() >= 1)
    t("RBW default mode still preloads RBW images", sm.locator("link[rel=preload][href='/rbwstore/raw.png']").count() == 1)
    t("RBW default carousel: no JS errors", not serr, serr[:2])
    sm.screenshot(path=f"{SHOTS}/0-rbw-default.png")

    ctx = br.new_context(viewport={"width": 1366, "height": 900}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if (m.type == "error" and "Failed to load resource" not in m.text) else None)

    # ---------- admin + wizard ----------
    pg.goto(B + "/admin/stores", timeout=90000); pg.wait_for_selector("#a-user", timeout=60000)
    pg.fill("#a-user", "owner"); pg.fill("#a-pass", "correct-horse-battery"); pg.click("button:has-text('Sign in')")
    pg.wait_for_selector("h1:has-text('Store Management')"); pg.wait_for_selector("text=Add store")
    pg.evaluate("""async()=>{for(const [m,u] of [["POST","/api/admin/stores"],["PATCH","/api/admin/stores/none"],["POST","/api/stores/none/login"],["GET","/stores/none"],["GET","/api/stores/none/asset/logo/aaaaaaaaaaaaaaaaaaaaaaaa.png"]]){try{await fetch(u,{method:m,body:new FormData()})}catch(e){}}}""")
    pg.click("button:has-text('Add store')"); pg.wait_for_selector("#store-name")
    D = "div[role=dialog]"
    # step 1 validation
    pg.click(f"{D} button:has-text('Next')")
    t("wizard step 1: empty form blocked", pg.locator("text=Store name is required.").count() == 1 and pg.locator("text=Brand logo is required.").count() == 1)
    pg.fill("#store-name", "Thinc"); pg.set_input_files("#store-logo", f"{FIX}/logo.png")
    pg.fill("#store-pw", "thinc-secret-1"); pg.fill("#store-pw2", "nope"); pg.click(f"{D} button:has-text('Next')")
    t("wizard step 1: password mismatch blocked", pg.locator("text=Passwords do not match.").count() == 1)
    pg.fill("#store-pw2", "thinc-secret-1"); pg.click(f"{D} button:has-text('Next')")
    # step 2: what you sell
    pg.wait_for_selector("text=What are you going to sell?"); pg.click(f"{D} button:has-text('Next')")
    t("wizard step 2: must choose something to sell", pg.locator("text=Choose at least one thing you sell.").count() == 1)
    pg.click(f"{D} button[aria-pressed]:text-is('Jeans')"); pg.click(f"{D} button[aria-pressed]:text-is('Jackets')")
    pg.fill("input[aria-label='Other category']", "Cargo Shorts"); pg.click(f"{D} button:has-text('Add')"); pg.click(f"{D} button[aria-pressed]:text-is('Cargo Shorts')")
    t("wizard step 2: custom category can be added and removed", pg.locator(f"{D} button:text-is('Cargo Shorts')").count() == 0)
    pg.click(f"{D} button:has-text('Next')")
    # step 3: colours
    pg.wait_for_selector("text=Which colours will you sell?"); pg.click(f"{D} button:has-text('Next')")
    t("wizard step 3: must add a colour", pg.locator("text=Add at least one colour.").count() == 1)
    pg.click(f"{D} button:has-text('Raw Indigo')"); pg.click(f"{D} button:has-text('Black')")
    pg.click(f"{D} button:has-text('Next')")
    # step 4: fits
    pg.wait_for_selector("text=Which fits will you sell?")
    t("wizard step 4: fit presets offered only for jeans", pg.locator(f"{D} h3:has-text('Jeans fits')").count() == 1 and pg.locator(f"{D} h3:has-text('Jackets fits')").count() == 1 and pg.locator(f"{D} button:text-is('Baggy')").count() == 1)
    pg.click(f"{D} button[aria-pressed]:text-is('Straight')"); pg.click(f"{D} button[aria-pressed]:text-is('Baggy')")
    pg.click(f"{D} button:has-text('Next')")
    # step 5: products
    pg.wait_for_selector("text=Add each product")
    pg.click(f"{D} button:has-text('Next')")
    t("wizard step 5: needs at least one product", pg.locator("text=Add at least one product.").count() == 1)
    pg.click(f"{D} button:has-text('combinations')")
    n = pg.locator(f"{D} input[id^=pn-]").count()
    t("'Add all combinations' creates jeans 2 colours x 2 fits + jackets 2 colours = 6 drafts", n == 6, n)
    pg.click(f"{D} button:has-text('Next')")
    t("wizard step 5: incomplete products listed with clear errors", pg.locator("text=/Product 1: name is required/").count() == 1 and pg.locator("text=/Product 1: add at least one photo/").count() == 1)
    names = ["Raw Straight Denim", "Raw Baggy Denim", "Black Straight Denim", "Black Baggy Denim", "Raw Trucker Jacket", "Black Trucker Jacket"]
    prices = ["1900", "2100", "1900", "2100", "3400", "3400"]
    photos = [[f"{FIX}/j-raw.png", f"{FIX}/j-raw2.png", f"{FIX}/j-raw3.png"], [f"{FIX}/j-raw2.png"], [f"{FIX}/j-blk.png"], [f"{FIX}/j-blk.png"], [f"{FIX}/k-raw.png", f"{FIX}/k-raw.png"], [f"{FIX}/k-blk.png"]]
    for i in range(6):
        pg.locator(f"{D} input[id^=pn-]").nth(i).fill(names[i]); pg.locator(f"{D} input[id^=pp-]").nth(i).fill(prices[i])
        pg.locator(f"{D} textarea[id^=pd-]").nth(i).fill(f"{names[i]} — made to last.\nSecond line of care notes.")
        if i in (0, 1, 4): pg.locator(f"{D} input[id^=ps-]").nth(i).fill("30, 32" if i != 4 else "M, L")
        pg.locator(f"{D} input[id^=pf-]").nth(i).set_input_files(photos[i])
    pg.screenshot(path=f"{SHOTS}/1-wizard-products.png")
    pg.click(f"{D} button:has-text('Next')")
    pg.wait_for_selector("text=Creating the store saves everything at once")
    t("wizard review shows sells/colours/fits/products", "Raw Indigo, Black" in pg.locator(D).inner_text() and "6 (" in pg.locator(D).inner_text())
    pg.click(f"{D} button:has-text('Create store')"); pg.wait_for_selector("text=is live and password-protected", timeout=40000)
    t("Create Store -> success; URL /stores/thinc; folder Stores/THINC/", pg.locator("a:has-text('Open store')").get_attribute("href") == "/stores/thinc" and pg.locator("text=Stores/THINC/").count() >= 1)
    pg.screenshot(path=f"{SHOTS}/2-created.png")
    pg.click(f"{D} button:has-text('Manage')"); pg.wait_for_selector("aside[aria-label='Manage Thinc']")
    t("manage panel lists 6 products and the structure", pg.locator("aside >> text=Products · 6").count() == 1 and pg.locator("aside >> text=Raw Indigo").count() >= 1)
    pg.screenshot(path=f"{SHOTS}/3-manage.png")
    pg.click("button[aria-label='Close panel']")

    # ---------- visitor: the RBW journey ----------
    v = br.new_context(viewport={"width": 1366, "height": 860}); vp = v.new_page(); verr = []
    vp.on("pageerror", lambda e: verr.append(str(e)))
    vp.on("console", lambda m: verr.append(m.text) if (m.type == "error" and "Failed to load resource" not in m.text) else None)
    vp.goto(B + "/stores/thinc", timeout=90000); vp.wait_for_selector("#store-pw", timeout=60000)
    t("logged-out: login gate with brand logo, no catalogue in HTML", "/asset/products/" not in vp.content() and "Raw Straight" not in vp.content() and "scrypt" not in vp.content())
    vp.fill("#store-pw", "wrong-password"); vp.click("button:has-text('Login')"); vp.wait_for_selector("text=Incorrect password.")
    vp.fill("#store-pw", "thinc-secret-1"); vp.click("button:has-text('Login')")
    vp.wait_for_selector("canvas", timeout=60000); vp.wait_for_timeout(5000)
    t("home: WebGL colour carousel renders (RbwWashSelection3D)", vp.locator(".rbw-showroom canvas").count() >= 1)
    cats = [c.strip().lower() for c in vp.locator(".od-cat").all_inner_texts()]
    t("navbar shows the brand's categories (only those with products)", cats == ["jeans", "jackets"], cats)
    t("home shows the brand's product + colour (not RBW's)", vp.locator("text=/Raw Straight Denim/i").count() >= 1 and vp.locator("text=/RAW INDIGO/i").count() >= 1 and vp.locator("text=/SHOP RAW JEANS/i").count() == 0)
    t("carousel price is 'from' the cheapest fit", vp.locator("text=/from ₹ 1,900/").count() >= 1)
    vp.screenshot(path=f"{SHOTS}/4-home-raw.png")
    # rotate to the next colour
    vp.click("button[aria-label='Pause auto-rotation']"); vp.click("button[aria-label='Jump to Raw Straight Denim']"); vp.wait_for_timeout(1500)
    vp.click("button[aria-label='Next Garment']"); vp.wait_for_timeout(2500)
    t("carousel rotates to the next colour (Black)", vp.locator("text=/Black Straight Denim/i").count() >= 1)
    vp.screenshot(path=f"{SHOTS}/5-home-next.png")
    vp.click("button[aria-label='Jump to Raw Straight Denim']"); vp.wait_for_timeout(2500)
    vp.locator(".rbw-cta").first.click()
    vp.wait_for_selector("text=SELECT YOUR FIT", timeout=15000); vp.wait_for_timeout(1500)
    t("jeans -> fit step (RbwFitSelector) lists the brand's fits", [x.lower() for x in vp.locator(".rbw-fit__name").all_inner_texts()] == ["straight", "baggy"], vp.locator(".rbw-fit__name").all_inner_texts())
    t("fit cards use the brand's own product photos", vp.evaluate("[...document.querySelectorAll('.rbw-fit__img')].every(i=>i.src.includes('/api/stores/thinc/asset/products/'))"))
    t("no RBW measurements / RBW wash switcher in brand fit step", vp.locator(".rbw-fit__measure").count() == 0 and vp.locator(".rbw-fit button:text-is('white')").count() == 0)
    t("fit step colour switcher uses the brand's colours", {x.strip().lower() for x in vp.locator(".rbw-fit header button").all_inner_texts() if x.strip()} >= {"raw indigo", "black"})
    vp.screenshot(path=f"{SHOTS}/6-fit-step.png")
    vp.locator(".rbw-fit__item").first.click()
    vp.wait_for_selector(".rbw-pdp .rbw-j-title:visible", timeout=15000); vp.wait_for_timeout(1200)
    t("product page: name, price, description", vp.locator(".rbw-pdp .rbw-j-title:visible").inner_text().lower() == "raw straight denim" and "1,900" in vp.locator(".rbw-pdp .rbw-j-price:visible").inner_text() and "made to last" in vp.locator(".rbw-pdp:visible").inner_text())
    t("product page: multiple photos -> 3 thumbnails + counter", vp.locator(".rbw-pdp:visible .rbw-j-thumb").count() == 3 and "01" in vp.locator(".rbw-pdp:visible .rbw-j-counter").inner_text())
    vp.locator(".rbw-pdp:visible .rbw-j-thumb").nth(2).click(); vp.wait_for_timeout(400)
    t("thumbnail switches the main photo", "03" in vp.locator(".rbw-pdp:visible .rbw-j-counter").inner_text())
    vp.locator(".rbw-pdp:visible .rbw-j-size").nth(1).click(); t("size selection works", vp.locator(".rbw-pdp:visible .rbw-j-size").nth(1).get_attribute("aria-pressed") == "true")
    t("purchase honestly disabled (checkout not connected)", vp.locator(".rbw-pdp:visible .rbw-cta").is_disabled())
    t("URL deep-links the selection", "category=jeans" in vp.url and "color=raw-indigo" in vp.url and "fit=Straight" in vp.url, vp.url)
    vp.screenshot(path=f"{SHOTS}/7-product.png")
    # colour switch in the bar keeps the fit
    vp.locator("button[title='Switch to Black']").click(); vp.wait_for_timeout(1200)
    t("colour switch (top bar) -> Black Straight Denim, same fit", vp.locator(".rbw-pdp:visible .rbw-j-title").inner_text().lower() == "black straight denim")
    # back -> fits -> home
    vp.locator("button[aria-label='Back to Fits']").dispatch_event("click"); vp.wait_for_selector("text=SELECT YOUR FIT", timeout=60000); vp.wait_for_timeout(2000); t("Back -> Fits", True)
    t("Back button is on screen after returning to the fit step (scroll reset)", vp.evaluate("document.querySelector(\"button[aria-label='Back to Wash Selection']\").getBoundingClientRect().top") > 0)
    vp.locator("button[aria-label='Back to Wash Selection']").dispatch_event("click"); vp.wait_for_timeout(2500)
    t("Back -> colours (home carousel again)", vp.locator(".rbw-fit:visible").count() == 0)
    # category with no fits goes straight to product
    vp.locator(".od-cat:has-text('Jackets')").dispatch_event("click"); vp.wait_for_timeout(3500)
    vp.screenshot(path=f"{SHOTS}/8-jackets-home.png")
    t("category switch swaps the carousel to the jackets", vp.locator("text=/Trucker Jacket/i").count() >= 1)
    vp.click("button[aria-label='Jump to Raw Trucker Jacket']"); vp.wait_for_timeout(2200)
    vp.locator(".rbw-cta").first.click()
    vp.wait_for_selector(".rbw-pdp .rbw-j-title:visible", timeout=15000)
    t("jackets (no fits) skip the fit step -> product page directly", vp.locator(".rbw-pdp .rbw-j-title:visible").inner_text().lower() == "raw trucker jacket" and "fit=" not in vp.url)
    vp.go_back(); vp.wait_for_timeout(1000); t("browser Back returns to the carousel", vp.locator(".rbw-pdp .rbw-j-title:visible").count() == 0)
    # deep link / refresh equivalent in a fresh page with the same session
    dl = v.new_page(); dl.goto(B + "/stores/thinc?category=jeans&color=black&fit=Straight", timeout=90000)
    dl.wait_for_selector(".rbw-pdp .rbw-j-title:visible", timeout=60000)
    t("deep link / refresh restores the exact product (Black Straight Denim)", dl.locator(".rbw-pdp .rbw-j-title:visible").inner_text().lower() == "black straight denim")
    dl.close()
    # mobile
    m = br.new_context(viewport={"width": 390, "height": 844}, storage_state=v.storage_state()); mp = m.new_page()
    mp.goto(B + "/stores/thinc"); mp.wait_for_selector("canvas", timeout=60000); mp.wait_for_timeout(3500)
    t("mobile: no horizontal overflow on home", mp.evaluate("document.documentElement.scrollWidth<=innerWidth+1"))
    try: mp.screenshot(path=f"{SHOTS}/9-mobile-home.png", timeout=120000)
    except Exception as e: print("(mobile screenshot skipped:", str(e)[:60], ")")
    # logout
    vp.click("button[aria-label='Log out']"); vp.wait_for_selector("#store-pw", timeout=30000); t("Log out returns to login", True)
    t("no unexpected JS errors (dashboard + store journey)", not errs and not verr, (errs + verr)[:3])
    br.close()

# ---------- persistence across restart ----------
stop(); server()
with sync_playwright() as p:
    br = p.chromium.launch(args=ARGS); c = br.new_context(viewport={"width": 1366, "height": 860}); pg = c.new_page()
    pg.goto(B + "/stores/thinc", timeout=90000); pg.wait_for_selector("#store-pw", timeout=60000)
    pg.fill("#store-pw", "thinc-secret-1"); pg.click("button:has-text('Login')"); pg.wait_for_selector("canvas", timeout=60000); pg.wait_for_timeout(3000)
    t("PERSISTENCE: store, password, catalogue survive a server restart", pg.locator("text=/Raw Straight Denim/i").count() >= 1)
    br.close()

print(f"\n{sum(res)} passed, {len(res)-sum(res)} failed"); sys.exit(0 if all(res) else 1)
