/* GrowLog – seed to harvest tracker. All data stays in this browser. */
(() => {
"use strict";
const C = CONTENT;
const KEY = "growlog.v1";
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

/* ---------------- dates ---------------- */
const pad = n => String(n).padStart(2, "0");
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { if (!s) return null; const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const diff = (a, b) => Math.round((parse(iso(a)) - parse(iso(b))) / 864e5); // a - b in days
const fmt = d => d ? d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";
const fmtLong = d => d ? d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "";

/* ---------------- state ---------------- */
const defaults = () => ({ plants: [], settings: { tent: "4x4", watts: 480, theme: "auto" }, current: null, tab: "today" });
let S;
try { S = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { S = defaults(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("Couldn't save – storage full or blocked"); } };
const plant = () => S.plants.find(p => p.id === S.current) || S.plants[0] || null;

/* ---------------- event types ---------------- */
const EV = [
  ["germ_start", "🫘", "Germination started"],
  ["popped", "🌰", "Seed popped (taproot)"],
  ["planted", "🪴", "Planted in soil"],
  ["sprouted", "🌱", "Sprouted above soil"],
  ["true_leaves", "🍃", "First true leaves"],
  ["transplant", "🔁", "Transplanted"],
  ["lst_start", "🪢", "Started LST"],
  ["topped", "✂️", "Topped"],
  ["defoliate", "🍂", "Defoliated / lollipopped"],
  ["flip", "🌗", "Flipped to 12/12"],
  ["first_pistils", "🤍", "First pistils (sex shown)"],
  ["flush_start", "💧", "Started flush / finish"],
  ["harvest", "🪓", "Harvested (chop)"],
  ["dry_done", "🧺", "Drying done"],
  ["jarred", "🫙", "Jarred for cure"],
  ["cure_done", "🏁", "Cure done"],
  ["note", "📝", "Note / other"]
];
const EVMAP = Object.fromEntries(EV.map(([k, e, l]) => [k, { e, l }]));
const evDate = (p, type) => { const ev = (p.events || []).filter(x => x.type === type).sort((a, b) => a.date.localeCompare(b.date))[0]; return ev ? parse(ev.date) : null; };
const has = (p, t) => !!evDate(p, t);

/* ---------------- grow logic ---------------- */
function baseDate(p) { return evDate(p, "sprouted") || (evDate(p, "planted") && addDays(evDate(p, "planted"), 3)) || (evDate(p, "popped") && addDays(evDate(p, "popped"), 4)) || null; }
function dayNum(p, d = today()) { const b = baseDate(p); return b ? diff(d, b) + 1 : null; }
function autoDays(p) { return Number(p.autoDays) || 77; }
function flowerWeeks(p) { return Number(p.flowerWeeks) || 9; }
function vegWeeks(p) { return Number(p.vegWeeks) || 5; }

function stage(p, d = today()) {
  const hv = evDate(p, "harvest");
  if (hv && d >= hv) { const j = evDate(p, "jarred"); if (evDate(p, "cure_done") && d >= evDate(p, "cure_done")) return "done"; return j && d >= j ? "curing" : "drying"; }
  const b = baseDate(p);
  if (!b || d < b) return evDate(p, "germ_start") || evDate(p, "popped") || evDate(p, "planted") ? "germination" : "planning";
  const n = diff(d, b) + 1;
  if (p.type === "auto") {
    if (n <= 14) return "seedling";
    const pist = evDate(p, "first_pistils");
    if (n >= autoDays(p) - 7) return "flush";
    if ((pist && d >= pist) || n > 35) return "flower";
    return "veg";
  }
  const f = evDate(p, "flip");
  if (f && d >= f) { const fw = Math.floor(diff(d, f) / 7) + 1; return fw >= flowerWeeks(p) ? "flush" : "flower"; }
  return n <= 14 ? "seedling" : "veg";
}
const STAGE_LABEL = { planning: "Planning", germination: "Germination", seedling: "Seedling", veg: "Vegetative", flower: "Flowering", flush: "Finish / harvest window", drying: "Drying", curing: "Curing", done: "Done" };
const STAGE_ORDER = ["germination", "seedling", "veg", "flower", "flush", "drying", "curing"];

function weekLabel(p, d = today()) {
  const st = stage(p, d), n = dayNum(p, d);
  if (st === "flower" || st === "flush") {
    if (p.type !== "auto") { const f = evDate(p, "flip"); return `Flower day ${diff(d, f) + 1} · week ${Math.floor(diff(d, f) / 7) + 1}`; }
    return `Day ${n} · week ${Math.ceil(n / 7)}`;
  }
  if (st === "drying" || st === "curing" || st === "done") { const h = evDate(p, "harvest"); return `${diff(d, h)} days since chop`; }
  if (n) return `Day ${n} · week ${Math.ceil(n / 7)}`;
  const g = evDate(p, "germ_start") || evDate(p, "popped"); return g ? `${diff(d, g)} days since germination` : "Not started";
}

// returns { row, plain, why }
function chartFor(p, d = today()) {
  const st = stage(p, d), n = dayNum(p, d);
  const rowBy = k => C.foxfarm.chart.find(r => r.key === k);
  if (["planning", "germination", "drying", "curing", "done"].includes(st)) return { row: null, plain: true, why: "No feeding at this stage." };
  const hot = p.soil === "oceanforest" ? 21 : p.soil === "happyfrog" ? 14 : 0;
  if (n <= hot) return { row: rowBy("seedling"), plain: true, why: `${p.soil === "oceanforest" ? "Ocean Forest" : "Happy Frog"} is pre-charged with nutrients. Give plain pH'd water until about day ${hot}, then start the chart.` };
  if (st === "flush") return { row: rowBy("flush"), plain: true, why: "Finishing: plain pH'd water (Sledgehammer at label rate optional)." };
  if (p.type === "auto") {
    const w = Math.ceil(n / 7);
    if (w <= 2) return { row: rowBy("seedling") };
    if (w === 3) return { row: rowBy("w2") };
    if (w === 4) return { row: rowBy("w3") };
    return { row: rowBy("w" + Math.min(12, w)) };
  }
  if (st === "seedling") return { row: rowBy("seedling") };
  if (st === "veg") { const vw = Math.floor((n - 15) / 7) + 1; return { row: rowBy("w" + Math.max(1, Math.min(4, vw))) }; }
  const f = evDate(p, "flip"); const fw = Math.floor(diff(d, f) / 7) + 1;
  return { row: rowBy("w" + Math.min(12, 4 + fw)) };
}

const PRODUCTS = ["bigBloom", "growBig", "tigerBloom", "openSesame", "beastie", "chaChing"];
function tspFmt(t) {
  if (t <= 0) return "0";
  const eighths = Math.round(t * 8);
  if (eighths === 0) return "a pinch (<⅛ tsp)";
  const whole = Math.floor(eighths / 8), rem = eighths % 8;
  const fr = { 0: "", 1: "⅛", 2: "¼", 3: "⅜", 4: "½", 5: "⅝", 6: "¾", 7: "⅞" }[rem];
  return `${whole ? whole + (fr ? " " : "") : ""}${fr} tsp`;
}
function mixFor(row, strength, gal) {
  if (!row) return [];
  return PRODUCTS.filter(k => row[k]).map(k => { const tsp = row[k] * strength * gal; return { k, name: C.foxfarm.products[k].name, color: C.foxfarm.products[k].color, perGal: row[k], tsp, ml: tsp * 4.929 }; });
}

/* ---- tasks & projections ---- */
function tasksFor(p, horizon = 400) {
  const T = []; const t0 = today();
  const add = (date, title, body, level = "g", tab) => { if (date) T.push({ date, title, body, level, tab, plant: p }); };
  const g = evDate(p, "germ_start"), pop = evDate(p, "popped"), pl = evDate(p, "planted"), sp = evDate(p, "sprouted");
  const b = baseDate(p), hv = evDate(p, "harvest");
  if (!g && !pop && !pl && !sp) add(t0, "Start germination", "Log 'Germination started' when the seed goes in the paper towel or water.", "w");
  if (g && !pop && !pl) { add(addDays(g, 2), "Check seeds for a taproot", "Most seeds pop in 24–72 h. Log 'Seed popped' when you see the root."); add(addDays(g, 6), "Seed still not popped?", "After 5–7 days it may be a dud. Try another seed.", "w"); }
  if (pop && !pl) add(pop, "Plant the popped seed", "Taproot down, ¼–½ inch deep in moist soil.", "w");
  if (pl && !sp) add(addDays(pl, 4), "Expect a sprout", "Usually 3–7 days after planting. Log 'Sprouted' when it breaks the soil.");
  if (b && !hv) {
    if (!has(p, "transplant")) add(addDays(b, p.type === "auto" ? 12 : 18), "Transplant to final pot (if you started in a cup)", p.type === "auto" ? "Autos hate transplant shock. Do it early or start in the final pot." : "Do it once roots fill the cup. Final pot at least 2 weeks before flip.");
    if (p.type === "auto") {
      if (!has(p, "lst_start")) add(addDays(b, 11), "Start gentle LST", "Tie the main stem over at 3–4 nodes.", "g", "train");
      if (!has(p, "first_pistils")) add(addDays(b, 25), "Watch for first pistils", "Autos start flowering around day 21–35. Log it when you see white hairs.");
      add(addDays(b, autoDays(p) - 21), "Start checking trichomes", "Use a loupe on the buds every few days.", "g", "look");
      add(addDays(b, autoDays(p) - 7), "Begin finish (optional plain-water flush)", "Plain pH'd water for the last week, or keep feeding lightly.");
      add(addDays(b, autoDays(p)), "Projected harvest", "Chop when trichomes are mostly milky with 10–30% amber.", "w");
    } else {
      const flip = evDate(p, "flip");
      if (!has(p, "lst_start")) add(addDays(b, 18), "Start LST", "Bend and tie the main stem at 3–4 nodes.", "g", "train");
      if (!has(p, "topped") && !flip) add(addDays(b, 25), "Top above the 5th node (optional)", "Gives you 2 main colas. Skip if the plant looks stressed.", "g", "train");
      if (!flip) {
        const pf = addDays(b, 14 + vegWeeks(p) * 7);
        add(addDays(pf, -1), "Defoliate + lollipop before flip", "Strip the bottom third and the big fan leaves shading bud sites.", "g", "train");
        add(pf, "Flip lights to 12/12", `Planned after ${vegWeeks(p)} weeks of veg. Flip when the canopy fills ~50–60% of the tent.`, "w");
        const ph = addDays(pf, flowerWeeks(p) * 7);
        add(ph, "Projected harvest", `About ${flowerWeeks(p)} weeks after flip (strain dependent).`, "m");
      } else {
        if (!has(p, "first_pistils")) add(addDays(flip, 10), "Watch for pistils", "Pistils usually show 7–14 days after flip. Remove any males right away.");
        add(addDays(flip, 21), "Second defoliation (day 21)", "Last big clean-up before buds bulk.", "g", "train");
        add(addDays(flip, 21), "Check for 'bananas' (herms) every few days", "Look inside the buds weekly until harvest.", "m");
        add(addDays(flip, (flowerWeeks(p) - 2) * 7), "Start checking trichomes", "Check every 2–3 days with a loupe.", "g", "look");
        add(addDays(flip, (flowerWeeks(p) - 1) * 7), "Begin finish (optional plain-water flush)", "Plain pH'd water + Sledgehammer at label rate.");
        add(addDays(flip, flowerWeeks(p) * 7), "Projected harvest", "Chop when trichomes are mostly milky with 10–30% amber.", "w");
      }
    }
    // weekly test + watering rhythm
    const logs = (p.logs || []).slice().sort((a, c) => c.date.localeCompare(a.date));
    const lastTest = logs.find(l => l.ph || l.rph || l.rppm);
    const testDue = lastTest ? addDays(parse(lastTest.date), 7) : t0;
    add(testDue < t0 ? t0 : testDue, "Test pH & runoff PPM", "Input pH 6.3–6.8. Runoff pH 6.2–6.8. Runoff PPM shouldn't run way higher than what you feed.", testDue < t0 ? "w" : "g", "feed");
    const lastW = logs.find(l => l.kind === "feed" || l.kind === "water");
    if (lastW) { const ch = chartFor(p); const nxt = lastW.kind === "feed" || ch.plain ? "plain pH'd water" : "nutrients (see Feeding)"; add(addDays(parse(lastW.date), 3), `Next watering: ${nxt}`, "Lift the pot. Water only when it feels light. Typically every 2–4 days.", "g", "feed"); }
  }
  if (hv) {
    if (!has(p, "dry_done")) add(addDays(hv, 7), "Snap test the stems", "Small stems should snap, not bend. Usually 7–14 days at 60°F/60% RH.");
    if (!has(p, "jarred")) add(addDays(hv, 10), "Trim + jar", "Fill jars ¾ full with a 62% humidity pack.");
    const j = evDate(p, "jarred");
    if (j && !has(p, "cure_done")) { add(t0 < addDays(j, 14) ? t0 : null, "Burp the jars", "Open 10–15 min daily for the first 2 weeks.", "g"); add(addDays(j, 28), "Cure milestone: 4 weeks", "Smoke-ready; flavor keeps improving to 6–8 weeks."); }
  }
  return T.filter(x => diff(x.date, t0) <= horizon);
}

/* ---------------- photos (IndexedDB) ---------------- */
let dbP;
function db() { if (!dbP) dbP = new Promise((res, rej) => { try { const r = indexedDB.open("growlog-photos", 1); r.onupgradeneeded = () => r.result.createObjectStore("photos", { keyPath: "id" }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }); return dbP; }
async function photoPut(rec) { const d = await db(); return new Promise((res, rej) => { const tx = d.transaction("photos", "readwrite"); tx.objectStore("photos").put(rec); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); }
async function photoAll(pid) { try { const d = await db(); return await new Promise((res) => { const r = d.transaction("photos").objectStore("photos").getAll(); r.onsuccess = () => res(r.result.filter(x => x.plantId === pid).sort((a, b) => b.date.localeCompare(a.date))); r.onerror = () => res([]); }); } catch (e) { return []; } }
async function photoDel(id) { const d = await db(); return new Promise(res => { const tx = d.transaction("photos", "readwrite"); tx.objectStore("photos").delete(id); tx.oncomplete = res; }); }
function compress(file) { return new Promise((res, rej) => { const img = new Image(); img.onload = () => { const s = Math.min(1, 1000 / Math.max(img.width, img.height)); const c = document.createElement("canvas"); c.width = img.width * s; c.height = img.height * s; c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL("image/jpeg", 0.72)); URL.revokeObjectURL(img.src); }; img.onerror = rej; img.src = URL.createObjectURL(file); }); }

/* ---------------- leaf illustrations ---------------- */
function leafSVG(pattern = "healthy") {
  const angles = [-78, -52, -26, 0, 26, 52, 78], lens = [42, 66, 86, 100, 86, 66, 42];
  const droop = pattern === "droopy" || pattern === "limp";
  const G = { healthy: "#3f9d4a", dark: "#2c6b3a", yellow: "#d8c94a", pale: "#9fcf74", brown: "#8a5a2b", purple: "#6f3f8f", white: "#efeac0", grey: "#7b7466" };
  let base = G.healthy;
  if (pattern === "uniformYellow") base = G.yellow;
  if (pattern === "darkPurple" || pattern === "droopy") base = G.dark;
  if (pattern === "bleached") base = G.white;
  if (pattern === "limp") base = G.pale;
  let defs = "", body = "";
  angles.forEach((a0, i) => {
    const a = droop ? a0 * 0.55 + 180 - (a0 < 0 ? -10 : 10) * 0 : a0;
    const L = lens[i] * (pattern === "limp" ? 0.95 : 1), w = (pattern === "taco" ? 7 : pattern === "limp" ? 8 : 11) * (L / 100) + 3;
    const path = `M0,0 Q${w},${-L * 0.45} 0,${-L} Q${-w},${-L * 0.45} 0,0Z`;
    const id = `lf${pattern}${i}${Math.random().toString(36).slice(2, 6)}`;
    defs += `<clipPath id="${id}"><path d="${path}"/></clipPath>`;
    let inner = `<path d="${path}" fill="${base}"/>`;
    const veins = (col, sw) => { let v = `<line x1="0" y1="0" x2="0" y2="${-L}" stroke="${col}" stroke-width="${sw}"/>`; for (let k = 1; k < 6; k++) { const y = -L * k / 6; v += `<line x1="0" y1="${y}" x2="${w}" y2="${y - L * 0.1}" stroke="${col}" stroke-width="${sw * 0.7}"/><line x1="0" y1="${y}" x2="${-w}" y2="${y - L * 0.1}" stroke="${col}" stroke-width="${sw * 0.7}"/>`; } return v; };
    let over = "";
    switch (pattern) {
      case "interveinalOld": case "interveinalNew": inner = `<path d="${path}" fill="${G.yellow}"/>`; over = veins(G.healthy, 2.6); break;
      case "brownEdges": over = `<path d="${path}" fill="none" stroke="${G.yellow}" stroke-width="7"/><path d="${path}" fill="none" stroke="${G.brown}" stroke-width="3"/><rect x="-20" y="${-L - 2}" width="40" height="${L * 0.14}" fill="${G.brown}"/>`; break;
      case "burntTips": over = `<rect x="-20" y="${-L - 2}" width="40" height="${L * 0.16}" fill="${G.brown}"/><rect x="-20" y="${-L * 0.84 - 2}" width="40" height="${L * 0.06}" fill="${G.yellow}"/>`; if (i === 3) inner = `<path d="${path}" fill="${G.dark}"/>`; break;
      case "brownSpots": case "mixed": for (let k = 0; k < 4; k++) { const y = -L * (0.25 + 0.17 * k), x = ((k * 37 + i * 13) % 9 - 4) * w / 9; over += `<circle cx="${x}" cy="${y}" r="${2.6 + (k % 2)}" fill="${G.yellow}"/><circle cx="${x}" cy="${y}" r="${1.6 + (k % 2) * .6}" fill="${G.brown}"/>`; } if (pattern === "mixed") over += `<path d="${path}" fill="none" stroke="${G.yellow}" stroke-width="5"/>`; break;
      case "darkPurple": over = `<ellipse cx="${w * 0.2}" cy="${-L * 0.4}" rx="${w * 0.6}" ry="${L * 0.15}" fill="${G.purple}" opacity=".75"/><circle cx="${-w * 0.3}" cy="${-L * 0.7}" r="2.4" fill="#3a2a1a"/>`; break;
      case "taco": over = `<path d="M${w * 0.9},${-L * 0.45} Q0,${-L * 0.55} ${-w * 0.9},${-L * 0.45}" stroke="${G.pale}" stroke-width="2" fill="none"/>`; break;
      case "rot": if (i >= 2 && i <= 4) over = `<ellipse cx="0" cy="${-L * 0.35}" rx="${w}" ry="${L * 0.25}" fill="${G.grey}"/><ellipse cx="0" cy="${-L * 0.35}" rx="${w * 0.5}" ry="${L * 0.12}" fill="${G.brown}"/>`; break;
      case "uniformYellow": if (i === 3) inner = `<path d="${path}" fill="#c8b93c"/>`; break;
    }
    if (!["interveinalOld", "interveinalNew"].includes(pattern)) over += veins(pattern === "bleached" ? "#d6d0a0" : "rgba(255,255,255,.35)", 1.1);
    body += `<g transform="rotate(${a})"><g clip-path="url(#${id})">${inner}${over}</g><path d="${path}" fill="none" stroke="rgba(0,0,0,.25)" stroke-width=".8"/></g>`;
  });
  const cx = 160, cy = droop ? 70 : 205, stem = droop ? `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 50}" stroke="#4d7c3a" stroke-width="3"/>` : `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy + 30}" stroke="#4d7c3a" stroke-width="3"/>`;
  return `<svg class="leafsvg" viewBox="0 0 320 240" role="img" aria-label="Illustration: ${esc(pattern)} leaf pattern"><defs>${defs}</defs>${stem}<g transform="translate(${cx},${cy})">${body}</g><text x="10" y="232" font-size="10" fill="currentColor" opacity=".55">illustration</text></svg>`;
}
function photoBlock(key) { const ph = C.photos[key]; if (!ph) return ""; return `<img class="photo" loading="lazy" src="${ph.src}" alt="" onerror="this.style.display='none'"><div class="credit">Photo: <a href="${ph.page}" target="_blank" rel="noopener">${esc(ph.credit)}</a></div>`; }

/* ---------------- UI helpers ---------------- */
function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("on"), 1800); }
const TABS = [["today", "Today"], ["weeks", "Week by week"], ["calendar", "Calendar"], ["feed", "Feeding"], ["train", "Training"], ["tent", "Tent"], ["look", "Healthy vs Problems"], ["yield", "Yield"], ["plant", "Plant log"], ["settings", "Settings"]];
function renderNav() { $("#nav").innerHTML = TABS.map(([k, l]) => `<button data-tab="${k}" class="${S.tab === k ? "on" : ""}">${l}</button>`).join(""); }
function renderPick() {
  const sel = $("#plantPick");
  sel.innerHTML = S.plants.length ? S.plants.map(p => `<option value="${p.id}" ${p.id === (plant() || {}).id ? "selected" : ""}>${esc(p.name)}</option>`).join("") : `<option>No plants yet</option>`;
  sel.disabled = !S.plants.length;
}
function go(tab) { S.tab = tab; save(); render(); window.scrollTo(0, 0); }
function applyTheme() { const t = S.settings.theme; if (t === "auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", t); }

function stageBar(p) { const st = stage(p); const idx = STAGE_ORDER.indexOf(st === "done" ? "curing" : st); return `<div class="stagebar">${STAGE_ORDER.map((s, i) => `<span class="${i < idx ? "on" : i === idx ? "now" : ""}" title="${STAGE_LABEL[s]}"></span>`).join("")}</div>`; }
function stagePill(p) { const st = stage(p); const cls = { flower: "p", flush: "w", drying: "w", curing: "g" }[st] || "g"; return `<span class="pill ${cls}">${STAGE_LABEL[st]}</span>`; }

function noPlants() {
  return `<div class="card empty"><div style="font-size:42px">🌱</div><h2>Start your first grow</h2><p class="muted">Add a plant, then log milestones like "germination started" and "seed popped." The app works out your feeding, training, testing and harvest dates from there.</p><button class="btn pri" data-act="addPlant">+ Add a plant</button></div>`;
}

/* ---------------- views ---------------- */
const V = {};

V.today = () => {
  if (!S.plants.length) return noPlants();
  const t0 = today();
  const all = S.plants.flatMap(p => tasksFor(p, 7)).sort((a, b) => a.date - b.date);
  const overdue = all.filter(x => x.date < t0), now = all.filter(x => diff(x.date, t0) === 0), soon = all.filter(x => diff(x.date, t0) > 0);
  const taskHtml = list => list.map(x => `<div class="task"><div class="dot ${x.level}"></div><div style="flex:1"><div class="row between"><b>${esc(x.title)}</b><span class="small muted">${x.date < t0 ? "overdue · " : ""}${fmt(x.date)}</span></div><div class="small muted">${esc(x.plant.name)} — ${esc(x.body)}</div></div>${x.tab ? `<button class="btn sm ghost" data-tab="${x.tab}">Open</button>` : ""}</div>`).join("");
  return `<h1>Today · ${fmtLong(t0)}</h1>
  <div class="grid g2">
    ${S.plants.map(p => plantCard(p)).join("")}
  </div>
  <h2>To-do</h2>
  <div class="card">${(overdue.length + now.length + soon.length) ? taskHtml([...overdue, ...now]) + (soon.length ? `<div class="small muted" style="margin-top:8px;font-weight:700">COMING UP THIS WEEK</div>${taskHtml(soon)}` : "") : `<p class="muted">Nothing due. Enjoy the green.</p>`}</div>
  <h2>Tips for right now</h2>
  <div class="grid g2">${[...new Set(S.plants.map(p => tipKey(p)))].map(k => `<div class="card soft"><h3>${STAGE_LABEL[k] || k}</h3><ul>${(C.tips[k] || []).map(t => `<li>${esc(t)}</li>`).join("")}</ul></div>`).join("")}</div>`;
};
function tipKey(p) { const st = stage(p); return { planning: "germination", germination: "germination", seedling: "seedling", veg: "veg", flower: "flower", flush: "flush", drying: "harvest", curing: "harvest", done: "harvest" }[st]; }

function plantCard(p) {
  const ch = chartFor(p), str = Number(p.strength) || 0.5, gal = Number(p.mixGal) || 1;
  const mix = ch.plain ? [] : mixFor(ch.row, str, gal);
  return `<div class="card">
    <div class="row between"><div><h3 style="margin:0">${esc(p.name)}</h3><div class="small muted">${esc(p.strain || "Unknown strain")} · ${p.type === "auto" ? "Autoflower" : "Photoperiod"}</div></div>${stagePill(p)}</div>
    ${stageBar(p)}
    <div class="small"><b>${weekLabel(p)}</b></div>
    <div style="margin-top:10px" class="small muted">This week's feed ${ch.row ? `· ${esc(ch.row.label)}` : ""} · ${Math.round(str * 100)}% strength · per ${gal} gal</div>
    ${ch.plain ? `<div class="small" style="margin-top:4px">💧 ${esc(ch.why)}</div>` : `<div class="mix" style="margin-top:6px">${mix.map(m => `<div class="mixrow"><span class="swatch" style="background:${m.color}"></span>${m.name}<span class="amt">${tspFmt(m.tsp)} <span class="muted small">(${m.ml.toFixed(1)} mL)</span></span></div>`).join("")}</div>`}
    <div class="row" style="margin-top:12px">
      <button class="btn sm pri" data-act="logWater" data-id="${p.id}">💧 Log watering</button>
      <button class="btn sm" data-act="logEvent" data-id="${p.id}">📅 Log milestone</button>
      <button class="btn sm" data-act="openWeeks" data-id="${p.id}">📍 This week</button>
      <button class="btn sm ghost" data-act="openPlant" data-id="${p.id}">Details →</button>
    </div></div>`;
}

/* ---- week-by-week plan ---- */
function weekPlan(p) {
  const b = baseDate(p);
  const start = b || addDays(evDate(p, "planted") || evDate(p, "popped") || evDate(p, "germ_start") || today(), 4);
  const rowBy = k => C.foxfarm.chart.find(r => r.key === k);
  const hot = p.soil === "oceanforest" ? 21 : p.soil === "happyfrog" ? 14 : 0;
  const W = [];
  const flip = evDate(p, "flip");
  let flowerStart; // week number (1-based) that flower begins
  let total;
  if (p.type === "auto") { total = Math.ceil(autoDays(p) / 7); flowerStart = 6; }
  else { flowerStart = flip ? Math.floor(diff(flip, start) / 7) + 1 : 2 + vegWeeks(p) + 1; total = flowerStart - 1 + flowerWeeks(p); }
  for (let w = 1; w <= total; w++) {
    const ws = addDays(start, (w - 1) * 7), we = addDays(ws, 6);
    let st, row, label;
    if (p.type === "auto") {
      if (w <= 2) { st = "seedling"; row = rowBy("seedling"); }
      else if (w < flowerStart) { st = "veg"; row = rowBy(w === 3 ? "w2" : w === 4 ? "w3" : "w5"); }
      else { st = w === total ? "flush" : "flower"; row = st === "flush" ? rowBy("flush") : rowBy("w" + Math.min(12, w)); }
      label = st === "veg" && w >= 4 ? "Pre-flower / transition" : STAGE_LABEL[st];
    } else {
      if (w <= 2) { st = "seedling"; row = rowBy("seedling"); label = "Seedling"; }
      else if (w < flowerStart) { st = "veg"; const vw = w - 2; row = rowBy("w" + Math.min(4, vw)); label = `Veg week ${vw}`; }
      else { const fw = w - flowerStart + 1; st = fw >= flowerWeeks(p) ? "flush" : "flower"; row = st === "flush" ? rowBy("flush") : rowBy("w" + Math.min(12, 4 + fw)); label = st === "flush" ? `Flower week ${fw} · finish` : `Flower week ${fw}`; }
    }
    const plain = (w - 1) * 7 + 1 <= hot || st === "flush";
    W.push({ w, ws, we, st, row, plain, label, fw: st === "flower" || st === "flush" ? w - flowerStart + 1 : null, isLastVeg: w === flowerStart - 1 });
  }
  const end = addDays(start, total * 7);
  W.push({ w: total + 1, ws: end, we: addDays(end, 9), st: "drying", label: "Harvest & dry", post: true });
  W.push({ w: total + 2, ws: addDays(end, 10), we: addDays(end, 23), st: "curing", label: "Cure (weeks 1–2)", post: true });
  W.push({ w: total + 3, ws: addDays(end, 24), we: addDays(end, 41), st: "curing", label: "Cure (weeks 3–4+)", post: true });
  return { start, weeks: W, projected: !b };
}
function weekNotes(p, wk) {
  const auto = p.type === "auto", w = wk.w, fw = wk.fw;
  const todo = [], look = [], photo = [];
  if (wk.st === "seedling") {
    if (w === 1) { todo.push("Keep the light gentle, RH 65–75%. Water a small ring around the stem only."); look.push("Round cotyledons, then the first serrated leaves. Short, sturdy stem."); photo.push("seedling"); }
    else { todo.push("Second set of true leaves should open. Start a slightly bigger watering ring."); if (auto) todo.push("Late this week: start very gentle LST once 3 nodes show."); look.push("2–3 nodes, tight spacing, even green."); photo.push("ledSeedling"); }
  }
  if (wk.st === "veg") {
    if (auto) {
      todo.push(w === 3 ? "LST: tie the main stem over and keep tucking new tops outward every 2–3 days." : "Keep LST going through the stretch. No big defoliation on autos.");
      if (w === 3) todo.push("Topping (optional, only if very healthy): do it now or never.");
      if (w >= 4) look.push("First white pistils at the nodes = flowering is starting. Log 'First pistils'.");
      photo.push(w >= 4 ? "femalePreflower" : "youngVeg");
    } else {
      const vw = w - 2;
      if (vw === 1) { todo.push("Start LST: bend the main stem over at 3–4 nodes."); todo.push("Transplant out of the solo cup if the roots fill it."); }
      if (vw === 2) todo.push("Top above the 5th node if you want 2 main colas (optional). Let it recover 3–5 days.");
      if (vw >= 2) todo.push("Spread new tops outward every 2–3 days to build a flat canopy.");
      if (vw >= 3) todo.push("Make sure it's in its final pot at least 2 weeks before flip.");
      if (wk.isLastVeg) todo.push("End of this week: defoliate + lollipop, then FLIP lights to 12/12.");
      look.push(vw <= 2 ? "Fast new growth, leaves praying up toward the light." : "Bushy, several tops at the same height, filling the tent.");
      photo.push(vw <= 2 ? "youngVeg" : "vegPair");
    }
    todo.push("Water until 10–20% runoff, then wait until the pot feels light.");
  }
  if (wk.st === "flower") {
    if (!auto) {
      if (fw <= 3) { todo.push("Stretch: the plant may double in height. Keep tucking tops and raise the light as needed."); look.push(fw === 1 ? "Rapid upward growth, no flowers yet." : "White pistils clustering at every top."); photo.push(fw === 1 ? "femalePreflower" : "pistils"); }
      if (fw === 3) todo.push("Day 21: second defoliation. Clear leaves blocking the tops and the inner bud sites.");
      if (fw >= 2) todo.push("Check inside the buds for 'bananas' (herms) once a week.");
      if (fw >= 4) { todo.push("Hands off: remove only yellow/dead leaves. Add trellis or yo-yo support for heavy colas."); look.push("Buds stacking and getting frosty; pistils still mostly white."); photo.push("bud"); }
      if (fw >= flowerWeeks(p) - 2) { todo.push("Check trichomes every 2–3 days with a loupe."); look.push("Pistils darkening and curling in. Trichomes turning from clear to milky."); photo.push("trichomes"); }
    } else {
      todo.push("Light cleanup only. Drop RH as buds fatten.");
      if (w >= Math.ceil(autoDays(p) / 7) - 2) { todo.push("Check trichomes every 2–3 days."); photo.push("trichomes"); } else photo.push("pistils");
      look.push("Buds forming at every tucked top; some lower fan leaves yellowing is normal late.");
    }
    todo.push("Drop humidity at night. Bud rot starts in dense colas.");
  }
  if (wk.st === "flush") { todo.push("Finish: plain pH'd water (Sledgehammer at label rate optional)."); todo.push("Harvest when trichomes are mostly milky with 10–30% amber."); look.push("Fan leaves fading yellow, buds swollen and frosty."); photo.push("trichomes2"); }
  if (wk.st === "drying") { todo.push("Chop, weigh WET, and log it in Yield."); todo.push("Hang in the dark at ~60°F / 60% RH. Snap-test small stems at day 7–14."); todo.push("Trim and jar ¾ full with a 62% humidity pack."); photo.push("drying"); }
  if (wk.st === "curing") { todo.push(wk.label.includes("1–2") ? "Burp jars 10–15 min daily. If buds feel damp, leave the lid off for an hour." : "Burp weekly now. Weigh dry and log your final yield."); photo.push("bud"); }
  const env = { seedling: C.environment[0], veg: C.environment[1], flower: fw && fw <= 3 ? C.environment[2] : C.environment[3], flush: C.environment[4], drying: C.environment[5], curing: null }[wk.st];
  return { todo, look, photo: photo[0], env };
}
V.weeks = () => {
  const p = plant(); if (!p) return noPlants();
  const plan = weekPlan(p), t0 = today();
  const str = Number(p.strength) || .5, gal = Number(p.mixGal) || 1;
  const curIdx = plan.weeks.findIndex(wk => t0 >= wk.ws && t0 <= wk.we);
  return `<div class="row between"><h1>Week by week · ${esc(p.name)}</h1><span class="small muted">${p.type === "auto" ? "Autoflower" : `Photoperiod · ${vegWeeks(p)} wk veg · ${flowerWeeks(p)} wk flower`}</span></div>
  ${plan.projected ? `<div class="card soft small">📅 These dates are projected from ${fmt(plan.start)}. Log <b>Sprouted</b> (or Seed popped / Planted) and they'll lock to your real dates.</div>` : ""}
  <p class="small muted">Tap a week to see exactly what to feed, train, check and expect. Mix amounts are at ${Math.round(str * 100)}% strength for ${gal} gal (change on the Feeding tab).</p>
  <div class="grid" style="gap:8px">${plan.weeks.map((wk, i) => {
    const n = weekNotes(p, wk), here = i === curIdx, past = wk.we < t0;
    const mix = wk.row && !wk.plain ? mixFor(wk.row, str, gal) : [];
    return `<details class="card" ${here ? "open id=\"hereWk\"" : ""} style="${here ? "border-color:var(--accent);border-width:2px" : past ? "opacity:.72" : ""}">
      <summary style="cursor:pointer;list-style:none"><div class="row between"><div class="row"><span class="pill ${here ? "w" : past ? "" : "g"}">${wk.post ? "After" : "Week " + wk.w}</span><b>${esc(wk.label)}</b>${here ? `<span class="pill w">📍 You are here</span>` : ""}</div><span class="small muted">${fmt(wk.ws)} – ${fmt(wk.we)}${past ? " · done" : ""}</span></div></summary>
      <div class="grid g2" style="margin-top:10px">
        <div>
          <h3>🧪 Feeding</h3>
          ${wk.post ? `<p class="small muted">No feeding.</p>` : wk.plain ? `<p class="small">💧 Plain pH'd water (6.3–6.8)${wk.st === "flush" ? ", Sledgehammer at label rate optional." : `. ${p.soil === "oceanforest" ? "Ocean Forest" : "Happy Frog"} is still feeding the plant.`}</p>` : `<div class="mix">${mix.map(m => `<div class="mixrow"><span class="swatch" style="background:${m.color}"></span>${m.name}<span class="amt">${tspFmt(m.tsp)} <span class="muted small">(${m.ml.toFixed(1)} mL)</span></span></div>`).join("")}</div><p class="small muted">Chart: ${esc(wk.row.label)}. Feed, then water, then feed. pH after mixing.</p>`}
          <h3 style="margin-top:12px">✅ To-do this week</h3><ul class="small" style="margin:0;padding-left:18px">${n.todo.map(t => `<li>${esc(t)}</li>`).join("")}${!wk.post ? `<li>Test runoff pH &amp; PPM once this week.</li>` : ""}</ul>
          ${n.env ? `<h3 style="margin-top:12px">🌡️ Tent targets</h3><div class="small">Day ${n.env.dayF}°F · night ${n.env.nightF}°F · RH ${n.env.rh} · VPD ${n.env.vpd}<br><span class="muted">${n.env.light}</span></div>` : ""}
        </div>
        <div>
          ${n.photo ? photoBlock(n.photo) : ""}
          ${n.look.length ? `<h3 style="margin-top:8px">👀 What you should see</h3><ul class="small" style="margin:0;padding-left:18px">${n.look.map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
        </div>
      </div>
      ${here ? `<div class="row" style="margin-top:10px"><button class="btn sm pri" data-act="logWater" data-id="${p.id}">💧 Log watering</button><button class="btn sm" data-act="logEvent" data-id="${p.id}">📅 Log milestone</button></div>` : ""}
    </details>`;
  }).join("")}</div>`;
};

V.calendar = () => {
  if (!S.plants.length) return noPlants();
  const m = S.calMonth ? parse(S.calMonth) : new Date(today().getFullYear(), today().getMonth(), 1);
  const first = new Date(m.getFullYear(), m.getMonth(), 1), start = addDays(first, -first.getDay());
  const items = {};
  const push = (d, html) => { const k = iso(d); (items[k] = items[k] || []).push(html); };
  const filt = S.calPlant || "all";
  S.plants.filter(p => filt === "all" || p.id === filt).forEach(p => {
    const tag = S.plants.length > 1 ? esc(p.name.slice(0, 10)) + ": " : "";
    (p.events || []).forEach(e => push(parse(e.date), `<span class="ev" title="${esc(EVMAP[e.type]?.l)}${e.note ? " – " + esc(e.note) : ""}">${EVMAP[e.type]?.e || ""} ${tag}${esc(EVMAP[e.type]?.l || e.type)}</span>`));
    (p.logs || []).forEach(l => push(parse(l.date), `<span class="ev feed">${l.kind === "feed" ? "🧪 " + tag + "Fed" : l.kind === "water" ? "💧 " + tag + "Water" : "📏 " + tag + "Test"}${l.ph ? " pH " + l.ph : ""}</span>`));
    tasksFor(p).filter(x => x.date >= today() && !/Next watering|Test pH|Burp/.test(x.title)).forEach(x => push(x.date, `<span class="ev proj" title="${esc(x.body)}">${tag}${esc(x.title)}</span>`));
  });
  let cells = "";
  for (let i = 0; i < 42; i++) { const d = addDays(start, i); const k = iso(d); cells += `<div class="day ${d.getMonth() !== m.getMonth() ? "out" : ""} ${k === iso(today()) ? "today" : ""}" data-act="calDay" data-d="${k}" style="cursor:pointer"><div class="num">${d.getDate()}</div>${(items[k] || []).join("")}</div>`; }
  V._calItems = items;
  const p = plant();
  return `<div class="row between"><h1>Grow calendar</h1>
    <div class="row"><select id="calPlant" style="width:auto"><option value="all">All plants</option>${S.plants.map(x => `<option value="${x.id}" ${filt === x.id ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select>
    <button class="btn sm pri" data-act="logEvent" data-id="${p.id}">+ Milestone</button></div></div>
  <div class="row between" style="margin:6px 0 10px"><button class="btn sm" data-act="calPrev">‹</button><b>${first.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</b><div class="row"><button class="btn sm ghost" data-act="calToday">Today</button><button class="btn sm" data-act="calNext">›</button></div></div>
  <div class="cal">${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => `<div class="dow">${d}</div>`).join("")}${cells}</div>
  <div class="small muted" style="margin-top:8px"><span class="ev" style="display:inline-block">Logged milestone</span> <span class="ev feed" style="display:inline-block">Watering/feeding</span> <span class="ev proj" style="display:inline-block">Projected (auto-calculated)</span></div>
  <div class="card" id="dayDetail" style="margin-top:10px"><span class="small muted">Tap a day to see everything on it.</span></div>
  <h2>Timeline · ${esc(p.name)}</h2>${timeline(p)}`;
};
function timeline(p) {
  const ev = (p.events || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const proj = tasksFor(p).filter(x => x.date > today() && /Projected|Flip|Top|LST|defol|Transplant|trichomes|finish/i.test(x.title)).sort((a, b) => a.date - b.date);
  const b = baseDate(p);
  return `<div class="card"><div class="timeline">
    ${ev.map(e => `<div class="tl"><div class="row between"><b>${EVMAP[e.type]?.e || ""} ${esc(EVMAP[e.type]?.l || e.type)}</b><span class="small muted">${fmtLong(parse(e.date))}${b && parse(e.date) >= b ? ` · day ${diff(parse(e.date), b) + 1}` : ""}</span></div>${e.note ? `<div class="small muted">${esc(e.note)}</div>` : ""}<button class="btn sm ghost danger" data-act="delEvent" data-id="${p.id}" data-ev="${e.id}">remove</button></div>`).join("") || `<p class="muted">No milestones yet.</p>`}
    ${proj.map(x => `<div class="tl proj"><div class="row between"><span class="muted"><b>${esc(x.title)}</b> (projected)</span><span class="small muted">${fmtLong(x.date)}</span></div></div>`).join("")}
  </div></div>`;
}

V.feed = () => {
  const p = plant();
  const ff = C.foxfarm;
  const cur = p ? chartFor(p) : null;
  const str = p ? (Number(p.strength) || 0.5) : 0.5, gal = p ? (Number(p.mixGal) || 1) : 1;
  const mix = cur && !cur.plain ? mixFor(cur.row, str, gal) : [];
  return `<h1>FoxFarm feeding</h1>
  ${p ? `<div class="card">
    <div class="row between"><div><h3 style="margin:0">${esc(p.name)} · ${weekLabel(p)}</h3><div class="small muted">${cur.row ? esc(cur.row.label) : ""} ${cur.row && cur.row.ec ? "· chart EC " + cur.row.ec : ""}</div></div>${stagePill(p)}</div>
    <div class="form2" style="margin-top:8px">
      <div><label>Strength: <span id="strLbl">${Math.round(str * 100)}%</span></label><input type="range" min="25" max="100" step="5" value="${Math.round(str * 100)}" id="strength"></div>
      <div><label>Mixing how many gallons?</label><input type="number" min="0.25" step="0.25" value="${gal}" id="mixGal"></div>
    </div>
    ${cur.plain ? `<p>💧 <b>${esc(cur.why)}</b></p>` : `<div class="mix" style="margin-top:10px">${mix.map(m => `<div class="mixrow"><span class="swatch" style="background:${m.color}"></span><div><b>${m.name}</b><div class="small muted">${m.perGal} tsp/gal on the chart</div></div><span class="amt">${tspFmt(m.tsp)} <span class="muted small">(${m.ml.toFixed(1)} mL)</span></span></div>`).join("")}</div>
    <p class="small muted">Then pH to 6.3–6.8. Feed this mix, then give plain pH'd water at the next watering.</p>`}
    <div class="row"><button class="btn sm pri" data-act="logWater" data-id="${p.id}">Log this watering</button></div>
  </div>` : noPlants()}
  <h2>The full soil chart <span class="small muted">(tsp per gallon at 100%)</span></h2>
  <div class="tablewrap"><table><thead><tr><th>Week</th><th>Light</th>${PRODUCTS.map(k => `<th style="color:${ff.products[k].color}">${ff.products[k].name}</th>`).join("")}<th>EC</th></tr></thead>
  <tbody>${ff.chart.map(r => `<tr class="${cur && cur.row && cur.row.key === r.key ? "cur" : ""}"><td><b>${esc(r.label)}</b></td><td>${r.light}</td>${PRODUCTS.map(k => `<td>${r[k] ? r[k] : "—"}</td>`).join("")}<td class="small">${esc(r.ec)}</td></tr>`).join("")}</tbody></table></div>
  <p class="small muted">Autoflowers: the app squeezes this chart into the auto timeline (weeks 1–2 seedling, 3 → veg wk 2, 4 → veg wk 3, week 5 onward → flower chart) and you should keep strength at about 50%.</p>
  <h2>FoxFarm rules of thumb</h2>
  <div class="card"><ul>${ff.rules.map(r => `<li style="margin-bottom:6px">${esc(r)}</li>`).join("")}</ul></div>
  <h2>Your products</h2>
  <div class="grid g3">${Object.values(ff.products).map(x => `<div class="card"><div class="row"><span class="swatch" style="background:${x.color};height:18px"></span><b>${x.name}</b><span class="pill">${x.npk}</span></div><div class="small muted" style="margin-top:4px">${esc(x.note)}</div></div>`).join("")}</div>
  <h2>When to test</h2>
  <div class="card"><table><tbody>
    <tr><td><b>Every feeding</b></td><td>pH of your mixed water (6.3–6.8 for soil). Write down the PPM of the mix.</td></tr>
    <tr><td><b>Once a week</b></td><td>Runoff pH and PPM. Water until 10–20% drains, catch it, and test it.</td></tr>
    <tr><td><b>Runoff PPM ≫ input</b></td><td>Salts are building up. Feed lighter or flush with plain water + Sledgehammer.</td></tr>
    <tr><td><b>Runoff pH &lt; 6.0 or &gt; 7.0</b></td><td>Lockout risk. Flush with 3× pot volume of pH 6.5 water, then restart at 50%.</td></tr>
    <tr><td><b>Before each phase change</b></td><td>Flip, transition to finishing. Do a runoff check so you start clean.</td></tr>
  </tbody></table></div>`;
};

V.train = () => {
  const p = plant();
  const type = p ? p.type : "photo";
  const list = C.training[type === "auto" ? "auto" : "photo"];
  const n = p ? dayNum(p) : null;
  return `<h1>Training & pruning</h1>
  <div class="chips" style="margin-bottom:10px"><button class="${type !== "auto" ? "on" : ""}" data-act="noop">Photoperiod playbook</button><button class="${type === "auto" ? "on" : ""}" data-act="noop">Autoflower playbook</button></div>
  <p class="muted small">Showing the ${type === "auto" ? "autoflower" : "photoperiod"} playbook for ${p ? esc(p.name) + (n ? ` (day ${n})` : "") : "your plant type"}. Change the plant type in Plant log → Edit.</p>
  <div class="grid g2">${list.map(s => `<div class="card"><span class="pill g">${esc(s.when)}</span><h3 style="margin-top:8px">${esc(s.title)}</h3><p class="small" style="margin:0">${esc(s.body)}</p></div>`).join("")}</div>
  <h2>Big-yield checklist</h2>
  <div class="card"><ul>
    <li><b>Flat, even canopy.</b> Every top the same distance from the light. This is the single biggest yield lever in a tent.</li>
    <li><b>Fill the space before flip.</b> Use your veg weeks to spread branches into an empty tent. Bare floor = lost grams.</li>
    <li><b>Right pot size.</b> Photos 5–7 gal, autos 3–5 gal in fabric pots. Root-bound plants stall.</li>
    <li><b>Dial in light.</b> Hit the stage PPFD targets on the Tent tab; most tents are under-lit in flower.</li>
    <li><b>Don't overfeed.</b> FoxFarm at full strength often burns. Healthy at 50–75% beats burnt at 100%.</li>
    <li><b>Lower RH late, cooler nights.</b> Denser, healthier buds and no rot.</li>
    <li><b>Harvest on trichomes, not the calendar.</b> Pulling early is the most common yield-killer.</li>
  </ul></div>`;
};

function vpd(tF, rh, leafOffsetF = 2) {
  const tc = (tF - 32) * 5 / 9, lc = (tF - leafOffsetF - 32) * 5 / 9;
  const svp = t => 0.6108 * Math.exp(17.27 * t / (t + 237.3));
  return svp(lc) - svp(tc) * rh / 100;
}
V.tent = () => {
  const ts = C.tentSizes[S.settings.tent] || C.tentSizes["4x4"];
  return `<h1>AC Infinity tent</h1>
  <div class="grid g3">
    <div class="card"><div class="statlbl">Tent</div><div class="stat">${esc(S.settings.tent)}</div><div class="small muted">${ts.sqft} sq ft · good for ${ts.plants} plants</div></div>
    <div class="card"><div class="statlbl">Your light</div><div class="stat">${S.settings.watts || "?"} W</div><div class="small muted">Typical for this size: ${ts.watts} W LED (actual draw)</div></div>
    <div class="card"><div class="statlbl">Watts / sq ft</div><div class="stat">${S.settings.watts ? (S.settings.watts / ts.sqft).toFixed(0) : "?"}</div><div class="small muted">30–40 W/sq ft of good LED is ideal for flower</div></div>
  </div>
  <p class="small muted">Change tent size and light wattage in Settings.</p>
  <h2>Targets by stage</h2>
  <div class="tablewrap"><table><thead><tr><th>Stage</th><th>Day °F</th><th>Night °F</th><th>RH</th><th>VPD kPa</th><th>Light</th><th>Sweet spot</th></tr></thead>
  <tbody>${C.environment.map(e => `<tr><td><b>${e.stage}</b></td><td>${e.dayF}</td><td>${e.nightF}</td><td>${e.rh}</td><td>${e.vpd}</td><td class="small">${e.light}</td><td class="small">${e.sweet}</td></tr>`).join("")}</tbody></table></div>
  <h2>VPD calculator</h2>
  <div class="card"><div class="form2">
    <div><label>Air temp (°F)</label><input type="number" id="vT" value="77"></div>
    <div><label>Humidity (%)</label><input type="number" id="vR" value="60"></div>
    <div><label>Leaf is cooler by (°F) – LED ~2</label><input type="number" id="vL" value="2"></div>
    <div><label>Result</label><div class="stat" id="vOut">–</div><div class="small muted" id="vMsg"></div></div>
  </div></div>
  <h2>Controller & tent setup</h2>
  <div class="card"><ul>${C.acInfinity.map(t => `<li style="margin-bottom:6px">${esc(t)}</li>`).join("")}</ul></div>`;
};
function vpdUpdate() {
  const t = +$("#vT").value, r = +$("#vR").value, l = +$("#vL").value; if (!t || !r) return;
  const v = vpd(t, r, l); $("#vOut").textContent = v.toFixed(2) + " kPa";
  $("#vMsg").textContent = v < 0.4 ? "Too humid – risk of mold, slow growth" : v < 0.8 ? "Seedling / clone range" : v < 1.2 ? "Veg sweet spot" : v < 1.6 ? "Flower sweet spot" : "Too dry – plants stress, raise RH or drop temp";
}

V.look = () => {
  const f = S.lookFilter || "all";
  const groups = [["all", "Everything"], ["healthy", "Healthy"], ["nutrient", "Nutrients"], ["water", "Water & environment"], ["pest", "Pests & mold"]];
  const kind = pr => ["mites", "pm", "gnats", "rot", "male"].includes(pr.id) ? "pest" : ["overwater", "underwater", "light", "heat"].includes(pr.id) ? "water" : "nutrient";
  return `<h1>Healthy vs problems</h1>
  <p class="muted">Compare your plant against these. Photos come from Wikimedia Commons, and the leaf drawings show each problem's pattern. Look at <b>where</b> on the plant it starts (old leaves vs new growth); that's the best clue.</p>
  <div class="chips" style="margin-bottom:12px">${groups.map(([k, l]) => `<button data-act="lookFilter" data-k="${k}" class="${f === k ? "on" : ""}">${l}</button>`).join("")}</div>
  ${f === "all" || f === "healthy" ? `<h2>✅ What healthy looks like</h2><div class="grid g3">
    <div class="card">${leafSVG("healthy")}<h3 style="margin-top:8px">Healthy leaf pattern</h3><p class="small muted" style="margin:0">Even green all the way to the tips, flat leaflets, no spots.</p></div>
    ${C.healthy.map(h => `<div class="card">${photoBlock(h.photo)}<h3 style="margin-top:8px">${esc(h.title)}</h3><p class="small muted" style="margin:0">${esc(h.body)}</p></div>`).join("")}</div>` : ""}
  ${f !== "healthy" ? `<h2>⚠️ Problems</h2><div class="grid g3">${C.problems.filter(pr => f === "all" || kind(pr) === f).map(pr => `<div class="card">
      ${pr.photo ? photoBlock(pr.photo) : ""}${pr.leaf && !pr.photo ? leafSVG(pr.leaf) : ""}
      <h3 style="margin-top:8px">${esc(pr.title)}</h3><span class="pill w">${esc(pr.where)}</span>
      <p class="small" style="margin:8px 0 4px"><b>Looks like:</b> ${esc(pr.look)}</p>
      <p class="small" style="margin:0 0 4px"><b>Fix:</b> ${esc(pr.fix)}</p>
      ${pr.foxfarm && pr.foxfarm !== "—" ? `<p class="small muted" style="margin:0">FoxFarm: ${esc(pr.foxfarm)}</p>` : ""}
      ${pr.leaf && pr.photo ? `<details class="small"><summary>Leaf pattern drawing</summary>${leafSVG(pr.leaf)}</details>` : ""}
    </div>`).join("")}</div>` : ""}`;
};

V.yield = () => {
  if (!S.plants.length) return noPlants();
  const ts = C.tentSizes[S.settings.tent] || C.tentSizes["4x4"], W = Number(S.settings.watts) || 0;
  const active = S.plants.filter(p => !has(p, "harvest") || stage(p) !== "done");
  const rows = S.plants.map(p => {
    const h = p.harvest || {}; const wet = +h.wet || 0, dry = +h.dry || 0;
    return { p, wet, dry, ratio: wet && dry ? dry / wet : null };
  });
  const totDry = rows.reduce((s, r) => s + r.dry, 0), totWet = rows.reduce((s, r) => s + r.wet, 0);
  // rough projection for unharvested plants sharing the tent
  const live = S.plants.filter(p => !has(p, "harvest"));
  const share = live.length ? 1 / Math.max(live.length, 1) : 0;
  const est = p => { const trained = has(p, "lst_start") || has(p, "topped"); const f = (p.type === "auto" ? 0.65 : 1) * (trained ? 1.15 : 1); const lo = W * 0.4 * f * share, hi = W * 0.9 * f * share; return [lo, hi]; };
  return `<h1>Yield</h1>
  <div class="grid g3">
    <div class="card"><div class="statlbl">Total dry</div><div class="stat">${totDry.toFixed(0)} g</div><div class="small muted">${(totDry / 28.35).toFixed(2)} oz</div></div>
    <div class="card"><div class="statlbl">Grams per watt</div><div class="stat">${W && totDry ? (totDry / W).toFixed(2) : "–"}</div><div class="small muted">0.5 = solid · 1.0+ = excellent</div></div>
    <div class="card"><div class="statlbl">Grams per sq ft</div><div class="stat">${totDry ? (totDry / ts.sqft).toFixed(1) : "–"}</div><div class="small muted">${esc(S.settings.tent)} tent</div></div>
  </div>
  <h2>Per plant</h2>
  <div class="tablewrap"><table><thead><tr><th>Plant</th><th>Stage</th><th>Wet (g)</th><th>Dry (g)</th><th>Dry/wet</th><th>Days seed→chop</th><th></th></tr></thead><tbody>
  ${rows.map(r => { const b = baseDate(r.p), hv = evDate(r.p, "harvest"); const e = est(r.p); return `<tr><td><b>${esc(r.p.name)}</b><div class="small muted">${esc(r.p.strain || "")}</div></td><td>${stagePill(r.p)}</td><td>${r.wet || "–"}</td><td>${r.dry || (!hv && W ? `<span class="small muted">est. ${e[0].toFixed(0)}–${e[1].toFixed(0)}</span>` : "–")}</td><td>${r.ratio ? (r.ratio * 100).toFixed(0) + "%" : "–"}</td><td>${b && hv ? diff(hv, b) + 1 : "–"}</td><td><button class="btn sm" data-act="harvestForm" data-id="${r.p.id}">Enter weights</button></td></tr>`; }).join("")}
  </tbody></table></div>
  <p class="small muted">Estimates are a rough guide based on your light (≈0.4–0.9 g per watt split across plants in the tent). Autos and untrained plants run lower, and LST/topping gives a bump. Dry weight usually comes out to 20–25% of wet.</p>
  ${totWet ? "" : `<div class="card soft"><b>How to log yield:</b> weigh the whole plant (or the branches) right after the chop for <b>wet</b>, then again after trimming and drying for <b>dry</b>.</div>`}`;
};

V.plant = () => {
  const p = plant(); if (!p) return noPlants();
  const logs = (p.logs || []).slice().sort((a, b) => b.date.localeCompare(a.date));
  setTimeout(async () => { const ph = await photoAll(p.id); const el = $("#thumbs"); if (el) el.innerHTML = ph.length ? ph.map(x => `<div><img src="${x.data}" alt=""><div class="row between small muted"><span>${fmt(parse(x.date))}${baseDate(p) ? " · d" + (diff(parse(x.date), baseDate(p)) + 1) : ""}</span><button class="btn sm ghost danger" data-act="delPhoto" data-ph="${x.id}">×</button></div></div>`).join("") : `<p class="muted small">No photos yet. Take one every few days to see progress.</p>`; }, 0);
  return `<div class="row between"><h1>${esc(p.name)}</h1><div class="row"><button class="btn sm" data-act="editPlant" data-id="${p.id}">Edit</button><button class="btn sm danger" data-act="delPlant" data-id="${p.id}">Delete</button></div></div>
  <div class="card"><div class="row between"><div class="small muted">${esc(p.strain || "Unknown strain")} · ${p.type === "auto" ? "Autoflower" : "Photoperiod"} · ${p.pot || "?"} gal · ${({ oceanforest: "Ocean Forest", happyfrog: "Happy Frog", other: "Other soil" })[p.soil] || ""}</div>${stagePill(p)}</div>${stageBar(p)}<b>${weekLabel(p)}</b>
  <div class="row" style="margin-top:10px"><button class="btn sm pri" data-act="logWater" data-id="${p.id}">💧 Log watering / test</button><button class="btn sm" data-act="logEvent" data-id="${p.id}">📅 Log milestone</button><label class="btn sm" style="margin:0;color:var(--ink)">📷 Add photo<input type="file" accept="image/*" capture="environment" id="photoIn" class="hide"></label></div></div>
  <h2>Milestones</h2>${timeline(p)}
  <h2>Photo journal</h2><div class="card"><div class="thumbs" id="thumbs">Loading…</div></div>
  <h2>Watering & test log</h2>
  <div class="tablewrap"><table><thead><tr><th>Date</th><th>Type</th><th>Gal</th><th>pH in</th><th>PPM in</th><th>Runoff pH</th><th>Runoff PPM</th><th>Temp/RH</th><th>Notes</th><th></th></tr></thead><tbody>
  ${logs.map(l => `<tr><td>${fmt(parse(l.date))}</td><td>${l.kind === "feed" ? "🧪 Feed" : l.kind === "water" ? "💧 Water" : "📏 Test"}${l.mix ? `<div class="small muted">${esc(l.mix)}</div>` : ""}</td><td>${l.gal || ""}</td><td>${l.ph || ""}</td><td>${l.ppm || ""}</td><td class="${l.rph && (l.rph < 6 || l.rph > 7) ? "" : ""}">${l.rph ? `<span class="pill ${l.rph < 6 || l.rph > 7 ? "b" : "g"}">${l.rph}</span>` : ""}</td><td>${l.rppm || ""}</td><td class="small">${l.temp ? l.temp + "°F" : ""}${l.rh ? " / " + l.rh + "%" : ""}</td><td class="small">${esc(l.note || "")}</td><td><button class="btn sm ghost danger" data-act="delLog" data-id="${p.id}" data-log="${l.id}">×</button></td></tr>`).join("") || `<tr><td colspan="10" class="muted">No waterings logged yet.</td></tr>`}
  </tbody></table></div>`;
};

V.settings = () => `<h1>Settings</h1>
  <div class="card"><div class="form2">
    <div><label>AC Infinity tent size</label><select id="setTent">${Object.keys(C.tentSizes).map(k => `<option ${S.settings.tent === k ? "selected" : ""}>${k}</option>`).join("")}</select></div>
    <div><label>Light wattage (actual draw)</label><input type="number" id="setWatts" value="${S.settings.watts || ""}"></div>
    <div><label>Theme</label><select id="setTheme">${["auto", "light", "dark"].map(k => `<option ${S.settings.theme === k ? "selected" : ""}>${k}</option>`).join("")}</select></div>
  </div></div>
  <h2>Backup</h2>
  <div class="card"><p class="small muted">Your logs live in this browser only. Export a backup file now and then, and use Import to move it to another phone or computer. Photos stay on the device and aren't in the backup.</p>
  <div class="row"><button class="btn pri" data-act="export">⬇ Export backup</button><label class="btn" style="margin:0;color:var(--ink)">⬆ Import backup<input type="file" accept="application/json" id="importIn" class="hide"></label><button class="btn danger" data-act="wipe">Erase all data</button></div></div>
  <h2>About this content</h2>
  <div class="card small"><p>Content version ${C.version}, last reviewed ${C.lastReviewed}. The grow guide content is refreshed on a schedule.</p><ul>${C.sources.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`).join("")}</ul></div>`;

/* ---------------- dialogs ---------------- */
function openDlg(html, onSubmit) {
  const d = $("#dlg"), f = $("#dlgForm"); f.innerHTML = html + `<div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn" value="cancel" formnovalidate>Cancel</button><button class="btn pri" value="ok">Save</button></div>`;
  f.onsubmit = e => { const sub = e.submitter && e.submitter.value; if (sub !== "ok") return; const fd = Object.fromEntries(new FormData(f)); onSubmit(fd); };
  d.showModal();
}
function plantForm(p = {}) {
  const isNew = !p.id;
  openDlg(`<h2 style="margin-top:0">${isNew ? "Add a plant" : "Edit plant"}</h2>
    <label>Name</label><input name="name" required value="${esc(p.name || "Plant " + (S.plants.length + 1))}">
    <label>Strain</label><input name="strain" value="${esc(p.strain || "")}" placeholder="e.g. Blue Dream">
    <div class="form2">
      <div><label>Seed type</label><select name="type"><option value="photo" ${p.type !== "auto" ? "selected" : ""}>Photoperiod</option><option value="auto" ${p.type === "auto" ? "selected" : ""}>Autoflower</option></select></div>
      <div><label>FoxFarm soil</label><select name="soil">${[["oceanforest", "Ocean Forest"], ["happyfrog", "Happy Frog"], ["other", "Other / mix"]].map(([k, l]) => `<option value="${k}" ${p.soil === k ? "selected" : ""}>${l}</option>`).join("")}</select></div>
      <div><label>Final pot (gal)</label><input name="pot" type="number" step="0.5" value="${p.pot || 5}"></div>
      <div><label>Feeding strength %</label><input name="strength" type="number" min="25" max="100" step="5" value="${Math.round((p.strength || 0.5) * 100)}"></div>
      <div><label>Planned veg weeks (photo)</label><input name="vegWeeks" type="number" min="2" max="16" value="${p.vegWeeks || 5}"></div>
      <div><label>Flower weeks (photo, from breeder)</label><input name="flowerWeeks" type="number" min="6" max="16" value="${p.flowerWeeks || 9}"></div>
      <div><label>Seed-to-harvest days (auto)</label><input name="autoDays" type="number" min="55" max="120" value="${p.autoDays || 77}"></div>
      ${isNew ? `<div><label>Germination started on</label><input name="germ" type="date" value=""></div>` : ""}
    </div>`, fd => {
    const o = isNew ? { id: uid(), events: [], logs: [], created: iso(today()) } : p;
    Object.assign(o, { name: fd.name.trim() || "Plant", strain: fd.strain.trim(), type: fd.type, soil: fd.soil, pot: +fd.pot, strength: Math.min(1, Math.max(.25, (+fd.strength || 50) / 100)), vegWeeks: +fd.vegWeeks, flowerWeeks: +fd.flowerWeeks, autoDays: +fd.autoDays });
    if (isNew) { if (fd.germ) o.events.push({ id: uid(), type: "germ_start", date: fd.germ, note: "" }); S.plants.push(o); S.current = o.id; }
    save(); render(); toast(isNew ? "Plant added" : "Saved");
  });
}
function eventForm(p) {
  const done = new Set((p.events || []).map(e => e.type));
  const next = EV.find(([k]) => !done.has(k) && k !== "note" && !(p.type === "auto" && k === "flip"));
  openDlg(`<h2 style="margin-top:0">Log a milestone · ${esc(p.name)}</h2>
    <label>What happened?</label><select name="type">${EV.filter(([k]) => !(p.type === "auto" && k === "flip")).map(([k, e, l]) => `<option value="${k}" ${next && next[0] === k ? "selected" : ""}>${e} ${l}${done.has(k) && k !== "note" && k !== "defoliate" && k !== "transplant" ? " ✓" : ""}</option>`).join("")}</select>
    <label>Date</label><input type="date" name="date" value="${iso(today())}" required>
    <label>Notes</label><textarea name="note" placeholder="optional"></textarea>`, fd => {
    p.events.push({ id: uid(), type: fd.type, date: fd.date, note: fd.note.trim() });
    save(); render(); toast("Milestone logged");
  });
}
function waterForm(p) {
  const ch = chartFor(p), str = Number(p.strength) || .5, gal = Number(p.mixGal) || 1;
  const logs = (p.logs || []).slice().sort((a, b) => b.date.localeCompare(a.date));
  const lastKind = logs.find(l => l.kind !== "test")?.kind;
  const suggest = ch.plain ? "water" : lastKind === "feed" ? "water" : "feed";
  const mixTxt = ch.plain ? "" : mixFor(ch.row, str, 1).map(m => `${m.name} ${tspFmt(m.tsp)}/gal`).join(", ");
  openDlg(`<h2 style="margin-top:0">Log watering · ${esc(p.name)}</h2>
    <div class="form2">
      <div><label>Type</label><select name="kind"><option value="feed" ${suggest === "feed" ? "selected" : ""}>🧪 Nutrients</option><option value="water" ${suggest === "water" ? "selected" : ""}>💧 Plain water</option><option value="test">📏 Test only</option></select></div>
      <div><label>Date</label><input type="date" name="date" value="${iso(today())}"></div>
      <div><label>Gallons given</label><input name="gal" type="number" step="0.1" value="${gal}"></div>
      <div><label>pH going in</label><input name="ph" type="number" step="0.1" placeholder="6.5"></div>
      <div><label>PPM going in</label><input name="ppm" type="number" placeholder="optional"></div>
      <div><label>Runoff pH</label><input name="rph" type="number" step="0.1" placeholder="weekly"></div>
      <div><label>Runoff PPM</label><input name="rppm" type="number" placeholder="weekly"></div>
      <div><label>Tent temp °F / RH %</label><div class="row" style="flex-wrap:nowrap"><input name="temp" type="number" placeholder="°F"><input name="rh" type="number" placeholder="%"></div></div>
    </div>
    ${mixTxt ? `<p class="small muted">Suggested mix (${Math.round(str * 100)}%): ${esc(mixTxt)}</p>` : `<p class="small muted">${esc(ch.why || "")}</p>`}
    <label>Notes</label><textarea name="note" placeholder="leaf color, smells, anything odd"></textarea>`, fd => {
    const num = v => v === "" || v == null ? null : +v;
    p.logs.push({ id: uid(), kind: fd.kind, date: fd.date, gal: num(fd.gal), ph: num(fd.ph), ppm: num(fd.ppm), rph: num(fd.rph), rppm: num(fd.rppm), temp: num(fd.temp), rh: num(fd.rh), note: fd.note.trim(), mix: fd.kind === "feed" ? mixTxt : "" });
    const warn = [];
    if (num(fd.rph) && (num(fd.rph) < 6 || num(fd.rph) > 7)) warn.push("Runoff pH is out of range. See Feeding → When to test.");
    if (num(fd.ph) && (num(fd.ph) < 6.2 || num(fd.ph) > 7)) warn.push("Input pH should be 6.3–6.8 for soil.");
    if (num(fd.ppm) && num(fd.rppm) && num(fd.rppm) > num(fd.ppm) * 1.5) warn.push("Runoff PPM is much higher than input, so salts are building up. Feed lighter or flush.");
    save(); render(); toast(warn[0] || "Logged");
  });
}
function harvestForm(p) {
  const h = p.harvest || {};
  openDlg(`<h2 style="margin-top:0">Harvest weights · ${esc(p.name)}</h2>
    <div class="form2"><div><label>Wet weight (g)</label><input name="wet" type="number" value="${h.wet || ""}"></div><div><label>Dry trimmed weight (g)</label><input name="dry" type="number" value="${h.dry || ""}"></div></div>
    ${has(p, "harvest") ? "" : `<label>Chop date (logs the Harvest milestone)</label><input type="date" name="date" value="${iso(today())}">`}`, fd => {
    p.harvest = { wet: +fd.wet || 0, dry: +fd.dry || 0 };
    if (fd.date && !has(p, "harvest") && (fd.wet || fd.dry)) p.events.push({ id: uid(), type: "harvest", date: fd.date, note: "" });
    save(); render(); toast("Saved");
  });
}

/* ---------------- render & events ---------------- */
function render() {
  if (S.current && !S.plants.find(p => p.id === S.current)) S.current = S.plants[0]?.id || null;
  if (!S.current && S.plants[0]) S.current = S.plants[0].id;
  renderNav(); renderPick(); applyTheme();
  $("#verTag").textContent = "v" + C.version;
  $("#view").innerHTML = (V[S.tab] || V.today)();
  if (S.tab === "weeks" && !render._noScroll) { const h = $("#hereWk"); if (h) setTimeout(() => h.scrollIntoView({ block: "start", behavior: "smooth" }), 50); }
  if (S.tab === "tent") { ["vT", "vR", "vL"].forEach(id => $("#" + id).addEventListener("input", vpdUpdate)); vpdUpdate(); }
}

document.addEventListener("click", async e => {
  const t = e.target.closest("[data-tab],[data-act]"); if (!t) return;
  if (t.dataset.tab) return go(t.dataset.tab);
  const a = t.dataset.act, p = S.plants.find(x => x.id === t.dataset.id);
  if (a === "addPlant") plantForm();
  if (a === "editPlant") plantForm(p);
  if (a === "openPlant") { S.current = p.id; go("plant"); }
  if (a === "openWeeks") { S.current = p.id; go("weeks"); }
  if (a === "logEvent") eventForm(p || plant());
  if (a === "logWater") waterForm(p || plant());
  if (a === "harvestForm") harvestForm(p);
  if (a === "delPlant" && confirm(`Delete ${p.name} and all its logs?`)) { S.plants = S.plants.filter(x => x !== p); save(); render(); }
  if (a === "delEvent") { p.events = p.events.filter(x => x.id !== t.dataset.ev); save(); render(); }
  if (a === "delLog") { p.logs = p.logs.filter(x => x.id !== t.dataset.log); save(); render(); }
  if (a === "delPhoto" && confirm("Delete this photo?")) { await photoDel(t.dataset.ph); render(); }
  if (a === "calPrev" || a === "calNext") { const m = S.calMonth ? parse(S.calMonth) : new Date(today().getFullYear(), today().getMonth(), 1); S.calMonth = iso(new Date(m.getFullYear(), m.getMonth() + (a === "calNext" ? 1 : -1), 1)); save(); render(); }
  if (a === "calDay") { const k = t.dataset.d, its = (V._calItems || {})[k] || []; $("#dayDetail").innerHTML = `<b>${fmtLong(parse(k))}</b><div style="margin-top:6px;display:grid;gap:4px">${its.length ? its.join("").replace(/class="ev/g, 'style="white-space:normal;font-size:13px" class="ev') : '<span class="muted small">Nothing logged or projected.</span>'}</div>`; $("#dayDetail").scrollIntoView({ block: "nearest", behavior: "smooth" }); }
  if (a === "calToday") { S.calMonth = null; save(); render(); }
  if (a === "lookFilter") { S.lookFilter = t.dataset.k; save(); render(); }
  if (a === "export") { const blob = new Blob([JSON.stringify({ app: "growlog", exported: new Date().toISOString(), plants: S.plants, settings: S.settings }, null, 2)], { type: "application/json" }); const u = URL.createObjectURL(blob); const l = document.createElement("a"); l.href = u; l.download = `growlog-backup-${iso(today())}.json`; l.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); }
  if (a === "wipe" && confirm("Erase ALL plants and logs from this browser? Export a backup first!")) { S = defaults(); save(); render(); }
});
$("#addPlantBtn").addEventListener("click", () => plantForm());
$("#plantPick").addEventListener("change", e => { S.current = e.target.value; save(); render(); });
document.addEventListener("change", async e => {
  const id = e.target.id, p = plant();
  if (id === "strength" || id === "mixGal") { if (id === "strength") p.strength = +e.target.value / 100; else p.mixGal = Math.max(.25, +e.target.value || 1); save(); render(); }
  if (id === "setTent") { S.settings.tent = e.target.value; save(); render(); }
  if (id === "setWatts") { S.settings.watts = +e.target.value || 0; save(); render(); }
  if (id === "setTheme") { S.settings.theme = e.target.value; save(); render(); }
  if (id === "calPlant") { S.calPlant = e.target.value; save(); render(); }
  if (id === "photoIn" && e.target.files[0]) { try { const data = await compress(e.target.files[0]); await photoPut({ id: uid(), plantId: p.id, date: iso(today()), data }); toast("Photo saved"); render(); } catch (err) { toast("Couldn't save photo"); } }
  if (id === "importIn" && e.target.files[0]) { try { const j = JSON.parse(await e.target.files[0].text()); if (!Array.isArray(j.plants)) throw 0; if (!confirm(`Import ${j.plants.length} plant(s)? This replaces current data.`)) return; S.plants = j.plants; S.settings = Object.assign(S.settings, j.settings || {}); S.current = null; save(); render(); toast("Imported"); } catch (err) { toast("That file isn't a GrowLog backup"); } }
});
document.addEventListener("input", e => { if (e.target.id === "strength") $("#strLbl").textContent = e.target.value + "%"; });

// expose a few internals for testing
window.__growlog = { chartFor, stage, tasksFor, mixFor, tspFmt, vpd, get S() { return S; } };
render();
})();
