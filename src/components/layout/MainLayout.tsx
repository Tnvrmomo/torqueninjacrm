import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AIAssistant } from "@/components/ai/AIAssistant";
import NotificationBell from "@/components/notifications/NotificationBell";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  FileCheck, 
  CreditCard, 
  Receipt, 
  FolderKanban,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Webhook,
  Key,
  Zap,
  Shield,
  Globe,
  UserCog,
  DollarSign,
  ChevronDown,
  Crosshair,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get user email
  supabase.auth.getUser().then(({ data }) => {
    if (data.user?.email && !userEmail) {
      setUserEmail(data.user.email);
    }
  });

  // Check if user is super admin
  const { data: isSuperAdmin } = useQuery({
    queryKey: ["isSuperAdmin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .maybeSingle();
      
      return !!data;
    },
  });

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Products", href: "/products", icon: Package },
    { name: "Invoices", href: "/invoices", icon: FileText },
    { name: "Recurring", href: "/recurring-invoices", icon: Zap },
    { name: "Quotes", href: "/quotes", icon: FileCheck },
    { name: "Payments", href: "/payments", icon: CreditCard },
    { name: "Expenses", href: "/expenses", icon: Receipt },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Leads", href: "/leads", icon: Crosshair },
    { name: "Campaigns", href: "/campaigns", icon: Mail },
    { name: "AI Usage", href: "/ai-usage", icon: BarChart3 },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Automation", href: "/automation", icon: Zap },
    { name: "Webhooks", href: "/webhooks", icon: Webhook },
    { name: "API Keys", href: "/api-keys", icon: Key },
    { name: "Invoice Settings", href: "/invoice-settings", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const adminNavigation = [
    { name: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: UserCog },
    { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
    { name: "Platform Settings", href: "/admin/platform-settings", icon: Shield },
    { name: "Invoice Templates", href: "/admin/invoice-templates", icon: FileText },
    { name: "Domains", href: "/admin/domains", icon: Globe },
    { name: "API Keys", href: "/admin/api-keys", icon: Key },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Payment Gateways", href: "/admin/payment-gateways", icon: DollarSign },
    { name: "Reset User Password", href: "/admin/password-reset", icon: Key },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card shadow-sm">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X /> : <Menu />}
            </Button>
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Torque Stickers" className="h-10" />
              <span className="text-xl font-bold text-foreground hidden sm:block">
                Torque Stickers
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {userEmail?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isSuperAdmin && (
                    <Badge variant="destructive" className="text-xs px-2 py-0">ADMIN</Badge>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 border-r border-border bg-sidebar transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <nav className="space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            
            {isSuperAdmin && (
              <>
                <Separator className="my-4" />
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                  ADMIN
                </div>
                {adminNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <EmailVerificationBanner />
          {children}
        </main>
      </div>
      <AIAssistant />
    </div>
  );
};

export default MainLayout;
