import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Smartphone } from "lucide-react";

interface PaymentGatewaySelectorProps {
  planId: string;
  currency: "BDT" | "USD";
  amount: number;
  onSuccess: () => void;
}

export const PaymentGatewaySelector = ({ planId, currency, amount, onSuccess }: PaymentGatewaySelectorProps) => {
  const [selectedGateway, setSelectedGateway] = useState<string>("stripe");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const gateways = currency === "USD" 
    ? [{ id: "stripe", name: "Credit/Debit Card", icon: CreditCard }]
    : [
        { id: "stripe", name: "Credit/Debit Card", icon: CreditCard },
        { id: "bkash", name: "bKash", icon: Smartphone },
        { id: "nagad", name: "Nagad", icon: Smartphone },
        { id: "rocket", name: "Rocket", icon: Smartphone },
      ];

  const handlePayment = async () => {
    setLoading(true);
    try {
      let response;
      
      if (selectedGateway === "stripe") {
        response = await supabase.functions.invoke("stripe-checkout", {
          body: { planId, currency }
        });
      } else if (selectedGateway === "bkash") {
        if (!phoneNumber) {
          toast({
            title: "Phone number required",
            description: "Please enter your bKash phone number",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        response = await supabase.functions.invoke("bkash-payment", {
          body: { planId, phoneNumber }
        });
      }

      if (response.error) {
        throw response.error;
      }

      toast({
        title: "Payment initiated",
        description: "Redirecting to payment gateway...",
      });

      // In production, redirect to payment gateway
      // For now, simulate success after 2 seconds
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment failed",
        description: error.message || "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Payment Method</CardTitle>
        <CardDescription>
          Amount to pay: {currency === "BDT" ? "৳" : "$"}{amount}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={selectedGateway} onValueChange={setSelectedGateway}>
          {gateways.map((gateway) => (
            <div key={gateway.id} className="flex items-center space-x-2">
              <RadioGroupItem value={gateway.id} id={gateway.id} />
              <Label htmlFor={gateway.id} className="flex items-center gap-2 cursor-pointer">
                <gateway.icon className="h-4 w-4" />
                {gateway.name}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {(selectedGateway === "bkash" || selectedGateway === "nagad" || selectedGateway === "rocket") && (
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="01XXXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        )}

        <Button onClick={handlePayment} className="w-full" disabled={loading}>
          {loading ? "Processing..." : `Pay ${currency === "BDT" ? "৳" : "$"}${amount}`}
        </Button>
      </CardContent>
    </Card>
  );
};
