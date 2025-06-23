import Head from 'next/head';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PaymentStructure from '@/components/PaymentStructure';
import WhyChoose from '@/components/WhyChoose';
import WhoAreWe from '@/components/WhoAreWe';
import Testimonials from '@/components/Testimonials';
import Locations from '@/components/Locations';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';
import Responsibilities from '@/components/Responsabilities';
import HowToParticipate from '@/components/HowToParticipate';
import Bonuses from '@/components/Bonuses';
import JoinSection from '@/components/JoinSection';

export default function Home() {
  return (
    <>
      <main>
        <Header />
        <Hero />
        <Responsibilities />
        <HowToParticipate />
        <PaymentStructure />
        <WhyChoose />
        <Bonuses />
        <Testimonials />
        <JoinSection />
        <Footer />
      </main>
    </>
  );
}
