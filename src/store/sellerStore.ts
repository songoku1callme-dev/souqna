import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CategorySlug, SellerStatus } from '@/types';

export type SellerApplication = {
  displayName: string;
  legalName: string;
  phone: string;
  email: string;
  cityId: string | null;
  postalCode: string;
  categorySlugs: CategorySlug[];
  idDocumentName?: string;
  verificationDocNames: string[];
  acceptedTerms: boolean;
};

type SellerState = {
  status: SellerStatus;
  application: SellerApplication | null;
  submitApplication: (application: SellerApplication) => void;
  /** Demo helper to simulate moderation outcomes. */
  setStatus: (status: SellerStatus) => void;
  reset: () => void;
};

export const useSellerStore = create<SellerState>()(
  persist(
    (set) => ({
      status: 'not_submitted',
      application: null,
      submitApplication: (application) => set({ application, status: 'pending' }),
      setStatus: (status) => set({ status }),
      reset: () => set({ status: 'not_submitted', application: null }),
    }),
    {
      name: 'souqna.seller',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
