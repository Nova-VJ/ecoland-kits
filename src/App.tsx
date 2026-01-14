import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { Layout } from "@/components/layout/Layout";
import { IntroSplash } from "@/components/IntroSplash";
import Index from "./pages/Index";
import Packs from "./pages/Packs";
import PackDetail from "./pages/PackDetail";
import Blog from "./pages/Blog";
import RecipeDetail from "./pages/RecipeDetail";
import Quiz from "./pages/Quiz";
import Suscripcion from "./pages/Suscripcion";
import Club from "./pages/Club";
import Tienda from "./pages/Tienda";
import ProductDetail from "./pages/ProductDetail";
import DondeEstamos from "./pages/DondeEstamos";
import Login from "./pages/auth/Login";
import Registro from "./pages/auth/Registro";
import Cuenta from "./pages/auth/Cuenta";
import AvisoLegal from "./pages/legal/AvisoLegal";
import Privacidad from "./pages/legal/Privacidad";
import Cookies from "./pages/legal/Cookies";
import Terminos from "./pages/legal/Terminos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    // Check if intro was already shown
    const introShown = sessionStorage.getItem('ecoland-intro-shown');
    if (introShown) {
      setShowIntro(false);
      setIntroComplete(true);
    }
  }, []);

  const handleIntroComplete = () => {
    setIntroComplete(true);
    setTimeout(() => setShowIntro(false), 500);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          
          {showIntro && !introComplete && (
            <IntroSplash onComplete={handleIntroComplete} />
          )}
          
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/packs" element={<Packs />} />
                <Route path="/packs/:slug" element={<PackDetail />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<RecipeDetail />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/suscripcion" element={<Suscripcion />} />
                <Route path="/club" element={<Club />} />
                <Route path="/tienda" element={<Tienda />} />
                <Route path="/tienda/:slug" element={<ProductDetail />} />
                <Route path="/donde-estamos" element={<DondeEstamos />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/cuenta" element={<Cuenta />} />
                <Route path="/aviso-legal" element={<AvisoLegal />} />
                <Route path="/privacidad" element={<Privacidad />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/terminos" element={<Terminos />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
};

export default App;
