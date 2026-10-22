import fs from "fs";
const B = process.env.BASE || "http://localhost:3111";
let pass = 0, fail = 0;
const t = (name, ok, extra = "") => { (ok ? pass++ : fail++); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  <-- " + extra}`); };

const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(64, 1)]);
const WEBP = Buffer.concat([Buffer.from("RIFF"), Buffer.from([40, 0, 0, 0]), Buffer.from("WEBPVP8 "), Buffer.alloc(40, 2)]);
const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="#222"/></svg>');
const EVIL_SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
const file = (buf, name, type) => new File([buf], name, { type });

class Jar {
  c = {};
  set(res) {
    for (const s of res.headers.getSetCookie?.() ?? []) {
      const [kv] = s.split(";"); const i = kv.indexOf("=");
      const k = kv.slice(0, i), v = kv.slice(i + 1);
      if (/Max-Age=0/i.test(s)) delete this.c[k]; else this.c[k] = v;
    }
  }
  h() { return Object.entries(this.c).map(([k, v]) => `${k}=${v}`).join("; "); }
}
const req = async (jar, path, opts = {}) => {
  const r = await fetch(B + path, { redirect: "manual", ...opts, headers: { ...(opts.headers || {}), cookie: jar.h() } });
  jar.set(r); return r;
};
const jpost = (jar, path, body, method = "POST", headers = {}) =>
  req(jar, path, { method, body: JSON.stringify(body), headers: { "content-type": "application/json", ...headers } });

const admin = new Jar(), visitorA = new Jar(), visitorB = new Jar(), anon = new Jar();
const DATA = process.env.STORES_DATA_DIR || "/tmp/t-data";
const storeDirs = () => (fs.existsSync(DATA) ? fs.readdirSync(DATA) : []);

const baseSpec = () => ({
  name: "Thinc & Co", password: "thinc-pass-1", confirmPassword: "thinc-pass-1", logoMode: "mono",
  categories: ["Jeans", "Jackets"],
  colors: [{ name: "Raw Indigo", hex: "#1f2a44" }, { name: "Black", hex: "#111111" }, { name: "Ecru", hex: "#efe9dc" }],
  fits: { Jeans: ["Straight", "Baggy"] },
  products: [
    { category: "Jeans", color: "Raw Indigo", fit: "Straight", name: "Raw Straight Denim", price: 1900, description: "14.5oz raw selvedge.\nWear 6 months.", sizes: ["30", "32"] },
    { category: "Jeans", color: "Raw Indigo", fit: "Baggy", name: "Raw Baggy Denim", price: 2100, description: "Wide leg.", sizes: ["30"] },
    { category: "Jeans", color: "Black", fit: "Straight", name: "Black Straight Denim", price: 1900, description: "Overdyed.", sizes: [] },
    { category: "Jackets", color: "Raw Indigo", fit: null, name: "Raw Trucker Jacket", price: 3400, description: "Classic trucker.", sizes: ["M", "L"] },
  ],
});
const basePhotos = () => ({ 0: [file(PNG, "a1.png"), file(JPG, "a2.jpg"), file(WEBP, "a3.webp")], 1: [file(JPG, "b.jpg")], 2: [file(PNG, "c.png")], 3: [file(SVG, "d.svg", "image/svg+xml"), file(PNG, "d2.png")] });
const mkForm = (spec, photos, logo = file(PNG, "logo.png", "image/png")) => {
  const f = new FormData();
  f.set("payload", JSON.stringify(spec));
  if (logo) f.set("logo", logo);
  for (const [i, arr] of Object.entries(photos)) for (const p of arr) f.append(`photos_${i}`, p);
  return f;
};
const create = (jar, spec, photos = basePhotos(), logo) => req(jar, "/api/admin/stores", { method: "POST", body: mkForm(spec, photos, logo) });
const patchMp = (jar, slug, payload, files = {}) => {
  const f = new FormData(); f.set("payload", JSON.stringify(payload));
  for (const [k, arr] of Object.entries(files)) for (const x of [].concat(arr)) f.append(k, x);
  return req(jar, `/api/admin/stores/${slug}`, { method: "PATCH", body: f });
};
const patch = (jar, slug, body) => jpost(jar, `/api/admin/stores/${slug}`, body, "PATCH");
const mut = (fn) => { const s = baseSpec(); fn(s); return s; };

