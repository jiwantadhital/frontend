import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AppointmentBooking = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Check if the user is a doctor and redirect if necessary
  useEffect(() => {
    const userRole = JSON.parse(localStorage.getItem("user"))?.role;
    if (userRole === "doctor") {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Fetch available doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/appointments/available-doctors", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setDoctors(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch available doctors. " + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Update available times when doctor or date changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const doctor = doctors.find(doc => doc._id === selectedDoctor);
      if (doctor) {
        const dateSlot = doctor.availableSlots.find(slot => slot.date === selectedDate);
        if (dateSlot) {
          setAvailableTimes(dateSlot.times);
        } else {
          setAvailableTimes([]);
        }
      }
    } else {
      setAvailableTimes([]);
    }
    
    // Reset selected time when doctor or date changes
    setSelectedTime("");
  }, [selectedDoctor, selectedDate, doctors]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!selectedDoctor || !selectedDate || !selectedTime || !reason) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/appointments/book",
        {
          doctorId: selectedDoctor,
          date: selectedDate,
          time: selectedTime,
          reason
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      setMessage(response.data.message);
      setTimeout(() => navigate("/appointments"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Error booking appointment");
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return <div className="text-center py-4">Loading available doctors...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Book an Appointment</h2>
      
      {error && <p className="text-center mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</p>}
      {message && <p className="text-center mb-4 p-2 bg-blue-100 text-blue-700 rounded">{message}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Select Doctor:</label>
          <select 
            value={selectedDoctor} 
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Choose a doctor</option>
            {doctors.map(doctor => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>
        </div>

        {selectedDoctor && (
          <div>
            <label className="block text-gray-700 mb-1">Select Date:</label>
            <select 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose a date</option>
              {doctors
                .find(doc => doc._id === selectedDoctor)?.availableSlots
                .map(slot => (
                  <option key={slot.date} value={slot.date}>
                    {formatDateForDisplay(slot.date)}
                  </option>
                ))}
            </select>
          </div>
        )}

        {selectedDate && (
          <div>
            <label className="block text-gray-700 mb-1">Select Time:</label>
            <select 
              value={selectedTime} 
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose a time</option>
              {availableTimes.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-gray-700 mb-1">Reason for Visit:</label>
          <textarea 
            value={reason} 
            onChange={(e) => setReason(e.target.value)}
            placeholder="Briefly describe your symptoms or reason for the appointment"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            required
          ></textarea>
        </div>
        
        <button 
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition duration-200"
          disabled={!selectedDoctor || !selectedDate || !selectedTime || !reason}
        >
          Book Appointment
        </button>
      </form>
      
      <p className="mt-4 text-center text-gray-600">
        <a href="/appointments" className="text-blue-500 hover:text-blue-700">
          View My Appointments
        </a>
      </p>
    </div>
  );
};

export default AppointmentBooking;
