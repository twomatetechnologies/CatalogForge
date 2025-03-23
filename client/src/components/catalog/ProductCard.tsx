import { Product } from "@/types";
import { PackageIcon } from "lucide-react";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  return (
    <div className={compact ? "h-full" : ""}>
      <div className={`${compact ? "aspect-w-1 aspect-h-1" : "aspect-w-3 aspect-h-2"} bg-gray-100`}>
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/200x200?text=No+Image";
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-gray-100 text-gray-400">
            <PackageIcon className={`${compact ? "h-5 w-5" : "h-8 w-8"}`} />
          </div>
        )}
      </div>
      
      <div className={`${compact ? "p-2" : "p-3"}`}>
        <h4 className={`${compact ? "text-xs" : "text-sm"} font-medium text-gray-800 ${compact ? "truncate" : ""}`}>
          {product.name}
        </h4>
        
        {!compact && product.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
        )}
        
        <div className={`flex justify-between items-center ${compact ? "mt-1" : "mt-2"}`}>
          <span className={`${compact ? "text-xs" : "text-sm"} font-medium text-gray-900`}>
            {product.price || "-"}
          </span>
          
          {!compact && (
            <span className="text-xs text-gray-500">
              {product.sku || "-"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
