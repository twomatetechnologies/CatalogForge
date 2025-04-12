import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@/types';

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
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, ArrowLeft, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Form validation schema
const userSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).optional(),
  role: z.enum(['user', 'admin'], {
    required_error: 'Please select a role',
    invalid_type_error: 'Role must be either user or admin',
  }),
});

// Create a separate schema for new users that requires password
const newUserSchema = userSchema.extend({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UserForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const userId = isEditMode ? parseInt(id) : null;
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  // Setup form with validation
  const form = useForm<UserFormValues>({
    resolver: zodResolver(isEditMode ? userSchema : newUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'user' as const,
    },
    mode: 'onChange',
  });

  // Fetch user if in edit mode
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
    queryFn: () => apiRequest<User>({
      url: `/api/users/${userId}`,
      method: 'GET',
    }),
    enabled: isEditMode && !!userId,
  });

  // Update form values when user data is loaded
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        password: '',  // Don't set password for edit mode
        role: user.role as 'user' | 'admin',
      });
    }
  }, [user, form]);

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (data: UserFormValues) => 
      apiRequest<User>({
        url: '/api/users',
        method: 'POST',
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'Success',
        description: 'User created successfully',
        variant: 'default',
      });
      navigate('/users');
    },
    onError: (error: any) => {
      setFormError(error.message || 'Failed to create user');
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: (data: UserFormValues) => 
      apiRequest<User>({
        url: `/api/users/${userId}`,
        method: 'PUT',
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`, '/api/users'] });
      toast({
        title: 'Success',
        description: 'User updated successfully',
        variant: 'default',
      });
      navigate('/users');
    },
    onError: (error: any) => {
      setFormError(error.message || 'Failed to update user');
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: UserFormValues) => {
    setFormError(null);
    
    // Remove empty password if in edit mode
    if (isEditMode && data.password === '') {
      const { password, ...userWithoutPassword } = data;
      updateMutation.mutate(userWithoutPassword as UserFormValues);
    } else {
      if (isEditMode) {
        updateMutation.mutate(data);
      } else {
        createMutation.mutate(data);
      }
    }
  };

  // Loading state
  const isLoading = isUserLoading || createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/users')}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditMode ? 'Edit User' : 'Create User'}
        </h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit User' : 'Create New User'}</CardTitle>
          <CardDescription>
            {isEditMode 
              ? 'Update user information and permissions' 
              : 'Add a new user to the system'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Smith"
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
                        placeholder={isEditMode ? '••••••' : 'Enter password'}
                        type="password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    {isEditMode && (
                      <FormDescription>
                        Leave blank to keep current password
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Admins have full access to all features
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => navigate('/users')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditMode ? 'Update User' : 'Create User'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}