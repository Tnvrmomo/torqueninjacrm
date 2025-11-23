import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const Webhooks = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    events: [] as string[],
  });

  const eventTypes = [
    "invoice.created",
    "invoice.updated",
    "invoice.paid",
    "payment.received",
    "client.created",
    "product.updated",
  ];

  const { data: webhooks } = useQuery({
    queryKey: ["webhooks"],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { data } = await supabase
        .from("webhooks")
        .select("*")
        .eq("company_id", profile?.company_id)
        .order("created_at", { ascending: false });

      return data;
    },
  });

  const createWebhook = useMutation({
    mutationFn: async (data: any) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { error } = await supabase
        .from("webhooks")
        .insert([{ ...data, company_id: profile?.company_id }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast({
        title: "Success",
        description: "Webhook created successfully",
      });
      setOpen(false);
      setFormData({ name: "", url: "", events: [] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleWebhook = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("webhooks")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast({
        title: "Success",
        description: "Webhook updated",
      });
    },
  });

  const deleteWebhook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("webhooks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast({
        title: "Success",
        description: "Webhook deleted",
      });
    },
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
            <p className="text-muted-foreground">
              Connect external services with webhook notifications
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Webhook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Webhook</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="My Webhook"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Webhook URL</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    placeholder="https://example.com/webhook"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Events to Subscribe</Label>
                  <div className="space-y-2">
                    {eventTypes.map((event) => (
                      <div key={event} className="flex items-center gap-2">
                        <Checkbox
                          id={event}
                          checked={formData.events.includes(event)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                events: [...formData.events, event],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                events: formData.events.filter((e) => e !== event),
                              });
                            }
                          }}
                        />
                        <Label htmlFor={event} className="cursor-pointer">
                          {event}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => createWebhook.mutate(formData)}
                  disabled={createWebhook.isPending}
                  className="w-full"
                >
                  Create Webhook
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configured Webhooks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {webhooks?.map((webhook) => (
              <div
                key={webhook.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{webhook.name}</p>
                    <p className="text-sm text-muted-foreground">{webhook.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={webhook.is_active ? "default" : "secondary"}>
                      {webhook.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        toggleWebhook.mutate({
                          id: webhook.id,
                          is_active: !webhook.is_active,
                        })
                      }
                    >
                      {webhook.is_active ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteWebhook.mutate(webhook.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {webhook.events.map((event) => (
                    <Badge key={event} variant="outline">
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            {!webhooks?.length && (
              <p className="text-center text-muted-foreground py-8">
                No webhooks configured yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Webhooks;
