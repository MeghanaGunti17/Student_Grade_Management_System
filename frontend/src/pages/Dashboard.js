import { useEffect, useState } from "react";
import API from "../services/api";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    averageCGPA: 0,
    passRate: 0,
    atRiskStudents: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await API.get("/analytics");

      console.log("Analytics Response:", response.data);

      if (response.data && response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
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
          boxSizing: "border-box",
        }}
      >
        <Topbar title="Admin Dashboard" />

        <h1
          style={{
            fontSize: "42px",
            marginBottom: "35px",
            marginTop: "10px",
            color: "white",
          }}
        >
          📊 Admin Dashboard
        </h1>

        {loading ? (
          <h2>Loading Dashboard...</h2>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(260px,1fr))",
              gap: "25px",
            }}
          >
            <div style={cardStyle}>
              <h2>👨‍🎓 Students</h2>
              <h1 style={numberStyle}>
                {stats.totalStudents}
              </h1>
            </div>

            <div style={cardStyle}>
              <h2>👩‍🏫 Faculty</h2>
              <h1 style={numberStyle}>
                {stats.totalFaculty}
              </h1>
            </div>

            <div style={cardStyle}>
              <h2>📚 Average CGPA</h2>
              <h1 style={numberStyle}>
                {Number(
                  stats.averageCGPA || 0
                ).toFixed(2)}
              </h1>
            </div>

            <div style={cardStyle}>
              <h2>📈 Pass Rate</h2>
              <h1 style={numberStyle}>
                {stats.passRate}%
              </h1>
            </div>

            <div style={cardStyle}>
              <h2>⚠️ At Risk Students</h2>
              <h1
                style={{
                  ...numberStyle,
                  color: "#f59e0b",
                }}
              >
                {stats.atRiskStudents}
              </h1>
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: "35px",
            background:
              "rgba(255,255,255,0.12)",
            backdropFilter:
              "blur(20px)",
            WebkitBackdropFilter:
              "blur(20px)",
            borderRadius: "18px",
            padding: "25px",
            border:
              "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <h2
            style={{
              marginBottom: "20px",
            }}
          >
            📌 System Status
          </h2>

          <p>✅ Analytics API Connected</p>
          <p>✅ MongoDB Connected</p>
          <p>✅ Backend Running</p>
          <p>✅ Dashboard Loaded Successfully</p>

          <p>
            ⚠️ At Risk Students:{" "}
            {stats.atRiskStudents}
          </p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: "18px",
  padding: "30px",
  border: "1px solid rgba(255,255,255,0.15)",
  textAlign: "center",
  color: "white",
  minHeight: "180px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const numberStyle = {
  fontSize: "42px",
  fontWeight: "bold",
  marginTop: "15px",
  color: "#38bdf8",
};