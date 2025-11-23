import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe } from "lucide-react";
import { format } from "date-fns";

export default function DomainManagement() {
  const { user } = useAuth();

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

  const { data: domains, isLoading } = useQuery({
    queryKey: ['all-domains'],
    queryFn: async () => {
      const { data } = await supabase
        .from('custom_domains')
        .select('*, companies(name)')
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: isSuperAdmin === true
  });

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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      verified: "secondary",
      pending: "outline",
      failed: "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status?.toUpperCase()}</Badge>;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Globe className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Custom Domain Management</h1>
            <p className="text-muted-foreground">Manage all custom domain requests</p>
          </div>
        </div>

        {isLoading ? (
          <Card className="p-6 animate-pulse">
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </Card>
        ) : !domains || domains.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No custom domains yet</h3>
              <p className="text-muted-foreground">Domain requests will appear here</p>
            </div>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SSL Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Verified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((domain: any) => (
                  <TableRow key={domain.id}>
                    <TableCell className="font-medium">{domain.domain}</TableCell>
                    <TableCell>{domain.companies?.name}</TableCell>
                    <TableCell>{getStatusBadge(domain.status)}</TableCell>
                    <TableCell>{getStatusBadge(domain.ssl_status)}</TableCell>
                    <TableCell>
                      {format(new Date(domain.created_at), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell>
                      {domain.verified_at 
                        ? format(new Date(domain.verified_at), 'dd MMM yyyy')
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="font-semibold mb-4">DNS Setup Instructions for Customers</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Customers need to add these DNS records at their domain registrar:</p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`A Record:
  Name: @
  Value: [Your_Server_IP]
  TTL: 3600

A Record:
  Name: www
  Value: [Your_Server_IP]
  TTL: 3600

TXT Record:
  Name: _torqueninja-verify
  Value: [Verification_Token]
  TTL: 3600`}
            </pre>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
