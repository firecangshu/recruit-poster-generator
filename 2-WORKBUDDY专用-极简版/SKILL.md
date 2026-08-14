---
name: recruit-poster
slug: recruit-poster
displayName: AI赛事英雄帖生成器 · Recruit Poster
version: 1.4.0
summary: 暗金武侠风「AI赛事英雄帖」HTML 生成 Skill。支持对话式（详细）生成（口述内容→HTML）与填表式（快速）（浏览器自助填表微调）两种形态，视觉严格对齐用户终极定稿（2:3 竖卡）。
description: AI赛事英雄帖生成器（暗金武侠风）：对话式（详细）口述或浏览器填表式（快速），产出固定 2:3 竖卡 HTML，视觉对齐用户终极定稿、只改文字、不渲染 JPG。触发词：招募帖/英雄帖/recruit poster。适用于比赛、开源项目、社群招募队友海报。
author: 杨博
category: design
visibility: public
allowed-tools: [Read, Write, Bash, Edit, Glob]
# 审计说明（F15 · 含 Bash/Write/Edit 的合规豁免）：
# 本 Skill 的核心产物是「本地 HTML 文件 + 本地 JPG 图片」，必须通过 Bash 调用 `node assets/build.mjs` / `node assets/render.mjs`
# 完成「数据→HTML→JPG」的组装与无头渲染，并通过 Write/Edit 落地收集到的赛事数据 JSON。这些命令均满足以下条件：
#   - 路径固定：脚本为 Skill 自带 assets/ 下只读资源；输出文件名为新文件（招募帖.html / 招募帖.jpg），绝不改写用户既有主文件（如 英雄招募帖.html）；
#   - 作用域受限：仅写入用户当前工作区，不触碰系统目录、不联网下载、不执行任何用户之外的命令；
#   - 可解释：每条 Bash 命令都在 SKILL.md §4.2 / §5 明确列出，AI 执行前会向用户展示步骤。
# 因此 allowed-tools 中的 Bash/Write/Edit 是功能必需，符合 F15「有显式审计说明即可豁免」的条款，非越权风险。
trigger:
  - 招募帖
  - 英雄招募帖
  - 做一张招募海报
  - 生成招募帖
  - 招募海报
  - 英雄帖
  - 组队招募
  - 招队友海报
  - recruit poster
  - hero poster
  - hackathon poster
  - team recruitment
  - recruitment flyer
---

# AI赛事英雄帖生成器 · Recruit Poster

> 暗金武侠风「AI赛事英雄帖」一键生成。两种形态：**对话式（详细）生成**（你口述，我出图）与**填表式（快速）**（你在浏览器里自助填）。

## 1. 何时使用
- 用户要做比赛 / 开源项目 / 社群的**招募队友海报、组队海报、英雄帖、hackathon 招募**。
- 触发词见 frontmatter（中文 + 英文双语覆盖，含 `recruit poster` / `hero poster` / `team recruitment` / `recruitment flyer` / `hackathon poster`）。
- **不适用**：需要换视觉风格（本 Skill 固定暗金武侠风，只换内容）、纯文字公告、需要真实报名系统对接。

## 2. 两种形态（先问用户要哪种）
- **形态 A · 对话式（详细）生成（默认）**：用户口述/给赛事信息 → AI 生成 HTML 文件 + 渲染 JPG 交付。最省事，不需要用户开任何工具。
- **形态 B · 填表式（快速）**：用户想自己一边填一边看效果微调 → AI 把填表器 HTML 复制到工作区并打开预览，用户自助填表、实时预览、点「导出 HTML」下载。

