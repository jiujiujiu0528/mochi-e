(function () { try {
(function () {
const el = document.getElementById('clock');
if (!el) return;
const pad = (n) => (n < 10 ? '0' + n : '' + n);
function update() {
const d = new Date();
el.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes());
}
update();
setInterval(update, 15000); // 每 15 秒校准一次
})();
(function () {
const splash = document.getElementById('splash');
if (!splash) return;
/* FIX 2026-10-22 #1584：把开屏高度钉到【实测可视高】（base.css 的 .splash 消费 --mochi-vv-h）。
为什么：#1584 报障「开屏完全看不见底部的【我已阅读并知晓】」——.splash 是 position:fixed;inset:0，
在内嵌浏览器 / Android 15+ 边缘到边形态上按布局视口定高（底部一条被系统手势条/浏览器工具条盖住），
按钮正好落在被盖住的那一条里，而开屏整页没有滚动路径 ⇒ 永远点不到。
只写一个根变量、不改任何门控与滚动判定（那些仍读 .splash-box）；不认 dvh 的老内核由它顶替。
键盘期 visualViewport 会缩，但开屏/须知页/24 题问卷都没有输入框，不存在被键盘压矮的场景。 */
(function syncSplashVvH() {
function apply() {
try {
const vv = window.visualViewport;
const h = Math.round((vv && vv.height) || window.innerHeight || 0);
if (h > 200) document.documentElement.style.setProperty('--mochi-vv-h', h + 'px');
} catch (e) {}
}
apply();
window.addEventListener('resize', apply);
window.addEventListener('orientationchange', apply);
try { if (window.visualViewport) window.visualViewport.addEventListener('resize', apply); } catch (e) {}
})();
const hide = () => {
if (splash.classList.contains('hide')) return;
splash.classList.add('hide');
setTimeout(() => { if (splash.parentNode) splash.parentNode.removeChild(splash); }, 400);
};
const ready = () => !!(window.__mochiDataReady);
const today = (function () {
const d = new Date(), p = (n) => (n < 10 ? '0' + n : '' + n);
return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
})();
const seenKey = 'xy-home-v2:splash-seen:' + today;
let seenToday = false;
try { seenToday = localStorage.getItem(seenKey) === '1'; } catch (e) {}
window.__splashForceExpand = !seenToday;
const enterEl = document.getElementById('splash-enter');
const loadingEl = document.getElementById('splash-loading');
const loadingSubEl = document.getElementById('splash-loading-sub');
const hintEl = document.getElementById('splash-enter-hint');
const AGE_KEY = 'xy-home-v2:age-confirmed';
const AGE_VER = '2026-09-30';
const FOLD_KEY = 'xy-home-v2:splash-folded';
let ageOk = true; // 已移除 18 岁确认勾选：始终视为已确认
const ageRow = document.getElementById('splash-age-row');
const ageCheck = document.getElementById('splash-age-check');
if (ageRow && ageCheck) {
ageCheck.checked = ageOk; // 本版声明已确认过的自动勾上；改版后首次进入＝未勾，重新确认一次
ageRow.hidden = false;
ageCheck.addEventListener('change', function () {
ageOk = !!ageCheck.checked;
try { if (ageOk) localStorage.setItem(AGE_KEY, JSON.stringify({ t: Date.now(), v: AGE_VER })); } catch (e) {}
applyFoldState(); // #1567：勾上＝按上次选择回填折叠态；取消勾选＝回到全文展开
updateEnterState();
});
}
const ageView = document.getElementById('splash-age-view');
if (ageView) {
ageView.addEventListener('click', function (ev) {
const card = document.getElementById('splash-disclaimer');
if (!card) return;
ev.preventDefault();
card.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
}
const forceEnterEl = document.getElementById('splash-force-enter');
const foldToggleEl = document.getElementById('splash-fold-toggle');
let slow = false;
try { if (window.__mochiDataSlow) slow = true; } catch (e) {} // 事件先于监听派发时兜底
let windowLoaded = false;
const loaded = () => windowLoaded || (typeof document !== 'undefined' && document.readyState === 'complete');
const splashBox = document.getElementById('splash-box');
function applyFoldState() {
if (!splashBox || !foldToggleEl) return;
let folded = false;
try { folded = localStorage.getItem(FOLD_KEY) === '1'; } catch (e) {}
if (!ageOk) folded = false;
splashBox.classList.toggle('splash-folded', folded);
foldToggleEl.textContent = folded ? '展开公告详情' : '折叠公告详情';
}
applyFoldState();
const mandEl = document.getElementById('splash-mandatory');
const mandScroll = document.getElementById('splash-mandatory-scroll');
const mandEnter = document.getElementById('splash-mandatory-enter');
const mandHint = document.getElementById('splash-mandatory-hint');
let mandBottom = false;
function updateMandState() {
if (mandHint) mandHint.hidden = !!mandBottom;
if (mandEnter) mandEnter.classList.toggle('is-disabled', !mandBottom);
}
function checkMandScrolled() {
if (!mandScroll) return;
const b = mandScroll.scrollHeight - mandScroll.scrollTop - mandScroll.clientHeight <= 8;
if (b !== mandBottom) { mandBottom = b; updateMandState(); }
}
function showMandatory() {
if (splash.classList.contains('hide')) return;
if (!mandEl) { finishEnter(); return; } // 锚点缺失兜底：不卡死进入入口
mandEl.hidden = false;
if (mandScroll) mandScroll.scrollTop = 0;
mandBottom = false;
updateMandState();
checkMandScrolled();
}
function showDataPendingBanner() {
if (document.getElementById('mochi-data-banner')) return;
const bar = document.createElement('div');
bar.id = 'mochi-data-banner';
bar.className = 'ver-update-bar';
bar.innerHTML =
'<span class="vub-txt">数据仍在后台加载，部分内容暂时看不到…</span>' +
'<span class="vub-act vub-close" id="mochi-data-banner-close" style="background:transparent;color:#ccc;border:1px solid rgba(255,255,255,.3)">隐藏</span>';
document.body.appendChild(bar);
let gone = false;
let fuse = 0;
const off = function () {
if (gone) return;
gone = true;
document.removeEventListener('mochi-restore-done', off);
clearTimeout(fuse);
if (bar.parentNode) bar.parentNode.removeChild(bar);
};
fuse = setTimeout(off, 120000);
document.addEventListener('mochi-restore-done', off);
const closeBtn = document.getElementById('mochi-data-banner-close');
if (closeBtn) closeBtn.addEventListener('click', function (e) { e.stopPropagation(); off(); });
}
function finishEnter() {
if (splash.classList.contains('hide')) return;
if (!seenToday) {
try { localStorage.setItem(seenKey, '1'); seenToday = true; } catch (e) {}
}
hide();
if (!ready()) {
try { showDataPendingBanner(); } catch (e) {}
try {
if (window.openModal) {
window.openModal('数据仍在加载', '数据较多仍在后台加载，部分内容（字卡 / 图片 / 聊天记录等）可能暂时看不见，建议稍后刷新页面。', null);
}
} catch (e) {}
return;
}
try {
const dgb = (typeof navigator !== 'undefined' && navigator.deviceMemory) || 8;
if (dgb > 4 && window.hydrateLibScopes) {
setTimeout(function () {
try { window.hydrateLibScopes(['own']).catch(function () {}); } catch (e) {}
}, 1500);
}
} catch (e) {}
try { if (window.mochiContactEntryFlow) window.mochiContactEntryFlow(); } catch (e) {}
}
let scrolledBottom = false;
function checkScrolled() {
let bottom = true;
if (splashBox) {
bottom = splashBox.scrollHeight - splashBox.scrollTop - splashBox.clientHeight <= 8;
}
if (bottom !== scrolledBottom) { scrolledBottom = bottom; updateEnterState(); }
}
let readyForced = false;
function updateEnterState() {
const r = ready() || readyForced;
const ok = r && scrolledBottom && ageOk; // #315c：年龄确认与滑到底并列为可点条件
if (loadingEl) {
loadingEl.hidden = r && loaded();
loadingEl.textContent = (!ready() && slow) ? '数据较多，仍在加载…' : (r ? '正在加载页面…' : '正在加载数据…');
}
if (loadingSubEl) {
const loadingShown = loadingEl ? !loadingEl.hidden : false;
loadingSubEl.hidden = !(loadingShown && ((!ready() && slow) || (r && !loaded())));
}
if (hintEl) hintEl.hidden = !r || !loaded() || ok;
if (enterEl) {
enterEl.hidden = !r || !loaded();
enterEl.classList.toggle('is-disabled', !ok); // div 上设 disabled 属性不落 DOM，用 class 控制置灰
}
if (forceEnterEl) forceEnterEl.hidden = ready() || readyForced || !slow || !loaded() || !ageOk;
if (foldToggleEl) foldToggleEl.hidden = !ageOk;
}
const enter = () => {
if (splash.classList.contains('hide')) return;
if (!ready()) {
if (readyForced) { showMandatory(); }
return; // 数据未就绪且未硬放行：禁止进入（原有门控）
}
if (!scrolledBottom || !loaded() || !ageOk) return; // 未滑到底 / 页面未加载完 / 未确认年满18：禁止进入
if (!seenToday) {
try { localStorage.setItem(seenKey, '1'); seenToday = true; } catch (e) {}
}
showMandatory();
};
const forceEnter = () => {
if (splash.classList.contains('hide')) return;
if (!ageOk) return; // #315c：逃生口同样要求先勾选年龄确认
if (!seenToday) {
try { localStorage.setItem(seenKey, '1'); seenToday = true; } catch (e) {}
}
showMandatory();
};
updateEnterState();
if (splashBox) splashBox.addEventListener('scroll', checkScrolled, { passive: true });
if (enterEl) enterEl.addEventListener('click', (e) => { e.stopPropagation(); enter(); });
if (forceEnterEl) forceEnterEl.addEventListener('click', (e) => { e.stopPropagation(); forceEnter(); });
if (foldToggleEl) foldToggleEl.addEventListener('click', function (e) {
e.stopPropagation();
if (!splashBox) return;
const folded = splashBox.classList.toggle('splash-folded');
foldToggleEl.textContent = folded ? '展开公告详情' : '折叠公告详情';
try { localStorage.setItem(FOLD_KEY, folded ? '1' : '0'); } catch (e) {}
});
if (mandEnter) mandEnter.addEventListener('click', (e) => { e.stopPropagation(); if (mandBottom) finishEnter(); });
if (mandScroll) mandScroll.addEventListener('scroll', checkMandScrolled, { passive: true });
window.addEventListener('resize', checkMandScrolled);
window.addEventListener('load', function () { windowLoaded = true; updateEnterState(); });
setTimeout(function () { if (!windowLoaded) { windowLoaded = true; updateEnterState(); } }, 30000);
document.addEventListener('mochi-restore-done', function () { updateEnterState(); if (ready() && loaded()) finishEnter(); });
document.addEventListener('mochi-restore-slow', function () { slow = true; updateEnterState(); });
document.addEventListener('mochi-notice-rendered', checkScrolled);
const readyPoll = setInterval(() => {
if (ready() && loaded()) { finishEnter(); clearInterval(readyPoll); return; }
updateEnterState();
checkScrolled();
}, 300);
setTimeout(() => {
if (!ready()) {
slow = true;
readyForced = true;
updateEnterState();
finishEnter(); // 数据异常未就绪：20s 后仍强制进入（finishEnter 会弹「数据仍在加载」提示，不静默卡在开屏）
}
}, 20000);
})();
function renderSplashSections(container, sections, opt) {
if (!container || !Array.isArray(sections)) return;
const collapsible = !!(opt && opt.collapsible);
const forceExpand = !!(opt && opt.expandFirst) && !!window.__splashForceExpand;
sections.forEach(function (sec) {
const wrap = document.createElement('div');
wrap.className = 'splash-sec-wrap'
+ (collapsible ? ' splash-sec-collapsible' : '')
+ (collapsible && !forceExpand ? ' is-collapsed' : '');
let h = null;
if (sec && sec.h) {
h = document.createElement('p');
h.className = 'splash-sec';
h.textContent = String(sec.h);
wrap.appendChild(h);
}
if (sec && Array.isArray(sec.p)) {
const body = collapsible ? document.createElement('div') : null;
if (body) { body.className = 'splash-sec-content'; }
sec.p.forEach(function (it) {
const p = document.createElement('p');
if (it && typeof it === 'object') {
if (it.h !== undefined) { p.className = 'splash-sub'; p.textContent = String(it.h); }
else if (it.b !== undefined) { p.className = 'splash-bullet'; p.textContent = String(it.b); }
else if (it.hl !== undefined) { p.className = 'splash-item splash-hl'; p.textContent = String(it.hl); }
else { p.className = 'splash-item'; p.textContent = String(it.t !== undefined ? it.t : ''); }
} else {
p.className = 'splash-item';
p.textContent = String(it);
}
if (body) body.appendChild(p); else wrap.appendChild(p);
});
if (body) wrap.appendChild(body);
}
container.appendChild(wrap);
});
}
function buildSplashToc(list) {
if (!list) return;
if (list.querySelector('.splash-toc')) return; // 已注入则跳过（防重复）
const headers = list.querySelectorAll('.splash-sec-wrap .splash-sec');
if (!headers.length) return;
const toc = document.createElement('div');
toc.className = 'splash-toc';
const head = document.createElement('button');
head.type = 'button';
head.className = 'splash-toc-head';
head.setAttribute('aria-expanded', 'false');
const headText = document.createElement('span');
headText.className = 'splash-toc-head-text';
headText.textContent = '目录（' + headers.length + ' 章）';
const chevron = document.createElement('span');
chevron.className = 'splash-toc-chev';
chevron.textContent = '▾';
head.appendChild(headText);
head.appendChild(chevron);
head.addEventListener('click', function () {
toc.classList.toggle('open');
head.setAttribute('aria-expanded', String(toc.classList.contains('open')));
});
toc.appendChild(head);
const body = document.createElement('div');
body.className = 'splash-toc-body';
headers.forEach(function (h) {
const wrap = h.parentNode; // .splash-sec-wrap
let label = String(h.textContent).replace(/^【|】$/g, '').trim() || '章节';
if (label.length > 18) label = label.slice(0, 18) + '…';
const chip = document.createElement('button');
chip.type = 'button';
chip.className = 'splash-toc-chip';
chip.textContent = label;
chip.addEventListener('click', function (e) {
e.stopPropagation();
toc.classList.remove('open');
head.setAttribute('aria-expanded', 'false');
Array.prototype.forEach.call(body.children, function (c) { c.classList.remove('active'); });
chip.classList.add('active');
if (wrap.classList.contains('is-collapsed')) wrap.classList.remove('is-collapsed');
wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
body.appendChild(chip);
});
toc.appendChild(body);
list.insertBefore(toc, list.firstChild);
}
(function () {
const notice = document.getElementById('splash-notice');
if (!notice) return;
if (location.protocol === 'file:') return;
fetch('./notice.json?v=' + Date.now(), { cache: 'no-store' })
.then(function (r) { if (!r.ok) throw new Error('notice fetch ' + r.status); return r.json(); })
.then(function (data) {
if (!data || typeof data !== 'object') return;
const title = notice.querySelector('.splash-notice-title');
const sub = notice.querySelector('.splash-notice-sub');
const list = notice.querySelector('.splash-notice-list');
if (data.title !== undefined && title) title.textContent = String(data.title);
if (data.sub !== undefined && sub) sub.textContent = String(data.sub);
if (Array.isArray(data.sections)) {
if (!data.sections.length || data.hide) { notice.style.display = 'none'; return; }
if (list) {
list.innerHTML = '';
renderSplashSections(list, data.sections, { collapsible: true, expandFirst: true });
buildSplashToc(list);
}
} else if (Array.isArray(data.list)) {
if (!data.list.length || data.hide) { notice.style.display = 'none'; return; }
if (list) {
list.innerHTML = '';
data.list.forEach(function (t) {
const p = document.createElement('p');
p.className = 'splash-item';
p.textContent = String(t);
list.appendChild(p);
});
}
} else if (data.hide) {
notice.style.display = 'none';
}
document.dispatchEvent(new Event('mochi-notice-rendered'));
})
.catch(function () { /* 失败：保留模板默认公告 */ });
})();
window.addEventListener('DOMContentLoaded', function () {
const nl = document.querySelector('.splash-notice-list');
if (!nl) return;
Array.prototype.forEach.call(nl.querySelectorAll('.splash-sec-wrap'), function (wrap) {
if (wrap.classList.contains('splash-sec-collapsible')) return; // 在线已处理
const head = wrap.querySelector(':scope > .splash-sec');
if (!head) return;
wrap.classList.add('splash-sec-collapsible');
if (!window.__splashForceExpand) wrap.classList.add('is-collapsed');
let content = wrap.querySelector(':scope > .splash-sec-content');
if (!content) {
content = document.createElement('div');
content.className = 'splash-sec-content';
wrap.appendChild(content);
}
while (head.nextSibling && !content.contains(head.nextSibling)) content.appendChild(head.nextSibling);
});
nl.addEventListener('click', function (e) {
var t = e.target;
while (t && t !== nl && !(t.classList && t.classList.contains('splash-sec'))) t = t.parentNode;
if (!t || t === nl || !t.parentNode) return;
const wrap = t.parentNode;
if (wrap.classList && wrap.classList.contains('splash-sec-collapsible')) {
wrap.classList.toggle('is-collapsed');
}
});
buildSplashToc(nl);
document.dispatchEvent(new Event('mochi-notice-rendered'));
});
if (window.__mochiLoaded) window.__mochiLoaded.push("clock.js");
} catch (__e) { if (window.__mochiErrLoaded) window.__mochiErrLoaded.push("clock.js"); try { console.error("[JS] clock.js", __e && __e.message || __e); } catch (x) {} if (window.__jsErrors) window.__jsErrors.push("[clock.js] " + String(__e && __e.message || __e)); } })();