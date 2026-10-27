// worker.js
// Cloudflare Workers 入口：/mcp 走 MCP Streamable HTTP（无状态）
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createServer } from "./server.js";
import widgetHtml from "./widget.html";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, mcp-session-id, mcp-protocol-version, authorization",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/") return new Response("Menu Helper MCP server: /mcp");
    if (url.pathname === "/.well-known/openai-apps-challenge") {
      return new Response(env.OPENAI_APPS_CHALLENGE || "", { headers: { "content-type": "text/plain" } });
    }
    if (url.pathname !== "/mcp") return new Response("Not Found", { status: 404 });
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

    const server = createServer(widgetHtml);
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    await server.connect(transport);
    const res = await transport.handleRequest(request);
    const headers = new Headers(res.headers);
    for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
    return new Response(res.body, { status: res.status, headers });
  },
};
