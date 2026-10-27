// widget-app.js — 菜单组件逻辑：接收 show_menu 数据，点菜，生成服务员卡片

/* ========== 界面文案 ========== */

const TEXT = {
  zh: {
    required: "必选", optional: "可选", pick: "请选择",
    search: "搜索菜名或编号", items: "项", cats: "类", noResult: "没有找到",
    selected: "已选", none: "还没选菜", total: "小计", incomplete: "部分价格未知，合计不完整",
    card: "生成卡片", showWaiter: "给服务员看", back: "返回修改", close: "返回",
    placedBtn: "服务员已记下", placedLine: (n, sum) => `已下单 ${n} 项 · ${sum}`, bill: "结账卡片",
    portion: (i) => `第 ${i} 份`, split: "+ 另一份不同要求",
    addEnglish: "We'd like to add these, please.",
    mustTry: "必尝", loadingMore: "正在整理…", choices: "可选", needs: "需选", picked: "你勾选的菜品有：", ordered: "已点的菜品：", priceNote: "金额仅供参考，具体以菜单和账单为准",
  },
  en: {
    required: "Required", optional: "Optional", pick: "Choose",
    search: "Search name or number", items: "items", cats: "categories", noResult: "No match",
    selected: "Selected", none: "Nothing selected", total: "Subtotal", incomplete: "Some prices unknown; total incomplete",
    card: "Waiter card", showWaiter: "Show the waiter", back: "Edit", close: "Back",
    placedBtn: "Waiter has it", placedLine: (n, sum) => `Ordered ${n} · ${sum}`, bill: "Bill card",
    portion: (i) => `Portion ${i}`, split: "+ Another with different requests",
    addEnglish: "We'd like to add these, please.",
    mustTry: "Must-try", loadingMore: "Loading…", choices: "Options", needs: "Choose", picked: "Your picks:", ordered: "Ordered:", priceNote: "Amounts are estimates; the menu and bill prevail.",
  },
  ja: {
    required: "必須", optional: "任意", pick: "選んでください",
    search: "料理名・番号で検索", items: "品", cats: "カテゴリ", noResult: "見つかりません",
    selected: "選択中", none: "まだ選んでいません", total: "小計", incomplete: "価格不明あり、合計は概算",
    card: "注文カード", showWaiter: "店員さんに見せる", back: "戻って修正", close: "戻る",
    placedBtn: "店員さんに伝えた", placedLine: (n, sum) => `注文済み ${n} 品 · ${sum}`, bill: "会計カード",
    portion: (i) => `${i} つ目`, split: "+ 別の要望でもう一つ",
    addEnglish: "We'd like to add these, please.",
    mustTry: "名物", loadingMore: "整理中…", choices: "選べる", needs: "要選択", picked: "選んだ料理：", ordered: "注文済みの料理：", priceNote: "金額は目安です。メニューと会計を優先してください。",
  },
  ko: {
    required: "필수", optional: "선택", pick: "골라 주세요",
    search: "메뉴명 또는 번호 검색", items: "개", cats: "분류", noResult: "결과 없음",
    selected: "선택함", none: "아직 선택하지 않았어요", total: "소계", incomplete: "가격 미확인 항목 있음",
    card: "주문 카드", showWaiter: "직원에게 보여주기", back: "수정", close: "뒤로",
    placedBtn: "직원이 받아 적음", placedLine: (n, sum) => `주문 ${n}개 · ${sum}`, bill: "계산 카드",
    portion: (i) => `${i}번째`, split: "+ 다른 요청으로 하나 더",
    addEnglish: "We'd like to add these, please.",
    mustTry: "꼭 먹어볼 것", loadingMore: "정리 중…", choices: "선택 가능", needs: "필수 선택", picked: "선택한 메뉴:", ordered: "주문한 메뉴:", priceNote: "금액은 참고용이며 메뉴판과 계산서가 기준입니다.",
  },
};

