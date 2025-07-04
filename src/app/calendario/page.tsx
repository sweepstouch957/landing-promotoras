import AdminScheduleCalendar from '@/components/AdminScheduleCalendar';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/AdminLayout';

export default function CitasPage() {
  return (
    <ProtectedRoute>
      <AdminLayout title="Calendario">
        <Header />

        <AdminScheduleCalendar />
        <Footer />
      </AdminLayout>
    </ProtectedRoute>
  );
}
