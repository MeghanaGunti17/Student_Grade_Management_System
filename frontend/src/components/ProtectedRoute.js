import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role not allowed
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(role)
  ) {
    switch (role) {
      case "admin":
        return (
          <Navigate
            to="/dashboard"
            replace
          />
        );

      case "faculty":
        return (
          <Navigate
            to="/faculty-dashboard"
            replace
          />
        );

      case "student":
        return (
          <Navigate
            to="/student-dashboard"
            replace
          />
        );

      default:
        return (
          <Navigate
            to="/login"
            replace
          />
        );
    }
  }

  // Access granted
  return children;
}