let lang = "zh";
let T = TEXT.zh;

/** 按用户语言切换界面文案；lang 为 BCP 47 代码，没有对应文案时用英文 */
function setLanguage(code) {
  const base = String(code).toLowerCase().split("-")[0];
  lang = TEXT[base] ? base : "en";
  T = TEXT[lang];
}

setLanguage(document.documentElement.lang || navigator.language || "zh");

/* ========== 工具函数 ========== */

const $ = (id) => document.getElementById(id);

const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
));

/* ========== 宿主通信（MCP Apps，JSON-RPC over postMessage） ========== */

let rpcId = 0;
const pending = new Map();

function notify(method, params) {
  window.parent.postMessage({ jsonrpc: "2.0", method, params }, "*");
}

function request(method, params) {
  return new Promise((resolve, reject) => {
    const id = ++rpcId;
    pending.set(id, { resolve, reject });
    window.parent.postMessage({ jsonrpc: "2.0", id, method, params }, "*");
  });
}

window.addEventListener("message", (event) => {
  if (event.source !== window.parent) return;
  const msg = event.data;
  if (!msg || msg.jsonrpc !== "2.0") return;

  if (msg.id !== undefined && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(msg.error) : resolve(msg.result);
    return;
  }

  switch (msg.method) {
    case "ui/notifications/tool-result": loadMenu(msg.params?.structuredContent); break;
    case "ui/notifications/tool-input": loadMenu(msg.params?.arguments); break;
    case "ui/notifications/tool-input-partial": loadMenu(msg.params?.arguments, true); break;
    case "ui/notifications/host-context-changed": applyHostContext(msg.params); break;
  }
}, { passive: true });

const ready = request("ui/initialize", {
  appInfo: { name: "menu-helper", version: "1.0.0" },
  appCapabilities: {},
  protocolVersion: "2026-01-26",
})
  .then((result) => {
    applyHostContext(result?.hostContext);
    notify("ui/notifications/initialized", {});
  })
  .catch(() => {});

// 内容高度变化时通知宿主调整 iframe
new ResizeObserver(() => {
  const el = document.documentElement;
  notify("ui/notifications/size-changed", { width: el.scrollWidth, height: el.scrollHeight });
}).observe(document.documentElement);

/** 发送已下单内容给模型，供后续对话（账单、核对小票）使用 */
async function syncOrderToModel() {
  const text = orderSummary();
  await ready;
  try { await request("ui/update-model-context", { content: [{ type: "text", text }] }); } catch {}
}

/** 切换全屏 / 内嵌显示 */
async function setFullscreen(on) {
  await ready;
  const mode = on ? "fullscreen" : "inline";
  try {
    const result = await request("ui/request-display-mode", { mode });
    displayMode = result?.mode || mode;
  } catch {
    try { await window.openai?.requestDisplayMode?.({ mode }); displayMode = mode; } catch {}
  }
  applySafeArea();
}

/* ========== 主题与安全区 ========== */

let hostInsets = null;
let displayMode = "inline";

function applyHostContext(ctx) {
  if (ctx?.theme === "dark" || ctx?.theme === "light") document.documentElement.dataset.theme = ctx.theme;
  if (ctx?.safeAreaInsets) hostInsets = ctx.safeAreaInsets;
  if (ctx?.displayMode) displayMode = ctx.displayMode;
  applySafeArea();
}

/** 全屏时为状态栏和宿主顶栏留白；宿主未提供安全区时顶部留 48px */
function applySafeArea() {
  const host = window.openai || {};
  const insets = hostInsets || host.safeArea?.insets || null;
  const fullscreen = (host.displayMode || displayMode) === "fullscreen";
  const top = insets ? insets.top ?? 0 : 48;
  const bottom = insets?.bottom ?? 0;
  const style = document.documentElement.style;

  document.body.classList.toggle("full", fullscreen);
  style.setProperty("--safe-top", fullscreen ? `max(env(safe-area-inset-top), ${top}px)` : "0px");
  style.setProperty("--safe-bottom", fullscreen ? `max(env(safe-area-inset-bottom), ${bottom}px)` : "0px");
}

