import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type FavoritesState = {
  ids: string[];
  toggle: (listingId: string) => boolean;
  isFavorite: (listingId: string) => boolean;
  clear: () => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (listingId) => {
        const exists = get().ids.includes(listingId);
        set({
          ids: exists ? get().ids.filter((id) => id !== listingId) : [...get().ids, listingId],
        });
        return !exists;
      },
      isFavorite: (listingId) => get().ids.includes(listingId),
      clear: () => set({ ids: [] }),
    }),
    {
      name: 'souqna.favorites',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
