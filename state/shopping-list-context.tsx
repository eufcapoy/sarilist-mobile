import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { mockSavedLists } from '@/data/mock-lists';
import { loadShoppingState, saveShoppingState } from '@/storage/app-storage';
import type { ShoppingItem, ShoppingList } from '@/types/shopping';

function upsertList(lists: ShoppingList[], list: ShoppingList) {
  return [list, ...lists.filter(({ id }) => id !== list.id)].sort(
    (left, right) => (right.updatedAt ?? 0) - (left.updatedAt ?? 0),
  );
}

function createEmptyActiveList(): ShoppingList {
  return {
    id: `empty-${Date.now()}`,
    name: 'New shopping list',
    budget: 0,
    items: [],
  };
}

type ShoppingListContextValue = {
  activeList: ShoppingList;
  savedLists: ShoppingList[];
  storageReady: boolean;
  setActiveList: (list: ShoppingList) => void;
  saveList: (list: ShoppingList) => void;
  finishActiveList: () => void;
  openList: (id: string) => ShoppingList | undefined;
  renameList: (id: string, name: string) => void;
  duplicateList: (id: string) => ShoppingList | undefined;
  deleteList: (id: string) => void;
  updateItem: (id: string, updates: Partial<ShoppingItem>) => void;
};

const ShoppingListContext = createContext<ShoppingListContextValue | null>(null);

export function ShoppingListProvider({ children }: { children: ReactNode }) {
  const [savedLists, setSavedLists] = useState<ShoppingList[]>(mockSavedLists);
  const [activeList, setActiveList] = useState<ShoppingList>(mockSavedLists[0]);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    let active = true;

    void loadShoppingState()
      .then((storedState) => {
        if (!active || !storedState) return;
        setSavedLists(storedState.savedLists);
        setActiveList(storedState.activeList);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setStorageReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!storageReady) return;

    const timer = setTimeout(() => {
      void saveShoppingState({ activeList, savedLists }).catch(() => undefined);
    }, 120);

    return () => clearTimeout(timer);
  }, [activeList, savedLists, storageReady]);

  const saveList = useCallback((list: ShoppingList) => {
    const savedList = { ...list, updatedAt: Date.now(), finishedAt: undefined };
    setActiveList(savedList);
    setSavedLists((current) => upsertList(current, savedList));
  }, []);

  const finishActiveList = useCallback(() => {
    setActiveList((current) => {
      const finishedList = { ...current, updatedAt: Date.now(), finishedAt: Date.now() };
      setSavedLists((lists) => upsertList(lists, finishedList));
      return finishedList;
    });
  }, []);

  const openList = useCallback(
    (id: string) => {
      const list = savedLists.find((candidate) => candidate.id === id);
      if (list) {
        setActiveList(list);
      }
      return list;
    },
    [savedLists],
  );

  const renameList = useCallback((id: string, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const updatedAt = Date.now();
    setSavedLists((lists) => {
      const list = lists.find((candidate) => candidate.id === id);
      return list ? upsertList(lists, { ...list, name: trimmedName, updatedAt }) : lists;
    });
    setActiveList((list) =>
      list.id === id ? { ...list, name: trimmedName, updatedAt } : list,
    );
  }, []);

  const duplicateList = useCallback(
    (id: string) => {
      const source = savedLists.find((list) => list.id === id);
      if (!source) return undefined;
      const timestamp = Date.now();
      const duplicate: ShoppingList = {
        ...source,
        id: `copy-${timestamp}-${source.id}`,
        name: `${source.name} copy`,
        updatedAt: timestamp,
        finishedAt: undefined,
        items: source.items.map((item, index) => ({
          ...item,
          id: `copy-${timestamp}-${index}-${item.id}`,
          previousPrice: item.unitPrice ?? item.previousPrice,
          unitPrice: undefined,
          purchased: false,
          unavailable: false,
        })),
      };
      setSavedLists((lists) => upsertList(lists, duplicate));
      return duplicate;
    },
    [savedLists],
  );

  const deleteList = useCallback(
    (id: string) => {
      const remainingLists = savedLists.filter((list) => list.id !== id);
      setSavedLists(remainingLists);
      setActiveList((currentList) =>
        currentList.id === id ? (remainingLists[0] ?? createEmptyActiveList()) : currentList,
      );
    },
    [savedLists],
  );

  const updateItem = useCallback((id: string, updates: Partial<ShoppingItem>) => {
    setActiveList((currentList) => {
      const updatedList = {
        ...currentList,
        finishedAt: undefined,
        updatedAt: Date.now(),
        items: currentList.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      };
      setSavedLists((lists) => upsertList(lists, updatedList));
      return updatedList;
    });
  }, []);

  const value = useMemo(
    () => ({
      activeList,
      savedLists,
      storageReady,
      setActiveList,
      saveList,
      finishActiveList,
      openList,
      renameList,
      duplicateList,
      deleteList,
      updateItem,
    }),
    [
      activeList,
      deleteList,
      duplicateList,
      finishActiveList,
      openList,
      renameList,
      saveList,
      savedLists,
      storageReady,
      updateItem,
    ],
  );

  return <ShoppingListContext.Provider value={value}>{children}</ShoppingListContext.Provider>;
}

export function useShoppingList() {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingList must be used inside ShoppingListProvider');
  }
  return context;
}
