import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Layout, Save } from "lucide-react";

const DashboardSettings = () => {
  const [modules, setModules] = useState({
    inventory: true,
    quotes: true,
    invoices: true,
    clients: true,
    vendors: true,
    analytics: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (!profile) return;

    const { data: settings } = await supabase
      .from('dashboard_customization')
      .select('visible_modules')
      .eq('company_id', profile.company_id)
      .single();

    if (settings?.visible_modules) {
      const enabledModules = settings.visible_modules as string[];
      setModules({
        inventory: enabledModules.includes('inventory'),
        quotes: enabledModules.includes('quotes'),
        invoices: enabledModules.includes('invoices'),
        clients: enabledModules.includes('clients'),
        vendors: enabledModules.includes('vendors'),
        analytics: enabledModules.includes('analytics'),
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const visibleModules = Object.entries(modules)
        .filter(([_, enabled]) => enabled)
        .map(([module]) => module);

      const { error } = await supabase
        .from('dashboard_customization')
        .update({ visible_modules: visibleModules })
        .eq('company_id', profile.company_id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your dashboard customization has been updated",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (module: keyof typeof modules) => {
    setModules(prev => ({ ...prev, [module]: !prev[module] }));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Settings</h1>
          <p className="text-muted-foreground">Customize which modules appear on your dashboard</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Visible Modules
            </CardTitle>
            <CardDescription>
              Toggle modules on/off to customize your dashboard experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="inventory" className="flex flex-col gap-1 cursor-pointer">
                  <span className="font-medium">Inventory Management</span>
                  <span className="text-sm text-muted-foreground">Manage products and stock levels</span>
                </Label>
                <Switch
                  id="inventory"
                  checked={modules.inventory}
                  onCheckedChange={() => toggleModule('inventory')}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="quotes" className="flex flex-col gap-1 cursor-pointer">
                  <span className="font-medium">Quotation System</span>
                  <span className="text-sm text-muted-foreground">Create and manage quotes</span>
                </Label>
                <Switch
                  id="quotes"
                  checked={modules.quotes}
                  onCheckedChange={() => toggleModule('quotes')}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="invoices" className="flex flex-col gap-1 cursor-pointer">
                  <span className="font-medium">Invoice Management</span>
                  <span className="text-sm text-muted-foreground">Track invoices and payments</span>
                </Label>
                <Switch
                  id="invoices"
                  checked={modules.invoices}
                  onCheckedChange={() => toggleModule('invoices')}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="clients" className="flex flex-col gap-1 cursor-pointer">
                  <span className="font-medium">Customer Management</span>
                  <span className="text-sm text-muted-foreground">Manage client relationships</span>
                </Label>
                <Switch
                  id="clients"
                  checked={modules.clients}
                  onCheckedChange={() => toggleModule('clients')}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="vendors" className="flex flex-col gap-1 cursor-pointer">
                  <span className="font-medium">Vendor Management</span>
                  <span className="text-sm text-muted-foreground">Track vendors and expenses</span>
                </Label>
                <Switch
                  id="vendors"
                  checked={modules.vendors}
                  onCheckedChange={() => toggleModule('vendors')}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="analytics" className="flex flex-col gap-1 cursor-pointer">
                  <span className="font-medium">Business Analytics</span>
                  <span className="text-sm text-muted-foreground">View reports and insights</span>
                </Label>
                <Switch
                  id="analytics"
                  checked={modules.analytics}
                  onCheckedChange={() => toggleModule('analytics')}
                />
              </div>
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default DashboardSettings;