window.addEventListener("openai:set_globals", applySafeArea);

/* ========== 状态 ==========
 * 一份点单记录（line）：
 *   { n: 菜品编号, qty: 数量, opt: 必选项下标 | null, ext: [可选项下标], reqs: [通用要求下标] }
 * 同一道菜可有多条 line（不同要求分开写在卡片上）。
 */

let menu = null;
let itemsByNumber = new Map();
let cart = [];         // 未下单
let placed = [];       // 已交给服务员
let round = 0;         // 已下单轮数；>0 时卡片用加菜开场白
let tab = 0;           // 当前分类下标；-1 为“已选”
let query = "";
let view = "menu";     // menu | card | bill
const expanded = new Set();
let loadedSignature = "";
const COURSE_ORDER = ["starter", "main", "side", "other", "dessert", "drink", "alcohol"];
let streaming = false;  // 正在接收模型生成中的部分参数

/** 菜单指纹：换菜单时清空选择，同一菜单刷新时恢复 */
const menuKey = () => `${menu.restaurant}|${[...itemsByNumber.keys()].join(",")}`;

function saveState() {
  try { window.openai?.setWidgetState?.({ key: menuKey(), cart, placed, round }); } catch {}
}

function restoreState() {
  try {
    const saved = window.openai?.widgetState;
    if (saved?.key !== menuKey() || !Array.isArray(saved.cart)) return;
    cart = saved.cart;
    placed = saved.placed || [];
    round = saved.round || 0;
  } catch {}
}

/** 部分参数：只保留已有编号和菜名的菜品，补齐缺省字段 */
function completeItems(data) {
  const categories = (Array.isArray(data.categories) ? data.categories : [])
    .filter((c) => c && typeof c.name === "string")
    .map((c) => ({
      ...c,
      items: (Array.isArray(c.items) ? c.items : [])
        .filter((item) => item && typeof item.n === "number" && typeof item.name === "string")
        .map((item) => ({ original: "", price: "", ...item })),
    }));
  return { restaurant: "", currency: "", ...data, categories };
}

/**
 * 载入 show_menu 数据；同一份数据重复推送时忽略
 * @param {object} data show_menu 参数
 * @param {boolean} partial 模型仍在生成，数据不完整
 */
