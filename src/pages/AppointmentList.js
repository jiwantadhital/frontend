import React, { useEffect, useState } from "react";
import axios from "axios";

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/appointments");
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments", error);
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/appointments/${id}`);
      setMessage("Appointment canceled!");
      fetchAppointments(); // Refresh list
    } catch (error) {
      console.error("Error canceling appointment", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Booked Appointments</h2>
      {message && <p className="text-center mb-4 p-2 bg-green-100 text-green-700 rounded">{message}</p>}
      
      {appointments.length === 0 ? (
        <p className="text-center text-gray-500">No appointments found</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {appointments.map((appointment) => (
            <li key={appointment._id} className="py-4 flex justify-between items-center">
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium text-gray-900">{appointment.userName}</span> with{" "}
                  <span className="font-medium text-gray-900">{appointment.doctorName}</span>
                </p>
                <p className="text-sm text-gray-500">
                  {appointment.date} at {appointment.time}
                </p>
              </div>
              <button 
                onClick={() => handleCancel(appointment._id)}
                className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded"
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AppointmentList;
