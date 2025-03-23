import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Template } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  PlusIcon, 
  SearchIcon,
  EditIcon,
  Trash2Icon,
  CopyIcon,
  LayoutIcon
} from "lucide-react";
import TemplateCard from "@/components/catalog/TemplateCard";

export default function Templates() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template deleted",
        description: "The template has been successfully deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete template: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle template deletion
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(id);
    }
  };

  // Handle template edit
  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  // Handle template duplication
  const handleDuplicate = async (template: Template) => {
    try {
      const { id, ...templateData } = template;
      const newTemplate = {
        ...templateData,
        name: `${template.name} (Copy)`,
        isDefault: false,
      };
      
      const response = await apiRequest("POST", "/api/templates", newTemplate);
      
      if (!response.ok) {
        throw new Error("Failed to duplicate template");
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      
      toast({
        title: "Template duplicated",
        description: "The template has been successfully duplicated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to duplicate template: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Filter templates based on search term
  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Templates</h2>
          <p className="text-gray-500 mt-1">
            Browse and manage catalog templates
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setDialogOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search templates..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="opacity-50 animate-pulse">
              <div className="aspect-w-4 aspect-h-3 bg-gray-200"></div>
              <CardContent className="p-4">
                <div className="h-5 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-100 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={() => handleEdit(template)}
              onDelete={() => handleDelete(template.id)}
              onDuplicate={() => handleDuplicate(template)}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center p-8">
          <CardContent className="pt-10 pb-10">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <LayoutIcon className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No templates found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? `No templates match "${searchTerm}"`
                : "Create your first template to get started"}
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* New/Edit Template Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? "Edit Template" : "Create New Template"}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate
                ? "Modify the template properties"
                : "Create a new catalog template"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Template Name
              </label>
              <Input
                id="name"
                placeholder="Enter template name"
                defaultValue={selectedTemplate?.name || ""}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="description"
                placeholder="Enter template description"
                defaultValue={selectedTemplate?.description || ""}
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Layout Type</label>
              <div className="grid grid-cols-2 gap-3">
                <Card className={`cursor-pointer border ${!selectedTemplate?.layout || selectedTemplate?.layout.type === "grid" ? "border-primary-500 bg-primary-50" : "border-gray-200"}`}>
                  <CardContent className="p-3 text-center">
                    <div className="h-14 flex items-center justify-center text-gray-500 mb-2">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium">Grid Layout</div>
                  </CardContent>
                </Card>
                
                <Card className={`cursor-pointer border ${selectedTemplate?.layout?.type === "list" ? "border-primary-500 bg-primary-50" : "border-gray-200"}`}>
                  <CardContent className="p-3 text-center">
                    <div className="h-14 flex items-center justify-center text-gray-500 mb-2">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium">List Layout</div>
                  </CardContent>
                </Card>
                
                <Card className={`cursor-pointer border ${selectedTemplate?.layout?.type === "featured" ? "border-primary-500 bg-primary-50" : "border-gray-200"}`}>
                  <CardContent className="p-3 text-center">
                    <div className="h-14 flex items-center justify-center text-gray-500 mb-2">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium">Featured Product</div>
                  </CardContent>
                </Card>
                
                <Card className={`cursor-pointer border ${selectedTemplate?.layout?.type === "showcase" ? "border-primary-500 bg-primary-50" : "border-gray-200"}`}>
                  <CardContent className="p-3 text-center">
                    <div className="h-14 flex items-center justify-center text-gray-500 mb-2">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium">Feature Showcase</div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                defaultChecked={selectedTemplate?.isDefault || false}
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Set as default template
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTemplate(null);
                setDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: selectedTemplate ? "Template updated" : "Template created",
                  description: "This functionality is limited in the prototype",
                });
                setSelectedTemplate(null);
                setDialogOpen(false);
              }}
            >
              {selectedTemplate ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
