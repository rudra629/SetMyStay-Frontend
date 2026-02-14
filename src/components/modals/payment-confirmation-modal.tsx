
"use client";

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { IndianRupee, Tag, CheckCircle, XCircle, Info } from "lucide-react";
import type { Coupon } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  planName: string;
  amount: number;
  availableCoupons: Coupon[];
}

export function PaymentConfirmationModal({ isOpen, onClose, onConfirm, planName, amount, availableCoupons }: PaymentConfirmationModalProps) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const { toast } = useToast();

  const handleApplyCoupon = () => {
    const coupon = availableCoupons.find(c => c.code === couponCode.toUpperCase() && c.isActive);
    if (coupon) {
      setAppliedCoupon(coupon);
      toast({
        title: "Coupon Applied!",
        description: `You've received a ${coupon.discountPercentage}% discount.`,
      });
    } else {
      toast({
        title: "Invalid Coupon",
        description: "The coupon code is invalid or has expired.",
        variant: "destructive",
      });
    }
  };

  const finalAmount = useMemo(() => {
    if (appliedCoupon) {
      const discount = amount * (appliedCoupon.discountPercentage / 100);
      return Math.round(amount - discount);
    }
    return amount;
  }, [amount, appliedCoupon]);
  
  const isListingPlan = planName.toLowerCase().includes('listing');


  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Confirm Your Purchase</DialogTitle>
          <DialogDescription className="text-center">Please review your order before proceeding.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="border rounded-lg p-4 bg-muted/50 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Plan:</span>
              <span className="font-semibold">{planName}</span>
            </div>
             <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Original Price:</span>
              <span className="font-semibold flex items-center">
                <IndianRupee className="w-4 h-4 mr-1" />
                {amount}
              </span>
            </div>
            {appliedCoupon && (
                 <div className="flex justify-between items-center text-green-600">
                    <span className="text-sm">Discount ({appliedCoupon.discountPercentage}%):</span>
                    <span className="font-semibold flex items-center">
                        - <IndianRupee className="w-3 h-3 mx-1" />
                        {amount - finalAmount}
                    </span>
                </div>
            )}
            <div className="flex justify-between items-center text-lg border-t pt-2 mt-2">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-bold flex items-center">
                <IndianRupee className="w-4 h-4 mr-1" />
                {finalAmount}
              </span>
            </div>
          </div>
          
           <div className="space-y-2">
                <Label htmlFor="coupon-code" className="text-sm">Have a coupon code?</Label>
                <div className="flex items-center gap-2">
                    <Input 
                        id="coupon-code" 
                        placeholder="Enter code" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ? (
                         <Button variant="ghost" size="icon" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-destructive">
                            <XCircle className="w-5 h-5" />
                         </Button>
                    ) : (
                        <Button onClick={handleApplyCoupon} variant="secondary">Apply</Button>
                    )}
                </div>
            </div>
            
            {isListingPlan && (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Important: Listing Verification</AlertTitle>
                    <AlertDescription>
                        Your property will be manually reviewed by our staff before it goes live. If it is rejected for any reason, your payment will be fully refunded within 3 working days.
                    </AlertDescription>
                </Alert>
            )}
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={onConfirm} className="w-full sm:w-auto">Pay ₹{finalAmount}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
