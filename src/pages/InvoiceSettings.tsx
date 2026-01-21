import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, FileText, CreditCard, Save, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface InvoiceTemplate {
  id: string;
  company_id: string;
  name: string;
  is_default: boolean;
  template_type: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  logo_position: string;
  show_payment_instructions: boolean;
  show_bank_details: boolean;
  show_qr_code: boolean;
  header_text: string | null;
  footer_text: string | null;
  terms_text: string | null;
  payment_instructions: string | null;
  bank_details: Record<string, string>;
}

const defaultTemplate: Partial<InvoiceTemplate> = {
  name: "Default Template",
  is_default: true,
  template_type: "modern",
  primary_color: "#871113",
  secondary_color: "#374151",
  accent_color: "#f59e0b",
  logo_position: "left",
  show_payment_instructions: true,
  show_bank_details: true,
  show_qr_code: false,
  header_text: "",
  footer_text: "Thank you for your business!",
  terms_text: "Payment is due within 30 days of invoice date.",
  payment_instructions: "Please make payment via bank transfer or mobile banking.",
  bank_details: {
    bank_name: "",
    account_name: "",
    account_number: "",
    branch: "",
    bkash: "",
    nagad: "",
  },
};

const InvoiceSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [template, setTemplate] = useState<Partial<InvoiceTemplate>>(defaultTemplate);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", user?.id)
        .single();
      return data;
    },
  });

  const { data: existingTemplate, isLoading } = useQuery({
    queryKey: ["invoice-template", profile?.company_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("invoice_templates")
        .select("*")
        .eq("company_id", profile?.company_id)
        .eq("is_default", true)
        .maybeSingle();
      return data as InvoiceTemplate | null;
    },
    enabled: !!profile?.company_id,
  });

  useEffect(() => {
    if (existingTemplate) {
      setTemplate({
        ...existingTemplate,
        bank_details: typeof existingTemplate.bank_details === 'object' 
          ? existingTemplate.bank_details as Record<string, string>
          : defaultTemplate.bank_details,
      });
    }
  }, [existingTemplate]);

  const saveTemplate = useMutation({
    mutationFn: async (data: Partial<InvoiceTemplate>) => {
      if (existingTemplate?.id) {
        const { error } = await supabase
          .from("invoice_templates")
          .update({
            name: data.name,
            is_default: data.is_default,
            template_type: data.template_type,
            primary_color: data.primary_color,
            secondary_color: data.secondary_color,
            accent_color: data.accent_color,
            logo_position: data.logo_position,
            show_payment_instructions: data.show_payment_instructions,
            show_bank_details: data.show_bank_details,
            show_qr_code: data.show_qr_code,
            header_text: data.header_text,
            footer_text: data.footer_text,
            terms_text: data.terms_text,
            payment_instructions: data.payment_instructions,
            bank_details: data.bank_details,
          })
          .eq("id", existingTemplate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("invoice_templates")
          .insert({
            company_id: profile?.company_id,
            name: data.name || "Default Template",
            is_default: data.is_default ?? true,
            template_type: data.template_type,
            primary_color: data.primary_color,
            secondary_color: data.secondary_color,
            accent_color: data.accent_color,
            logo_position: data.logo_position,
            show_payment_instructions: data.show_payment_instructions,
            show_bank_details: data.show_bank_details,
            show_qr_code: data.show_qr_code,
            header_text: data.header_text,
            footer_text: data.footer_text,
            terms_text: data.terms_text,
            payment_instructions: data.payment_instructions,
            bank_details: data.bank_details,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice-template"] });
      toast({
        title: "Success",
        description: "Invoice template saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveTemplate.mutate(template);
  };

  const handleReset = () => {
    setTemplate(defaultTemplate);
  };

  const updateBankDetail = (key: string, value: string) => {
    setTemplate((prev) => ({
      ...prev,
      bank_details: {
        ...prev.bank_details,
        [key]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoice Settings</h1>
            <p className="text-muted-foreground">
              Customize your invoice template and payment details
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saveTemplate.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {saveTemplate.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="design">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="design">
              <Palette className="mr-2 h-4 w-4" />
              Design
            </TabsTrigger>
            <TabsTrigger value="content">
              <FileText className="mr-2 h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="mr-2 h-4 w-4" />
              Payment Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="design" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Template Style</CardTitle>
                <CardDescription>Choose a template style and customize colors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template Type</Label>
                    <Select
                      value={template.template_type}
                      onValueChange={(value) => setTemplate({ ...template, template_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Logo Position</Label>
                    <Select
                      value={template.logo_position}
                      onValueChange={(value) => setTemplate({ ...template, logo_position: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={template.primary_color}
                        onChange={(e) => setTemplate({ ...template, primary_color: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={template.primary_color}
                        onChange={(e) => setTemplate({ ...template, primary_color: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={template.secondary_color}
                        onChange={(e) => setTemplate({ ...template, secondary_color: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={template.secondary_color}
                        onChange={(e) => setTemplate({ ...template, secondary_color: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={template.accent_color}
                        onChange={(e) => setTemplate({ ...template, accent_color: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={template.accent_color}
                        onChange={(e) => setTemplate({ ...template, accent_color: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Payment Instructions</Label>
                      <p className="text-sm text-muted-foreground">Display payment instructions on invoices</p>
                    </div>
                    <Switch
                      checked={template.show_payment_instructions}
                      onCheckedChange={(checked) => setTemplate({ ...template, show_payment_instructions: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Bank Details</Label>
                      <p className="text-sm text-muted-foreground">Display bank account details on invoices</p>
                    </div>
                    <Switch
                      checked={template.show_bank_details}
                      onCheckedChange={(checked) => setTemplate({ ...template, show_bank_details: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show QR Code</Label>
                      <p className="text-sm text-muted-foreground">Display payment QR code on invoices</p>
                    </div>
                    <Switch
                      checked={template.show_qr_code}
                      onCheckedChange={(checked) => setTemplate({ ...template, show_qr_code: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Content</CardTitle>
                <CardDescription>Customize the text content on your invoices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Header Text (Optional)</Label>
                  <Textarea
                    value={template.header_text || ""}
                    onChange={(e) => setTemplate({ ...template, header_text: e.target.value })}
                    placeholder="Custom header message..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Terms & Conditions</Label>
                  <Textarea
                    value={template.terms_text || ""}
                    onChange={(e) => setTemplate({ ...template, terms_text: e.target.value })}
                    placeholder="Payment terms and conditions..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Instructions</Label>
                  <Textarea
                    value={template.payment_instructions || ""}
                    onChange={(e) => setTemplate({ ...template, payment_instructions: e.target.value })}
                    placeholder="Instructions for making payment..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Footer Text</Label>
                  <Textarea
                    value={template.footer_text || ""}
                    onChange={(e) => setTemplate({ ...template, footer_text: e.target.value })}
                    placeholder="Thank you message or footer note..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bank Details</CardTitle>
                <CardDescription>Enter your bank account details for invoices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      value={template.bank_details?.bank_name || ""}
                      onChange={(e) => updateBankDetail("bank_name", e.target.value)}
                      placeholder="e.g., Dutch Bangla Bank"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <Input
                      value={template.bank_details?.account_name || ""}
                      onChange={(e) => updateBankDetail("account_name", e.target.value)}
                      placeholder="Account holder name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input
                      value={template.bank_details?.account_number || ""}
                      onChange={(e) => updateBankDetail("account_number", e.target.value)}
                      placeholder="Bank account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Branch</Label>
                    <Input
                      value={template.bank_details?.branch || ""}
                      onChange={(e) => updateBankDetail("branch", e.target.value)}
                      placeholder="Branch name"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mobile Banking</CardTitle>
                <CardDescription>Enter your mobile banking numbers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>bKash Number</Label>
                    <Input
                      value={template.bank_details?.bkash || ""}
                      onChange={(e) => updateBankDetail("bkash", e.target.value)}
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nagad Number</Label>
                    <Input
                      value={template.bank_details?.nagad || ""}
                      onChange={(e) => updateBankDetail("nagad", e.target.value)}
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default InvoiceSettings;
