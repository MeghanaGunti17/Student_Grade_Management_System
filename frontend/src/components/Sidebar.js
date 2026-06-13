import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const adminNav = [
  { label: "Overview", icon: "⬡", to: "/dashboard" },
  { label: "Students", icon: "🎓", to: "/students" },
  { label: "Analytics", icon: "📈", to: "/analytics" },
  { label: "Attendance", icon: "📋", to: "/attendance" },
  { label: "Settings", icon: "⚙️", to: "/settings" },
];

const facultyNav = [
  {
    label: "Marks Entry",
    icon: "✏️",
    to: "/faculty-dashboard",
  },
  {
    label: "Attendance",
    icon: "📋",
    to: "/attendance",
  },
];

const studentNav = [
  {
    label: "My Results",
    icon: "📊",
    to: "/student-dashboard",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const role =
    localStorage.getItem("role") || "student";

  const name =
    localStorage.getItem("userName") || "User";

  const navItems =
    role === "admin"
      ? adminNav
      : role === "faculty"
      ? facultyNav
      : studentNav;

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    localStorage.clear();

    toast.success("Logged out successfully");

    navigate("/login");
  };

  return (
    <aside
      style={{
        width: "260px",
        minWidth: "260px",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1000,
        background:
          "rgba(15,23,42,0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter:
          "blur(20px)",
        borderRight:
          "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* Logo */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg,#38bdf8,#2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            🎓
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                color: "white",
              }}
            >
              CampusIQ
            </h2>

            <p
              style={{
                margin: 0,
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              Student Management System
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 15px",
                marginBottom: "10px",
                borderRadius: "10px",
                textDecoration: "none",
                color: "white",
                background: isActive
                  ? "rgba(59,130,246,0.3)"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(59,130,246,0.5)"
                  : "1px solid transparent",
              })}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Footer */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px",
            borderRadius: "10px",
            background:
              "rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background:
                "linear-gradient(135deg,#38bdf8,#2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
            }}
          >
            {initials}
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                color: "white",
                fontWeight: "600",
              }}
            >
              {name}
            </div>

            <div
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                textTransform: "capitalize",
              }}
            >
              {role}
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "#ef4444",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ↩
          </button>
        </div>
      </div>
    </aside>
  );
}