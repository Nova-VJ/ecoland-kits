import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';
import logoEcoland from '@/assets/logo-ecoland.jpg';
export const Footer = () => {
  return <footer className="bg-eco-dark text-primary-foreground">
      <div className="container-eco section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <img alt="Ecoland" className="h-16 w-auto brightness-110" src="/lovable-uploads/b139a0b4-df8f-4943-9f9e-13a41f2dc4e9.png" />
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Productos ecológicos seleccionados para tu bienestar y el del planeta. 
              Packs listos para cada objetivo.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-eco-soft transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-eco-soft transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-lg mb-4">Tienda</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/packs" className="hover:text-primary-foreground transition-colors">Packs</Link></li>
              <li><Link to="/tienda" className="hover:text-primary-foreground transition-colors">Productos</Link></li>
              <li><Link to="/suscripcion" className="hover:text-primary-foreground transition-colors">Suscripción</Link></li>
              <li><Link to="/club" className="hover:text-primary-foreground transition-colors">Club Eco</Link></li>
              <li><Link to="/quiz" className="hover:text-primary-foreground transition-colors">Test recomendador</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-display text-lg mb-4">Ecoland</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/donde-estamos" className="hover:text-primary-foreground transition-colors">Dónde estamos</Link></li>
              <li><Link to="/blog" className="hover:text-primary-foreground transition-colors">Blog & Recetas</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                hola@ecoland.es
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+34983084539" className="hover:text-primary-foreground transition-colors">
                  +34 983 08 45 39
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <a href="https://www.google.com/maps/place/Eco+Land/@41.6413866,-4.7308815,18z" target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors">
                  C. de Recondo, 7<br />
                  47007 Valladolid
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
            <p>© 2024 Ecoland. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <Link to="/aviso-legal" className="hover:text-primary-foreground transition-colors">Aviso legal</Link>
              <Link to="/privacidad" className="hover:text-primary-foreground transition-colors">Privacidad</Link>
              <Link to="/cookies" className="hover:text-primary-foreground transition-colors">Cookies</Link>
              <Link to="/terminos" className="hover:text-primary-foreground transition-colors">Términos</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};