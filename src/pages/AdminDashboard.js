import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="mt-4">You don't have permission to access this page.</p>
        <Link to="/dashboard" className="mt-4 inline-block text-blue-500">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="mt-4">
          <Link
            to="/admin"
            className={`px-4 py-3 flex items-center cursor-pointer ${
              activeTab === "dashboard" 
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500" 
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            <span className="ml-2 text-sm font-medium">Dashboard</span>
          </Link>
          <Link
            to="/admin/users"
            className={`px-4 py-3 flex items-center cursor-pointer ${
              activeTab === "users" 
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500" 
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("users")}
          >
            <span className="ml-2 text-sm font-medium">Users</span>
          </Link>
          <Link
            to="/admin/doctors"
            className={`px-4 py-3 flex items-center cursor-pointer ${
              activeTab === "doctors" 
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500" 
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("doctors")}
          >
            <span className="ml-2 text-sm font-medium">Doctors</span>
          </Link>
          <Link
            to="/admin/appointments"
            className={`px-4 py-3 flex items-center cursor-pointer ${
              activeTab === "appointments" 
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500" 
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("appointments")}
          >
            <span className="ml-2 text-sm font-medium">Appointments</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-lg font-medium text-gray-800">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {currentUser.name}</span>
              <button 
                onClick={logout}
                className="text-xs px-3 py-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Dashboard Summary Cards */}
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-base font-medium text-blue-700">Total Users</h3>
                <p className="text-2xl font-bold mt-2">--</p>
                <Link to="/admin/users" className="text-xs text-blue-600 mt-2 inline-block">
                  View All Users →
                </Link>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-base font-medium text-green-700">Total Doctors</h3>
                <p className="text-2xl font-bold mt-2">--</p>
                <Link to="/admin/doctors" className="text-xs text-green-600 mt-2 inline-block">
                  View All Doctors →
                </Link>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-base font-medium text-purple-700">Total Appointments</h3>
                <p className="text-2xl font-bold mt-2">--</p>
                <Link to="/admin/appointments" className="text-xs text-purple-600 mt-2 inline-block">
                  View All Appointments →
                </Link>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-base font-medium text-yellow-700">Today's Appointments</h3>
                <p className="text-2xl font-bold mt-2">--</p>
                <Link to="/admin/appointments" className="text-xs text-yellow-600 mt-2 inline-block">
                  View Today's Schedule →
                </Link>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-6">
              <h2 className="text-base font-medium text-gray-700 mb-3">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Link 
                  to="/admin/doctors/new" 
                  className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add New Doctor
                </Link>
                <Link 
                  to="/admin/users/new" 
                  className="inline-flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add New User
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 