import { supabase } from '@/integrations/supabase/client';

interface ActivityLogParams {
  activity: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: any;
}

export const logActivity = async ({
  activity,
  entity_type,
  entity_id,
  metadata,
}: ActivityLogParams) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.company_id) return;

    let ipAddress = 'Unknown';
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ipAddress = data.ip;
    } catch (error) {
      // Silently fail
    }

    await supabase.from('activity_log').insert({
      company_id: profile.company_id,
      user_id: user.id,
      activity,
      entity_type,
      entity_id,
      metadata,
      ip_address: ipAddress,
      activity_date: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

export const logInvoiceCreated = (invoiceId: string, invoiceNumber: string) =>
  logActivity({ activity: `Created invoice ${invoiceNumber}`, entity_type: 'invoice', entity_id: invoiceId });

export const logInvoiceUpdated = (invoiceId: string, invoiceNumber: string) =>
  logActivity({ activity: `Updated invoice ${invoiceNumber}`, entity_type: 'invoice', entity_id: invoiceId });

export const logInvoiceDeleted = (invoiceNumber: string) =>
  logActivity({ activity: `Deleted invoice ${invoiceNumber}`, entity_type: 'invoice' });

export const logInvoiceSent = (invoiceId: string, invoiceNumber: string, recipientEmail: string) =>
  logActivity({ activity: `Sent invoice ${invoiceNumber} to ${recipientEmail}`, entity_type: 'invoice', entity_id: invoiceId, metadata: { recipient_email: recipientEmail } });

export const logInvoicePDFDownloaded = (invoiceId: string, invoiceNumber: string) =>
  logActivity({ activity: `Downloaded PDF for invoice ${invoiceNumber}`, entity_type: 'invoice', entity_id: invoiceId });

export const logQuoteCreated = (quoteId: string, quoteNumber: string) =>
  logActivity({ activity: `Created quote ${quoteNumber}`, entity_type: 'quote', entity_id: quoteId });

export const logQuoteUpdated = (quoteId: string, quoteNumber: string) =>
  logActivity({ activity: `Updated quote ${quoteNumber}`, entity_type: 'quote', entity_id: quoteId });

export const logQuoteDeleted = (quoteNumber: string) =>
  logActivity({ activity: `Deleted quote ${quoteNumber}`, entity_type: 'quote' });

export const logQuotePDFDownloaded = (quoteId: string, quoteNumber: string) =>
  logActivity({ activity: `Downloaded PDF for quote ${quoteNumber}`, entity_type: 'quote', entity_id: quoteId });

export const logClientCreated = (clientId: string, clientName: string) =>
  logActivity({ activity: `Created client ${clientName}`, entity_type: 'client', entity_id: clientId });

export const logClientUpdated = (clientId: string, clientName: string) =>
  logActivity({ activity: `Updated client ${clientName}`, entity_type: 'client', entity_id: clientId });

export const logClientDeleted = (clientName: string) =>
  logActivity({ activity: `Deleted client ${clientName}`, entity_type: 'client' });

export const logProductCreated = (productId: string, productName: string) =>
  logActivity({ activity: `Created product ${productName}`, entity_type: 'product', entity_id: productId });

export const logProductUpdated = (productId: string, productName: string) =>
  logActivity({ activity: `Updated product ${productName}`, entity_type: 'product', entity_id: productId });

export const logProductDeleted = (productName: string) =>
  logActivity({ activity: `Deleted product ${productName}`, entity_type: 'product' });

export const logPaymentCreated = (paymentId: string, paymentNumber: string, amount: number) =>
  logActivity({ activity: `Recorded payment ${paymentNumber} for ৳${amount.toFixed(2)}`, entity_type: 'payment', entity_id: paymentId });

export const logExpenseCreated = (expenseId: string, category: string, amount: number) =>
  logActivity({ activity: `Created ${category} expense for ৳${amount.toFixed(2)}`, entity_type: 'expense', entity_id: expenseId });

export const logDataImported = (entityType: string, count: number) =>
  logActivity({ activity: `Imported ${count} ${entityType}(s) from CSV`, entity_type: entityType, metadata: { count } });

export const logDataExported = (entityType: string, count: number) =>
  logActivity({ activity: `Exported ${count} ${entityType}(s) to CSV`, entity_type: entityType, metadata: { count } });
