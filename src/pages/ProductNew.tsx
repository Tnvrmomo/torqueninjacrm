import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import ProductForm from "@/components/products/ProductForm";
import { useToast } from "@/hooks/use-toast";

const ProductNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createProduct = useMutation({
    mutationFn: async (data: any) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { data: product, error } = await supabase
        .from("products")
        .insert([{ ...data, company_id: profile?.company_id }])
        .select()
        .single();

      if (error) throw error;
      return product;
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      navigate(`/products/${product.id}`);
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
          <h1 className="text-3xl font-bold tracking-tight">New Product</h1>
          <p className="text-muted-foreground">Add a new product to your catalog</p>
        </div>

        <ProductForm
          onSubmit={(data) => createProduct.mutateAsync(data)}
          isLoading={createProduct.isPending}
        />
      </div>
    </MainLayout>
  );
};

export default ProductNew;
