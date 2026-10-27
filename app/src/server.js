// server.js
// MCP 服务端：工具 show_menu + 菜单组件资源
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export const WIDGET_URI = "ui://menu-helper/menu-v4.html";
export const WIDGET_MIME = "text/html;profile=mcp-app";

export const INSTRUCTIONS = `Menu Helper: the user sends restaurant menu photos and orders from an interactive menu.

USER LANGUAGE is the language of the user's own message text (an English message → English everywhere, including widget fields); Simplified Chinese only if the user sent photos without text. The ChatGPT interface language does not decide it.

When the user sends menu photos:
1. If the user sent context or questions with the photo, answer briefly in chat first.
2. Call show_menu once with EVERY item on every photo, including cuisine, intro and 🏅 tags; the widget shows them at the top. Do not write the header, intro or menu table in chat.
3. After the tool, in USER LANGUAGE: if part of a photo was unreadable or cut off, one line saying which items or prices and what to re-shoot. Then one short line inviting allergies or avoidances. Nothing else: do not say the tool was called or what the widget shows, no page breakdown, no item counts, no mention of earlier restaurants or tests.

Allergy or avoidance stated: 🚫 only on items that contain or may contain it, with the reason (🚫 花生酱汁); no 🚫 and no allergy text on other items; never repeat a generic "ask the staff" warning per item. Put it once in card.allergy and once in notes.
More photos of the same restaurant: call show_menu again with the full merged menu, keeping numbers. A different restaurant: start over.
User states an allergy or avoidance later: call show_menu again with the rules above.
User types numbers or requests in chat instead: answer with a confirmation list and a waiter card in LOCAL LANGUAGE (the menu's language) as plain text.
Receipts: translate each line and compare with the order. Never invent dishes or prices.`;

const option = z.object({
  label: z.string().describe("In USER LANGUAGE, short, e.g. 三分熟 / medium rare"),
  local: z.string().describe("How a local says it to the waiter, in LOCAL LANGUAGE, e.g. Saignant / Sans oignon, s'il vous plaît."),
});

const item = z.object({
  n: z.number().int().describe("Unique number within the restaurant; printed number when unique, else 1…N in reading order"),
  code: z.string().optional().describe("Number as printed on the menu, only if printed"),
  name: z.string().describe("Natural translation in USER LANGUAGE; check it against the original"),
  original: z.string().describe("As printed, without a printed option list (\"Burger (frites ou salade)\" → \"Burger\"); the options go in options"),
  desc: z.string().optional().describe("What a tourist needs to decide, ≤20 Chinese chars / 12 English words. Add what the name does not say; never restate it. Empty when obvious (fries, cola). Unfamiliar: compare with something familiar. Start with ⚠️ for offal, raw, strong smell, spirits ≥30%, sharing-size; 🚫 + reason only when it contains or may contain a stated allergen. 🌶1–3 only when spicy. 「推测」 only when unsure."),
  tag: z.enum(["must", "star"]).optional().describe("must = 🏅 one of 3–5 dishes on this menu the region is famous for; star = marked by the menu"),
  price: z.string().describe("As printed with units, e.g. 12,50 € · 2 pcs · /kg; market price → 时价; unreadable → ?"),
  value: z.number().nullable().optional().describe("Numeric price per selling unit, null when unknown or by weight"),
  options: z.array(option).optional().describe("Only when the MENU requires a choice for this item (printed size, sauce, set option to pick). Must be picked before the card"),
  extras: z.array(option.extend({ group: z.string().optional().describe("Same group = pick at most one, e.g. doneness") })).optional().describe("Optional per-item choices the menu does not require: doneness for steak, lemon or no ice for drinks, extra cheese. Not picked = kitchen default"),
  ask: z.string().optional().describe("LOCAL LANGUAGE question for the card when price or weight is unknown, e.g. Combien ça coûte ?"),
});

const menuShape = {
  restaurant: z.string(),
  lang: z.string().optional().describe("USER LANGUAGE as a BCP 47 code, e.g. zh-CN, en, ja; sets the widget's button language"),
  cuisine: z.string().optional().describe("Cuisine and region, as specific as the menu allows, e.g. 希腊菜 · 克里特岛风味"),
  intro: z.string().optional().describe("1–2 sentences in USER LANGUAGE: what kind of place, how people eat here, price level. Emoji only when they match exactly"),
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
  notes: z.array(z.string()).optional().describe("Printed charges and rules (tax, service, cover charge, minimum, time limit) plus one allergy note if stated. USER LANGUAGE"),
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
        content: [{ type: "text", text: `The interactive menu (${count} items) is now visible to the user. Do not summarize, list or describe it. Do not say the menu was shown. Only mention unreadable or cut-off parts (and what to re-shoot), then invite allergies or avoidances in one short line.` }],
        structuredContent: menu,
      };
    },
  );

  return server;
}
