import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  FileText, 
  Receipt, 
  Users, 
  Building2,
  BarChart3,
  Bell,
  MessageSquare,
  Check,
  Zap,
  Shield,
  TrendingUp
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Package,
      title: "Inventory Management",
      description: "Track stock levels, get low stock alerts, and manage your products efficiently"
    },
    {
      icon: FileText,
      title: "Quotation System",
      description: "Create professional quotes quickly and convert them to invoices seamlessly"
    },
    {
      icon: Receipt,
      title: "Invoice Management",
      description: "Generate, send, and track invoices with automated reminders"
    },
    {
      icon: Building2,
      title: "Vendor Management",
      description: "Manage supplier relationships and track purchase orders"
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Centralize customer data and track their purchase history"
    },
    {
      icon: BarChart3,
      title: "Business Analytics",
      description: "AI-powered insights on sales trends, inventory, and business performance"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Automated alerts for low stock, overdue invoices, and sales opportunities"
    },
    {
      icon: MessageSquare,
      title: "AI Assistant",
      description: "Ask questions about your data and get instant answers and recommendations"
    }
  ];

  const plans = [
    {
      name: "Starter",
      priceBDT: "৳2,500",
      priceUSD: "$25",
      period: "/month",
      features: [
        "Up to 100 products",
        "50 invoices/month",
        "Basic analytics",
        "Email support"
      ]
    },
    {
      name: "Professional",
      priceBDT: "৳5,000",
      priceUSD: "$50",
      period: "/month",
      popular: true,
      features: [
        "Unlimited products",
        "Unlimited invoices",
        "Advanced AI analytics",
        "Smart notifications",
        "AI assistant (1,000 queries/month)",
        "Priority support"
      ]
    },
    {
      name: "Lifetime",
      priceBDT: "৳10,000",
      priceUSD: "$100",
      period: "one-time",
      features: [
        "Everything in Professional",
        "Unlimited AI queries",
        "Lifetime updates",
        "Premium support",
        "No recurring fees"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="TorqueNinja" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold">TorqueNinja</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button className="gradient-primary" onClick={() => navigate("/signup")}>
              Start Free Trial
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-5xl md:text-6xl font-bold">
            Complete Business Management
            <span className="block text-primary mt-2">Powered by AI</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage inventory, create quotes & invoices, track customers & vendors, 
            and get AI-powered insights—all in one platform
          </p>
          
          {/* Demo Credentials Banner */}
          <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-6 max-w-md mx-auto">
            <p className="font-semibold text-primary mb-3 flex items-center justify-center gap-2">
              <Zap className="h-5 w-5" />
              Try Demo Account
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between bg-background/50 px-4 py-2 rounded">
                <span className="text-muted-foreground">Email:</span>
                <code className="font-mono font-semibold">demo@torqueninja.com</code>
              </div>
              <div className="flex items-center justify-between bg-background/50 px-4 py-2 rounded">
                <span className="text-muted-foreground">Password:</span>
                <code className="font-mono font-semibold">demo123456</code>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Full access to all features • Pre-loaded sample data
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button size="lg" className="gradient-primary shadow-primary text-lg px-8" onClick={() => navigate("/signup")}>
              <Zap className="mr-2 h-5 w-5" />
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => navigate("/login")}>
              Try Demo Account
            </Button>
          </div>
          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Secure & Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Real-time Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>No Credit Card Required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h3>
          <p className="text-muted-foreground text-lg">Comprehensive tools to run your business efficiently</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-primary transition-all duration-300 border-border">
              <feature.icon className="h-10 w-10 text-primary mb-4" />
              <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h3>
          <p className="text-muted-foreground text-lg">Choose the plan that fits your business needs</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`p-8 relative ${plan.popular ? 'border-primary shadow-primary' : 'border-border'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="text-center mb-6">
                <h4 className="text-2xl font-bold mb-4">{plan.name}</h4>
                <div className="space-y-1">
                  <div className="text-4xl font-bold text-primary">{plan.priceBDT}</div>
                  <div className="text-lg text-muted-foreground">{plan.priceUSD}</div>
                  <div className="text-sm text-muted-foreground">{plan.period}</div>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className={`w-full ${plan.popular ? 'gradient-primary' : ''}`}
                variant={plan.popular ? "default" : "outline"}
                onClick={() => navigate("/signup")}
              >
                Get Started
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Payment Methods */}
      <section className="container mx-auto px-4 py-12 border-t border-border">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">We accept all major payment methods</p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="font-semibold">Stripe</span>
            <span className="font-semibold">bKash</span>
            <span className="font-semibold">Nagad</span>
            <span className="font-semibold">Rocket</span>
            <span className="font-semibold">SSLCommerz</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="gradient-primary p-12 text-center text-primary-foreground">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Business?</h3>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of businesses using TorqueNinja to streamline operations and boost growth
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" onClick={() => navigate("/signup")}>
            Start Your Free Trial Now
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 TorqueNinja. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
