import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { BusinessProfile, Product, Catalog } from "@/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeftIcon, 
  EditIcon, 
  BuildingIcon, 
  PackageIcon,
  BookOpenIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  PaletteIcon,
  FileIcon
} from "lucide-react";

export default function BusinessDetails() {
  const params = useParams();
  const [, navigate] = useLocation();
  const businessId = params.id ? parseInt(params.id) : null;
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch business data
  const { data: business, isLoading: isLoadingBusiness } = useQuery<BusinessProfile>({
    queryKey: [`/api/businesses/${businessId}`],
    enabled: !!businessId,
  });

  // Fetch business products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products", businessId?.toString()],
    queryFn: async ({ queryKey }) => {
      const [_, businessId] = queryKey;
      const url = businessId 
        ? `/api/products?businessId=${businessId}`
        : "/api/products";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    enabled: !!businessId,
  });

  // Fetch business catalogs
  const { data: catalogs = [], isLoading: isLoadingCatalogs } = useQuery<Catalog[]>({
    queryKey: ["/api/catalogs", businessId?.toString()],
    queryFn: async ({ queryKey }) => {
      const [_, businessId] = queryKey;
      const url = businessId 
        ? `/api/catalogs?businessId=${businessId}`
        : "/api/catalogs";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch catalogs");
      return res.json();
    },
    enabled: !!businessId,
  });

  if (!businessId) {
    navigate("/businesses");
    return null;
  }

  if (isLoadingBusiness) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse mb-6"></div>
          <Card>
            <CardHeader>
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-96 bg-gray-100 rounded animate-pulse mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => navigate("/businesses")}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Businesses
          </Button>
          <Card className="text-center p-8">
            <CardContent className="pt-10 pb-10">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <BuildingIcon className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Business not found
              </h3>
              <p className="text-gray-500 mb-6">
                The business profile you are looking for does not exist or has been deleted
              </p>
              <Button onClick={() => navigate("/businesses")}>
                Back to Business Profiles
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate("/businesses")}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Businesses
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {business.logo ? (
              <img 
                src={business.logo} 
                alt={business.name} 
                className="h-16 w-16 rounded-lg object-contain border border-gray-200 bg-white"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-primary-50 flex items-center justify-center">
                <BuildingIcon className="h-8 w-8 text-primary-500" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
              {business.description && (
                <p className="text-gray-500 mt-1 max-w-2xl">{business.description}</p>
              )}
            </div>
          </div>
          <Button
            onClick={() => navigate(`/businesses/${businessId}/edit`)}
            className="md:self-start"
          >
            <EditIcon className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center">
                  <BuildingIcon className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center">
                  <PackageIcon className="h-4 w-4 mr-2" />
                  Products ({products.length})
                </TabsTrigger>
                <TabsTrigger value="catalogs" className="flex items-center">
                  <BookOpenIcon className="h-4 w-4 mr-2" />
                  Catalogs ({catalogs.length})
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <TabsContent value="overview">
              <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      {business.contactEmail && (
                        <div className="flex items-start">
                          <MailIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <div className="text-sm text-gray-500">Email</div>
                            <div>{business.contactEmail}</div>
                          </div>
                        </div>
                      )}
                      
                      {business.contactPhone && (
                        <div className="flex items-start">
                          <PhoneIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <div className="text-sm text-gray-500">Phone</div>
                            <div>{business.contactPhone}</div>
                          </div>
                        </div>
                      )}
                      
                      {business.address && (
                        <div className="flex items-start">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <div className="text-sm text-gray-500">Address</div>
                            <div className="whitespace-pre-line">{business.address}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Latest Activity</h3>
                    <div className="space-y-4">
                      {catalogs.length > 0 ? (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Recent Catalogs
                          </h4>
                          <div className="space-y-2">
                            {catalogs.slice(0, 3).map(catalog => (
                              <div 
                                key={catalog.id}
                                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                                onClick={() => navigate(`/catalogs/${catalog.id}/edit`)}
                              >
                                <div className="flex items-center">
                                  <FileIcon className="h-5 w-5 text-gray-400 mr-3" />
                                  <div>
                                    <div className="font-medium">{catalog.name}</div>
                                    <div className="text-xs text-gray-500">
                                      Updated {formatDate(catalog.updatedAt)}
                                    </div>
                                  </div>
                                </div>
                                <Badge variant={catalog.status === "published" ? "default" : "outline"}>
                                  {catalog.status === "published" ? "Published" : "Draft"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4 border border-dashed border-gray-200 rounded-lg">
                          <BookOpenIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">No catalogs created yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Branding</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-2">Brand Colors</div>
                        <div className="flex gap-2">
                          {business.settings?.theme?.primary && (
                            <div className="flex flex-col items-center">
                              <div 
                                className="h-10 w-10 rounded-full border" 
                                style={{ backgroundColor: business.settings.theme.primary }}
                              />
                              <span className="text-xs mt-1">Primary</span>
                            </div>
                          )}
                          
                          {business.settings?.theme?.secondary && (
                            <div className="flex flex-col items-center">
                              <div 
                                className="h-10 w-10 rounded-full border" 
                                style={{ backgroundColor: business.settings.theme.secondary }}
                              />
                              <span className="text-xs mt-1">Secondary</span>
                            </div>
                          )}
                          
                          {(!business.settings?.theme?.primary && !business.settings?.theme?.secondary) && (
                            <div className="text-gray-500 text-sm">No brand colors set</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-2xl font-bold">{products.length}</div>
                          <div className="text-sm text-gray-500">Products</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-2xl font-bold">{catalogs.length}</div>
                          <div className="text-sm text-gray-500">Catalogs</div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="flex gap-2 w-full">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/products/new?businessId=${businessId}`)}
                        >
                          <PackageIcon className="h-4 w-4 mr-2" />
                          Add Product
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/catalogs/new?businessId=${businessId}`)}
                        >
                          <BookOpenIcon className="h-4 w-4 mr-2" />
                          New Catalog
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="products">
              <CardContent>
                {isLoadingProducts ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map(product => (
                        <TableRow 
                          key={product.id}
                          className="cursor-pointer"
                          onClick={() => navigate(`/products/${product.id}/edit`)}
                        >
                          <TableCell>
                            <div className="flex items-center">
                              {product.images && product.images[0] ? (
                                <img 
                                  src={product.images[0]} 
                                  alt={product.name}
                                  className="h-8 w-8 mr-3 rounded border object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 mr-3 rounded bg-gray-100 flex items-center justify-center">
                                  <PackageIcon className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                              <span>{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{product.sku || "-"}</TableCell>
                          <TableCell>{product.price || "-"}</TableCell>
                          <TableCell>{product.category || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={product.active ? "default" : "outline"}>
                              {product.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-8 border border-dashed border-gray-200 rounded-lg">
                    <PackageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Start adding products to this business
                    </p>
                    <Button onClick={() => navigate(`/products/new?businessId=${businessId}`)}>
                      Add First Product
                    </Button>
                  </div>
                )}
              </CardContent>
              {products.length > 0 && (
                <CardFooter>
                  <Button 
                    onClick={() => navigate(`/products/new?businessId=${businessId}`)}
                    className="ml-auto"
                  >
                    <PackageIcon className="h-4 w-4 mr-2" />
                    Add New Product
                  </Button>
                </CardFooter>
              )}
            </TabsContent>
            
            <TabsContent value="catalogs">
              <CardContent>
                {isLoadingCatalogs ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : catalogs.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Catalog</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {catalogs.map(catalog => (
                        <TableRow 
                          key={catalog.id}
                          className="cursor-pointer"
                          onClick={() => navigate(`/catalogs/${catalog.id}/edit`)}
                        >
                          <TableCell>
                            <div className="flex items-center">
                              <div className="h-8 w-8 mr-3 rounded bg-gray-100 flex items-center justify-center">
                                <FileIcon className="h-4 w-4 text-gray-400" />
                              </div>
                              <span>{catalog.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>Template #{catalog.templateId}</TableCell>
                          <TableCell>{formatDate(catalog.updatedAt)}</TableCell>
                          <TableCell>
                            <Badge variant={catalog.status === "published" ? "default" : "outline"}>
                              {catalog.status === "published" ? "Published" : "Draft"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-8 border border-dashed border-gray-200 rounded-lg">
                    <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No catalogs found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Start creating catalogs for this business
                    </p>
                    <Button onClick={() => navigate(`/catalogs/new?businessId=${businessId}`)}>
                      Create First Catalog
                    </Button>
                  </div>
                )}
              </CardContent>
              {catalogs.length > 0 && (
                <CardFooter>
                  <Button 
                    onClick={() => navigate(`/catalogs/new?businessId=${businessId}`)}
                    className="ml-auto"
                  >
                    <BookOpenIcon className="h-4 w-4 mr-2" />
                    Create New Catalog
                  </Button>
                </CardFooter>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}