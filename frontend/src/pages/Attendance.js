import { useEffect, useState } from "react";
import API from "../services/api";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] =
    useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    let data = [...attendance];

    if (searchTerm) {
      data = data.filter((record) =>
        record.studentName
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          )
      );
    }

    if (statusFilter !== "all") {
      data = data.filter(
        (record) =>
          record.status === statusFilter
      );
    }

    setFilteredAttendance(data);
  }, [
    attendance,
    searchTerm,
    statusFilter,
  ]);

  const fetchAttendance = async () => {
    try {
      const response =
        await API.get("/attendance");

      if (response.data.success) {
        setAttendance(
          response.data.data || []
        );
      }
    } catch (error) {
      console.error(
        "Attendance Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const totalRecords =
    attendance.length;

  const presentCount =
    attendance.filter(
      (item) =>
        item.status === "present"
    ).length;

  const absentCount =
    attendance.filter(
      (item) =>
        item.status === "absent"
    ).length;

  const lateCount =
    attendance.filter(
      (item) =>
        item.status === "late"
    ).length;

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
          width:
            "calc(100% - 260px)",
          padding: "30px",
          color: "white",
        }}
      >
        <Topbar title="Attendance Management" />

        <h1
          style={{
            fontSize: "42px",
            marginBottom: "25px",
          }}
        >
          📅 Attendance Management
        </h1>

        {loading ? (
          <h2>
            Loading Attendance...
          </h2>
        ) : (
          <>
            {/* Stats Cards */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(250px,1fr))",
                gap: "20px",
                marginBottom: "30px",
              }}
            >
              <div style={cardStyle}>
                <h3>Total Records</h3>
                <h1>{totalRecords}</h1>
              </div>

              <div style={cardStyle}>
                <h3>✅ Present</h3>
                <h1>{presentCount}</h1>
              </div>

              <div style={cardStyle}>
                <h3>❌ Absent</h3>
                <h1>{absentCount}</h1>
              </div>

              <div style={cardStyle}>
                <h3>⏰ Late</h3>
                <h1>{lateCount}</h1>
              </div>
            </div>

            {/* Filters */}

            <div
              style={{
                display: "flex",
                gap: "15px",
                marginBottom: "25px",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                placeholder="Search Student..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                style={inputStyle}
              />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                style={inputStyle}
              >
                <option value="all">
                  All Status
                </option>

                <option value="present">
                  Present
                </option>

                <option value="absent">
                  Absent
                </option>

                <option value="late">
                  Late
                </option>

                <option value="leave">
                  Leave
                </option>
              </select>
            </div>

            {/* Table */}

            <div style={tableContainer}>
              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>
                      Student
                    </th>

                    <th style={thStyle}>
                      Status
                    </th>

                    <th style={thStyle}>
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAttendance.length >
                  0 ? (
                    filteredAttendance.map(
                      (
                        record,
                        index
                      ) => (
                        <tr
                          key={index}
                        >
                          <td
                            style={
                              tdStyle
                            }
                          >
                            {
                              record.studentName
                            }
                          </td>

                          <td
                            style={
                              tdStyle
                            }
                          >
                            <span
                              style={{
                                padding:
                                  "6px 12px",
                                borderRadius:
                                  "20px",
                                fontWeight:
                                  "600",
                                background:
                                  record.status ===
                                  "present"
                                    ? "rgba(34,197,94,0.2)"
                                    : record.status ===
                                      "absent"
                                    ? "rgba(239,68,68,0.2)"
                                    : "rgba(245,158,11,0.2)",

                                color:
                                  record.status ===
                                  "present"
                                    ? "#22c55e"
                                    : record.status ===
                                      "absent"
                                    ? "#ef4444"
                                    : "#f59e0b",
                              }}
                            >
                              {
                                record.status
                              }
                            </span>
                          </td>

                          <td
                            style={
                              tdStyle
                            }
                          >
                            {new Date(
                              record.date
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "30px",
                          color:
                            "#94a3b8",
                        }}
                      >
                        No Attendance Records Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const cardStyle = {
  background:
    "rgba(255,255,255,0.12)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter:
    "blur(20px)",
  borderRadius: "15px",
  padding: "25px",
  border:
    "1px solid rgba(255,255,255,0.15)",
  textAlign: "center",
};

const tableContainer = {
  background:
    "rgba(255,255,255,0.12)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter:
    "blur(20px)",
  borderRadius: "15px",
  padding: "20px",
  border:
    "1px solid rgba(255,255,255,0.15)",
  overflowX: "auto",
};

const thStyle = {
  padding: "15px",
  textAlign: "left",
  borderBottom:
    "1px solid rgba(255,255,255,0.15)",
};

const tdStyle = {
  padding: "15px",
  borderBottom:
    "1px solid rgba(255,255,255,0.08)",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border:
    "1px solid rgba(255,255,255,0.15)",
  background:
    "rgba(255,255,255,0.08)",
  color: "white",
  minWidth: "220px",
};