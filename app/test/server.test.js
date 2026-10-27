// server.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer, WIDGET_URI, WIDGET_MIME } from "../src/server.js";

const html = readFileSync(new URL("../src/widget.html", import.meta.url), "utf8");
const sample = JSON.parse(readFileSync(new URL("../dev/sample.json", import.meta.url), "utf8"));

async function connect() {
  const [a, b] = InMemoryTransport.createLinkedPair();
  await createServer(html).connect(a);
  const client = new Client({ name: "t", version: "0" });
  await client.connect(b);
  return client;
}

test("show_menu 带组件模板", async () => {
  const c = await connect();
  const { tools } = await c.listTools();
  const t = tools.find((x) => x.name === "show_menu");
  assert.ok(t);
  assert.equal(t._meta.ui.resourceUri, WIDGET_URI);
  assert.equal(t._meta["openai/outputTemplate"], WIDGET_URI);
  assert.ok(c.getInstructions().includes("show_menu"));
});

test("show_menu 原样返回菜单", async () => {
  const c = await connect();
  const r = await c.callTool({ name: "show_menu", arguments: sample });
  assert.equal(r.isError, undefined);
  assert.equal(r.structuredContent.categories.length, sample.categories.length);
  assert.match(r.content[0].text, /Do not summarize/);
});

test("缺字段报错", async () => {
  const c = await connect();
  const r = await c.callTool({ name: "show_menu", arguments: { restaurant: "x" } });
  assert.equal(r.isError, true);
});

test("组件资源可读", async () => {
  const c = await connect();
  const r = await c.readResource({ uri: WIDGET_URI });
  assert.equal(r.contents[0].mimeType, WIDGET_MIME);
  assert.ok(r.contents[0].text.includes("ui/initialize"));
});
