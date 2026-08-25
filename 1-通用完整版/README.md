# AI赛事英雄帖生成器 · Recruit Poster

暗金武侠风「AI赛事英雄帖」HTML 生成 Skill。支持对话式生成与填表器两种形态，提供 1.0/2.0/3.0 多模版，一份数据内容全模版共用、仅背景与版式随模版切换。

## 两种形态
- **形态 A · 对话式生成（默认）**：用户口述赛事内容 → `build.mjs` 组装完整 HTML。
- **形态 B · 填表器**：复制 `recruit-poster-builder.html` 到工作区，浏览器自助填表、实时预览、导出。

## 快速开始（形态 A）
1. 把赛事信息写入 `招募帖-data.json`（字段见 `SKILL.md` §4.1）。
2. 运行：`node assets/build.mjs 招募帖-data.json 招募帖.html --template 2.0`
   - `--template`：`1.0`（v1 竖卡）/ `2.0`（v2 竖卡，默认）/ `3.0`（v2 长图）。
   - 生成时自动把当前模版依赖（背景图 + 字体）拷贝到输出 HTML 同级 `design-assets/`。

## 文件结构
- `SKILL.md`：完整说明与生成流程
- `assets/build.mjs`：数据(JSON) → 完整 HTML（多模版）
- `assets/design-assets/`：背景图（png + jpg + 长图 jpg）+ 毛笔字体（离线依赖）
- `assets/recruit-poster-builder.html`：填表器成品
- `assets/interview-script.md` / `-en.md`：引导式访谈剧本
- `模版演示-去敏样例.json`：脱敏占位样例数据（开源可直接引用）

## 约束与边界
- **背景锁定**：hero 位置 / 调色 / 蒙层 / 字体 / 配色在各模版内已定，Skill 只改 `.wrap` 内文字。
- **仅产 HTML**：默认不自动渲染 JPG（如需 JPG 用 `assets/render.mjs` 备用渲染）。
- **完全本地**：不联网、不向任何外部端点发送数据、不上传用户内容。