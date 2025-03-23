import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { Catalog, BusinessProfile } from "@/types";
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
  MoreHorizontalIcon,
  EditIcon,
  Trash2Icon,
  BookOpenIcon,
  FileTextIcon,
  EyeIcon
} from "lucide-react";

export default function Catalogs() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");

  // Fetch catalogs
  const { data: catalogs = [], isLoading: catalogsLoading } = useQuery<Catalog[]>({
    queryKey: ["/api/catalogs", selectedBusinessId],
    queryFn: async ({ queryKey }) => {
      const [_, businessId] = queryKey;
      const url = businessId
        ? `/api/catalogs?businessId=${businessId}`
        : "/api/catalogs";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch catalogs");
      return res.json();
    },
  });

  // Fetch businesses for filter
  const { data: businesses = [] } = useQuery<BusinessProfile[]>({
    queryKey: ["/api/businesses"],
  });

  // Delete catalog mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/catalogs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/catalogs"] });
      toast({
        title: "Catalog deleted",
        description: "The catalog has been successfully deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete catalog: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Generate PDF mutation
  const generatePdfMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/catalogs/${id}/pdf`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "PDF generated",
        description: "Your catalog PDF has been generated successfully",
      });
      // In a real app, we would handle the download
      // For this prototype, we just show a success message
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate PDF: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle catalog deletion
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this catalog?")) {
      deleteMutation.mutate(id);
    }
  };

  // Handle PDF generation
  const handleGeneratePdf = (id: number) => {
    generatePdfMutation.mutate(id);
  };

  // Filter catalogs based on search term
  const filteredCatalogs = catalogs.filter((catalog) =>
    catalog.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get business name by ID
  const getBusinessName = (businessId: number) => {
    const business = businesses.find((b) => b.id === businessId);
    return business ? business.name : `Business #${businessId}`;
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Catalogs</h2>
          <p className="text-gray-500 mt-1">
            Create and manage your product catalogs
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/catalogs/new">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Catalog
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filter Catalogs</CardTitle>
          <CardDescription>
            Use the filters below to find specific catalogs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name..."
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
                <TableHead>Catalog Name</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalogsLoading ? (
                // Loading state
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={6}>
                      <div className="h-10 bg-gray-100 rounded"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredCatalogs.length > 0 ? (
                // Catalogs list
                filteredCatalogs.map((catalog) => (
                  <TableRow key={catalog.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded border border-gray-200 flex items-center justify-center bg-gray-50 mr-3">
                          <FileTextIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium">{catalog.name}</div>
                          {catalog.description && (
                            <div className="text-xs text-gray-500 max-w-xs truncate">
                              {catalog.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getBusinessName(catalog.businessId)}</TableCell>
                    <TableCell>{formatDate(catalog.createdAt)}</TableCell>
                    <TableCell>{formatDate(catalog.updatedAt)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          catalog.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {catalog.status === "published" ? "Published" : "Draft"}
                      </span>
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
                            onClick={() => navigate(`/catalogs/${catalog.id}/edit`)}
                          >
                            <EditIcon className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleGeneratePdf(catalog.id)}
                          >
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Generate PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.open(`/api/catalogs/${catalog.id}/pdf`, '_blank')}
                          >
                            <EyeIcon className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(catalog.id)}
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
                        <BookOpenIcon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        No catalogs found
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm
                          ? `No catalogs match "${searchTerm}"`
                          : "Create your first catalog to get started"}
                      </p>
                      <Link href="/catalogs/new">
                        <Button>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          New Catalog
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
    </div>
  );
}
