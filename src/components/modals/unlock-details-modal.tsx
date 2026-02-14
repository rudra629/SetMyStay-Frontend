
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check, Star, Gem, Rocket, Crown, Building, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UnlockPlan, PricingData } from "@/lib/types";

interface UnlockDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanSelect: (plan: { plan: UnlockPlan, title: string, price: number }) => void;
  onNavigateToListProperty: () => void;
  pricing: PricingData | null;
}

export function UnlockDetailsModal({ isOpen, onClose, onPlanSelect, onNavigateToListProperty, pricing }: UnlockDetailsModalProps) {
  
  const unlockPlans = [
    { plan: 1 as UnlockPlan, title: 'Single Unlock', price: pricing?.unlocks['1'] ?? 49, features: ['1 Listing Unlock', 'Complete Address', 'Direct Contact Details', 'Valid for 30 days'], icon: <Rocket className="w-5 h-5"/>, suffix: 'one-time' },
    { plan: 5 as UnlockPlan, title: 'Value Pack', price: pricing?.unlocks['5'] ?? 199, features: ['5 Listing Unlocks', 'Complete Address', 'Direct Contact Details', 'Valid for 30 days', 'Best Value!'], icon: <Star className="w-5 h-5"/>, suffix: 'one-time' },
    { plan: 10 as UnlockPlan, title: 'Pro Pack', price: pricing?.unlocks['10'] ?? 399, features: ['10 Listing Unlocks', 'Complete Address', 'Direct Contact Details', 'Valid for 30 days', 'Great Deal!'], icon: <Gem className="w-5 h-5"/>, suffix: 'one-time' },
    { plan: 'unlimited' as UnlockPlan, title: 'Ultimate Subscription', price: pricing?.unlocks.unlimited ?? 999, features: ['Unlimited unlocks for 1 month', 'View all contact details', 'Chat with owners directly', 'Cancel anytime'], icon: <Crown className="w-5 h-5"/>, suffix: 'month' },
  ];

  const listingPlans = [
    { title: 'Roommate Listing', price: pricing?.listings.roommate ?? 149, features: ['30-day listing', 'Reach thousands of users'], icon: <User className="w-5 h-5" />, type: 'Roommate' },
    { title: 'PG/Co-living Listing', price: pricing?.listings.pg ?? 349, features: ['30-day listing', 'Featured for 7 days'], icon: <Building className="w-5 h-5" />, type: 'PG/Co-living' },
    { title: 'Rental Listing', price: pricing?.listings.rental ?? 999, features: ['30-day listing', 'Premium support'], icon: <Crown className="w-5 h-5" />, type: 'Rental' },
  ];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-4 md:p-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-center">Our Pricing Plans</DialogTitle>
          <DialogDescription className="text-center text-base sm:text-lg">
            Choose a plan that's right for you.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="unlock" className="w-full flex flex-col flex-1 min-h-0">
           <div className="px-4 md:px-6 py-4 border-b">
             <TabsList className="grid w-full grid-cols-2 h-12">
               <TabsTrigger value="unlock" className="text-sm sm:text-base">Unlock Contact Details</TabsTrigger>
               <TabsTrigger value="list" className="text-sm sm:text-base">List Your Property</TabsTrigger>
             </TabsList>
           </div>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="unlock" className="mt-0">
              <div className="p-4 md:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {unlockPlans.map(p => (
                        <Card key={p.title} className="flex flex-col border-primary/50 hover:shadow-lg transition-shadow">
                        <CardHeader className="items-center text-center">
                            <div className="p-3 bg-primary/10 rounded-full mb-2 text-primary">{p.icon}</div>
                            <CardTitle>{p.title}</CardTitle>
                            <CardDescription>
                            <span className="text-3xl font-bold text-foreground">₹{p.price}</span>
                            <span className="text-muted-foreground">/{p.suffix}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <ul className="space-y-2 text-sm text-muted-foreground">
                            {p.features.map(feature => (
                                <li key={feature} className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-green-500 mt-1 shrink-0"/>
                                <span>{feature}</span>
                                </li>
                            ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => onPlanSelect({plan: p.plan, title: p.title, price: p.price})}>
                              Choose Plan
                            </Button>
                        </CardFooter>
                        </Card>
                    ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="list" className="mt-0">
                <div className="p-4 md:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {listingPlans.map(p => (
                            <Card key={p.title} className="flex flex-col border-accent/50 hover:shadow-lg transition-shadow">
                                <CardHeader className="items-center text-center">
                                    <div className="p-3 bg-accent/10 rounded-full mb-2 text-accent">{p.icon}</div>
                                    <CardTitle>{p.title}</CardTitle>
                                    <CardDescription>
                                        <span className="text-3xl font-bold text-foreground">₹{p.price}</span>
                                        <span className="text-muted-foreground">/listing</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                    {p.features.map(feature => (
                                        <li key={feature} className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-500 mt-1 shrink-0"/>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" variant="secondary" onClick={onNavigateToListProperty}>
                                        List your {p.type}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