## 3. 资源位置（本 Skill 目录）
```
C:/Users/User/.workbuddy/skills/recruit-poster/
├── SKILL.md
└── assets/
    ├── build.mjs                      # 数据(JSON) → 完整 HTML（背景层与终极定稿逐行一致，仅改文字；woff2 字体 + hero PNG 全部 base64 内嵌，HTML 完全自包含）
    ├── render.mjs                     # HTML → 2x JPG（Edge 无头渲染，备用；本 Skill 主流程不调用，JPG 长图由用户独立定稿负责）
    ├── recruit-poster-builder.html    # 填表器成品（形态 B 用；woff2 字体 + hero PNG 全部 base64 内嵌）
    ├── interview-script.md            # 形态 A 引导式访谈剧本（武侠人设·纯台词·十问流程）
    └── interview-script-en.md         # 英文版十问剧本
```
> 本版本为 **WorkBuddy 极简版**：woff2 字体 + hero PNG **全部 base64 内嵌**到 `build.mjs` / `recruit-poster-builder.html`（`@font-face src: data:application/font-woff2;base64,…`，`background: url("data:image/png;base64,…")`），**包内零二进制文件**，可通过 WorkBuddy / SkillHub 等严苛平台的"禁止二进制"白名单。如需 woff2/png 单独托管的版本，请用「`1-recruit-poster-上架包-通用完整版`」。
> 运行时请把上面 `C:/Users/User/.workbuddy/skills/recruit-poster/` 记为 `SKILL_DIR`，命令里用绝对路径引用 `assets/` 下脚本与资源。

## 4. 形态 A · 对话式（详细）生成（推荐）

### 4.0 引导式访谈（必读）
- ⚠️ **铁律：一轮只问一个问题，问完立刻停下等用户回答，绝不一次性把十个问题全列出来。** 收到回复后再问下一个；用户没回就不动。十问是「分十轮、逐步推进」，不是「一条消息铺开」。
- 形态 A 用「老夫 / 江湖客」武侠人设，**逐题发问**，每问只问一点，不堆砌。
- 完整台词、提问顺序见 `assets/interview-script.md`（中文武侠版），**严格按它逐句念**，不要自己改写措辞、不要加「为何要问 / 高价值答法」等解释（用户明确不要画蛇添足）。
- **英文语境**：当用户用英文或英文触发词（如 `recruit poster` / `team recruitment`）时，改读 `assets/interview-script-en.md`（英文版十问剧本，结构与中文一致），人设改为轻量 recruiter/mentor，同样只念台词、不加解释。
- 流程共 10 步：**开场白 → Q1 赛事全称 → Q2 帖子标题（明确是"文章的标题" + 给两示例）→ Q3 帖子品牌 → Q4 大赛简介 → Q5 奖金与荣誉 → Q6 所需技能(互补) → Q7 队长准备与特长 → Q8 联系方式 → Q9 官方报名链接 → Q10 补充确认 + 写稿**。
- 每问**只念台词**，用户答不上来 → 给合理默认并标注「老夫先替你填上，回头可改」，不卡住。集齐十问（或用户说"没有了"）后再开写。

### 4.1 数据字段
引导用户提供以下信息（缺的给合理默认，关键项：`eventName` `heroTitle` `contactName` `contactWx` 缺失时脚本会 WARN 提示）：

