import { useState } from 'react';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { billingApi } from '@/api/endpoints';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlanBadge } from '@/components/PlanBadge';
import { toast } from 'sonner';
import { Check, Loader as Loader2, Zap } from 'lucide-react';
import type { SubscriptionPlan } from '@/types';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PlanDetails {
  name: SubscriptionPlan;
  price: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
}

const plans: PlanDetails[] = [
  {
    name: 'FREE',
    price: '$0',
    description: 'Perfect for small teams getting started',
    features: [
      { name: 'Up to 10 employees', included: true },
      { name: 'Basic attendance tracking', included: true },
      { name: 'Leave management', included: true },
      { name: 'Monthly reports', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  {
    name: 'PRO',
    price: '$29',
    description: 'Best for growing teams',
    features: [
      { name: 'Up to 50 employees', included: true },
      { name: 'Advanced attendance tracking', included: true },
      { name: 'Leave management', included: true },
      { name: 'Monthly reports', included: true },
      { name: 'Email support', included: true },
    ],
    popular: true,
  },
  {
    name: 'ENTERPRISE',
    price: '$99',
    description: 'For large organizations',
    features: [
      { name: 'Unlimited employees', included: true },
      { name: 'Advanced attendance tracking', included: true },
      { name: 'Leave management', included: true },
      { name: 'Monthly reports', included: true },
      { name: 'Priority support', included: true },
      { name: 'Custom integrations', included: true },
    ],
  },
];

export function SubscriptionPage() {
  const { plan: currentPlan } = useSubscriptionStore();
  const [upgradingTo, setUpgradingTo] = useState<SubscriptionPlan | null>(null);

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (plan === currentPlan) return;

    setUpgradingTo(plan);
    try {
      const response = await billingApi.createCheckoutSession(plan);
      window.location.href = response.data.url;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create checkout session');
      setUpgradingTo(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Subscription</h1>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">Current plan:</p>
          <PlanBadge plan={currentPlan} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((planDetails) => (
          <Card
            key={planDetails.name}
            className={`relative ${
              planDetails.popular ? 'border-primary shadow-lg scale-105' : ''
            }`}
          >
            {planDetails.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary">
                  <Zap className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle>{planDetails.name}</CardTitle>
                {currentPlan === planDetails.name && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Current
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{planDetails.price}</span>
                {planDetails.name !== 'FREE' && <span className="text-muted-foreground">/month</span>}
              </div>
              <CardDescription>{planDetails.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {planDetails.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check
                      className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                        feature.included
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-300 dark:text-gray-700'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        feature.included ? 'text-foreground' : 'text-muted-foreground line-through'
                      }`}
                    >
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={planDetails.popular ? 'default' : 'outline'}
                disabled={currentPlan === planDetails.name || upgradingTo !== null}
                onClick={() => handleUpgrade(planDetails.name)}
              >
                {upgradingTo === planDetails.name && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {currentPlan === planDetails.name
                  ? 'Current Plan'
                  : planDetails.name === 'FREE'
                  ? 'Downgrade'
                  : 'Upgrade'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
