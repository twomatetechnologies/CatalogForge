import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { getInitials } from "@/lib/utils";
import { BusinessProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  PlusIcon, 
  SearchIcon, 
  EditIcon, 
  Trash2Icon, 
  Building2Icon 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function BusinessProfiles() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: businesses = [], isLoading } = useQuery<BusinessProfile[]>({
    queryKey: ["/api/businesses"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/businesses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      toast({
        title: "Business deleted",
        description: "The business profile has been successfully deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete business: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this business?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter businesses based on search term
  const filteredBusinesses = businesses.filter((business) =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Business Profiles</h2>
          <p className="text-gray-500 mt-1">
            Manage your business profiles to generate catalogs
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/businesses/new">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Business
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search businesses..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="opacity-50 animate-pulse">
              <CardHeader>
                <CardTitle className="h-7 bg-gray-200 rounded"></CardTitle>
                <CardDescription className="h-5 bg-gray-100 rounded mt-2"></CardDescription>
              </CardHeader>
              <CardContent className="h-16 bg-gray-100 rounded"></CardContent>
              <CardFooter className="h-10 bg-gray-50 rounded"></CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <Card key={business.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                    {getInitials(business.name)}
                  </div>
                  <CardTitle>{business.name}</CardTitle>
                </div>
                <CardDescription className="mt-2">
                  {business.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {business.address && (
                  <p className="text-sm text-gray-500 mb-2">{business.address}</p>
                )}
                {business.contactEmail && (
                  <p className="text-sm text-gray-500 mb-2">{business.contactEmail}</p>
                )}
                {business.contactPhone && (
                  <p className="text-sm text-gray-500">{business.contactPhone}</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/businesses/${business.id}/edit`)}
                >
                  <EditIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDelete(business.id)}
                >
                  <Trash2Icon className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center p-8">
          <CardContent className="pt-10 pb-10">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Building2Icon className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No business profiles found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? `No businesses match "${searchTerm}"`
                : "Create your first business profile to get started"}
            </p>
            <Button onClick={() => navigate("/businesses/new")}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Business
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