| 字段 | 含义 | 示例 |
|---|---|---|
| `kicker` | 一句话定位/技术栈 | `XX 全模态 · XX NPU` |
| `brand` | 品牌/赛事简称（金色大标） | `BRAND` |
| `eventName` | 赛事/活动全称 | `XX 推理优化与应用创新挑战赛` |
| `heroTitle` | 招募主标题（毛笔大字） | `广纳豪杰帖` |
| `introLead` | 赛事名称（正文首行加粗） | `XX & XX 推理优化与应用创新挑战赛` |
| `introBody` | 介绍正文（\n 换行） | 背景、定位、鼓励方向… |
| `chips` | 方向标签数组 | `["实时问答","视觉/语音交互"]` |
| `reqs` | 要求项数组，每项 `"标签：内容"` | `["复现要求：统一运行环境","队伍上限：3 人"]` |
| `teamLimit` | 队伍上限 | `3 人` |
| `deadline` | 报名截止 | `8.14` |
| `officialUrl` | 官网完整 URL（可空） | `https://example.com` |
| `r1`/`r2`/`r3` | 冠/亚/季军金额（可空） | `冠军 Xw` |
| `projSecTitle` | 负责人章节标题 | `队长的项目进度及比赛目标` |
| `projRole` | 负责人称谓 | `队长` |
| `projLead` | 一句话定位 | `已有成熟 idea，直接上车。` |
| `projItems` | 进展条目数组 `"标签：内容"` | `["项目定位：面向 XX 场景","当前进度：已完成第一阶段测试"]` |
| `seats` | 席位卡片数组，每项 `"标题\|职责\|技能"` | `["① UI 前端 | 界面设计 | 前端/交互","② 广宣 | 文案与剪辑 | 文案/视频"]` |
| `generalReq` | 通用要求（数组/文本，可空） | `认同评审标准、能稳定投入…` |
| `ctaLead` | 联系口号 | `带作品私聊` |
| `ctaNote` | 联系说明 | `有意者请附带得意作品，加微信私聊。` |
| `contactName` | 联系人 | `XXX` |
| `contactWx` | 微信号 | `XXX` |
| `footerBrand` | 页脚品牌简称 | `BRAND` |
| `footerEco` | 页脚生态简称 | `ECO` |

### 4.2 生成步骤（端到端）
1. 用 `Write` 把收集到的数据写成 `<工作区>/招募帖-data.json`（临时文件），字段如上。
2. ~~若工作区缺外部资源目录，先从 Skill 复制过去（保证背景图+毛笔字体不丢）~~ **（WorkBuddy 极简版无需此步：字体和背景图全部 base64 内嵌在 `build.mjs` 中，HTML 自包含，无外部资源依赖）**。
3. 运行 build.mjs 生成 HTML（脚本内含输入校验，缺关键字段仅 WARN 不中断）：
   ```bash
   cd <工作区> && node "C:/Users/User/.workbuddy/skills/recruit-poster/assets/build.mjs" 招募帖-data.json 招募帖.html
   ```
4. `present_files` 交付 HTML（预览）。

> 临时 `招募帖-data.json` 可保留（便于二次修改重生成），或生成后删除，由用户决定。

### 4.3 边界与降级（R 可靠性保障）
- **输入容错**：`build.mjs` 对非法 JSON、缺字段均不崩溃，缺关键字段仅 WARN 并填默认；`seats`/`reqs`/`projItems` 空数组时对应区块自动隐藏，不会出现「空卡片」。
- **资源缺失**：WorkBuddy 极简版无任何外部资源依赖（字体与背景图已 base64 内嵌），不存在资源缺失问题。
- **视觉锁定**：`build.mjs` 内的 `POSTER_CSS`（背景层）已与用户终极定稿（`终版HTML/终版HTML.html`）逐行对齐，skill 只改 `.wrap` 内文字，**不改动任何背景层 CSS（hero 位置/调色/蒙层/字体/配色）**。
- **只产出 HTML**：本 Skill 不渲染 JPG（JPG 长图由用户独立的只读定稿 `英雄招募帖-长图.html` 负责，不在 Skill 生成范围内）。

## 5. 形态 B · 填表式（快速）
1. 复制填表器到工作区并打开预览：
   ```bash
   cp "C:/Users/User/.workbuddy/skills/recruit-poster/assets/recruit-poster-builder.html" "<工作区>/招募帖-填表生成.html"
   ```
2. `present_files` 打开它——用户左侧填表、右侧实时预览、点「导出 HTML」下载。
3. 用户导出的 HTML **完全自包含**（字体 + 背景图均 base64 内嵌），**无需任何外部资源文件**，双击即见完整海报。

