# Menu Helper · ChatGPT App

ChatGPT 版 Menu Helper：AI 读完菜单照片后调用 `show_menu`，对话里出现可点选的菜单组件。点菜、生成服务员卡片都在组件里完成，不经过 AI。

服务地址：`https://menu-helper.brise322.workers.dev/mcp`（Cloudflare Workers，无状态，不存储数据）

## 目录

```
app/
├── src/
│   ├── worker.js         Cloudflare Workers 入口：/mcp 与域名验证
│   ├── server.js         MCP 服务端：注册 show_menu 工具和组件资源
│   ├── schema.js         show_menu 参数结构（字段说明会发给模型）
│   ├── instructions.js   给模型的说明
│   ├── bundle.js         把组件的 CSS、JS 内联成单个 HTML
│   ├── widget.html       组件页面骨架
│   ├── widget.css        组件样式
│   └── widget-app.js     组件逻辑：分类、搜索、+/−、选项、卡片
├── test/server.test.js   服务端与打包测试
├── dev/
│   ├── preview.html      本地模拟 ChatGPT 宿主
│   └── sample.json       176 项样例菜单
└── wrangler.toml
```

## 数据流

1. 模型读菜单照片，按 `schema.js` 生成整张菜单，调用 `show_menu`。
2. 服务端原样返回 `structuredContent`，ChatGPT 加载组件 `ui://menu-helper/menu-v4.html`。
3. 组件通过 MCP Apps 协议（`postMessage` 上的 JSON-RPC）收到菜单，本地完成点菜。
4. 点「服务员已记下」后，组件用 `ui/update-model-context` 把已点内容告诉模型，供后续结账、核对小票。

## 点菜选项

| 字段 | 含义 | 生成卡片前 |
|---|---|---|
| `options` | 菜单要求选的（配菜、份量、套餐选项） | 必须选 |
| `extras` | 这道菜可选的（几分熟、加柠檬、少冰），同 `group` 单选 | 可不选，按店里默认 |
| `requests` | 整家店通用要求（不要洋葱、少盐） | 可不选 |

卡片上按 必选 → 可选 → 通用要求 的顺序写当地语言。

## 开发

```sh
npm install
npm test                                  # 服务端与打包测试
npx wrangler dev                          # 本地运行 http://localhost:8787/mcp
python3 -m http.server 8765 -d ..         # 然后打开 http://localhost:8765/app/dev/preview.html
npx wrangler deploy                       # 部署
```

wrangler 需要 Node.js 22 及以上。域名验证码存放在 Cloudflare secret `OPENAI_APPS_CHALLENGE`。

修改组件或 `show_menu` 参数且不兼容旧版本时，递增 `server.js` 里 `WIDGET_URI` 的版本号，并在 ChatGPT 插件页刷新。
