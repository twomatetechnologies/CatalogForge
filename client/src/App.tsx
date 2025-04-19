import { useState, useEffect, createContext } from "react";
import { Switch, Route, useLocation } from "wouter";
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
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import Users from "@/pages/users/Users";
import UserForm from "@/pages/users/UserForm";
import Settings from "@/pages/settings/Settings";

// Types
import { User } from "@/types";
import { apiRequest } from "./lib/queryClient";

// Create Auth Context
export const AuthContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAdmin: boolean;
}>({
  user: null,
  setUser: () => {},
  token: null,
  setToken: () => {},
  isAuthenticated: false,
  login: async () => {
   // throw new Error("Not implemented");
  },
  logout: () => {},
  isAdmin: false,
});

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [location, navigate] = useLocation();
  
  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === "admin";

  // Check if user is authenticated on app load
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        if (token) {
          const userData = await apiRequest<User>({
            url: "/api/auth/me",
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
      }
    };

    fetchCurrentUser();
  }, [token]);

  // Check routes that don't require authentication
  const isPublicRoute = 
    location === "/login" || 
    location === "/register" || 
    location === "/forgot-password" || 
    location.startsWith("/reset-password");

  // Redirect to login if not authenticated and not on a public route
  useEffect(() => {
    if (!isAuthenticated && !isPublicRoute) {
      navigate("/login");
    }
  }, [isAuthenticated, location, navigate, isPublicRoute]);

  // Redirect to dashboard if authenticated and on a public route
  useEffect(() => {
    if (isAuthenticated && isPublicRoute) {
      navigate("/");
    }
  }, [isAuthenticated, isPublicRoute, navigate]);

  const login = async (email: string, password: string): Promise<User> => {
    console.log('App.tsx login function called with:', email, password);
    try {
      console.log('Making API request to /api/auth/login');
      const response = await apiRequest<{ user: User; token: string }>({
        url: "/api/auth/login",
        method: "POST",
        data: { email, password }
      });
      
      console.log('API response received:', response);
      
      if (!response.user || !response.token) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response from server');
      }
      
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem("token", response.token);
      
      // Force redirect to dashboard after successful login
      navigate('/');
      
      return response.user;
    } catch (error) {
      console.error('Error in login function:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiRequest({
        url: "/api/auth/logout",
        method: "POST"
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider 
        value={{ 
          user, 
          setUser, 
          token, 
          setToken, 
          isAuthenticated, 
          login, 
          logout,
          isAdmin
        }}
      >
        <div className="flex flex-col h-screen bg-gray-50">
          {isAuthenticated && <AppHeader user={user} />}
          
          <div className="flex flex-1 overflow-hidden">
            {isAuthenticated && <Sidebar />}
            
            <main className={`flex-1 overflow-y-auto ${!isAuthenticated ? 'flex items-center justify-center' : ''}`}>
              <Switch>
                {/* Public routes */}
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
                <Route path="/forgot-password" component={ForgotPassword} />
                <Route path="/reset-password/:token" component={ResetPassword} />
                
                {/* Protected routes */}
                {isAuthenticated && (
                  <>
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
                    
                    {/* Admin only routes */}
                    {isAdmin && (
                      <>
                        <Route path="/users" component={Users} />
                        <Route path="/users/new" component={UserForm} />
                        <Route path="/users/:id/edit" component={UserForm} />
                        <Route path="/settings" component={Settings} />
                      </>
                    )}
                  </>
                )}
                
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
          
          <Toaster />
        </div>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
