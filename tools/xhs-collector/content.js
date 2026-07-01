/**
 * 小红书笔记复制 — /redbook
 * V2.1 — 仅读取可见 DOM 文本，不做网络拦截
 * 修复：readVisibleCount() 误匹配年份/楼层号
 */
(function () {
  'use strict';

  // ========== 数字解析 ==========
  function parseCount(text) {
    if (!text) return 0;
    text = String(text).replace(/\s+/g, '').trim();
    var m = text.match(/([\d.]+)\s*万/);
    if (m) return Math.round(parseFloat(m[1]) * 10000);
    var n = text.replace(/[^\d]/g, '');
    return n ? parseInt(n, 10) : 0;
  }

  // ========== 从页面可见文本读取互动数据（V2.1 修复版） ==========
  function readVisibleCount(root, keywords) {
    var allText = root.innerText || '';
    var candidates = [];

    // 策略1：匹配"数字+关键词"和"关键词+数字"两种格式
    for (var ki = 0; ki < keywords.length; ki++) {
      var kw = keywords[ki];
      var patterns = [
        new RegExp('([\\d.]+万?)\\s*' + kw, 'g'),
        new RegExp(kw + '\\s*([\\d.]+万?)', 'g')
      ];
      for (var pi = 0; pi < patterns.length; pi++) {
        var match;
        while ((match = patterns[pi].exec(allText)) !== null) {
          var val = parseCount(match[1]);
          // 过滤年份（2020-2030）和明显异常值
          if (val > 0 && val < 10000000 && (val < 2020 || val > 2030)) {
            candidates.push(val);
          }
        }
      }
    }

    // 策略2：aria-label（SVG图标上的数字）
    var svgs = root.querySelectorAll('svg, [class*="like"], [class*="collect"], [class*="comment"], [class*="chat"]');
    for (var si = 0; si < svgs.length; si++) {
      var el = svgs[si];
      var label = el.getAttribute('aria-label') || '';
      if (!label && el.closest) {
        var parent = el.closest('[aria-label]');
        if (parent) label = parent.getAttribute('aria-label') || '';
      }
      for (var ki2 = 0; ki2 < keywords.length; ki2++) {
        if (label.indexOf(keywords[ki2]) !== -1) {
          var num = label.replace(/[^\d.万]/g, '');
          if (num) {
            var val2 = parseCount(num);
            if (val2 > 0 && val2 < 10000000 && (val2 < 2020 || val2 > 2030)) {
              candidates.push(val2);
            }
          }
        }
      }
    }

    // 策略3：从底部交互栏提取
    var bottomSelectors = [
      '[class*="interact"]', '[class*="engage"]', '[class*="action-bar"]',
      '[class*="toolbar"]', '[class*="bottom-bar"]', '[class*="note-scroller"]'
    ];
    for (var bi = 0; bi < bottomSelectors.length; bi++) {
      var bar = root.querySelector(bottomSelectors[bi]);
      if (bar) {
        var barText = bar.innerText || '';
        for (var ki3 = 0; ki3 < keywords.length; ki3++) {
          var p = new RegExp('([\\d.]+万?)\\s*' + keywords[ki3]);
          var m = barText.match(p);
          if (m) {
            var val3 = parseCount(m[1]);
            if (val3 > 0 && val3 < 10000000 && (val3 < 2020 || val3 > 2030)) {
              candidates.push(val3);
            }
          }
        }
      }
    }

    // 取最大值（互动数通常比楼层号、年份等大）
    if (candidates.length === 0) return 0;
    return Math.max.apply(null, candidates);
  }

  // ========== 提取可见文本 ==========
  function extractVisibleText() {
    var container = document.querySelector('.note-scroller')
      || document.querySelector('#noteContainer')
      || document.querySelector('.note-detail-mask')
      || document.querySelector('main')
      || document.body;

    var titleEl = container.querySelector('[class*="title"]');
    var title = titleEl ? titleEl.innerText.trim() : '';

    // 正文：去掉标题区域，取剩余文本
    var contentEl = container.querySelector('[class*="desc"]')
      || container.querySelector('[class*="content"]');
    var content = contentEl ? contentEl.innerText.trim() : '';

    // 作者：取第一行非空文本（排除日期）
    var authorEl = container.querySelector('[class*="author"]')
      || container.querySelector('[class*="name"]');
    var authorRaw = authorEl ? authorEl.innerText.trim() : '';
    var author = authorRaw.split('\n').filter(function (l) {
      var t = l.trim();
      return t && !t.match(/\d{4}[-/]\d{1,2}/) && !t.match(/^(关注|粉丝|获赞)/);
    })[0] || '';

    // 标签：从 DOM 标签元素 + 正文 #标签 两处提取
    var tags = [];
    var tagEls = container.querySelectorAll('[class*="tag"] a, [class*="hash"] a, a[href*="/search_result"]');
    for (var i = 0; i < tagEls.length; i++) {
      var t = tagEls[i].innerText.replace(/^#/, '').trim();
      if (t && t.length < 30) tags.push(t);
    }
    var hashMatches = content.match(/#([^\s#@]{1,20})/g);
    if (hashMatches) {
      for (var j = 0; j < hashMatches.length; j++) {
        var h = hashMatches[j].replace(/^#/, '').trim();
        if (h && tags.indexOf(h) === -1) tags.push(h);
      }
    }

    // 互动数据
    var likes = readVisibleCount(container, ['赞', '点赞', 'likes']);
    var collects = readVisibleCount(container, ['收藏', 'collects']);
    var comments = readVisibleCount(container, ['评论', 'comments']);

    // 发布日期
    var dateEl = container.querySelector('[class*="date"], [class*="time"], time');
    var rawDate = dateEl ? dateEl.innerText.trim() : '';

    return {
      title: title,
      content: content,
      author: author,
      tags: tags,
      publish_date: rawDate,
      likes: likes,
      collects: collects,
      comments: comments,
      url: location.href,
      collected_at: new Date().toISOString()
    };
  }

  // ========== 消息监听 ==========
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action === 'extract') {
      try {
        var data = extractVisibleText();
        sendResponse({ success: true, data: data });
      } catch (e) {
        sendResponse({ success: false, error: e.message });
      }
    } else if (msg.action === 'ping') {
      sendResponse({ success: true, status: 'ready' });
    }
    return false;
  });
})();
