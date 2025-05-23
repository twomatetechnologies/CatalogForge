import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'wouter';
import { AuthContext } from '../../App';
import { useToast } from '@/hooks/use-toast';

// UI Components
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
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setToken } = useContext(AuthContext);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    console.log('Login attempt with:', data);
    try {
      // Make a direct API call to get more control over the process
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      console.log('Login API direct response:', result);
      
      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }
      
      // Store the token
      localStorage.setItem('token', result.token);
      
      // Update auth context
      setUser(result.user);
      setToken(result.token);
      
      toast({
        title: 'Success',
        description: 'You have successfully logged in',
        variant: 'default',
      });
      
      // Force hard redirect to dashboard
      // This bypasses any router issues
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-4">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john@example.com"
                        type="email"
                        disabled={isLoading}
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
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="******"
                        type="password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
              
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  disabled={isLoading}
                  onClick={() => {
                    form.setValue('email', 'admin@example.com');
                    form.setValue('password', 'admin123');
                  }}
                >
                  Login as Admin
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  disabled={isLoading}
                  onClick={() => {
                    form.setValue('email', 'user@example.com');
                    form.setValue('password', 'user123');
                  }}
                >
                  Login as User
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="mb-4 p-3 border rounded-md bg-gray-50">
            <h3 className="font-medium mb-2 text-sm">Sample Login Credentials:</h3>
            <div className="space-y-3 text-xs">
              <div className="border-b pb-2">
                <div className="font-semibold">Admin User</div>
                <div>Email: admin@example.com</div>
                <div>Password: admin123</div>
              </div>
              <div>
                <div className="font-semibold">Regular User</div>
                <div>Email: user@example.com</div>
                <div>Password: user123</div>
              </div>
            </div>
          </div>
          <div className="text-sm text-center text-gray-500">
            <Link href="/forgot-password" className="text-primary hover:underline">
              Forgot your password?
            </Link>
          </div>
          <div className="text-sm text-center text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}