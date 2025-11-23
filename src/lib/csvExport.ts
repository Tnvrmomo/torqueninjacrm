import Papa from 'papaparse';

export const exportToCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const formatInvoicesForExport = (invoices: any[], clients: any[]) => {
  return invoices.map(invoice => {
    const client = clients.find(c => c.id === invoice.client_id);
    return {
      'Invoice Number': invoice.invoice_number,
      'Client Name': client?.name || '',
      'Client Email': client?.email || '',
      'PO Number': invoice.po_number || '',
      'Issue Date': invoice.issue_date,
      'Due Date': invoice.due_date || '',
      'Status': invoice.status,
      'Subtotal': invoice.subtotal,
      'Tax Amount': invoice.tax_amount || 0,
      'Discount': invoice.discount || 0,
      'Total': invoice.total,
      'Balance': invoice.balance,
      'Paid to Date': invoice.paid_to_date || 0,
      'Currency': invoice.currency || 'BDT',
      'Public Notes': invoice.public_notes || '',
      'Private Notes': invoice.private_notes || '',
      'Created At': invoice.created_at,
    };
  });
};

export const formatQuotesForExport = (quotes: any[], clients: any[]) => {
  return quotes.map(quote => {
    const client = clients.find(c => c.id === quote.client_id);
    return {
      'Quote Number': quote.quote_number,
      'Client Name': client?.name || '',
      'Client Email': client?.email || '',
      'Issue Date': quote.issue_date,
      'Expiry Date': quote.expiry_date || '',
      'Status': quote.status,
      'Subtotal': quote.subtotal,
      'Tax Amount': quote.tax_amount || 0,
      'Discount': quote.discount || 0,
      'Total': quote.total,
      'Currency': 'BDT',
      'Public Notes': quote.public_notes || '',
      'Private Notes': quote.private_notes || '',
      'Created At': quote.created_at,
    };
  });
};

export const formatProductsForExport = (products: any[]) => {
  return products.map(product => ({
    'Product Name': product.name,
    'SKU': product.sku || '',
    'Description': product.description || '',
    'Category': product.category || '',
    'Cost Price': product.cost_price || 0,
    'Sale Price': product.sale_price,
    'Stock Quantity': product.stock_quantity || 0,
    'Low Stock Alert': product.low_stock_alert || '',
    'Reorder Point': product.reorder_point || '',
    'Tax Rate 1': product.tax_rate_1 || 0,
    'Tax Rate 2': product.tax_rate_2 || 0,
    'Tax Rate 3': product.tax_rate_3 || 0,
    'Currency': product.currency || 'BDT',
    'Size': product.size || '',
    'Material Type': product.material_type || '',
    'Vehicle Compatibility': product.vehicle_compatibility ? product.vehicle_compatibility.join(', ') : '',
    'Is Active': product.is_active ? 'Yes' : 'No',
    'Notes': product.notes || '',
    'Created At': product.created_at,
  }));
};

export const formatClientsForExport = (clients: any[]) => {
  return clients.map(client => ({
    'Client Number': client.client_number || '',
    'Client Name': client.name,
    'Email': client.email || '',
    'Phone': client.phone || '',
    'Contact First Name': client.contact_first_name || '',
    'Contact Last Name': client.contact_last_name || '',
    'Contact Email': client.contact_email || '',
    'Contact Phone': client.contact_phone || '',
    'Street': client.street || '',
    'Apt/Suite': client.apt_suite || '',
    'City': client.city || '',
    'State/Province': client.state_province || '',
    'Postal Code': client.postal_code || '',
    'Country': client.country || '',
    'VAT Number': client.vat_number || '',
    'Website': client.website || '',
    'Status': client.status || '',
    'Balance': client.balance || 0,
    'Credit Limit': client.credit_limit || 0,
    'Payment Terms': client.payment_terms || '',
    'Currency': client.currency || 'BDT',
    'Industry': client.industry || '',
    'Classification': client.classification || '',
    'Public Notes': client.public_notes || '',
    'Private Notes': client.private_notes || '',
    'Created At': client.created_at,
  }));
};

export const formatPaymentsForExport = (payments: any[], invoices: any[], clients: any[]) => {
  return payments.map(payment => {
    const invoice = invoices.find(i => i.id === payment.invoice_id);
    const client = clients.find(c => c.id === payment.client_id);
    return {
      'Payment Number': payment.payment_number,
      'Client Name': client?.name || '',
      'Invoice Number': invoice?.invoice_number || '',
      'Amount': payment.amount,
      'Payment Date': payment.payment_date,
      'Payment Method': payment.payment_method || '',
      'Transaction ID': payment.transaction_id || '',
      'Reference': payment.reference || '',
      'Status': payment.status,
      'Notes': payment.notes || '',
      'Created At': payment.created_at,
    };
  });
};

export const formatExpensesForExport = (expenses: any[]) => {
  return expenses.map(expense => ({
    'Expense Date': expense.expense_date,
    'Category': expense.category,
    'Vendor': expense.vendor || '',
    'Description': expense.description || '',
    'Amount': expense.amount,
    'Payment Method': expense.payment_method || '',
    'Notes': expense.notes || '',
    'Receipt URL': expense.receipt_url || '',
    'Created At': expense.created_at,
  }));
};
