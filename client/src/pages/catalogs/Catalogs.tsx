import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
  FileText, 
  Plus, 
  Download, 
  Eye, 
  Edit, 
  Trash2
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Catalog } from "@/types";

export default function Catalogs() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Get catalogs from API
  const { 
    data: catalogs = [], 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['/api/catalogs']
  });

  // Handle create catalog
  const handleCreateCatalog = () => {
    navigate('/catalogs/create');
  };

  // Handle view catalog
  const handleViewCatalog = (id: number) => {
    navigate(`/catalogs/${id}`);
  };

  // Handle edit catalog
  const handleEditCatalog = (id: number) => {
    navigate(`/catalogs/${id}/edit`);
  };

  // Handle download PDF
  const handleDownloadPDF = async (catalog: Catalog) => {
    try {
      if (catalog.pdfUrl) {
        window.open(catalog.pdfUrl, '_blank');
      } else {
        // Generate PDF if not already generated
        const response = await fetch(`/api/catalogs/${catalog.id}/pdf`);
        if (!response.ok) throw new Error('Failed to generate PDF');
        
        const data = await response.json();
        if (data.pdfUrl) {
          window.open(data.pdfUrl, '_blank');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download catalog PDF",
        variant: "destructive"
      });
    }
  };

  // Handle delete catalog
  const handleDeleteCatalog = async (id: number) => {
    try {
      const response = await fetch(`/api/catalogs/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete catalog');
      
      toast({
        title: "Success",
        description: "Catalog deleted successfully"
      });
      
      // Refresh the catalogs list
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete catalog",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading catalogs...</div>;
  }

  if (isError) {
    return <div className="p-4 text-red-500">Error loading catalogs</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Product Catalogs</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your product catalogs
          </p>
        </div>
        <Button onClick={handleCreateCatalog}>
          <Plus className="h-4 w-4 mr-2" />
          Create Catalog
        </Button>
      </div>

      <Separator className="my-6" />

      {catalogs.length === 0 ? (
        <div className="text-center p-12 bg-muted rounded-lg">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No catalogs yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first catalog to showcase your products
          </p>
          <Button onClick={handleCreateCatalog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Catalog
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogs.map((catalog: Catalog) => (
            <Card key={catalog.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="truncate">{catalog.name}</CardTitle>
                  <Badge variant={catalog.status === 'published' ? 'default' : 'outline'}>
                    {catalog.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <CardDescription className="truncate">
                  {catalog.description || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Created:</span> {formatDate(catalog.createdAt)}
                  </div>
                  {catalog.updatedAt && (
                    <div>
                      <span className="font-medium">Updated:</span> {formatDate(catalog.updatedAt)}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Products:</span> {catalog.productIds.length}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewCatalog(catalog.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCatalog(catalog.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleDownloadPDF(catalog)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteCatalog(catalog.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}