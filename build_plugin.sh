#!/bin/sh
# build_plugin.sh
# 组装 ChatGPT / Codex 插件包：dist/menu-helper.zip
set -e
cd "$(dirname "$0")"
rm -rf dist && mkdir -p dist/menu-helper/skills/menu-helper
cp plugin/plugin.json dist/menu-helper/
cp -R plugin/assets dist/menu-helper/
cp SKILL.md prompt.md dist/menu-helper/skills/menu-helper/
(cd dist && zip -qr menu-helper.zip menu-helper)
echo "dist/menu-helper.zip"
