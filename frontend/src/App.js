import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";

import Students from "./pages/Students";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Attendance from "./pages/Attendance";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          minHeight: "100vh",
          backgroundImage:
            "url('/images/pro3.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(2,6,23,0.65)",
            backdropFilter:
              "blur(15px)",
            WebkitBackdropFilter:
              "blur(15px)",
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <Routes>
            {/* Public */}

            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            {/* Admin */}

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute
                  allowedRoles={["admin"]}
                >
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Student */}

            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute
                  allowedRoles={["student"]}
                >
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Faculty */}

            <Route
              path="/faculty-dashboard"
              element={
                <ProtectedRoute
                  allowedRoles={["faculty"]}
                >
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin + Faculty */}

            <Route
              path="/students"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "admin",
                    "faculty",
                  ]}
                >
                  <Students />
                </ProtectedRoute>
              }
            />

            <Route
  path="/analytics"
  element={
    <ProtectedRoute
      allowedRoles={[
        "admin",
        "faculty",
      ]}
    >
      <Analytics />
    </ProtectedRoute>
  }
/>

<Route
  path="/attendance"
  element={
    <ProtectedRoute
      allowedRoles={[
        "admin",
        "faculty",
      ]}
    >
      <Attendance />
    </ProtectedRoute>
  }
/>

<Route
  path="/settings"
  element={
    <ProtectedRoute
      allowedRoles={[
        "admin",
        "faculty",
        "student",
      ]}
    >
      <Settings />
    </ProtectedRoute>
  }
/>

            {/* Settings */}

            <Route
              path="/settings"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "admin",
                    "faculty",
                    "student",
                  ]}
                >
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}

            <Route
              path="*"
              element={<Home />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;