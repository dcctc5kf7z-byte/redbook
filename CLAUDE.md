# CLAUDE.md — 小红书爆款助手 · 项目导航

> 最后更新：2026-06-30
> **当前阶段**：v2.4 精简增强 — SKILL.md 1025→607 行（-41%）+ 情感类白描模式 + 人设路由 PRD V3.0
> **上一阶段**：v2.3 全员评审（综合 7.4/10）+ 压力测试修复
> **下一会话起点**：V3.0 人设路由系统 P0 实现 → git push（GitHub 恢复后）

---

## 项目概述

本项目开发了一款**小红书爆款助手**（`/redbook`）——基于教练模式的 AI 内容优化工具。核心定位：不是镜子，是教练。帮用户把素材变成能发的小红书笔记。

**产品形态**：Claude Code Skill（独立产品线，不隶属于 text-lens）

**核心差异化**：Fact Sheet 前置拦截（消灭幻觉） × 合规过滤器（《广告法》红线） × 五维评分 × 钩子自动注入

**产品 System Prompt**：[SKILL.md](.claude/skills/redbook/SKILL.md)（v2.4，607行精简版，含智能默填 + 角色扮演去 AI 味 + 白描模式 + 仅红线合规）

### 与 text-lens 的关系

| 维度 | text-lens（镜子） | redbook（教练） |
|------|-----------------|----------------|
| 仓库 | `Desktop/one` | `Desktop/redbook`（本项目） |
| 哲学 | 反射，不引导 | 帮你写出平台友好的内容 |
| 入口 | `/text-lens` | `/redbook` |
| 铁律 | 10 条（不评价、不替写） | 10 条（给方案、给理由、合规红线） |
| 事实来源 | 不涉及 | 必须来自 Fact Sheet |

---

## 项目结构

```
redbook/
├── CLAUDE.md                           # ← 你在这里
├── HANDOFF.md                          # ★ 项目交接文档（V2.4 快照）
├── devlog/                             # 开发者日志
│   ├── 2026-06-29.md                   # 首日日志
│   └── 2026-06-30.md                   # V1.8→V2.4 全线迭代
├── data/                               # 反馈数据（V2.0 治理后）
│   ├── feedback-production.jsonl       # ★ 真实反馈（96条，schema_version 2.0）
│   ├── feedback-simulation.jsonl       # 模拟反馈（682条）
│   ├── viral-patterns.jsonl            # 爆款特征（55条）
│   ├── README.md                       # 数据文档
│   └── archive/                        # 原始文件归档（9个）
├── docs/                               # 项目文档
│   ├── persona-routing-prd-v3.md       # ★ V3.0 人设路由 PRD（8种人设）
│   ├── competitor-analysis-2026-06-30.md # 竞品分析报告
│   ├── expert-review-6.md              # 6 位专家汇总报告
│   ├── recruitment-post.md             # 朋友圈招募文案
│   └── xiaohongshu-experience-post.md  # 小红书体验帖模板
├── .claude/skills/redbook/             # ★ /redbook Skill（V2.4，607行）
│   ├── SKILL.md                        # 入口（精简版：类型路由+评分+合规+懒加载）
│   ├── iron-laws.md                    # 教练铁律（10 条）
│   ├── hooks/                          # 钩子动作库（按类型拆分，懒加载）
│   │   ├── goodthings.md               # 好物推荐类
│   │   ├── experience.md               # 经验分享类
│   │   ├── emotion.md                  # 情感共鸣类
│   │   ├── store.md                    # 探店打卡类
│   │   └── compare.md                  # 对比测评类
│   ├── titles.md                       # 封面标题模板（7 种变体）
│   └── templates.md                    # 正文结构模板（四段式 + 5 种内容类型）
└── .gitignore
```

---

## 工作约定

### 开发流程
1. **每个工作日开始时**：检查 `devlog/` 是否有今日日志，没有则创建
2. **每次改动后**：更新当日 `devlog/YYYY-MM-DD.md`，记录完成事项和待办
3. **修改 Skill 前**：先读 [SKILL.md](.claude/skills/redbook/SKILL.md)
4. **修改钩子库前**：先读对应类型的 hooks 文件 + [iron-laws.md](.claude/skills/redbook/iron-laws.md) 铁律 #8（不骗用户）和 #10（合规红线）

