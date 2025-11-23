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
import { logQuoteCreated } from "@/lib/activityLogger";

interface QuoteItem {
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  line_total: number;
}

const QuoteNew = () => {
  const navigate = useNavigate();
  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState<Date>(new Date());
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [items, setItems] = useState<QuoteItem[]>([
    { description: "", quantity: 1, unit_price: 0, discount: 0, line_total: 0 },
  ]);
  const [publicNotes, setPublicNotes] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");

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

  const createQuoteMutation = useMutation({
    mutationFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
      const quoteNumber = `QT-${Date.now()}`;

      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          quote_number: quoteNumber,
          client_id: clientId,
          company_id: profile?.company_id,
          issue_date: format(issueDate, "yyyy-MM-dd"),
          expiry_date: expiryDate ? format(expiryDate, "yyyy-MM-dd") : null,
          subtotal,
          total: subtotal,
          public_notes: publicNotes,
          private_notes: privateNotes,
          status: "draft",
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      const itemsToInsert = items.map((item, index) => ({
        quote_id: quote.id,
        product_id: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount,
        line_total: item.line_total,
        sort_order: index,
      }));

      const { error: itemsError } = await supabase.from("quote_items").insert(itemsToInsert);
      if (itemsError) throw itemsError;

      return { id: quote.id, number: quoteNumber };
    },
    onSuccess: async (data) => {
      await logQuoteCreated(data.id, data.number);
      toast({ title: "Success", description: "Quote created successfully" });
      navigate(`/quotes/${data.id}`);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const calculateLineTotal = (quantity: number, unitPrice: number, discount: number) => {
    return quantity * unitPrice - discount;
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
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

  const formatBDT = (amount: number) => {
    return `৳${parseFloat(amount.toString()).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Quote</h1>
          <p className="text-muted-foreground">Generate a new sales quote</p>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Client & Dates</h2>
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
              <Label>Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !expiryDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={expiryDate} onSelect={setExpiryDate} initialFocus />
                </PopoverContent>
              </Popover>
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
          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatBDT(subtotal)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="public">Public Notes</Label>
              <Textarea id="public" value={publicNotes} onChange={(e) => setPublicNotes(e.target.value)} placeholder="Notes visible to client" rows={3} />
            </div>
            <div>
              <Label htmlFor="private">Private Notes</Label>
              <Textarea id="private" value={privateNotes} onChange={(e) => setPrivateNotes(e.target.value)} placeholder="Internal notes" rows={3} />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate("/quotes")}>Cancel</Button>
          <Button onClick={() => createQuoteMutation.mutate()} disabled={!clientId || items.some(i => !i.description) || createQuoteMutation.isPending}>
            Create Quote
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default QuoteNew;
