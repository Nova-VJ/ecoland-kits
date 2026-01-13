import { motion } from 'framer-motion';

const AvisoLegal = () => {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container-eco max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-4xl font-bold mb-8">Aviso Legal</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Datos identificativos</h2>
              <p className="text-muted-foreground">
                En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSICE), a continuación se reflejan los siguientes datos:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li><strong>Denominación social:</strong> Ecoland S.L.</li>
                <li><strong>CIF:</strong> B12345678</li>
                <li><strong>Domicilio social:</strong> Calle Ejemplo, 123, 28001 Madrid, España</li>
                <li><strong>Teléfono:</strong> +34 912 345 678</li>
                <li><strong>Email:</strong> info@ecoland.es</li>
                <li><strong>Inscrita en el Registro Mercantil de:</strong> Madrid, Tomo XXXX, Folio XX, Hoja M-XXXXX</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Objeto</h2>
              <p className="text-muted-foreground">
                El presente aviso legal regula el uso y utilización del sitio web www.ecoland.es, del que es titular Ecoland S.L. (en adelante, EL PROPIETARIO DE LA WEB).
              </p>
              <p className="text-muted-foreground mt-4">
                La navegación por el sitio web de EL PROPIETARIO DE LA WEB atribuye la condición de USUARIO del mismo y conlleva su aceptación plena y sin reservas de todas y cada una de las disposiciones incluidas en este Aviso Legal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Condiciones de acceso y utilización</h2>
              <p className="text-muted-foreground">
                El sitio web y sus servicios son de acceso libre y gratuito. No obstante, EL PROPIETARIO DE LA WEB puede condicionar la utilización de algunos de los servicios ofrecidos en su web a la previa cumplimentación del correspondiente formulario.
              </p>
              <p className="text-muted-foreground mt-4">
                El usuario garantiza la autenticidad y actualidad de todos aquellos datos que comunique a EL PROPIETARIO DE LA WEB y será el único responsable de las manifestaciones falsas o inexactas que realice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Propiedad intelectual e industrial</h2>
              <p className="text-muted-foreground">
                El sitio web, incluyendo a título enunciativo pero no limitativo su programación, edición, compilación y demás elementos necesarios para su funcionamiento, los diseños, logotipos, texto y/o gráficos, son propiedad de EL PROPIETARIO DE LA WEB o, en su caso, dispone de licencia o autorización expresa por parte de los autores.
              </p>
              <p className="text-muted-foreground mt-4">
                Todos los contenidos del sitio web se encuentran debidamente protegidos por la normativa de propiedad intelectual e industrial.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Exclusión de garantías y responsabilidad</h2>
              <p className="text-muted-foreground">
                EL PROPIETARIO DE LA WEB no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, a título enunciativo: por errores u omisiones en los contenidos, por falta de disponibilidad del portal, o por la transmisión de virus o programas maliciosos en los contenidos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Modificaciones</h2>
              <p className="text-muted-foreground">
                EL PROPIETARIO DE LA WEB se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través de la misma como la forma en la que éstos aparezcan presentados o localizados en su portal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Legislación aplicable y jurisdicción</h2>
              <p className="text-muted-foreground">
                Para la resolución de todas las controversias o cuestiones relacionadas con el presente sitio web o de las actividades en él desarrolladas, será de aplicación la legislación española, a la que se someten expresamente las partes, siendo competentes para la resolución de todos los conflictos derivados o relacionados con su uso los Juzgados y Tribunales más cercanos a Madrid.
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

export default AvisoLegal;
