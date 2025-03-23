import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { nanoid } from "nanoid";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { insertCatalogSchema } from "@shared/schema";
import { Catalog, Product, Template, BusinessProfile, CatalogPage, CatalogItem } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeftIcon,
  FilesIcon,
  SaveIcon,
  EyeIcon,
  PlusIcon,
  PackageIcon,
  ImageIcon,
  TypeIcon,
  DownloadIcon,
  GripVerticalIcon,
  XIcon,
  CheckIcon,
  ChevronDownIcon,
  LayoutIcon,
  SettingsIcon,
  PaletteIcon
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import CanvasDropzone from "@/components/editor/CanvasDropzone";
import EditorSidebar from "@/components/editor/EditorSidebar";
import EditorToolbar from "@/components/editor/EditorToolbar";
import ProductCard from "@/components/catalog/ProductCard";

// Extend the schema with validation rules
const formSchema = z.object({
  name: z.string().min(1, "Catalog name is required"),
  description: z.string().optional(),
  businessId: z.number(),
  templateId: z.number(),
  status: z.enum(["draft", "published"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function CatalogEditor() {
  const [, navigate] = useLocation();
  const params = useParams();
  const catalogId = params.id ? parseInt(params.id) : undefined;
  const isEditing = !!catalogId;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [catalogContent, setCatalogContent] = useState<{
    pages: CatalogPage[];
    settings: any;
  }>({
    pages: [
      {
        id: nanoid(),
        items: [],
        layout: "grid",
      },
    ],
    settings: {
      pageSize: "A4",
      orientation: "portrait",
      margins: { top: 20, bottom: 20, left: 20, right: 20 },
      showHeader: true,
      showFooter: true,
      backgroundColor: "#FFFFFF",
    },
  });
  const [activePage, setActivePage] = useState(0);

  // Fetch data for editing
  const { data: catalog, isLoading: isFetchingCatalog } = useQuery<Catalog>({
    queryKey: [`/api/catalogs/${catalogId}`],
    enabled: isEditing,
  });

  // Fetch businesses for select
  const { data: businesses = [] } = useQuery<BusinessProfile[]>({
    queryKey: ["/api/businesses"],
  });

  // Fetch templates for select
  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  // Fetch products for sidebar
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      businessId: businesses[0]?.id || 0,
      templateId: templates[0]?.id || 0,
      status: "draft",
    },
  });

  // Update form and content when data is fetched
  useEffect(() => {
    if (catalog && isEditing) {
      form.reset({
        name: catalog.name,
        description: catalog.description || "",
        businessId: catalog.businessId,
        templateId: catalog.templateId,
        status: catalog.status as "draft" | "published",
      });
      
      setCatalogContent(catalog.content);
    } else if (businesses.length > 0 && templates.length > 0 && !isEditing) {
      form.setValue("businessId", businesses[0].id);
      form.setValue("templateId", templates[0].id);
    }
  }, [catalog, businesses, templates, form, isEditing]);

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create catalog mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/catalogs", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/catalogs"] });
      toast({
        title: "Catalog created",
        description: "Your catalog has been created successfully",
      });
      navigate("/catalogs");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create catalog: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update catalog mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/catalogs/${catalogId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/catalogs"] });
      queryClient.invalidateQueries({ queryKey: [`/api/catalogs/${catalogId}`] });
      toast({
        title: "Catalog updated",
        description: "Your catalog has been updated successfully",
      });
      navigate("/catalogs");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update catalog: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (formValues: FormValues) => {
    setIsLoading(true);
    const catalogData = {
      ...formValues,
      content: catalogContent,
    };
    
    if (isEditing) {
      updateMutation.mutate(catalogData);
    } else {
      createMutation.mutate(catalogData);
    }
  };

  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // Dropped outside the list
    if (!destination) return;

    // Product from sidebar to canvas
    if (source.droppableId === 'product-list' && destination.droppableId === 'canvas') {
      const productId = parseInt(draggableId.replace('product-', ''));
      const product = products.find(p => p.id === productId);
      
      if (product) {
        const newItem: CatalogItem = {
          id: nanoid(),
          type: 'product',
          content: product,
          position: {
            x: destination.index % 2 === 0 ? 0 : 300,
            y: Math.floor(destination.index / 2) * 300,
          },
          size: {
            width: 250,
            height: 250,
          },
        };
        
        const newPages = [...catalogContent.pages];
        newPages[activePage] = {
          ...newPages[activePage],
          items: [...newPages[activePage].items, newItem],
        };
        
        setCatalogContent({
          ...catalogContent,
          pages: newPages,
        });
      }
    }
    
    // Reorder within canvas
    if (source.droppableId === 'canvas' && destination.droppableId === 'canvas') {
      const items = Array.from(catalogContent.pages[activePage].items);
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);
      
      const newPages = [...catalogContent.pages];
      newPages[activePage] = {
        ...newPages[activePage],
        items,
      };
      
      setCatalogContent({
        ...catalogContent,
        pages: newPages,
      });
    }
  };

  // Remove item from canvas
  const removeItem = (itemId: string) => {
    const items = Array.from(catalogContent.pages[activePage].items);
    const newItems = items.filter(item => item.id !== itemId);
    
    const newPages = [...catalogContent.pages];
    newPages[activePage] = {
      ...newPages[activePage],
      items: newItems,
    };
    
    setCatalogContent({
      ...catalogContent,
      pages: newPages,
    });
  };

  // Add new page
  const addPage = () => {
    setCatalogContent({
      ...catalogContent,
      pages: [
        ...catalogContent.pages,
        {
          id: nanoid(),
          items: [],
          layout: "grid",
        },
      ],
    });
    
    // Navigate to the new page
    setActivePage(catalogContent.pages.length);
  };

  // Generate PDF
  const handleGeneratePDF = async () => {
    if (!isEditing) {
      toast({
        title: "Save catalog first",
        description: "Please save your catalog before generating PDF",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/catalogs/${catalogId}/pdf`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }
      
      const data = await response.json();
      
      toast({
        title: "PDF generated",
        description: "Your catalog PDF has been generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to generate PDF: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Get business name by ID
  const getBusinessName = (businessId?: number) => {
    if (!businessId) return "Select a business";
    const business = businesses.find((b) => b.id === businessId);
    return business ? business.name : `Business #${businessId}`;
  };

  // Get template name by ID
  const getTemplateName = (templateId?: number) => {
    if (!templateId) return "Select a template";
    const template = templates.find((t) => t.id === templateId);
    return template ? template.name : `Template #${templateId}`;
  };

  // Loading state
  if (isEditing && isFetchingCatalog) {
    return (
      <div className="p-6">
        <div className="h-full flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500">Loading catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <EditorToolbar
        isEditing={isEditing}
        catalogName={form.watch("name")}
        onBack={() => navigate("/catalogs")}
        onSave={() => setSaveDialogOpen(true)}
        onPreview={handleGeneratePDF}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* Left Sidebar - Products/Assets */}
          <EditorSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          >
            {activeTab === "products" && (
              <Droppable droppableId="product-list" isDropDisabled={true}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="grid grid-cols-2 gap-3 p-3"
                  >
                    {filteredProducts.map((product, index) => (
                      <Draggable
                        key={`product-${product.id}`}
                        draggableId={`product-${product.id}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition cursor-grab ${
                              snapshot.isDragging ? "shadow-lg" : ""
                            }`}
                          >
                            <ProductCard product={product} compact={true} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
            
            {activeTab === "images" && (
              <div className="p-4 text-center text-gray-500">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>Image library not available in prototype</p>
              </div>
            )}
            
            {activeTab === "text" && (
              <div className="p-4 text-center text-gray-500">
                <TypeIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>Text elements not available in prototype</p>
              </div>
            )}
          </EditorSidebar>

          {/* Center - Canvas/Editor Area */}
          <div className="flex-1 bg-gray-100 overflow-auto p-6 flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">Page:</span>
                <Select
                  value={activePage.toString()}
                  onValueChange={(value) => setActivePage(parseInt(value))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select page" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogContent.pages.map((page, index) => (
                      <SelectItem key={page.id} value={index.toString()}>
                        Page {index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        onClick={addPage}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add new page</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex space-x-2">
                <Select
                  value={catalogContent.settings.pageSize}
                  onValueChange={(value) =>
                    setCatalogContent({
                      ...catalogContent,
                      settings: {
                        ...catalogContent.settings,
                        pageSize: value,
                      },
                    })
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Page size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="Letter">US Letter</SelectItem>
                    <SelectItem value="A5">A5</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={catalogContent.settings.orientation}
                  onValueChange={(value) =>
                    setCatalogContent({
                      ...catalogContent,
                      settings: {
                        ...catalogContent.settings,
                        orientation: value,
                      },
                    })
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex-1 flex justify-center">
              <CanvasDropzone
                pageSize={catalogContent.settings.pageSize}
                orientation={catalogContent.settings.orientation}
                items={catalogContent.pages[activePage].items}
                onRemoveItem={removeItem}
              />
            </div>
          </div>

          {/* Right Sidebar - Properties & Settings */}
          <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Properties</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="page">
                <div className="border-b border-gray-200">
                  <TabsList className="flex w-full">
                    <TabsTrigger value="page" className="flex-1">
                      <LayoutIcon className="h-4 w-4 mr-2" />
                      Page
                    </TabsTrigger>
                    <TabsTrigger value="layout" className="flex-1">
                      <LayoutIcon className="h-4 w-4 mr-2" />
                      Layout
                    </TabsTrigger>
                    <TabsTrigger value="style" className="flex-1">
                      <PaletteIcon className="h-4 w-4 mr-2" />
                      Style
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="page" className="p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Page Size</label>
                    <Select
                      value={catalogContent.settings.pageSize}
                      onValueChange={(value) =>
                        setCatalogContent({
                          ...catalogContent,
                          settings: {
                            ...catalogContent.settings,
                            pageSize: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select page size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4 (210 x 297 mm)</SelectItem>
                        <SelectItem value="Letter">US Letter (8.5 x 11 in)</SelectItem>
                        <SelectItem value="A5">A5 (148 x 210 mm)</SelectItem>
                        <SelectItem value="Custom">Custom Size</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Orientation</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={catalogContent.settings.orientation === "portrait" ? "secondary" : "outline"}
                        className="flex items-center justify-center"
                        onClick={() =>
                          setCatalogContent({
                            ...catalogContent,
                            settings: {
                              ...catalogContent.settings,
                              orientation: "portrait",
                            },
                          })
                        }
                      >
                        <span className="transform rotate-0 mr-2">📱</span>
                        Portrait
                      </Button>
                      <Button
                        type="button"
                        variant={catalogContent.settings.orientation === "landscape" ? "secondary" : "outline"}
                        className="flex items-center justify-center"
                        onClick={() =>
                          setCatalogContent({
                            ...catalogContent,
                            settings: {
                              ...catalogContent.settings,
                              orientation: "landscape",
                            },
                          })
                        }
                      >
                        <span className="transform rotate-90 mr-2">📱</span>
                        Landscape
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Margins</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Top (mm)</label>
                        <Input
                          type="number"
                          value={catalogContent.settings.margins.top}
                          onChange={(e) =>
                            setCatalogContent({
                              ...catalogContent,
                              settings: {
                                ...catalogContent.settings,
                                margins: {
                                  ...catalogContent.settings.margins,
                                  top: parseInt(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Bottom (mm)</label>
                        <Input
                          type="number"
                          value={catalogContent.settings.margins.bottom}
                          onChange={(e) =>
                            setCatalogContent({
                              ...catalogContent,
                              settings: {
                                ...catalogContent.settings,
                                margins: {
                                  ...catalogContent.settings.margins,
                                  bottom: parseInt(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Left (mm)</label>
                        <Input
                          type="number"
                          value={catalogContent.settings.margins.left}
                          onChange={(e) =>
                            setCatalogContent({
                              ...catalogContent,
                              settings: {
                                ...catalogContent.settings,
                                margins: {
                                  ...catalogContent.settings.margins,
                                  left: parseInt(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Right (mm)</label>
                        <Input
                          type="number"
                          value={catalogContent.settings.margins.right}
                          onChange={(e) =>
                            setCatalogContent({
                              ...catalogContent,
                              settings: {
                                ...catalogContent.settings,
                                margins: {
                                  ...catalogContent.settings.margins,
                                  right: parseInt(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Page Background</label>
                    <div className="flex space-x-2 mb-2">
                      <button
                        type="button"
                        className={`h-6 w-6 rounded-full border ${
                          catalogContent.settings.backgroundColor === "#FFFFFF"
                            ? "border-primary-500"
                            : "border-gray-300"
                        } bg-white flex items-center justify-center`}
                        onClick={() =>
                          setCatalogContent({
                            ...catalogContent,
                            settings: {
                              ...catalogContent.settings,
                              backgroundColor: "#FFFFFF",
                            },
                          })
                        }
                      >
                        {catalogContent.settings.backgroundColor === "#FFFFFF" && (
                          <CheckIcon className="h-3 w-3 text-primary-600" />
                        )}
                      </button>
                      <button
                        type="button"
                        className={`h-6 w-6 rounded-full ${
                          catalogContent.settings.backgroundColor === "#F3F4F6"
                            ? "border-2 border-primary-500"
                            : "border border-gray-300"
                        } bg-gray-100`}
                        onClick={() =>
                          setCatalogContent({
                            ...catalogContent,
                            settings: {
                              ...catalogContent.settings,
                              backgroundColor: "#F3F4F6",
                            },
                          })
                        }
                      ></button>
                      <button
                        type="button"
                        className={`h-6 w-6 rounded-full ${
                          catalogContent.settings.backgroundColor === "#E5E7EB"
                            ? "border-2 border-primary-500"
                            : "border border-gray-300"
                        } bg-gray-200`}
                        onClick={() =>
                          setCatalogContent({
                            ...catalogContent,
                            settings: {
                              ...catalogContent.settings,
                              backgroundColor: "#E5E7EB",
                            },
                          })
                        }
                      ></button>
                      <button
                        type="button"
                        className={`h-6 w-6 rounded-full ${
                          catalogContent.settings.backgroundColor === "#DBEAFE"
                            ? "border-2 border-primary-500"
                            : "border border-gray-300"
                        } bg-blue-100`}
                        onClick={() =>
                          setCatalogContent({
                            ...catalogContent,
                            settings: {
                              ...catalogContent.settings,
                              backgroundColor: "#DBEAFE",
                            },
                          })
                        }
                      ></button>
                      <button
                        type="button"
                        className={`h-6 w-6 rounded-full ${
                          catalogContent.settings.backgroundColor === "#D1FAE5"
                            ? "border-2 border-primary-500"
                            : "border border-gray-300"
                        } bg-green-100`}
                        onClick={() =>
                          setCatalogContent({
                            ...catalogContent,
                            settings: {
                              ...catalogContent.settings,
                              backgroundColor: "#D1FAE5",
                            },
                          })
                        }
                      ></button>
                    </div>
                    <Input
                      type="text"
                      value={catalogContent.settings.backgroundColor}
                      onChange={(e) =>
                        setCatalogContent({
                          ...catalogContent,
                          settings: {
                            ...catalogContent.settings,
                            backgroundColor: e.target.value,
                          },
                        })
                      }
                      className="text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Header & Footer</label>
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        id="showHeader"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={catalogContent.settings.showHeader}
                        onChange={(e) =>
                          setCatalogContent({
                            ...catalogContent,
                            settings: {
                              ...catalogContent.settings,
                              showHeader: e.target.checked,
                            },
                          })
                        }
                      />
                      <label htmlFor="showHeader" className="text-xs text-gray-700">
                        Show header
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showFooter"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={catalogContent.settings.showFooter}
                        onChange={(e) =>
                          setCatalogContent({
                            ...catalogContent,
                            settings: {
                              ...catalogContent.settings,
                              showFooter: e.target.checked,
                            },
                          })
                        }
                      />
                      <label htmlFor="showFooter" className="text-xs text-gray-700">
                        Show footer
                      </label>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="layout" className="p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Layout Type</label>
                    <Select
                      value={catalogContent.pages[activePage].layout}
                      onValueChange={(value) => {
                        const newPages = [...catalogContent.pages];
                        newPages[activePage] = {
                          ...newPages[activePage],
                          layout: value,
                        };
                        setCatalogContent({
                          ...catalogContent,
                          pages: newPages,
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select layout type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid Layout</SelectItem>
                        <SelectItem value="list">List Layout</SelectItem>
                        <SelectItem value="featured">Featured Product</SelectItem>
                        <SelectItem value="showcase">Feature Showcase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700">Items on Page</label>
                    {catalogContent.pages[activePage].items.length > 0 ? (
                      <div className="border rounded-md divide-y">
                        {catalogContent.pages[activePage].items.map((item, index) => (
                          <div key={item.id} className="flex items-center justify-between p-2">
                            <div className="flex items-center">
                              <GripVerticalIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-xs">
                                {item.type === "product"
                                  ? item.content.name
                                  : `${item.type} item`}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeItem(item.id)}
                            >
                              <XIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 italic text-center p-2 border rounded-md bg-gray-50">
                        Drag items from the sidebar to add them to this page
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="style" className="p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Theme</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="border rounded-md p-2 hover:bg-gray-50 flex flex-col items-center"
                      >
                        <div className="h-8 w-8 mb-1 bg-primary-500 rounded"></div>
                        <span className="text-xs">Default</span>
                      </button>
                      <button
                        type="button"
                        className="border rounded-md p-2 hover:bg-gray-50 flex flex-col items-center"
                      >
                        <div className="h-8 w-8 mb-1 bg-green-500 rounded"></div>
                        <span className="text-xs">Nature</span>
                      </button>
                      <button
                        type="button"
                        className="border rounded-md p-2 hover:bg-gray-50 flex flex-col items-center"
                      >
                        <div className="h-8 w-8 mb-1 bg-purple-500 rounded"></div>
                        <span className="text-xs">Elegant</span>
                      </button>
                      <button
                        type="button"
                        className="border rounded-md p-2 hover:bg-gray-50 flex flex-col items-center"
                      >
                        <div className="h-8 w-8 mb-1 bg-yellow-500 rounded"></div>
                        <span className="text-xs">Vibrant</span>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Typography</label>
                    <div className="space-y-2">
                      <Select value="inter" defaultValue="inter">
                        <SelectTrigger>
                          <SelectValue placeholder="Select font family" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inter">Inter</SelectItem>
                          <SelectItem value="roboto">Roboto</SelectItem>
                          <SelectItem value="merriweather">Merriweather</SelectItem>
                          <SelectItem value="playfair">Playfair Display</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-500">Header Size</label>
                          <Select value="medium" defaultValue="medium">
                            <SelectTrigger>
                              <SelectValue placeholder="Header size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Text Size</label>
                          <Select value="medium" defaultValue="medium">
                            <SelectTrigger>
                              <SelectValue placeholder="Text size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Product Display</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showPrice"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          defaultChecked
                        />
                        <label htmlFor="showPrice" className="text-xs text-gray-700">
                          Show prices
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showSKU"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          defaultChecked
                        />
                        <label htmlFor="showSKU" className="text-xs text-gray-700">
                          Show SKU
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showDescription"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          defaultChecked
                        />
                        <label htmlFor="showDescription" className="text-xs text-gray-700">
                          Show description
                        </label>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Catalog</DialogTitle>
            <DialogDescription>
              Enter the catalog details to save your work
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catalog Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter catalog name" {...field} />
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
                        placeholder="Enter a description for this catalog"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business*</FormLabel>
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
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
                
                <FormField
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template*</FormLabel>
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a template" />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSaveDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  {isEditing ? "Update" : "Create"} Catalog
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
