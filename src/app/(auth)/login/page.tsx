'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { useAuth } from '@/firebase';
import {
  initiateEmailSignIn,
  initiateAnonymousSignIn,
} from '@/firebase/non-blocking-login';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    console.log('Login page - user state:', { user: !!user, isUserLoading });
    if (!isUserLoading && user) {
      console.log('Redirecting to dashboard...');
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const onSubmit = (data: LoginFormValues) => {
    console.log('Attempting email login with:', data.email);
    try {
      initiateEmailSignIn(auth, data.email, data.password);
      console.log('Email login initiated');
    } catch (error) {
      console.error('Email login error:', error);
    }
  };

  const handleAnonymousLogin = () => {
    console.log('Attempting anonymous login...');
    try {
      initiateAnonymousSignIn(auth);
      console.log('Anonymous login initiated');
    } catch (error) {
      console.error('Anonymous login error:', error);
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="absolute top-8 flex items-center gap-2">
        <div className="rounded-lg bg-primary p-2 text-primary-foreground">
          <Shield className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold">Apex</h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Enter your credentials to access your command center.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@apex.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full">
                Sign In
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleAnonymousLogin}
              >
                Sign In Anonymously
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  console.log('Force navigating to dashboard...');
                  router.push('/dashboard');
                }}
              >
                🐛 Debug: Go to Dashboard
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
