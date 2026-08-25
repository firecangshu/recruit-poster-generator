# 变更记录 · recruit-poster

## v1.6.0（当前）
- `build.mjs` 生成时自动把当前模版依赖的背景图 + 毛笔字体拷贝到输出 HTML 同级的 `design-assets/`，消除跨工作区缺图问题（相对路径引用不再依赖手动补齐素材）。

## v1.5.0
- 多模版系统：`build.mjs` 新增 `--template` 参数，支持 1.0（v1 单人竖卡）/ 2.0（v2 五人竖卡，默认）/ 3.0（v2 五人长图）三套模版。
- `design-assets/` 补全 v2 背景图（`hero-silhouette.jpg` + `hero-silhouette-long.jpg`）。
- 一份数据 `招募帖-data.json` 内容全模版共用，仅背景图与版式（竖卡 2:3 / 长图自适应）随模版切换。
- SKILL.md 同步更新 §3/§4.2/§6/§9/§10.2。
- 新增脱敏占位样例 `模版演示-去敏样例.json`（开源可直接引用，无真实 PII）。

## v1.4.0
- 中文名定为「AI赛事英雄帖生成器」：displayName / README / 上架填表同步更新。

## v1.3.0
- 边界收敛：移除 JPG 产出线，Skill 仅产出 HTML。
- `build.mjs` 背景层逐行对齐用户终极定稿（`终版HTML/终版HTML.html`，固定 2:3 竖卡）。
- 清理 frontmatter / 文档中所有 JPG / 比例切换 / Edge 渲染的过时描述。
- `render.mjs` 保留为备用资产，不进入主流程。
- `description` 收口至 115 字，过秦叔宝 F06 封装合规（30–200 上限）。

## v1.2.0
- 新增英文十问剧本 `interview-script-en.md`。
- 文档补充多语言与 R 可靠性说明。

## v1.1.0
- 秦叔宝质检后修复：frontmatter 补 `allowed-tools` 审计说明（解 F15 P0）；触发词扩至 13 条含英文；`build.mjs` 输入校验 / 容错 / 输出目录创建（补 R 可靠性）。

## v1.0.0
- 初版：对话式生成 + 填表器双形态，十问访谈剧本。