
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { Catalog, Product, BusinessProfile, Template } from '@/types';

export interface PDFGenerationOptions {
  quality: 'high' | 'medium' | 'low';
  includeProductImages: boolean;
  includeBusinessLogo: boolean;
  includePageNumbers: boolean;
  includeTableOfContents: boolean;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30
  },
  header: {
    marginBottom: 20,
    textAlign: 'center'
  },
  title: {
    fontSize: 24,
    marginBottom: 10
  },
  product: {
    marginBottom: 15,
    padding: 10,
    border: '1px solid #ccc'
  }
});

export const CatalogPDFDocument = ({ catalog, products, business }: {
  catalog: Catalog;
  products: Product[];
  business: BusinessProfile;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{catalog.name}</Text>
        <Text>{business.name}</Text>
      </View>
      {products.map((product, index) => (
        <View key={index} style={styles.product}>
          <Text>{product.name}</Text>
          <Text>${product.price}</Text>
          <Text>{product.description}</Text>
        </View>
      ))}
    </Page>
  </Document>
);

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
