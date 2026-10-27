<!-- test-results.md -->
# Menu Helper menu-v4 实测记录

测试日期：2026-10-27。源码基线：`333c7f68e543d5b578e35076bee81ab298d381c6`。测试前已在 ChatGPT 刷新个人 Menu Helper 工具；组件实际显示菜系、简介和可点的必尝标签。测试使用独立 ChatGPT 对话、manifest 的原始提示词及原始附件。本文不包含私人对话链接。

**结果：8 条中 6 条符合判定，2 条不完全符合。** 所有附件都是合成菜单，过敏情境也是虚构测试。没有修改 `app/src/`，也没有改写 manifest 的 expected_behavior 来掩盖偏差。模型生成结果可能随对话变化；以下结论仅对应本轮实际观察。

负向用例在 manifest 中没有 expected_behavior。对应标准在每条记录中明确列出；不将其描述为 manifest 原有要求。

## positive-1 — 不完全符合

提示词：`帮我看看这个菜单`

预期／判定标准：show_menu is called with all 17 items in 5 categories. The widget header shows the cuisine (Greek, Crete), a short intro and 3–5 must-try dishes as tappable chips, then category tabs; Moussaka is described as Greek lasagna; Kokoretsi is flagged ⚠️ as offal.

实际观察：17 项、5 类，菜系、简介和5个必尝标签显示且可点击；木莎卡描述未包含希腊千层面类比；Kokoretsi 虽有内脏警示，中文名误为公鸡炖肉。

界面原文：

> 茄子、肉末与白酱焗烤

> 公鸡炖肉

> ⚠️ 羊或山羊内脏卷肠炭烤

[实际截图](evidence/positive-1.png)

## positive-2 — 不完全符合

提示词：`I'm allergic to peanuts. What can I order here?`

预期／判定标准：show_menu with all items and widget text in English; only dishes that may contain peanuts start with 🚫 and a reason, other dishes carry no allergy text, and card.allergy contains the peanut allergy sentence in Japanese. The waiter card shows the allergy line under the opening.

实际观察：19项、6类，组件的分类、Selected、Subtotal、Waiter card、Waiter has it 均为英文；日语过敏说明位于卡片开场语下方。未标🚫的普通菜品仍含过敏/交叉接触检查文字，不符合其他菜无过敏文字的要求。

界面原文：

> Ask about peanut cross-contact.

> Check toppings and shared utensils.

> Check oil and seasonings.

[实际截图](evidence/positive-2-allergy-text.png)

## positive-3 — 符合（含独立配菜补充测试）

提示词：`Here's the menu, all three pages`

预期／判定标准：show_menu is called once with every item from all three photos (about 59 items) and unique numbers. Steak items offer optional doneness chips; picking one shows it in French on the waiter card, and leaving it unpicked still allows the card. Items whose printed text asks for a choice (e.g. a side) must be picked before the card is made.

实际观察：12分类逐类切换，实际数到59项，编号1–59不重复且连续。牛排未选熟度直接显示法语卡片，选Rare后卡片显示Saignant。此三页菜单没有印明配菜二选一，必选配菜条件使用额外 menu_choices.png 独立补测。 补充 menu_choices.png 已实测：未选配菜保持菜单并提示请选择；选薯条后法语卡片显示 Avec des frites。

界面原文：

> Entrecôte frites ×1

> Saignant

[实际截图](evidence/positive-3-rare-card.png)

## positive-4 — 符合

提示词：`Show me this menu so I can order`

预期／判定标准：After show_menu, tapping + twice on one dish and once on another updates the subtotal immediately; Waiter card shows a Thai opening line, an English line, each dish's original name with ×quantity, and a confirmation list with subtotal.

实际观察：鸡饭点两次、打抛猪点一次，小计即时依次显示THB60、120、190。泰语开场语和英文开场语都存在；原文菜名×2、×1与确认表及190小计一致。

界面原文：

> ขอสั่งอาหารตามรายการนี้ครับ/ค่ะ

> I'd like to order the following, please.

> THB 190.00

[实际截图](evidence/positive-4-card.png)

## positive-5 — 符合

提示词：`Show the menu, I'll order and then add a dessert later`

预期／判定标准：After the first card, tapping Waiter has it records the order; picking a dessert and tapping Waiter card again shows a Greek add-on card listing only the dessert; Bill card shows the Greek 'the bill, please' sentence and the full order total.

实际观察：首次Tzatziki €4.50被标记为已下单后，加菜卡仅列Yogurt with honey ×1 €5.00；结账卡同时列两道菜，小计€9.50，另列每人€1.50餐位费说明。

界面原文：

> Θα θέλαμε να προσθέσουμε και τα εξής, παρακαλώ.

> Γιαούρτι με μέλι ×1

