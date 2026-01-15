import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Clock, Navigation, Star, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

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
import euOrganicLogo from '@/assets/logos/eu-organic-logo.png';
import castillaLeonLogo from '@/assets/logos/castilla-leon.png';

// Configurable URLs
const REVIEW_URL = 'https://share.google/s1dwIZTxDyqccqRca';
const GOOGLE_MAPS_URL = 'https://www.google.com/maps/place/Eco+Land/@41.6434236,-4.7186485,19z';

const storeInfo = {
  name: 'Eco Land',
  address: 'C. de Recondo, 7, 47007 Valladolid',
  phone: '983 08 45 39',
  phoneFull: '+34 983 08 45 39',
  rating: 4.6,
  totalReviews: 45,
  coordinates: { lat: 41.6434236, lng: -4.7186485 },
};

// Business hours with timezone-aware open/closed detection
const businessHours = [
  { day: 'lunes', morning: '10:00–14:30', afternoon: '17:30–20:30', morningStart: 10, morningEnd: 14.5, afternoonStart: 17.5, afternoonEnd: 20.5 },
  { day: 'martes', morning: '10:00–14:30', afternoon: '17:30–20:30', morningStart: 10, morningEnd: 14.5, afternoonStart: 17.5, afternoonEnd: 20.5 },
  { day: 'miércoles', morning: '10:00–14:30', afternoon: '17:30–20:30', morningStart: 10, morningEnd: 14.5, afternoonStart: 17.5, afternoonEnd: 20.5 },
  { day: 'jueves', morning: '10:00–14:30', afternoon: '17:30–20:30', morningStart: 10, morningEnd: 14.5, afternoonStart: 17.5, afternoonEnd: 20.5 },
  { day: 'viernes', morning: '10:00–14:30', afternoon: '17:30–20:30', morningStart: 10, morningEnd: 14.5, afternoonStart: 17.5, afternoonEnd: 20.5 },
  { day: 'sábado', morning: '10:00–14:30', afternoon: null, morningStart: 10, morningEnd: 14.5, afternoonStart: null, afternoonEnd: null },
  { day: 'domingo', morning: 'Cerrado', afternoon: null, morningStart: null, morningEnd: null, afternoonStart: null, afternoonEnd: null },
];

// Reviews data - easy to edit
const reviews = [
  {
    author: 'Nieves Al',
    rating: 5,
    text: '¡Excelente experiencia!',
    date: 'hace 2 días',
  },
  {
    author: 'galvalle',
    rating: 5,
    text: 'Muy recomendable. Volveré.',
    date: 'hace 2 meses',
  },
  {
    author: 'ana franco',
    rating: 5,
    text: 'Gran variedad de productos ecológicos y suplementos. Productos frescos y atención personalizada.',
    date: 'hace 2 meses',
  },
  {
    author: 'Miguel Ángel García',
    rating: 5,
    text: 'Manzanas dulces y deliciosas; de las mejores que he probado.',
    date: 'hace 1 año',
  },
  {
    author: 'MiMigue',
    rating: 5,
    text: 'Buenos productos, buena atención y opciones para celíacos.',
    date: 'hace 1 año',
  },
  {
    author: 'Idxl',
    rating: 5,
    text: 'Surtido muy amplio y excelente asesoramiento. Se nota el conocimiento del equipo.',
    date: 'hace 2 años',
  },
  {
    author: 'Gustavo Mendiluce',
    rating: 5,
    text: 'Tienda ideal para empezar una vida más saludable: alimentación orgánica, granel, frutos secos y más.',
    date: 'hace 2 años',
  },
];

const storePhotos = [
  { src: entradaImg, alt: 'Entrada del local Ecoland' },
  { src: interiorImg, alt: 'Interior de la tienda' },
  { src: techoImg, alt: 'Detalle del techo de madera' },
  { src: verdurasImg, alt: 'Sección de verduras frescas' },
  { src: especiasImg, alt: 'Zona de especias a granel' },
  { src: estantesImg, alt: 'Estantes con productos ecológicos' },
  { src: galletasImg, alt: 'Galletas artesanales ecológicas' },
  { src: embutidosImg, alt: 'Embutidos ecológicos' },
];

