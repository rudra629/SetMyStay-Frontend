'use client';

import React, { useState } from 'react';
import Script from 'next/script';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  amount?: number;
  userEmail?: string;
  userName?: string;
}

export function ListPropertyPaymentModal({ 
  isOpen, 
  onClose, 
  propertyId, 
  amount = 499,
  userEmail = "owner@setmystay.com",
  userName = "Property Owner"
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handlePayment = async () => {
    setIsProcessing(true);

    // Close modal first so Radix UI releases pointer-events lock before Razorpay opens
    onClose();

    toast({
      title: "Connecting to payment gateway...",
      description: "Please wait a moment.",
    });

    setTimeout(async () => {
      try {
        // Send amount, property_id, AND plan_name so backend order creation succeeds
        const { data } = await api.post('/payments/create-order/', {
          amount: amount,
          property_id: propertyId,
          plan_name: 'Property Listing Fee',
        });

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency || 'INR',
          name: 'SetMyStay',
          description: 'Property Listing Fee',
          order_id: data.order_id,
          handler: async function (response: any) {
            toast({
              title: "Payment Successful!",
              description: "Processing your listing...",
              variant: "default",
            });
            
            try {
              await api.post('/payments/verify-local/', {
                property_id: propertyId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                plan_name: 'Property Listing Fee',
                amount: amount,
              });
            } catch (e) {
              console.warn("Verification warning:", e);
            }

            toast({
              title: "Listing Submitted!",
              description: "Your property has been submitted for admin approval.",
            });
            setIsProcessing(false);
            router.push('/');
          },
          prefill: {
            name: (typeof window !== 'undefined' && localStorage.getItem('user_name')) || userName,
            email: userEmail,
          },
          theme: {
            color: '#2563eb', 
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          toast({
            title: "Payment Failed",
            description: response.error?.description || "Transaction was declined.",
            variant: "destructive",
          });
          setIsProcessing(false);
        });

        rzp.open();
      } catch (error: any) {
        console.error("Payment Initialization Failed:", error);
        toast({
          title: "Payment Gateway Error",
          description: error?.response?.data?.error || "Could not initialize payment gateway. Check Razorpay keys on Render.",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    }, 400);
  };

  return (
    <>
      <Script 
        id="razorpay-checkout-js" 
        src="https://checkout.razorpay.com/v1/checkout.js" 
      />
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Listing</DialogTitle>
            <DialogDescription>
              Pay the listing fee of ₹{amount} to publish your property on SetMyStay.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg">
              <span className="font-medium text-slate-700">Total Amount</span>
              <span className="font-bold text-lg">₹{amount}</span>
            </div>
            
            <Button 
              onClick={handlePayment} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? "Processing..." : `Pay ₹${amount} Now`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}