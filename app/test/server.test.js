// server.test.js — MCP 服务端与组件打包测试

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer, WIDGET_URI, WIDGET_MIME } from "../src/server.js";
import { bundleWidget } from "../src/bundle.js";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const widget = bundleWidget(read("../src/widget.html"), read("../src/widget.css"), read("../src/widget-app.js"));
const sample = JSON.parse(read("../dev/sample.json"));

async function connect() {
  const [serverSide, clientSide] = InMemoryTransport.createLinkedPair();
  await createServer(widget).connect(serverSide);
  const client = new Client({ name: "test", version: "0" });
  await client.connect(clientSide);
  return client;
}

test("组件打包后不再引用外部文件", () => {
  assert.ok(widget.includes("<style>") && widget.includes("ui/initialize"));
  assert.ok(!widget.includes('href="widget.css"') && !widget.includes('src="widget-app.js"'));
});

test("缺少引用时打包报错", () => {
  assert.throws(() => bundleWidget("<html></html>", "", ""));
});

test("show_menu 关联组件模板，服务端带说明", async () => {
  const client = await connect();
  const { tools } = await client.listTools();
  const tool = tools.find((t) => t.name === "show_menu");
  assert.ok(tool);
  assert.equal(tool._meta.ui.resourceUri, WIDGET_URI);
  assert.equal(tool._meta["openai/outputTemplate"], WIDGET_URI);
  assert.ok(client.getInstructions().includes("show_menu"));
});

test("show_menu 原样返回菜单并提示模型不要复述", async () => {
  const client = await connect();
  const result = await client.callTool({ name: "show_menu", arguments: sample });
  assert.equal(result.isError, undefined);
  assert.equal(result.structuredContent.categories.length, sample.categories.length);
  assert.match(result.content[0].text, /Do not summarize/);
});

test("缺少必填字段时报错", async () => {
  const client = await connect();
  const result = await client.callTool({ name: "show_menu", arguments: { restaurant: "x" } });
  assert.equal(result.isError, true);
});

test("组件资源返回内联后的 HTML", async () => {
  const client = await connect();
  const { contents } = await client.readResource({ uri: WIDGET_URI });
  assert.equal(contents[0].mimeType, WIDGET_MIME);
  assert.equal(contents[0].text, widget);
});

test("说明过敏时，未标 allergen 的菜品描述去掉过敏提醒", async () => {
  const client = await connect();
  const menu = structuredClone(sample);
  menu.card.allergy = "Je suis allergique aux arachides.";
  const [first, second] = menu.categories[0].items;
  first.desc = "Ramen with egg. Check toppings and soy-based dressing ingredients.";
  second.desc = "Ask about peanut cross-contact.";
  second.allergen = "花生酱汁";
  const third = menu.categories[0].items[2];
  third.desc = "Ask about peanut cross-contact.";

  const result = await client.callTool({ name: "show_menu", arguments: menu });
  const items = result.structuredContent.categories[0].items;
  assert.equal(items[0].desc, "Ramen with egg.");
  assert.equal(items[1].desc, "Ask about peanut cross-contact.");
  assert.equal(items[2].desc, undefined);
});

test("未说明过敏时不改描述", async () => {
  const client = await connect();
  const menu = structuredClone(sample);
  delete menu.card.allergy;
  menu.categories[0].items[0].desc = "Check the daily special.";
  const result = await client.callTool({ name: "show_menu", arguments: menu });
  assert.equal(result.structuredContent.categories[0].items[0].desc, "Check the daily special.");
});

test("旧版本组件 URI 返回当前组件", async () => {
  const client = await connect();
  for (const uri of ["ui://menu-helper/menu-v4.html", "ui://menu-helper/menu-v5.html"]) {
    const { contents } = await client.readResource({ uri });
    assert.equal(contents[0].uri, uri);
    assert.equal(contents[0].text, widget);
  }
});
