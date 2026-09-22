(() => {
  'use strict';
  const form = document.querySelector('#video-editor');
  if (!form) return;
  const fields = document.querySelector('#video-fields');
  const rows = document.querySelector('#video-rows');
  const more = document.querySelector('#video-more-url');
  const status = document.querySelector('#video-status');
  const retry = document.querySelector('#video-retry');
  let revision = null;
  let dirty = false;
  let busy = false;

  function feedback(text, error = false) {
    status.textContent = text;
    status.dataset.error = String(error);
  }

  function addRow(video = { title: '', url: '' }) {
    const row = document.createElement('div');
    row.className = 'video-row';
    for (const [key, label, type, limit] of [['title', '标题', 'text', 80], ['url', '视频链接', 'url', 2048]]) {
      const field = document.createElement('label');
      field.textContent = label;
      const input = document.createElement('input');
      input.type = type;
      input.required = true;
      input.maxLength = limit;
      input.dataset.field = key;
      input.value = video[key];
      field.append(input);
      row.append(field);
    }
    const actions = document.createElement('div');
    actions.className = 'row-actions';
    for (const [action, label] of [['up', '上移'], ['down', '下移'], ['remove', '删除']]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.dataset.action = action;
      actions.append(button);
    }
    row.append(actions);
    rows.append(row);
    updateButtons();
    return row;
  }

  function updateButtons() {
    Array.from(rows.children).forEach((row, index) => {
      row.querySelector('[data-action="up"]').disabled = index === 0;
      row.querySelector('[data-action="down"]').disabled = index === rows.children.length - 1;
    });
    document.querySelector('#video-add').disabled = rows.children.length >= 30;
  }

  async function api(params) {
    const response = await fetch('/api/api.php', {
      method: 'POST', credentials: 'same-origin', cache: 'no-store',
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: new URLSearchParams(params),
    });
    const payload = await response.json();
    if (!response.ok || payload.code !== 0) throw new Error(payload.message || '视频维护失败，请重试。');
    return payload.data;
  }

  function render(document) {
    revision = document.revision;
    rows.replaceChildren();
    document.videos.forEach(addRow);
    more.value = document.moreUrl;
    dirty = false;
    updateButtons();
  }

  async function load() {
    if (busy || (dirty && !window.confirm('放弃未保存的修改并重新加载？'))) return;
    busy = true;
    fields.disabled = true;
    retry.hidden = true;
    feedback('正在加载…');
    try {
      render(await api({ ask: 'homepage_videos' }));
      feedback('');
    } catch (error) {
      feedback(error.message, true);
      retry.hidden = false;
    } finally {
      busy = false;
      fields.disabled = revision === null;
    }
  }

  form.addEventListener('input', () => { dirty = true; });
  rows.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button || busy) return;
    const row = button.closest('.video-row');
    const action = button.dataset.action;
    if (action === 'up' && row.previousElementSibling) rows.insertBefore(row, row.previousElementSibling);
    if (action === 'down' && row.nextElementSibling) rows.insertBefore(row.nextElementSibling, row);
    if (action === 'remove') row.remove();
    dirty = true;
    updateButtons();
  });
  document.querySelector('#video-add').addEventListener('click', () => {
    if (rows.children.length >= 30) return;
    addRow().querySelector('input').focus();
    dirty = true;
  });
  document.querySelector('#video-reload').addEventListener('click', () => { void load(); });
  retry.addEventListener('click', () => { void load(); });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy || revision === null || !form.reportValidity()) return;
    const content = {
      videos: Array.from(rows.children, row => ({ title: row.querySelector('[data-field="title"]').value, url: row.querySelector('[data-field="url"]').value })),
      moreUrl: more.value,
    };
    busy = true;
    fields.disabled = true;
    feedback('正在保存…');
    try {
      render(await api({ ask: 'save_homepage_videos', revision: String(revision), document: JSON.stringify(content) }));
      feedback('已保存');
    } catch (error) {
      feedback(error.message, true);
    } finally {
      busy = false;
      fields.disabled = false;
    }
  });
  window.addEventListener('beforeunload', (event) => {
    if (dirty) { event.preventDefault(); event.returnValue = ''; }
  });
  void load();
})();
