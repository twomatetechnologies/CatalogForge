
import { PDFViewer as ReactPDFViewer } from '@react-pdf/renderer';
import { CatalogPDFDocument } from '@/lib/pdfGenerator';
import { Catalog, Product, BusinessProfile } from '@/types';

interface CatalogPDFViewerProps {
  catalog: Catalog;
  products: Product[];
  business: BusinessProfile;
}

export function CatalogPDFViewer({ catalog, products, business }: CatalogPDFViewerProps) {
  return (
    <ReactPDFViewer style={{ width: '100%', height: '80vh' }}>
      <CatalogPDFDocument 
        catalog={catalog}
        products={products}
        business={business}
      />
    </ReactPDFViewer>
  );
}
