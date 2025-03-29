import { useState } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

// Layout components
import AppHeader from "@/components/layout/AppHeader";
import Sidebar from "@/components/layout/Sidebar";

// Pages
import Dashboard from "@/pages/dashboard/Dashboard";
import BusinessProfiles from "@/pages/business/BusinessProfiles";
import BusinessForm from "@/pages/business/BusinessForm";
import BusinessDetails from "@/pages/business/BusinessDetails";
import Products from "@/pages/products/Products";
import ProductForm from "@/pages/products/ProductForm";
import Catalogs from "@/pages/catalogs/Catalogs";
import CatalogCreate from "@/pages/catalogs/CatalogCreate";
import CatalogView from "@/pages/catalogs/CatalogView";
import Templates from "@/pages/templates/Templates";
import NotFound from "@/pages/not-found";

// Types
import { User } from "@/types";

function App() {
  const [user] = useState<User>({
    id: 1,
    name: "John Smith",
    email: "john@example.com",
  });

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-screen bg-gray-50">
        <AppHeader user={user} />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/businesses" component={BusinessProfiles} />
              <Route path="/businesses/new" component={BusinessForm} />
              <Route path="/businesses/:id" component={BusinessDetails} />
              <Route path="/businesses/:id/edit" component={BusinessForm} />
              <Route path="/products" component={Products} />
              <Route path="/products/new" component={ProductForm} />
              <Route path="/products/:id/edit" component={ProductForm} />
              <Route path="/catalogs" component={Catalogs} />
              <Route path="/catalogs/create" component={CatalogCreate} />
              <Route path="/catalogs/:id" component={CatalogView} />
              <Route path="/catalogs/:id/edit" component={CatalogCreate} />
              <Route path="/templates" component={Templates} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
        
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
