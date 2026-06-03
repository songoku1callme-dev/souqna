import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { RoleInterest } from '@/types';

type LocationState = {
  countryCode: string;
  cityId: string | null;
  postalCode: string;
  roleInterest: RoleInterest;
  setCountry: (code: string) => void;
  setCity: (cityId: string) => void;
  setPostalCode: (postalCode: string) => void;
  setRoleInterest: (role: RoleInterest) => void;
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      countryCode: 'SY',
      cityId: 'damascus',
      postalCode: '',
      roleInterest: 'buyer',
      setCountry: (code) => set({ countryCode: code }),
      setCity: (cityId) => set({ cityId }),
      setPostalCode: (postalCode) => set({ postalCode }),
      setRoleInterest: (roleInterest) => set({ roleInterest }),
    }),
    {
      name: 'souqna.location',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
