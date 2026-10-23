'use client';

import React, { useState } from 'react';
import Script from 'next/script';
import axios from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation'; // 👈 Added router for redirection

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

    try {
      // Create the order on Django
      const { data } = await axios.post('/payments/create-order/', {
        amount: amount,
        property_id: propertyId
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'SetMyStay',
        description: 'Property Listing Fee',
        order_id: data.order_id,
        handler: async function (response: any) {
          toast({
            title: "Payment Successful!",
            description: `Processing your listing...`,
            variant: "default",
          });
          
          // 👇 BUG 2 FIX: Manually verify payment since local webhooks fail
          try {
             await axios.post('/payments/verify-local/', {
                 property_id: propertyId,
                 razorpay_payment_id: response.razorpay_payment_id
             });
             toast({ title: "Listing Submitted to Admin!" });
             router.push('/'); // Redirect user after successful listing
          } catch (e) {
             console.error("Local verification failed", e);
          }
        },
        prefill: {
          name: userName,
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
          description: response.error.description,
          variant: "destructive",
        });
      });
      
      // 👇 BUG 1 FIX: Close the Next.js modal first to remove the invisible click-shield!
      onClose(); 
      
      // Now open Razorpay
      rzp.open();

    } catch (error) {
      console.error("Payment Initialization Failed", error);
      toast({
        title: "Error",
        description: "Could not initialize payment gateway. Please ensure your backend is running.",
        variant: "destructive",
      });
      setIsProcessing(false); // Reset processing state if initialization fails
    } 
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