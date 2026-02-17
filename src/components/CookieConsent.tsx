import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  personalization: false,
};

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const consent = localStorage.getItem('ecoland-cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('ecoland-cookie-consent', JSON.stringify(prefs));
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => savePreferences({ necessary: true, analytics: true, marketing: true, personalization: true });
  const rejectAll = () => savePreferences({ ...defaultPreferences });
  const saveCustom = () => savePreferences(preferences);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4"
        >
          <div className="max-w-4xl mx-auto bg-card border rounded-2xl shadow-lg overflow-hidden">
            {!showSettings ? (
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <Cookie className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-lg mb-2">🍪 Uso de cookies</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el uso del sitio 
                      y personalizar contenido. Puedes aceptar todas, rechazarlas o configurar tus preferencias. 
                      Más información en nuestra{' '}
                      <Link to="/cookies" className="text-primary underline">Política de Cookies</Link> y{' '}
                      <Link to="/privacidad" className="text-primary underline">Política de Privacidad</Link>.
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Conforme al RGPD (Reglamento UE 2016/679) y la LSSI-CE (Ley 34/2002), adaptado a las directrices de la AEPD.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={acceptAll} className="bg-primary text-primary-foreground">
                        <Check className="h-4 w-4 mr-2" /> Aceptar todas
                      </Button>
                      <Button variant="outline" onClick={rejectAll}>
                        <X className="h-4 w-4 mr-2" /> Rechazar todas
                      </Button>
                      <Button variant="ghost" onClick={() => setShowSettings(true)}>
                        <Settings className="h-4 w-4 mr-2" /> Configurar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-lg">Configurar cookies</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">Necesarias</p>
                      <p className="text-xs text-muted-foreground">Imprescindibles para el funcionamiento del sitio</p>
                    </div>
                    <Switch checked disabled />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">Analíticas</p>
                      <p className="text-xs text-muted-foreground">Nos ayudan a entender cómo usas el sitio</p>
                    </div>
                    <Switch
                      checked={preferences.analytics}
                      onCheckedChange={(v) => setPreferences(p => ({ ...p, analytics: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">Marketing</p>
                      <p className="text-xs text-muted-foreground">Permiten mostrarte publicidad relevante</p>
                    </div>
                    <Switch
                      checked={preferences.marketing}
                      onCheckedChange={(v) => setPreferences(p => ({ ...p, marketing: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">Personalización</p>
                      <p className="text-xs text-muted-foreground">Adaptamos la experiencia a tus preferencias</p>
                    </div>
                    <Switch
                      checked={preferences.personalization}
                      onCheckedChange={(v) => setPreferences(p => ({ ...p, personalization: v }))}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={saveCustom} className="bg-primary text-primary-foreground">
                    Guardar preferencias
                  </Button>
                  <Button variant="outline" onClick={acceptAll}>Aceptar todas</Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