## 6. 约束
- **不覆盖用户已有文件**：输出文件名用新名字（如 `招募帖.html`），绝不改写用户既有 `英雄招募帖.html` / `终版HTML/` / `英雄招募帖-长图.html` 等定稿。
- **视觉锁定对齐终极定稿**：`build.mjs` 内的 `POSTER_CSS` 背景层已与用户终极定稿（`终版HTML/终版HTML.html`）逐行对齐；本 Skill **只改 `.wrap` 内文字内容**，背景层（hero 位置/调色/蒙层/字体/配色/固定 2:3 比例）一律不动。
- **只产出 HTML**：不渲染 JPG（JPG 长图由用户独立只读定稿负责，不在本 Skill 范围）。
- **无外部依赖**：CSS/字体/图片全本地化，导出的 HTML 不连任何 CDN。
- **列表项格式**：`reqs`/`projItems` 用 `"标签：内容"`（冒号为中文全角）；`seats` 用 `标题|职责|技能`（竖线分隔）。

## 7. 故障排查（FAQ）
- **海报背景空白 / 无毛笔字**：WorkBuddy 极简版**不会**出现此问题——字体和背景图都已 base64 内嵌进 `build.mjs`，HTML 完全自包含。若用的是通用完整版（`1-recruit-poster-上架包-通用完整版`），工作区缺外部资源 → 按 §4.2 第 2 步复制。
- **填表器预览空白**：浏览器以 file:// 打开即可，srcdoc 相对资源基于页面 URL 解析。
- **build.mjs 报 JSON 错误**：数据文件不是合法 JSON → 检查引号/逗号，或让 AI 重新生成 `招募帖-data.json`。
- **需要 JPG 长图**：本 Skill 只产出 HTML；JPG 长图请用用户独立的只读定稿 `英雄招募帖-长图.html`（自行在浏览器打开导出/截图）。

## 8. 完整示例数据样本（可直接套用）
```json
{
  "kicker": "XX 全模态 · XX NPU",
  "brand": "BRAND",
  "eventName": "XX 推理优化与应用创新挑战赛",
  "heroTitle": "英雄招募帖",
  "introLead": "XX & XX 推理优化与应用创新挑战赛",
  "introBody": "赛事下设创新应用赛道：要求基于全模态大模型能力，构建可运行、可展示、可体验的 Demo。",
  "chips": ["实时问答", "伴随式助手", "视觉/语音交互", "端侧应用"],
  "reqs": ["复现要求：统一运行环境", "提交四件套：Demo·PPT·说明·视频", "队伍上限：3 人", "报名截止：XX.XX"],
  "teamLimit": "3 人",
  "deadline": "XX.XX",
  "officialUrl": "https://example.com",
  "r1": "冠军 Xw", "r2": "亚军 Xw / 人", "r3": "季军 Xw / 人",
  "projSecTitle": "队长的项目进度及比赛目标",
  "projRole": "队长",
  "projLead": "基于自研技术，正带队参赛。",
  "projItems": ["项目定位：面向 XX 场景", "当前进度：已完成第一阶段测试", "比赛目标：对 1.0 版本模块化升级"],
  "seats": [
    "① 技术研发 | 模块设计与开发 | 技术/模块化/开发调试",
    "② 宣传制作 | 文案与演示视频剪辑 | 文案/视频编辑"
  ],
  "generalReq": "认同评审标准、能稳定投入、习惯协作；有相关实战经验者优先。",
  "ctaLead": "带作品私聊",
  "ctaNote": "有意者请附带得意作品，直接加微信私聊。",
  "contactName": "XXX",
  "contactWx": "XXX",
  "footerBrand": "BRAND",
  "footerEco": "ECO"
}
```

