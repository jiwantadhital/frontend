import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminDoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [specializations, setSpecializations] = useState([]);
  
  const { currentUser } = useAuth();
  const doctorsPerPage = 10;

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") return;
    
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/admin/doctors", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          params: {
            page: currentPage,
            limit: doctorsPerPage,
            search: searchTerm,
            specialization: specialization
          }
        });
        
        setDoctors(response.data.doctors);
        setTotalPages(Math.ceil(response.data.total / doctorsPerPage));
        
        // Get unique specializations
        if (response.data.specializations) {
          setSpecializations(response.data.specializations);
        }
        
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch doctors: " + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [currentUser, currentPage, searchTerm, specialization]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleSpecializationChange = (e) => {
    setSpecialization(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/doctors/${doctorId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      // Update the doctors list after successful deletion
      setDoctors(doctors.filter(doctor => doctor._id !== doctorId));
    } catch (err) {
      setError("Failed to delete doctor: " + (err.response?.data?.message || err.message));
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
          <h1 className="text-2xl font-bold text-gray-800">Doctor Management</h1>
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
          <div className="p-4 border-b flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
            <div className="w-full sm:w-1/3">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="w-full sm:w-1/4">
              <select
                value={specialization}
                onChange={handleSpecializationChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Specializations</option>
                {specializations.map((spec, index) => (
                  <option key={index} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            
            <Link 
              to="/admin/doctors/new" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add New Doctor
            </Link>
          </div>

          {/* Doctors Table */}
          {loading ? (
            <div className="text-center py-10">Loading doctors...</div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-10">No doctors found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {doctors.map(doctor => (
                    <tr key={doctor._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{doctor.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{doctor.specialization}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{doctor.experience || "-"} years</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link 
                          to={`/admin/doctors/${doctor._id}/edit`} 
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </Link>
                        <Link 
                          to={`/admin/doctors/${doctor._id}/schedule`} 
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Schedule
                        </Link>
                        <button 
                          onClick={() => handleDeleteDoctor(doctor._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
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

export default AdminDoctorManagement; 