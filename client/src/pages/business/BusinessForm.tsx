import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { insertBusinessSchema } from "@shared/schema";
import { BusinessProfile, Template } from "@/types";
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
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ui/image-upload";
import { ArrowLeftIcon, SaveIcon, BuildingIcon, PaletteIcon, SettingsIcon } from "lucide-react";

// Extend the schema with validation rules
const formSchema = insertBusinessSchema.extend({
  name: z.string().min(1, "Business name is required"),
  contactEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  settings: z.object({
    defaultTemplateId: z.number().optional(),
    theme: z.object({
      primary: z.string().optional(),
      secondary: z.string().optional()
    }).optional(),
    pdfSettings: z.object({
      defaultSize: z.string().optional(),
      defaultOrientation: z.enum(['portrait', 'landscape']).optional()
    }).optional()
  }).optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function BusinessForm() {
  const [, navigate] = useLocation();
  const params = useParams();
  const businessId = params.id ? parseInt(params.id) : undefined;
  const isEditing = !!businessId;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch business data if editing
  const { data: business, isLoading: isFetchingBusiness } = useQuery<BusinessProfile>({
    queryKey: [`/api/businesses/${businessId}`],
    enabled: isEditing,
  });

  // Fetch templates for the default template selection
  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
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
      settings: {
        theme: {
          primary: "#4F46E5",
          secondary: "#10B981"
        },
        pdfSettings: {
          defaultSize: "A4",
          defaultOrientation: "portrait"
        }
      }
    },
  });

  // Update form with business data when available
  useEffect(() => {
    if (business && isEditing) {
      form.reset({
        name: business.name,
        description: business.description ?? "",
        address: business.address ?? "",
        contactEmail: business.contactEmail ?? "",
        contactPhone: business.contactPhone ?? "",
        logo: business.logo ?? "",
        settings: business.settings || {
          theme: {
            primary: "#4F46E5",
            secondary: "#10B981"
          },
          pdfSettings: {
            defaultSize: "A4",
            defaultOrientation: "portrait"
          }
        }
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
        <Card className="max-w-3xl mx-auto">
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
      <div className="max-w-3xl mx-auto">
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
            <CardDescription>
              Manage your business information, branding, and default settings
            </CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile" className="flex items-center">
                  <BuildingIcon className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="branding" className="flex items-center">
                  <PaletteIcon className="h-4 w-4 mr-2" />
                  Branding
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center">
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <TabsContent value="profile" className="mt-4">
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
                              value={field.value ?? ""}
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
                              value={field.value ?? ""}
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
                              <Input placeholder="+1 (555) 123-4567" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </TabsContent>

                <TabsContent value="branding" className="mt-4">
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Logo</FormLabel>
                          <FormControl>
                            <ImageUpload
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription>
                            Upload your business logo or enter a URL to an image. This will appear on your catalogs.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="settings.theme.primary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color</FormLabel>
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-6 w-6 rounded-full border" 
                                style={{ backgroundColor: field.value || '#4F46E5' }}
                              />
                              <FormControl>
                                <Input 
                                  type="text" 
                                  placeholder="#4F46E5" 
                                  {...field} 
                                  value={field.value || '#4F46E5'}
                                />
                              </FormControl>
                            </div>
                            <FormDescription>
                              The main color for your brand
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="settings.theme.secondary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Color</FormLabel>
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-6 w-6 rounded-full border" 
                                style={{ backgroundColor: field.value || '#10B981' }}
                              />
                              <FormControl>
                                <Input 
                                  type="text" 
                                  placeholder="#10B981" 
                                  {...field} 
                                  value={field.value || '#10B981'}
                                />
                              </FormControl>
                            </div>
                            <FormDescription>
                              A complementary color for your brand
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </TabsContent>

                <TabsContent value="settings" className="mt-4">
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="settings.defaultTemplateId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Template</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(Number(value))}
                            value={field.value ? field.value.toString() : undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a default template" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {templates.map((template) => (
                                <SelectItem 
                                  key={template.id} 
                                  value={template.id.toString()}
                                >
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the default template for new catalogs
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="settings.pdfSettings.defaultSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Page Size</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select page size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="A4">A4</SelectItem>
                                <SelectItem value="Letter">Letter</SelectItem>
                                <SelectItem value="Legal">Legal</SelectItem>
                                <SelectItem value="Tabloid">Tabloid</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Default page size for PDF catalogs
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="settings.pdfSettings.defaultOrientation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Orientation</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select orientation" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="portrait">Portrait</SelectItem>
                                <SelectItem value="landscape">Landscape</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Default orientation for PDF catalogs
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </TabsContent>

                <CardFooter className="flex justify-end gap-2 mt-4">
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
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
