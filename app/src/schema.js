// schema.js — show_menu 的参数结构。describe() 文字会作为字段说明发给模型

import { z } from "zod";

/** 一个选项：label 给用户看，local 写在服务员卡片上 */
const option = z.object({
  label: z.string().describe("In USER LANGUAGE, short, e.g. 三分熟 / medium rare"),
  local: z.string().describe("How a local says it to the waiter, in LOCAL LANGUAGE, e.g. Saignant / Sans oignon, s'il vous plaît."),
});

const request = option.extend({
  for: z.enum(["food", "drink"]).optional().describe("food = shown on dishes only, drink = on drinks only; omit for both"),
});

const extra = option.extend({
  group: z.string().optional().describe("Same group = pick at most one, e.g. doneness"),
});

const item = z.object({
  n: z.number().int()
    .describe("Unique number within the restaurant; printed number when unique, else 1…N in reading order"),
  code: z.string().optional()
    .describe("Number as printed on the menu, only if printed"),
  original: z.string()
    .describe("As printed, without a printed option list (\"Burger (frites ou salade)\" → \"Burger\"); the options go in options"),
  desc: z.string().optional()
    .describe("What a tourist needs to decide, ≤20 Chinese chars / 12 English words. Add what the name does not say; never restate it. "
      + "Empty when obvious (fries, cola). Unfamiliar dish: compare with something familiar (Okonomiyaki → 像日式蔬菜煎饼). "
      + "Start with ⚠️ for offal, raw, strong smell, spirits ≥30%, sharing-size; Never mention allergies, cross-contact or checking ingredients here; that goes only in allergen. "
      + "🌶1–3 only when spicy. 「推测」 only when unsure."),
  name: z.string()
    .describe("Natural translation in USER LANGUAGE, written after desc and naming the same dish. Never guess from a similar-looking word; unsure → transliterate"),
  allergen: z.string().optional()
    .describe("Only when the user stated an allergy or avoidance and this dish contains or may contain it: the reason in USER LANGUAGE, e.g. 花生酱汁. Omit on every other item"),
  tag: z.enum(["must", "star"]).optional()
    .describe("star = marked as signature by the menu itself; must-try dishes go in mustTry"),
  price: z.string()
    .describe("As printed with units, e.g. 12,50 € · 2 pcs · /kg; market price → 时价; unreadable → ?"),
  value: z.number().nullable().optional()
    .describe("Numeric price per selling unit, null when unknown or by weight"),
  options: z.array(option).optional()
    .describe("Only when the MENU requires a choice for this item (printed size, sauce, set option to pick). Must be picked before the card"),
  extras: z.array(extra).optional()
    .describe("Optional per-item choices the menu does not require: doneness for steak, lemon or no ice for drinks, extra cheese. Not picked = kitchen default"),
  ask: z.string().optional()
    .describe("LOCAL LANGUAGE question for the card when price or weight is unknown, e.g. Combien ça coûte ?"),
});

const category = z.object({
  emoji: z.string().describe("One emoji that fits the category, e.g. 🥗 🥩 🍷"),
  course: z.enum(["starter", "main", "side", "dessert", "drink", "alcohol", "other"])
    .describe("Course of this category; the widget orders tabs starter → main → side → other → dessert → drink → alcohol"),
  name: z.string().describe("USER LANGUAGE"),
  original: z.string().optional().describe("As printed; omit when identical to name"),
  items: z.array(item),
});

const card = z.object({
  opening: z.string().describe("\"We'd like to order these, please.\" in LOCAL LANGUAGE"),
  english: z.string().optional().describe("\"We'd like to order these, please.\" Omit when LOCAL LANGUAGE is English"),
  add: z.string().describe("\"We'd like to add these, please.\" in LOCAL LANGUAGE"),
  bill: z.string().describe("\"The bill, please.\" in LOCAL LANGUAGE"),
  allergy: z.string().optional().describe("Only if the user stated one: \"I'm allergic to ___. Please check the ingredients.\" in LOCAL LANGUAGE"),
});

/** show_menu 的 inputSchema（字段形式，供 registerTool 使用） */
export const menuShape = {
  restaurant: z.string(),
  lang: z.string().optional().describe("USER LANGUAGE as a BCP 47 code, e.g. zh-CN, en, ja; sets the widget's button language"),
  cuisine: z.string().describe("Cuisine and region, as specific as the menu allows, e.g. 希腊菜 · 克里特岛风味"),
  intro: z.string().describe("1–2 sentences in USER LANGUAGE: what kind of place, how people eat here, price level. A few emoji that match exactly, e.g. 🍷 🥖"),
  mustTry: z.array(z.number().int()).min(1).max(5)
    .describe("Numbers of 3–5 dishes on this menu the region or restaurant is famous for (🏅); fewer only for a tiny menu"),
  tip: z.string()
    .describe("One line in USER LANGUAGE shown under the menu: unreadable or cut-off parts and what to re-shoot, if any; "
      + "then invite the user to ask about any dish, ask for a recommendation, or share allergies. In your own words"),
  currency: z.string().describe("ISO code, e.g. EUR"),
  categories: z.array(category)
    .describe("Every item on every photo. Order by course (starters, mains, sides, desserts, drinks, alcohol), menu order within a course; number items in this order"),
  requests: z.array(request)
    .describe("4–6 common requests for this cuisine (不要葱, 不要辣, 少盐, 不要冰…). Set for: drink on drink requests, for: food on food requests. Never repeat choices already in an item's options or extras (doneness)"),
  card,
  notes: z.array(z.string()).optional()
    .describe("Printed charges and rules (tax, service, cover charge, minimum, time limit) plus one allergy note if stated. USER LANGUAGE"),
};

export const menuSchema = z.object(menuShape);