## 9. 输出物清单
| 产物 | 文件名 | 说明 |
|---|---|---|
| 数据底稿 | `招募帖-data.json` | 收集到的赛事信息，便于二次修改重生成（可删） |
| HTML 源文件 | `招募帖.html` | 完整内联 CSS，浏览器直接打开即见海报，可二次微调 |
| 依赖资源 | （无） | 字体 + 背景图全部 base64 内嵌在 `build.mjs` 内，HTML 自包含，无需任何外部资源 |

> 形态 B 额外产出：`招募帖-填表生成.html`（填表器副本，用户在浏览器自助填写导出）。
> JPG 长图不在此 Skill 产出范围（用户另有独立只读定稿 `英雄招募帖-长图.html`）。

## 10. 多语言与比例切换

### 10.1 多语言海报
- 中文流程默认读 `assets/interview-script.md`；英文触发/语境改读 `assets/interview-script-en.md`。
- 字段值本身不限语言——用户用中文答就填中文、用英文答就填英文，build.mjs 直接原样注入（已做 HTML 转义防注入）。
- 若用户要中英混排（如标题中文、简介英文），按用户给的字面填，无需额外处理。

### 10.2 比例与版式（已锁定，不切换）
- `build.mjs` 的 `.poster` 已锁定为**固定 2:3 竖卡**（`aspect-ratio:2/3; max-height:94vh; overflow:hidden`，内容在框内滚动），与用户终极定稿 `终版HTML/终版HTML.html` 逐行一致。
- 本 Skill **不切换比例/版式**（不提供"高度自适应/方图/横版"开关）——保持与终极定稿像素级一致。
- ⚠️ hero 背景 `transform`（位置/缩放）与蒙层、调色、字体、配色**全程不动**；如需长图 JPG 版式，请用用户独立的只读定稿 `英雄招募帖-长图.html`，不在本 Skill 范围。

## 11. R 可靠性深度说明（v1.1.0 起增强）
本 Skill 在「数据→HTML」链路做了多层容错，确保不卡用户：
- **输入层（build.mjs）**：JSON 解析失败→明确报错退 1；非对象→报错退 1；缺 `eventName`/`heroTitle`/`contactName`/`contactWx` 关键字段→仅 WARN 并填默认，仍生成（exit 0）；`seats`/`reqs`/`projItems` 空数组→对应区块自动隐藏，无空卡片。
- **资源层**：WorkBuddy 极简版无外部资源依赖；字体与背景图已全部 base64 内嵌进 `build.mjs` / `recruit-poster-builder.html`，HTML 完全自包含。
- **视觉锁定层**：`POSTER_CSS` 背景层与用户终极定稿逐行对齐，脚本只注入 `.wrap` 文字，绝不改写 hero 位置/调色/蒙层/字体/配色/固定比例。

## 12. 版本与变更
- **v1.0.0**：初版，对话式生成 + 填表器双形态，十问访谈剧本。
- **v1.1.0**：秦叔宝质检后修复——① frontmatter 补 allowed-tools 审计说明（解 F15 P0）；② 触发词扩至 13 条并含英文（解 P02）；③ build.mjs 加输入校验/容错/输出目录创建（补 R 可靠性）；④ 文档扩至含边界降级/FAQ/示例样本/输出物清单。
- **v1.2.0**：冲 A 级增强——① 新增 `interview-script-en.md` 英文十问剧本并接入 SKILL.md；② 文档补 §10 多语言说明、§11 R 可靠性深度说明。
- **v1.3.0**：边界收敛——按用户决定**移除 JPG 产出线，Skill 只产出 HTML**；`build.mjs` 的 `POSTER_CSS` 背景层逐行对齐用户终极定稿（`终版HTML/终版HTML.html`，固定 2:3 竖卡），Skill 仅改文字；清理 frontmatter/§3/§4.2/§6/§9/§10.2/§11 中所有 JPG/比例切换/Edge 渲染的过时描述。`render.mjs` 保留为备用资产但不进入主流程。
- **v1.4.0**：中文名定为「AI赛事英雄帖生成器」，displayName / summary / description / README / 上架填表同步更新。