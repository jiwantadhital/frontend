import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AppointmentDetail = () => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [notes, setNotes] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchAppointmentDetails();
  }, [id]);

  const fetchAppointmentDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/appointments/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setAppointment(response.data);
      setNotes(response.data.notes || "");
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch appointment details. " + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const cancelAppointment = async () => {
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
      fetchAppointmentDetails();
      
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

  const updateAppointmentStatus = async (status) => {
    try {
      console.log("Updating appointment:", id, "with status:", status);
      console.log("Doctor ID:", currentUser.id);
      
      const response = await axios.patch(
        `http://localhost:5000/api/appointments/${id}/status`,
        { status, notes },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      setActionMessage(response.data.message);
      fetchAppointmentDetails();
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setActionMessage("");
      }, 3000);
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
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

  if (loading) return <div className="text-center py-4">Loading appointment details...</div>;
  
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  if (!appointment) return <div className="text-center py-4">Appointment not found.</div>;

  // Get user role from localStorage
  const userRole = JSON.parse(localStorage.getItem("user"))?.role || "user";

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Appointment Details</h2>
      
      {actionMessage && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded text-center">
          {actionMessage}
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
              appointment.status === 'confirmed' ? 'bg-green-200 text-green-800' :
              appointment.status === 'canceled' ? 'bg-red-200 text-red-800' :
              appointment.status === 'rejected' ? 'bg-red-200 text-red-800' :
              'bg-yellow-200 text-yellow-800'
            }`}>
              {appointment.status}
            </span>
          </div>
          
          <button 
            onClick={() => navigate("/appointments")} 
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Appointments
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Appointment Info</h3>
          <p><span className="font-medium">Date:</span> {formatDate(appointment.date)}</p>
          <p><span className="font-medium">Time:</span> {appointment.time}</p>
          <p><span className="font-medium">Created:</span> {new Date(appointment.createdAt).toLocaleString()}</p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          {userRole === "doctor" ? (
            <>
              <h3 className="font-semibold text-gray-700 mb-2">Patient Info</h3>
              <p><span className="font-medium">Name:</span> {appointment.user.name}</p>
              <p><span className="font-medium">Email:</span> {appointment.user.email}</p>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-gray-700 mb-2">Doctor Info</h3>
              <p><span className="font-medium">Name:</span> {appointment.doctor.name}</p>
              <p><span className="font-medium">Specialization:</span> {appointment.doctor.specialization}</p>
            </>
          )}
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">Reason for Visit</h3>
        <p className="whitespace-pre-line">{appointment.reason}</p>
      </div>
      
      {appointment.notes && (
        <div className="p-4 bg-gray-50 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Doctor's Notes</h3>
          <p className="whitespace-pre-line">{appointment.notes}</p>
        </div>
      )}
      
      {userRole === "doctor" && appointment.status === "pending" && (
        <div className="p-4 border rounded-lg mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Add Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about the appointment (optional)"
            className="w-full px-3 py-2 border rounded mb-4"
            rows="3"
          ></textarea>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => updateAppointmentStatus("rejected")}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reject
            </button>
            <button
              onClick={() => updateAppointmentStatus("confirmed")}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
      
      {userRole === "user" && (appointment.status === "pending" || appointment.status === "confirmed") && (
        <div className="text-center">
          <button
            onClick={cancelAppointment}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cancel Appointment
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentDetail; 