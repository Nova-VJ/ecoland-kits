import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { HealthProfileProvider } from "@/context/HealthProfileContext";
import { Layout } from "@/components/layout/Layout";
import { IntroSplash } from "@/components/IntroSplash";
import { CookieConsent } from "@/components/CookieConsent";
import { WelcomeOnboardingModal } from "@/components/common/WelcomeOnboardingModal";
import Index from "./pages/Index";
import Packs from "./pages/Packs";
import PackDetail from "./pages/PackDetail";
import Blog from "./pages/Blog";
import RecipeDetail from "./pages/RecipeDetail";
import Quiz from "./pages/Quiz";
import Suscripcion from "./pages/Suscripcion";
import Club from "./pages/Club";
import Tienda from "./pages/Tienda";
import EcoHealth from "./pages/EcoHealth";
import Salud from "./pages/Salud";
import SectionHub from "./pages/SectionHub";
import ProductDetail from "./pages/ProductDetail";
import CatalogProductDetail from "./pages/CatalogProductDetail";
import CatalogPackDetail from "./pages/CatalogPackDetail";
import Checkout from "./pages/Checkout";
import DondeEstamos from "./pages/DondeEstamos";
import ImportanciaMision from "./pages/ImportanciaMision";
import Login from "./pages/auth/Login";
import Registro from "./pages/auth/Registro";
import Cuenta from "./pages/auth/Cuenta";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductInsights from "./pages/admin/ProductInsights";
import AvisoLegal from "./pages/legal/AvisoLegal";
import Privacidad from "./pages/legal/Privacidad";
import Cookies from "./pages/legal/Cookies";
import Terminos from "./pages/legal/Terminos";
import EcolandHoy from "./pages/EcolandHoy";
import MiSemana from "./pages/MiSemana";
import EcoCoach from "./pages/EcoCoach";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const splashSeen = sessionStorage.getItem('ecoland-splash-seen');
    if (!splashSeen) {
      setShowSplash(true);
      sessionStorage.setItem('ecoland-splash-seen', 'true');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <CatalogProvider>
            <CartProvider>
            <HealthProfileProvider>
              <Toaster />
              <Sonner />
              {showSplash && <IntroSplash onComplete={() => setShowSplash(false)} />}
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/hoy" element={<EcolandHoy />} />
                  <Route path="/semana" element={<MiSemana />} />
                  <Route path="/coach" element={<EcoCoach />} />
                  <Route path="/packs" element={<Packs />} />
                  <Route path="/packs/:slug" element={<PackDetail />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<RecipeDetail />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/suscripcion" element={<Suscripcion />} />
                  <Route path="/club" element={<Club />} />
                  <Route path="/tienda" element={<Tienda />} />
                  <Route path="/ecohealth" element={<EcoHealth />} />
                  <Route path="/salud" element={<Salud />} />
                  <Route path="/comprar" element={<SectionHub id="comprar" />} />
                  <Route path="/cocinar" element={<SectionHub id="cocinar" />} />
                  <Route path="/organizarme" element={<SectionHub id="organizarme" />} />
                  <Route path="/cuidarme" element={<SectionHub id="cuidarme" />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/tienda/:slug" element={<ProductDetail />} />
                  <Route path="/tienda/producto/:slug" element={<CatalogProductDetail />} />
                  <Route path="/tienda/pack/:slug" element={<CatalogPackDetail />} />
                  <Route path="/donde-estamos" element={<DondeEstamos />} />
                  <Route path="/importancia-y-mision" element={<ImportanciaMision />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/registro" element={<Registro />} />
                  <Route path="/cuenta" element={<Cuenta />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/product-insights" element={<ProductInsights />} />
                  <Route path="/aviso-legal" element={<AvisoLegal />} />
                  <Route path="/privacidad" element={<Privacidad />} />
                  <Route path="/cookies" element={<Cookies />} />
                  <Route path="/terminos" element={<Terminos />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
              <CookieConsent />
              <WelcomeOnboardingModal />
            </HealthProfileProvider>
            </CartProvider>
          </CatalogProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
