import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Trash2, Package } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ProductDetail = () => {
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

  const deleteProductMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("products").delete().eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Success", description: "Product deleted successfully" });
      navigate("/products");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount).replace("BDT", "৳");
  };

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

  const isLowStock = product.stock_quantity <= (product.low_stock_alert || 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/products")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                {!product.is_active && <Badge variant="secondary">Inactive</Badge>}
                {isLowStock && <Badge variant="destructive">Low Stock</Badge>}
              </div>
              {product.sku && <p className="text-muted-foreground">SKU: {product.sku}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/products/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the product.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteProductMutation.mutate()}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Sale Price</div>
            <div className="text-3xl font-bold text-primary">{formatBDT(product.sale_price)}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Cost Price</div>
            <div className="text-3xl font-bold">{formatBDT(product.cost_price || 0)}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Stock</div>
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-muted-foreground" />
              <div className="text-3xl font-bold">{product.stock_quantity || 0}</div>
            </div>
          </Card>
        </div>

        {product.image_url && (
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Product Image</h2>
            <img src={product.image_url} alt={product.name} className="max-w-md rounded-lg" />
          </Card>
        )}

        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Product Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {product.description && (
              <div className="md:col-span-2">
                <div className="text-sm font-semibold mb-1">Description</div>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </div>
            )}
            {product.category && (
              <div>
                <div className="text-sm font-semibold mb-1">Category</div>
                <p className="text-sm text-muted-foreground">{product.category}</p>
              </div>
            )}
            {product.size && (
              <div>
                <div className="text-sm font-semibold mb-1">Size</div>
                <p className="text-sm text-muted-foreground">{product.size}</p>
              </div>
            )}
            {product.material_type && (
              <div>
                <div className="text-sm font-semibold mb-1">Material Type</div>
                <p className="text-sm text-muted-foreground">{product.material_type}</p>
              </div>
            )}
            {product.low_stock_alert && (
              <div>
                <div className="text-sm font-semibold mb-1">Low Stock Alert</div>
                <p className="text-sm text-muted-foreground">{product.low_stock_alert} units</p>
              </div>
            )}
            {product.reorder_point && (
              <div>
                <div className="text-sm font-semibold mb-1">Reorder Point</div>
                <p className="text-sm text-muted-foreground">{product.reorder_point} units</p>
              </div>
            )}
          </div>
        </Card>

        {product.vehicle_compatibility && product.vehicle_compatibility.length > 0 && (
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Vehicle Compatibility</h2>
            <div className="flex flex-wrap gap-2">
              {product.vehicle_compatibility.map((vehicle: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {vehicle}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {product.notes && (
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Notes</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.notes}</p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ProductDetail;
