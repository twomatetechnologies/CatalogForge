import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Catalog, Product, Template, DashboardStats } from "@/types";
import { 
  PlusIcon, 
  FilterIcon, 
  BookOpenIcon, 
  PackageIcon, 
  DownloadIcon,
  MoreHorizontalIcon,
  FileTextIcon
} from "lucide-react";

export default function Dashboard() {
  // Fetch dashboard data
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    // If no endpoint exists yet, use placeholder data
    placeholderData: {
      totalCatalogs: 12,
      activeProducts: 248,
      totalDownloads: 587
    }
  });

  const { data: catalogs = [] } = useQuery<Catalog[]>({
    queryKey: ["/api/catalogs"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  // Sort catalogs by creation date (newest first)
  const recentCatalogs = [...catalogs]
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 3); // Get only the 3 most recent

  // Get recent products
  const recentProducts = [...products]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
        <div className="flex space-x-4">
          <Button variant="outline" size="sm">
            <FilterIcon className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Link href="/catalogs/new">
            <Button size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              New Catalog
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                <BookOpenIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Catalogs</p>
                <h3 className="text-xl font-semibold text-gray-800">{stats?.totalCatalogs || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                <PackageIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Products</p>
                <h3 className="text-xl font-semibold text-gray-800">{stats?.activeProducts || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                <DownloadIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Downloads</p>
                <h3 className="text-xl font-semibold text-gray-800">{stats?.totalDownloads || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Catalogs */}
      <Card className="mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Recent Catalogs</h3>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catalog Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentCatalogs.length > 0 ? (
                  recentCatalogs.map((catalog) => (
                    <tr key={catalog.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded border border-gray-200 flex items-center justify-center bg-gray-50 mr-3">
                            <FileTextIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800">{catalog.name}</div>
                            <div className="text-xs text-gray-500">Product Catalog</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {/* In a real app, we would fetch the business name */}
                          Business #{catalog.businessId}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {/* In a real app, we would count products */}
                          {Math.floor(Math.random() * 50) + 10}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{formatDate(catalog.createdAt)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          catalog.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {catalog.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/catalogs/${catalog.id}/edit`}>
                          <a className="text-primary-600 hover:text-primary-800 mr-3">Edit</a>
                        </Link>
                        <Link href={`/api/catalogs/${catalog.id}/pdf`} target="_blank">
                          <a className="text-primary-600 hover:text-primary-800 mr-3">PDF</a>
                        </Link>
                        <button className="text-gray-500 hover:text-gray-700">
                          <MoreHorizontalIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                      No catalogs found. 
                      <Link href="/catalogs/new">
                        <a className="text-primary-600 hover:text-primary-800 ml-1">
                          Create your first catalog
                        </a>
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
      
      {/* Templates and Products Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Templates Section */}
        <Card>
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Templates</h3>
            <Link href="/templates">
              <a className="text-sm text-primary-600 hover:text-primary-700">View All</a>
            </Link>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {templates.slice(0, 4).map((template) => (
                <div 
                  key={template.id} 
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer"
                >
                  <div className="aspect-w-4 aspect-h-3 bg-gray-100">
                    <div className="flex items-center justify-center h-full w-full bg-gray-100 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-gray-800">{template.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        {/* Recent Products Section */}
        <Card>
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Recent Products</h3>
            <Link href="/products">
              <a className="text-sm text-primary-600 hover:text-primary-700">View All</a>
            </Link>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-200">
              {recentProducts.length > 0 ? (
                recentProducts.map((product) => (
                  <li key={product.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded border border-gray-200 bg-gray-50 mr-3 overflow-hidden flex items-center justify-center">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full" />
                        ) : (
                          <PackageIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{product.name}</div>
                        <div className="text-xs text-gray-500">SKU: {product.sku || `-`}</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{product.price || '-'}</div>
                  </li>
                ))
              ) : (
                <li className="py-6 text-center text-sm text-gray-500">
                  No products found. 
                  <Link href="/products/new">
                    <a className="text-primary-600 hover:text-primary-800 ml-1">
                      Add your first product
                    </a>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
