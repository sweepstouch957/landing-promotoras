import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CashiersBannerPlaceholder from '@/components/cashiers/CashiersBannerPlaceholder';
import CashiersForm from '@/components/cashiers/CashiersForm';
import ReactQueryProvider from './ReactQueryProvider';
export const metadata = { title: 'Cashiers | Sweepstouch', description: 'Registro de cajeras' };
export default function CashiersPage() {
  return (<>
    <Header />

    <CashiersBannerPlaceholder />

    <main style={{ padding: '2rem 0' }}>
      <ReactQueryProvider>
        <CashiersForm />
      </ReactQueryProvider>
    </main>
    <Footer />
  </>);
}
