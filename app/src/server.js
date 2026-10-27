// server.js — MCP 服务端：注册菜单组件资源和 show_menu 工具

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { INSTRUCTIONS, toolResultText } from "./instructions.js";
import { menuShape } from "./schema.js";
import { cleanAllergyText } from "./allergy.js";

// 组件 URI 是宿主的缓存键，组件或参数有不兼容改动时递增版本号
export const WIDGET_URI = "ui://menu-helper/menu-v9.html";
export const WIDGET_MIME = "text/html;profile=mcp-app";

// 宿主可能仍缓存旧版本的 URI，旧版本统一返回当前组件
const WIDGET_ANY_VERSION = "ui://menu-helper/{name}.html";

/**
 * 创建一个 MCP 服务端实例（无状态，每个请求一个实例）
 * @param {string} widgetHtml 内联后的组件 HTML
 */
export function createServer(widgetHtml) {
  const server = new McpServer(
    { name: "menu-helper", version: "1.0.0" },
    { instructions: INSTRUCTIONS },
  );

  const widgetContents = (uri) => ({
    contents: [{
      uri: uri.href,
      mimeType: WIDGET_MIME,
      text: widgetHtml,
      _meta: { ui: { prefersBorder: true } },
    }],
  });

  server.registerResource(
    "menu-widget",
    WIDGET_URI,
    { mimeType: WIDGET_MIME, description: "Interactive menu with +/− and waiter card" },
    async (uri) => widgetContents(uri),
  );

  server.registerResource(
    "menu-widget-previous",
    new ResourceTemplate(WIDGET_ANY_VERSION, { list: undefined }),
    { mimeType: WIDGET_MIME, description: "Earlier widget versions, served as the current widget" },
    async (uri) => widgetContents(uri),
  );

  server.registerTool(
    "show_menu",
    {
      title: "Show menu",
      description: "Shows the full translated menu as an interactive list. The user taps + / − to order and gets a waiter card in the local language. "
        + "Call after reading menu photos, with every item, cuisine, intro, 3–5 mustTry numbers, and an emoji and course per category. "
        + "After it returns, write at most two lines: ⚠️ unreadable parts only if any, then an invitation to ask follow-up questions "
        + "with 2–3 concrete examples about this menu or restaurant. Never report what you did or count items or pages.",
      inputSchema: menuShape,
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
      _meta: {
        ui: { resourceUri: WIDGET_URI },
        "openai/outputTemplate": WIDGET_URI,
        "openai/toolInvocation/invoking": "整理菜单…",
        "openai/toolInvocation/invoked": "菜单已就绪",
      },
    },
    async (input) => {
      const menu = cleanAllergyText(input);
      const itemCount = menu.categories.reduce((sum, c) => sum + c.items.length, 0);
      return {
        content: [{ type: "text", text: toolResultText(itemCount) }],
        structuredContent: menu,
      };
    },
  );

  return server;
}
