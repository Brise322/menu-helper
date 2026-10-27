---
name: menu-helper
description: Turns restaurant menu photos into a numbered, translated table and builds local-language waiter cards from picked numbers. Use for menu photos and ordering replies.
---

Read [prompt.md](prompt.md) before handling a menu photo or an ordering message, and follow it. Keep the restaurant's menu and order between turns.

When the `show_menu` tool is available, show the menu through it instead of the Step 1 table: write only the header, intro and 必尝 in chat, then call `show_menu` with every item. The user orders in the widget.
