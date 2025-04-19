import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ProductLabelSettings {
  name: string;
  sku: string;
  price: string;
  description: string;
  size: string;
  piecesPerBox: string;
  stock: string;
  stockDate: string;
  barcode: string;
  category: string;
  tags: string;
  variations: string;
  active: string;
}

export interface AppSettings {
  product: ProductLabelSettings;
}

export function useSettings() {
  const { 
    data: settings, 
    isLoading, 
    error 
  } = useQuery<AppSettings>({
    queryKey: ['/api/settings/labels'],
    queryFn: async () => {
      return await apiRequest<AppSettings>({
        url: '/api/settings/labels',
        method: 'GET',
      });
    },
  });

  // Return default values if settings are not loaded yet
  const productLabels: ProductLabelSettings = settings?.product || {
    name: 'Product Name',
    sku: 'SKU',
    price: 'Price',
    description: 'Description',
    size: 'Size',
    piecesPerBox: 'Pieces Per Box',
    stock: 'Stock',
    stockDate: 'Stock Date',
    barcode: 'Barcode',
    category: 'Category',
    tags: 'Tags',
    variations: 'Variations',
    active: 'Active',
  };

  return {
    productLabels,
    isLoading,
    error,
    settings
  };
}