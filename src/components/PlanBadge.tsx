import { Badge } from '@/components/ui/badge';
import type { SubscriptionPlan } from '@/types';

interface PlanBadgeProps {
  plan: SubscriptionPlan;
}

const planStyles: Record<SubscriptionPlan, string> = {
  FREE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  TRIAL: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  PRO: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  ENTERPRISE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
};

export function PlanBadge({ plan }: PlanBadgeProps) {
  return (
    <Badge variant="outline" className={planStyles[plan]}>
      {plan}
    </Badge>
  );
}