// ---------- admin auth ----------
let r = await req(anon, "/api/admin/stores");
t("admin list without session -> 401", r.status === 401);
r = await create(anon, baseSpec());
t("admin create without session -> 401", r.status === 401);
r = await jpost(admin, "/api/admin/session", { username: "owner", password: "nope" });
t("admin wrong password -> 401", r.status === 401);
r = await jpost(admin, "/api/admin/session", { username: "owner", password: "correct-horse-battery" });
const setc = r.headers.getSetCookie().join("|");
t("admin correct login -> 200", r.status === 200);
t("admin cookie HttpOnly + SameSite=Lax", /HttpOnly/i.test(setc) && /SameSite=Lax/i.test(setc), setc);
r = await jpost(anon, "/api/admin/session", { username: "owner", password: "correct-horse-battery" }, "POST", { origin: "https://evil.example" });
t("cross-origin admin login blocked -> 403", r.status === 403);

// ---------- validation: every rejection must leave NO partial store ----------
const before = storeDirs().length;
const bad = async (name, spec, photos, logo, code = 400) => { const r = await create(admin, spec, photos, logo); const j = await r.json().catch(() => ({})); t(name, r.status === code, `${r.status} ${j.error}`); return j; };
await bad("password < 8 chars rejected", mut((s) => { s.password = s.confirmPassword = "short"; }));
await bad("password mismatch rejected", mut((s) => { s.confirmPassword = "different-pass"; }));
await bad("missing logo rejected", baseSpec(), basePhotos(), null);
await bad("non-image renamed .png as logo rejected (magic bytes)", baseSpec(), basePhotos(), file(Buffer.from("just text"), "x.png", "image/png"));
await bad("SVG logo with <script> rejected", baseSpec(), basePhotos(), file(EVIL_SVG, "e.svg", "image/svg+xml"));
await bad("logo > 2MB rejected", baseSpec(), basePhotos(), file(Buffer.concat([PNG, Buffer.alloc(3 * 1024 * 1024)]), "big.png", "image/png"));
await bad("no categories rejected", mut((s) => { s.categories = []; }));
await bad("no colours rejected", mut((s) => { s.colors = []; }));
await bad("bad colour hex rejected", mut((s) => { s.colors[0].hex = "blue"; }));
await bad("duplicate colour rejected", mut((s) => { s.colors.push({ name: "black", hex: "#000000" }); }));
await bad("> 8 categories rejected", mut((s) => { s.categories = Array.from({ length: 9 }, (_, i) => "Cat" + i); }));
await bad("no products rejected", mut((s) => { s.products = []; }), {});
await bad("product with unknown category rejected", mut((s) => { s.products[0].category = "Shoes"; }));
await bad("product with unknown colour rejected", mut((s) => { s.products[0].color = "Pink"; }));
await bad("fit required when the category has fits", mut((s) => { s.products[0].fit = null; }));
await bad("unknown fit rejected", mut((s) => { s.products[0].fit = "Skinny"; }));
await bad("fit given for a category without fits rejected", mut((s) => { s.products[3].fit = "Straight"; }));
await bad("duplicate category/colour/fit combo rejected", mut((s) => { s.products[1].fit = "Straight"; }));
await bad("product without photos rejected", baseSpec(), { ...basePhotos(), 2: [] });
await bad("product price 0 rejected", mut((s) => { s.products[0].price = 0; }));
await bad("product price NaN rejected", mut((s) => { s.products[0].price = "abc"; }));
await bad("product name required", mut((s) => { s.products[0].name = "  "; }));
await bad("HTML in product name rejected", mut((s) => { s.products[0].name = "<b>x</b>"; }));
await bad("HTML in description rejected", mut((s) => { s.products[0].description = "<script>x</script>"; }));
await bad("description > 2000 chars rejected", mut((s) => { s.products[0].description = "x".repeat(2001); }));
await bad("> 8 photos for one product rejected", baseSpec(), { ...basePhotos(), 0: Array.from({ length: 9 }, (_, i) => file(PNG, `p${i}.png`)) });
await bad("fake image among product photos rejected", baseSpec(), { ...basePhotos(), 1: [file(Buffer.from("nope"), "z.jpg", "image/jpeg")] });
await bad("reserved name 'RBW' rejected (409)", mut((s) => { s.name = "RBW"; }), basePhotos(), undefined, 409);
await bad("name with no letters/numbers rejected", mut((s) => { s.name = "!!!"; }));
t("failed attempts left NO partial store folders", storeDirs().length === before, JSON.stringify(storeDirs()));

