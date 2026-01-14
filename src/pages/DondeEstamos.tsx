import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Navigation, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Store images
import entradaImg from '@/assets/store/entrada.png';
import interiorImg from '@/assets/store/interior.jpg';
import techoImg from '@/assets/store/techo.jpg';
import verdurasImg from '@/assets/store/verduras.jpg';
import especiasImg from '@/assets/store/especias.jpg';
import estantesImg from '@/assets/store/estantes.jpg';
import galletasImg from '@/assets/store/galletas.jpg';
import embutidosImg from '@/assets/store/embutidos.jpg';

// Certification logos
import euOrganicLogo from '@/assets/logos/eu-organic-logo.svg';
import castillaLeonLogo from '@/assets/logos/castilla-leon.svg';

const storeInfo = {
  name: 'Ecoland - Productos Ecológicos',
  address: 'C. Paulina Harriet, 4, 47006 Valladolid',
  phone: '+34 983 45 67 89',
  whatsapp: '+34 600 123 456',
  hours: [
    { day: 'Lunes - Viernes', time: '10:00 - 14:00 y 17:00 - 20:30' },
    { day: 'Sábado', time: '10:00 - 14:00' },
    { day: 'Domingo', time: 'Cerrado' },
  ],
  googleMapsUrl: 'https://www.google.com/maps/place/Ecoland+-+Productos+Ecol%C3%B3gicos/@41.6434236,-4.7212234,17z/data=!3m1!4b1!4m6!3m5!1s0xd4712de76e55555:0x6b0d8e45b63d53e4!8m2!3d41.6434196!4d-4.7186485!16s%2Fg%2F1td6njf8?entry=ttu',
  coordinates: { lat: 41.6434236, lng: -4.7186485 },
};

const reviews = [
  {
    author: 'María García',
    rating: 5,
    text: 'Excelente tienda de productos ecológicos. Gran variedad y calidad. El trato es muy cercano y te asesoran muy bien.',
    date: 'Hace 2 meses',
  },
  {
    author: 'Carlos Rodríguez',
    rating: 5,
    text: 'Llevan más de 15 años y se nota la experiencia. Productos frescos, locales y de confianza. ¡Muy recomendable!',
    date: 'Hace 1 mes',
  },
  {
    author: 'Ana Martín',
    rating: 5,
    text: 'Me encanta el granel y las especias. Los precios son justos para la calidad que ofrecen. Personal muy amable.',
    date: 'Hace 3 semanas',
  },
  {
    author: 'Pedro López',
    rating: 5,
    text: 'Tienda de referencia en Valladolid para productos bio. Tienen de todo: frescos, conservas, cosmética natural...',
    date: 'Hace 1 semana',
  },
];

const storePhotos = [
  { src: entradaImg, alt: 'Entrada del local Ecoland', featured: true },
  { src: interiorImg, alt: 'Interior de la tienda' },
  { src: techoImg, alt: 'Detalle del techo de madera' },
  { src: verdurasImg, alt: 'Sección de verduras frescas' },
  { src: especiasImg, alt: 'Zona de especias a granel' },
  { src: estantesImg, alt: 'Estantes con productos ecológicos' },
  { src: galletasImg, alt: 'Galletas artesanales ecológicas' },
  { src: embutidosImg, alt: 'Embutidos ecológicos' },
];

const DondeEstamos = () => {
  const openMaps = () => {
    // Deep link for mobile maps apps
    const { lat, lng } = storeInfo.coordinates;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      window.open(`maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`);
    } else if (isAndroid) {
      window.open(`google.navigation:q=${lat},${lng}`);
    } else {
      window.open(storeInfo.googleMapsUrl, '_blank');
    }
  };

  return (
    <div className="section-padding">
      <div className="container-eco">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="eco-badge inline-flex gap-2 mb-4">
            <MapPin className="w-4 h-4" />
            Visítanos
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Dónde Estamos
          </h1>
          <p className="text-xl text-muted-foreground">
            Más de 15 años en Valladolid ofreciendo productos ecológicos de calidad
          </p>
        </motion.div>

        {/* Certification Badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center items-center gap-6 mb-12 p-6 bg-primary/5 rounded-2xl"
        >
          <div className="flex items-center gap-4">
            <img src={euOrganicLogo} alt="Certificación Ecológica UE" className="h-16 w-auto" />
            <img src={castillaLeonLogo} alt="Castilla y León" className="h-12 w-auto rounded" />
          </div>
          <p className="text-lg font-medium text-primary">
            Solo productos de certificación ecológica
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Map & Location */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Interactive Map */}
            <div className="relative rounded-2xl overflow-hidden bg-muted aspect-[4/3]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2979.058!2d-4.7212234!3d41.6434236!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd4712de76e55555%3A0x6b0d8e45b63d53e4!2sEcoland%20-%20Productos%20Ecol%C3%B3gicos!5e0!3m2!1ses!2ses!4v1699000000000!5m2!1ses!2ses"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Ecoland"
              />
            </div>

            {/* Navigate Button */}
            <Button
              onClick={openMaps}
              className="w-full btn-hero py-6 text-lg"
            >
              <Navigation className="h-5 w-5 mr-2" />
              Cómo llegar (abrir GPS)
            </Button>

            {/* Store Info Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-card rounded-xl p-5 border">
                <MapPin className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Dirección</h3>
                <p className="text-muted-foreground text-sm">{storeInfo.address}</p>
              </div>
              <div className="bg-card rounded-xl p-5 border">
                <Phone className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Teléfono</h3>
                <a href={`tel:${storeInfo.phone}`} className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  {storeInfo.phone}
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-card rounded-xl p-5 border">
              <Clock className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold mb-3">Horario</h3>
              <div className="space-y-2">
                {storeInfo.hours.map((schedule, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{schedule.day}</span>
                    <span className="font-medium">{schedule.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Reviews */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Opiniones de Google</h2>
              <a
                href={storeInfo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Ver todas <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
              <div className="text-4xl font-bold text-primary">4.9</div>
              <div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Basado en +50 reseñas</p>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.map((review, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="bg-card rounded-xl p-5 border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold text-primary">
                          {review.author.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{review.author}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(review.rating)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {review.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Store Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="font-display text-3xl font-bold text-center mb-8">
            Conoce Nuestra Tienda
          </h2>

          {/* Featured Image */}
          <div className="mb-6">
            <div className="relative rounded-2xl overflow-hidden aspect-[21/9]">
              <img
                src={storePhotos[0].src}
                alt={storePhotos[0].alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="font-display text-2xl font-bold">Ecoland</h3>
                <p className="text-white/80">C. Paulina Harriet, 4 - Valladolid</p>
              </div>
            </div>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {storePhotos.slice(1).map((photo, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="relative rounded-xl overflow-hidden aspect-square group"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DondeEstamos;
