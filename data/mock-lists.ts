import type { ShoppingList } from '@/types/shopping';

const now = Date.now();

export const mockSavedLists: ShoppingList[] = [
  {
    id: 'weekly-groceries',
    name: 'Weekly groceries',
    budget: 1500,
    updatedAt: now - 18 * 60 * 1000,
    items: [
      { id: 'rice', productName: 'Rice', quantity: undefined, unit: 'sack', previousPrice: 1350, purchased: false, unavailable: false },
      { id: 'eggs', productName: 'Eggs', quantity: undefined, unit: 'tray', previousPrice: 215, purchased: false, unavailable: false },
      { id: 'fresh-milk', productName: 'Fresh milk', quantity: undefined, unit: 'bottle', previousPrice: 92, purchased: false, unavailable: false },
    ],
  },
  {
    id: 'home-essentials',
    name: 'Home essentials',
    budget: 850,
    updatedAt: now - 24 * 60 * 60 * 1000,
    finishedAt: now - 24 * 60 * 60 * 1000,
    items: [
      { id: 'soap', productName: 'Bath soap', quantity: 4, unit: 'piece', unitPrice: 38, purchased: true, unavailable: false },
      { id: 'detergent', productName: 'Detergent', quantity: 8, unit: 'sachet', unitPrice: 12, purchased: true, unavailable: false },
      { id: 'tissue', productName: 'Tissue', quantity: 2, unit: 'pack', unitPrice: 75, purchased: true, unavailable: false },
    ],
  },
  {
    id: 'weekend-merienda',
    name: 'Weekend merienda',
    budget: 600,
    updatedAt: now - 3 * 24 * 60 * 60 * 1000,
    items: [
      { id: 'coffee', productName: 'Instant coffee', quantity: 10, unit: 'sachet', unitPrice: 9, purchased: true, unavailable: false },
      { id: 'bread', productName: 'Bread', quantity: 3, unit: 'pack', purchased: false, unavailable: false },
      { id: 'juice', productName: 'Juice', quantity: 6, unit: 'bottle', purchased: false, unavailable: false },
    ],
  },
];
