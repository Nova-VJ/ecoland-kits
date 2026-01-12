import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import Packs from "./pages/Packs";
import PackDetail from "./pages/PackDetail";
import Blog from "./pages/Blog";
import RecipeDetail from "./pages/RecipeDetail";
import Quiz from "./pages/Quiz";
import Suscripcion from "./pages/Suscripcion";
import Club from "./pages/Club";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
