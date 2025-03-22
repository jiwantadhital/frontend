import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { FaCalendarAlt, FaClock, FaUserMd, FaSignOutAlt, FaUser } from "react-icons/fa";

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setUserInfo(response.data);
        setIsAdmin(response.data.role === "admin");
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch user details. " + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUserDetails();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg text-center">
      <div className="text-red-500 text-lg font-medium mb-2">Error</div>
      <p className="text-gray-700">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <span className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                <FaUser className="h-5 w-5" />
              </span>
              Dashboard
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-500">Welcome, {userInfo?.name}</div>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <FaSignOutAlt className="mr-2 -ml-1 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* User's upcoming appointments or doctor's appointments summary */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-5 text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold mb-2">
                  {userInfo?.role === "doctor" ? "Today's Schedule" : "Upcoming Appointments"} 
                </h3>
                <FaCalendarAlt className="h-6 w-6 opacity-75" />
              </div>
              <p className="text-3xl font-bold mb-2">
                {userInfo?.role === "doctor" ? userInfo?.todayAppointments || 0 : userInfo?.upcomingAppointments || 0}
              </p>
              <p className="text-sm opacity-75">
                {userInfo?.role === "doctor" 
                  ? "Appointments scheduled today" 
                  : "Scheduled in the next 7 days"}
              </p>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
                <FaClock className="h-6 w-6 text-blue-500" />
              </div>
              
              {userInfo?.role === "doctor" ? (
                <Link 
                  to="/doctor/schedule"
                  className="block w-full text-center py-2 px-4 border border-blue-500 rounded-md text-blue-600 hover:bg-blue-50 mb-3"
                >
                  Manage Schedule
                </Link>
              ) : (
                <Link 
                  to="/appointments/book"
                  className="block w-full text-center py-2 px-4 border border-blue-500 rounded-md text-blue-600 hover:bg-blue-50 mb-3"
                >
                  Book Appointment
                </Link>
              )}
              
              <Link 
                to="/appointments"
                className="block w-full text-center py-2 px-4 bg-blue-600 rounded-md text-white hover:bg-blue-700"
              >
                View {userInfo?.role === "doctor" ? "Patient" : "My"} Appointments
              </Link>
            </div>

            {/* Profile Summary */}
            <div className="bg-gray-50 rounded-lg shadow p-5 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Profile</h3>
                <FaUserMd className="h-6 w-6 text-blue-500" />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm"><span className="font-medium text-gray-500">Name:</span> {userInfo?.name}</p>
                <p className="text-sm"><span className="font-medium text-gray-500">Email:</span> {userInfo?.email}</p>
                <p className="text-sm">
                  <span className="font-medium text-gray-500">Role:</span> 
                  <span className="capitalize">{userInfo?.role}</span>
                </p>
                {userInfo?.role === "doctor" && userInfo?.specialization && (
                  <p className="text-sm">
                    <span className="font-medium text-gray-500">Specialization:</span> 
                    {userInfo.specialization}
                  </p>
                )}
              </div>
              
              <button
                className="mt-4 w-full text-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Update Profile
              </button>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Recent {userInfo?.role === "doctor" ? "Patient" : ""} Appointments
            </h3>
            
            {userInfo?.recentAppointments?.length > 0 ? (
              <div className="bg-white overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {userInfo?.role === "doctor" ? "Patient" : "Doctor"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userInfo?.recentAppointments?.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {userInfo?.role === "doctor" ? appointment.patientName : appointment.doctorName}
                          </div>
                          {userInfo?.role === "doctor" && (
                            <div className="text-xs text-gray-500">{appointment.patientEmail}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.date}</div>
                          <div className="text-xs text-gray-500">{appointment.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : appointment.status === 'cancelled' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link to={`/appointments/${appointment.id}`} className="text-blue-600 hover:text-blue-900">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">No recent appointments found.</p>
                {userInfo?.role !== "doctor" && (
                  <Link 
                    to="/appointments/book"
                    className="mt-2 inline-block text-blue-600 hover:text-blue-800"
                  >
                    Book your first appointment →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 