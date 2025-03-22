import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [notes, setNotes] = useState("");
  const [appointmentToUpdate, setAppointmentToUpdate] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/appointments/my-appointments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setAppointments(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch appointments. " + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/appointments/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      setActionMessage(response.data.message);
      fetchAppointments();
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setActionMessage("");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error canceling appointment");
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      // Get the token directly before making the request
      const token = localStorage.getItem("token");

      // Check if we have a token
      if (!token) {
        setError("Authentication token missing. Please log in again.");
        setTimeout(() => { navigate("/login"); }, 2000);
        return;
      }

      console.log("Updating appointment:", id, "to status:", status);
      console.log("Using token:", token);

      const response = await axios.patch(
        `http://localhost:5000/api/appointments/${id}/status`,
        { status, notes },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setActionMessage(response.data.message);
      fetchAppointments();
      setAppointmentToUpdate(null);
      setNotes("");
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setActionMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error updating appointment:", err.response?.data || err.message);
      setError(err.response?.data?.message || `Error ${status}ing appointment`);
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div className="text-center py-4">Loading appointments...</div>;
  
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  // Get user role from localStorage
  const userRole = JSON.parse(localStorage.getItem("user"))?.role || "user";

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        {userRole === "doctor" ? "Manage Patient Appointments" : "My Appointments"}
      </h2>
      
      {actionMessage && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded text-center">
          {actionMessage}
        </div>
      )}
      
      <div className="mb-4 text-right">
        {userRole === "user" && (
          <Link 
            to="/appointments/book"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Book New Appointment
          </Link>
        )}
        {userRole === "doctor" && (
          <Link 
            to="/doctor/schedule"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Manage Your Schedule
          </Link>
        )}
      </div>

      {/* Modal for doctor's notes when updating appointment status */}
      {appointmentToUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Update Appointment Status</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about the appointment (optional)"
              className="w-full px-3 py-2 border rounded mb-4"
              rows="3"
            ></textarea>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setAppointmentToUpdate(null)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => updateAppointmentStatus(appointmentToUpdate.id, appointmentToUpdate.status)}
                className={`px-4 py-2 rounded text-white ${
                  appointmentToUpdate.status === 'confirmed' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {appointmentToUpdate.status === 'confirmed' ? 'Confirm' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {appointments.length === 0 ? (
        <p className="text-center text-gray-600 py-4">
          {userRole === "doctor" 
            ? "You don't have any appointment requests yet." 
            : "You don't have any appointments yet."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                {userRole === "doctor" && <th className="py-3 px-6 text-left">Patient</th>}
                {userRole === "user" && <th className="py-3 px-6 text-left">Doctor</th>}
                <th className="py-3 px-6 text-left">Date</th>
                <th className="py-3 px-6 text-left">Time</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Reason</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {appointments.map((appointment) => (
                <tr key={appointment._id} className="border-b border-gray-200 hover:bg-gray-50">
                  {userRole === "doctor" && (
                    <td className="py-3 px-6 text-left">
                      <div className="font-medium">{appointment.user?.name || "Unknown"}</div>
                      <div className="text-xs text-gray-500">{appointment.user?.email || "No email"}</div>
                    </td>
                  )}
                  {userRole === "user" && (
                    <td className="py-3 px-6 text-left">
                      <div className="font-medium">{appointment.doctor?.name || "Unknown"}</div>
                      <div className="text-xs text-gray-500">{appointment.doctor?.specialization || "No specialization"}</div>
                    </td>
                  )}
                  <td className="py-3 px-6 text-left">{formatDate(appointment.date)}</td>
                  <td className="py-3 px-6 text-left">{appointment.time}</td>
                  <td className="py-3 px-6 text-left">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      appointment.status === 'confirmed' ? 'bg-green-200 text-green-800' :
                      appointment.status === 'canceled' ? 'bg-red-200 text-red-800' :
                      appointment.status === 'rejected' ? 'bg-red-200 text-red-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-left">
                    <div className="truncate max-w-xs" title={appointment.reason}>
                      {appointment.reason}
                    </div>
                  </td>
                  <td className="py-3 px-6 text-center">
                    {/* Patient actions */}
                    {userRole === "user" && (appointment.status === 'pending' || appointment.status === 'confirmed') && (
                      <button
                        onClick={() => cancelAppointment(appointment._id)}
                        className="text-red-600 hover:text-red-900 mx-1"
                      >
                        Cancel
                      </button>
                    )}
                    
                    {/* Doctor actions */}
                    {userRole === 'doctor' && appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => setAppointmentToUpdate({id: appointment._id, status: 'confirmed'})}
                          className="text-green-600 hover:text-green-900 mx-1"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => setAppointmentToUpdate({id: appointment._id, status: 'rejected'})}
                          className="text-red-600 hover:text-red-900 mx-1"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {/* View details link for both roles */}
                    <Link 
                      to={`/appointments/${appointment._id}`}
                      className="text-blue-600 hover:text-blue-900 mx-1"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList; 