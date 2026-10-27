#!/bin/sh
# build_plugin.sh
# 组装 ChatGPT / Codex 插件包：dist/menu-helper.zip（plugin.json 在 zip 根目录）
set -e
cd "$(dirname "$0")"
rm -rf dist && mkdir -p dist/menu-helper/skills/menu-helper
cp plugin/plugin.json plugin/mcp.json dist/menu-helper/
cp -R plugin/assets dist/menu-helper/
cp SKILL.md prompt.md dist/menu-helper/skills/menu-helper/
(cd dist/menu-helper && zip -qr ../menu-helper.zip .)
echo "dist/menu-helper.zip"
