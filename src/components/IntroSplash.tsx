import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash = ({ onComplete }: IntroSplashProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if intro was already shown in this session
    const introShown = sessionStorage.getItem('ecoland-intro-shown');
    if (introShown) {
      setIsVisible(false);
      onComplete();
      return;
    }

    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // If autoplay fails, skip after 3 seconds
        setTimeout(() => handleComplete(), 3000);
      });
    }
  }, []);

  const handleComplete = () => {
    sessionStorage.setItem('ecoland-intro-shown', 'true');
    setIsVisible(false);
    setTimeout(onComplete, 500);
  };

  const handleVideoEnd = () => {
    handleComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-eco-dark flex items-center justify-center"
        >
          <video
            ref={videoRef}
            src="/videos/intro.mp4"
            className="w-full h-full object-cover"
            muted
            playsInline
            onEnded={handleVideoEnd}
          />
          
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute bottom-8 right-8 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors font-medium"
          >
            Saltar intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
