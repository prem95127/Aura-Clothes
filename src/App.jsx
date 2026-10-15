import { Routes, Route, Navigate } from "react-router-dom";
import Splash from "./components/Splash.jsx";
import RequireAdmin from "./components/RequireAdmin.jsx";
import Shop from "./pages/Shop.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

export default function App() {
  return (
    <>
      <Splash />
      <Routes>
        {/* customer site */}
        <Route path="/" element={<Shop />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* admin site */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
