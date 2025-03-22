import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminAppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { currentUser } = useAuth();
  const appointmentsPerPage = 10;

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") return;
    
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/appointments/admin/detailed", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          params: {
            page: currentPage,
            limit: appointmentsPerPage,
            search: searchTerm,
            status: statusFilter,
            date: dateFilter
          }
        });
        
        // Handle different API response structures
        const appointmentsData = response.data.appointments || response.data || [];
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
        
        // Calculate total pages safely
        const totalItems = response.data.total || appointmentsData.length || 0;
        setTotalPages(Math.ceil(totalItems / appointmentsPerPage));
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch appointments: " + (err.response?.data?.message || err.message));
        setLoading(false);
        // Set appointments to empty array on error
        setAppointments([]);
      }
    };

    fetchAppointments();
  }, [currentUser, currentPage, searchTerm, statusFilter, dateFilter]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/appointments/${appointmentId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      // Update the appointments list after successful status update
      setAppointments(appointments.map(appointment => 
        appointment._id === appointmentId 
          ? { ...appointment, status: newStatus } 
          : appointment
      ));
    } catch (err) {
      setError("Failed to update appointment: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/appointments/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      // Update the appointments list after successful deletion
      setAppointments(appointments.filter(appointment => appointment._id !== appointmentId));
    } catch (err) {
      setError("Failed to delete appointment: " + (err.response?.data?.message || err.message));
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to get patient/user information
  const getPatientInfo = (appointment) => {
    if (appointment.user) {
      return {
        name: appointment.user.name || "Unknown",
        email: appointment.user.email || "No email"
      };
    } else {
      return {
        name: appointment.userName || "Unknown",
        email: appointment.userEmail || "No email"
      };
    }
  };

  // Helper function to get doctor information
  const getDoctorInfo = (appointment) => {
    if (appointment.doctor) {
      return {
        name: appointment.doctor.name || "Unknown",
        specialization: appointment.doctor.specialization || "Not specified"
      };
    } else {
      return {
        name: appointment.doctorName || "Unknown",
        specialization: ""
      };
    }
  };

  // Map status colors based on status values in your data
  const getStatusStyle = (status) => {
    switch(status.toLowerCase()) {
      case 'confirmed':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Appointment Management</h1>
          <Link 
            to="/admin" 
            className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
          >
            Back to Dashboard
          </Link>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Filters & Search */}
          <div className="p-4 border-b flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-1/3">
              <input
                type="text"
                placeholder="Search by patient or doctor name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="w-full sm:w-1/4">
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            
            <div className="w-full sm:w-1/4">
              <input
                type="date"
                value={dateFilter}
                onChange={handleDateFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Appointments Table */}
          {loading ? (
            <div className="text-center py-10">Loading appointments...</div>
          ) : !appointments || appointments.length === 0 ? (
            <div className="text-center py-10">No appointments found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map(appointment => {
                    const patientInfo = getPatientInfo(appointment);
                    const doctorInfo = getDoctorInfo(appointment);
                    
                    return (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patientInfo.name}</div>
                        <div className="text-xs text-gray-500">{patientInfo.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{doctorInfo.name}</div>
                        <div className="text-xs text-gray-500">{doctorInfo.specialization}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDateForDisplay(appointment.date)}</div>
                        <div className="text-xs text-gray-500">{appointment.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          getStatusStyle(appointment.status)
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {appointment.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleUpdateStatus(appointment._id, "completed")}
                              className="text-green-600 hover:text-green-900 text-xs"
                            >
                              Mark Completed
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(appointment._id, "canceled")}
                              className="text-red-600 hover:text-red-900 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                          <button 
                            onClick={() => handleDeleteAppointment(appointment._id)}
                            className="text-red-600 hover:text-red-900 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 border rounded-md ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 border rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAppointmentManagement; 