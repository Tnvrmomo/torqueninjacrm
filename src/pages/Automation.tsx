import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Bell, Calendar, Package } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Automation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recurringInvoices } = useQuery({
    queryKey: ["recurring-invoices"],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { data } = await supabase
        .from("recurring_invoices")
        .select("*, clients(name)")
        .eq("company_id", profile?.company_id)
        .order("created_at", { ascending: false });

      return data;
    },
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("company_id", profile?.company_id)
        .order("created_at", { ascending: false })
        .limit(50);

      return data;
    },
  });

  const toggleRecurring = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("recurring_invoices")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-invoices"] });
      toast({
        title: "Success",
        description: "Recurring invoice updated",
      });
    },
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automation</h1>
          <p className="text-muted-foreground">
            Manage recurring invoices, reminders, and automated workflows
          </p>
        </div>

        <Tabs defaultValue="recurring">
          <TabsList>
            <TabsTrigger value="recurring">
              <Calendar className="mr-2 h-4 w-4" />
              Recurring Invoices
            </TabsTrigger>
            <TabsTrigger value="reminders">
              <Bell className="mr-2 h-4 w-4" />
              Reminders
            </TabsTrigger>
            <TabsTrigger value="stock">
              <Package className="mr-2 h-4 w-4" />
              Stock Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recurring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recurring Invoices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recurringInvoices?.map((recurring) => (
                  <div
                    key={recurring.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{recurring.clients?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {recurring.frequency} • Next: {new Date(recurring.next_invoice_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={recurring.is_active ? "default" : "secondary"}>
                        {recurring.is_active ? "Active" : "Paused"}
                      </Badge>
                      <Switch
                        checked={recurring.is_active}
                        onCheckedChange={(checked) =>
                          toggleRecurring.mutate({ id: recurring.id, is_active: checked })
                        }
                      />
                    </div>
                  </div>
                ))}
                {!recurringInvoices?.length && (
                  <p className="text-center text-muted-foreground py-8">
                    No recurring invoices set up yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications
                    ?.filter((n) => n.type === "payment_reminder")
                    .map((notif) => (
                      <div
                        key={notif.id}
                        className="p-4 border rounded-lg flex justify-between items-start"
                      >
                        <div>
                          <p className="font-medium">{notif.title}</p>
                          <p className="text-sm text-muted-foreground">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notif.sent_at).toLocaleString()}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <Badge variant="default">New</Badge>
                        )}
                      </div>
                    ))}
                  {!notifications?.filter((n) => n.type === "payment_reminder").length && (
                    <p className="text-center text-muted-foreground py-8">
                      No payment reminders
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications
                    ?.filter((n) => n.type === "low_stock")
                    .map((notif) => (
                      <div
                        key={notif.id}
                        className="p-4 border rounded-lg flex justify-between items-start"
                      >
                        <div>
                          <p className="font-medium">{notif.title}</p>
                          <p className="text-sm text-muted-foreground">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notif.sent_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="destructive">Alert</Badge>
                      </div>
                    ))}
                  {!notifications?.filter((n) => n.type === "low_stock").length && (
                    <p className="text-center text-muted-foreground py-8">
                      No stock alerts
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Automation;
