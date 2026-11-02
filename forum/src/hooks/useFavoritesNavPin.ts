import { useSyncExternalStore } from 'react';
import { readFavoritesNavPinned, subscribeFavoritesNavPinned } from '../utils/favoritesNavPin';

export function useFavoritesNavPinned() {
  return useSyncExternalStore(subscribeFavoritesNavPinned, readFavoritesNavPinned, () => false);
}
