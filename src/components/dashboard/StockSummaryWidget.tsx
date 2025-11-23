import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function StockSummaryWidget() {
  const navigate = useNavigate();

  const { data: lowStockProducts, isLoading } = useQuery({
    queryKey: ['low-stock-widget'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, stock_quantity, reorder_point')
        .eq('is_active', true)
        .order('stock_quantity', { ascending: true })
        .limit(100);
      
      // Filter low stock on client side
      return (data || []).filter(p => 
        (p.stock_quantity || 0) <= (p.reorder_point || 10)
      ).slice(0, 5);
    }
  });
  
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!lowStockProducts || lowStockProducts.length === 0) return null;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Low Stock Alerts
          <Badge variant="destructive" className="ml-auto">
            {lowStockProducts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockProducts.map(product => (
            <div 
              key={product.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/70 cursor-pointer transition-colors"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Reorder at: {product.reorder_point || 10} units
                  </div>
                </div>
              </div>
              <Badge variant="destructive">
                {product.stock_quantity || 0} left
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
