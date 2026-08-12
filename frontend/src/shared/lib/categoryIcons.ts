export const CATEGORY_ICONS: Record<string, string> = {
  pizza: '🍕',
  burgers: '🍔',
  sandwiches: '🥪',
  hotdogs: '🌭',
  snacks: '🍟',
  sauces: '🥫',
};

export function categoryIcon(categoryId: string): string {
  return CATEGORY_ICONS[categoryId] ?? '🍽️';
}
