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
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setUserInfo(response.data);
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
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition duration-200 flex items-center"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        </div>
        
        {userInfo && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-6 border-l-4 border-blue-500 transform hover:scale-[1.01] transition-transform duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Welcome, {userInfo.name}!
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg flex items-center">
                <div className="bg-blue-100 p-2 rounded-md mr-3">
                  <FaUser className="text-blue-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">EMAIL</p>
                  <p className="text-gray-700 font-medium">{userInfo.email}</p>
                </div>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg flex items-center">
                <div className="bg-indigo-100 p-2 rounded-md mr-3">
                  <FaUserMd className="text-indigo-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">ROLE</p>
                  <p className="text-gray-700 font-medium capitalize">{userInfo.role}</p>
                </div>
              </div>
              {userInfo.role === "doctor" && (
                <div className="bg-purple-50 p-3 rounded-lg flex items-center">
                  <div className="bg-purple-100 p-2 rounded-md mr-3">
                    <FaUserMd className="text-purple-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">SPECIALIZATION</p>
                    <p className="text-gray-700 font-medium">{userInfo.specialization}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            to="/appointments" 
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-t-4 border-blue-500 group"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-300">
                <FaCalendarAlt className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="ml-4 text-xl font-semibold text-gray-800">
                {userInfo?.role === "doctor" ? "Manage Patient Appointments" : "My Appointments"}
              </h3>
            </div>
            <p className="text-gray-600 ml-16">
              {userInfo?.role === "doctor" 
                ? "View and manage your patients' appointments" 
                : "View all your scheduled appointments"}
            </p>
            <div className="mt-4 ml-16 text-blue-600 font-medium group-hover:underline">
              View details →
            </div>
          </Link>
          
          {userInfo?.role === "doctor" ? (
            <Link 
              to="/doctor/schedule" 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-t-4 border-green-500 group"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
                  <FaClock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="ml-4 text-xl font-semibold text-gray-800">Manage Your Schedule</h3>
              </div>
              <p className="text-gray-600 ml-16">Set your available time slots for appointments</p>
              <div className="mt-4 ml-16 text-green-600 font-medium group-hover:underline">
                View details →
              </div>
            </Link>
          ) : (
            <Link 
              to="/appointments/book" 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-t-4 border-green-500 group"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
                  <FaCalendarAlt className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="ml-4 text-xl font-semibold text-gray-800">Book Appointment</h3>
              </div>
              <p className="text-gray-600 ml-16">Schedule a new appointment with a doctor</p>
              <div className="mt-4 ml-16 text-green-600 font-medium group-hover:underline">
                Book now →
              </div>
            </Link>
          )}
          
          {userInfo?.role === "admin" && (
            <Link 
              to="/admin/users" 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-t-4 border-purple-500 group"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-300">
                  <FaUser className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="ml-4 text-xl font-semibold text-gray-800">Manage Users</h3>
              </div>
              <p className="text-gray-600 ml-16">View and manage all system users</p>
              <div className="mt-4 ml-16 text-purple-600 font-medium group-hover:underline">
                Manage now →
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 