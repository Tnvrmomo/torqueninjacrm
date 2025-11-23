import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_bdt: number;
  price_usd: number;
  is_one_time: boolean;
  features: any;
}

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [currency, setCurrency] = useState<"BDT" | "USD">("BDT");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("price_bdt", { ascending: true });

    if (!error && data) {
      setPlans(data);
      setSelectedPlan(data[0]?.id || "");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          selected_plan: selectedPlan,
          currency: currency,
        },
      },
    });

    if (error) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Success!",
      description: "Your account has been created with a 7-day trial.",
    });
    navigate("/");
    setLoading(false);
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-4xl p-8 bg-card rounded-lg shadow-primary">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="TorqueNinja" className="h-16" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Create Your Account</h1>
        <p className="text-center text-muted-foreground mb-6">Start your 7-day free trial</p>

        <form onSubmit={handleSignup} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Currency Selection */}
          <div>
            <Label className="mb-3 block">Select Currency</Label>
            <RadioGroup value={currency} onValueChange={(val) => setCurrency(val as "BDT" | "USD")} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="BDT" id="bdt" />
                <Label htmlFor="bdt" className="cursor-pointer">BDT (৳)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="USD" id="usd" />
                <Label htmlFor="usd" className="cursor-pointer">USD ($)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Plan Selection */}
          <div>
            <Label className="mb-3 block">Choose Your Plan</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? "border-primary shadow-lg"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.name}
                      {selectedPlan === plan.id && <Check className="h-5 w-5 text-primary" />}
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">
                      {currency === "BDT" ? `৳${plan.price_bdt}` : `$${plan.price_usd}`}
                      {!plan.is_one_time && <span className="text-sm font-normal text-muted-foreground">/month</span>}
                      {plan.is_one_time && <span className="text-sm font-normal text-muted-foreground"> one-time</span>}
                    </div>
                    <ul className="space-y-2 text-sm">
                      {plan.features?.products_limit !== null && (
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          {plan.features.products_limit ? `${plan.features.products_limit} Products` : "Unlimited Products"}
                        </li>
                      )}
                      {plan.features?.invoices_limit !== null && (
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          {plan.features.invoices_limit ? `${plan.features.invoices_limit} Invoices` : "Unlimited Invoices"}
                        </li>
                      )}
                      {plan.features?.advanced_analytics && (
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          Advanced Analytics
                        </li>
                      )}
                      {plan.features?.smart_notifications && (
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          Smart Notifications
                        </li>
                      )}
                      {plan.features?.unlimited_ai && (
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          Unlimited AI Assistant
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !selectedPlan}>
            {loading ? "Creating account..." : `Start Free Trial - ${selectedPlanData?.name || ""}`}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            7-day free trial • No credit card required • Cancel anytime
          </p>
        </form>

        <p className="text-center mt-4 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
