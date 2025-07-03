import AdminScheduleCalendar from '@/components/AdminScheduleCalendar';
import AdminScheduleList from '@/components/AdminScheduleList';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CitasPage() {
  return (
    <ProtectedRoute>
      <Header />
      <Hero />
      <AdminScheduleList />
      <AdminScheduleCalendar />
      <Footer />
    </ProtectedRoute>
  );
}
