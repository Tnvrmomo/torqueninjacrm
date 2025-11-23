import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import ClientForm from "@/components/clients/ClientForm";
import { useToast } from "@/hooks/use-toast";

const ClientNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createClient = useMutation({
    mutationFn: async (data: any) => {
      // Get current user's company_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { data: client, error } = await supabase
        .from("clients")
        .insert([{ ...data, company_id: profile?.company_id }])
        .select()
        .single();

      if (error) throw error;
      return client;
    },
    onSuccess: (client) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: "Success",
        description: "Client created successfully",
      });
      navigate(`/clients/${client.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Client</h1>
          <p className="text-muted-foreground">Add a new client to your database</p>
        </div>

        <ClientForm
          onSubmit={(data) => createClient.mutateAsync(data)}
          isLoading={createClient.isPending}
        />
      </div>
    </MainLayout>
  );
};

export default ClientNew;