### 文档更新原则
- `docs/` 下的文件是**标准文件**——反映当前最新的开发共识
- 产品需求变化 → 更新 `docs/pm-report.md`
- 技术方案变化 → 更新 `CLAUDE.md`
- 合规词表变化 → 更新 `SKILL.md` 合规检查节 + `iron-laws.md`

### 产品迭代原则
- Fact Sheet 前置拦截是不可移除的核心机制
- 合规过滤器是不可跳过的输出环节
- 事实区/润色区标注是不可省略的输出格式
- 修改钩子库前，必须过法务合规审查

---

## 当前状态

| 项 | 状态 |
|----|------|
| **🎯 产品定位** | **✅ 独立产品线** — 从 text-lens 分离（路径 A），教练模式 |
| **当前版本** | **V2.4** — SKILL.md 607行精简版（-41%），25/25 回归测试 PASS |
| **全员评审** | **7.4/10** — PM 7.5 / DS 7.0 / Architect 7.0 / Legal 🟢 / QA 8.5 |
| Skill 入口 | [SKILL.md](.claude/skills/redbook/SKILL.md)（V2.4，607行） |
| 标题模板 | **✅ 7 种变体** — 数字/悬念/对比/痛点/身份/场景/疑问 |
| 钩子库 | **✅ 合规版** — 5 类拆分文件，hooks/ 已通过 Legal 扫描 |
| 五维评分 | **✅ 精简版** — 合格/不合格两档 + 维度间交互 |
| 语域校准 | **✅ 精简版** — 口语化判定 + 3行风格规则 + reference/styles.md |
| 合规系统 | **✅ 5层** — 红线词 + 跨语言 + 食品功效 + 品牌推广 + 医疗暗示 |
| 数据飞轮 | **✅ V2.0** — feedback-production(96) + feedback-simulation(682) + viral-patterns(55) |
| 情感类增强 | **✅ V2.4** — 白描模式 + 钩子降级 L2→L1 |
| 人设路由 PRD | **✅ 已输出** — [V3.0 PRD](docs/persona-routing-prd-v3.md)（8种人设） |
| HANDOFF | **✅ V2.4** — [交接文档](HANDOFF.md) |
| Git | **⚠️ 本地已提交** — 无 GitHub remote，需创建后 push |
| 数据收集 | **⚠️ 96 条** — 目标 100+，register_metrics 覆盖率 0% |

**下一会话起点**：V3.0 P0 人设路由系统实现 → git push → 数据收集 100+

---

## 版本

```yaml
version: v2.4
date: 2026-06-30
changes:
  - [V2.4] 精简增强 — SKILL.md 1025→607行(-41%) + 情感类白描模式 + 情感钩子降级 + 人设路由PRD V3.0
  - [V2.3] 压力测试修复 — 13 项问题修复（4 代理全方位审查）
  - [V2.2] 5 缺口修复 — 快速模式📌标注 + 深度优化价值 + 语域量化 + 合规提醒 + fast_to_coach
  - [V2.1] P3 标注体验优化 — 首次展开警告+后续折叠为一行（竞品分析 P3）
  - [V2.0] P2 标题公式库扩充 (5→7种) + 数据文件治理 (18→3文件)
  - [V1.9] P1 三项 — 渐进式Fact Sheet + 标题公式透明化 + 智能标签生成
  - [V1.8] 双模式入口 — 工具层+教练层分层（竞品分析 P0）
  - [V1.7] 精简提炼（基于 DeepSeek 诊断 + 用户反馈）
  - 评分系统：五维评分→"3保留+3必改"实操建议（砍掉80%Token）
  - 称呼系统：四维决策树→用户首条消息决定
  - 去AI味：替换表+规则→角色扮演（一句提示词替代十页替换表）
  - Fact Sheet：强制填写→智能默填
  - 合规过滤：红线+黄线→仅红线（允许爆款表达）
  - 钩子层级：L1-L5路由→按类型默认
  - 爆款拆解：9维度→3维度
  - 语域校准：5项量化指标→口语化判断
  - [V1.6] 标题自动优化+钩子自动匹配+情感白描+爆款扩充+Fact Sheet优化
  - [V1.5] 4大问题修正（基于 100 位博主 × 5 轮迭代）
  - [V1.4] 称呼自动识别+风格预设扩展
  - [V1.3] 7项盲区修正
  - [V1.2] 情感类关键对话+好物类购买渠道
  - [V1.1] 参数调优 — 可用率 75%→92%
  - [V1.0] 从 text-lens 独立 + 6 项防御性改造
```
