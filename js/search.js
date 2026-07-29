import { pinyinInitialsById } from './pinyin.js';

export function prepareIngredients(ingredients) {
  return ingredients.map((ingredient) => ({
    ...ingredient,
    searchText: [ingredient.nameZh, ingredient.inci, ...ingredient.aliases, ingredient.summary]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
    pinyinInitials: pinyinInitialsById[ingredient.id] || '',
  }));
}

export function filterIngredients(ingredients, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return ingredients.filter((ingredient) => (
    ingredient.searchText.includes(normalized)
    || ingredient.pinyinInitials.split(' ').some((value) => value.startsWith(normalized))
  ));
}
