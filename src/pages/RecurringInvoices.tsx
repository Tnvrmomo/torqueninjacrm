import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, Edit, Trash2, Play, Pause } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RecurringInvoices = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state for new recurring invoice
  const [formData, setFormData] = useState({
    client_id: "",
    invoice_template_id: "",
    frequency: "monthly",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    auto_send: false,
  });

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

  const { data: recurringInvoices, isLoading } = useQuery({
    queryKey: ["recurring-invoices"],
    queryFn: async () => {
      const { data } = await supabase
        .from("recurring_invoices")
        .select("*, clients(name), invoices:invoice_template_id(invoice_number)")
        .eq("company_id", profile?.company_id)
        .order("created_at", { ascending: false });
      return data;
    },
    enabled: !!profile?.company_id,
  });

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await supabase
        .from("clients")
        .select("id, name")
        .eq("company_id", profile?.company_id)
        .eq("status", "active");
      return data;
    },
    enabled: !!profile?.company_id,
  });

  const { data: invoices } = useQuery({
    queryKey: ["invoices-templates"],
    queryFn: async () => {
      const { data } = await supabase
        .from("invoices")
        .select("id, invoice_number, client_id")
        .eq("company_id", profile?.company_id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data;
    },
    enabled: !!profile?.company_id,
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("recurring_invoices")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-invoices"] });
      toast({ title: "Updated", description: "Recurring invoice status updated" });
    },
  });

  const createRecurring = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Calculate next invoice date based on frequency
      const startDate = new Date(data.start_date);
      
      const { error } = await supabase
        .from("recurring_invoices")
        .insert({
          company_id: profile?.company_id,
          client_id: data.client_id,
          invoice_template_id: data.invoice_template_id || null,
          frequency: data.frequency,
          start_date: data.start_date,
          end_date: data.end_date || null,
          next_invoice_date: data.start_date,
          auto_send: data.auto_send,
          is_active: true,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-invoices"] });
      setIsDialogOpen(false);
      setFormData({
        client_id: "",
        invoice_template_id: "",
        frequency: "monthly",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        auto_send: false,
      });
      toast({ title: "Created", description: "Recurring invoice created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteRecurring = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("recurring_invoices")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-invoices"] });
      setDeleteId(null);
      toast({ title: "Deleted", description: "Recurring invoice deleted" });
    },
  });

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      weekly: "Weekly",
      biweekly: "Bi-Weekly",
      monthly: "Monthly",
      quarterly: "Quarterly",
      yearly: "Yearly",
    };
    return labels[freq] || freq;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recurring Invoices</h1>
            <p className="text-muted-foreground">
              Automate your billing with recurring invoice schedules
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Recurring Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Recurring Invoice</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                  >
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

                <div className="space-y-2">
                  <Label>Invoice Template (Optional)</Label>
                  <Select
                    value={formData.invoice_template_id}
                    onValueChange={(value) => setFormData({ ...formData, invoice_template_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {invoices?.filter(inv => inv.client_id === formData.client_id).map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.invoice_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date (Optional)</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-send Invoices</Label>
                    <p className="text-sm text-muted-foreground">Automatically email invoices when generated</p>
                  </div>
                  <Switch
                    checked={formData.auto_send}
                    onCheckedChange={(checked) => setFormData({ ...formData, auto_send: checked })}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={() => createRecurring.mutate(formData)}
                  disabled={!formData.client_id || createRecurring.isPending}
                >
                  {createRecurring.isPending ? "Creating..." : "Create Recurring Invoice"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Active Recurring Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recurringInvoices?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recurring invoices set up yet</p>
                <p className="text-sm">Create one to automate your billing</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recurringInvoices?.map((recurring) => (
                  <div
                    key={recurring.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-medium">{recurring.clients?.name}</p>
                        <Badge variant={recurring.is_active ? "default" : "secondary"}>
                          {recurring.is_active ? "Active" : "Paused"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{getFrequencyLabel(recurring.frequency)}</span>
                        <span>•</span>
                        <span>Next: {new Date(recurring.next_invoice_date).toLocaleDateString()}</span>
                        {recurring.last_sent_date && (
                          <>
                            <span>•</span>
                            <span>Last sent: {new Date(recurring.last_sent_date).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive.mutate({ id: recurring.id, is_active: !recurring.is_active })}
                      >
                        {recurring.is_active ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(recurring.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <DeleteConfirmDialog
          open={!!deleteId}
          onOpenChange={() => setDeleteId(null)}
          onConfirm={() => deleteId && deleteRecurring.mutate(deleteId)}
          title="Delete Recurring Invoice"
          description="Are you sure you want to delete this recurring invoice? This action cannot be undone."
        />
      </div>
    </MainLayout>
  );
};

export default RecurringInvoices;