const useOpenStatus = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const madridTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
      const dayOfWeek = madridTime.getDay(); // 0 = Sunday
      const currentHour = madridTime.getHours() + madridTime.getMinutes() / 60;

      // Convert to our array index (Monday = 0)
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      setCurrentDay(dayIndex);

      const todayHours = businessHours[dayIndex];
      
      if (!todayHours.morningStart) {
        setIsOpen(false);
        return;
      }

      const inMorning = currentHour >= todayHours.morningStart && currentHour < todayHours.morningEnd;
      const inAfternoon = todayHours.afternoonStart && currentHour >= todayHours.afternoonStart && currentHour < todayHours.afternoonEnd;

      setIsOpen(inMorning || inAfternoon);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return { isOpen, currentDay };
};

const DondeEstamos = () => {
  const { isOpen, currentDay } = useOpenStatus();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [visibleReviews, setVisibleReviews] = useState(6);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % storePhotos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const openMaps = () => {
    const { lat, lng } = storeInfo.coordinates;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      window.open(`maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`);
    } else if (isAndroid) {
      window.open(`google.navigation:q=${lat},${lng}`);
    } else {
      window.open(GOOGLE_MAPS_URL, '_blank');
    }
  };

  const nextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % storePhotos.length);
  const prevPhoto = () => setCurrentPhotoIndex((prev) => (prev - 1 + storePhotos.length) % storePhotos.length);

  return (
    <div className="section-padding bg-gradient-to-b from-eco-offwhite to-white">
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
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-eco-dark">
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
          className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-6 mb-12 p-6 bg-eco-cream/30 rounded-2xl border border-eco-green/10"
        >
          <div className="flex items-center gap-6">
            <img src={euOrganicLogo} alt="Certificación Ecológica UE" className="h-16 md:h-20 w-auto" />
            <img src={castillaLeonLogo} alt="CAECyL - Castilla y León" className="h-16 md:h-20 w-auto" />
          </div>
          <p className="text-lg md:text-xl font-display font-semibold text-eco-dark text-center">
            Solo productos de certificación ecológica
          </p>
        </motion.div>

        {/* Location Section with Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          {/* Interactive Map */}
          <div className="relative rounded-2xl overflow-hidden bg-muted aspect-[16/9] md:aspect-[21/9] mb-6 shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d500!2d-4.7186485!3d41.6434236!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd4712de76e55555%3A0x6b0d8e45b63d53e4!2sEco%20Land!5e0!3m2!1ses!2ses!4v1699000000000!5m2!1ses!2ses&z=19"
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de Eco Land"
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <Button
              onClick={openMaps}
              className="flex-1 bg-eco-green hover:bg-eco-dark text-white py-6 text-lg rounded-xl shadow-lg"
            >
              <Navigation className="h-5 w-5 mr-2" />
              Cómo llegar
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 border-2 border-eco-green text-eco-dark hover:bg-eco-green hover:text-white py-6 text-lg rounded-xl"
            >
              <a href={`tel:${storeInfo.phoneFull}`}>
                <Phone className="h-5 w-5 mr-2" />
                Llamar ahora
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Photo Carousel - Full Width Main Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-8 text-eco-dark">
            Conoce Nuestra Tienda
          </h2>

          {/* Main Carousel */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] md:aspect-[16/9] shadow-xl mb-4">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentPhotoIndex}
                src={storePhotos[currentPhotoIndex].src}
                alt={storePhotos[currentPhotoIndex].alt}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            
            {/* Photo caption */}
            <motion.div
              key={`caption-${currentPhotoIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-6 left-6 right-6"
            >
              <p className="text-white font-medium text-lg">{storePhotos[currentPhotoIndex].alt}</p>
              <p className="text-white/70 text-sm">{storeInfo.address}</p>
            </motion.div>

            {/* Navigation arrows */}
            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all"
            >
              <ChevronLeft className="h-6 w-6 text-eco-dark" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all"
            >
              <ChevronRight className="h-6 w-6 text-eco-dark" />
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-6 right-6 flex gap-2">
              {storePhotos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPhotoIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentPhotoIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {storePhotos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setCurrentPhotoIndex(i)}
                className={`flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                  i === currentPhotoIndex 
                    ? 'ring-2 ring-eco-green ring-offset-2' 
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-20 h-20 md:w-24 md:h-24 object-cover"
                />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Info Cards + Hours */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl p-6 border border-eco-green/10 shadow-sm">
              <MapPin className="h-8 w-8 text-eco-green mb-4" />
              <h3 className="font-display font-bold text-xl mb-2 text-eco-dark">Dirección</h3>
              <p className="text-muted-foreground">{storeInfo.address}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-eco-green/10 shadow-sm">
              <Phone className="h-8 w-8 text-eco-green mb-4" />
              <h3 className="font-display font-bold text-xl mb-2 text-eco-dark">Teléfono</h3>
              <a 
                href={`tel:${storeInfo.phoneFull}`} 
                className="text-eco-green hover:text-eco-dark transition-colors text-lg font-medium"
              >
                {storeInfo.phone}
              </a>
            </div>
          </motion.div>

          {/* Business Hours */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-eco-green/10 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-eco-green" />
                <h3 className="font-display font-bold text-xl text-eco-dark">Horario</h3>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                isOpen 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {isOpen ? '🟢 Abierto ahora' : '🔴 Cerrado ahora'}
              </span>
            </div>
            
            <div className="space-y-3">
              {businessHours.map((schedule, i) => (
                <div 
                  key={i} 
                  className={`flex justify-between items-center py-2 px-3 rounded-lg transition-colors ${
                    i === currentDay 
                      ? 'bg-eco-green/10 border border-eco-green/20' 
                      : ''
                  }`}
                >
                  <span className={`capitalize ${i === currentDay ? 'font-bold text-eco-dark' : 'text-muted-foreground'}`}>
                    {schedule.day}
                    {i === currentDay && <span className="ml-2 text-xs text-eco-green">← Hoy</span>}
                  </span>
                  <span className={`text-right ${i === currentDay ? 'font-semibold text-eco-dark' : 'text-muted-foreground'}`}>
                    {schedule.morning === 'Cerrado' 
                      ? 'Cerrado' 
                      : schedule.afternoon 
                        ? `${schedule.morning}, ${schedule.afternoon}`
                        : schedule.morning
                    }
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Reviews Section - Premium Ecological Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-eco-cream/50 to-white rounded-3xl p-8 md:p-12 border border-eco-green/10"
        >
          {/* Reviews Header */}
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 text-eco-dark">
              Lo que opinan nuestros clientes
            </h2>
            <p className="text-muted-foreground text-lg">
              Tu confianza es nuestra mayor recompensa 💚
            </p>
          </div>

          {/* Rating Highlight */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10 p-6 bg-white rounded-2xl shadow-sm border border-eco-green/10">
            <div className="flex items-center gap-4">
              <span className="text-5xl md:text-6xl font-bold text-eco-dark">{storeInfo.rating}</span>
              <div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-6 w-6 ${
                        i < Math.floor(storeInfo.rating) 
                          ? 'fill-amber-400 text-amber-400' 
                          : i < storeInfo.rating 
                            ? 'fill-amber-400/50 text-amber-400' 
                            : 'text-gray-200'
                      }`} 
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  ({storeInfo.totalReviews} reseñas reales de Google)
                </p>
              </div>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {reviews.slice(0, visibleReviews).map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-white rounded-xl p-5 border border-eco-green/10 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-eco-green/10 flex items-center justify-center">
                      <span className="font-bold text-eco-green">
                        {review.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-eco-dark">{review.author}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  "{review.text}"
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="text-center space-y-4">
            <Button
              asChild
              size="lg"
              className="bg-eco-green hover:bg-eco-dark text-white px-8 py-6 text-lg rounded-xl shadow-lg"
            >
              <a href={REVIEW_URL} target="_blank" rel="noopener noreferrer">
                <Star className="h-5 w-5 mr-2" />
                Déjanos tu reseña en Google
              </a>
            </Button>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Tu opinión ayuda a que más personas descubran una forma de vivir más saludable y consciente.
            </p>
            <a
              href={REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-eco-green hover:text-eco-dark font-medium"
            >
              Ver más en Google <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DondeEstamos;
