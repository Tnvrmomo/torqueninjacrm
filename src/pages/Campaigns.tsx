import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Send, Mail, BarChart3, Eye, Trash2, Users, MousePointer, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Campaigns = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", subject: "", body_html: "", body_text: "", from_name: "", from_email: "",
  });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads-count"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("id, email, status");
      if (error) throw error;
      return data;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["user-profile-campaign"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("company_id").eq("user_id", user.id).single();
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.company_id) throw new Error("No company");
      const { error } = await supabase.from("lead_campaigns").insert({
        ...form,
        company_id: profile.company_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Campaign created");
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setCreateOpen(false);
      setForm({ name: "", subject: "", body_html: "", body_text: "", from_name: "", from_email: "" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const sendMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      setSendingId(campaignId);
      const emailableLeads = leads.filter((l: any) => l.email?.includes("@"));
      const { data, error } = await supabase.functions.invoke("send-campaign", {
        body: { campaign_id: campaignId, lead_ids: emailableLeads.map((l: any) => l.id) },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Sent: ${data.sent}, Failed: ${data.failed}`);
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setSendingId(null);
    },
    onError: (e: any) => {
      toast.error(e.message || "Send failed");
      setSendingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lead_campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Campaign deleted");
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      sending: "bg-yellow-500/20 text-yellow-700",
      sent: "bg-green-500/20 text-green-700",
      paused: "bg-orange-500/20 text-orange-700",
    };
    return <Badge className={styles[status] || "bg-muted"}>{status}</Badge>;
  };

  const emailableCount = leads.filter((l: any) => l.email?.includes("@")).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Email Campaigns</h1>
            <p className="text-muted-foreground">Send targeted cold emails to your leads</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/leads")}>
              <Users className="h-4 w-4 mr-2" />
              Leads ({leads.length})
            </Button>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" />New Campaign</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Campaign</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Campaign Name</Label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Q1 Outreach" />
                    </div>
                    <div>
                      <Label>From Name</Label>
                      <Input value={form.from_name} onChange={(e) => setForm({ ...form, from_name: e.target.value })} placeholder="Torque Stickers" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>From Email</Label>
                      <Input value={form.from_email} onChange={(e) => setForm({ ...form, from_email: e.target.value })} placeholder="hello@yourdomain.com" />
                    </div>
                    <div>
                      <Label>Subject Line</Label>
                      <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Boost your brand with custom stickers" />
                    </div>
                  </div>
                  <div>
                    <Label>Email Body (HTML) — Use {"{{name}}"}, {"{{company}}"} for personalization</Label>
                    <Textarea rows={10} value={form.body_html} onChange={(e) => setForm({ ...form, body_html: e.target.value })}
                      placeholder={`<h2>Hi {{name}},</h2>\n<p>We noticed {{company}} might benefit from our custom sticker solutions...</p>`} />
                  </div>
                  <div>
                    <Label>Plain Text Version (optional)</Label>
                    <Textarea rows={4} value={form.body_text} onChange={(e) => setForm({ ...form, body_text: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Will be sent to {emailableCount} leads with email addresses
                  </div>
                  <Button onClick={() => createMutation.mutate()} disabled={!form.name || !form.subject || !form.body_html || createMutation.isPending} className="w-full">
                    Create Campaign
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Mail className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{campaigns.length}</p>
              <p className="text-xs text-muted-foreground">Campaigns</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Send className="h-5 w-5 mx-auto mb-1 text-green-500" />
              <p className="text-2xl font-bold">{campaigns.reduce((a: number, c: any) => a + (c.total_sent || 0), 0)}</p>
              <p className="text-xs text-muted-foreground">Emails Sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Eye className="h-5 w-5 mx-auto mb-1 text-blue-500" />
              <p className="text-2xl font-bold">{campaigns.reduce((a: number, c: any) => a + (c.total_opened || 0), 0)}</p>
              <p className="text-xs text-muted-foreground">Opened</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MousePointer className="h-5 w-5 mx-auto mb-1 text-purple-500" />
              <p className="text-2xl font-bold">{campaigns.reduce((a: number, c: any) => a + (c.total_clicked || 0), 0)}</p>
              <p className="text-xs text-muted-foreground">Clicked</p>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Opened</TableHead>
                  <TableHead>Clicked</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : campaigns.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No campaigns yet</TableCell></TableRow>
                ) : (
                  campaigns.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.subject}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(c.status)}</TableCell>
                      <TableCell>{c.total_recipients || 0}</TableCell>
                      <TableCell>{c.total_sent || 0}</TableCell>
                      <TableCell>{c.total_opened || 0}</TableCell>
                      <TableCell>{c.total_clicked || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {c.status === "draft" && (
                            <Button size="sm" variant="outline" onClick={() => sendMutation.mutate(c.id)}
                              disabled={sendingId === c.id} className="gap-1 text-xs">
                              <Send className="h-3 w-3" />
                              {sendingId === c.id ? "Sending..." : "Send"}
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(c.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Campaigns;
