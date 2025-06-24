import ApplicationForm from '@/components/ApplicationForm';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Hero from '@/components/Hero';

export default function FormularioPage() {
  return (
    <>
      <Header />
      <Hero />
      <main style={{ padding: '2rem' }}>
        <ApplicationForm />
      </main>
      <Footer />
    </>
  );
}
