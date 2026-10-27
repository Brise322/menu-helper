# Privacy Policy — Menu Helper

Effective: 2026-10-27

Menu Helper is an open-source project by Brise322 (https://github.com/Brise322/menu-helper).

## What the server receives
When ChatGPT shows a menu, it sends the `show_menu` tool call to `menu-helper.brise322.workers.dev`. The call contains the menu as read by ChatGPT: restaurant name, currency, dish names, descriptions, prices, common requests, and waiter-card sentences. If you mention an allergy, the allergy sentence for the waiter card is included.

## What the server does with it
The server returns the same data to the menu widget in your chat. It does not store, log, sell or share it, and it does not call any AI model or third-party service. Menu photos are not sent to the server.

## Your order
Dishes you pick, quantities and requests stay in the widget inside your ChatGPT conversation. After you tap "Waiter has it", a text summary of the order is shared with ChatGPT in that conversation so it can answer questions about the bill. Nothing is sent to the Menu Helper server.

## Hosting
The server runs on Cloudflare Workers. Cloudflare processes network requests under its own privacy policy (https://www.cloudflare.com/privacypolicy/). ChatGPT conversations are governed by OpenAI's privacy policy.

## No accounts, cookies or tracking
Menu Helper has no user accounts, cookies, analytics or advertising.

## Children
Menu Helper is not directed to children under 13.

## Contact
Questions or deletion requests: https://github.com/Brise322/menu-helper/issues
