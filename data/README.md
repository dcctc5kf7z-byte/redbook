# 反馈数据指引 — /redbook

> 目录：收集真实用户反馈，驱动产品迭代

## 文件结构

| 文件 | 说明 | 状态 |
|------|------|------|
| `feedback.jsonl` | V1.5 模拟数据（20 条） | ✅ 历史基线 |
| `feedback-v1.1.jsonl` | V1.1 模拟数据（50 条） | ✅ 验证完成 |
| `feedback-real.jsonl` | ★ 真实用户反馈 | 🔄 收集中 |
| `README.md` | 本文件 | ✅ |

## 反馈格式（JSONL，每行一条）

```json
{
  "date": "2026-06-29",
  "content_type": "探店|好物|教程|情感|对比",
  "score": 1,
  "title_score": 25,
  "emotion_score": 20,
  "substance_score": 16,
  "hook_score": 12,
  "register_score": 8,
  "user_note": "改了标题发的",
  "source": "真实",
  "user_id": "A",
  "published": true,
  "likes": 50,
  "collects": 30,
  "comments": 8,
  "edit_ratio": 0.1
}
```

## 字段说明

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `date` | ✅ | string | 生成日期（YYYY-MM-DD） |
| `content_type` | ✅ | string | 内容类型（探店/好物/教程/情感/对比） |
| `score` | ✅ | int | 用户反馈（1=直接发了 / 2=改了一些 / 3=改了很多 / 4=没用上） |
| `title_score` ~ `register_score` | ✅ | int | 五维评分原始分数（自动记录） |
| `user_note` | 可选 | string | 用户文字反馈（≤500字） |
| `source` | ✅ | string | "模拟"=测试数据 / "真实"=实际用户 |
| `user_id` | 可选 | string | 匿名用户标识（A/B/C...） |
| `published` | 可选 | bool | 是否实际发布到小红书 |
| `likes` | 可选 | int | 发布后点赞数 |
| `collects` | 可选 | int | 发布后收藏数 |
| `comments` | 可选 | int | 发布后评论数 |
| `edit_ratio` | 可选 | float | 用户修改比例（0=没改, 1=全改） |

## 数据分析指引

### 第一步：总体健康度

```bash
# 统计反馈分布
cat feedback-real.jsonl | jq -r '.score' | sort | uniq -c | sort -rn

# 计算可用率
total=$(wc -l < feedback-real.jsonl)
available=$(cat feedback-real.jsonl | jq -r 'select(.score <= 2)' | wc -l)
echo "可用率: $(echo "scale=1; $available * 100 / $total" | bc)%"
```

### 第二步：按类型分析

```bash
# 各类型平均反馈
for type in 探店 好物 教程 情感 对比; do
  avg=$(cat feedback-real.jsonl | jq -r "select(.content_type == \"$type\") | .score" | awk '{sum+=$1; n++} END {print sum/n}')
  echo "$type: $avg"
done
```

### 第三步：维度分析

```bash
# 各维度平均分
for dim in title_score emotion_score substance_score hook_score register_score; do
  avg=$(cat feedback-real.jsonl | jq -r ".$dim" | awk '{sum+=$1; n++} END {print sum/n}')
  echo "$dim: $avg"
done
```

### 第四步：互动数据（如有）

```bash
# 有互动数据的条目统计
cat feedback-real.jsonl | jq 'select(.likes != null) | {content_type, score, likes, collects, comments}'

# 互动数据与反馈相关性
cat feedback-real.jsonl | jq -r 'select(.likes != null) | [.score, .likes] | @tsv' | awk '{print $1, $2}'
```

### 第五步：V1.5 vs 真实对比

```bash
# V1.5 模拟 vs 真实反馈分布对比
echo "=== V1.5 模拟 ==="
cat feedback.jsonl | jq -r '.score' | sort | uniq -c | sort -rn

echo "=== 真实反馈 ==="
cat feedback-real.jsonl | jq -r '.score' | sort | uniq -c | sort -rn
```

## 关键指标

| 指标 | V1.5 基线 | V1.1 模拟 | 目标（真实） |
|------|-----------|-----------|-------------|
| 样本量 | 20 | 50 | ≥30 |
| 可用率(1+2) | 75% | 92% | ≥85% |
| 完全可用率(1) | 30% | 42% | ≥40% |
| 不可用率(3+4) | 25% | 8% | ≤15% |
| 语域力均分 | 6.6 | 8.0 | ≥8.0 |

## 注意事项

- **样本量不足时不推断**：<30 条时只描述分布，不做统计检验
- **互动数据可选**：用户不提供赞/藏/评时，不强制采集
- **隐私保护**：不采集用户真实身份，user_id 为匿名标识
- **数据质量**：source="真实" 的数据优先级高于 "模拟"
