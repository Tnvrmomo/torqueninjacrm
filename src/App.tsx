import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SubscriptionRoute } from "@/components/auth/SubscriptionRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
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
import VerifyEmail from "./pages/VerifyEmail";
import VerifyPending from "./pages/VerifyPending";
import AIUsage from "./pages/AIUsage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";

// Lazy load heavy pages for better performance
const Reports = lazy(() => import("./pages/Reports"));
const AdminSubscriptions = lazy(() => import("./pages/admin/Subscriptions"));
const PlatformSettings = lazy(() => import("./pages/admin/PlatformSettings"));
const DomainManagement = lazy(() => import("./pages/admin/DomainManagement"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const CustomDomain = lazy(() => import("./pages/CustomDomain"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminAPIKeys = lazy(() => import("./pages/admin/APIKeysManagement"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminPaymentGateways = lazy(() => import("./pages/admin/PaymentGateways"));
const AdminUserPasswordReset = lazy(() => import("./pages/admin/UserPasswordReset"));

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
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/verify-pending" element={<VerifyPending />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/failure" element={<PaymentFailure />} />
              <Route path="/client-portal" element={<ClientPortal />} />
              
              {/* Protected Routes - Dashboard */}
              <Route path="/dashboard" element={<ProtectedRoute><SubscriptionRoute><Dashboard /></SubscriptionRoute></ProtectedRoute>} />
              
              {/* Protected Routes - Clients */}
              <Route path="/clients" element={<ProtectedRoute><SubscriptionRoute><Clients /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/clients/new" element={<ProtectedRoute><SubscriptionRoute><ClientNew /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/clients/:id" element={<ProtectedRoute><SubscriptionRoute><ClientDetail /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/clients/:id/edit" element={<ProtectedRoute><SubscriptionRoute><ClientEdit /></SubscriptionRoute></ProtectedRoute>} />
              
              {/* Protected Routes - Products */}
              <Route path="/products" element={<ProtectedRoute><SubscriptionRoute><Products /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/products/new" element={<ProtectedRoute><SubscriptionRoute><ProductNew /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/products/:id" element={<ProtectedRoute><SubscriptionRoute><ProductDetail /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/products/:id/edit" element={<ProtectedRoute><SubscriptionRoute><ProductEdit /></SubscriptionRoute></ProtectedRoute>} />
              
              {/* Protected Routes - Invoices */}
              <Route path="/invoices" element={<ProtectedRoute><SubscriptionRoute><Invoices /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/invoices/new" element={<ProtectedRoute><SubscriptionRoute><InvoiceNew /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/invoices/:id" element={<ProtectedRoute><SubscriptionRoute><InvoiceDetail /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/invoices/:id/edit" element={<ProtectedRoute><SubscriptionRoute><InvoiceEdit /></SubscriptionRoute></ProtectedRoute>} />
              
              {/* Protected Routes - Payments */}
              <Route path="/payments" element={<ProtectedRoute><SubscriptionRoute><Payments /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/payments/new" element={<ProtectedRoute><SubscriptionRoute><PaymentNew /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/payments/:id" element={<ProtectedRoute><SubscriptionRoute><PaymentDetail /></SubscriptionRoute></ProtectedRoute>} />
              
              {/* Protected Routes - Quotes */}
              <Route path="/quotes" element={<ProtectedRoute><SubscriptionRoute><Quotes /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/quotes/new" element={<ProtectedRoute><SubscriptionRoute><QuoteNew /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/quotes/:id" element={<ProtectedRoute><SubscriptionRoute><QuoteDetail /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/quotes/:id/edit" element={<ProtectedRoute><SubscriptionRoute><QuoteEdit /></SubscriptionRoute></ProtectedRoute>} />
              
              {/* Protected Routes - Expenses */}
              <Route path="/expenses" element={<ProtectedRoute><SubscriptionRoute><Expenses /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/expenses/new" element={<ProtectedRoute><SubscriptionRoute><ExpenseNew /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/expenses/:id" element={<ProtectedRoute><SubscriptionRoute><ExpenseDetail /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/expenses/:id/edit" element={<ProtectedRoute><SubscriptionRoute><ExpenseEdit /></SubscriptionRoute></ProtectedRoute>} />
              
              {/* Protected Routes - Projects */}
              <Route path="/projects" element={<ProtectedRoute><SubscriptionRoute><Projects /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/projects/new" element={<ProtectedRoute><SubscriptionRoute><ProjectNew /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/projects/:id" element={<ProtectedRoute><SubscriptionRoute><ProjectDetail /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/projects/:id/edit" element={<ProtectedRoute><SubscriptionRoute><ProjectEdit /></SubscriptionRoute></ProtectedRoute>} />
              
              {/* Protected Routes - Other Features */}
              <Route path="/reports" element={<ProtectedRoute><SubscriptionRoute><Suspense fallback={<Skeleton className="h-screen w-full" />}><Reports /></Suspense></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/automation" element={<ProtectedRoute><SubscriptionRoute><Automation /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/webhooks" element={<ProtectedRoute><SubscriptionRoute><Webhooks /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/api-keys" element={<ProtectedRoute><SubscriptionRoute><APIKeys /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><SubscriptionRoute><Notifications /></SubscriptionRoute></ProtectedRoute>} />
              <Route path="/ai-usage" element={<ProtectedRoute><SubscriptionRoute><AIUsage /></SubscriptionRoute></ProtectedRoute>} />
              
              {/* Protected Routes - Settings & Profile */}
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
              <Route path="/dashboard-settings" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
              <Route path="/import" element={<ProtectedRoute><ImportData /></ProtectedRoute>} />
              <Route path="/activity-log" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
              <Route path="/custom-domain" element={<ProtectedRoute><Suspense fallback={<Skeleton className="h-screen w-full" />}><CustomDomain /></Suspense></ProtectedRoute>} />
              
              {/* Admin Routes - Protected by AdminRoute */}
              <Route path="/admin" element={<AdminRoute><Suspense fallback={<Skeleton className="h-screen w-full" />}><AdminDashboard /></Suspense></AdminRoute>} />
              <Route path="/admin/subscriptions" element={<AdminRoute><Suspense fallback={<Skeleton className="h-screen w-full" />}><AdminSubscriptions /></Suspense></AdminRoute>} />
              <Route path="/admin/platform-settings" element={<AdminRoute><Suspense fallback={<Skeleton className="h-screen w-full" />}><PlatformSettings /></Suspense></AdminRoute>} />
              <Route path="/admin/domains" element={<AdminRoute><Suspense fallback={<Skeleton className="h-screen w-full" />}><DomainManagement /></Suspense></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><Suspense fallback={<Skeleton className="h-screen w-full" />}><AdminUsers /></Suspense></AdminRoute>} />
              <Route path="/admin/api-keys" element={<AdminRoute><Suspense fallback={<Skeleton className="h-screen w-full" />}><AdminAPIKeys /></Suspense></AdminRoute>} />
              <Route path="/admin/analytics" element={<AdminRoute><Suspense fallback={<Skeleton className="h-screen w-full" />}><AdminAnalytics /></Suspense></AdminRoute>} />
              <Route path="/admin/payment-gateways" element={<AdminRoute><Suspense fallback={<Skeleton className="h-screen w-full" />}><AdminPaymentGateways /></Suspense></AdminRoute>} />
              <Route path="/admin/password-reset" element={<AdminRoute><Suspense fallback={<Skeleton className="h-screen w-full" />}><AdminUserPasswordReset /></Suspense></AdminRoute>} />
              
              {/* 404 Catch-All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
