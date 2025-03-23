import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { insertBusinessSchema } from "@shared/schema";
import { BusinessProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Form,
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";

// Extend the schema with validation rules
const formSchema = insertBusinessSchema.extend({
  name: z.string().min(1, "Business name is required"),
  contactEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export default function BusinessForm() {
  const [, navigate] = useLocation();
  const params = useParams();
  const businessId = params.id ? parseInt(params.id) : undefined;
  const isEditing = !!businessId;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch business data if editing
  const { data: business, isLoading: isFetchingBusiness } = useQuery<BusinessProfile>({
    queryKey: [`/api/businesses/${businessId}`],
    enabled: isEditing,
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      contactEmail: "",
      contactPhone: "",
      logo: "",
    },
  });

  // Update form with business data when available
  useEffect(() => {
    if (business && isEditing) {
      form.reset({
        name: business.name,
        description: business.description || "",
        address: business.address || "",
        contactEmail: business.contactEmail || "",
        contactPhone: business.contactPhone || "",
        logo: business.logo || "",
      });
    }
  }, [business, form, isEditing]);

  // Create business mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/businesses", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      toast({
        title: "Business created",
        description: "Your business profile has been created successfully",
      });
      navigate("/businesses");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create business: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update business mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("PUT", `/api/businesses/${businessId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}`] });
      toast({
        title: "Business updated",
        description: "Your business profile has been updated successfully",
      });
      navigate("/businesses");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update business: ${error.message}`,
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

  // Loading state
  if (isEditing && isFetchingBusiness) {
    return (
      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="h-7 bg-gray-200 rounded animate-pulse"></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
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
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate("/businesses")}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Businesses
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? "Edit Business Profile" : "Create Business Profile"}
            </CardTitle>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter business name" {...field} />
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
                          placeholder="Describe your business"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Business address"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="contact@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/logo.png"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/businesses")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  {isEditing ? "Update" : "Create"} Business
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
