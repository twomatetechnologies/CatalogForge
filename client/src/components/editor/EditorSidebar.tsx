import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchIcon, PackageIcon, ImageIcon, TypeIcon } from "lucide-react";

interface EditorSidebarProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  children: ReactNode;
}

export default function EditorSidebar({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  children,
}: EditorSidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-between px-0 py-0 h-auto">
          <TabsTrigger
            value="products"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500"
          >
            <PackageIcon className="h-4 w-4 mr-1" />
            Products
          </TabsTrigger>
          <TabsTrigger
            value="images"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500"
          >
            <ImageIcon className="h-4 w-4 mr-1" />
            Images
          </TabsTrigger>
          <TabsTrigger
            value="text"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500"
          >
            <TypeIcon className="h-4 w-4 mr-1" />
            Text
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </Tabs>
    </div>
  );
}
