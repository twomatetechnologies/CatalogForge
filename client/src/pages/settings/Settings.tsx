import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
  FormMessage
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Save } from 'lucide-react';

// Product label settings schema
const productLabelsSchema = z.object({
  name: z.string(),
  sku: z.string(),
  price: z.string(),
  description: z.string(),
  size: z.string(),
  piecesPerBox: z.string(),
  stock: z.string(),
  stockDate: z.string(),
  barcode: z.string(),
  category: z.string(),
  tags: z.string(),
  variations: z.string(),
  active: z.string(),
});

type ProductLabelsFormValues = z.infer<typeof productLabelsSchema>;

export default function Settings() {
  const [activeTab, setActiveTab] = useState('product-labels');
  const { toast } = useToast();

  // Product Labels Form
  const labelsForm = useForm<ProductLabelsFormValues>({
    resolver: zodResolver(productLabelsSchema),
    defaultValues: {
      name: 'Product Name',
      sku: 'SKU',
      price: 'Price',
      description: 'Description',
      size: 'Size',
      piecesPerBox: 'Pieces Per Box',
      stock: 'Stock',
      stockDate: 'Stock Date',
      barcode: 'Barcode',
      category: 'Category',
      tags: 'Tags',
      variations: 'Variations',
      active: 'Active',
    },
  });

  // Fetch labels settings
  const { isLoading: isLabelsLoading } = useQuery({
    queryKey: ['/api/settings/labels'],
    queryFn: async () => {
      const response = await apiRequest<{ product: ProductLabelsFormValues }>({
        url: '/api/settings/labels',
        method: 'GET',
      });
      
      if (response.product) {
        labelsForm.reset(response.product);
      }
      
      return response;
    },
  });

  // Update labels mutation
  const labelsMutation = useMutation({
    mutationFn: (data: ProductLabelsFormValues) => 
      apiRequest({
        url: '/api/settings/labels',
        method: 'PUT',
        data: { product: data },
      }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Label settings updated successfully',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update label settings',
        variant: 'destructive',
      });
    },
  });

  // Handle labels form submission
  const onLabelsSubmit = (data: ProductLabelsFormValues) => {
    labelsMutation.mutate(data);
  };

  // Loading states
  const isLoading = isLabelsLoading || labelsMutation.isPending;

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="product-labels" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="product-labels">Product Labels</TabsTrigger>
          <TabsTrigger value="system" disabled>System</TabsTrigger>
          <TabsTrigger value="appearance" disabled>Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="product-labels">
          <Card>
            <CardHeader>
              <CardTitle>Product Labels</CardTitle>
              <CardDescription>
                Customize the labels used for product fields throughout the application.
                These changes will affect how product information is displayed to users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...labelsForm}>
                <form onSubmit={labelsForm.handleSubmit(onLabelsSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={labelsForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name Field</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={labelsForm.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU Field</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={labelsForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price Field</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={labelsForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description Field</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={labelsForm.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size Field</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={labelsForm.control}
                      name="piecesPerBox"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pieces Per Box Field</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={labelsForm.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Field</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={labelsForm.control}
                      name="stockDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Date Field</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={labelsForm.control}
                      name="barcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Barcode Field</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={labelsForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Field</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={labelsForm.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags Field</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={labelsForm.control}
                      name="variations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Variations Field</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={labelsForm.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Active Field</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}