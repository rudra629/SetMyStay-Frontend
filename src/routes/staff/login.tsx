import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/staff/login")({
  head: () => ({
    meta: [
      { title: "Staff Login — SetMyStay" },
      { name: "description", content: "Staff sign-in for SetMyStay." },
      { property: "og:title", content: "Staff Login — SetMyStay" },
      { property: "og:description", content: "Staff sign-in for SetMyStay." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StaffLoginPage,
});

import { useState, useEffect } from 'react';
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, LogIn, Home } from 'lucide-react';
import { LoadingSpinner } from '@/components/icons';

// 👇 FIX: Import the real Django login API
import { loginUser } from '@/lib/api'; 

function StaffLoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // If already authenticated with a Django token, move to dashboard
    if (localStorage.getItem('access_token') && localStorage.getItem('staff_authenticated') === 'true') {
      navigate({ to: '/staff', replace: true });
    }
  }, [navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 👇 FIX: Use the real Django database to verify the staff credentials!
      const response = await loginUser({ 
        username: userId, 
        password: password 
      });

      if (response.access) {
        toast({ title: 'Authentication Successful!', description: 'Redirecting to staff dashboard...' });
        localStorage.setItem('staff_authenticated', 'true');
        navigate({ to: '/staff' });
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({ title: 'Authentication Error', description: 'Incorrect User ID or Password.', variant: 'destructive' });
      setIsLoading(false);
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
                    <Link to="/"><Home className="w-4 h-4 mr-2"/>Go to Main Site</Link>
                 </Button>
               </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}