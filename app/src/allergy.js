// allergy.js — 用户说明过敏时，清理未标 allergen 的菜品描述里的过敏提醒

// 过敏、交叉接触、核对配料、询问店员一类的句子
const ALLERGY_NOTE = /allerg|cross[- ]?contact|\bcheck\b|\bconfirm\b|ask (the )?(staff|server|waiter|kitchen)|过敏|交叉|核对|确认|询问|問い合わせ|アレルギー|確認|알레르기|확인/i;

// 按句号、分号切句，保留分隔符
const SENTENCE = /[^.。;；!！?？]+[.。;；!！?？]?/g;

/** 删去描述中的过敏提醒句；全部删完返回 undefined */
export function stripAllergyNotes(desc) {
  if (!desc) return desc;
  const kept = (desc.match(SENTENCE) || []).filter((s) => !ALLERGY_NOTE.test(s));
  const text = kept.join("").trim();
  return text || undefined;
}

/** 只有用户说明过敏（card.allergy 有值）时才处理；标了 allergen 的菜品保持原样 */
export function cleanAllergyText(menu) {
  if (!menu.card?.allergy) return menu;
  for (const category of menu.categories) {
    for (const item of category.items) {
      if (item.allergen) continue;
      const desc = stripAllergyNotes(item.desc);
      if (desc === undefined) delete item.desc;
      else item.desc = desc;
    }
  }
  return menu;
}
