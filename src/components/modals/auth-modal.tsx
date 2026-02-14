

// "use client";

// import { useState, useEffect } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import { useToast } from "@/hooks/use-toast";
// import { Smartphone, Mail, KeyRound, Lock, LogIn, RefreshCw } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { countryCodes } from '@/lib/country-codes';


// interface AuthModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onLoginSuccess: () => void;
// }

// export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
//   const [mobileNumber, setMobileNumber] = useState('');
//   const [otp, setOtp] = useState('');
//   const [isOtpSent, setIsOtpSent] = useState(false);
//   const [countryCode, setCountryCode] = useState('+91');
//   const [resendCooldown, setResendCooldown] = useState(0);
//   const { toast } = useToast();

//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (resendCooldown > 0) {
//       timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
//     }
//     return () => clearTimeout(timer);
//   }, [resendCooldown]);


//   const startCooldown = () => {
//     setResendCooldown(20);
//   };

//   const handleSendOtp = () => {
//     // Basic validation, can be improved with a library like libphonenumber-js
//     if (mobileNumber.length >= 7) { // Loosely check for a valid number length
//       setIsOtpSent(true);
//       startCooldown();
//       toast({
//         title: "OTP Sent!",
//         description: `An OTP has been sent to ${countryCode} ${mobileNumber}. (Simulated)`,
//       });
//     } else {
//       toast({
//         title: "Invalid Number",
//         description: "Please enter a valid mobile number.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleResendOtp = () => {
//     if (resendCooldown === 0) {
//         startCooldown();
//         toast({
//             title: "OTP Resent!",
//             description: `A new OTP has been sent to ${countryCode} ${mobileNumber}. (Simulated)`,
//         });
//     }
//   }

//   const handleLogin = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!isOtpSent) {
//       handleSendOtp();
//       return;
//     }
    
//     // Simulate OTP verification
//     if (otp.length === 6) {
//         toast({
//           title: "Login Successful!",
//           description: "Welcome back to SetMyStay! (Simulated)",
//         });
//         onLoginSuccess();
//         onClose();
//     } else {
//         toast({
//             title: "Invalid OTP",
//             description: "Please enter a valid 6-digit OTP.",
//             variant: "destructive",
//         });
//     }
//   };
  
//   const handleSocialLogin = (provider: string) => {
//     toast({
//       title: `Signing in with ${provider}...`,
//       description: `You are being redirected to sign in. (Simulated)`,
//     });
//     onLoginSuccess();
//     onClose();
//   }
  
//   // Reset state when modal is closed
//   useEffect(() => {
//     if (!isOpen) {
//         setIsOtpSent(false);
//         setMobileNumber('');
//         setOtp('');
//         setResendCooldown(0);
//     }
//   }, [isOpen]);

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle className="text-2xl font-bold text-center">Welcome Back</DialogTitle>
//           <DialogDescription className="text-center">
//             Sign in to manage your listings. For testing, use any 10-digit mobile number and any 6-digit OTP.
//           </DialogDescription>
//         </DialogHeader>
//         <div className="grid gap-4 py-4">
//           <div className="grid grid-cols-2 gap-2">
//              <Button variant="outline" onClick={() => handleSocialLogin('Google')}>
//                 <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 65.6l-63.3 62.3C326.5 99.4 290.1 84 248 84c-83.6 0-151.4 68.8-151.4 154s67.8 154 151.4 154c97.2 0 130.3-72.9 134.8-109.3H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
//                  Google
//             </Button>
//             <Button variant="outline" onClick={() => handleSocialLogin('Facebook')}>
//                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="facebook" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"></path></svg>
//                Facebook
//             </Button>
//           </div>
//           <div className="relative">
//             <div className="absolute inset-0 flex items-center">
//               <span className="w-full border-t" />
//             </div>
//             <div className="relative flex justify-center text-xs uppercase">
//               <span className="bg-card px-2 text-muted-foreground">OR</span>
//             </div>
//           </div>
//           <form onSubmit={handleLogin}>
//             <div className="grid gap-2">
//               <div className="flex gap-2">
//                 <Select value={countryCode} onValueChange={setCountryCode} disabled={isOtpSent}>
//                   <SelectTrigger className="w-28">
//                     <SelectValue placeholder="Country Code" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {countryCodes.map(country => (
//                       <SelectItem key={country.code} value={country.dial_code}>
//                         {country.dial_code} ({country.code})
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <div className="relative w-full">
//                   <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="mobile"
//                     placeholder="Mobile number"
//                     className="pl-10"
//                     value={mobileNumber}
//                     onChange={(e) => setMobileNumber(e.target.value)}
//                     disabled={isOtpSent}
//                   />
//                 </div>
//               </div>

//               {isOtpSent && (
//                 <div className="relative">
//                   <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="otp"
//                     placeholder="Enter 6-digit OTP"
//                     className="pl-10"
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value)}
//                     maxLength={6}
//                   />
//                 </div>
//               )}
              
//               {!isOtpSent ? (
//                 <Button type="submit" variant="secondary">
//                   <Mail className="mr-2 h-4 w-4" /> Send OTP
//                 </Button>
//               ) : (
//                 <div className="grid grid-cols-2 gap-2">
//                     <Button type="button" variant="outline" onClick={handleResendOtp} disabled={resendCooldown > 0}>
//                        <RefreshCw className="mr-2 h-4 w-4" />
//                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
//                     </Button>
//                     <Button type="submit">
//                       <LogIn className="mr-2 h-4 w-4" /> Verify & Sign In
//                     </Button>
//                 </div>
//               )}
//             </div>
//           </form>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { loginUser } from '@/lib/api'; // 👈 Import the real API function

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Call Django Backend
      await loginUser({ username, password });
      
      // 2. Success!
      toast({ title: "Welcome back!", description: "You successfully logged in." });
      onLoginSuccess();
      onClose();

    } catch (error: any) {
      console.error(error);
      toast({
        title: "Login Failed",
        description: "Invalid username or password. (Check Django Admin?)",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center">Welcome to SetMyStay</DialogTitle>
          <DialogDescription className="text-center">
            Sign in to manage your property listings.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup" disabled>Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <div className="py-8 text-center text-muted-foreground">
              <p>Sign up is currently disabled.</p>
              <p className="text-sm">Please ask the Admin to create an account.</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}