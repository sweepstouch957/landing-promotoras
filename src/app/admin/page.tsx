import AdminDashboard from '@/components/AdminDashboard';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <Header />
      <Hero />
      <AdminDashboard />
      <Footer />
    </ProtectedRoute>
  );
}
