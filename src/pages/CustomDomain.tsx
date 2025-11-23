import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Globe } from "lucide-react";
import { toast } from "sonner";

export default function CustomDomain() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [domain, setDomain] = useState("");

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user!.id)
        .single();
      return data;
    },
    enabled: !!user
  });

  const { data: customDomain } = useQuery({
    queryKey: ['custom-domain', profile?.company_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('custom_domains')
        .select('*')
        .eq('company_id', profile!.company_id)
        .single();
      return data;
    },
    enabled: !!profile?.company_id
  });

  const requestDomain = useMutation({
    mutationFn: async (domainName: string) => {
      const verificationToken = Math.random().toString(36).substring(2, 15);
      
      const { data, error } = await supabase
        .from('custom_domains')
        .insert({
          company_id: profile!.company_id,
          domain: domainName,
          verification_token: verificationToken,
          dns_records: {
            a_record: "@ -> [Your_Server_IP]",
            www_record: "www -> [Your_Server_IP]",
            txt_record: `_torqueninja-verify -> ${verificationToken}`
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-domain'] });
      toast.success('Domain request submitted');
      setDomain("");
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to request domain');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;
    requestDomain.mutate(domain);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Globe className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Custom Domain</h1>
            <p className="text-muted-foreground">Connect your own domain to your TorqueNinja dashboard</p>
          </div>
        </div>

        {customDomain ? (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">{customDomain.domain}</p>
                <p className="text-sm text-muted-foreground">Status: 
                  <Badge className="ml-2" variant={customDomain.status === 'active' ? 'default' : 'secondary'}>
                    {customDomain.status}
                  </Badge>
                </p>
              </div>
            </div>

            {customDomain.status === 'pending' && (
              <Alert>
                <AlertDescription>
                  <p className="font-semibold mb-2">Please add these DNS records to your domain:</p>
                  <pre className="bg-background p-4 rounded-lg text-sm overflow-x-auto">
{`A Record:
  Name: @
  Value: [Contact Admin for IP]
  TTL: 3600

A Record:
  Name: www
  Value: [Contact Admin for IP]
  TTL: 3600

TXT Record:
  Name: _torqueninja-verify
  Value: ${customDomain.verification_token}
  TTL: 3600`}
                  </pre>
                  <p className="mt-2 text-sm text-muted-foreground">
                    DNS changes can take up to 72 hours to propagate. We'll automatically verify your domain.
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </Card>
        ) : (
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="domain">Your Domain</Label>
                <Input
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="mybusiness.com"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your domain without http:// or www
                </p>
              </div>
              
              <Button type="submit" disabled={requestDomain.isPending}>
                {requestDomain.isPending ? 'Requesting...' : 'Request Custom Domain'}
              </Button>
            </form>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Benefits of Custom Domain</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Professional branded URL for your business</li>
            <li>✓ Automatic SSL certificate (HTTPS)</li>
            <li>✓ Better SEO and brand recognition</li>
            <li>✓ Custom email addresses possible</li>
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
}
