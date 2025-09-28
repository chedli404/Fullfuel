import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { PayPalProvider } from "@/contexts/PayPalContext";
import { CartDrawer } from "@/components/ui/cart/CartDrawer";
import { MusicPlayerProvider } from "@/components/MusicPlayerProvider";
import { Suspense, lazy } from "react";

// Lazy load pages for better performance
const HomePage = lazy(() => import("@/pages/HomePage"));
const VideosPage = lazy(() => import("@/pages/VideosPage"));
const EventsPage = lazy(() => import("@/pages/EventsPage"));
const MusicPage = lazy(() => import("@/pages/MusicPage"));
const GalleryPage = lazy(() => import("@/pages/GalleryPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const VideoDetailPage = lazy(() => import("@/pages/VideoDetailPage"));
const EventDetailPage = lazy(() => import("@/pages/EventDetailPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const ShopPage = lazy(() => import("@/pages/ShopPage"));
const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const CheckoutSuccessPage = lazy(() => import("@/pages/CheckoutSuccessPage"));
const NotFound = lazy(() => import("@/pages/not-found"));
const VerifyEmailPage = lazy(() => import("@/pages/verify"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
      <p className="text-white">Loading...</p>
    </div>
  </div>
);


function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/videos" component={VideosPage} />
        <Route path="/videos/:id" component={VideoDetailPage} />
        <Route path="/events" component={EventsPage} />
        <Route path="/events/:id" component={EventDetailPage} />
        <Route path="/music" component={MusicPage} />
        <Route path="/gallery" component={GalleryPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/profile" component={ProfilePage} />
        {/* Shop routes */}
        <Route path="/shop" component={ShopPage} />
        <Route path="/shop/:id" component={ProductDetailPage} />
        <Route path="/shop/products/:id" component={ProductDetailPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/checkout-success" component={CheckoutSuccessPage} />
        {/* Admin routes */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        {/* Email verification routes */}
        <Route path="/verify" component={VerifyEmailPage} />
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <PayPalProvider>
            <MusicPlayerProvider>
              <Router />
              <CartDrawer />
              <Toaster />
            </MusicPlayerProvider>
          </PayPalProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
