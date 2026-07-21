/* ============================================
 * 悬浮音乐播放器 (APlayer + MetingJS)
 *
 * 功能：
 * 1. 左下角吸附式悬浮播放器
 * 2. 跨页面连续播放：点击文章跳转页面时，先记住当前歌曲与进度，
 *    新页面加载完成后自动从断点恢复播放，音乐不会中断
 *
 * 修改下方 PLAYLIST_ID 为你自己的网易云歌单 ID
 * 获取方式：网易云音乐歌单页面 URL 中 id= 后的数字
 * ============================================ */
(function () {
  // ====== 在这里修改你的歌单 ID ======
  var PLAYLIST_ID = "3778678"; // 默认：网易云热歌榜，请替换为你的歌单 ID
  var SERVER = "netease";      // 音源：netease(网易云) | tencent(QQ音乐) | kugou | xiami
  var TYPE = "playlist";       // 类型：playlist(歌单) | song(单曲) | album(专辑)
  // ==================================

  var STORE_KEY = "blog-music-state"; // 跨页面播放状态的 localStorage 键名

  // 1. 加载 APlayer 样式
  var css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css";
  document.head.appendChild(css);

  // 2. 创建 meting-js 元素（左下角吸附播放器）
  var meting = document.createElement("meting-js");
  meting.setAttribute("server", SERVER);
  meting.setAttribute("type", TYPE);
  meting.setAttribute("id", PLAYLIST_ID);
  meting.setAttribute("fixed", "true");     // 吸附模式（左下角悬浮）
  meting.setAttribute("autoplay", "false"); // 不自动播放（浏览器策略限制）
  meting.setAttribute("theme", "#30a9de");  // 主题色
  meting.setAttribute("volume", "0.6");     // 默认音量
  meting.setAttribute("lrc-type", "0");     // 歌词类型
  document.body.appendChild(meting);

  // ====== 跨页面连续播放核心逻辑 ======
  // MetingJS 加载歌单后会把 APlayer 实例赋值给 meting.aplayer，
  // 这里用 defineProperty 拦截这次赋值，第一时间拿到播放器实例。
  var ap = null;
  var recovered = false;

  Object.defineProperty(meting, "aplayer", {
    configurable: true,
    get: function () { return ap; },
    set: function (instance) {
      ap = instance;
      onPlayerReady();
    }
  });

  function readSavedState() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function onPlayerReady() {
    var saved = readSavedState();

    // 若存在上一页留下的播放记录，则恢复歌曲与进度
    if (saved && typeof saved.index === "number" && typeof saved.time === "number"
        && ap.list && ap.list.audios && ap.list.audios.length > 0) {
      ap.on("canplay", function () {
        if (recovered) return;
        // 将索引夹到合法范围（防止歌单发生变化）
        var idx = Math.max(0, Math.min(saved.index, ap.list.audios.length - 1));
        if (ap.list.index !== idx) {
          // 先切换到目标歌曲，加载完成后会再次触发 canplay，届时再恢复进度
          ap.list.switch(idx);
          return;
        }
        recovered = true;
        ap.seek(saved.time);
        if (saved.playing) {
          ap.play(); // 若被浏览器自动播放策略拦截，手动点一次播放键即可
        }
        try { localStorage.removeItem(STORE_KEY); } catch (e) {}
      });
    }

    // 离开页面前（跳转文章详情等）保存当前播放状态
    function saveState() {
      if (!ap || !ap.audio || !ap.list) return;
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify({
          index: ap.list.index,
          time: ap.audio.currentTime || 0,
          playing: !ap.audio.paused
        }));
      } catch (e) {}
    }
    window.addEventListener("beforeunload", saveState);
    window.addEventListener("pagehide", saveState);
  }

  // 3. 依次加载 APlayer 和 MetingJS
  function loadScript(src, cb) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = cb;
    document.body.appendChild(s);
  }
  loadScript("https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js", function () {
    loadScript("https://cdn.jsdelivr.net/npm/meting@2.0.1/dist/Meting.min.js", null);
  });
})();
