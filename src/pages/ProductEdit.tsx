import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import ProductForm from "@/components/products/ProductForm";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id!).single();
      return data;
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("products").update(data).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Success", description: "Product updated successfully" });
      navigate(`/products/${id}`);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <MainLayout>
        <Card className="p-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </Card>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Product not found</h3>
            <Button onClick={() => navigate("/products")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/products/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            <p className="text-muted-foreground">Update product information</p>
          </div>
        </div>

        <ProductForm
          initialData={product}
          onSubmit={(data) => updateProductMutation.mutateAsync(data)}
          isLoading={updateProductMutation.isPending}
        />
      </div>
    </MainLayout>
  );
};

export default ProductEdit;
