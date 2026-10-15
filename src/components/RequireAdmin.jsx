import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Only a signed-in admin can open the pages inside this wrapper
export default function RequireAdmin({ children }) {
  const { admin } = useAuth();
  return admin ? children : <Navigate to="/admin/login" replace />;
}
