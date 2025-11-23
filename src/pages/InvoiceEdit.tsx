import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { logInvoiceUpdated } from "@/lib/activityLogger";

interface InvoiceItem {
  id?: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  line_total: number;
}

const InvoiceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [isAmountDiscount, setIsAmountDiscount] = useState(false);
  const [taxRate, setTaxRate] = useState(15);
  const [publicNotes, setPublicNotes] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [poNumber, setPoNumber] = useState("");

  const { data: invoice, isLoading: invoiceLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("invoices")
        .select("*, invoice_items(*)")
        .eq("id", id!)
        .single();
      return data;
    },
  });

  useEffect(() => {
    if (invoice) {
      setClientId(invoice.client_id);
      setIssueDate(new Date(invoice.issue_date));
      if (invoice.due_date) setDueDate(new Date(invoice.due_date));
      setItems(invoice.invoice_items || []);
      setDiscount(invoice.discount || 0);
      setIsAmountDiscount(invoice.is_amount_discount || false);
      setTaxRate(invoice.tax_rate_1 || 15);
      setPublicNotes(invoice.public_notes || "");
      setPrivateNotes(invoice.private_notes || "");
      setTerms(invoice.terms_conditions || "");
      setPoNumber(invoice.po_number || "");
    }
  }, [invoice]);

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("*").order("name");
      return data || [];
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("is_active", true);
      return data || [];
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async () => {
      const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
      const discountAmount = isAmountDiscount ? discount : (subtotal * discount) / 100;
      const afterDiscount = subtotal - discountAmount;
      const taxAmount = (afterDiscount * taxRate) / 100;
      const total = afterDiscount + taxAmount;

      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({
          client_id: clientId,
          issue_date: format(issueDate, "yyyy-MM-dd"),
          due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
          subtotal,
          discount: discountAmount,
          is_amount_discount: isAmountDiscount,
          tax_rate_1: taxRate,
          tax_amount: taxAmount,
          total,
          balance: total - (invoice?.paid_to_date || 0),
          public_notes: publicNotes,
          private_notes: privateNotes,
          terms_conditions: terms,
          po_number: poNumber,
        })
        .eq("id", id!);

      if (invoiceError) throw invoiceError;

      await supabase.from("invoice_items").delete().eq("invoice_id", id!);

      const itemsToInsert = items.map((item, index) => ({
        invoice_id: id,
        product_id: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount,
        line_total: item.line_total,
        sort_order: index,
      }));

      const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert);
      if (itemsError) throw itemsError;
    },
    onSuccess: async () => {
      await logInvoiceUpdated(id!, invoice?.invoice_number || 'Unknown');
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: "Success", description: "Invoice updated successfully" });
      navigate(`/invoices/${id}`);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const calculateLineTotal = (quantity: number, unitPrice: number, discount: number) => {
    return quantity * unitPrice - discount;
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === "quantity" || field === "unit_price" || field === "discount") {
      newItems[index].line_total = calculateLineTotal(
        newItems[index].quantity,
        newItems[index].unit_price,
        newItems[index].discount
      );
    }

    if (field === "product_id" && value) {
      const product = products?.find((p) => p.id === value);
      if (product) {
        newItems[index].description = product.name;
        newItems[index].unit_price = product.sale_price;
        newItems[index].line_total = calculateLineTotal(
          newItems[index].quantity,
          product.sale_price,
          newItems[index].discount
        );
      }
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, discount: 0, line_total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
  const discountAmount = isAmountDiscount ? discount : (subtotal * discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * taxRate) / 100;
  const total = afterDiscount + taxAmount;

  const formatBDT = (amount: number) => {
    return `৳${parseFloat(amount.toString()).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (invoiceLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="p-6 animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3"></div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Invoice</h1>
          <p className="text-muted-foreground">Update invoice details</p>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Client & Dates</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="client">Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue />
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
            <div>
              <Label>Issue Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(issueDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={issueDate} onSelect={(date) => date && setIssueDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="po">PO Number</Label>
              <Input id="po" value={poNumber} onChange={(e) => setPoNumber(e.target.value)} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Line Items</h2>
            <Button onClick={addItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Item {index + 1}</Label>
                  {items.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Product</Label>
                    <Select value={item.product_id || ""} onValueChange={(value) => updateItem(index, "product_id", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Description *</Label>
                    <Input value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} />
                  </div>
                  <div>
                    <Label>Quantity *</Label>
                    <Input type="number" min="0" step="0.01" value={item.quantity} onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label>Unit Price *</Label>
                    <Input type="number" min="0" step="0.01" value={item.unit_price} onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label>Discount</Label>
                    <Input type="number" min="0" step="0.01" value={item.discount} onChange={(e) => updateItem(index, "discount", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label>Line Total</Label>
                    <Input value={formatBDT(item.line_total)} disabled />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Tax & Discount</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="discount">Discount</Label>
              <div className="flex gap-2">
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
                <Select value={isAmountDiscount ? "amount" : "percent"} onValueChange={(v) => setIsAmountDiscount(v === "amount")}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">%</SelectItem>
                    <SelectItem value="amount">৳</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="tax">VAT Rate (%)</Label>
              <Input id="tax" type="number" min="0" max="100" step="0.01" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatBDT(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="font-semibold">-{formatBDT(discountAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT ({taxRate}%):</span>
                <span className="font-semibold">{formatBDT(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{formatBDT(total)}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Terms & Notes</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea id="terms" value={terms} onChange={(e) => setTerms(e.target.value)} rows={3} />
            </div>
            <div>
              <Label htmlFor="public">Public Notes</Label>
              <Textarea id="public" value={publicNotes} onChange={(e) => setPublicNotes(e.target.value)} rows={3} />
            </div>
            <div>
              <Label htmlFor="private">Private Notes</Label>
              <Textarea id="private" value={privateNotes} onChange={(e) => setPrivateNotes(e.target.value)} rows={3} />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate(`/invoices/${id}`)}>Cancel</Button>
          <Button onClick={() => updateInvoiceMutation.mutate()} disabled={updateInvoiceMutation.isPending}>
            Update Invoice
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default InvoiceEdit;
