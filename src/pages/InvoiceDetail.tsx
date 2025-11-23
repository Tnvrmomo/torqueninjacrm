import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Mail, Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { generateInvoicePDF } from "@/lib/pdfGenerator";
import { logInvoiceDeleted, logInvoicePDFDownloaded } from "@/lib/activityLogger";

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("invoices")
        .select("*, clients(name, email, phone, street, city, country), invoice_items(*)")
        .eq("id", id!)
        .single();
      return data;
    },
  });

  const handleDownloadPDF = async () => {
    if (!invoice) return;

    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', invoice.company_id)
      .single();

    const pdf = generateInvoicePDF({
      invoice,
      client: invoice.clients,
      company: company || {},
      items: invoice.invoice_items || [],
    });

    pdf.save(`Invoice_${invoice.invoice_number}.pdf`);
    await logInvoicePDFDownloaded(invoice.id, invoice.invoice_number);
  };

  const deleteInvoiceMutation = useMutation({
    mutationFn: async () => {
      await supabase.from("invoice_items").delete().eq("invoice_id", id!);
      const { error } = await supabase.from("invoices").delete().eq("id", id!);
      if (error) throw error;
    },
    onSuccess: async () => {
      await logInvoiceDeleted(invoice?.invoice_number || 'Unknown');
      toast({ title: "Success", description: "Invoice deleted successfully" });
      navigate("/invoices");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const updates: any = { status: newStatus };
      
      if (newStatus === "sent" && !invoice?.sent_date) {
        updates.sent_date = new Date().toISOString();
      } else if (newStatus === "viewed" && !invoice?.viewed_date) {
        updates.viewed_date = new Date().toISOString();
      } else if (newStatus === "paid") {
        updates.paid_date = new Date().toISOString();
        updates.balance = 0;
        updates.paid_to_date = invoice?.total;
      }

      const { error } = await supabase.from("invoices").update(updates).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      toast({ title: "Success", description: "Invoice status updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount).replace("BDT", "৳");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-status-draft",
      sent: "bg-status-sent",
      viewed: "bg-status-viewed",
      partial: "bg-status-partial",
      paid: "bg-status-paid",
      overdue: "bg-status-overdue",
    };
    return colors[status] || "bg-muted";
  };

  const downloadPDF = async () => {
    if (!invoice || !invoice.clients) return;

    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("id", invoice.company_id)
      .single();

    const { generateInvoicePDF } = await import("@/lib/pdfGenerator");
    const doc = generateInvoicePDF({
      invoice,
      client: invoice.clients,
      company,
      items: invoice.invoice_items || [],
    });

    doc.save(`Invoice-${invoice.invoice_number}.pdf`);
  };

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      if (!invoice?.clients?.email) {
        throw new Error("Client email not found");
      }

      const { error } = await supabase.functions.invoke("send-invoice-email", {
        body: {
          invoiceId: id,
          to: invoice.clients.email,
        },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      toast({ title: "Success", description: "Invoice email sent successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Card className="p-6 animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!invoice) {
    return (
      <MainLayout>
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Invoice not found</h3>
            <Button onClick={() => navigate("/invoices")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/invoices")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{invoice.invoice_number}</h1>
                <Badge className={getStatusColor(invoice.status || "draft")}>
                  {invoice.status?.toUpperCase()}
                </Badge>
              </div>
              <p className="text-muted-foreground">{invoice.clients?.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => sendEmailMutation.mutate()} disabled={sendEmailMutation.isPending || !invoice.clients?.email}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/invoices/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the invoice and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteInvoiceMutation.mutate()}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
            <div className="text-3xl font-bold text-primary">{formatBDT(invoice.total)}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Amount Paid</div>
            <div className="text-3xl font-bold">{formatBDT(invoice.paid_to_date || 0)}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Balance Due</div>
            <div className="text-3xl font-bold text-destructive">{formatBDT(invoice.balance)}</div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Invoice Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issue Date:</span>
                <span className="font-medium">{format(new Date(invoice.issue_date), "dd MMM yyyy")}</span>
              </div>
              {invoice.due_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-medium">{format(new Date(invoice.due_date), "dd MMM yyyy")}</span>
                </div>
              )}
              {invoice.po_number && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PO Number:</span>
                  <span className="font-medium">{invoice.po_number}</span>
                </div>
              )}
              {invoice.sent_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sent Date:</span>
                  <span className="font-medium">{format(new Date(invoice.sent_date), "dd MMM yyyy")}</span>
                </div>
              )}
              {invoice.viewed_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Viewed Date:</span>
                  <span className="font-medium">{format(new Date(invoice.viewed_date), "dd MMM yyyy")}</span>
                </div>
              )}
              {invoice.paid_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid Date:</span>
                  <span className="font-medium">{format(new Date(invoice.paid_date), "dd MMM yyyy")}</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Client Information</h2>
            <div className="space-y-2">
              <div>
                <div className="font-semibold">{invoice.clients?.name}</div>
                {invoice.clients?.email && <div className="text-sm text-muted-foreground">{invoice.clients.email}</div>}
                {invoice.clients?.phone && <div className="text-sm text-muted-foreground">{invoice.clients.phone}</div>}
              </div>
              {invoice.clients?.street && (
                <div className="text-sm text-muted-foreground">
                  {invoice.clients.street}
                  {invoice.clients.city && `, ${invoice.clients.city}`}
                  {invoice.clients.country && `, ${invoice.clients.country}`}
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Line Items</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-4 font-semibold text-sm text-muted-foreground pb-2 border-b">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-right">Quantity</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-2 text-right">Discount</div>
              <div className="col-span-1 text-right">Total</div>
            </div>
            {invoice.invoice_items?.map((item: any) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 py-2 border-b">
                <div className="col-span-5">{item.description}</div>
                <div className="col-span-2 text-right">{item.quantity}</div>
                <div className="col-span-2 text-right">{formatBDT(item.unit_price)}</div>
                <div className="col-span-2 text-right">{formatBDT(item.discount)}</div>
                <div className="col-span-1 text-right font-semibold">{formatBDT(item.line_total)}</div>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-semibold">{formatBDT(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-semibold">-{formatBDT(invoice.discount)}</span>
              </div>
            )}
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT ({invoice.tax_rate_1}%):</span>
                <span className="font-semibold">{formatBDT(invoice.tax_amount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-primary">{formatBDT(invoice.total)}</span>
            </div>
          </div>
        </Card>

        {(invoice.public_notes || invoice.terms_conditions) && (
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Notes & Terms</h2>
            {invoice.public_notes && (
              <div className="mb-4">
                <div className="text-sm font-semibold mb-1">Public Notes</div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.public_notes}</p>
              </div>
            )}
            {invoice.terms_conditions && (
              <div>
                <div className="text-sm font-semibold mb-1">Terms & Conditions</div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.terms_conditions}</p>
              </div>
            )}
          </Card>
        )}

        {invoice.status !== "paid" && (
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Actions</h2>
            <div className="flex gap-2">
              {invoice.status === "draft" && (
                <Button onClick={() => updateStatusMutation.mutate("sent")} disabled={updateStatusMutation.isPending}>
                  <Mail className="mr-2 h-4 w-4" />
                  Mark as Sent
                </Button>
              )}
              {invoice.status === "sent" && (
                <Button onClick={() => updateStatusMutation.mutate("viewed")} disabled={updateStatusMutation.isPending}>
                  <Eye className="mr-2 h-4 w-4" />
                  Mark as Viewed
                </Button>
              )}
              {(invoice.status === "sent" || invoice.status === "viewed" || invoice.status === "partial") && (
                <Button onClick={() => updateStatusMutation.mutate("paid")} disabled={updateStatusMutation.isPending}>
                  Mark as Paid
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default InvoiceDetail;
