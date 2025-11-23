import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SubscriptionRoute } from "@/components/auth/SubscriptionRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Clients from "./pages/Clients";
import ClientNew from "./pages/ClientNew";
import ClientDetail from "./pages/ClientDetail";
import ClientEdit from "./pages/ClientEdit";
import Products from "./pages/Products";
import ProductNew from "./pages/ProductNew";
import ProductDetail from "./pages/ProductDetail";
import ProductEdit from "./pages/ProductEdit";
import Invoices from "./pages/Invoices";
import InvoiceNew from "./pages/InvoiceNew";
import InvoiceDetail from "./pages/InvoiceDetail";
import InvoiceEdit from "./pages/InvoiceEdit";
import Payments from "./pages/Payments";
import PaymentNew from "./pages/PaymentNew";
import PaymentDetail from "./pages/PaymentDetail";
import Settings from "./pages/Settings";
import ImportData from "./pages/ImportData";
import Quotes from "./pages/Quotes";
import QuoteNew from "./pages/QuoteNew";
import QuoteDetail from "./pages/QuoteDetail";
import QuoteEdit from "./pages/QuoteEdit";
import Expenses from "./pages/Expenses";
import ExpenseNew from "./pages/ExpenseNew";
import ExpenseDetail from "./pages/ExpenseDetail";
import ExpenseEdit from "./pages/ExpenseEdit";
import Projects from "./pages/Projects";
import ProjectNew from "./pages/ProjectNew";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectEdit from "./pages/ProjectEdit";
import Profile from "./pages/Profile";
import ActivityLog from "./pages/ActivityLog";
import ClientPortal from "./pages/ClientPortal";
import Automation from "./pages/Automation";
import Webhooks from "./pages/Webhooks";
import Billing from "./pages/Billing";
import DashboardSettings from "./pages/DashboardSettings";
import APIKeys from "./pages/APIKeys";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

// Lazy load heavy pages for better performance
const Reports = lazy(() => import("./pages/Reports"));
const AdminSubscriptions = lazy(() => import("./pages/admin/Subscriptions"));
const PlatformSettings = lazy(() => import("./pages/admin/PlatformSettings"));
const DomainManagement = lazy(() => import("./pages/admin/DomainManagement"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const CustomDomain = lazy(() => import("./pages/CustomDomain"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><SubscriptionRoute><Dashboard /></SubscriptionRoute></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/clients/new" element={<ProtectedRoute><ClientNew /></ProtectedRoute>} />
            <Route path="/clients/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
            <Route path="/clients/:id/edit" element={<ProtectedRoute><ClientEdit /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/products/new" element={<ProtectedRoute><ProductNew /></ProtectedRoute>} />
            <Route path="/products/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
            <Route path="/products/:id/edit" element={<ProtectedRoute><ProductEdit /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
            <Route path="/invoices/new" element={<ProtectedRoute><InvoiceNew /></ProtectedRoute>} />
            <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetail /></ProtectedRoute>} />
            <Route path="/invoices/:id/edit" element={<ProtectedRoute><InvoiceEdit /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/payments/new" element={<ProtectedRoute><PaymentNew /></ProtectedRoute>} />
            <Route path="/payments/:id" element={<ProtectedRoute><PaymentDetail /></ProtectedRoute>} />
            <Route path="/quotes" element={<ProtectedRoute><Quotes /></ProtectedRoute>} />
            <Route path="/quotes/new" element={<ProtectedRoute><QuoteNew /></ProtectedRoute>} />
            <Route path="/quotes/:id" element={<ProtectedRoute><QuoteDetail /></ProtectedRoute>} />
            <Route path="/quotes/:id/edit" element={<ProtectedRoute><QuoteEdit /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
            <Route path="/expenses/new" element={<ProtectedRoute><ExpenseNew /></ProtectedRoute>} />
            <Route path="/expenses/:id" element={<ProtectedRoute><ExpenseDetail /></ProtectedRoute>} />
            <Route path="/expenses/:id/edit" element={<ProtectedRoute><ExpenseEdit /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/projects/new" element={<ProtectedRoute><ProjectNew /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
            <Route path="/projects/:id/edit" element={<ProtectedRoute><ProjectEdit /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Suspense fallback={<Skeleton className="h-screen w-full" />}><Reports /></Suspense></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/import" element={<ProtectedRoute><ImportData /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/activity-log" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
            <Route path="/automation" element={<ProtectedRoute><Automation /></ProtectedRoute>} />
            <Route path="/webhooks" element={<ProtectedRoute><Webhooks /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            <Route path="/dashboard-settings" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
            <Route path="/api-keys" element={<ProtectedRoute><APIKeys /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><SubscriptionRoute><Notifications /></SubscriptionRoute></ProtectedRoute>} />
            
            {/* Admin Routes - Lazy Loaded */}
            <Route path="/admin/subscriptions" element={<ProtectedRoute><Suspense fallback={<Skeleton className="h-screen w-full" />}><AdminSubscriptions /></Suspense></ProtectedRoute>} />
            <Route path="/admin/platform-settings" element={<ProtectedRoute><Suspense fallback={<Skeleton className="h-screen w-full" />}><PlatformSettings /></Suspense></ProtectedRoute>} />
            <Route path="/admin/domains" element={<ProtectedRoute><Suspense fallback={<Skeleton className="h-screen w-full" />}><DomainManagement /></Suspense></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><Suspense fallback={<Skeleton className="h-screen w-full" />}><AdminUsers /></Suspense></ProtectedRoute>} />
            <Route path="/custom-domain" element={<ProtectedRoute><Suspense fallback={<Skeleton className="h-screen w-full" />}><CustomDomain /></Suspense></ProtectedRoute>} />
            
            <Route path="/client-portal" element={<ClientPortal />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
