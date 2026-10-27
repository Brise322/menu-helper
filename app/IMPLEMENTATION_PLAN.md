# Menu Helper ChatGPT App 实施计划

ChatGPT App 版：AI 识别菜单后调用 `show_menu`，对话里出现可点选的菜单组件（分类标签、+/−、选项、生成卡片）。点菜、生成卡片在组件内完成，不经过 AI。

## 阶段 1: MCP 服务端
**目标**: `src/server.js`（工具 `show_menu` + 资源 `ui://menu-helper/menu-v1.html`）、`src/worker.js`（Cloudflare Workers 入口，`/mcp`）
**成功标准**: `npm test` 通过：列出工具、调用 `show_menu` 返回 structuredContent、读取组件 HTML
**状态**: 已完成

## 阶段 2: 菜单组件
**目标**: `src/widget.html`：分类标签、每道菜 +/−、必选项和常用要求、小计、服务员卡片（当地语言）、加菜卡片、暗色模式
**成功标准**: `dev/preview.html` 用 189 项样例在手机宽度下渲染；+/− 即时更新；缺必选项时不能生成卡片
**状态**: 已完成（本地预览：176 项、必选项拦截、分份要求、加菜卡片、结账卡片、暗色；wrangler dev 下 /mcp 可调用）

## 阶段 3: 部署与 ChatGPT 联调
**目标**: `wrangler deploy` 到 Cloudflare；ChatGPT 开发者模式连接 `https://<worker>/mcp`
**成功标准**: 手机 ChatGPT 发菜单照片 → 组件出现 → 点菜 → 卡片
**状态**: 进行中（等待 wrangler login）

## 阶段 4: 提交
**目标**: README 增加 App 用法；OpenAI 平台提交审核
**状态**: 未开始
