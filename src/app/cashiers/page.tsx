import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CashiersBanner from '@/components/cashiers/CashiersBanner';
import CashiersForm from '@/components/cashiers/CashiersForm';
import ReactQueryProvider from './ReactQueryProvider';
export const metadata = { title: 'Cashiers | Sweepstouch', description: 'Registro de cajeras' };
export default function CashiersPage() {
  return (<>
    <Header />

    {/* Banner */}
    <CashiersBanner />

    <main style={{ padding: '0rem 0' }}>
      <ReactQueryProvider>
        <CashiersForm />
      </ReactQueryProvider>
    </main>
    <Footer />
  </>);
}
