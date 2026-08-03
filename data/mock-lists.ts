export type ShoppingListPreview = {
  id: string;
  title: string;
  detail: string;
  itemCount: number;
  completedCount: number;
  category: 'market' | 'home' | 'occasion';
};

export const recentLists: ShoppingListPreview[] = [
  {
    id: 'weekly-market',
    title: 'Weekly market',
    detail: 'Updated 18 minutes ago',
    itemCount: 12,
    completedCount: 7,
    category: 'market',
  },
  {
    id: 'home-essentials',
    title: 'Home essentials',
    detail: 'Updated yesterday',
    itemCount: 8,
    completedCount: 8,
    category: 'home',
  },
  {
    id: 'weekend-merienda',
    title: 'Weekend merienda',
    detail: 'Updated 3 days ago',
    itemCount: 6,
    completedCount: 2,
    category: 'occasion',
  },
];
