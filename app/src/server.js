// server.js — MCP 服务端：注册菜单组件资源和 show_menu 工具

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { INSTRUCTIONS, toolResultText } from "./instructions.js";
import { menuShape } from "./schema.js";

// 组件 URI 是宿主的缓存键，组件或参数有不兼容改动时递增版本号
export const WIDGET_URI = "ui://menu-helper/menu-v5.html";
export const WIDGET_MIME = "text/html;profile=mcp-app";

/**
 * 创建一个 MCP 服务端实例（无状态，每个请求一个实例）
 * @param {string} widgetHtml 内联后的组件 HTML
 */
export function createServer(widgetHtml) {
  const server = new McpServer(
    { name: "menu-helper", version: "1.0.0" },
    { instructions: INSTRUCTIONS },
  );

  server.registerResource(
    "menu-widget",
    WIDGET_URI,
    { mimeType: WIDGET_MIME, description: "Interactive menu with +/− and waiter card" },
    async () => ({
      contents: [{
        uri: WIDGET_URI,
        mimeType: WIDGET_MIME,
        text: widgetHtml,
        _meta: { ui: { prefersBorder: true } },
      }],
    }),
  );

  server.registerTool(
    "show_menu",
    {
      title: "Show menu",
      description: "Shows the full translated menu as an interactive list. The user taps + / − to order and gets a waiter card in the local language. Call after reading menu photos, with every item.",
      inputSchema: menuShape,
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
      _meta: {
        ui: { resourceUri: WIDGET_URI },
        "openai/outputTemplate": WIDGET_URI,
        "openai/toolInvocation/invoking": "整理菜单…",
        "openai/toolInvocation/invoked": "菜单已就绪",
      },
    },
    async (menu) => {
      const itemCount = menu.categories.reduce((sum, c) => sum + c.items.length, 0);
      return {
        content: [{ type: "text", text: toolResultText(itemCount) }],
        structuredContent: menu,
      };
    },
  );

  return server;
}
