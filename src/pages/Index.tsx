import { Hero } from '@/components/home/Hero';
import { FeaturedPacks } from '@/components/home/FeaturedPacks';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Trust } from '@/components/home/Trust';
import { Testimonials } from '@/components/home/Testimonials';
import { QuizCTA } from '@/components/home/QuizCTA';
import { CertificationBadge } from '@/components/home/CertificationBadge';

const Index = () => {
  return (
    <>
      <Hero />
      <Trust />
      <CertificationBadge />
      <FeaturedPacks />
      <HowItWorks />
      <Testimonials />
      <QuizCTA />
    </>
  );
};

export default Index;
