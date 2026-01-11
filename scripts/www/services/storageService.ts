import { ShoppingItem } from '../types';

const STORAGE_KEY = 'smart_shop_items_v1';

export const getItems = (): ShoppingItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load items", e);
    return [];
  }
};

export const saveItem = (item: ShoppingItem): ShoppingItem[] => {
  const items = getItems();
  const index = items.findIndex((i) => i.id === item.id);
  let newItems;
  if (index >= 0) {
    newItems = [...items];
    newItems[index] = item;
  } else {
    newItems = [item, ...items];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  return newItems;
};

export const deleteItem = (id: string): ShoppingItem[] => {
  const items = getItems();
  const newItems = items.filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  return newItems;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};