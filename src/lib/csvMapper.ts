// Intelligent CSV column mapping utilities

export interface ColumnMapping {
  source: string;
  destination: string;
  transform?: (value: any) => any;
}

// Common variations for invoice columns
const invoiceColumnVariations: Record<string, string[]> = {
  invoice_number: ['Invoice Invoice Number', 'Invoice Number', 'invoice_number', 'Number', 'invoice no', 'inv no'],
  client_name: ['Client Name', 'Client', 'Customer Name', 'customer', 'client'],
  client_email: ['Client Email', 'Email', 'Customer Email', 'contact_email'],
  po_number: ['PO Number', 'PO No', 'Purchase Order', 'po_number', 'Invoice PO Number'],
  issue_date: ['Invoice Date', 'Date', 'Issue Date', 'invoice_date', 'issue_date', 'Invoice Invoice Date'],
  due_date: ['Due Date', 'Payment Due', 'due_date', 'Invoice Due Date'],
  status: ['Status', 'Invoice Status', 'status'],
  subtotal: ['Subtotal', 'Sub Total', 'subtotal', 'Invoice Subtotal'],
  tax_amount: ['Tax Amount', 'Tax', 'VAT', 'tax_amount', 'Invoice Tax Amount'],
  discount: ['Discount', 'discount', 'Invoice Discount'],
  total: ['Total', 'Amount', 'Invoice Amount', 'total', 'Invoice Total'],
  balance: ['Balance', 'Balance Due', 'balance', 'Invoice Balance'],
  paid_to_date: ['Paid to Date', 'Paid', 'paid_to_date', 'Invoice Paid to Date'],
  public_notes: ['Public Notes', 'Notes', 'public_notes', 'Invoice Public Notes'],
  private_notes: ['Private Notes', 'Internal Notes', 'private_notes', 'Invoice Private Notes'],
};

// Product column variations
const productColumnVariations: Record<string, string[]> = {
  name: ['Product', 'Product Name', 'Name', 'name', 'Item'],
  sku: ['SKU', 'sku', 'Product Code', 'Code'],
  description: ['Description', 'description', 'Product Description'],
  category: ['Category', 'category', 'Product Category'],
  cost_price: ['Cost', 'Cost Price', 'cost_price', 'Unit Cost'],
  sale_price: ['Price', 'Sale Price', 'sale_price', 'Unit Price', 'Selling Price'],
  stock_quantity: ['Stock Quantity', 'Quantity', 'stock_quantity', 'Qty', 'Stock'],
  low_stock_alert: ['Low Stock Alert', 'low_stock_alert', 'Min Stock'],
  reorder_point: ['Reorder Point', 'reorder_point', 'Reorder Level'],
  tax_rate_1: ['Tax Rate 1', 'tax_rate_1', 'Tax Rate', 'VAT Rate'],
  tax_rate_2: ['Tax Rate 2', 'tax_rate_2'],
  tax_rate_3: ['Tax Rate 3', 'tax_rate_3'],
  notes: ['Notes', 'notes', 'Product Notes'],
  size: ['Size', 'size', 'Product Size'],
  material_type: ['Material Type', 'material_type', 'Material'],
  vehicle_compatibility: ['Vehicle Compatibility', 'vehicle_compatibility', 'Compatible Vehicles'],
  is_active: ['Active', 'Is Active', 'is_active', 'Status'],
};

// Quote column variations
const quoteColumnVariations: Record<string, string[]> = {
  quote_number: ['Quote Number', 'quote_number', 'Number', 'Quote No'],
  client_name: ['Client Name', 'Client', 'Customer Name', 'customer'],
  client_email: ['Client Email', 'Email', 'Customer Email'],
  issue_date: ['Quote Date', 'Date', 'Issue Date', 'quote_date', 'issue_date'],
  expiry_date: ['Expiry Date', 'Valid Until', 'expiry_date', 'Expiration Date'],
  status: ['Status', 'Quote Status', 'status'],
  subtotal: ['Subtotal', 'Sub Total', 'subtotal'],
  tax_amount: ['Tax Amount', 'Tax', 'VAT', 'tax_amount'],
  discount: ['Discount', 'discount'],
  total: ['Total', 'Amount', 'Quote Amount', 'total'],
  public_notes: ['Public Notes', 'Notes', 'public_notes'],
  private_notes: ['Private Notes', 'Internal Notes', 'private_notes'],
};

