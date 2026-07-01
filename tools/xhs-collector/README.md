# 小红书笔记复制 — Chrome 扩展

> 手动逐篇复制小红书笔记的可见文本，导出为 JSONL，供个人学习使用

## 与 V1 的区别

| V1（已弃用） | V2.1（当前） |
|-------------|-----------|
| Hook fetch 拦截 API | ❌ 无网络拦截 |
| 批量采集搜索页 | ❌ 仅单篇 |
| 自动打开/关闭标签页 | ❌ 纯手动 |
| 深度采集正文 | ✅ 直接读页面可见文本 |
| 互动数据读取 | ✅ 多策略+年份过滤（V2.1 修复） |

## 安装

1. 打开 Chrome → `chrome://extensions/`
2. 开启「开发者模式」
3. 「加载已解压的扩展程序」→ 选择 `tools/xhs-collector/` 目录

## 使用

1. 在浏览器中打开一篇小红书笔记（`xiaohongshu.com/explore/xxx`）
2. 点击工具栏扩展图标
3. 点击「📄 复制当前笔记」
4. 换下一篇笔记，重复步骤 2-3
5. 全部复制完后，点击「📋 复制到剪贴板」
6. 粘贴到文本文件，保存为 `.jsonl`

## 数据格式

```json
{
  "url": "https://www.xiaohongshu.com/explore/xxx",
  "title": "笔记标题",
  "author": "作者名",
  "content": "笔记正文内容",
  "tags": ["标签1", "标签2"],
  "publish_date": "2026-07-01",
  "collected_at": "2026-07-01T12:00:00.000Z"
}
```

## 原理

- 仅读取当前页面中**用户可见的 DOM 文本**
- 等同于手动选择 → 右键 → 复制
- 无网络请求拦截、无 API 调用、无自动化操作
- 数据仅存储在浏览器本地（chrome.storage.local）

## 更新日志

### V2.1.0（2026-07-01）
- **修复**：`readVisibleCount()` 误匹配年份（2024/2025）和楼层号作为互动数
- **改进**：多策略提取 + 年份过滤（2020-2030）+ 取最大候选值
- **改进**：过滤逻辑统一（parseCount 返回值二次校验）

## 文件说明

```
tools/xhs-collector/
├── manifest.json   # Chrome 扩展配置
├── content.js      # 内容脚本（读取页面可见文本）
├── popup.html      # 弹窗 UI
├── popup.js        # 弹窗逻辑
├── styles.css      # 弹窗样式
├── icons/          # 扩展图标
└── README.md       # 本文件
```
