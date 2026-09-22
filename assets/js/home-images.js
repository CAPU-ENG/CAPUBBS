(() => {
  'use strict';
  const form = document.querySelector('#image-editor');
  if (!form) return;
  const fields = document.querySelector('#image-fields');
  const rows = document.querySelector('#image-rows');
  const status = document.querySelector('#image-status');
  const retry = document.querySelector('#image-retry');
  let loaded = false;
  let busy = false;
  let dirty = false;
  function feedback(text, error = false) { status.textContent = text; status.dataset.error = String(error); }
  function updateButtons() {
    Array.from(rows.children).forEach((row, index) => {
      row.querySelector('[data-action="up"]').disabled = index === 0;
      row.querySelector('[data-action="down"]').disabled = index === rows.children.length - 1;
    });
    document.querySelector('#image-add').disabled = rows.children.length >= 30;
  }
  function addRow(image = { title: '', img: '', imgthumb: '' }) {
    const row = document.createElement('div'); row.className = 'image-row';
    for (const [key, label, required] of [['title', '标题', false], ['img', '原图地址', true], ['imgthumb', '缩略图地址（可选）', false]]) {
      const field = document.createElement('label'); field.textContent = label;
      const input = document.createElement('input'); input.dataset.field = key; input.required = required;
      input.type = 'text'; input.value = image[key] || '';
      input.addEventListener('input', () => input.setCustomValidity(''));
      field.append(input); row.append(field);
    }
    const actions = document.createElement('div'); actions.className = 'row-actions';
    for (const [action, label] of [['up', '上移'], ['down', '下移'], ['remove', '删除']]) {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.action = action; button.textContent = label;
      actions.append(button);
    }
    row.append(actions); rows.append(row); updateButtons(); return row;
  }
  async function api(params) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('/api/api.php', {
        method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
        headers: { Accept: 'application/json' }, body: new URLSearchParams(params),
      });
      const payload = await response.json();
      if (!response.ok || payload.code !== 0) throw new Error(payload.message || '宣传图维护失败，请重试。');
      return payload.data;
    } finally { window.clearTimeout(timeout); }
  }
  async function load() {
    if (busy || (dirty && !window.confirm('放弃未保存的修改并重新加载？'))) return;
    busy = true; fields.disabled = true; retry.hidden = true; feedback('正在加载…');
    try {
      const data = await api({ ask: 'homepage_images' });
      if (!Array.isArray(data?.images)) throw new Error('宣传图数据无效。');
      rows.replaceChildren(); data.images.forEach(addRow); updateButtons();
      loaded = true; dirty = false; feedback('');
    } catch (error) { feedback(error.name === 'AbortError' ? '加载超时，请重试。' : error.message, true); retry.hidden = false; }
    finally { busy = false; fields.disabled = !loaded; }
  }
  function validUrl(input, optional) {
    const value = input.value.trim();
    let valid = optional && !value;
    if (value && !/[\x00-\x20\x7f\\]/.test(value)) {
      try {
        const url = new URL(value, window.location.origin + '/');
        valid = ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
      } catch (_) { /* Keep invalid URLs out of the submitted list. */ }
    }
    input.setCustomValidity(valid ? '' : '请填写 HTTP/HTTPS 链接或站内图片路径。');
    return valid;
  }
  form.addEventListener('input', () => { dirty = true; });
  rows.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || busy) return;
    const row = button.closest('.image-row');
    if (button.dataset.action === 'up' && row.previousElementSibling) rows.insertBefore(row, row.previousElementSibling);
    if (button.dataset.action === 'down' && row.nextElementSibling) rows.insertBefore(row.nextElementSibling, row);
    if (button.dataset.action === 'remove') row.remove();
    dirty = true; updateButtons();
  });
  document.querySelector('#image-add').addEventListener('click', () => {
    if (busy || rows.children.length >= 30) return;
    addRow().querySelector('input').focus(); dirty = true;
  });
  document.querySelector('#image-reload').addEventListener('click', () => { void load(); });
  retry.addEventListener('click', () => { void load(); });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !loaded) return;
    rows.querySelectorAll('[data-field="img"], [data-field="imgthumb"]').forEach(input => validUrl(input, input.dataset.field === 'imgthumb'));
    if (!form.reportValidity()) return;
    const images = Array.from(rows.children, (row, id) => {
      const img = row.querySelector('[data-field="img"]').value.trim();
      return { id, title: row.querySelector('[data-field="title"]').value.trim(), img, imgthumb: row.querySelector('[data-field="imgthumb"]').value.trim() || img };
    });
    busy = true; fields.disabled = true; retry.hidden = true; feedback('正在保存…');
    try {
      await api({ ask: 'saveimg', json: JSON.stringify(images) });
      dirty = false; feedback('已保存');
    } catch (error) { feedback(error.name === 'AbortError' ? '请求超时，请重新加载确认保存结果。' : error.message, true); }
    finally { busy = false; fields.disabled = false; }
  });
  window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
  void load();
})();
