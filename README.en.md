# Menu Helper

[简体中文](README.md) | **English**

A prompt for ordering from foreign menus. Send the AI a photo of the menu; it translates and explains every dish, you reply with numbers, and it gives you an order card in the local language to show the waiter.

Works with ChatGPT, Gemini, Claude, or any AI that can read images.

## Why

Eating abroad, I kept running into the same things:
- I knew every word on the menu and still couldn't tell what the dish was.
- I had no idea which dishes were the local specialties worth ordering.
- A translation app gave me English that didn't match the original, so I couldn't point to it.
- I still had to look up "no onions", "medium rare" and "the bill, please" one at a time.

Usually I ended up pointing at a line and saying "this one". This prompt does the reading and the ordering in one chat.

## Usage

### 1. Send the menu photo

The AI first describes the place: cuisine, how people order here, and the local signature dishes. Then it lists every item by category:

```
📍 Ταβέρνα Ο Μανώλης · EUR · 5 categories · 17 items
🗺️ Greek · Chania, Crete
Family-style Greek taverna; starters, salads and mains are shared. Mains €9.50–16; bread and cover charged per person.
🏅 Must-try: #1 Tzatziki, #3 Dakos, #7 Moussaka, #11 Lamb kleftiko

### 🍽️ Mains Κυρίως
| # | Name | Original | What it is | Price |
| 7 | 🏅 Moussaka | Μουσακάς | Greek lasagna: eggplant, meat sauce, béchamel | 11,00 € |
| 9 | Kokoretsi | Κοκορέτσι | ⚠️ Offal wrapped in intestine, spit-roasted | 12,00 € |
| 10 | Grilled octopus | Χταπόδι στα κάρβουνα | | 16,00 € |
```

The "What it is" column:
- Empty for obvious items like fries or cola.
- Unfamiliar dishes are compared to something you know.
- 🏅 local signature.
- ⚠️ offal, raw, strong smell, spirits, large portions.

### 2. Reply with numbers

For example `3 7 10x2 no onions`. If a dish needs a choice (size, doneness, set-menu option), the AI asks first.

### 3. Hand your phone to the waiter

You get a confirmation list in your language with prices, then a card for the waiter:

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

Below the card is a phrase table: call the waiter, water, not spicy, take-away, the bill, pay separately, pay by card. Languages in non-Latin scripts (Japanese, Thai, Greek…) include romanization. The last line covers local tipping.

**Allergies and diets**: mention them with the photo, e.g. "allergic to peanuts" or "no pork". Dishes that may contain them get 🚫, and the card opens with your allergy in the local language and asks the kitchen to check.

### 4. During the meal

| You send | You get |
|---|---|
| `add 8` | a card with only the new items |
| `change 7 to 9` | a "change X to Y" card |
| `how much so far` | the running total |
| a receipt photo | each line translated and checked against your order |
| the next menu page | numbering continues; a new restaurant starts over |

The reply language follows the language you write in.

## Install

**One-off:** copy all of [`prompt.md`](prompt.md) into a new ChatGPT, Gemini or other chat, then send the menu photo.

**To keep it:**
- **ChatGPT**: create a GPT and paste `prompt.md` into Instructions (under 8,000 characters).
- **Gemini**: create a Gem and paste it the same way.
- **Claude**: put `SKILL.md` and `prompt.md` in a folder named `menu-helper`, zip it so the top level is `menu-helper/`, turn on Code execution in Settings, and upload under Customize → Skills.

## Before you start

- **Use medium or default reasoning.** At the highest setting it keeps searching the web and a menu can take several minutes.
- **Take clear photos.** Shoot straight on without glare. Use several photos for a long page and keep the prices in frame. Unreadable prices show as `?`.
- **Add your needs in one line.** For example "3 of us, under €30 each", "nothing spicy", "local specialties". The intro and suggestions follow it.

## Limits

- It doesn't invent dishes or prices. Unreadable prices show as `?` with a note on what to re-shoot.
- Dishes it isn't sure about are marked as a guess.
- 🚫 is a reminder only. Always confirm allergies with the staff.
- Tax, service and cover charges (お通し in Japan, coperto in Italy) are mentioned only when printed on the menu.

---

License: MIT
