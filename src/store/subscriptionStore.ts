import { create } from 'zustand';
import type { SubscriptionPlan } from '@/types';

interface SubscriptionState {
  plan: SubscriptionPlan;
  expiresAt?: string;
  setPlan: (plan: SubscriptionPlan, expiresAt?: string) => void;
  hasAccess: (requiredPlan: SubscriptionPlan[]) => boolean;
}

const planHierarchy: Record<SubscriptionPlan, number> = {
  FREE: 0,
  TRIAL: 3,
  PRO: 2,
  ENTERPRISE: 3,
};

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  plan: 'FREE',
  expiresAt: undefined,
  setPlan: (plan, expiresAt) => set({ plan, expiresAt }),
  hasAccess: (requiredPlans) => {
    const currentPlan = get().plan;
    const currentLevel = planHierarchy[currentPlan];
    return requiredPlans.some(plan => currentLevel >= planHierarchy[plan]);
  },
}));
