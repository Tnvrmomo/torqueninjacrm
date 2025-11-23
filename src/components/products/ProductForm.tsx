import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
  
  cost_price: z.number().min(0).optional(),
  sale_price: z.number().min(0, "Sale price is required"),
  currency: z.string().default("BDT"),
  
  stock_quantity: z.number().int().min(0).optional(),
  low_stock_alert: z.number().int().min(0).optional(),
  reorder_point: z.number().int().min(0).optional(),
  
  tax_rate_1: z.number().min(0).max(100).optional(),
  tax_name_1: z.string().optional(),
  
  material_type: z.string().optional(),
  size: z.string().optional(),
  
  custom_value_1: z.string().optional(),
  custom_value_2: z.string().optional(),
  custom_value_3: z.string().optional(),
  custom_value_4: z.string().optional(),
  
  is_active: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<any>;
  isLoading?: boolean;
}

const ProductForm = ({ initialData, onSubmit, isLoading }: ProductFormProps) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      currency: "BDT",
      is_active: true,
      tax_rate_1: 10, // Default VAT
      tax_name_1: "VAT",
    },
  });

  const isActive = watch("is_active");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="additional">Additional</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" {...register("sku")} placeholder="e.g., STK-001" />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register("description")} rows={3} />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" {...register("category")} placeholder="e.g., Window Stickers" />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue("is_active", checked as boolean)}
                />
                <Label htmlFor="is_active" className="cursor-pointer">Active Product</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cost_price">Cost Price</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    {...register("cost_price", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="sale_price">Sale Price *</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    step="0.01"
                    {...register("sale_price", { valueAsNumber: true })}
                  />
                  {errors.sale_price && <p className="text-sm text-destructive mt-1">{errors.sale_price.message}</p>}
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" {...register("currency")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tax_name_1">Tax Name</Label>
                  <Input id="tax_name_1" {...register("tax_name_1")} placeholder="VAT" />
                </div>
                <div>
                  <Label htmlFor="tax_rate_1">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate_1"
                    type="number"
                    step="0.01"
                    {...register("tax_rate_1", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    {...register("stock_quantity", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="low_stock_alert">Low Stock Alert</Label>
                  <Input
                    id="low_stock_alert"
                    type="number"
                    {...register("low_stock_alert", { valueAsNumber: true })}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label htmlFor="reorder_point">Reorder Point</Label>
                  <Input
                    id="reorder_point"
                    type="number"
                    {...register("reorder_point", { valueAsNumber: true })}
                    placeholder="20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automotive Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="material_type">Material Type</Label>
                  <Input id="material_type" {...register("material_type")} placeholder="e.g., UV Matte, Glossy" />
                </div>
                <div>
                  <Label htmlFor="size">Size</Label>
                  <Input id="size" {...register("size")} placeholder="e.g., 10x15 cm" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="additional" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea id="notes" {...register("notes")} rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="custom_value_1">Custom Field 1</Label>
                  <Input id="custom_value_1" {...register("custom_value_1")} />
                </div>
                <div>
                  <Label htmlFor="custom_value_2">Custom Field 2</Label>
                  <Input id="custom_value_2" {...register("custom_value_2")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="custom_value_3">Custom Field 3</Label>
                  <Input id="custom_value_3" {...register("custom_value_3")} />
                </div>
                <div>
                  <Label htmlFor="custom_value_4">Custom Field 4</Label>
                  <Input id="custom_value_4" {...register("custom_value_4")} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Product"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
