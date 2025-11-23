import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceData {
  invoice: any;
  client: any;
  company: any;
  items: any[];
}

export const generateInvoicePDF = (data: InvoiceData) => {
  const { invoice, client, company, items } = data;
  const doc = new jsPDF();

  // Header - Company Info
  doc.setFontSize(20);
  doc.setTextColor(135, 15, 19); // Torque red
  doc.text(company?.name || 'Company Name', 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(company?.address || '', 20, 28);
  doc.text(`Email: ${company?.email || ''}`, 20, 33);
  doc.text(`Phone: ${company?.phone || ''}`, 20, 38);
  if (company?.vat_number) {
    doc.text(`VAT: ${company.vat_number}`, 20, 43);
  }

  // Invoice Title
  doc.setFontSize(24);
  doc.setTextColor(135, 15, 19);
  doc.text('INVOICE', 150, 20);

  // Invoice Details
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Invoice #: ${invoice.invoice_number}`, 150, 28);
  doc.text(`Date: ${new Date(invoice.issue_date).toLocaleDateString()}`, 150, 33);
  if (invoice.due_date) {
    doc.text(`Due: ${new Date(invoice.due_date).toLocaleDateString()}`, 150, 38);
  }
  doc.text(`Status: ${invoice.status?.toUpperCase()}`, 150, 43);

  // Bill To
  doc.setFontSize(12);
  doc.setTextColor(135, 15, 19);
  doc.text('Bill To:', 20, 55);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(client?.name || '', 20, 62);
  if (client?.street) doc.text(client.street, 20, 67);
  if (client?.city) doc.text(`${client.city}, ${client.state_province || ''} ${client.postal_code || ''}`, 20, 72);
  if (client?.email) doc.text(`Email: ${client.email}`, 20, 77);
  if (client?.phone) doc.text(`Phone: ${client.phone}`, 20, 82);

  // Line Items Table
  const tableData = items.map(item => [
    item.description,
    item.quantity.toString(),
    `৳${parseFloat(item.unit_price).toFixed(2)}`,
    item.discount ? `${item.discount}%` : '-',
    `৳${parseFloat(item.line_total).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 90,
    head: [['Description', 'Qty', 'Unit Price', 'Discount', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [135, 15, 19],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 35, halign: 'right' }
    }
  });

  // Financial Summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const rightAlign = 150;

  doc.setFontSize(10);
  doc.text('Subtotal:', rightAlign, finalY);
  doc.text(`৳${parseFloat(invoice.subtotal).toFixed(2)}`, 185, finalY, { align: 'right' });

  if (invoice.discount > 0) {
    doc.text('Discount:', rightAlign, finalY + 5);
    doc.text(`-৳${parseFloat(invoice.discount).toFixed(2)}`, 185, finalY + 5, { align: 'right' });
  }

  if (invoice.tax_amount > 0) {
    doc.text('VAT:', rightAlign, finalY + 10);
    doc.text(`৳${parseFloat(invoice.tax_amount).toFixed(2)}`, 185, finalY + 10, { align: 'right' });
  }

  // Total
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(135, 15, 19);
  const totalY = invoice.discount > 0 || invoice.tax_amount > 0 ? finalY + 20 : finalY + 10;
  doc.text('TOTAL:', rightAlign, totalY);
  doc.text(`৳${parseFloat(invoice.total).toFixed(2)}`, 185, totalY, { align: 'right' });

  // Balance Due
  if (invoice.balance > 0) {
    doc.setFontSize(11);
    doc.setTextColor(235, 2, 10); // Bright red for balance
    doc.text('Balance Due:', rightAlign, totalY + 7);
    doc.text(`৳${parseFloat(invoice.balance).toFixed(2)}`, 185, totalY + 7, { align: 'right' });
  }

  // Notes
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  if (invoice.public_notes) {
    doc.text('Notes:', 20, totalY + 15);
    const splitNotes = doc.splitTextToSize(invoice.public_notes, 170);
    doc.text(splitNotes, 20, totalY + 20);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });

  return doc;
};
