// worker.js — Cloudflare Workers 入口
//   /mcp                                  MCP Streamable HTTP（无状态，JSON 响应）
//   /.well-known/openai-apps-challenge    OpenAI 域名验证，值取自 secret OPENAI_APPS_CHALLENGE

import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createServer } from "./server.js";
import { bundleWidget } from "./bundle.js";
import widgetHtml from "./widget.html";
import widgetCss from "./widget.css";
import widgetJs from "./widget-app.js";

const WIDGET = bundleWidget(widgetHtml, widgetCss, widgetJs);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, mcp-session-id, mcp-protocol-version, authorization",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

async function handleMcp(request) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });

  const server = createServer(WIDGET);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);

  const response = await transport.handleRequest(request);
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) headers.set(key, value);
  return new Response(response.body, { status: response.status, headers });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    switch (pathname) {
      case "/":
        return new Response("Menu Helper MCP server: /mcp");
      case "/.well-known/openai-apps-challenge":
        return new Response(env.OPENAI_APPS_CHALLENGE || "", { headers: { "content-type": "text/plain" } });
      case "/mcp":
        return handleMcp(request);
      default:
        return new Response("Not Found", { status: 404 });
    }
  },
};
