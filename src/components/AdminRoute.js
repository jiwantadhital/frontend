import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }
  
  // Check if user is an admin
  if (currentUser.role !== "admin") {
    // Redirect to dashboard if not an admin
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

export default AdminRoute; 