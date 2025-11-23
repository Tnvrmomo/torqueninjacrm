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
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface InvoiceItem {
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  line_total: number;
}

const InvoiceNew = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0, discount: 0, line_total: 0 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [isAmountDiscount, setIsAmountDiscount] = useState(false);
  const [taxRate, setTaxRate] = useState(15);
  const [publicNotes, setPublicNotes] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [poNumber, setPoNumber] = useState("");

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

  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
      const discountAmount = isAmountDiscount ? discount : (subtotal * discount) / 100;
      const afterDiscount = subtotal - discountAmount;
      const taxAmount = (afterDiscount * taxRate) / 100;
      const total = afterDiscount + taxAmount;

      const invoiceNumber = `INV-${Date.now()}`;

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          client_id: clientId,
          issue_date: format(issueDate, "yyyy-MM-dd"),
          due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
          subtotal,
          discount: discountAmount,
          is_amount_discount: isAmountDiscount,
          tax_rate_1: taxRate,
          tax_amount: taxAmount,
          total,
          balance: total,
          public_notes: publicNotes,
          private_notes: privateNotes,
          terms_conditions: terms,
          po_number: poNumber,
          status: "draft",
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const itemsToInsert = items.map((item, index) => ({
        invoice_id: invoice.id,
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

      return invoice.id;
    },
    onSuccess: (invoiceId) => {
      toast({ title: "Success", description: "Invoice created successfully" });
      navigate(`/invoices/${invoiceId}`);
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
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount).replace("BDT", "৳");
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Step 1: Client & Dates</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Client *</Label>
                <Select value={clientId} onValueChange={setClientId}>
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
              <div>
                <Label>Issue Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !issueDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {issueDate ? format(issueDate, "PPP") : <span>Pick a date</span>}
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
                <Input id="po" value={poNumber} onChange={(e) => setPoNumber(e.target.value)} placeholder="Optional" />
              </div>
            </div>
          </Card>
        );

      case 2:
        return (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Step 2: Line Items</h2>
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
                      <Input value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} placeholder="Item description" />
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
        );

      case 3:
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Step 3: Tax & Discount</h2>
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
                    placeholder="0"
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
        );

      case 4:
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Step 4: Terms & Notes</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea id="terms" value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="Payment terms, warranties, etc." rows={3} />
              </div>
              <div>
                <Label htmlFor="public">Public Notes</Label>
                <Textarea id="public" value={publicNotes} onChange={(e) => setPublicNotes(e.target.value)} placeholder="Notes visible to client" rows={3} />
              </div>
              <div>
                <Label htmlFor="private">Private Notes</Label>
                <Textarea id="private" value={privateNotes} onChange={(e) => setPrivateNotes(e.target.value)} placeholder="Internal notes (not visible to client)" rows={3} />
              </div>
            </div>
          </Card>
        );

      case 5:
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Step 5: Review Invoice</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Client</h3>
                <p>{clients?.find((c) => c.id === clientId)?.name}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Dates</h3>
                <p>Issue: {format(issueDate, "PPP")}</p>
                {dueDate && <p>Due: {format(dueDate, "PPP")}</p>}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Items ({items.length})</h3>
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between py-1">
                    <span>
                      {item.description} × {item.quantity}
                    </span>
                    <span>{formatBDT(item.line_total)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between py-1">
                  <span>Subtotal:</span>
                  <span>{formatBDT(subtotal)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Discount:</span>
                  <span>-{formatBDT(discountAmount)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>VAT ({taxRate}%):</span>
                  <span>{formatBDT(taxAmount)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-lg border-t">
                  <span>Total:</span>
                  <span>{formatBDT(total)}</span>
                </div>
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return clientId && issueDate;
      case 2:
        return items.every((item) => item.description && item.quantity > 0 && item.unit_price >= 0);
      default:
        return true;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
            <p className="text-muted-foreground">Step {step} of 5</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={cn(
                "h-2 flex-1 rounded-full",
                s <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {renderStep()}

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => step > 1 ? setStep(step - 1) : navigate("/invoices")} disabled={createInvoiceMutation.isPending}>
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          {step < 5 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Next
            </Button>
          ) : (
            <Button onClick={() => createInvoiceMutation.mutate()} disabled={createInvoiceMutation.isPending}>
              {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default InvoiceNew;
