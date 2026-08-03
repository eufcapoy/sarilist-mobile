import type { ShoppingUnit } from '@/types/shopping';

type ShoppingUnitOption = {
  value: ShoppingUnit;
  label: string;
  shortLabel: string;
  plural: string;
};

export const ShoppingUnits: ShoppingUnitOption[] = [
  { value: 'piece', label: 'Piece', shortLabel: 'pc', plural: 'pieces' },
  { value: 'sachet', label: 'Sachet', shortLabel: 'sachet', plural: 'sachets' },
  { value: 'pack', label: 'Pack', shortLabel: 'pack', plural: 'packs' },
  { value: 'box', label: 'Box', shortLabel: 'box', plural: 'boxes' },
  { value: 'bottle', label: 'Bottle', shortLabel: 'bottle', plural: 'bottles' },
  { value: 'can', label: 'Can', shortLabel: 'can', plural: 'cans' },
  { value: 'pouch', label: 'Pouch', shortLabel: 'pouch', plural: 'pouches' },
  { value: 'bag', label: 'Bag', shortLabel: 'bag', plural: 'bags' },
  { value: 'sack', label: 'Sack', shortLabel: 'sack', plural: 'sacks' },
  { value: 'case', label: 'Case', shortLabel: 'case', plural: 'cases' },
  { value: 'carton', label: 'Carton', shortLabel: 'carton', plural: 'cartons' },
  { value: 'tray', label: 'Tray', shortLabel: 'tray', plural: 'trays' },
  { value: 'dozen', label: 'Dozen', shortLabel: 'dozen', plural: 'dozen' },
  { value: 'bundle', label: 'Bundle', shortLabel: 'bundle', plural: 'bundles' },
  { value: 'roll', label: 'Roll', shortLabel: 'roll', plural: 'rolls' },
  { value: 'jar', label: 'Jar', shortLabel: 'jar', plural: 'jars' },
  { value: 'kg', label: 'Kilogram', shortLabel: 'kg', plural: 'kg' },
  { value: 'g', label: 'Gram', shortLabel: 'g', plural: 'g' },
  { value: 'liter', label: 'Liter', shortLabel: 'L', plural: 'L' },
  { value: 'milliliter', label: 'Milliliter', shortLabel: 'mL', plural: 'mL' },
];

export function getShoppingUnit(unit: ShoppingUnit) {
  return ShoppingUnits.find((option) => option.value === unit) ?? ShoppingUnits[0];
}

export function formatQuantityUnit(quantity: number | undefined, unit: ShoppingUnit) {
  const option = getShoppingUnit(unit);
  if (quantity === undefined) {
    return option.shortLabel;
  }
  return `${quantity} ${quantity === 1 ? option.label.toLowerCase() : option.plural}`;
}
