import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { exportProductsToCSV, downloadCSV } from "@/lib/fileImport";
import { Product, BusinessProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon,
  DownloadIcon,
  UploadIcon,
  MoreHorizontalIcon,
  EditIcon,
  Trash2Icon,
  PackageIcon,
  ClipboardIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";

export default function Products() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", selectedBusinessId],
    queryFn: async ({ queryKey }) => {
      const [_, businessId] = queryKey;
      const url = businessId
        ? `/api/products?businessId=${businessId}`
        : "/api/products";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  // Fetch businesses for filter
  const { data: businesses = [] } = useQuery<BusinessProfile[]>({
    queryKey: ["/api/businesses"],
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Import products mutation
  const importMutation = useMutation({
    mutationFn: async ({ file, businessId }: { file: File; businessId: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("businessId", businessId);
      
      const response = await fetch("/api/import/products", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Import failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setImportDialogOpen(false);
      setImportFile(null);
      toast({
        title: "Import successful",
        description: data.message || `Successfully imported products`,
      });
    },
    onError: (error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle product deletion
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  // Handle file selection for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };

  // Handle product import submission
  const handleImport = () => {
    if (!importFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to import",
        variant: "destructive",
      });
      return;
    }

    if (!selectedBusinessId) {
      toast({
        title: "No business selected",
        description: "Please select a business for these products",
        variant: "destructive",
      });
      return;
    }

    setImportLoading(true);
    importMutation.mutate({ 
      file: importFile, 
      businessId: selectedBusinessId 
    });
  };

  // Handle CSV export
  const handleExport = () => {
    if (products.length === 0) {
      toast({
        title: "No products to export",
        description: "Add some products first before exporting",
        variant: "destructive",
      });
      return;
    }

    const csv = exportProductsToCSV(products);
    downloadCSV(csv, `products-export-${new Date().toISOString().split('T')[0]}.csv`);
    
    toast({
      title: "Export successful",
      description: `Exported ${products.length} products to CSV`,
    });
  };

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Products</h2>
          <p className="text-gray-500 mt-1">
            Manage products to include in your catalogs
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <UploadIcon className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/products/new">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filter Products</CardTitle>
          <CardDescription>
            Use the filters below to find specific products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name or SKU..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={selectedBusinessId}
              onValueChange={setSelectedBusinessId}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Businesses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Businesses</SelectItem>
                {businesses.map((business) => (
                  <SelectItem key={business.id} value={business.id.toString()}>
                    {business.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center">
              <FilterIcon className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsLoading ? (
                // Loading state
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={6}>
                      <div className="h-10 bg-gray-100 rounded"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredProducts.length > 0 ? (
                // Products list
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded border border-gray-200 bg-gray-50 mr-3 overflow-hidden flex items-center justify-center">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <PackageIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.description && (
                            <div className="text-xs text-gray-500 max-w-xs truncate">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.sku || "-"}</TableCell>
                    <TableCell>{product.price || "-"}</TableCell>
                    <TableCell>{product.category || "-"}</TableCell>
                    <TableCell>
                      {product.active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckIcon className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <XIcon className="h-3 w-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => navigate(`/products/${product.id}/edit`)}
                          >
                            <EditIcon className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600"
                          >
                            <Trash2Icon className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // Empty state
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                        <PackageIcon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        No products found
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm
                          ? `No products match "${searchTerm}"`
                          : "Add your first product to get started"}
                      </p>
                      <Link href="/products/new">
                        <Button>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Product
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Products</DialogTitle>
            <DialogDescription>
              Upload a CSV or JSON file to import products
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Select Business</label>
              <Select
                value={selectedBusinessId}
                onValueChange={setSelectedBusinessId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a business" />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((business) => (
                    <SelectItem key={business.id} value={business.id.toString()}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">File</label>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {importFile ? importFile.name : "Choose file..."}
                </Button>
                {importFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setImportFile(null)}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Supported formats: CSV, JSON
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded border border-blue-100">
              <h4 className="text-sm font-medium text-blue-800 mb-1 flex items-center">
                <ClipboardIcon className="h-4 w-4 mr-2" />
                Import Format
              </h4>
              <p className="text-xs text-blue-700">
                Your file should include columns for: name (required), description, sku, price, 
                category, and active status
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!importFile || !selectedBusinessId || importLoading}
            >
              {importLoading ? "Importing..." : "Import Products"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
