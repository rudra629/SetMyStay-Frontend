
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { PricingData } from '@/lib/types';

interface ListPropertyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToPayment: (plan: { title: string; price: number }) => void;
  pricing: PricingData | null;
}

export function ListPropertyPaymentModal({ isOpen, onClose, onProceedToPayment, pricing }: ListPropertyPaymentModalProps) {
  const listingPlans = {
    roommate: { title: 'Roommate Listing', price: pricing?.listings.roommate || 149 },
    pg: { title: 'PG Listing', price: pricing?.listings.pg || 349 },
    rental: { title: 'Rental Listing', price: pricing?.listings.rental || 999 },
  };

  type PlanKey = keyof typeof listingPlans;
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('roommate');

  const handleSubmit = () => {
    onProceedToPayment({
      title: listingPlans[selectedPlan].title,
      price: listingPlans[selectedPlan].price,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Finalize Your Listing</DialogTitle>
          <DialogDescription className="text-center">Choose your listing plan to proceed.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as PlanKey)} className="grid gap-4">
            {Object.entries(listingPlans).map(([key, { title, price }]) => (
              <Label key={key} htmlFor={key} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer [&:has([data-state=checked])]:border-primary">
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-muted-foreground">30-day listing</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-lg">₹{price}</p>
                  <RadioGroupItem value={key} id={key} />
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>
        <Button size="lg" className="w-full" onClick={handleSubmit}>
          Proceed to Confirmation
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">Secure payment powered by SetMyStay</p>
      </DialogContent>
    </Dialog>
  );
}
