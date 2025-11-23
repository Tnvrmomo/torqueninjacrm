import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const QuoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: quote, isLoading } = useQuery({
    queryKey: ["quote", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("quotes")
        .select("*, clients(name, email, phone), quote_items(*)")
        .eq("id", id!)
        .single();
      return data;
    },
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: async () => {
      await supabase.from("quote_items").delete().eq("quote_id", id!);
      const { error } = await supabase.from("quotes").delete().eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Quote deleted successfully" });
      navigate("/quotes");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const convertToInvoiceMutation = useMutation({
    mutationFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      const invoiceNumber = `INV-${Date.now()}`;

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          client_id: quote!.client_id,
          company_id: profile?.company_id,
          issue_date: format(new Date(), "yyyy-MM-dd"),
          subtotal: quote!.subtotal,
          total: quote!.total,
          balance: quote!.total,
          public_notes: quote!.public_notes,
          private_notes: quote!.private_notes,
          status: "draft",
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const itemsToInsert = quote!.quote_items?.map((item: any) => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount,
        line_total: item.line_total,
        sort_order: item.sort_order,
      }));

      const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert);
      if (itemsError) throw itemsError;

      return invoice.id;
    },
    onSuccess: (invoiceId) => {
      toast({ title: "Success", description: "Quote converted to invoice" });
      navigate(`/invoices/${invoiceId}`);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const formatBDT = (amount: number) => {
    return `৳${parseFloat(amount.toString()).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

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

  if (!quote) {
    return (
      <MainLayout>
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Quote not found</h3>
            <Button onClick={() => navigate("/quotes")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quotes
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
            <Button variant="ghost" size="icon" onClick={() => navigate("/quotes")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{quote.quote_number}</h1>
                <Badge variant={quote.status === "sent" ? "default" : "secondary"}>
                  {quote.status?.toUpperCase()}
                </Badge>
              </div>
              <p className="text-muted-foreground">{quote.clients?.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => convertToInvoiceMutation.mutate()} disabled={convertToInvoiceMutation.isPending}>
              <FileText className="h-4 w-4 mr-2" />
              Convert to Invoice
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/quotes/${id}/edit`)}>
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
                  <AlertDialogTitle>Delete Quote?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteQuoteMutation.mutate()}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Quote Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Issue Date:</span>
              <span className="font-medium">{format(new Date(quote.issue_date), "dd MMM yyyy")}</span>
            </div>
            {quote.expiry_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expiry Date:</span>
                <span className="font-medium">{format(new Date(quote.expiry_date), "dd MMM yyyy")}</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Line Items</h2>
          <div className="space-y-2">
            {quote.quote_items?.map((item: any) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 py-2 border-b">
                <div className="col-span-5">{item.description}</div>
                <div className="col-span-2 text-right">{item.quantity}</div>
                <div className="col-span-2 text-right">{formatBDT(item.unit_price)}</div>
                <div className="col-span-2 text-right">{formatBDT(item.discount)}</div>
                <div className="col-span-1 text-right font-semibold">{formatBDT(item.line_total)}</div>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">{formatBDT(quote.total)}</span>
            </div>
          </div>
        </Card>

        {(quote.public_notes || quote.private_notes) && (
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Notes</h2>
            {quote.public_notes && (
              <div className="mb-4">
                <div className="text-sm font-semibold mb-1">Public Notes</div>
                <p className="text-sm text-muted-foreground">{quote.public_notes}</p>
              </div>
            )}
            {quote.private_notes && (
              <div>
                <div className="text-sm font-semibold mb-1">Private Notes</div>
                <p className="text-sm text-muted-foreground">{quote.private_notes}</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default QuoteDetail;
