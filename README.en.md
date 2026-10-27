# Menu Helper 🍜 Order food anywhere

[简体中文](README.md) | **English**

> Can't read the menu? Snap a photo and order.

## Why

Abroad, the awkward part isn't speaking. It's the first minute with the menu.

You may know every word on the page and still have no idea what will arrive. Is Bruschetta bread or salad? Does ねぎま have onions in it? Language level doesn't help much. Even a perfect IELTS score won't tell you what *kokoretsi* is. Honestly, even a menu in your own language can stump you the first time you see "husband and wife lung slices".

So the waiter stands there, you point at a line and say "this one", and find out what you ordered when it lands on the table.

I wrote this prompt from my own experience eating out. The goal is simple: **snap the menu, understand each dish, reply with a few numbers, hand your phone to the waiter. Done.**

It's for international students, travelers, and anyone staring blankly at a menu. No app, no sign-up. Works in ChatGPT, Gemini, Claude, or any AI that can see images.

## How it works

**① Send a photo of the menu**

First it tells you what kind of place this is, how people eat here, and which dishes are local must-tries. Then it lists every dish by category:

```
📍 Ταβέρνα Ο Μανώλης · EUR · 5 categories · 17 items
🗺️ Greek · Chania, Crete
A family-style Greek taverna: order starters, salads and mains to share. Mains €9.50–16; bread & cover charged per person.
🏅 Must-try: #1 Tzatziki, #3 Dakos, #7 Moussaka, #11 Lamb kleftiko

### 🍽️ Mains Κυρίως
| # | Name | Original | What it is | Price |
| 7 | 🏅 Moussaka | Μουσακάς | Greek lasagna: eggplant, meat sauce, béchamel | 11,00 € |
| 9 | Kokoretsi | Κοκορέτσι | ⚠️ Offal wrapped in intestine, spit-roasted | 12,00 € |
| 10 | Grilled octopus | Χταπόδι στα κάρβουνα | | 16,00 € |
```

The "What it is" column only says what you need to decide:
- Obvious items (fries, cola, cucumber salad) stay empty.
- Unfamiliar dishes are compared to something you know.
- Local signatures get 🏅 and a note on why they're famous.
- Possible surprises get ⚠️: offal, raw, strong smell, spirits, sharing-size portions.

**② Reply with numbers**, e.g. `3 7 10x2 no onions`

If something must be chosen first (size, doneness, set-menu option, weight for by-weight dishes), it asks. It never chooses for you.

**③ Hand your phone to the waiter**

You get a confirmation list in your language with prices and a rough conversion to your home currency, then a card for the waiter:

```
━━━━━━━━━━━━━━━━
🙋 Θα θέλαμε να παραγγείλουμε τα εξής, παρακαλώ.
   We'd like to order these, please.

・Ντάκος ×1
・Μουσακάς ×1
・Χταπόδι στα κάρβουνα ×2
   Χωρίς κρεμμύδι, παρακαλώ.
━━━━━━━━━━━━━━━━
```

The card is written in the local language only, so the waiter can read it at a glance. If you mentioned an allergy, the first line asks the waiter to check the ingredients.

Below the card is a phrase table: call the waiter, water, not spicy, allergies, take-away, the bill, pay separately, pay by card. Each phrase comes with pronunciation, and a last line covers local tipping customs.

**④ During the meal**
- Add more: `add 8` gives a card for the new items only.
- Change your mind: you get a short "change X to Y" card instead of the whole order again.
- `how much so far`: the running total.
- Snap the receipt: it is translated line by line and checked against your order.
- More pages: keep sending photos and numbering continues. A different restaurant starts over.

## Setup

**Quickest:** copy all of [`prompt.md`](prompt.md), paste it into a new ChatGPT / Gemini chat, then send a menu photo.

**Keep it:**
- **ChatGPT**: create a GPT and paste `prompt.md` into Instructions (~7,500 characters, under the 8,000 limit).
- **Gemini**: create a Gem and paste it the same way.
- **Claude**: put `SKILL.md` and `prompt.md` in a folder named `menu-helper` and zip it so the zip's top level is `menu-helper/`. Turn on Code execution in Settings, then upload it under Customize → Skills.

The output language follows the language you write in, so English speakers get English tables.

## What it won't do

- Invent dishes or prices. Unreadable prices show as `?`, and it tells you which part to re-shoot.
- Pretend to know. Dishes it's unsure about are marked as a guess.
- Guarantee allergy safety. Icons are a guide; **always confirm allergies with staff**.
- Add charges that aren't printed. Tax, service and cover charges (お通し in Japan, coperto in Italy) are only mentioned when the menu shows them.

## Tests

`tests/` holds 10 test menus with full conversations: Japan, Italy, Greece, Korea, Thailand, Spain, France, the US, Vietnam and a Sichuan menu in Chinese. They cover bilingual menus, set menus, portion sizes, by-weight and market prices, minimum orders, tipping, blurry or cropped photos, and menus already in the user's language or in English.

---

License: MIT
