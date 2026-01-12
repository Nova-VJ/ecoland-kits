import { Hero } from '@/components/home/Hero';
import { FeaturedPacks } from '@/components/home/FeaturedPacks';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Trust } from '@/components/home/Trust';
import { Testimonials } from '@/components/home/Testimonials';
import { QuizCTA } from '@/components/home/QuizCTA';

const Index = () => {
  return (
    <>
      <Hero />
      <Trust />
      <FeaturedPacks />
      <HowItWorks />
      <Testimonials />
      <QuizCTA />
    </>
  );
};

export default Index;
