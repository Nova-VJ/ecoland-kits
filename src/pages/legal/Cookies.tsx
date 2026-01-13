import { motion } from 'framer-motion';

const Cookies = () => {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container-eco max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-4xl font-bold mb-8">Política de Cookies</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. ¿Qué son las cookies?</h2>
              <p className="text-muted-foreground">
                Las cookies son pequeños archivos de texto que los sitios web almacenan en su dispositivo (ordenador, tablet, teléfono móvil) cuando los visita. Estas cookies permiten que el sitio web recuerde sus acciones y preferencias durante un período de tiempo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">2. ¿Qué cookies utilizamos?</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Cookies técnicas (necesarias)</h3>
              <p className="text-muted-foreground">
                Son esenciales para el funcionamiento del sitio web. Sin ellas, el sitio no funcionaría correctamente.
              </p>
              <div className="bg-muted/30 rounded-xl p-4 mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie</th>
                      <th className="text-left py-2">Finalidad</th>
                      <th className="text-left py-2">Duración</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-2">session_id</td>
                      <td className="py-2">Mantener la sesión del usuario</td>
                      <td className="py-2">Sesión</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">cart</td>
                      <td className="py-2">Guardar el carrito de compra</td>
                      <td className="py-2">30 días</td>
                    </tr>
                    <tr>
                      <td className="py-2">cookie_consent</td>
                      <td className="py-2">Recordar preferencias de cookies</td>
                      <td className="py-2">1 año</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">Cookies analíticas</h3>
              <p className="text-muted-foreground">
                Nos permiten analizar el comportamiento de los usuarios para mejorar nuestra web.
              </p>
              <div className="bg-muted/30 rounded-xl p-4 mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie</th>
                      <th className="text-left py-2">Finalidad</th>
                      <th className="text-left py-2">Duración</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-2">_ga</td>
                      <td className="py-2">Google Analytics - Distinguir usuarios</td>
                      <td className="py-2">2 años</td>
                    </tr>
                    <tr>
                      <td className="py-2">_gid</td>
                      <td className="py-2">Google Analytics - Distinguir usuarios</td>
                      <td className="py-2">24 horas</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">Cookies de marketing</h3>
              <p className="text-muted-foreground">
                Se utilizan para mostrar anuncios relevantes y medir la efectividad de las campañas publicitarias.
              </p>
              <div className="bg-muted/30 rounded-xl p-4 mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie</th>
                      <th className="text-left py-2">Finalidad</th>
                      <th className="text-left py-2">Duración</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr>
                      <td className="py-2">_fbp</td>
                      <td className="py-2">Facebook Pixel - Seguimiento de conversiones</td>
                      <td className="py-2">3 meses</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">3. ¿Cómo gestionar las cookies?</h2>
              <p className="text-muted-foreground">
                Puede configurar su navegador para rechazar todas las cookies o para que le avise cuando se envía una cookie. Sin embargo, si rechaza las cookies, es posible que algunas partes de nuestro sitio no funcionen correctamente.
              </p>
              <p className="text-muted-foreground mt-4">
                A continuación le indicamos cómo gestionar las cookies en los navegadores más comunes:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
                <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Actualización de la política</h2>
              <p className="text-muted-foreground">
                Esta política de cookies puede ser actualizada en cualquier momento para adaptarse a cambios legislativos o a modificaciones en el uso de cookies. Le recomendamos revisar esta política periódicamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Contacto</h2>
              <p className="text-muted-foreground">
                Si tiene alguna pregunta sobre nuestra política de cookies, puede contactarnos en privacidad@ecoland.es.
              </p>
            </section>

            <p className="text-sm text-muted-foreground mt-12">
              Última actualización: Enero 2024
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cookies;
