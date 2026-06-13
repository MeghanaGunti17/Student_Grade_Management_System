  import { useEffect, useState } from 'react';
  import Sidebar from '../components/Sidebar';
  import Topbar  from '../components/Topbar';
  import API     from '../services/api';
  import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, PieChart, Pie, Cell, Legend,
    LineChart, Line
  } from 'recharts';

  const PIE_COLORS = ['#10b981','#3b82f6','#7c3aed','#f59e0b','#f97316','#ef4444','#94a3b8'];

  function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
      <div className="custom-tooltip">
        <div style={{ fontWeight:600, marginBottom:4 }}>{label}</div>
        {payload.map(p => <div key={p.name} style={{ color:p.color, fontSize:'0.8125rem' }}>{p.name}: {p.value}</div>)}
      </div>
    );
  }



  export default function Analytics() {
  const [stats, setStats] =
    useState({});

  const [gradeDist,
    setGradeDist] =
    useState([]);

  const [trendData,
    setTrendData] =
    useState([]);

  const [deptData,
    setDeptData] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

    useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const [
        statsRes,
        gradeRes,
        trendRes,
        deptRes,
      ] = await Promise.all([
        API.get("/analytics"),
        API.get("/results/grade-distribution"),

        API.get("/analytics/trends").catch(() => ({
          data: {
            success: true,
            data: [],
          },
        })),

        API.get("/analytics/departments").catch(() => ({
          data: {
            success: true,
            data: [],
          },
        })),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (gradeRes.data.success) {
        setGradeDist(
          gradeRes.data.data.map(
            (item, index) => ({
              grade: item._id,
              count: item.count,
              fill:
                PIE_COLORS[
                  index %
                    PIE_COLORS.length
                ],
            })
          )
        );
      }

      if (trendRes.data.success) {
        setTrendData(
          trendRes.data.data
        );
      }

      if (deptRes.data.success) {
        setDeptData(
          deptRes.data.data
        );
      }
    } catch (error) {
      console.error(
        "Analytics Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  fetchAnalytics();
}, []);

    const insights = [
  {
    icon: "📈",
    text: `Average CGPA is ${
      stats.averageCGPA || 0
    }`,
  },
  {
    icon: "⚠️",
    text: `${
      stats.atRiskStudents ||
      0
    } students are at risk due to low attendance or CGPA.`,
  },
  {
    icon: "🏆",
    text: `Total students enrolled: ${
      stats.totalStudents || 0
    }`,
  },
  {
    icon: "📋",
    text: `Faculty members: ${
      stats.totalFaculty || 0
    }`,
  },
  {
    icon: "✅",
    text: `Pass rate is ${
      stats.passRate || 0
    }%`,
  },
];

    return (
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <div className="page-body">

            <div className="page-header">
              <h1>Analytics</h1>
              <p>System-wide academic performance insights</p>
            </div>

            {/* KPI Cards */}
            <div className="grid-4" style={{ marginBottom:28 }}>
              {[
                { label:'Total Students',  value: stats.totalStudents||0,                icon:'🎓', accent:'linear-gradient(90deg,#3b82f6,#06b6d4)' },
                { label:'Average CGPA',    value: Number(
  stats.averageCGPA || 0
).toFixed(2), icon:'⭐', accent:'linear-gradient(90deg,#7c3aed,#6366f1)' },
                { label:'Pass Rate',       value: `${stats.passRate||0}%`,                icon:'✅', accent:'linear-gradient(90deg,#10b981,#059669)' },
                { label:'At-Risk Students',value:
  stats.atRiskStudents ||
  stats.atRiskCount ||
  0,                  icon:'⚠️', accent:'linear-gradient(90deg,#f59e0b,#ef4444)' },
              ].map((c,i) => (
                <div key={i} className="stat-card" style={{ '--card-accent': c.accent }}>
                  <div className="stat-icon" style={{ background:'var(--bg-glass)', border:'1px solid var(--border-default)' }}>{c.icon}</div>
                  <div className="stat-label">{c.label}</div>
                  <div className="stat-value">{loading ? <div className="skeleton" style={{ height:32,width:60 }} /> : c.value}</div>
                </div>
              ))}
            </div>

            <div className="grid-2" style={{ marginBottom:28 }}>
              {/* CGPA & Attendance Trend */}
              <div className="glass-card">
                <h2 style={{ marginBottom:20 }}>📈 CGPA & Attendance Trend</h2>
                <ResponsiveContainer width="100%" height={230}>
                  <LineChart
  data={
    trendData.length
      ? trendData
      : [
          {
            month: "No Data",
            cgpa: 0,
            attendance: 0,
          },
        ]
  }
>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize:11 }} />
                    <YAxis yAxisId="left" stroke="var(--text-muted)" tick={{ fontSize:11 }} domain={[5,10]} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" tick={{ fontSize:11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="cgpa" name="CGPA" stroke="#3b82f6" strokeWidth={2} dot={{ fill:'#3b82f6', r:4 }} />
                    <Line yAxisId="right" type="monotone" dataKey="attendance" name="Attendance %" stroke="#10b981" strokeWidth={2} dot={{ fill:'#10b981', r:4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Grade Distribution Pie */}
              <div className="glass-card">
                <h2 style={{ marginBottom:20 }}>🏅 Grade Distribution</h2>
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
  data={
    gradeDist.length
      ? gradeDist
      : [
          {
            grade: "No Data",
            count: 1,
            fill: "#ffffff",
          },
        ]
  } dataKey="count" nameKey="grade" cx="50%" cy="50%" outerRadius={80} label={({ grade, percent }) => `${grade} ${(percent*100).toFixed(0)}%`} labelLine>
                      {(
  gradeDist.length
    ? gradeDist
    : [
        {
          grade: "No Data",
          count: 1,
          fill: "#ffffff",
        },
      ]
).map((d, i) => (
  <Cell
    key={i}
    fill={d.fill}
  />
))}
                    </Pie>
                    <Tooltip formatter={(val, name) => [`${val} students`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department performance */}
            <div className="glass-card" style={{ marginBottom:28 }}>
              <h2 style={{ marginBottom:20 }}>🏛 Department-wise Performance</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
  data={
    deptData.length
      ? deptData
      : [
          {
            dept: "No Data",
            students: 0,
            cgpa: 0,
          },
        ]
  }
>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="dept" stroke="var(--text-muted)" tick={{ fontSize:12 }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize:12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="students" name="Students" fill="#3b82f6" radius={[6,6,0,0]} />
                  <Bar dataKey="cgpa"     name="Avg CGPA" fill="#7c3aed" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* AI Insights */}
            <div className="glass-card">
              <h2 style={{ marginBottom:20 }}>🤖 AI Performance Insights</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {insights.map((ins, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'14px 16px', background:'var(--bg-glass)', borderRadius:'var(--r-sm)', border:'1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize:'1.25rem', lineHeight:1, flexShrink:0 }}>{ins.icon}</span>
                    <span style={{ fontSize:'0.9rem', color:'var(--text-secondary)', lineHeight:1.6 }}>{ins.text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }