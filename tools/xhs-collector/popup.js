// ============================================================
// popup.js — 小红书笔记文本复制 V2.0.0
// 仅手动逐篇复制，无任何自动化
// ============================================================

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const btnExtract = $('#btnExtract');
  const btnCopy = $('#btnCopy');
  const btnClear = $('#btnClear');
  const statusEl = $('#status');
  const previewEl = $('#preview');
  const previewContent = $('#previewContent');
  const previewCount = $('#previewCount');

  let collectedData = [];

  // 初始化
  async function init() {
    const result = await chrome.storage.local.get(['xhs_data']);
    collectedData = result.xhs_data || [];

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const isXHS = tab?.url?.includes('xiaohongshu.com/explore/');

    if (isXHS) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        btnExtract.disabled = false;
        setStatus('idle', '🟢 已连接笔记页面，点击「复制当前笔记」');
      } catch (e) {
        setStatus('warn', '🟡 请刷新页面后重试');
      }
    } else {
      setStatus('warn', '🟡 请先打开一篇小红书笔记');
    }

    if (collectedData.length > 0) {
      showPreview(collectedData.slice(-3));
      btnCopy.disabled = false;
    }
  }

  btnExtract.addEventListener('click', handleExtract);
  btnCopy.addEventListener('click', handleCopy);
  btnClear.addEventListener('click', handleClear);

  // 复制当前笔记
  async function handleExtract() {
    setStatus('loading', '⏳ 正在读取...');
    btnExtract.disabled = true;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const resp = await chrome.tabs.sendMessage(tab.id, { action: 'extract' });

      if (!resp?.success || !resp.data?.title) {
        throw new Error('未读取到笔记内容，请确认当前页面是笔记详情页');
      }

      const note = resp.data;

      // 去重
      if (collectedData.some(d => d.url === note.url)) {
        setStatus('warn', '⚠️ 该笔记已复制过');
        btnExtract.disabled = false;
        return;
      }

      collectedData.push(note);
      await chrome.storage.local.set({ xhs_data: collectedData });

      setStatus('success', `✅ 已复制：${note.title.substring(0, 25)}...`);
      showPreview(collectedData.slice(-3));
      btnCopy.disabled = false;

    } catch (err) {
      setStatus('error', `❌ ${err.message}`);
    } finally {
      btnExtract.disabled = false;
    }
  }

  // 复制到剪贴板
  function handleCopy() {
    if (collectedData.length === 0) return;
    const jsonl = collectedData.map(d => JSON.stringify(d)).join('\n');
    navigator.clipboard.writeText(jsonl).then(() => {
      setStatus('success', `✅ 已复制 ${collectedData.length} 条到剪贴板`);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = jsonl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setStatus('success', `✅ 已复制 ${collectedData.length} 条到剪贴板`);
    });
  }

  // 清空
  async function handleClear() {
    if (!confirm('确定清空所有已复制的笔记？')) return;
    collectedData = [];
    await chrome.storage.local.set({ xhs_data: [] });
    previewEl.classList.add('hidden');
    btnCopy.disabled = true;
    setStatus('idle', '🗑️ 已清空');
  }

  function setStatus(type, text) {
    statusEl.className = `status status--${type}`;
    statusEl.querySelector('.status__text').textContent = text;
  }

  function showPreview(data) {
    if (data.length === 0) { previewEl.classList.add('hidden'); return; }
    previewEl.classList.remove('hidden');
    previewCount.textContent = `${collectedData.length} 条`;
    previewContent.innerHTML = data.map(d => `
      <div class="preview__item">
        <div class="preview__title">${escapeHtml(d.title?.substring(0, 35) || '无标题')}</div>
        <div class="preview__meta">
          <span>👍${d.likes || 0}</span>
          <span>⭐${d.collects || 0}</span>
          <span>💬${d.comments || 0}</span>
          <span>${d.author || ''}</span>
        </div>
      </div>
    `).reverse().join('');
  }

  function escapeHtml(t) {
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
  }

  init();
})();
