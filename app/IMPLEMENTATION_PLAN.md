# Menu Helper ChatGPT App 实施计划

ChatGPT App 版：AI 识别菜单后调用 `show_menu`，对话里出现可点选的菜单组件（分类标签、+/−、选项、生成卡片）。点菜、生成卡片在组件内完成，不经过 AI。

## 阶段 1: MCP 服务端
**目标**: `src/server.js`（工具 `show_menu` + 资源 `ui://menu-helper/menu-v3.html`）、`src/worker.js`（Cloudflare Workers 入口，`/mcp`）
**成功标准**: `npm test` 通过：列出工具、调用 `show_menu` 返回 structuredContent、读取组件 HTML
**状态**: 已完成

## 阶段 2: 菜单组件
**目标**: `src/widget.html`：分类标签、每道菜 +/−、必选项和常用要求、小计、服务员卡片（当地语言）、加菜卡片、暗色模式
**成功标准**: `dev/preview.html` 用 189 项样例在手机宽度下渲染；+/− 即时更新；缺必选项时不能生成卡片
**状态**: 已完成（本地预览：176 项、必选项拦截、分份要求、加菜卡片、结账卡片、暗色；wrangler dev 下 /mcp 可调用）

## 阶段 3: 部署与 ChatGPT 联调
**目标**: `wrangler deploy` 到 Cloudflare；ChatGPT 开发者模式连接 `https://<worker>/mcp`
**成功标准**: 手机 ChatGPT 发菜单照片 → 组件出现 → 点菜 → 卡片
**状态**: 已完成（已部署 https://menu-helper.brise322.workers.dev/mcp ；ChatGPT 网页版实测：组件出现、分类切换、加减、小计、法语卡片全屏）

## 阶段 4: 提交
**目标**: README 增加 App 用法；OpenAI 平台提交审核
**已备**: PRIVACY.md、TERMS.md、plugin/mcp.json、plugin.json 四个网址 + 5 正 3 负测试用例（review/ 测试图）、/.well-known/openai-apps-challenge（读环境变量 OPENAI_APPS_CHALLENGE）
**已核实（2026-10-27）**: 域名验证通过；公开 MCP 草稿已建立，分类为 Travel；后台重新扫描到 `extras` 参数。发布包内部名为 `menu-helper-app`，仅包含 MCP 与上架元数据，保留仓库中的原文字版 skill 供单独使用。
**实测**: 基于 17c7218 刷新个人插件后，牛排不选熟度可直接出卡片，三分熟显示 Saignant；菜单印明的汉堡配菜不选会拦截，选择薯条后显示 Avec des frites。数量增减、全屏卡片、加菜、结账合计、日语过敏说明、三页菜单 12 类 59 项和中文搜索均已在 ChatGPT 网页实测。现有服务端测试 4/4 通过。
**已发现**: ChatGPT 仍可能在工具后补充介绍，未严格遵守简短收尾指令；本轮没有修改 app/src/。
**材料**: 演示使用真实浏览器画面，省略准备与等待；菜单均为测试样例。三张上架截图宽度均为 706 像素。视频链接写入 demo_recording_url。
**待办**: 重新上传审核包并核对材料；最终政策声明与 Submit for review 由项目所有者本人操作。
**状态**: 审核材料准备中，尚未提交审核或上架