function loadMenu(data, partial = false) {
  if (!data || (!partial && !Array.isArray(data.categories))) return;
  if (partial && menu && !streaming) return;
  const signature = JSON.stringify(data);
  if (signature === loadedSignature) return;
  loadedSignature = signature;
  if (partial) {
    data = completeItems(data);
    if (!data.categories.length) return;
  }

  // 按上菜顺序排分类，同一类保持原顺序
  const rank = (c) => { const i = COURSE_ORDER.indexOf(c.course); return i < 0 ? COURSE_ORDER.indexOf("other") : i; };
  data = { ...data, categories: data.categories.map((c, i) => [c, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(([c]) => c) };

  const continuing = streaming;
  streaming = partial;
  const previousKey = menu ? menuKey() : "";
  menu = data;
  if (menu.lang) setLanguage(menu.lang);

  itemsByNumber = new Map();
  for (const category of menu.categories) {
    for (const item of category.items) {
      if (item && typeof item.n === "number") itemsByNumber.set(item.n, item);
    }
  }

  if (!continuing && menuKey() !== previousKey) {
    cart = []; placed = []; round = 0; tab = 0;
    expanded.clear();
    restoreState();
  }
  cart = cart.filter((line) => itemsByNumber.has(line.n));

  $("loading").classList.add("hidden");
  view = "menu";
  render();
}

const newLine = (n) => ({ n, qty: 1, opt: null, ext: [], reqs: [] });
const quantityOf = (n) => cart.filter((l) => l.n === n).reduce((sum, l) => sum + l.qty, 0);
const missingChoice = (line) => (itemsByNumber.get(line.n)?.options?.length || 0) > 0 && line.opt == null;
const categoryOf = (n) => menu.categories.findIndex((c) => c.items.some((item) => item.n === n));

function commit() {
  saveState();
  render();
}

/* ========== 金额 ========== */

function formatMoney(value) {
  if (value == null || Number.isNaN(value)) return "?";
  try {
    return new Intl.NumberFormat({ zh: "zh-CN", ja: "ja-JP", ko: "ko-KR" }[lang], { style: "currency", currency: menu.currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${menu.currency}`;
  }
}

/** 合计：未知价格（时价、按重量）计入 unknown */
function totals(lines) {
  let sum = 0, count = 0, unknown = false;
  for (const line of lines) {
    const item = itemsByNumber.get(line.n);
    if (!item) continue;
    count += line.qty;
    if (typeof item.value === "number") sum += item.value * line.qty;
    else unknown = true;
  }
  return { sum, count, unknown };
}

/* ========== 点单记录的附加项 ========== */

/** 一条记录的全部附加，顺序：必选 → 可选 → 通用要求。每项含 label（用户语言）和 local（当地语言） */
function picksOf(line, item) {
  const requests = menu.requests || [];
  const out = [];
  if (line.opt != null && item.options?.[line.opt]) out.push(item.options[line.opt]);
  for (const i of line.ext || []) if (item.extras?.[i]) out.push(item.extras[i]);
  for (const i of line.reqs) if (requests[i]) out.push(requests[i]);
  return out;
}

/** 合并同菜、同选项、同要求的记录 */
function mergeLines(lines) {
  const out = [];
  for (const line of lines) {
    const key = [line.n, line.opt, [...(line.ext || [])].sort(), [...line.reqs].sort()].join("|");
    const hit = out.find((o) => o.key === key);
    if (hit) hit.qty += line.qty;
    else out.push({ ...line, key });
  }
  return out;
}

/** 给模型看的点单摘要 */
function orderSummary() {
  const describe = (lines) => mergeLines(lines).map((line) => {
    const item = itemsByNumber.get(line.n);
    const extra = picksOf(line, item).map((p) => p.label).join(", ");
    return `#${item.n} ${item.name} (${item.original}) x${line.qty}${extra ? ` [${extra}]` : ""}`;
  }).join("; ");
  const t = totals(placed);
  return `Menu Helper order at ${menu.restaurant}. Ordered: ${describe(placed) || "none"}. `
    + `Total ${formatMoney(t.sum)}${t.unknown ? " (incomplete)" : ""}. `
    + `In cart, not yet ordered: ${describe(cart) || "none"}.`;
}

/* ========== 渲染 ========== */

function render() {
  $("menuView").classList.toggle("hidden", view !== "menu");
  $("cardView").classList.toggle("hidden", view === "menu");
  if (view === "menu") renderMenu();
  else renderCard();
}

function renderMenu() {
  renderHeader();
  renderTabs();
  renderList();
  renderBar();
}

/** 必尝菜：优先 mustTry 编号，兼容旧数据的 tag: "must" */
function mustTryItems() {
  if (Array.isArray(menu.mustTry)) return menu.mustTry.map((n) => itemsByNumber.get(n)).filter(Boolean);
  return [...itemsByNumber.values()].filter((item) => item.tag === "must");
}

const isMustTry = (item) => (Array.isArray(menu.mustTry) ? menu.mustTry.includes(item.n) : item.tag === "must");

function renderHeader() {
  const itemCount = itemsByNumber.size;
  const mustTry = mustTryItems();

  $("title").textContent = `📍 ${menu.restaurant}`;
  $("sub").innerHTML = [menu.currency, `${menu.categories.length} ${T.cats}`, `${itemCount} ${T.items}`]
    .filter(Boolean).map(escapeHtml).join(" · ")
    + (streaming ? ` · <span class="live">${T.loadingMore}</span>` : "");
  const about = (menu.cuisine ? `<div class="cuisine">🗺️ ${escapeHtml(menu.cuisine)}</div>` : "")
    + (menu.intro ? `<div class="intro-text">${escapeHtml(menu.intro)}</div>` : "");
  $("intro").innerHTML = (about ? `<div class="intro-box">${about}</div>` : "")
    + (mustTry.length
      ? `<div class="must"><span class="must-label">🏅 ${T.mustTry}</span>${mustTry.map((item) => `<button data-jump="${item.n}">#${item.n} ${escapeHtml(item.name)}</button>`).join("")}</div>`
      : "");
  $("search").placeholder = T.search;

  if (placed.length) {
    const t = totals(placed);
    $("placed").classList.remove("hidden");
    $("placedText").textContent = T.placedLine(t.count, formatMoney(t.sum) + (t.unknown ? " +?" : ""));
    $("billBtn").textContent = T.bill;
  } else {
    $("placed").classList.add("hidden");
  }
}

function renderTabs() {
  const selected = cart.reduce((sum, l) => sum + l.qty, 0);
  if (tab === -1 && !selected) tab = 0;

  const selectedTab = selected
    ? `<button class="tab ${tab === -1 ? "on" : ""}" data-tab="-1">🧾 ${T.selected}<span class="cnt">${selected}</span></button>`
    : "";
  const categoryTabs = menu.categories.map((c, i) =>
    `<button class="tab ${tab === i && !query ? "on" : ""}" data-tab="${i}">${escapeHtml(c.emoji || "")} ${escapeHtml(c.name)}<span class="cnt">${c.items.length}</span></button>`,
  ).join("");
  $("tabs").innerHTML = selectedTab + categoryTabs;
}

/** 当前要显示的分组：搜索结果 / 已选 / 当前分类 */
function visibleGroups() {
  if (query) {
    const q = query.toLowerCase();
    const match = (item) => String(item.n) === q || String(item.code || "") === q
      || item.name.toLowerCase().includes(q) || item.original.toLowerCase().includes(q);
    return menu.categories
      .map((category) => ({ category, items: category.items.filter(match) }))
      .filter((g) => g.items.length);
  }
  if (tab === -1) {
    const numbers = [...new Set(cart.map((l) => l.n))];
    return [{ category: null, items: numbers.map((n) => itemsByNumber.get(n)) }];
  }
  return [{ category: menu.categories[tab], items: menu.categories[tab].items }];
}

function renderList() {
  let html = "";
  for (const { category, items } of visibleGroups()) {
    if (category && (query || category.original)) {
      html += `<div class="cat">${escapeHtml(category.emoji || "")} ${escapeHtml(category.name)} ${escapeHtml(category.original || "")}</div>`;
    }
    for (const item of items) html += itemRow(item);
  }
  if (!html) html = `<div class="empty">${query ? T.noResult : T.none}</div>`;

  const lastTab = tab === menu.categories.length - 1;
  if (!query && lastTab && menu.notes?.length) {
    html += `<div class="notes" style="padding:10px 14px">${menu.notes.map(escapeHtml).join("<br>")}</div>`;
  }
  $("list").innerHTML = html;
}

function itemRow(item) {
  const qty = quantityOf(item.n);
  const badge = isMustTry(item) ? "🏅 " : item.tag === "star" ? "⭐ " : "";
  const needsPick = cart.some((l) => l.n === item.n && missingChoice(l));

  let html = `<div class="row ${qty ? "picked" : ""}" data-n="${item.n}">
    <div class="num">${item.n}</div>
    <div class="main" data-toggle="${item.n}">
      <div class="name-row"><span class="name">${badge}${escapeHtml(item.name)}</span><span class="price">${escapeHtml(item.price)}</span></div>
      ${item.original && item.original !== item.name ? `<div class="orig">${escapeHtml(item.original)}</div>` : ""}
      ${item.allergen ? `<div class="ban">🚫 ${escapeHtml(item.allergen)}</div>` : ""}
      ${item.desc ? `<div class="desc">${escapeHtml(item.desc)}</div>` : ""}
      ${needsPick ? `<div class="need">${T.pick}: ${item.options.map((o) => escapeHtml(o.label)).join(" / ")}</div>` : choiceHint(item)}
    </div>
    <div class="step">
      ${qty ? `<button data-sub="${item.n}" aria-label="−">−</button><span class="q">${qty}</span>` : ""}
      <button class="plus" data-add="${item.n}" aria-label="+">+</button>
    </div>
  </div>`;
  if (qty && expanded.has(item.n)) html += optionsPanel(item);
  return html;
}

/** 适用于这道菜的通用要求（保留原下标）：按菜品 / 饮品筛选，去掉与本菜选项同名的 */
function requestsFor(item) {
  const course = menu.categories[categoryOf(item.n)]?.course;
  const kind = course === "drink" || course === "alcohol" ? "drink" : "food";
  const own = new Set([...(item.options || []), ...(item.extras || [])].map((o) => o.label));
  return (menu.requests || [])
    .map((request, index) => ({ ...request, index }))
    .filter((request) => !request.for || request.for === kind)
    .filter((request) => !own.has(request.label));
}

/** 菜名下的选项提示：必选显示「需选」，否则列出前几个可选项；点击加入并展开选项 */
function choiceHint(item) {
  const required = item.options?.length > 0;
  const list = required ? item.options : item.extras || [];
  if (!list.length) return "";
  const shown = list.slice(0, 3).map((o) => escapeHtml(o.label)).join(required ? " / " : " · ");
  const more = list.length > 3 ? " …" : "";
  return `<button class="hint ${required ? "hint-need" : ""}" data-opts="${item.n}">${required ? T.needs : T.choices}：${shown}${more} ›</button>`;
}

/** 展开面板：每份一行，含必选、可选、通用要求 */
function optionsPanel(item) {
  const lines = cart.filter((l) => l.n === item.n);
  const requests = requestsFor(item);
  const chips = (list, isOn, attr, extraClass = "") => list.map((o, i) => {
    const index = o.index ?? i;
    return `<button class="chip ${extraClass} ${isOn(index) ? "on" : ""}" data-${attr}="${index}">${escapeHtml(o.label)}</button>`;
  }).join("");

  let html = `<div class="panel">`;
  lines.forEach((line, portion) => {
    const li = cart.indexOf(line);
    html += `<div class="line" data-line="${li}">`;
    if (lines.length > 1) {
      html += `<div class="line-head"><span>${T.portion(portion + 1)} · ×${line.qty}</span>
        <span class="step"><button data-line-sub>−</button><button class="plus" data-line-add>+</button></span></div>`;
    }
    if (item.options?.length) {
      html += `<div class="chips"><span class="lab need-lab">${T.required}</span>${chips(item.options, (i) => line.opt === i, "opt")}</div>`;
    }
    if (item.extras?.length) {
      html += `<div class="chips"><span class="lab">${T.optional}</span>${chips(item.extras, (i) => (line.ext || []).includes(i), "ext")}</div>`;
    }
    if (requests.length) {
      html += `<div class="chips">${chips(requests, (i) => line.reqs.includes(i), "req", "req")}</div>`;
    }
    html += `</div>`;
  });
  html += `<button class="split" data-split="${item.n}">${T.split}</button></div>`;
  return html;
}

function renderBar() {
  const t = totals(cart);
  $("sum").innerHTML = t.count
    ? `${T.selected} ${t.count} · ${T.total} <b>${formatMoney(t.sum)}</b>${t.unknown ? " +?" : ""}`
    : `<span style="color:var(--muted)">${T.none}</span>`;
  $("cardBtn").textContent = T.card;
  $("cardBtn").disabled = !t.count;
}

/** 卡片页：上半部分给服务员（当地语言），下半部分给用户确认 */
function renderCard() {
  const isBill = view === "bill";
  const lines = mergeLines(isBill ? placed : cart);

  $("waiter").innerHTML = isBill ? billCardHtml() : orderCardHtml(lines);
  $("confirm").innerHTML = `<div class="confirm-title">${isBill ? T.ordered : T.picked}</div>`
    + confirmTableHtml(lines, totals(isBill ? placed : cart));
  $("topBack").textContent = `‹ ${isBill ? T.close : T.back}`;
  $("topLabel").textContent = isBill ? T.bill : T.showWaiter;
  $("actions").classList.toggle("hidden", isBill);
  $("actions").innerHTML = isBill ? "" : `<button class="btn" data-act="placed">${T.placedBtn}</button>`;
}

function orderCardHtml(lines) {
  const card = menu.card || {};
  const isAddOn = round > 0;
  let html = `<div class="w-open">${escapeHtml(isAddOn ? card.add : card.opening)}</div>`;
  if (card.english) html += `<div class="w-en">${escapeHtml(isAddOn ? T.addEnglish : card.english)}</div>`;
  if (card.allergy) html += `<div class="w-allergy">${escapeHtml(card.allergy)}</div>`;

  html += `<div class="w-items">`;
  for (const line of lines) {
    const item = itemsByNumber.get(line.n);
    const code = item.code ? `No.${escapeHtml(item.code)} ` : "";
    html += `<div class="w-item">・${code}${escapeHtml(item.original)} ×${line.qty}</div>`;
    for (const pick of picksOf(line, item)) html += `<div class="w-sub">${escapeHtml(pick.local)}</div>`;
    if (item.ask) html += `<div class="w-sub">${escapeHtml(item.ask)}</div>`;
  }
  return html + `</div>`;
}

function billCardHtml() {
  return `<div class="w-open">${escapeHtml(menu.card?.bill)}</div>`;
}

function confirmTableHtml(lines, t) {
  let html = `<table>`;
  for (const line of lines) {
    const item = itemsByNumber.get(line.n);
    const extra = picksOf(line, item).map((p) => p.label).join(lang === "zh" || lang === "ja" ? "、" : ", ");
    const price = typeof item.value === "number" ? formatMoney(item.value * line.qty) : escapeHtml(item.price);
    html += `<tr><td>${item.n}</td><td>${escapeHtml(item.name)}${extra ? `<div class="orig">${escapeHtml(extra)}</div>` : ""}</td>`
      + `<td class="r">×${line.qty}</td><td class="r">${price}</td></tr>`;
  }
  html += `<tr class="tot"><td></td><td>${T.total}</td><td class="r">${t.count}</td><td class="r">${formatMoney(t.sum)}</td></tr></table>`;
  if (t.unknown) html += `<div class="notes">${T.incomplete}</div>`;
  html += `<div class="notes">${T.priceNote}</div>`;
  if (menu.notes?.length) html += `<div class="notes">${menu.notes.map(escapeHtml).join("<br>")}</div>`;
  return html;
}

/* ========== 操作 ========== */

function addItem(n) {
  const item = itemsByNumber.get(n);
  const lines = cart.filter((l) => l.n === n);
  if (lines.length) lines[lines.length - 1].qty++;
  else cart.push(newLine(n));
  if (item.options?.length || item.extras?.length) expanded.add(n);
  commit();
}

function removeItem(n) {
  const lines = cart.filter((l) => l.n === n);
  if (!lines.length) return;
  decrement(lines[lines.length - 1]);
  if (!quantityOf(n)) expanded.delete(n);
  commit();
}

function decrement(line) {
  line.qty--;
  if (line.qty <= 0) cart.splice(cart.indexOf(line), 1);
}

const toggleIn = (list, value) => {
  const i = list.indexOf(value);
  if (i >= 0) list.splice(i, 1); else list.push(value);
};

/** 可选项：同 group 内单选，无 group 时多选 */
function toggleExtra(line, index) {
  const item = itemsByNumber.get(line.n);
  const group = item.extras[index].group;
  line.ext = line.ext || [];
  if (line.ext.includes(index)) {
    line.ext.splice(line.ext.indexOf(index), 1);
  } else {
    if (group) line.ext = line.ext.filter((i) => item.extras[i].group !== group);
    line.ext.push(index);
  }
}

function showItem(n) {
  tab = categoryOf(n);
  query = "";
  $("search").value = "";
  render();
  document.querySelector(`.row[data-n="${n}"]`)?.scrollIntoView({ block: "center" });
}

function openCard(kind) {
  view = kind;
  render();
  window.scrollTo(0, 0);
  setFullscreen(true);
}

function backToMenu() {
  view = "menu";
  render();
  setFullscreen(false);
}

/** 生成卡片前检查必选项，缺了就跳到那道菜 */
function requestCard() {
  const missing = cart.find(missingChoice);
  if (missing) {
    expanded.add(missing.n);
    showItem(missing.n);
    return;
  }
  openCard("card");
}

/** 服务员已记下：当前选择转入已下单，下一张卡片为加菜卡片 */
function markPlaced() {
  round++;
  for (const line of cart) placed.push({ ...line, ext: [...(line.ext || [])], reqs: [...line.reqs] });
  cart = [];
  expanded.clear();
  tab = Math.max(tab, 0);
  view = "menu";
  saveState();
  render();
  syncOrderToModel();
  setFullscreen(false);
}

/* ========== 事件 ========== */

document.addEventListener("click", (event) => {
  const el = event.target.closest("button, [data-toggle]");
  if (!el) return;
  const d = el.dataset;
  const lineEl = el.closest("[data-line]");
  const line = lineEl ? cart[Number(lineEl.dataset.line)] : null;

  if (d.tab !== undefined) {
    tab = Number(d.tab); query = ""; $("search").value = "";
    render();
    $("list").scrollTop = 0;
  } else if (d.jump) showItem(Number(d.jump));
  else if (d.opts) {
    const n = Number(d.opts);
    if (!quantityOf(n)) addItem(n);
    else { expanded.has(n) ? expanded.delete(n) : expanded.add(n); render(); }
  }
  else if (d.add) addItem(Number(d.add));
  else if (d.sub) removeItem(Number(d.sub));
  else if (d.toggle) {
    const n = Number(d.toggle);
    if (quantityOf(n)) { expanded.has(n) ? expanded.delete(n) : expanded.add(n); render(); }
  }
  else if (line && "lineAdd" in d) { line.qty++; commit(); }
  else if (line && "lineSub" in d) { decrement(line); commit(); }
  else if (line && d.opt !== undefined) { const i = Number(d.opt); line.opt = line.opt === i ? null : i; commit(); }
  else if (line && d.ext !== undefined) { toggleExtra(line, Number(d.ext)); commit(); }
  else if (line && d.req !== undefined) { toggleIn(line.reqs, Number(d.req)); commit(); }
  else if (d.split) { cart.push(newLine(Number(d.split))); commit(); }
  else if (el.id === "cardBtn") requestCard();
  else if (el.id === "billBtn") openCard("bill");
  else if (d.act === "back") backToMenu();
  else if (d.act === "placed") markPlaced();
});

$("search").addEventListener("input", (event) => {
  query = event.target.value.trim();
  render();
});

// ChatGPT 扩展接口：toolOutput 为完整结果，toolInput 在生成过程中可能是部分参数
function loadFromOpenAi() {
  try {
    const host = window.openai;
    if (host?.toolOutput) loadMenu(host.toolOutput);
    else if (host?.toolInput) loadMenu(host.toolInput, true);
  } catch {}
}
loadFromOpenAi();
window.addEventListener("openai:set_globals", loadFromOpenAi);
