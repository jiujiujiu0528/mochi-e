(function () { try {
(function () {
window.cardLockOpen = function () { return true; };
window.mochiPresetSizeTip = '字卡太多不用全开：「默认聊天字卡」和「聊天默认字卡·词典」都是很大的池子（词典还含扩展常用词，是数量最多的一类）。抽卡按分组随机，字卡多 ≠ 回复更好用——量太大反而更容易抽到生僻、重复或不合适的内容。如果你不常用词典拼字 / 拼句玩法，建议把词典关掉：到「字卡库 → 聊天默认字卡·词典」页点「使用的全部关闭」，或按分组「整组停用」、逐张关闭，只留常用的语录。关闭不影响其他任何功能，需要时随时可以再打开。';
})();
if (window.__mochiLoaded) window.__mochiLoaded.push("card-lock.js");
} catch (__e) { if (window.__mochiErrLoaded) window.__mochiErrLoaded.push("card-lock.js"); try { console.error("[JS] card-lock.js", __e && __e.message || __e); } catch (x) {} if (window.__jsErrors) window.__jsErrors.push("[card-lock.js] " + String(__e && __e.message || __e)); } })();