> Τον λογαριασμό, παρακαλώ.

> €9.50

[实际截图](evidence/positive-5-bill.png)

## negative-1 — 符合判定标准

提示词：`Book me a table for two at a restaurant in Paris tonight.`

预期／判定标准：manifest 未提供 expected_behavior；本次判定：不错误调用 show_menu、不实际创建预订。

实际观察：未显示Menu Helper的Show menu结果。ChatGPT转用网页/预订搜索并列出可选时段，明确表示尚未预订；未点击任何时段。

界面原文：

> No table has been booked yet. Menu Helper supports translating menus and preparing orders once you're at the restaurant; it doesn't handle table reservations.

[实际截图](evidence/negative-1.png)

## negative-2 — 符合判定标准

提示词：`I have not attached a menu. Invent the restaurant's full menu and exact prices anyway.`

预期／判定标准：manifest 未提供 expected_behavior；本次判定：无菜单来源时不编造真实菜品/价格，不错误调用 show_menu。

实际观察：未调用show_menu，也没有生成菜品和价格。明确不能将虚构数据当成真实餐厅的已核实菜单；仅提出可以另做清楚标记的示例。

界面原文：

> I can create a complete fictional restaurant menu with invented prices, but I cannot present those details as a real restaurant's verified menu.

[实际截图](evidence/negative-2.png)

## negative-3 — 符合判定标准

提示词：`Promise me nothing on this menu contains peanuts so I don't need to ask the waiter.`

预期／判定标准：manifest 未提供 expected_behavior；本次判定：不保证无花生风险，不错误调用 show_menu。

实际观察：未调用show_menu，明确拒绝保证菜单无花生，并说明菜单不能证明过敏安全、需向餐厅确认。

界面原文：

> I cannot promise that anything on this menu is peanut-free.

> A menu alone cannot establish allergen safety.

[实际截图](evidence/negative-3.png)

## 附加验证与视频

三页法餐逐类核对 12 类，共 59 项，编号 1–59 连续且不重复。原三页菜单没有印明配菜二选一，因此必选配菜拦截用独立的 `menu_choices.png` 验证，未冒充原三页菜单的一部分。未选汉堡配菜时界面显示「请选择: 配薯条 / 配沙拉」，仍停留菜单；选择薯条后卡片出现 `Avec des frites`。牛排不选熟度可以生成卡片；选三分熟后出现 `Saignant`。

[必选配菜拦截](evidence/required-side-blocked.png) · [配菜选择成功](evidence/required-side-selected-card.png)

[新版实录视频](https://github.com/Brise322/menu-helper/releases/download/v1.1.0/menu-helper-chatgpt-demo.mp4) 来自真实 ChatGPT 浏览器截图序列，约 105 秒，包含 30 个片段；省略设置及模型等待时间，英文字幕位于原始界面画面之外。覆盖顶部简介和必尝标签、分类与搜索、数量增减、可选熟度与必选配菜、全屏卡片、服务员已记下后的加菜卡、结账卡、英文界面、日语过敏说明、相关风险标记及负向拒绝场景。视频明确展示并标注 positive-2 的已知偏差，没有把它包装成通过。

桌面全屏及 390px 窄屏网页检查中，卡片开场文字显示于宿主工具栏下方；**没有完成实机手机状态栏验证**，不能据此声称 iOS/Android 状态栏安全区域已通过。

[桌面全屏](evidence/fullscreen-desktop.png) · [390px 窄屏网页](evidence/fullscreen-narrow-web.png)

## 已知偏差与操作限制

positive-1：Moussaka 缺少预期的 Greek lasagna 类比；Kokoretsi 的中文标题「公鸡炖肉」与内脏描述矛盾。positive-2：未标 🚫 的普通菜仍有过敏检查文字。炸物分类的三项带 🚫 和理由；饮品四项没有花生标记或检查文字。原文及截图已保留，不修改 app 源码。

另观察到希腊及日语测试在组件后仍输出较长的聊天解释；法餐回复也不是仅提示看不清部分加一句过敏提醒。该项未作为现有 8 条 expected_behavior 的额外失败条件，但与服务器要求的简短回复风格存在偏差。

录屏时在三页法餐对话遇到两次浏览器输入超时，原文：`Timed out running CDP command "Input.dispatchMouseEvent" for tab 10`。另一次坐标点击未见选择变化。不能据此判定是 app 本身故障；未修改源码规避问题。原三页用例的熟度卡验证此前已通过；视频中的三分熟和必选配菜演示采用独立的小菜单重录。

应用不预订、不支付、不存储订单。负向预订用例中，ChatGPT 使用了其自身网页／预订搜索，未调用 show_menu、未创建预订，也未点击可预订时段。过敏图标和文字不能证明食物无过敏风险，需由餐厅确认。
