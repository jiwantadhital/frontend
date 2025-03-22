import logo from './logo.svg';
import { Link, Routes, Route } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AppointmentBooking from "./pages/AppointmentBooking";
import AppointmentsList from "./pages/AppointmentsList";
import ProtectedRoute from "./components/ProtectedRoute";
import DoctorSchedule from "./pages/DoctorSchedule";
import AppointmentDetail from "./pages/AppointmentDetail";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminDoctorManagement from "./pages/AdminDoctorManagement";
import AdminAddDoctor from "./pages/AdminAddDoctor";
import AdminAddUser from "./pages/AdminAddUser";
import AdminAppointmentManagement from "./pages/AdminAppointmentManagement";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={
          <AuthenticatedRoute>
            <Login />
          </AuthenticatedRoute>
        } />
        <Route path="/login" element={
          <AuthenticatedRoute>
            <Login />
          </AuthenticatedRoute>
        } />
        <Route path="/register" element={
          <AuthenticatedRoute>
            <Register />
          </AuthenticatedRoute>
        } />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/appointments/book" 
          element={
            <ProtectedRoute>
              <AppointmentBooking />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/appointments" 
          element={
            <ProtectedRoute>
              <AppointmentsList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/appointments/:id" 
          element={
            <ProtectedRoute>
              <AppointmentDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/doctor/schedule" 
          element={
            <ProtectedRoute>
              <DoctorSchedule />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <AdminRoute>
              <AdminUserManagement />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/doctors" 
          element={
            <AdminRoute>
              <AdminDoctorManagement />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/doctors/new" 
          element={
            <AdminRoute>
              <AdminAddDoctor />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/users/new" 
          element={
            <AdminRoute>
              <AdminAddUser />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/appointments" 
          element={
            <AdminRoute>
              <AdminAppointmentManagement />
            </AdminRoute>
          } 
        />
        
        <Route path="/home" element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <header className="p-6 flex flex-col items-center">
              <img src={logo} className="h-32 w-32 animate-spin" alt="logo" />
              <h1 className="text-3xl font-bold mt-6 text-gray-800">Doctor Appointment System</h1>
              <p className="mt-4 text-lg text-gray-600">
                A simple application to book and manage doctor appointments
              </p>
              
              <div className="mt-8 flex space-x-4">
                <Link 
                  to="/book-appointment" 
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Book Appointment
                </Link>
                <Link 
                  to="/appointments" 
                  className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition duration-200"
                >
                  View Appointments
                </Link>
              </div>
            </header>
          </div>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
