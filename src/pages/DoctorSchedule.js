import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DoctorSchedule = () => {
  const [date, setDate] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", 
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", 
    "05:00 PM", "05:30 PM"
  ];

  // Load doctor's existing schedule
  useEffect(() => {
    const fetchDoctorSlots = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        if (response.data.role !== "doctor") {
          setError("Only doctors can access this page");
          navigate("/dashboard");
          return;
        }
        
        setDoctorSlots(response.data.availableSlots || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch schedule. " + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    fetchDoctorSlots();
  }, [navigate]);

  // Update selected time slots when date changes
  useEffect(() => {
    if (date) {
      const existingSlot = doctorSlots.find(slot => slot.date === date);
      if (existingSlot) {
        setSelectedTimeSlots(existingSlot.times);
      } else {
        setSelectedTimeSlots([]);
      }
    } else {
      setSelectedTimeSlots([]);
    }
  }, [date, doctorSlots]);

  const handleTimeSlotToggle = (timeSlot) => {
    if (selectedTimeSlots.includes(timeSlot)) {
      setSelectedTimeSlots(selectedTimeSlots.filter(t => t !== timeSlot));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, timeSlot]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!date) {
      setError("Please select a date");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/appointments/available-slots",
        {
          date,
          times: selectedTimeSlots
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      setMessage(response.data.message);
      
      // Update the local doctorSlots state to reflect the changes
      setDoctorSlots(response.data.availableSlots);
      
      // Clear form after 3 seconds
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error updating schedule");
    }
  };

  // Calculate minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  // Calculate maximum date (3 months from now)
  const maxDate = new Date(today);
  maxDate.setMonth(today.getMonth() + 3);
  const maxDateString = maxDate.toISOString().split('T')[0];

  if (loading) return <div className="text-center py-4">Loading schedule...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Manage Your Schedule</h2>
      
      {error && <p className="text-center mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</p>}
      {message && <p className="text-center mb-4 p-2 bg-green-100 text-green-700 rounded">{message}</p>}
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Your Current Schedule</h3>
        
        {doctorSlots.length === 0 ? (
          <p className="text-gray-600">You haven't set any available time slots yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctorSlots.map(slot => (
              <div key={slot.date} className="p-3 border rounded-lg">
                <p className="font-semibold">{new Date(slot.date).toDateString()}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {slot.times.map(time => (
                    <span key={time} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="date" className="block text-gray-700 mb-1">Select Date:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={minDate}
            max={maxDateString}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        {date && (
          <div>
            <label className="block text-gray-700 mb-2">Select Available Time Slots:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {timeSlots.map(time => (
                <div 
                  key={time}
                  onClick={() => handleTimeSlotToggle(time)}
                  className={`p-2 border rounded-md text-center cursor-pointer ${
                    selectedTimeSlots.includes(time) 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {time}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <button 
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition duration-200"
          disabled={!date}
        >
          Update Schedule
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <button 
          onClick={() => navigate("/dashboard")} 
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default DoctorSchedule; 