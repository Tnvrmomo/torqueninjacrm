import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Plus, Sparkles, Trash2, ExternalLink, Mail, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Leads = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [genCategory, setGenCategory] = useState("");
  const [genQuery, setGenQuery] = useState("");
  const [genLocation, setGenLocation] = useState("");

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads", statusFilter],
    queryFn: async () => {
      let query = supabase.from("leads").select("*").order("ai_score", { ascending: false });
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-leads", {
        body: { business_category: genCategory, search_query: genQuery, location: genLocation },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Generated ${data.count || 0} new leads!`);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setGenerateOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate leads");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lead deleted");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("leads").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const filtered = leads.filter((l: any) =>
    (l.name || l.company_name || l.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500/20 text-green-700 border-green-300">{score}</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-300">{score}</Badge>;
    return <Badge className="bg-red-500/20 text-red-700 border-red-300">{score}</Badge>;
  };

  const getCategoryBadge = (cat: string) => {
    const colors: Record<string, string> = {
      "Hot Lead": "bg-red-500/20 text-red-700",
      "Warm Lead": "bg-orange-500/20 text-orange-700",
      "Cold Lead": "bg-blue-500/20 text-blue-700",
      "Partner Potential": "bg-purple-500/20 text-purple-700",
    };
    return <Badge className={colors[cat] || "bg-muted text-muted-foreground"}>{cat}</Badge>;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leads</h1>
            <p className="text-muted-foreground">AI-powered lead generation and management</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Leads
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>AI Lead Generation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Business Category</Label>
                    <Input placeholder="e.g., Automotive parts, Stickers" value={genCategory} onChange={(e) => setGenCategory(e.target.value)} />
                  </div>
                  <div>
                    <Label>Search Query (optional)</Label>
                    <Input placeholder="e.g., car accessories wholesale suppliers" value={genQuery} onChange={(e) => setGenQuery(e.target.value)} />
                  </div>
                  <div>
                    <Label>Location (optional)</Label>
                    <Input placeholder="e.g., Bangladesh, Dhaka" value={genLocation} onChange={(e) => setGenLocation(e.target.value)} />
                  </div>
                  <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="w-full gap-2">
                    {generateMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {generateMutation.isPending ? "Generating..." : "Generate Leads with AI"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => navigate("/campaigns")}>
              <Mail className="h-4 w-4 mr-2" />
              Campaigns
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {["all", "new", "contacted", "qualified", "converted"].map((s) => (
            <Card key={s} className={`cursor-pointer transition-colors ${statusFilter === s ? "border-primary" : ""}`} onClick={() => setStatusFilter(s)}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{s === "all" ? leads.length : leads.filter((l: any) => l.status === s).length}</p>
                <p className="text-xs text-muted-foreground capitalize">{s === "all" ? "Total" : s}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search leads..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No leads found. Click "Generate Leads" to start.</TableCell></TableRow>
                ) : (
                  filtered.map((lead: any) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{lead.company_name || "—"}</p>
                          {lead.website && (
                            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" />{lead.website.replace(/^https?:\/\//, "").slice(0, 30)}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{lead.name || "—"}</p>
                          <p className="text-muted-foreground">{lead.email || "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{lead.industry || "—"}</TableCell>
                      <TableCell>{getScoreBadge(lead.ai_score)}</TableCell>
                      <TableCell>{getCategoryBadge(lead.ai_category)}</TableCell>
                      <TableCell>
                        <Select value={lead.status} onValueChange={(v) => updateStatusMutation.mutate({ id: lead.id, status: v })}>
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["new", "contacted", "qualified", "converted", "lost"].map((s) => (
                              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(lead.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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

export default Leads;
