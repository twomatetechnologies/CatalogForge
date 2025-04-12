import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { insertProductSchema } from "@shared/schema";
import { Product, BusinessProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Form,
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, SaveIcon, XIcon, UploadIcon } from "lucide-react";

// Extend the schema with validation rules
const formSchema = insertProductSchema
  .extend({
    name: z.string().min(1, "Product name is required"),
    businessId: z.number(),
    price: z.string().optional().or(z.literal("")),
    size: z.string().optional().or(z.literal("")),
    piecesPerBox: z.number().optional().or(z.literal(undefined)),
    tags: z.array(z.string()).optional().default([]),
  })
  .omit({ images: true })
  .extend({
    images: z.array(z.string()).optional().default([]),
    newTag: z.string().optional(),
  });

type FormValues = z.infer<typeof formSchema>;

export default function ProductForm() {
  const [, navigate] = useLocation();
  const params = useParams();
  const productId = params.id ? parseInt(params.id) : undefined;
  const isEditing = !!productId;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch businesses
  const { data: businesses = [] } = useQuery<BusinessProfile[]>({
    queryKey: ["/api/businesses"],
  });

  // Fetch product data if editing
  const { data: product, isLoading: isFetchingProduct } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: isEditing,
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      price: "",
      size: "",
      piecesPerBox: undefined,
      businessId: businesses[0]?.id || 0,
      category: "",
      tags: [],
      images: [],
      active: true,
      newTag: "",
    },
  });

  // Update form with product data when available
  useEffect(() => {
    if (product && isEditing) {
      form.reset({
        ...product,
        tags: product.tags || [],
        images: product.images || [],
        newTag: "",
      });
    } else if (businesses.length > 0 && !isEditing) {
      form.setValue("businessId", businesses[0].id);
    }
  }, [product, businesses, form, isEditing]);

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const { newTag, ...productData } = data;
      const response = await apiRequest("POST", "/api/products", productData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product created",
        description: "Your product has been created successfully",
      });
      navigate("/products");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const { newTag, ...productData } = data;
      const response = await apiRequest("PUT", `/api/products/${productId}`, productData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
      toast({
        title: "Product updated",
        description: "Your product has been updated successfully",
      });
      navigate("/products");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    setIsLoading(true);
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // Add tag to the form
  const addTag = () => {
    const newTag = form.getValues("newTag");
    if (!newTag) return;

    const currentTags = form.getValues("tags") || [];
    if (!currentTags.includes(newTag)) {
      form.setValue("tags", [...currentTags, newTag]);
      form.setValue("newTag", "");
    }
  };

  // Remove tag from the form
  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  // Add image URL to the form
  const addImageUrl = () => {
    if (!newImageUrl) return;

    const currentImages = form.getValues("images") || [];
    if (!currentImages.includes(newImageUrl)) {
      form.setValue("images", [...currentImages, newImageUrl]);
      setNewImageUrl("");
    }
  };

  // Remove image URL from the form
  const removeImageUrl = (urlToRemove: string) => {
    const currentImages = form.getValues("images") || [];
    form.setValue(
      "images",
      currentImages.filter((url) => url !== urlToRemove)
    );
  };

  // Loading state
  if (isEditing && isFetchingProduct) {
    return (
      <div className="p-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="h-7 bg-gray-200 rounded animate-pulse"></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </CardContent>
          <CardFooter className="h-10 bg-gray-50 rounded animate-pulse"></CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate("/products")}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? "Edit Product" : "Create Product"}
            </CardTitle>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter product name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business*</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value.toString()}
                            value={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a business" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {businesses.map((business) => (
                                <SelectItem
                                  key={business.id}
                                  value={business.id.toString()}
                                >
                                  {business.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                              <Input placeholder="SKU-1234" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input placeholder="99.99" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Size</FormLabel>
                            <FormControl>
                              <Input placeholder="12 x 8 x 4 inches" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="piecesPerBox"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pieces Per Box</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="5" 
                                value={field.value === undefined ? '' : field.value}
                                onChange={(e) => {
                                  const value = e.target.value === '' 
                                    ? undefined 
                                    : parseInt(e.target.value, 10);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input placeholder="Category" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Active Product
                            </FormLabel>
                            <FormDescription>
                              Set this product as active to include in catalogs
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your product"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel>Images</FormLabel>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          placeholder="Image URL"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addImageUrl}
                          disabled={!newImageUrl}
                        >
                          <UploadIcon className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                      <div className="mt-3">
                        {form.watch("images")?.length ? (
                          <div className="grid grid-cols-2 gap-2">
                            {form.watch("images")?.map((url, index) => (
                              <div
                                key={index}
                                className="relative border rounded overflow-hidden"
                              >
                                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                  <img
                                    src={url}
                                    alt={`Product image ${index + 1}`}
                                    className="object-contain h-full w-full"
                                    onError={(e) => {
                                      e.currentTarget.src = "https://placehold.co/200x200?text=Image+Error";
                                    }}
                                  />
                                </div>
                                <button
                                  type="button"
                                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                                  onClick={() => removeImageUrl(url)}
                                >
                                  <XIcon className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 italic">
                            No images added
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <FormLabel>Tags</FormLabel>
                      <div className="flex items-center gap-2 mt-2">
                        <FormField
                          control={form.control}
                          name="newTag"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Add tag" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addTag}
                          disabled={!form.getValues("newTag")}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {form.watch("tags")?.length ? (
                          form.watch("tags")?.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="gap-1 pr-1"
                            >
                              {tag}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 rounded-full"
                                onClick={() => removeTag(tag)}
                              >
                                <XIcon className="h-2 w-2" />
                              </Button>
                            </Badge>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 italic">
                            No tags added
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/products")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  {isEditing ? "Update" : "Create"} Product
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
