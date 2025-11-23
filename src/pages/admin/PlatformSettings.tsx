import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function PlatformSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [stripeKey, setStripeKey] = useState("");
  const [stripeWebhook, setStripeWebhook] = useState("");
  const [sslStoreId, setSslStoreId] = useState("");
  const [sslPassword, setSslPassword] = useState("");
  const [bkashKey, setBkashKey] = useState("");
  const [bkashSecret, setBkashSecret] = useState("");
  const [nagadId, setNagadId] = useState("");
  const [nagadKey, setNagadKey] = useState("");
  const [rocketId, setRocketId] = useState("");
  const [rocketKey, setRocketKey] = useState("");

  const { data: isSuperAdmin, isLoading: isLoadingRole } = useQuery({
    queryKey: ['is-super-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'super_admin')
        .single();
      return !!data;
    },
    enabled: !!user
  });

  const { data: settings } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('platform_settings')
        .select('*');
      return data || [];
    },
    enabled: isSuperAdmin === true
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      await supabase
        .from('platform_settings')
        .update({ setting_value: value, updated_by: user!.id })
        .eq('setting_key', key);
      
      await supabase.from('admin_audit_log').insert({
        admin_user_id: user!.id,
        action: 'update_platform_setting',
        target_entity_type: 'setting',
        details: { setting_key: key }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      toast.success('Settings updated successfully');
    }
  });

  const handleSaveStripe = () => {
    updateSetting.mutate({
      key: 'stripe_secret_key',
      value: { key: stripeKey, webhook_secret: stripeWebhook }
    });
  };

  const handleSaveSSL = () => {
    updateSetting.mutate({
      key: 'sslcommerz_credentials',
      value: { store_id: sslStoreId, store_password: sslPassword }
    });
  };

  const handleSaveBkash = () => {
    updateSetting.mutate({
      key: 'bkash_credentials',
      value: { app_key: bkashKey, app_secret: bkashSecret }
    });
  };

  const handleSaveNagad = () => {
    updateSetting.mutate({
      key: 'nagad_credentials',
      value: { merchant_id: nagadId, merchant_key: nagadKey }
    });
  };

  const handleSaveRocket = () => {
    updateSetting.mutate({
      key: 'rocket_credentials',
      value: { merchant_id: rocketId, merchant_key: rocketKey }
    });
  };

  if (isLoadingRole) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
            <p className="text-muted-foreground">Configure global platform settings and API keys</p>
          </div>
        </div>

        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment Gateways
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            {/* Stripe */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Stripe (International)</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stripe-key">Secret Key</Label>
                  <Input
                    id="stripe-key"
                    type="password"
                    value={stripeKey}
                    onChange={(e) => setStripeKey(e.target.value)}
                    placeholder="sk_live_..."
                  />
                </div>
                <div>
                  <Label htmlFor="stripe-webhook">Webhook Secret</Label>
                  <Input
                    id="stripe-webhook"
                    type="password"
                    value={stripeWebhook}
                    onChange={(e) => setStripeWebhook(e.target.value)}
                    placeholder="whsec_..."
                  />
                </div>
                <Button onClick={handleSaveStripe}>Save Stripe Settings</Button>
              </div>
            </Card>

            {/* SSLCommerz */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">SSLCommerz (Bangladesh)</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ssl-id">Store ID</Label>
                  <Input
                    id="ssl-id"
                    value={sslStoreId}
                    onChange={(e) => setSslStoreId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ssl-password">Store Password</Label>
                  <Input
                    id="ssl-password"
                    type="password"
                    value={sslPassword}
                    onChange={(e) => setSslPassword(e.target.value)}
                  />
                </div>
                <Button onClick={handleSaveSSL}>Save SSLCommerz Settings</Button>
              </div>
            </Card>

            {/* bKash */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">bKash (Bangladesh Mobile)</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bkash-key">App Key</Label>
                  <Input
                    id="bkash-key"
                    value={bkashKey}
                    onChange={(e) => setBkashKey(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bkash-secret">App Secret</Label>
                  <Input
                    id="bkash-secret"
                    type="password"
                    value={bkashSecret}
                    onChange={(e) => setBkashSecret(e.target.value)}
                  />
                </div>
                <Button onClick={handleSaveBkash}>Save bKash Settings</Button>
              </div>
            </Card>

            {/* Nagad */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Nagad (Bangladesh Mobile)</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nagad-id">Merchant ID</Label>
                  <Input
                    id="nagad-id"
                    value={nagadId}
                    onChange={(e) => setNagadId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="nagad-key">Merchant Key</Label>
                  <Input
                    id="nagad-key"
                    type="password"
                    value={nagadKey}
                    onChange={(e) => setNagadKey(e.target.value)}
                  />
                </div>
                <Button onClick={handleSaveNagad}>Save Nagad Settings</Button>
              </div>
            </Card>

            {/* Rocket */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Rocket (Bangladesh Mobile)</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rocket-id">Merchant ID</Label>
                  <Input
                    id="rocket-id"
                    value={rocketId}
                    onChange={(e) => setRocketId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="rocket-key">Merchant Key</Label>
                  <Input
                    id="rocket-key"
                    type="password"
                    value={rocketKey}
                    onChange={(e) => setRocketKey(e.target.value)}
                  />
                </div>
                <Button onClick={handleSaveRocket}>Save Rocket Settings</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
