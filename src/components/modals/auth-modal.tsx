"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'login' | 'complete_profile'>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { toast } = useToast();

  // Check on mount to see if they are already logged in but missing their profile
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('access_token');
      const isProfileComplete = localStorage.getItem('is_profile_complete');
      
      if (token && isProfileComplete === 'false') {
        setStep('complete_profile');
      } else {
        setStep('login');
      }
    }
  }, [isOpen]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      // 1. Send the Google token to our Django backend
      const res = await fetch('http://localhost:8000/api/users/google-login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.ok) {
        // 2. Save tokens and the crucial complete flag to localStorage
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('is_profile_complete', String(data.is_profile_complete));

        // 3. Route them based on the flag
        if (data.is_profile_complete) {
          toast({ title: "Welcome back!", description: "You successfully logged in." });
          onLoginSuccess();
          onClose();
        } else {
          // Flip the modal to the Phone Number form
          setStep('complete_profile');
          toast({ title: "Almost there!", description: "Please complete your profile to continue." });
        }
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error: any) {
      console.error(error);
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      
      // Call Django endpoint to save the phone number
      const res = await fetch('http://localhost:8000/api/users/complete-profile/', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone_number: phoneNumber, role: 'SEEKER' }), 
      });

      if (res.ok) {
        localStorage.setItem('is_profile_complete', 'true');
        toast({ title: "Profile Complete!", description: "You are all set." });
        onLoginSuccess();
        onClose();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // This prevents them from closing the modal by clicking outside of it if they haven't given a phone number
  const handleOpenChange = (open: boolean) => {
    const isProfileComplete = localStorage.getItem('is_profile_complete');
    const token = localStorage.getItem('access_token');
    
    if (!open && token && isProfileComplete === 'false') {
      toast({ title: "Required", description: "You must provide a phone number.", variant: "destructive" });
      return; 
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        {step === 'login' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">Welcome to SetMyStay</DialogTitle>
              <DialogDescription className="text-center">
                Sign in to manage your property listings.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-6">
              <GoogleOAuthProvider clientId="567107261238-gujakiaj292e4fm7kk5t74k15j1umgno.apps.googleusercontent.com">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    toast({ title: "Error", description: "Google Login Failed", variant: "destructive" });
                  }}
                  useOneTap
                />
              </GoogleOAuthProvider>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">Complete Your Profile</DialogTitle>
              <DialogDescription className="text-center">
                We just need your phone number to secure your account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCompleteProfile} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  type="tel"
                  placeholder="+91 9999999999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : "Complete Setup"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}