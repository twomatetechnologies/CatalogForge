import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn, getInitials, randomColor } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { 
  LayoutDashboard, 
  Building2, 
  Package, 
  BookOpen, 
  Layout, 
  Settings, 
  Search,
  PlusIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessProfile } from "@/types";

export default function Sidebar() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch businesses for the sidebar
  const { data: businesses = [] } = useQuery<BusinessProfile[]>({
    queryKey: ["/api/businesses"],
  });

  const navItems = [
    { icon: <LayoutDashboard className="text-lg" />, label: "Dashboard", href: "/" },
    { icon: <Building2 className="text-lg" />, label: "Business Profiles", href: "/businesses" },
    { icon: <Package className="text-lg" />, label: "Products", href: "/products" },
    { icon: <BookOpen className="text-lg" />, label: "Catalogs", href: "/catalogs" },
    { icon: <Layout className="text-lg" />, label: "Templates", href: "/templates" },
    { icon: <Settings className="text-lg" />, label: "Settings", href: "/settings" },
  ];

  // Filter businesses based on search term
  const filteredBusinesses = businesses.filter(business => 
    business.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <a
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg",
                    location === item.href
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>

        {businesses.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Your Businesses
            </h3>
            <ul className="space-y-1">
              {filteredBusinesses.map((business) => (
                <li key={business.id}>
                  <Link href={`/businesses/${business.id}/edit`}>
                    <a className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium",
                        randomColor()
                      )}>
                        {getInitials(business.name)}
                      </div>
                      <span>{business.name}</span>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <Link href="/businesses/new">
          <Button className="w-full justify-center">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add New Business
          </Button>
        </Link>
      </div>
    </aside>
  );
}
