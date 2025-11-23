import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText } from "lucide-react";
import { format } from "date-fns";

const PaymentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: payment, isLoading } = useQuery({
    queryKey: ["payment", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("payments")
        .select("*, clients(name, email), invoices(invoice_number)")
        .eq("id", id!)
        .single();
      return data;
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

  if (!payment) {
    return (
      <MainLayout>
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Payment not found</h3>
            <Button onClick={() => navigate("/payments")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Payments
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
            <Button variant="ghost" size="icon" onClick={() => navigate("/payments")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{payment.payment_number}</h1>
                <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                  {payment.status?.toUpperCase()}
                </Badge>
              </div>
              <p className="text-muted-foreground">{payment.clients?.name}</p>
            </div>
          </div>
          {payment.invoice_id && (
            <Button onClick={() => navigate(`/invoices/${payment.invoice_id}`)}>
              <FileText className="h-4 w-4 mr-2" />
              View Invoice
            </Button>
          )}
        </div>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">Amount Paid</div>
          <div className="text-3xl font-bold text-primary">{formatBDT(payment.amount)}</div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Payment Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Date:</span>
              <span className="font-medium">{format(new Date(payment.payment_date), "dd MMM yyyy")}</span>
            </div>
            {payment.payment_method && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium capitalize">{payment.payment_method.replace("_", " ")}</span>
              </div>
            )}
            {payment.transaction_id && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-medium">{payment.transaction_id}</span>
              </div>
            )}
            {payment.reference && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference:</span>
                <span className="font-medium">{payment.reference}</span>
              </div>
            )}
            {payment.invoices && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice:</span>
                <span className="font-medium">{payment.invoices.invoice_number}</span>
              </div>
            )}
          </div>
        </Card>

        {payment.refund_amount && payment.refund_amount > 0 && (
          <Card className="p-6 border-destructive">
            <h2 className="font-semibold text-lg mb-4 text-destructive">Refund Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Refund Amount:</span>
                <span className="font-medium text-destructive">{formatBDT(payment.refund_amount)}</span>
              </div>
              {payment.refund_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Refund Date:</span>
                  <span className="font-medium">{format(new Date(payment.refund_date), "dd MMM yyyy")}</span>
                </div>
              )}
              {payment.refund_reason && (
                <div>
                  <div className="text-sm font-semibold mb-1">Refund Reason:</div>
                  <p className="text-sm text-muted-foreground">{payment.refund_reason}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {payment.notes && (
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Notes</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{payment.notes}</p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default PaymentDetail;
