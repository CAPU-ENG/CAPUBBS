(() => {
  'use strict';
  const form = document.querySelector('#contact-editor');
  if (!form) return;
  const format = window.CapuHomeContacts;
  const fields = document.querySelector('#contact-fields');
  const rows = document.querySelector('#contact-rows');
  const notes = document.querySelector('#contact-notes');
  const status = document.querySelector('#contact-status');
  const retry = document.querySelector('#contact-retry');
  let revision = null;
  let savedText = '';
  let busy = false;

  function feedback(message, error = false) {
    status.textContent = message;
    status.dataset.error = String(error);
  }

  function rowValues() {
    return Array.from(rows.children, row => ({
      label: row.querySelector('[data-field="label"]').value,
      value: row.querySelector('[data-field="value"]').value.replace(/\r\n?/g, '\n'),
    })).filter(row => row.label.trim() || row.value.trim());
  }
  const currentText = () => format.serialize(rowValues(), notes.value);
  const dirty = () => revision !== null && currentText() !== savedText;

  function addRow(row = { label: '', value: '' }) {
    const tr = document.createElement('tr');
    const labelCell = document.createElement('td');
    const label = document.createElement('input');
    label.dataset.field = 'label'; label.maxLength = 16; label.value = row.label;
    label.setAttribute('aria-label', '名称');
    labelCell.append(label);
    const valueCell = document.createElement('td');
    const value = document.createElement('textarea');
    value.dataset.field = 'value'; value.rows = Math.max(1, row.value.split('\n').length); value.value = row.value;
    value.setAttribute('aria-label', '内容');
    valueCell.append(value);
    const actionCell = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'row-actions';
    for (const [action, text] of [['up', '上移'], ['down', '下移'], ['remove', '删除']]) {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = text; button.dataset.action = action;
      actions.append(button);
    }
    actionCell.append(actions);
    tr.append(labelCell, valueCell, actionCell);
    rows.append(tr);
    updateButtons();
    return tr;
  }

  function updateButtons() {
    Array.from(rows.children).forEach((row, index) => {
      row.querySelector('[data-action="up"]').disabled = index === 0;
      row.querySelector('[data-action="down"]').disabled = index === rows.children.length - 1;
    });
  }

  function validate() {
    const values = rowValues();
    for (const [index, row] of values.entries()) {
      const label = row.label.trim();
      if (!label) return `第 ${index + 1} 行缺少名称。`;
      if (label.includes('：')) return `第 ${index + 1} 行的名称不能包含全角冒号“：”。`;
      if (row.value.trim().split('\n').slice(1).some(line => format.ROW.test(line))) {
        return `第 ${index + 1} 行内容换行后不能以“名称：”开头，请拆成新的一行。`;
      }
    }
    const text = currentText();
    if (!text) return '请至少填写一行联系方式或补充说明。';
    if (Array.from(text).length > 5000) return '联系方式总长度不能超过 5000 个字符。';
    return '';
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
    const view = format.parse(data.text);
    revision = data.revision;
    rows.replaceChildren();
    view.rows.forEach(addRow);
    if (!view.rows.length) addRow();
    notes.value = view.notes;
    savedText = currentText();
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

  rows.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button || busy) return;
    const row = button.closest('tr');
    const action = button.dataset.action;
    if (action === 'up' && row.previousElementSibling) rows.insertBefore(row, row.previousElementSibling);
    if (action === 'down' && row.nextElementSibling) rows.insertBefore(row.nextElementSibling, row);
    if (action === 'remove') row.remove();
    updateButtons();
  });
  document.querySelector('#contact-add').addEventListener('click', () => {
    addRow().querySelector('input').focus();
  });
  document.querySelector('#contact-reload').addEventListener('click', () => { void load(); });
  retry.addEventListener('click', () => { void load(); });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy || revision === null) return;
    const problem = validate();
    if (problem) { feedback(problem, true); return; }
    busy = true;
    fields.disabled = true;
    feedback('正在保存…');
    try {
      render(await api({ ask: 'save_homepage_contacts', revision: String(revision), text: currentText() }));
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
