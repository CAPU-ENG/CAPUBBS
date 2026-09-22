(() => {
  'use strict';
  const widget = document.querySelector('[data-home-session]');
  if (!widget) return;
  const configuredDomain = (widget.dataset.cookieDomain || 'chexie.net').replace(/^\./, '').toLowerCase();
  const hostname = window.location.hostname.toLowerCase();
  const domain = configuredDomain.includes('.') && (hostname === configuredDomain || hostname.endsWith('.' + configuredDomain)) ? configuredDomain : '';
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  let busy = false;
  let checking = false;

  function expire(name, cookieDomain = '') {
    document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secure}${cookieDomain ? '; domain=' + cookieDomain : ''}`;
  }

  function clearSession() {
    for (const name of ['token', 'capubbs-session-viewer']) {
      expire(name);
      if (domain) expire(name, domain);
    }
    try {
      localStorage.removeItem('capubbs-session-viewer');
      localStorage.removeItem('capubbs-session-viewer-refreshed-at');
    } catch (_) { /* Cookies remain the source of identity. */ }
  }

  async function request(params) {
    const response = await fetch('/api/api.php', {
      method: 'POST', credentials: 'same-origin', cache: 'no-store',
      headers: { Accept: 'application/json' }, body: new URLSearchParams(params),
    });
    const payload = await response.json();
    if (!response.ok || payload.code !== 0) {
      const error = new Error(payload.message || '账户服务暂不可用。');
      error.code = payload.code;
      throw error;
    }
    return Array.isArray(payload.data) ? payload.data[0] : payload.data;
  }

  function report(message) {
    const status = widget.querySelector('.home-session-error');
    status.textContent = message;
    status.hidden = !message;
  }

  async function refresh() {
    if (busy || checking) return;
    const token = document.cookie.split(';').map(item => item.trim()).find(item => item.startsWith('token='));
    if (token && !/^[a-z0-9_-]{1,256}$/i.test(token.slice(6))) {
      clearSession();
      if (widget.dataset.username) window.location.reload();
      return;
    }
    checking = true;
    try {
      const identity = await request({ ask: 'getuser' });
      if (busy) return;
      const name = String(identity?.username || '');
      const rights = Number(identity?.rights || 0);
      if (name !== widget.dataset.username || rights !== Number(widget.dataset.rights)) {
        window.location.reload();
      } else {
        report('');
      }
    } catch (error) {
      if (error.code === 1000 || error.code === 1001) {
        clearSession();
        if (widget.dataset.username) window.location.reload();
      } else {
        report('登录状态暂时无法确认');
      }
    } finally {
      checking = false;
    }
  }

  async function login(username, passwordHash) {
    if (busy) throw new Error('正在处理，请稍候。');
    busy = true;
    try {
      const result = await request({ ask: 'login', username, password: passwordHash, onlinetype: 'web', browser: navigator.userAgent });
      if (!result?.token) throw new Error('登录未返回有效会话。');
      clearSession();
      document.cookie = `token=${encodeURIComponent(result.token)}; path=/; max-age=999999; SameSite=Lax${secure}${domain ? '; domain=' + domain : ''}`;
      const identity = await request({ ask: 'getuser' });
      if (!identity?.username) {
        clearSession();
        throw new Error('未能建立登录状态，请重试。');
      }
      return identity;
    } finally {
      busy = false;
    }
  }

  widget.addEventListener('click', async (event) => {
    const loginLink = event.target.closest('[data-home-login]');
    if (loginLink && typeof window.showlogin === 'function') {
      event.preventDefault();
      window.showlogin();
    }
    const logout = event.target.closest('[data-home-logout]');
    if (!logout || busy) return;
    busy = true;
    logout.disabled = true;
    try {
      await request({ ask: 'logout' });
      clearSession();
      window.location.reload();
    } catch (error) {
      if (error.code === 1000 || error.code === 1001) {
        clearSession();
        window.location.reload();
        return;
      }
      report('退出失败，请重试');
      logout.disabled = false;
      busy = false;
    }
  });

  window.CapuHomeSession = { login, refresh };
  window.addEventListener('pageshow', () => { void refresh(); });
  window.addEventListener('focus', () => { void refresh(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void refresh();
  });
})();
