import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  client_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  vat_number: z.string().optional(),
  id_number: z.string().optional(),
  
  // Billing Address
  street: z.string().optional(),
  apt_suite: z.string().optional(),
  city: z.string().optional(),
  state_province: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default("People's Republic of Bangladesh"),
  
  // Shipping Address
  shipping_street: z.string().optional(),
  shipping_apt_suite: z.string().optional(),
  shipping_city: z.string().optional(),
  shipping_state_province: z.string().optional(),
  shipping_postal_code: z.string().optional(),
  shipping_country: z.string().optional(),
  
  // Contact Person
  contact_first_name: z.string().optional(),
  contact_last_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().optional(),
  
  // Financial
  credit_limit: z.number().optional(),
  payment_terms: z.string().optional(),
  currency: z.string().default("BDT"),
  
  // Additional
  industry: z.string().optional(),
  client_size: z.string().optional(),
  classification: z.string().optional(),
  public_notes: z.string().optional(),
  private_notes: z.string().optional(),
  
  // Custom Fields
  custom_value_1: z.string().optional(),
  custom_value_2: z.string().optional(),
  custom_value_3: z.string().optional(),
  custom_value_4: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  initialData?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => Promise<any>;
  isLoading?: boolean;
}

const ClientForm = ({ initialData, onSubmit, isLoading }: ClientFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {
      country: "People's Republic of Bangladesh",
      currency: "BDT",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="address">Addresses</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
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
                  <Label htmlFor="name">Client Name *</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="client_number">Client Number</Label>
                  <Input id="client_number" {...register("client_number")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register("phone")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" {...register("website")} placeholder="https://" />
                </div>
                <div>
                  <Label htmlFor="vat_number">VAT Number</Label>
                  <Input id="vat_number" {...register("vat_number")} />
                </div>
              </div>

              <div>
                <Label htmlFor="id_number">ID Number</Label>
                <Input id="id_number" {...register("id_number")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Person</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_first_name">First Name</Label>
                  <Input id="contact_first_name" {...register("contact_first_name")} />
                </div>
                <div>
                  <Label htmlFor="contact_last_name">Last Name</Label>
                  <Input id="contact_last_name" {...register("contact_last_name")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Email</Label>
                  <Input id="contact_email" type="email" {...register("contact_email")} />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Phone</Label>
                  <Input id="contact_phone" {...register("contact_phone")} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="address" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">Street</Label>
                <Input id="street" {...register("street")} />
              </div>
              <div>
                <Label htmlFor="apt_suite">Apt/Suite</Label>
                <Input id="apt_suite" {...register("apt_suite")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register("city")} />
                </div>
                <div>
                  <Label htmlFor="state_province">State/Province</Label>
                  <Input id="state_province" {...register("state_province")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input id="postal_code" {...register("postal_code")} />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" {...register("country")} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="shipping_street">Street</Label>
                <Input id="shipping_street" {...register("shipping_street")} />
              </div>
              <div>
                <Label htmlFor="shipping_apt_suite">Apt/Suite</Label>
                <Input id="shipping_apt_suite" {...register("shipping_apt_suite")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shipping_city">City</Label>
                  <Input id="shipping_city" {...register("shipping_city")} />
                </div>
                <div>
                  <Label htmlFor="shipping_state_province">State/Province</Label>
                  <Input id="shipping_state_province" {...register("shipping_state_province")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shipping_postal_code">Postal Code</Label>
                  <Input id="shipping_postal_code" {...register("shipping_postal_code")} />
                </div>
                <div>
                  <Label htmlFor="shipping_country">Country</Label>
                  <Input id="shipping_country" {...register("shipping_country")} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" {...register("currency")} />
                </div>
                <div>
                  <Label htmlFor="credit_limit">Credit Limit</Label>
                  <Input
                    id="credit_limit"
                    type="number"
                    step="0.01"
                    {...register("credit_limit", { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Input id="payment_terms" {...register("payment_terms")} placeholder="e.g., Net 30" />
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" {...register("industry")} />
                </div>
                <div>
                  <Label htmlFor="client_size">Client Size</Label>
                  <Input id="client_size" {...register("client_size")} />
                </div>
                <div>
                  <Label htmlFor="classification">Classification</Label>
                  <Input id="classification" {...register("classification")} />
                </div>
              </div>

              <div>
                <Label htmlFor="public_notes">Public Notes</Label>
                <Textarea id="public_notes" {...register("public_notes")} rows={3} />
              </div>

              <div>
                <Label htmlFor="private_notes">Private Notes</Label>
                <Textarea id="private_notes" {...register("private_notes")} rows={3} />
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
          {isLoading ? "Saving..." : "Save Client"}
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;
