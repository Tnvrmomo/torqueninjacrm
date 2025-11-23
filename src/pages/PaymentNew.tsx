import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const PaymentNew = () => {
  const navigate = useNavigate();
  const [clientId, setClientId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("*").order("name");
      return data || [];
    },
  });

  const { data: invoices } = useQuery({
    queryKey: ["invoices", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data } = await supabase
        .from("invoices")
        .select("*")
        .eq("client_id", clientId)
        .gt("balance", 0)
        .order("issue_date", { ascending: false });
      return data || [];
    },
    enabled: !!clientId,
  });

  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const paymentNumber = `PAY-${Date.now()}`;
      const paymentAmount = parseFloat(amount);

      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          payment_number: paymentNumber,
          client_id: clientId || null,
          invoice_id: invoiceId || null,
          amount: paymentAmount,
          payment_date: format(paymentDate, "yyyy-MM-dd"),
          payment_method: paymentMethod || null,
          reference: reference || null,
          notes: notes || null,
          status: "completed",
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      if (invoiceId) {
        const { data: invoice } = await supabase
          .from("invoices")
          .select("balance, paid_to_date, total, status")
          .eq("id", invoiceId)
          .single();

        if (invoice) {
          const newPaidToDate = (invoice.paid_to_date || 0) + paymentAmount;
          const newBalance = invoice.total - newPaidToDate;
          const newStatus = newBalance <= 0 ? "paid" : newBalance < invoice.total ? "partial" : invoice.status;

          await supabase
            .from("invoices")
            .update({
              paid_to_date: newPaidToDate,
              balance: newBalance,
              status: newStatus,
            })
            .eq("id", invoiceId);
        }
      }

      return payment.id;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Payment recorded successfully" });
      navigate("/payments");
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

  const selectedInvoice = invoices?.find((inv) => inv.id === invoiceId);

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/payments")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Record Payment</h1>
            <p className="text-muted-foreground">Add a new payment record</p>
          </div>
        </div>

        <Card className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createPaymentMutation.mutate();
            }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="client">Client *</Label>
              <Select value={clientId} onValueChange={(value) => { setClientId(value); setInvoiceId(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {clientId && invoices && invoices.length > 0 && (
              <div>
                <Label htmlFor="invoice">Invoice (Optional)</Label>
                <Select value={invoiceId} onValueChange={setInvoiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select invoice or leave blank for general payment" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.invoice_number} - Balance: {formatBDT(invoice.balance)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedInvoice && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Outstanding balance: {formatBDT(selectedInvoice.balance)}
                  </p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label>Payment Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !paymentDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {paymentDate ? format(paymentDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={paymentDate} onSelect={(date) => date && setPaymentDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="bKash">bKash</SelectItem>
                  <SelectItem value="Nagad">Nagad</SelectItem>
                  <SelectItem value="Rocket">Rocket</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reference">Reference/Transaction ID</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Transaction ID, cheque number, etc."
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this payment"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/payments")} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={createPaymentMutation.isPending} className="flex-1">
                {createPaymentMutation.isPending ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PaymentNew;
