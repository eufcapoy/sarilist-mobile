export type ShoppingUnit =
  | 'piece'
  | 'sachet'
  | 'pack'
  | 'box'
  | 'bottle'
  | 'can'
  | 'pouch'
  | 'bag'
  | 'sack'
  | 'case'
  | 'carton'
  | 'tray'
  | 'dozen'
  | 'bundle'
  | 'roll'
  | 'jar'
  | 'kg'
  | 'g'
  | 'liter'
  | 'milliliter';

export type ShoppingItem = {
  id: string;
  productName: string;
  originalText?: string;
  quantity?: number;
  unit?: ShoppingUnit;
  unitPrice?: number;
  previousPrice?: number;
  purchased: boolean;
  unavailable: boolean;
  ocrConfidence?: number;
};

export type ShoppingList = {
  id: string;
  name: string;
  budget: number;
  items: ShoppingItem[];
  updatedAt?: number;
  finishedAt?: number;
};
