import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CreditCard, Zap, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentModalProps {
  show: boolean;
  onClose: () => void;
}

export const PaymentModal = ({ show, onClose }: PaymentModalProps) => {
  const navigate = useNavigate();
  const { subscription } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    if (subscription?.trial_ends_at) {
      const updateTimeRemaining = () => {
        const now = new Date();
        const trialEnd = new Date(subscription.trial_ends_at);
        const diff = trialEnd.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeRemaining("Trial expired");
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeRemaining(`${days} day${days > 1 ? 's' : ''} ${hours}h remaining`);
        } else if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m remaining`);
        } else {
          setTimeRemaining(`${minutes} minute${minutes > 1 ? 's' : ''} remaining`);
        }
      };

      updateTimeRemaining();
      const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [subscription]);

  const plans = [
    {
      name: "Professional",
      priceBDT: "৳5,000",
      priceUSD: "$50",
      period: "/month",
      popular: true,
      features: [
        "Unlimited products & invoices",
        "Advanced AI analytics",
        "Smart notifications",
        "1,000 AI queries/month",
        "Priority support"
      ]
    },
    {
      name: "Lifetime",
      priceBDT: "৳10,000",
      priceUSD: "$100",
      period: "one-time",
      badge: "Best Value",
      features: [
        "Everything in Professional",
        "Unlimited AI queries",
        "Lifetime updates",
        "Premium support",
        "No recurring fees ever"
      ]
    }
  ];

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            Upgrade Your Experience
          </DialogTitle>
          <DialogDescription className="text-lg">
            {subscription?.status === 'trial' && timeRemaining && (
              <span className="text-orange-500 font-semibold">
                {timeRemaining} in your free trial
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefits */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              What you'll get with a paid plan:
            </h3>
            <ul className="grid md:grid-cols-2 gap-2 text-sm">
              <li>✅ Unlimited products & inventory</li>
              <li>✅ Unlimited invoices & quotes</li>
              <li>✅ Advanced AI business insights</li>
              <li>✅ Smart automated notifications</li>
              <li>✅ Priority customer support</li>
              <li>✅ Export data to CSV</li>
            </ul>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <Card 
                key={plan.name}
                className={plan.popular ? "border-primary shadow-lg" : ""}
              >
                <CardContent className="p-6 space-y-4">
                  {plan.badge && (
                    <div className="inline-block bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {plan.badge}
                    </div>
                  )}
                  {plan.popular && (
                    <div className="inline-block bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <div className="text-3xl font-bold mt-2">
                      <span className="text-muted-foreground text-lg">BDT </span>
                      {plan.priceBDT}
                      <span className="text-sm font-normal text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      or {plan.priceUSD} USD{plan.period}
                    </div>
                  </div>

                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => {
                      onClose();
                      navigate("/billing");
                    }}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Choose {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>All plans include 7-day free trial • Cancel anytime</p>
            <Button variant="ghost" onClick={onClose}>
              Continue with trial
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};