// ---------- create ----------
r = await create(admin, baseSpec());
let j = await r.json();
t("create store -> 201", r.status === 201, JSON.stringify(j).slice(0, 300));
const A = j.store;
t("slug generated: thinc-and-co", A?.slug === "thinc-and-co", A?.slug);
t("categories/colours/fits stored with generated ids", A?.categories?.map((c) => c.id).join() === "jeans,jackets" && A?.colors?.map((c) => c.id).join() === "raw-indigo,black,ecru" && A?.fits?.jeans?.join() === "Straight,Baggy", JSON.stringify([A?.categories, A?.colors, A?.fits]));
t("4 products with name/price/description/photos", A?.productCount === 4 && A.products[0].imageUrls.length === 3 && A.products[0].description.includes("selvedge") && A.products[0].price === 1900);
t("all complete products are ready to sell", A?.readyCount === 4);
t("folder reported as Stores/THINC-AND-CO/", A?.folder === "Stores/THINC-AND-CO/");
t("response contains no hash/password", !JSON.stringify(j).match(/scrypt|hash|thinc-pass/i));
const dir = `${DATA}/THINC-AND-CO`;
t("logo/ products/ assets/ + store.json exist on disk", ["logo", "products", "assets", "store.json"].every((x) => fs.existsSync(`${dir}/${x}`)));
t("1 logo + 7 product photo files stored", fs.readdirSync(`${dir}/logo`).length === 1 && fs.readdirSync(`${dir}/products`).length === 7);
const raw = fs.readFileSync(`${dir}/store.json`, "utf8");
t("password NOT stored in plain text; scrypt hash present", !raw.includes("thinc-pass-1") && /"hash": "scrypt\$/.test(raw));
r = await create(admin, mut((s) => { s.name = "thinc & co"; }));
t("duplicate name (case-insensitive) -> 409", r.status === 409);
r = await create(admin, mut((s) => { s.name = "Thinc and Co."; s.password = s.confirmPassword = "other-pass-22"; }));
j = await r.json();
t("different name, same slug -> auto-suffixed -2", r.status === 201 && j.store?.slug === "thinc-and-co-2", JSON.stringify(j).slice(0, 200));
const wideSpec = { name: "Wide", password: "wide-pass-333", confirmPassword: "wide-pass-333", logoMode: "original", categories: ["Shorts"], colors: [{ name: "Stone", hex: "#c9bfa9" }],
  products: [{ category: "Shorts", color: "Stone", name: "Stone Shorts", price: 1200, description: "", sizes: [] }] };
r = await create(admin, wideSpec, { 0: [file(JPG, "p.jpg")] }, file(SVG, "wide.svg", "image/svg+xml"));
const W = (await r.json()).store;
t("second store 'wide' (SVG logo, original logo colours, no fits)", r.status === 201 && W?.slug === "wide" && W.logoMode === "original" && W.products[0].fit === null);
r = await req(admin, "/api/admin/stores"); j = await r.json();
t("list: RBW built-in first, then created stores in order", j.stores?.[0]?.slug === "rbw" && j.stores[0].builtIn && j.stores.slice(1).map((s) => s.slug).join() === "thinc-and-co,thinc-and-co-2,wide", j.stores?.map((s) => s.slug).join());
t("RBW built-in has no folder on disk (never created/overwritten)", !fs.existsSync(`${DATA}/RBW`));

// ---------- visitor access ----------
const logoUrl = A.logoUrl, prodUrl = A.products[0].imageUrls[0];
r = await req(anon, logoUrl);
t("logo public for logged-out visitor (login screen)", r.status === 200 && r.headers.get("content-type") === "image/png");
t("asset has nosniff + sandbox CSP", r.headers.get("x-content-type-options") === "nosniff" && /sandbox/.test(r.headers.get("content-security-policy") || ""));
r = await req(anon, prodUrl); t("product photo blocked when logged out -> 401", r.status === 401);
r = await jpost(visitorA, "/api/stores/thinc-and-co/login", { password: "wrong-pass" }); j = await r.json();
t("wrong store password -> 401 generic message", r.status === 401 && j.error === "Incorrect password.");
r = await jpost(visitorA, "/api/stores/thinc-and-co/login", { password: "thinc-pass-1" });
const sc = r.headers.getSetCookie().join("|");
t("correct store password -> 200", r.status === 200);
t("store cookie HttpOnly + SameSite=Lax", /od_store_thinc-and-co=/.test(sc) && /HttpOnly/i.test(sc) && /SameSite=Lax/i.test(sc), sc);
r = await req(visitorA, prodUrl); t("product photo served after login", r.status === 200);
const wideProd = W.products[0].imageUrls[0];
r = await req(visitorA, wideProd); t("store A session does NOT unlock store B photos -> 401", r.status === 401);
r = await jpost(visitorA, "/api/stores/wide/login", { password: "thinc-pass-1" }); t("store A password does NOT log into store B -> 401", r.status === 401);
r = await jpost(visitorB, "/api/stores/wide/login", { password: "wide-pass-333" }); t("store B own password works", r.status === 200);
r = await req(visitorB, prodUrl); t("store B session does NOT unlock store A -> 401", r.status === 401);
const forged = new Jar(); forged.c["od_store_thinc-and-co"] = visitorB.c["od_store_wide"];
r = await req(forged, prodUrl); t("another store's valid cookie replayed on A -> 401", r.status === 401);
forged.c["od_store_thinc-and-co"] = visitorA.c["od_store_thinc-and-co"].replace(/.$/, (c) => (c === "a" ? "b" : "a"));
r = await req(forged, prodUrl); t("tampered cookie signature -> 401", r.status === 401);

// ---------- asset hardening ----------
for (const p of ["/api/stores/thinc-and-co/asset/products/..%2Fstore.json", "/api/stores/thinc-and-co/asset/..%2F..%2Fstore.json/x", "/api/stores/thinc-and-co/asset/products/store.json", "/api/stores/..%2F..%2Fetc/asset/logo/a", "/api/stores/nope/asset/logo/aaaaaaaaaaaaaaaaaaaaaaaa.png"]) {
  r = await req(visitorA, p); t(`path traversal / unknown blocked: ${p.slice(0, 62)}`, r.status === 404, String(r.status));
}
r = await req(anon, "/api/stores/thinc-and-co/asset/logo/" + prodUrl.split("/").pop()); t("product file requested via /logo/ path -> 404", r.status === 404);

// ---------- admin-only mutations ----------
r = await patch(anon, "thinc-and-co", { status: "inactive" }); t("PATCH without admin session -> 401", r.status === 401);
r = await patch(visitorA, "thinc-and-co", { status: "inactive" }); t("store visitor session cannot administer -> 401", r.status === 401);

// ---------- product & structure editing ----------
const P = A.products; const pid = P[0].id;
r = await patch(admin, "thinc-and-co", { productPatches: { [pid]: { name: "Raw Straight 14.5oz", price: 2000, description: "Updated copy", sizes: ["28", "30"], stock: "in_stock" } } }); j = await r.json();
const p0 = j.store?.products?.find((p) => p.id === pid);
t("edit name/price/description/sizes/stock", r.status === 200 && p0.name === "Raw Straight 14.5oz" && p0.price === 2000 && p0.description === "Updated copy" && p0.sizes.join() === "28,30" && p0.stock === "in_stock");
for (const [label, body] of [["price -5", { price: -5 }], ["empty name", { name: "" }], ["HTML in name", { name: "<img onerror=x>" }], ["bad stock", { stock: "plenty" }]]) {
  r = await patch(admin, "thinc-and-co", { productPatches: { [pid]: body } }); t(`edit rejected: ${label}`, r.status === 400);
}
r = await patchMp(admin, "thinc-and-co", { addImagesToProduct: { productId: pid } }, { addImages: [file(PNG, "extra.png")] }); j = await r.json();
t("add a photo to a product (3 -> 4)", r.status === 200 && j.store.products.find((p) => p.id === pid).imageUrls.length === 4);
let imgs = j.store.products.find((p) => p.id === pid).imageUrls.map((u) => u.split("/").pop());
r = await patch(admin, "thinc-and-co", { moveImage: { productId: pid, file: imgs[3], direction: -1 } }); j = await r.json();
const imgs2 = j.store.products.find((p) => p.id === pid).imageUrls.map((u) => u.split("/").pop());
t("reorder photos (move up)", r.status === 200 && imgs2[2] === imgs[3] && imgs2[3] === imgs[2]);
r = await patch(admin, "thinc-and-co", { moveImage: { productId: pid, file: imgs2[0], direction: -1 } }); t("moving first photo up rejected", r.status === 400);
r = await patch(admin, "thinc-and-co", { removeImage: { productId: pid, file: imgs2[3] } }); j = await r.json();
t("remove a photo -> file deleted from disk", r.status === 200 && j.store.products.find((p) => p.id === pid).imageUrls.length === 3 && !fs.existsSync(`${dir}/products/${imgs2[3]}`));
r = await patch(admin, "thinc-and-co", { removeImage: { productId: P[1].id, file: P[1].imageUrls[0].split("/").pop() } }); t("cannot remove a product's last photo", r.status === 400);
r = await patch(admin, "thinc-and-co", { addCategories: ["Shorts"], addColors: [{ name: "Washed Grey", hex: "#8a8f98" }], addFits: [{ category: "Shorts", fit: "Relaxed" }] }); j = await r.json();
t("add category + colour + fit", r.status === 200 && j.store.categories.length === 3 && j.store.colors.length === 4 && j.store.fits.shorts?.join() === "Relaxed", JSON.stringify(j).slice(0, 200));
r = await patch(admin, "thinc-and-co", { addCategories: ["jeans"] }); t("adding a duplicate category rejected", r.status === 400);
r = await patch(admin, "thinc-and-co", { colorPatches: { "raw-indigo": { hex: "#22304f", name: "Raw Indigo" } } }); j = await r.json();
t("recolour a colour (id stable)", r.status === 200 && j.store.colors[0].hex === "#22304f" && j.store.colors[0].id === "raw-indigo");
r = await patch(admin, "thinc-and-co", { colorPatches: { "raw-indigo": { hex: "red" } } }); t("invalid recolour rejected", r.status === 400);
r = await patchMp(admin, "thinc-and-co", { addProduct: { category: "Shorts", color: "Washed Grey", fit: "Relaxed", name: "Grey Shorts", price: 1100, description: "Light.", sizes: ["30"] } }, { newProductPhotos: [file(JPG, "s1.jpg"), file(PNG, "s2.png")] }); j = await r.json();
t("add a new product with 2 photos", r.status === 200 && j.store.productCount === 5 && j.store.products.at(-1).imageUrls.length === 2, JSON.stringify(j).slice(0, 200));
const gone = j.store.products.at(-1); const goneFiles = gone.imageUrls.map((u) => u.split("/").pop());
r = await patchMp(admin, "thinc-and-co", { addProduct: { category: "Shorts", color: "Washed Grey", fit: "Relaxed", name: "Dup", price: 1, description: "", sizes: [] } }, { newProductPhotos: [file(JPG, "s1.jpg")] }); t("adding a product for an existing combo -> 409", r.status === 409);
r = await patchMp(admin, "thinc-and-co", { addProduct: { category: "Shorts", color: "Washed Grey", fit: "Relaxed", name: "NoPhoto", price: 1, description: "", sizes: [] } }, {}); t("adding a product without photos rejected", r.status === 400);
r = await patch(admin, "thinc-and-co", { removeProductIds: [gone.id] }); j = await r.json();
t("remove product -> its photo files deleted from disk", r.status === 200 && j.store.productCount === 4 && goneFiles.every((f) => !fs.existsSync(`${dir}/products/${f}`)));
const oldLogo = fs.readdirSync(`${dir}/logo`)[0];
r = await patchMp(admin, "thinc-and-co", { logoMode: "original" }, { logo: file(JPG, "new.jpg", "image/jpeg") }); j = await r.json();
const logos = fs.readdirSync(`${dir}/logo`);
t("replace logo + logoMode: new file stored, old removed", r.status === 200 && logos.length === 1 && logos[0] !== oldLogo && /\.jpg$/.test(logos[0]) && j.store.logoMode === "original");
r = await req(anon, j.store.logoUrl); t("new logo is served", r.status === 200 && r.headers.get("content-type") === "image/jpeg");
r = await patch(admin, "thinc-and-co", { logoMode: "sepia" }); t("invalid logoMode rejected", r.status === 400);
r = await patch(admin, "thinc-and-co", { name: "THINC Studio" }); j = await r.json();
t("rename keeps URL slug stable", r.status === 200 && j.store.name === "THINC Studio" && j.store.slug === "thinc-and-co");
r = await patch(admin, "thinc-and-co", { name: "Wide" }); t("rename to existing store's name -> 409", r.status === 409);

// ---------- deactivate / reactivate ----------
r = await patch(admin, "thinc-and-co", { status: "inactive" }); t("deactivate store", r.status === 200);
r = await req(anon, logoUrl); t("inactive: logo hidden from visitors -> 404", r.status === 404);
r = await req(visitorA, prodUrl); t("inactive: even an authenticated visitor gets 404", r.status === 404);
r = await jpost(anon, "/api/stores/thinc-and-co/login", { password: "thinc-pass-1" }); t("inactive: login refused (generic 401)", r.status === 401);
r = await req(admin, prodUrl); t("inactive: admin can still preview assets", r.status === 200);
r = await patch(admin, "thinc-and-co", { status: "active" }); t("reactivate store", r.status === 200);
r = await req(visitorA, prodUrl); t("reactivated: previous session works again", r.status === 200);

// ---------- password change ----------
r = await patch(admin, "thinc-and-co", { password: "brand-new-pass-9", confirmPassword: "nope" }); t("password change with mismatch rejected", r.status === 400);
r = await patch(admin, "thinc-and-co", { password: "brand-new-pass-9", confirmPassword: "brand-new-pass-9" }); t("password changed", r.status === 200);
r = await req(visitorA, prodUrl); t("old session invalidated after password change -> 401", r.status === 401);
r = await jpost(visitorA, "/api/stores/thinc-and-co/login", { password: "thinc-pass-1" }); t("old password no longer works", r.status === 401);
r = await jpost(visitorA, "/api/stores/thinc-and-co/login", { password: "brand-new-pass-9" }); t("new password works", r.status === 200);
t("no plaintext password anywhere on disk", !fs.readFileSync(`${dir}/store.json`, "utf8").includes("brand-new-pass-9"));

// ---------- brute force ----------
const brute = new Jar(); let got429 = false, retry = null;
for (let i = 0; i < 8; i++) { r = await jpost(brute, "/api/stores/wide/login", { password: "guess" + i }); if (r.status === 429) { got429 = true; retry = r.headers.get("retry-after"); break; } }
t("brute force: rate-limited with 429 + Retry-After", got429 && Number(retry) > 0, `retry=${retry}`);
r = await jpost(brute, "/api/stores/wide/login", { password: "wide-pass-333" }); t("rate limit also blocks the correct password while locked", r.status === 429);
r = await jpost(new Jar(), "/api/stores/doesnotexist/login", { password: "x" }); j = await r.json();
t("unknown store login -> same generic 401 (no enumeration)", r.status === 401 && j.error === "Incorrect password.");

// ---------- logout ----------
r = await req(visitorA, "/api/stores/thinc-and-co/login", { method: "DELETE" });
r = await req(visitorA, prodUrl); t("store logout clears access", r.status === 401);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
