-- Seed Data for Catalog Builder

-- Insert sample business
INSERT INTO businesses (id, name, logo, description, contact_email, contact_phone, settings)
VALUES 
(1, 'Demo Company', 'https://example.com/logo.png', 'A demo company for the catalog builder', 'contact@demo.com', '555-123-4567', 
'{"defaultTemplateId": 1, "theme": {"primary": "#3b82f6", "secondary": "#10b981"}, "pdfSettings": {"defaultSize": "A4", "defaultOrientation": "portrait"}}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert sample templates
INSERT INTO templates (id, name, description, thumbnail, layout, is_default)
VALUES 
(1, 'Grid Layout', 'A simple grid layout for products', '/templates/product-grid.svg', 
'{"type": "grid", "columns": 3, "rows": 3, "showPrice": true, "showSKU": false, "showDescription": true, "showImage": true, "showFeatures": false, "compact": false}'::jsonb, 
true),

(2, 'Featured Products', 'Highlights key products with larger images', '/templates/feature-showcase.svg', 
'{"type": "featured", "showPrice": true, "showSKU": true, "showDescription": true, "showImage": true, "showFeatures": true, "imagePosition": "left", "highlightFeatures": true}'::jsonb, 
false),

(3, 'Product List', 'A compact list layout for many products', '/templates/price-list.svg', 
'{"type": "list", "showPrice": true, "showSKU": true, "showDescription": false, "showImage": true, "compact": true}'::jsonb, 
false),

(4, 'Product Showcase', 'Large images with detailed product information', '/templates/lookbook.svg', 
'{"type": "showcase", "showPrice": true, "showSKU": false, "showDescription": true, "showImage": true, "showFeatures": true, "showBulletPoints": true, "imagePosition": "top"}'::jsonb, 
false),

(5, 'Marketing Special', 'Special marketing layout for promotions', '/templates/custom/marketing-special.svg', 
'{"type": "featured", "showPrice": true, "showSKU": false, "showDescription": true, "showImage": true, "showFeatures": true, "highlightFeatures": true, "imagePosition": "right"}'::jsonb, 
false)
ON CONFLICT (id) DO NOTHING;

-- Insert sample products
INSERT INTO products (id, business_id, name, description, sku, price, category, images, tags, active)
VALUES 
(1, 1, 'Classic Widget', 'Our best-selling widget with premium features', 'WDG-001', '29.99', 'Widgets', 
ARRAY['https://example.com/widget1.jpg', 'https://example.com/widget1b.jpg'], 
ARRAY['bestseller', 'featured'], true),

(2, 1, 'Deluxe Gadget', 'High-performance gadget for professionals', 'GDG-002', '49.99', 'Gadgets', 
ARRAY['https://example.com/gadget2.jpg'], 
ARRAY['premium', 'professional'], true),

(3, 1, 'Premium Tool', 'Professional-grade tool with lifetime warranty', 'TL-003', '79.99', 'Tools', 
ARRAY['https://example.com/tool3.jpg', 'https://example.com/tool3b.jpg', 'https://example.com/tool3c.jpg'], 
ARRAY['premium', 'professional', 'warranty'], true),

(4, 1, 'Basic Widget', 'Affordable entry-level widget', 'WDG-004', '19.99', 'Widgets', 
ARRAY['https://example.com/widget4.jpg'], 
ARRAY['budget', 'starter'], true),

(5, 1, 'Advanced Gadget', 'Next generation technology with smart features', 'GDG-005', '99.99', 'Gadgets', 
ARRAY['https://example.com/gadget5.jpg', 'https://example.com/gadget5b.jpg'], 
ARRAY['advanced', 'technology', 'smart'], true),

(6, 1, 'Combo Pack', 'Bundle of our most popular products', 'CP-006', '129.99', 'Bundles', 
ARRAY['https://example.com/combo6.jpg'], 
ARRAY['bundle', 'value', 'savings'], true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample catalogs
INSERT INTO catalogs (id, business_id, name, description, status, template_id, product_ids, settings)
VALUES 
(1, 1, 'Summer 2024 Collection', 'Our latest products for Summer 2024', 'published', 1, 
ARRAY[1, 2, 3, 4, 5], 
'{"pageSize": "A4", "orientation": "portrait", "showHeader": true, "showFooter": true, "showPageNumbers": true}'::jsonb),

(2, 1, 'Premium Products', 'Showcase of our high-end product line', 'published', 2, 
ARRAY[2, 3, 5], 
'{"pageSize": "Letter", "orientation": "landscape", "showHeader": true, "showFooter": true, "showPageNumbers": true}'::jsonb),

(3, 1, 'Complete Product List', 'Comprehensive listing of all active products', 'draft', 3, 
ARRAY[1, 2, 3, 4, 5, 6], 
'{"pageSize": "A4", "orientation": "portrait", "showHeader": true, "showFooter": true, "showPageNumbers": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert sample user
INSERT INTO users (id, name, email, password_hash, business_id, role)
VALUES 
(1, 'Demo User', 'user@demo.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456789', 1, 'admin')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence values to avoid conflicts with manual IDs
SELECT setval('businesses_id_seq', (SELECT MAX(id) FROM businesses));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('templates_id_seq', (SELECT MAX(id) FROM templates));
SELECT setval('catalogs_id_seq', (SELECT MAX(id) FROM catalogs));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));