// Client column variations
const clientColumnVariations: Record<string, string[]> = {
  name: ['Client Name', 'Name', 'name', 'Company Name'],
  client_number: ['Client Number', 'client_number', 'Customer Number'],
  email: ['Email', 'email', 'Contact Email'],
  phone: ['Phone', 'phone', 'Contact Phone', 'Telephone'],
  contact_first_name: ['Contact First Name', 'First Name', 'contact_first_name'],
  contact_last_name: ['Contact Last Name', 'Last Name', 'contact_last_name'],
  street: ['Street', 'street', 'Address', 'Address Line 1'],
  city: ['City', 'city'],
  state_province: ['State/Province', 'State', 'Province', 'state_province'],
  postal_code: ['Postal Code', 'ZIP', 'Post Code', 'postal_code'],
  country: ['Country', 'country'],
  vat_number: ['VAT Number', 'vat_number', 'Tax ID'],
  website: ['Website', 'website', 'Web'],
  status: ['Status', 'status'],
};

export const findColumnMapping = (
  sourceColumns: string[],
  entityType: 'invoice' | 'product' | 'quote' | 'client'
): ColumnMapping[] => {
  const variations = 
    entityType === 'invoice' ? invoiceColumnVariations :
    entityType === 'product' ? productColumnVariations :
    entityType === 'quote' ? quoteColumnVariations :
    clientColumnVariations;

  const mappings: ColumnMapping[] = [];

  Object.entries(variations).forEach(([destination, possibleSources]) => {
    const match = sourceColumns.find(col => 
      possibleSources.some(possible => 
        col.toLowerCase().trim() === possible.toLowerCase().trim()
      )
    );

    if (match) {
      mappings.push({
        source: match,
        destination,
        transform: getTransformFunction(destination),
      });
    }
  });

  return mappings;
};

const getTransformFunction = (field: string): ((value: any) => any) | undefined => {
  // Number fields
  if (['subtotal', 'tax_amount', 'discount', 'total', 'balance', 'paid_to_date', 
       'cost_price', 'sale_price', 'stock_quantity', 'tax_rate_1', 'tax_rate_2', 
       'tax_rate_3', 'credit_limit', 'amount'].includes(field)) {
    return (value) => {
      if (value === null || value === undefined || value === '') return 0;
      const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
      return isNaN(num) ? 0 : num;
    };
  }

  // Date fields
  if (['issue_date', 'due_date', 'expiry_date', 'payment_date', 'expense_date'].includes(field)) {
    return (value) => {
      if (!value) return null;
      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return null;
        return date.toISOString().split('T')[0];
      } catch {
        return null;
      }
    };
  }

  // Boolean fields
  if (['is_active'].includes(field)) {
    return (value) => {
      if (typeof value === 'boolean') return value;
      const str = String(value).toLowerCase().trim();
      return ['true', 'yes', '1', 'active'].includes(str);
    };
  }

  // Array fields
  if (['vehicle_compatibility'].includes(field)) {
    return (value) => {
      if (Array.isArray(value)) return value;
      if (!value) return null;
      return String(value).split(',').map(v => v.trim()).filter(Boolean);
    };
  }

  // Default: trim strings
  return (value) => {
    if (value === null || value === undefined) return null;
    return String(value).trim();
  };
};

export const applyColumnMapping = (
  row: Record<string, any>,
  mappings: ColumnMapping[]
): Record<string, any> => {
  const mapped: Record<string, any> = {};

  mappings.forEach(({ source, destination, transform }) => {
    const value = row[source];
    mapped[destination] = transform ? transform(value) : value;
  });

  return mapped;
};

export const validateMappedRow = (
  row: Record<string, any>,
  entityType: 'invoice' | 'product' | 'quote' | 'client'
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (entityType === 'invoice') {
    if (!row.invoice_number) errors.push('Invoice number is required');
    if (!row.issue_date) errors.push('Issue date is required');
    if (row.total === undefined || row.total === null) errors.push('Total is required');
  } else if (entityType === 'product') {
    if (!row.name) errors.push('Product name is required');
    if (row.sale_price === undefined || row.sale_price === null) errors.push('Sale price is required');
  } else if (entityType === 'quote') {
    if (!row.quote_number) errors.push('Quote number is required');
    if (!row.issue_date) errors.push('Issue date is required');
  } else if (entityType === 'client') {
    if (!row.name) errors.push('Client name is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
