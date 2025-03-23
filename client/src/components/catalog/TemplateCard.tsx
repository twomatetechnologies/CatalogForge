import { Template } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EditIcon,
  Trash2Icon,
  CopyIcon,
  MoreHorizontalIcon,
  StarIcon,
  LayoutIcon
} from "lucide-react";

interface TemplateCardProps {
  template: Template;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function TemplateCard({
  template,
  onEdit,
  onDelete,
  onDuplicate,
}: TemplateCardProps) {
  // Function to get the layout icon based on template type
  const getLayoutIcon = () => {
    switch (template.layout.type) {
      case "grid":
        return (
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case "list":
        return (
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        );
      case "featured":
        return (
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case "showcase":
        return (
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return <LayoutIcon className="h-10 w-10" />;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition">
      <div className="aspect-w-4 aspect-h-3 bg-gray-100 relative">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-gray-100 text-gray-400">
            {getLayoutIcon()}
          </div>
        )}
        
        {template.isDefault && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-medium flex items-center">
            <StarIcon className="h-3 w-3 mr-1" />
            Default
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900">{template.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{template.description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={onEdit}>
                <EditIcon className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <CopyIcon className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2Icon className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="text-xs text-gray-500">
          Type: <span className="font-medium">{template.layout.type}</span>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          Use Template
        </Button>
      </CardFooter>
    </Card>
  );
}
