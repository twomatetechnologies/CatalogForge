// Re-export types from shared schema
import { User as SchemaUser, Business, Product, Template, Catalog } from '@shared/schema';

// User type for client-side use
export interface User extends SchemaUser {
  // Add any client-specific properties here if needed
}

// Re-export other types
export type { Business, Product, Template, Catalog };