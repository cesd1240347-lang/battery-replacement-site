/* 全ページ共通のライト／ダークモード切替。外部ライブラリ不要。 */
(function () {
  'use strict';
  const STORAGE_KEY = 'battery-replacement-theme';
  const root = document.documentElement;
  const file = decodeURIComponent(location.pathname.split('/').pop() || 'front.html');
  const page = file.endsWith('.html') ? file.slice(0, -5) : file;
  root.setAttribute('data-page', page);

  function readStoredTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'light' || saved === 'dark' ? saved : 'dark';
    } catch (error) {
      // file:// やブラウザのプライバシー設定で保存できない場合も切替は利用可能。
      return 'dark';
    }
  }

  function updateButton(theme) {
    const button = document.getElementById('site-theme-toggle');
    if (!button) return;
    const next = theme === 'dark' ? 'light' : 'dark';
    button.textContent = theme === 'dark' ? '☀ ライト' : '☾ ダーク';
    button.setAttribute('aria-label', `現在${theme === 'dark' ? 'ダーク' : 'ライト'}モード。${next === 'dark' ? 'ダーク' : 'ライト'}モードに切り替える`);
    button.setAttribute('title', `表示を${next === 'dark' ? 'ダーク' : 'ライト'}モードに変更`);
    button.setAttribute('aria-pressed', String(theme === 'dark'));
  }

  function applyTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    updateButton(theme);
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, theme); } catch (error) { /* 保存不可でも動作を継続 */ }
    }
  }

  // HTML本文の描画前にテーマを適用し、ページ遷移時の明暗のちらつきを減らす。
  applyTheme(readStoredTheme(), false);

  function mountButton() {
    if (document.getElementById('site-theme-toggle')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'site-theme-toggle';
    button.className = 'site-theme-toggle';
    button.addEventListener('click', function () {
      const current = root.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark', true);
    });
    document.body.appendChild(button);
    updateButton(root.getAttribute('data-theme'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountButton, { once: true });
  } else {
    mountButton();
  }

  // 同じサイトを別タブで開いて切り替えた場合も同期する。
  window.addEventListener('storage', function (event) {
    if (event.key === STORAGE_KEY) applyTheme(readStoredTheme(), false);
  });
})();
