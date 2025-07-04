import AdminScheduleList from '@/components/AdminScheduleList';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/AdminLayout';

export default function CitasPage() {
  return (
    <ProtectedRoute>
      <AdminLayout title="Gestión de Citas">
        <Header />

        <AdminScheduleList />

        <Footer />
      </AdminLayout>
    </ProtectedRoute>
  );
}
