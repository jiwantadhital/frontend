import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthenticatedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (currentUser) {
    // Redirect to dashboard if user is authenticated
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

export default AuthenticatedRoute; 