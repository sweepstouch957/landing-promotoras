import AdminDashboard from '@/components/AdminDashboard';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/AdminLayout';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminLayout title="Panel de Administración">
        <Header />
        <AdminDashboard />
        <Footer />
      </AdminLayout>
    </ProtectedRoute>
  );
}
