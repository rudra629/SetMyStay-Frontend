'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, ShieldQuestion, Lock, LogIn, HelpCircle, Home } from 'lucide-react';
import { LoadingSpinner } from '@/components/icons';
import { getFromLocalStorage, saveToLocalStorage } from '@/lib/storage';
// 👇 FIX: Import loginUser for the silent token fetch
import { loginUser } from '@/lib/api'; 
import {
  AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// 🚨 IMPORTANT: Enter your Django Superuser credentials here!
// This allows the 3FA dashboard to silently grab a valid token for database access.
const MASTER_DJANGO_USERNAME = "rudra"; 
const MASTER_DJANGO_PASSWORD = "123"; 

const DEFAULT_ADMIN_PASSWORD = 'Bluechip@123';
const DEFAULT_ADMIN_OTP = '16082007';
const DEFAULT_ADMIN_QUESTION = 'Who are you?';
const DEFAULT_ADMIN_ANSWER = 'rohan kholi';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<'password' | 'otp' | 'question' | 'forgot_password'>('password');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordRevealed, setIsPasswordRevealed] = useState(false);

  const [adminPassword, setAdminPassword] = useState('');
  const [adminOtp, setAdminOtp] = useState('');
  const [adminQuestion, setAdminQuestion] = useState('');
  const [adminAnswer, setAdminAnswer] = useState('');

  useEffect(() => {
    setIsMounted(true);
    if (localStorage.getItem('admin_authenticated') === 'true') {
      router.replace('/admin');
    }
    setAdminPassword(getFromLocalStorage('admin_password', DEFAULT_ADMIN_PASSWORD));
    setAdminOtp(getFromLocalStorage('admin_otp', DEFAULT_ADMIN_OTP));
    setAdminQuestion(getFromLocalStorage('admin_question', DEFAULT_ADMIN_QUESTION));
    setAdminAnswer(getFromLocalStorage('admin_answer', DEFAULT_ADMIN_ANSWER));
  }, [router]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      toast({ title: 'Step 1 Complete', description: 'Password correct. Please enter your PIN.' });
      setStep('otp');
    } else {
      toast({ title: 'Authentication Error', description: 'Incorrect password.', variant: 'destructive' });
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === adminOtp) {
      toast({ title: 'Step 2 Complete', description: 'PIN correct. Please answer the security question.' });
      setStep('question');
    } else {
      toast({ title: 'Authentication Error', description: 'Incorrect PIN.', variant: 'destructive' });
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (answer.toLowerCase() === adminAnswer.toLowerCase()) {
        try {
            // 👇 FIX: Silently fetch the master token from Django so the 403 error vanishes!
            await loginUser({ username: MASTER_DJANGO_USERNAME, password: MASTER_DJANGO_PASSWORD });
            
            toast({ title: 'Authentication Successful!', description: 'Redirecting to dashboard...' });
            localStorage.setItem('admin_authenticated', 'true');
            router.push('/admin');
        } catch (error) {
            console.error(error);
            toast({ 
                title: 'Database Sync Error', 
                description: 'Failed to securely link with Django. Check your Master Credentials in the code.', 
                variant: 'destructive' 
            });
            setIsLoading(false);
        }
    } else {
        toast({ title: 'Authentication Error', description: 'Incorrect answer.', variant: 'destructive' });
        setIsLoading(false);
    }
  };
  
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.toLowerCase() === adminAnswer.toLowerCase()) {
        setIsPasswordRevealed(true);
    } else {
        toast({ title: 'Verification Error', description: 'Incorrect answer.', variant: 'destructive' });
    }
  };

  if (!isMounted) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
            <LoadingSpinner className="w-12 h-12 text-primary" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Panel Access</CardTitle>
          <CardDescription>
            {step === 'password' && 'Factor 1: Enter your password.'}
            {step === 'otp' && 'Factor 2: Enter your PIN.'}
            {step === 'question' && 'Factor 3: Answer your security question.'}
            {step === 'forgot_password' && 'Enter your security answer to retrieve your password.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                  <Checkbox id="show-password" onCheckedChange={() => setShowPassword(!showPassword)} />
                  <Label htmlFor="show-password" className="text-sm font-normal">Show Password</Label>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                Continue
              </Button>
               <div className="text-center flex justify-center items-center gap-4">
                 <Button variant="link" type="button" onClick={() => setStep('forgot_password')}>Forgot Password?</Button>
                 <Button variant="link" asChild>
                    <Link href="/"><Home className="w-4 h-4 mr-2"/>Go to Main Site</Link>
                 </Button>
               </div>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">PIN</Label>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="otp"
                        type="password"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter PIN"
                        maxLength={8}
                        required
                        className="pl-10"
                    />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                Verify PIN
              </Button>
            </form>
          )}

          {step === 'question' && (
            <form onSubmit={handleQuestionSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="answer">Security Question: {adminQuestion}</Label>
                <div className="relative">
                    <ShieldQuestion className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="answer"
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Your answer"
                        required
                        className="pl-10"
                    />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <LoadingSpinner className="w-4 h-4" /> : <LogIn className="w-4 h-4 mr-2" />}
                {isLoading ? 'Verifying...' : 'Login'}
              </Button>
            </form>
          )}

          {step === 'forgot_password' && (
             <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="answer-forgot">Security Question: {adminQuestion}</Label>
                    <div className="relative">
                        <ShieldQuestion className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="answer-forgot"
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Your answer"
                            required
                            className="pl-10"
                        />
                    </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Retrieve Password
                </Button>
                <Button variant="link" type="button" onClick={() => setStep('password')} className="w-full">
                  Back to Login
                </Button>
             </form>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isPasswordRevealed} onOpenChange={setIsPasswordRevealed}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Password Retrieved</AlertDialogTitle>
                <AlertDialogDescription>
                    Your password is: <strong className="font-mono">{adminPassword}</strong>
                    <br />
                    Please copy it and use it to log in.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => {
                    setIsPasswordRevealed(false);
                    setStep('password');
                }}>
                    Got it, Back to Login
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}