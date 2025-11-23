import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Download, FileText } from "lucide-react";

const ClientPortal = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  const { data: invoices } = useQuery({
    queryKey: ["client-invoices", clientId],
    enabled: !!clientId && isLoggedIn,
    queryFn: async () => {
      const { data } = await supabase
        .from("invoices")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });
      return data;
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data, error } = await supabase
      .from("client_portal_access")
      .select("*, clients(*)")
      .eq("email", email)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
      return;
    }

    setClientId(data.client_id);
    setIsLoggedIn(true);
    toast({
      title: "Success",
      description: "Logged in successfully",
    });
  };

  const formatBDT = (amount: number) => {
    return `৳${parseFloat(amount.toString()).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Client Portal</CardTitle>
            <p className="text-center text-muted-foreground">
              Access your invoices and payment history
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Invoices</h1>
            <p className="text-muted-foreground">View and download your invoices</p>
          </div>
          <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
            Logout
          </Button>
        </div>

        <div className="grid gap-4">
          {invoices?.map((invoice) => (
            <Card key={invoice.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-semibold">{invoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">
                        Issued: {new Date(invoice.issue_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatBDT(invoice.total)}</p>
                      <Badge
                        variant={
                          invoice.status === "paid" ? "default" : "secondary"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                    <Button size="icon" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;
