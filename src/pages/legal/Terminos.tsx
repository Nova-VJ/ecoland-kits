import { motion } from 'framer-motion';

const Terminos = () => {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container-eco max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-4xl font-bold mb-8">Términos y Condiciones de Compra</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Información general</h2>
              <p className="text-muted-foreground">
                Las presentes condiciones generales de venta regulan la relación contractual de compraventa entre Ecoland S.L. (en adelante, "Ecoland") y el usuario o cliente que realice una compra a través de la tienda online www.ecoland.es.
              </p>
              <p className="text-muted-foreground mt-4">
                Al realizar un pedido, el cliente declara haber leído y aceptado estas condiciones generales de venta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Productos</h2>
              <p className="text-muted-foreground">
                Los productos ofrecidos en nuestra tienda online son productos ecológicos certificados. Las fotografías y descripciones de los productos se realizan con la mayor precisión posible, pero pueden existir ligeras diferencias con el producto real.
              </p>
              <p className="text-muted-foreground mt-4">
                Todos los precios incluyen IVA y se expresan en euros (€). Los gastos de envío se calcularán en el proceso de compra antes de confirmar el pedido.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Proceso de compra</h2>
              <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
                <li>Seleccione los productos y añádalos al carrito</li>
                <li>Revise su carrito y proceda al checkout</li>
                <li>Introduzca sus datos de envío y facturación</li>
                <li>Seleccione el método de pago y confirme el pedido</li>
                <li>Recibirá un email de confirmación con los detalles del pedido</li>
              </ol>
              <p className="text-muted-foreground mt-4">
                El contrato de compraventa se perfecciona en el momento en que el cliente recibe la confirmación del pedido por email.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Métodos de pago</h2>
              <p className="text-muted-foreground">
                Aceptamos los siguientes métodos de pago:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li>Tarjeta de crédito/débito (Visa, Mastercard)</li>
                <li>PayPal</li>
                <li>Transferencia bancaria</li>
                <li>Bizum</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Todos los pagos se procesan de forma segura a través de pasarelas de pago certificadas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Envíos</h2>
              <h3 className="text-xl font-semibold mt-6 mb-3">Plazos de entrega</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Península:</strong> 2-4 días laborables</li>
                <li><strong>Baleares:</strong> 4-6 días laborables</li>
                <li><strong>Canarias, Ceuta y Melilla:</strong> 7-10 días laborables</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Costes de envío</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Península:</strong> 4,90€ (gratis a partir de 49€)</li>
                <li><strong>Baleares:</strong> 8,90€ (gratis a partir de 85€, solo no perecederos)</li>
                <li><strong>Canarias, Ceuta y Melilla:</strong> Consultar</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Recogida en tienda</h3>
              <p className="text-muted-foreground">
                También puede recoger su pedido en nuestra tienda física sin coste adicional. Le notificaremos cuando esté listo para recoger.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Derecho de desistimiento</h2>
              <p className="text-muted-foreground">
                De acuerdo con la legislación vigente, el cliente tiene derecho a desistir del contrato en un plazo de 14 días naturales desde la recepción del producto, sin necesidad de justificación.
              </p>
              <p className="text-muted-foreground mt-4">
                <strong>Excepciones:</strong> No se admiten devoluciones de productos alimentarios perecederos, productos precintados que hayan sido desprecintados tras la entrega, o productos personalizados.
              </p>
              <p className="text-muted-foreground mt-4">
                Para ejercer el derecho de desistimiento, debe notificárnoslo a devoluciones@ecoland.es indicando su número de pedido.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Devoluciones y reembolsos</h2>
              <p className="text-muted-foreground">
                Una vez recibido el producto devuelto y comprobado su estado, procederemos al reembolso en un plazo máximo de 14 días utilizando el mismo método de pago empleado en la compra.
              </p>
              <p className="text-muted-foreground mt-4">
                Los costes de devolución correrán a cargo del cliente, salvo que el producto esté defectuoso o no corresponda con lo solicitado.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Garantía</h2>
              <p className="text-muted-foreground">
                Todos nuestros productos cuentan con la garantía legal de 3 años establecida por la normativa española. Si detecta algún defecto en el producto, contacte con nosotros en garantias@ecoland.es.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">9. Suscripciones</h2>
              <p className="text-muted-foreground">
                Al suscribirse a nuestros packs:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li>Recibirá un 10% de descuento en cada envío</li>
                <li>El cargo se realizará automáticamente cada mes</li>
                <li>Puede pausar, modificar o cancelar su suscripción en cualquier momento desde su cuenta</li>
                <li>Los cambios deben realizarse con al menos 48 horas de antelación al próximo envío</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">10. Atención al cliente</h2>
              <p className="text-muted-foreground">
                Para cualquier consulta, puede contactarnos a través de:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li><strong>Email:</strong> info@ecoland.es</li>
                <li><strong>Teléfono:</strong> +34 912 345 678</li>
                <li><strong>WhatsApp:</strong> +34 612 345 678</li>
                <li><strong>Horario:</strong> Lunes a Viernes de 9:00 a 18:00</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">11. Resolución de conflictos</h2>
              <p className="text-muted-foreground">
                En caso de controversia, el cliente puede acudir a la plataforma de resolución de litigios en línea de la Unión Europea:{' '}
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  https://ec.europa.eu/consumers/odr
                </a>
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

export default Terminos;
