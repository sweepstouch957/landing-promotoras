import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CashiersBanner from '@/components/cashiers/CashiersBanner';
import CashiersForm from '@/components/cashiers/CashiersForm';
import ReactQueryProvider from './ReactQueryProvider';
export const metadata = { title: 'Cashiers | Sweepstouch', description: 'Registro de cajeras' };
export default function CashiersPage() {
  return (<>
    <Header />

    <main className="cashiers-registration">
      <CashiersBanner />
      <ReactQueryProvider>
        <CashiersForm />
      </ReactQueryProvider>
    </main>
    <Footer />
  </>);
}
