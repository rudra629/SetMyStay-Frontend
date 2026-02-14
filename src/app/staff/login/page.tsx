
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
import { User, Lock, LogIn, Home } from 'lucide-react';
import { LoadingSpinner } from '@/components/icons';
import { getFromLocalStorage } from '@/lib/storage';
import { dummyStaff } from '@/lib/data';
import type { StaffMember } from '@/lib/types';


export default function StaffLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  useEffect(() => {
    setIsMounted(true);
    // If staff is already logged in, redirect them to the dashboard
    if (localStorage.getItem('staff_authenticated') === 'true') {
      router.replace('/staff');
    }
    // Load staff data from localStorage, fallback to dummy data
    const storedStaff = getFromLocalStorage('staff', dummyStaff);
    setStaffList(storedStaff);
  }, [router]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const staffMember = staffList.find(
      (staff: StaffMember) => staff.userId === userId && staff.password === password
    );
    
    // Simulate network delay
    setTimeout(() => {
        if (staffMember) {
          toast({ title: 'Authentication Successful!', description: 'Redirecting to staff dashboard...' });
          // In a real app, you'd get a session token from the server
          localStorage.setItem('staff_authenticated', 'true');
          router.push('/staff');
        } else {
          toast({ title: 'Authentication Error', description: 'Incorrect User ID or Password.', variant: 'destructive' });
          setIsLoading(false);
        }
    }, 1000);
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
          <CardTitle className="text-2xl font-bold">Staff Panel Access</CardTitle>
          <CardDescription>
            Enter your User ID and Password to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userid">User ID</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="userid"
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Username"
                    required
                    className="pl-10"
                  />
                </div>
              </div>
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
                {isLoading ? <LoadingSpinner className="w-4 h-4" /> : <LogIn className="w-4 h-4 mr-2" />}
                {isLoading ? 'Verifying...' : 'Login'}
              </Button>
               <div className="text-center">
                 <Button variant="link" asChild>
                    <Link href="/"><Home className="w-4 h-4 mr-2"/>Go to Main Site</Link>
                 </Button>
               </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
