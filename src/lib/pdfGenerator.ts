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
  
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  // Header - Company Info (Left side)
  doc.setFontSize(18);
  doc.setTextColor(135, 15, 19); // Torque red
  doc.setFont(undefined, 'bold');
  doc.text(company?.name || 'Torque Stickers', 20, yPosition);
  
  // Company details (Left side)
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.setFont(undefined, 'normal');
  yPosition += 7;
  
  if (company?.phone) {
    doc.text(company.phone, 20, yPosition);
    yPosition += 5;
  }
  if (company?.email) {
    doc.text(company.email, 20, yPosition);
    yPosition += 5;
  }

  // Company address (Right side)
  doc.setFontSize(9);
  let rightY = 20;
  const rightX = pageWidth - 20;
  
  if (company?.address) {
    const addressLines = doc.splitTextToSize(company.address, 70);
    addressLines.forEach((line: string) => {
      doc.text(line, rightX, rightY, { align: 'right' });
      rightY += 5;
    });
  }

  // Invoice issued to section
  yPosition = Math.max(yPosition, rightY) + 10;
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.setFont(undefined, 'bold');
  doc.text('Invoice issued to:', 20, yPosition);
  
  yPosition += 6;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(40, 40, 40);
  doc.text(client?.name || '', 20, yPosition);
  
  yPosition += 5;
  if (client?.email) {
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(client.email, 20, yPosition);
    yPosition += 5;
  }

  // Invoice details box (Right side)
  const boxY = yPosition - 16;
  const boxX = pageWidth - 85;
  const boxWidth = 65;
  const rowHeight = 7;

  // Draw box background
  doc.setFillColor(250, 250, 250);
  doc.rect(boxX, boxY, boxWidth, rowHeight * 6, 'F');
  
  // Draw box border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(boxX, boxY, boxWidth, rowHeight * 6, 'S');

  // Invoice details
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(80, 80, 80);
  
  let detailY = boxY + 5;
  const labelX = boxX + 3;
  const valueX = boxX + boxWidth - 3;
  
  const details = [
    ['Invoice Number', invoice.invoice_number],
    ['PO Number', invoice.po_number || '-'],
    ['Invoice Date', new Date(invoice.issue_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })],
    ['Due Date', invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'],
    ['Total', `৳${parseFloat(invoice.total).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ['Balance', `৳${parseFloat(invoice.balance).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
  ];

  details.forEach(([label, value]) => {
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(label, labelX, detailY);
    
    doc.setFont(undefined, 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(value, valueX, detailY, { align: 'right' });
    
    detailY += rowHeight;
  });

  // Line Items Table
  yPosition += 20;
  const tableData = items.map(item => [
    item.description,
    `৳${parseFloat(item.unit_price).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    item.quantity.toString(),
    `৳${parseFloat(item.line_total).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Description', 'Unit Cost', 'Quantity', 'Line Total']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [80, 80, 80],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [60, 60, 60],
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 40, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
    margin: { left: 20, right: 20 },
  });

  // Totals section
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const totalsX = pageWidth - 20;
  
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  
  let totalsY = finalY;
  
  // Subtotal
  doc.setFont(undefined, 'normal');
  doc.text('Subtotal:', totalsX - 50, totalsY);
  doc.text(`৳${parseFloat(invoice.subtotal).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, totalsX, totalsY, { align: 'right' });
  totalsY += 6;

  // VAT
  if (invoice.tax_amount > 0) {
    const vatRate = invoice.tax_rate_1 || 15;
    doc.text(`VAT (${vatRate}%):`, totalsX - 50, totalsY);
    doc.text(`৳${parseFloat(invoice.tax_amount).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, totalsX, totalsY, { align: 'right' });
    totalsY += 6;
  }

  // Discount
  if (invoice.discount > 0) {
    doc.text('Discount:', totalsX - 50, totalsY);
    doc.text(`-৳${parseFloat(invoice.discount).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, totalsX, totalsY, { align: 'right' });
    totalsY += 6;
  }

  // Draw line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(totalsX - 60, totalsY, totalsX, totalsY);
  totalsY += 6;

  // Total
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(135, 15, 19);
  doc.text('Total:', totalsX - 50, totalsY);
  doc.text(`৳${parseFloat(invoice.total).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, totalsX, totalsY, { align: 'right' });

  // Balance Due (if any)
  if (invoice.balance > 0 && invoice.balance !== invoice.total) {
    totalsY += 8;
    doc.setFontSize(10);
    doc.setTextColor(235, 2, 10);
    doc.text('Balance Due:', totalsX - 50, totalsY);
    doc.text(`৳${parseFloat(invoice.balance).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, totalsX, totalsY, { align: 'right' });
  }

  // Terms & Conditions
  totalsY += 15;
  if (invoice.terms_conditions && totalsY < pageHeight - 40) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('Terms & Conditions:', 20, totalsY);
    totalsY += 5;
    
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    const termsLines = doc.splitTextToSize(invoice.terms_conditions, pageWidth - 40);
    doc.text(termsLines, 20, totalsY);
    totalsY += termsLines.length * 4;
  }

  // Notes
  if (invoice.public_notes && totalsY < pageHeight - 30) {
    totalsY += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('Notes:', 20, totalsY);
    totalsY += 5;
    
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    const notesLines = doc.splitTextToSize(invoice.public_notes, pageWidth - 40);
    doc.text(notesLines, 20, totalsY);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text(`Page 1 of 1`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  return doc;
};

interface QuoteData {
  quote: any;
  client: any;
  company: any;
  items: any[];
}

export const generateQuotePDF = (data: QuoteData) => {
  const { quote, client, company, items } = data;
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  // Header - Company Info (Left side)
  doc.setFontSize(18);
  doc.setTextColor(135, 15, 19);
  doc.setFont(undefined, 'bold');
  doc.text(company?.name || 'Torque Stickers', 20, yPosition);
  
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.setFont(undefined, 'normal');
  yPosition += 7;
  
  if (company?.phone) {
    doc.text(company.phone, 20, yPosition);
    yPosition += 5;
  }
  if (company?.email) {
    doc.text(company.email, 20, yPosition);
    yPosition += 5;
  }

  // Company address (Right side)
  doc.setFontSize(9);
  let rightY = 20;
  const rightX = pageWidth - 20;
  
  if (company?.address) {
    const addressLines = doc.splitTextToSize(company.address, 70);
    addressLines.forEach((line: string) => {
      doc.text(line, rightX, rightY, { align: 'right' });
      rightY += 5;
    });
  }

  // QUOTATION header
  yPosition = Math.max(yPosition, rightY) + 5;
  doc.setFontSize(16);
  doc.setTextColor(135, 15, 19);
  doc.setFont(undefined, 'bold');
  doc.text('QUOTATION', 20, yPosition);

  // Quote issued to section
  yPosition += 10;
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.setFont(undefined, 'bold');
  doc.text('Quote issued to:', 20, yPosition);
  
  yPosition += 6;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(40, 40, 40);
  doc.text(client?.name || '', 20, yPosition);
  
  yPosition += 5;
  if (client?.email) {
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(client.email, 20, yPosition);
    yPosition += 5;
  }

  // Quote details box
  const boxY = yPosition - 16;
  const boxX = pageWidth - 85;
  const boxWidth = 65;
  const rowHeight = 7;

  doc.setFillColor(250, 250, 250);
  doc.rect(boxX, boxY, boxWidth, rowHeight * 5, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(boxX, boxY, boxWidth, rowHeight * 5, 'S');

  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(80, 80, 80);
  
  let detailY = boxY + 5;
  const labelX = boxX + 3;
  const valueX = boxX + boxWidth - 3;
  
  const details = [
    ['Quote Number', quote.quote_number],
    ['Quote Date', new Date(quote.issue_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })],
    ['Valid Until', quote.expiry_date ? new Date(quote.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'],
    ['Status', quote.status?.toUpperCase()],
    ['Total', `৳${parseFloat(quote.total).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
  ];

  details.forEach(([label, value]) => {
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(label, labelX, detailY);
    
    doc.setFont(undefined, 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(value, valueX, detailY, { align: 'right' });
    
    detailY += rowHeight;
  });

  // Line Items Table
  yPosition += 20;
  const tableData = items.map(item => [
    item.description,
    `৳${parseFloat(item.unit_price).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    item.quantity.toString(),
    `৳${parseFloat(item.line_total).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Description', 'Unit Cost', 'Quantity', 'Line Total']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [80, 80, 80],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [60, 60, 60],
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 40, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
    margin: { left: 20, right: 20 },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const totalsX = pageWidth - 20;
  let totalsY = finalY;
  
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.setFont(undefined, 'normal');
  
  doc.text('Subtotal:', totalsX - 50, totalsY);
  doc.text(`৳${parseFloat(quote.subtotal).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, totalsX, totalsY, { align: 'right' });
  totalsY += 6;

  if (quote.tax_amount > 0) {
    doc.text('VAT (15%):', totalsX - 50, totalsY);
    doc.text(`৳${parseFloat(quote.tax_amount).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, totalsX, totalsY, { align: 'right' });
    totalsY += 6;
  }

  if (quote.discount > 0) {
    doc.text('Discount:', totalsX - 50, totalsY);
    doc.text(`-৳${parseFloat(quote.discount).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, totalsX, totalsY, { align: 'right' });
    totalsY += 6;
  }

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(totalsX - 60, totalsY, totalsX, totalsY);
  totalsY += 6;

  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(135, 15, 19);
  doc.text('Total:', totalsX - 50, totalsY);
  doc.text(`৳${parseFloat(quote.total).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, totalsX, totalsY, { align: 'right' });

  // Quote disclaimer
  totalsY += 15;
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  doc.setTextColor(135, 15, 19);
  doc.text('This is a quotation, not an invoice. Prices are valid until the expiry date.', 20, totalsY);

  // Terms & Notes
  if (quote.public_notes) {
    totalsY += 10;
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('Notes:', 20, totalsY);
    totalsY += 5;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    const notesLines = doc.splitTextToSize(quote.public_notes, pageWidth - 40);
    doc.text(notesLines, 20, totalsY);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for your interest!', pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text(`Page 1 of 1`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  return doc;
};
