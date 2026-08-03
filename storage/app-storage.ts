import AsyncStorage from '@react-native-async-storage/async-storage';

import { ShoppingUnits } from '@/constants/shopping-units';
import type { ShoppingItem, ShoppingList, ShoppingUnit } from '@/types/shopping';

const shoppingStateKey = '@sarilist/shopping-state/v1';
const onboardingCompleteKey = '@sarilist/onboarding-complete/v1';
const shoppingUnits = new Set<ShoppingUnit>(ShoppingUnits.map(({ value }) => value));

export type StoredShoppingState = {
  activeList: ShoppingList;
  savedLists: ShoppingList[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isOptionalFiniteNumber(value: unknown) {
  return value === undefined || (typeof value === 'number' && Number.isFinite(value));
}

function isShoppingItem(value: unknown): value is ShoppingItem {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === 'string' &&
    typeof value.productName === 'string' &&
    typeof value.unit === 'string' &&
    shoppingUnits.has(value.unit as ShoppingUnit) &&
    typeof value.purchased === 'boolean' &&
    typeof value.unavailable === 'boolean' &&
    (value.originalText === undefined || typeof value.originalText === 'string') &&
    isOptionalFiniteNumber(value.quantity) &&
    isOptionalFiniteNumber(value.unitPrice) &&
    isOptionalFiniteNumber(value.previousPrice) &&
    isOptionalFiniteNumber(value.ocrConfidence)
  );
}

function isShoppingList(value: unknown): value is ShoppingList {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.budget === 'number' &&
    Number.isFinite(value.budget) &&
    Array.isArray(value.items) &&
    value.items.every(isShoppingItem) &&
    isOptionalFiniteNumber(value.updatedAt) &&
    isOptionalFiniteNumber(value.finishedAt)
  );
}

export async function loadShoppingState(): Promise<StoredShoppingState | null> {
  const storedValue = await AsyncStorage.getItem(shoppingStateKey);
  if (!storedValue) return null;

  try {
    const parsed: unknown = JSON.parse(storedValue);
    if (
      !isRecord(parsed) ||
      !isShoppingList(parsed.activeList) ||
      !Array.isArray(parsed.savedLists) ||
      !parsed.savedLists.every(isShoppingList)
    ) {
      return null;
    }

    return { activeList: parsed.activeList, savedLists: parsed.savedLists };
  } catch {
    return null;
  }
}

export function saveShoppingState(state: StoredShoppingState) {
  return AsyncStorage.setItem(shoppingStateKey, JSON.stringify(state));
}

export async function loadOnboardingComplete() {
  return (await AsyncStorage.getItem(onboardingCompleteKey)) === 'true';
}

export function saveOnboardingComplete(complete: boolean) {
  return AsyncStorage.setItem(onboardingCompleteKey, complete ? 'true' : 'false');
}
