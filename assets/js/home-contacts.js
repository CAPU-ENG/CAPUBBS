(() => {
  'use strict';
  const form = document.querySelector('#contact-editor');
  if (!form) return;
  const fields = document.querySelector('#contact-fields');
  const text = document.querySelector('#contact-text');
  const status = document.querySelector('#contact-status');
  const retry = document.querySelector('#contact-retry');
  let revision = null;
  let savedText = '';
  let busy = false;
  const dirty = () => text.value !== savedText;

  function feedback(message, error = false) {
    status.textContent = message;
    status.dataset.error = String(error);
  }

  async function api(params) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('/api/api.php', {
        method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: new URLSearchParams(params),
      });
      const payload = await response.json();
      if (!response.ok || payload.code !== 0) throw new Error(payload.message || '联系方式维护失败，请重试。');
      const data = payload.data;
      if (!Number.isInteger(data?.revision) || data.revision < 1 || typeof data.text !== 'string') {
        throw new Error('联系方式数据无效，请重试。');
      }
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('请求超时，修改已保留，请重试。');
      if (error instanceof TypeError || error instanceof SyntaxError) throw new Error('请求失败，修改已保留，请重试。');
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function render(data) {
    revision = data.revision;
    text.value = data.text;
    savedText = text.value;
  }

  async function load() {
    if (busy || (dirty() && !window.confirm('放弃未保存的修改并重新加载？'))) return;
    busy = true;
    fields.disabled = true;
    retry.hidden = true;
    feedback('正在加载…');
    try {
      render(await api({ ask: 'homepage_contacts' }));
      feedback('');
    } catch (error) {
      feedback(error.message, true);
      retry.hidden = false;
    } finally {
      busy = false;
      fields.disabled = revision === null;
    }
  }

  document.querySelector('#contact-reload').addEventListener('click', () => { void load(); });
  retry.addEventListener('click', () => { void load(); });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy || revision === null || !form.reportValidity()) return;
    busy = true;
    fields.disabled = true;
    feedback('正在保存…');
    try {
      render(await api({ ask: 'save_homepage_contacts', revision: String(revision), text: text.value }));
      retry.hidden = true;
      feedback('已保存');
    } catch (error) {
      feedback(error.message, true);
    } finally {
      busy = false;
      fields.disabled = false;
    }
  });
  window.addEventListener('beforeunload', (event) => {
    if (dirty()) { event.preventDefault(); event.returnValue = ''; }
  });
  void load();
})();
