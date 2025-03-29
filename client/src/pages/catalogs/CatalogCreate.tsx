import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Product, Template, BusinessProfile } from "@/types";
import { CheckCircle2, ArrowLeft, Search, Filter, CheckIcon } from "lucide-react";
import { DEFAULT_BUSINESS_ID } from "@shared/config";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Catalog name is required"),
  description: z.string().optional(),
  templateId: z.number().min(1, "Template selection is required"),
  businessId: z.number().default(DEFAULT_BUSINESS_ID),
  productIds: z.array(z.number()).min(1, "At least one product is required"),
  status: z.string().default("draft"),
  settings: z.object({
    pageSize: z.string().default("A4"),
    orientation: z.string().default("portrait"),
    showHeader: z.boolean().default(true),
    showFooter: z.boolean().default(true),
    showPageNumbers: z.boolean().default(true)
  }).default({})
});

type FormValues = z.infer<typeof formSchema>;

export default function CatalogCreate() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("templates");
  
  // Get templates from API
  const { 
    data: templates = [], 
    isLoading: templatesLoading 
  } = useQuery({ 
    queryKey: ['/api/templates'] 
  });
  
  // Get business profile
  const {
    data: business,
    isLoading: businessLoading
  } = useQuery({
    queryKey: ['/api/businesses', DEFAULT_BUSINESS_ID]
  });
  
  // Get products from API
  const {
    data: products = [],
    isLoading: productsLoading
  } = useQuery({
    queryKey: ['/api/products']
  });

  // Form to create new catalog
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      businessId: DEFAULT_BUSINESS_ID,
      templateId: 0, // Will be set when user selects a template
      productIds: [],
      status: "draft",
      settings: {
        pageSize: "A4",
        orientation: "portrait",
        showHeader: true,
        showFooter: true,
        showPageNumbers: true
      }
    }
  });
  
  // Create catalog mutation
  const createCatalog = useMutation({
    mutationFn: async (values: FormValues) => {
      return apiRequest('POST', '/api/catalogs', values);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Catalog created successfully"
      });
      
      // Invalidate catalogs query
      queryClient.invalidateQueries({ queryKey: ['/api/catalogs'] });
      
      // Redirect to catalogs page
      navigate('/catalogs');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create catalog",
        variant: "destructive"
      });
      console.error(error);
    }
  });
  
  // Get all available product categories
  const categories = [...new Set(products.map((p: Product) => p.category).filter(Boolean))];
  
  // Filter products by search term and category
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = searchTerm === "" || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === null || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Handle form submission
  const onSubmit = (values: FormValues) => {
    createCatalog.mutate(values);
  };
  
  // Handle product selection
  const toggleProductSelection = (productId: number) => {
    const currentSelection = form.getValues("productIds");
    let newSelection;
    
    if (currentSelection.includes(productId)) {
      newSelection = currentSelection.filter(id => id !== productId);
    } else {
      newSelection = [...currentSelection, productId];
    }
    
    form.setValue("productIds", newSelection);
    // Force re-render by updating state
    form.trigger("productIds");
  };
  
  // Handle back navigation
  const handleBack = () => {
    navigate('/catalogs');
  };
  
  // Check if a product is selected
  const isProductSelected = (productId: number) => {
    return form.getValues("productIds").includes(productId);
  };
  
  // Handle category filter
  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
  };
  
  // Handle select all in category
  const handleSelectAllInCategory = (category: string) => {
    const categoryProducts = products.filter((p: Product) => p.category === category);
    const categoryProductIds = categoryProducts.map((p: Product) => p.id);
    
    const currentSelection = form.getValues("productIds");
    const allSelected = categoryProducts.every((p: Product) => currentSelection.includes(p.id));
    
    let newSelection;
    if (allSelected) {
      // If all are selected, deselect all in this category
      newSelection = currentSelection.filter(id => !categoryProductIds.includes(id));
    } else {
      // Otherwise, select all in this category
      newSelection = [...new Set([...currentSelection, ...categoryProductIds])];
    }
    
    form.setValue("productIds", newSelection);
    // Force re-render
    form.trigger("productIds");
  };
  
  if (templatesLoading || businessLoading || productsLoading) {
    return <div className="p-4">Loading...</div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Create Catalog</h1>
        </div>
        <Button 
          type="submit" 
          onClick={form.handleSubmit(onSubmit)}
          disabled={createCatalog.isPending}
        >
          {createCatalog.isPending ? "Creating..." : "Create Catalog"}
        </Button>
      </div>
      
      <Form {...form}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Basic information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter catalog details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catalog Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Collection 2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe this catalog..." 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="settings.pageSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Size</FormLabel>
                      <FormControl>
                        <select 
                          className="w-full border rounded-md p-2"
                          {...field}
                        >
                          <option value="A4">A4</option>
                          <option value="Letter">Letter</option>
                          <option value="Legal">Legal</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="settings.orientation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orientation</FormLabel>
                      <FormControl>
                        <select 
                          className="w-full border rounded-md p-2"
                          {...field}
                        >
                          <option value="portrait">Portrait</option>
                          <option value="landscape">Landscape</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="settings.showHeader"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Show Header</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="settings.showFooter"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Show Footer</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="settings.showPageNumbers"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Show Page Numbers</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Selected Items</CardTitle>
                <CardDescription>
                  Items to include in this catalog
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Template: 
                    <span className="font-medium ml-1">
                      {templates.find((t: Template) => t.id === form.getValues("templateId"))?.name || "None selected"}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Products selected: 
                    <span className="font-medium ml-1">
                      {form.getValues("productIds").length}
                    </span>
                  </p>
                  
                  <FormMessage>
                    {form.formState.errors.templateId?.message || 
                     form.formState.errors.productIds?.message}
                  </FormMessage>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Template and product selection */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="templates">
                  1. Select Template
                </TabsTrigger>
                <TabsTrigger value="products">
                  2. Select Products
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="templates" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template: Template) => (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        form.getValues("templateId") === template.id 
                          ? "ring-2 ring-primary" 
                          : "hover:bg-accent/10"
                      }`}
                      onClick={() => {
                        form.setValue("templateId", template.id);
                        form.trigger("templateId");
                      }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          {form.getValues("templateId") === template.id && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted rounded-md h-32 flex items-center justify-center mb-2">
                          {template.thumbnail ? (
                            <img 
                              src={template.thumbnail} 
                              alt={template.name} 
                              className="max-h-full"
                            />
                          ) : (
                            <div className="text-muted-foreground">No preview</div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          <div>Type: <span className="font-medium capitalize">{template.layout.type}</span></div>
                          {template.layout.columns && (
                            <div>Columns: <span className="font-medium">{template.layout.columns}</span></div>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.layout.showPrice && (
                              <Badge variant="outline" className="text-xs">Price</Badge>
                            )}
                            {template.layout.showSKU && (
                              <Badge variant="outline" className="text-xs">SKU</Badge>
                            )}
                            {template.layout.showDescription && (
                              <Badge variant="outline" className="text-xs">Description</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button onClick={() => setActiveTab("products")}>
                    Continue to Product Selection
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="products" className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products by name, SKU or description..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <select 
                      className="h-10 rounded-md border border-input px-3 py-2 text-sm"
                      value={selectedCategory || ""}
                      onChange={(e) => handleCategoryFilter(e.target.value === "" ? null : e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    
                    {selectedCategory && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAllInCategory(selectedCategory)}
                        className="whitespace-nowrap"
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Select All in {selectedCategory}
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium w-10">
                            <Checkbox 
                              checked={
                                filteredProducts.length > 0 && 
                                filteredProducts.every((p: Product) => isProductSelected(p.id))
                              }
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  // Select all filtered products
                                  const currentSelection = form.getValues("productIds");
                                  const newIds = filteredProducts.map((p: Product) => p.id);
                                  const combinedIds = [...new Set([...currentSelection, ...newIds])];
                                  form.setValue("productIds", combinedIds);
                                } else {
                                  // Deselect all filtered products
                                  const currentSelection = form.getValues("productIds");
                                  const filteredIds = filteredProducts.map((p: Product) => p.id);
                                  const remainingIds = currentSelection.filter(id => !filteredIds.includes(id));
                                  form.setValue("productIds", remainingIds);
                                }
                                // Force re-render
                                form.trigger("productIds");
                              }}
                            />
                          </th>
                          <th className="h-12 w-20 px-4 text-left align-middle font-medium">Image</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">SKU</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Price</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Category</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-muted-foreground">
                              No products found matching your criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredProducts.map((product: Product) => (
                            <tr 
                              key={product.id} 
                              className={`border-b transition-colors hover:bg-muted/50 ${
                                isProductSelected(product.id) ? "bg-muted/50" : ""
                              }`}
                              onClick={(e) => {
                                // Prevent click if clicking on checkbox
                                if ((e.target as Element).closest('td')?.classList.contains('p-4')) {
                                  return;
                                }
                                toggleProductSelection(product.id);
                              }}
                            >
                              <td className="p-4 align-middle">
                                <Checkbox 
                                  checked={isProductSelected(product.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      const currentSelection = form.getValues("productIds");
                                      form.setValue("productIds", [...currentSelection, product.id]);
                                    } else {
                                      const currentSelection = form.getValues("productIds");
                                      form.setValue("productIds", currentSelection.filter(id => id !== product.id));
                                    }
                                    // Force re-render
                                    form.trigger("productIds");
                                  }}
                                />
                              </td>
                              <td className="p-2 align-middle">
                                <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                                  {product.images && product.images[0] ? (
                                    <img
                                      src={product.images[0]}
                                      alt={product.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                      No image
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 align-middle font-medium">{product.name}</td>
                              <td className="p-4 align-middle text-muted-foreground">{product.sku || '-'}</td>
                              <td className="p-4 align-middle">{product.price ? `$${product.price}` : '-'}</td>
                              <td className="p-4 align-middle">
                                {product.category ? (
                                  <Badge variant="outline">{product.category}</Badge>
                                ) : (
                                  '-'
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{form.getValues("productIds").length}</span> products selected
                    {form.getValues("productIds").length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-7 text-xs"
                        onClick={() => {
                          form.setValue("productIds", []);
                          form.trigger("productIds");
                        }}
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setActiveTab("templates")}>
                      Back to Templates
                    </Button>
                    <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
                      Create Catalog
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Form>
    </div>
  );
}