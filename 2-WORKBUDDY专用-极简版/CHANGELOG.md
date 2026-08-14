# 变更记录 · recruit-poster

## v1.4.0（当前 · WorkBuddy 极简版）
- 中文名定为「AI赛事英雄帖生成器」。
- **WorkBuddy 极简版**：woff2 字体 + hero PNG **全部 base64 内嵌**到 `build.mjs` / `recruit-poster-builder.html`；`assets/` 下无任何外部资源文件（无 `design-assets/`），包内**零二进制**。
- 生成的 HTML 完全自包含，双击即见完整海报（毛笔字 + 英雄背景），无需任何外部资源。
- displayName / summary / description / README / 上架填表 / 质检报告同步更新。

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
