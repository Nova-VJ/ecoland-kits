import { motion } from 'framer-motion';

const Privacidad = () => {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container-eco max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-4xl font-bold mb-8">Política de Privacidad</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Información al usuario</h2>
              <p className="text-muted-foreground">
                Ecoland S.L., como Responsable del Tratamiento, le informa que, según lo dispuesto en el Reglamento (UE) 2016/679, de 27 de abril (RGPD) y en la L.O. 3/2018, de 5 de diciembre, de protección de datos y garantía de los derechos digitales (LOPDGDD), trataremos sus datos tal y como reflejamos en la presente Política de Privacidad.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Responsable del tratamiento</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Identidad:</strong> Ecoland S.L.</li>
                <li><strong>CIF:</strong> B12345678</li>
                <li><strong>Dirección:</strong> Calle Ejemplo, 123, 28001 Madrid, España</li>
                <li><strong>Teléfono:</strong> +34 912 345 678</li>
                <li><strong>Email:</strong> privacidad@ecoland.es</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Finalidad del tratamiento</h2>
              <p className="text-muted-foreground">Sus datos personales serán tratados para las siguientes finalidades:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li>Gestión de pedidos y entregas</li>
                <li>Gestión de suscripciones y membresías</li>
                <li>Atención al cliente y resolución de consultas</li>
                <li>Envío de comunicaciones comerciales (con su consentimiento)</li>
                <li>Cumplimiento de obligaciones legales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Legitimación del tratamiento</h2>
              <p className="text-muted-foreground">
                La base legal para el tratamiento de sus datos es:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li><strong>Ejecución de un contrato:</strong> Para gestionar su pedido y entregarle los productos</li>
                <li><strong>Consentimiento:</strong> Para el envío de comunicaciones comerciales</li>
                <li><strong>Interés legítimo:</strong> Para mejorar nuestros servicios y prevenir fraudes</li>
                <li><strong>Obligación legal:</strong> Para cumplir con obligaciones fiscales y legales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Conservación de los datos</h2>
              <p className="text-muted-foreground">
                Los datos personales proporcionados se conservarán mientras se mantenga la relación comercial o durante los años necesarios para cumplir con las obligaciones legales. Los datos para fines comerciales se conservarán hasta que revoque su consentimiento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Destinatarios de los datos</h2>
              <p className="text-muted-foreground">
                Sus datos podrán ser comunicados a:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li>Empresas de transporte para la entrega de pedidos</li>
                <li>Entidades bancarias para la gestión de pagos</li>
                <li>Administraciones públicas cuando exista obligación legal</li>
                <li>Proveedores de servicios tecnológicos (hosting, email marketing)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Derechos del interesado</h2>
              <p className="text-muted-foreground">
                Usted tiene derecho a:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li><strong>Acceso:</strong> Conocer qué datos tratamos sobre usted</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos</li>
                <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos</li>
                <li><strong>Limitación:</strong> Solicitar la limitación del tratamiento</li>
                <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Para ejercer estos derechos, puede contactarnos en privacidad@ecoland.es o por correo postal a nuestra dirección.
              </p>
              <p className="text-muted-foreground mt-4">
                También tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Seguridad de los datos</h2>
              <p className="text-muted-foreground">
                Hemos implementado medidas técnicas y organizativas apropiadas para garantizar un nivel de seguridad adecuado al riesgo, incluyendo cifrado de datos, control de acceso y copias de seguridad regulares.
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

export default Privacidad;
