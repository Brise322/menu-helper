// server.js
// MCP 服务端：工具 show_menu + 菜单组件资源
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export const WIDGET_URI = "ui://menu-helper/menu-v2.html";
export const WIDGET_MIME = "text/html;profile=mcp-app";

export const INSTRUCTIONS = `Menu Helper: the user sends restaurant menu photos and orders from an interactive menu.

When the user sends menu photos:
1. In chat, in USER LANGUAGE (the language the user writes in; Simplified Chinese if only photos), write only:
   - \`📍 <restaurant> · <currency code> · <N> categories · <M> items\`
   - \`🗺️ <cuisine and region, as specific as the menu allows>\`
   - 1–2 sentences: what kind of place, how people eat here, price level. Emoji only when they match exactly.
   - \`🏅 必尝：<3–5 dishes on this menu the region is famous for, with #>\` — skip if none.
   - If the user sent context or questions with the photo, answer briefly first.
2. Then call show_menu once with EVERY item on every photo. Do not write the menu table in chat.
3. After the tool, write exactly one line: \`点 + 选菜，选好点「生成卡片」给服务员看；有过敏或忌口直接告诉我\` (in USER LANGUAGE). Nothing else: no page breakdown, no item counts, no summary of the widget, no mention of earlier restaurants or tests.

More photos of the same restaurant: call show_menu again with the full merged menu, keeping numbers. A different restaurant: start over.
User states an allergy or avoidance: call show_menu again with 🚫 on affected items and card.allergy set.
User types numbers or requests in chat instead: answer with a confirmation list and a waiter card in LOCAL LANGUAGE (the menu's language) as plain text.
Receipts: translate each line and compare with the order. Never invent dishes or prices.`;

const option = z.object({
  label: z.string().describe("In USER LANGUAGE, short, e.g. 三分熟, 不要葱"),
  local: z.string().describe("How a local says it to the waiter, in LOCAL LANGUAGE, e.g. Saignant / Sans oignon, s'il vous plaît."),
});

const item = z.object({
  n: z.number().int().describe("Unique number within the restaurant; printed number when unique, else 1…N in reading order"),
  code: z.string().optional().describe("Number as printed on the menu, only if printed"),
  name: z.string().describe("Natural translation in USER LANGUAGE; check it against the original"),
  original: z.string().describe("Exactly as printed"),
  desc: z.string().optional().describe("What a tourist needs to decide, ≤20 Chinese chars / 12 English words. Empty when obvious (fries, cola). Unfamiliar: compare with something familiar. Start with ⚠️ for offal, raw, strong smell, spirits ≥30%, sharing-size; 🚫 when it conflicts with a stated allergy. 🌶1–3 only when spicy. 「推测」 only when unsure."),
  tag: z.enum(["must", "star"]).optional().describe("must = 🏅 regional must-try; star = marked by the menu"),
  price: z.string().describe("As printed with units, e.g. 12,50 € · 2 pcs · /kg; market price → 时价; unreadable → ?"),
  value: z.number().nullable().optional().describe("Numeric price per selling unit, null when unknown or by weight"),
  options: z.array(option).optional().describe("A choice that must be made for this item: printed options (size, sauce, set option) or doneness for steaks"),
  ask: z.string().optional().describe("LOCAL LANGUAGE question for the card when price or weight is unknown, e.g. Combien ça coûte ?"),
});

const menuShape = {
  restaurant: z.string(),
  currency: z.string().describe("ISO code, e.g. EUR"),
  categories: z.array(z.object({
    emoji: z.string().optional(),
    name: z.string().describe("USER LANGUAGE"),
    original: z.string().optional().describe("As printed; omit when identical to name"),
    items: z.array(item),
  })).describe("In menu order; every item on every photo"),
  requests: z.array(option).describe("4–6 common requests for this cuisine (不要葱, 不要辣, 少盐, 不要冰…)"),
  card: z.object({
    opening: z.string().describe("\"We'd like to order these, please.\" in LOCAL LANGUAGE"),
    english: z.string().optional().describe("\"We'd like to order these, please.\" Omit when LOCAL LANGUAGE is English"),
    add: z.string().describe("\"We'd like to add these, please.\" in LOCAL LANGUAGE"),
    bill: z.string().describe("\"The bill, please.\" in LOCAL LANGUAGE"),
    allergy: z.string().optional().describe("Only if the user stated one: \"I'm allergic to ___. Please check the ingredients.\" in LOCAL LANGUAGE"),
  }),
  notes: z.array(z.string()).optional().describe("Printed only: tax, service, cover charge, minimum, time limit. USER LANGUAGE"),
};

export const menuSchema = z.object(menuShape);

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
      const count = menu.categories.reduce((s, c) => s + c.items.length, 0);
      return {
        content: [{ type: "text", text: `The interactive menu (${count} items) is now visible to the user. Do not summarize, list or describe it. Reply with one short line telling the user to tap + and then the card button, and that allergies can be told in chat.` }],
        structuredContent: menu,
      };
    },
  );

  return server;
}
