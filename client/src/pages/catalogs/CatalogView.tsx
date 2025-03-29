import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  FileText, 
  Calendar,
  Layers,
  Tag
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { CatalogPDFViewer } from "@/components/PDFViewer";
import { Catalog, Product, Template, BusinessProfile } from "@/types";

export default function CatalogView() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [generatingPDF, setGeneratingPDF] = useState(false);
  
  // Get catalog, products, template, and business data
  const catalogId = params.id ? parseInt(params.id) : 0;
  
  const { 
    data: catalog,
    isLoading: catalogLoading,
    isError: catalogError
  } = useQuery({
    queryKey: [`/api/catalogs/${catalogId}`],
    enabled: catalogId > 0
  });
  
  const {
    data: templates = [],
    isLoading: templatesLoading
  } = useQuery({
    queryKey: ['/api/templates'],
    enabled: !!catalog
  });
  
  // Get the specific template for this catalog
  const template = templates.find(t => t.id === catalog?.templateId);
  
  const {
    data: business,
    isLoading: businessLoading
  } = useQuery({
    queryKey: ['/api/businesses', catalog?.businessId],
    enabled: !!catalog?.businessId
  });
  
  const {
    data: allProducts = [],
    isLoading: productsLoading
  } = useQuery({
    queryKey: ['/api/products'],
    enabled: !!catalog
  });
  
  // Filter products to only include those in the catalog
  const catalogProducts = catalog?.productIds && Array.isArray(allProducts)
    ? allProducts.filter((product: Product) => catalog.productIds?.includes(product.id))
    : [];

  // Handle back navigation
  const handleBack = () => {
    navigate('/catalogs');
  };
  
  // Handle edit catalog
  const handleEdit = () => {
    navigate(`/catalogs/${catalogId}/edit`);
  };
  
  // Handle download and generation of PDF
  const handleDownloadPDF = async () => {
    if (!catalog) return;
    
    try {
      setGeneratingPDF(true);
      
      // Generate PDF (or retrieve existing one)
      const response = await fetch(`/api/catalogs/${catalog.id}/pdf`);
      if (!response.ok) throw new Error('Failed to generate PDF');
      
      const data = await response.json();
      
      toast({
        title: "Success",
        description: "Catalog PDF has been generated successfully",
      });
      
      // Refetch the catalog data to show updated PDF
      await queryClient.invalidateQueries({ queryKey: [`/api/catalogs/${catalogId}`] });
      
      // Also invalidate the catalog list
      await queryClient.invalidateQueries({ queryKey: ['/api/catalogs'] });
      
      // For the "Download PDF" action, open in a new tab
      if (data.pdfUrl) {
        // Create a temporary anchor to handle the download correctly
        const a = document.createElement('a');
        a.href = data.pdfUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate catalog PDF",
        variant: "destructive"
      });
    } finally {
      setGeneratingPDF(false);
    }
  };
  
  const isLoading = catalogLoading || templatesLoading || businessLoading || productsLoading;
  
  if (isLoading) {
    return <div className="p-4">Loading catalog...</div>;
  }
  
  if (catalogError || !catalog) {
    return <div className="p-4 text-red-500">Catalog not found</div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{catalog.name}</h1>
          <Badge 
            variant={catalog.status === 'published' ? 'default' : 'outline'} 
            className="ml-4"
          >
            {catalog.status === 'published' ? 'Published' : 'Draft'}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="default" 
            onClick={handleDownloadPDF}
            disabled={generatingPDF}
          >
            <Download className="h-4 w-4 mr-1" />
            {generatingPDF ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>
      
      {catalog.description && (
        <p className="text-muted-foreground mb-6">{catalog.description}</p>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Catalog Preview</CardTitle>
              <CardDescription>
                Preview how your catalog will appear
              </CardDescription>
            </CardHeader>
            <CardContent>
              {catalog.pdfUrl ? (
                <div className="h-[600px] border rounded-md">
                  <iframe 
                    src={catalog.pdfUrl} 
                    className="w-full h-full"
                    title="Catalog Preview"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-muted rounded-md">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Preview not available</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Generate a PDF to preview your catalog
                  </p>
                  <Button 
                    onClick={handleDownloadPDF}
                    disabled={generatingPDF}
                  >
                    {generatingPDF ? "Generating..." : "Generate Preview"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Catalog Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(catalog.createdAt)}
                  </p>
                </div>
              </div>
              
              {catalog.updatedAt && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(catalog.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center">
                <Layers className="h-4 w-4 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Template</p>
                  <p className="text-sm text-muted-foreground">
                    {template?.name || 'Unknown template'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Products</p>
                  <p className="text-sm text-muted-foreground">
                    {catalog.productIds ? catalog.productIds.length : 0} products included
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium mb-2">Settings</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>Page Size:</div>
                  <div className="font-medium">{catalog.settings?.pageSize || 'A4'}</div>
                  
                  <div>Orientation:</div>
                  <div className="font-medium capitalize">
                    {catalog.settings?.orientation || 'Portrait'}
                  </div>
                  
                  <div>Header:</div>
                  <div className="font-medium">
                    {catalog.settings?.showHeader ? 'Shown' : 'Hidden'}
                  </div>
                  
                  <div>Footer:</div>
                  <div className="font-medium">
                    {catalog.settings?.showFooter ? 'Shown' : 'Hidden'}
                  </div>
                  
                  <div>Page Numbers:</div>
                  <div className="font-medium">
                    {catalog.settings?.showPageNumbers ? 'Shown' : 'Hidden'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Products included in this catalog
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {catalogProducts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No products in this catalog
                  </p>
                ) : (
                  catalogProducts.map((product: Product) => (
                    <div 
                      key={product.id} 
                      className="flex items-center p-2 rounded-md hover:bg-muted"
                    >
                      <div className="w-10 h-10 bg-muted rounded-md overflow-hidden mr-3 flex-shrink-0">
                        {product.images && product.images[0] ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="font-medium truncate">
                          {product.name}
                        </div>
                        {product.sku && (
                          <div className="text-xs text-muted-foreground">
                            SKU: {product.sku}
                          </div>
                        )}
                      </div>
                      {product.price && (
                        <div className="text-sm font-medium ml-2">
                          ${product.price}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}