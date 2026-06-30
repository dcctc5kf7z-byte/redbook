# 反馈数据指引 — /redbook v2.0

> 数据治理重构完成。18 个 JSONL 源文件 → 3 个标准化文件 + archive。
> 本次重构移除了 feedback-real.jsonl 中 83.7% 的污染数据（495 条误混入的迭代数据），建立了统一的 schema_version 追踪。

## 文件结构

| 文件 | 说明 | 记录数 | schema_version |
|------|------|--------|---------------|
| `feedback-production.jsonl` | **真实用户反馈** — 小红书用户实际使用评分 + 互动数据 | 96 | 2.0 |
| `feedback-simulation.jsonl` | **模拟反馈** — 5 维评分 + 100轮迭代数据合并 | 682 | 2.0 |
| `viral-patterns.jsonl` | **爆款特征库** — 各内容类型的爆款参数 | 55 | 2.0 |
| `archive/` | 原始文件归档（旧版 + 压力测试） | 9 files | — |

## 字段说明 — feedback-production.jsonl (schema_version=2.0)

```json
{
  "schema_version": "2.0",
  "date": "2026-06-29",
  "content_type": "探店|好物|教程|情感|对比",
  "score": 2,
  "title_score": 26,
  "emotion_score": 21,
  "substance_score": 17,
  "hook_score": 13,
  "register_score": 9,
  "user_note": "改了两个字就发了",
  "source": "真实",
  "user_id": "A",
  "published": true,
  "likes": 128,
  "collects": 45,
  "comments": 23,
  "edit_ratio": 0.02
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `schema_version` | string | ✅ | 当前为 `"2.0"` |
| `date` | string | ✅ | 反馈生成日期 (YYYY-MM-DD) |
| `content_type` | string | ✅ | 内容类型：探店/好物/教程/情感/对比 |
| `score` | int | ✅ | 用户反馈：1=直接发了 / 2=改了一些 / 3=改了很多 / 4=没用上 |
| `title_score` ~ `register_score` | int | ✅ | 五维评分原始分数（30分制） |
| `user_note` | string | 可选 | 用户文字反馈 (≤500字) |
| `source` | string | ✅ | `"真实"` 或 `"模拟"` |
| `user_id` | string | ✅ | 匿名用户标识 |
| `published` | bool | 有则填 | 是否实际发布 |
| `likes/collects/comments` | int | 有则填 | 发布后互动数据 |
| `edit_ratio` | float | 有则填 | 用户修改比例 (0~1) |

## 字段说明 — feedback-simulation.jsonl (schema_version=2.0)

统一了两种数据来源：
- **A 族**（feedback / v1.1 / v1.2）：5 维评分，无迭代细节
- **C 族**（feedback-100-* / deep-iterations）：多轮迭代数据，无 5 维评分

核心字段：

| 字段 | 说明 | A 族 | C 族 |
|------|------|------|------|
| `schema_version` | `"2.0"` | ✅ | ✅ |
| `source` | `"模拟"` | ✅ | ✅ |
| `_origin` | 来源文件名 | ✅ | ✅ |
| `content_type` | 内容类型 | ✅ | ✅ |
| `score` | 评分 | ✅ | 1-3 标准 |
| `date` | 日期 | ✅ | null |
| `title_score` ~ `register_score` | 五维评分 | ✅ | null |
| `user_note` | 用户备注 | ✅ | 同 `user_feedback` |
| `round` | 迭代轮次 | null | ✅ |
| `user_id` | 用户标识 | null | ✅ |
| `blogger` | 对标博主 | null | ✅ |
| `type` | 垂类 | null | ✅ |
| `scenario` | 写作场景 | null | ✅ |
| `user_request` | 用户指令 | null | ✅ |
| `system_output` | 系统生成 | null | ✅ |
| `user_feedback` | 用户评价 | null | ✅ |
| `dimension_feedback` | 维度诊断 | null | ✅ |
| `iteration` | 迭代标记 | null | ✅ |
| `version` | 版本号 | v1.2 only | null |

## 字段说明 — viral-patterns.jsonl (schema_version=2.0)

爆款内容特征参数：

`date`, `content_type`, `title_type`, `hook_type`, `emotion_curve`,
`substance_density`, `sentence_style`, `greeting`, `emoji_density`,
`hook_level`, `personal_marker`, `source`, `schema_version`

## 数据质量说明

| 问题 | 说明 | 状态 |
|------|------|------|
| `feedback-real.jsonl` 污染 | 495 条迭代数据误混入真实反馈，已去除 | ✅ 已修复 |
| JSON 同行拼接 | 2 行双记录无换行符，已拆分 | ✅ 已修复 |
| 压力测试引号转义 | 6 行未转义 ASCII 引号，已归档原文件 | ⚠️ 归档保留 |
| 知识类评分 5 分 | 9 条非标准评分（feedback-100-know），需人工确认映射 | ⏳ 待确认 |

## 快速分析

```bash
# 总体健康度
cat feedback-production.jsonl | node -e "
  const d=require('fs').readFileSync('/dev/stdin','utf-8').split('\\n').filter(l=>l.trim()).map(JSON.parse);
  const s=d.reduce((a,o)=>{a[o.score]=(a[o.score]||0)+1;return a},{});
  console.log('Score distribution:', JSON.stringify(s));
  console.log('Usability (score<=2):', d.filter(o=>o.score<=2).length + '/' + d.length);
"

# 各内容类型平均分
cat feedback-production.jsonl | node -e "
  const d=require('fs').readFileSync('/dev/stdin','utf-8').split('\\n').filter(l=>l.trim()).map(JSON.parse);
  const g={};
  d.forEach(o=>{if(!g[o.content_type])g[o.content_type]={sum:0,n:0};g[o.content_type].sum+=o.score;g[o.content_type].n++});
  Object.entries(g).forEach(([k,v])=>console.log(k+': '+(v.sum/v.n).toFixed(2)+' (n='+v.n+')'));
"
```

## 关键指标

| 指标 | V1.5 基线 | V1.1 模拟 | V2.0 真实 |
|------|-----------|-----------|-----------|
| 样本量 | 20 | 50 | **96** |
| 可用率(1+2) | 75% | 92% | 待分析 |
| 完全可用率(1) | 30% | 42% | 待分析 |
| 语域力均分 | 6.6 | 8.0 | 待分析 |

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 2.0 | 2026-06-30 | 数据治理重构：18→3 文件，schema_version 追踪，污染清理 |
| 1.x | — | 原始分散文件，无统一 schema 约束 |

## 注意事项

- **样本量不足时不推断**：<30 条时只描述分布，不做统计检验
- **互动数据可选**：用户不提供赞/藏/评时，不强制采集
- **隐私保护**：不采集用户真实身份，user_id 为匿名标识
- **数据质量**：source="真实" 的数据优先级高于 "模拟"
- **feedback-100-know.jsonl 的 score=5**：9 条非标准评分，映射到标准 1-4 分制前需人工确认
