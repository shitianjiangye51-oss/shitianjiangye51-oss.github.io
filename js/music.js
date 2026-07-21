/* ============================================
 * 悬浮音乐播放器 (APlayer + MetingJS)
 * 修改下方 PLAYLIST_ID 为你自己的网易云歌单 ID
 * 获取方式：网易云音乐歌单页面 URL 中 id= 后的数字
 * ============================================ */
(function () {
  // ====== 在这里修改你的歌单 ID ======
  var PLAYLIST_ID = "3778678"; // 默认：网易云热歌榜，请替换为你的歌单 ID
  var SERVER = "netease";      // 音源：netease(网易云) | tencent(QQ音乐) | kugou | xiami
  var TYPE = "playlist";       // 类型：playlist(歌单) | song(单曲) | album(专辑)
  // ==================================

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
