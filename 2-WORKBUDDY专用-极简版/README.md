# AI赛事英雄帖生成器 · Recruit Poster

暗金武侠风「AI赛事英雄帖」HTML 生成 Skill。支持对话式生成与填表器两种形态，视觉严格对齐用户终极定稿（固定 2:3 竖卡），只改文字、不染背景、不产 JPG。

## 两种形态
- **形态 A · 对话式生成（默认）**：用户口述赛事内容 → `build.mjs` 组装完整 HTML。
- **形态 B · 填表器**：复制 `recruit-poster-builder.html` 到工作区，浏览器自助填表、实时预览、导出。

## 快速开始（形态 A）
1. 把赛事信息写入 `招募帖-data.json`（字段见 `SKILL.md` §4.1）。
2. 确保工作区有 `design-assets/`（无则复制本包 `assets/design-assets`）。
3. 运行：`node assets/build.mjs 招募帖-data.json 招募帖.html`
4. 浏览器打开 `招募帖.html` 即见海报。

## 文件结构
- `SKILL.md`：完整说明与生成流程
- `assets/build.mjs`：数据(JSON) → 完整 HTML
- `assets/design-assets/`：背景图 + 毛笔字体（离线依赖）
- `assets/recruit-poster-builder.html`：填表器成品
- `assets/interview-script.md` / `-en.md`：引导式访谈剧本

## 约束与边界
- **背景锁定**：hero 位置 / 调色 / 蒙层 / 字体 / 配色 / 固定 2:3 比例一律不动，Skill 只改 `.wrap` 内文字。
- **仅产 HTML**：JPG 长图由用户独立只读定稿负责，不在本 Skill 范围。
- **完全本地**：不联网、不向任何外部端点发送数据、不上传用户内容。
