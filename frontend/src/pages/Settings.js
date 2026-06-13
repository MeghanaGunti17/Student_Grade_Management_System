import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Settings() {
  const [name, setName] = useState(
    localStorage.getItem("userName") || ""
  );

  const [email, setEmail] = useState(
    localStorage.getItem("userEmail") || ""
  );

  const [notifications, setNotifications] =
    useState(true);

  const [darkMode, setDarkMode] =
    useState(true);

  const saveSettings = () => {
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);

    alert("✅ Settings Saved Successfully");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
      }}
    >
      <Sidebar />

      <div
        style={{
          marginLeft: "260px",
          width: "calc(100% - 260px)",
          padding: "30px",
          color: "white",
        }}
      >
        <Topbar title="Settings" />

        <h1
          style={{
            fontSize: "42px",
            fontWeight: "700",
            marginBottom: "30px",
            textShadow:
              "0 0 15px rgba(56,189,248,0.4)",
          }}
        >
          ⚙️ Settings
        </h1>

        {/* Profile Card */}

        <div style={cardStyle}>
          <h2
            style={{
              marginBottom: "20px",
            }}
          >
            👤 Profile Settings
          </h2>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            style={inputStyle}
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={inputStyle}
          />

          <button
            style={buttonStyle}
            onClick={saveSettings}
          >
            💾 Save Changes
          </button>
        </div>

        {/* Preferences */}

        <div
          style={{
            ...cardStyle,
            marginTop: "30px",
          }}
        >
          <h2
            style={{
              marginBottom: "20px",
            }}
          >
            🔔 Preferences
          </h2>

          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={notifications}
              onChange={() =>
                setNotifications(
                  !notifications
                )
              }
            />

            <span>
              Enable Notifications
            </span>
          </label>

          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() =>
                setDarkMode(
                  !darkMode
                )
              }
            />

            <span>
              Dark Mode
            </span>
          </label>
        </div>

        {/* System Info */}

        <div
          style={{
            ...cardStyle,
            marginTop: "30px",
          }}
        >
          <h2
            style={{
              marginBottom: "15px",
            }}
          >
            ℹ️ System Information
          </h2>

          <p>
            <strong>Version:</strong>{" "}
            CampusIQ
          </p>

          <p>
            <strong>Role:</strong>{" "}
            {localStorage.getItem("role")}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            Active
          </p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background:
    "rgba(15,23,42,0.55)",
  backdropFilter: "blur(15px)",
  WebkitBackdropFilter:
    "blur(15px)",
  padding: "30px",
  borderRadius: "18px",
  border:
    "1px solid rgba(255,255,255,0.12)",
  boxShadow:
    "0 8px 32px rgba(0,0,0,0.25)",
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "18px",
  borderRadius: "10px",
  border:
    "1px solid rgba(255,255,255,0.15)",
  outline: "none",
  background:
    "rgba(255,255,255,0.08)",
  color: "white",
  fontSize: "15px",
  boxSizing: "border-box",
};

const buttonStyle = {
  background:
    "linear-gradient(135deg,#38bdf8,#2563eb)",
  border: "none",
  padding: "14px 24px",
  borderRadius: "10px",
  color: "white",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "600",
  boxShadow:
    "0 4px 15px rgba(56,189,248,0.35)",
};

const labelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "18px",
  fontSize: "16px",
  color: "#e2e8f0",
};

export default Settings;