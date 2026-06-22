import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import toast from "react-hot-toast";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell
} from "recharts";

const RISK_COLOR = score => score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#10b981';

function StatCard({ icon, label, value, sub, color, glow }) {
  return (
    <div style={{
      background: 'rgba(17,29,53,0.85)', backdropFilter:'blur(20px)',
      borderRadius:16, padding:'24px 20px',
      border: `1px solid ${glow ? color+'55' : 'rgba(255,255,255,0.08)'}`,
      boxShadow: glow ? `0 0 20px ${color}22` : 'none',
      display:'flex', flexDirection:'column', gap:8
    }}>
      <div style={{ fontSize:'1.6rem' }}>{icon}</div>
      <div style={{ fontSize:'2rem', fontWeight:800, color: color || '#f0f4ff' }}>{value}</div>
      <div style={{ fontSize:'0.9rem', fontWeight:600, color:'#f0f4ff' }}>{label}</div>
      {sub && <div style={{ fontSize:'0.78rem', color:'#64748b' }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ totalStudents:0, totalFaculty:0, averageCGPA:0, passRate:0, atRiskStudents:0 });
  const [atRiskList, setAtRiskList] = useState([]);
  const [attRecords, setAttRecords] = useState([]);
  const [gradeData, setGradeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, studentsRes, attRes] = await Promise.all([
        API.get("/analytics"),
        API.get("/students?limit=200"),
        API.get("/attendance"),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);

      const allStudents = studentsRes.data.data || [];
      const risks = allStudents
        .filter(s => (s.riskScore || 0) > 0 || (s.cgpa || 0) < 5 || (s.attendancePercentage || 0) < 75)
        .sort((a,b) => (b.riskScore||0) - (a.riskScore||0));
      setAtRiskList(risks);

      if (attRes.data.success) setAttRecords(attRes.data.data || []);

      // Build grade distribution from students
      const gradeMap = {};
      allStudents.forEach(s => {
        const cgpa = s.cgpa || 0;
        let grade = cgpa >= 9 ? 'O' : cgpa >= 8 ? 'A+' : cgpa >= 7 ? 'A' : cgpa >= 6 ? 'B+' : cgpa >= 5 ? 'B' : cgpa > 0 ? 'C' : 'N/A';
        gradeMap[grade] = (gradeMap[grade] || 0) + 1;
      });
      setGradeData(Object.entries(gradeMap).map(([grade, count]) => ({ grade, count })));

    } catch (err) {
      console.error("Dashboard Error:", err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Attendance stats
  const attTotal   = attRecords.length;
  const attPresent = attRecords.filter(r => r.status === 'present').length;
  const attRate    = attTotal > 0 ? Math.round((attPresent/attTotal)*100) : 0;
  const attAbsent  = attRecords.filter(r => r.status === 'absent').length;
  const attLate    = attRecords.filter(r => r.status === 'late').length;

  // Recent attendance (last 10)
  const recentAtt = [...attRecords].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,10);

  const navItems = [
    { id:'overview',   label:'Overview',   icon:'⬡' },
    { id:'atrisk',     label:'At-Risk Students', icon:'⚠️' },
    { id:'attendance', label:'Attendance', icon:'📋' },
  ];

  return (
    <div style={{ minHeight:'100vh' }}>
      <Sidebar />
      <div style={{ marginLeft:'260px', width:'calc(100% - 260px)', padding:'30px', color:'white', boxSizing:'border-box' }}>
        <Topbar title="Admin Dashboard" />

        {/* Sub-nav */}
        <div style={{ display:'flex', gap:8, marginBottom:28, marginTop:8, flexWrap:'wrap' }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setActiveSection(n.id)} style={{
              padding:'8px 18px', borderRadius:10, border:'1px solid',
              cursor:'pointer', fontWeight:600, fontSize:'0.875rem', transition:'all 0.2s',
              background: activeSection===n.id ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)',
              borderColor: activeSection===n.id ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.1)',
              color:'white'
            }}>{n.icon} {n.label}</button>
          ))}
          <button onClick={fetchAll} style={{ marginLeft:'auto', padding:'8px 16px', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#94a3b8', cursor:'pointer', fontSize:'0.8rem' }}>↻ Refresh</button>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:60, color:'#94a3b8', fontSize:'1.2rem' }}>⏳ Loading Dashboard...</div>
        ) : (
          <>
            {/* ══ OVERVIEW ══ */}
            {activeSection === 'overview' && (
              <>
                <h1 style={{ fontSize:'2rem', marginBottom:24, marginTop:0 }}>📊 Admin Dashboard</h1>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:20, marginBottom:32 }}>
                  <StatCard icon="👨‍🎓" label="Total Students"   value={stats.totalStudents}         color="#38bdf8" />
                  <StatCard icon="👩‍🏫" label="Total Faculty"    value={stats.totalFaculty}          color="#a78bfa" />
                  <StatCard icon="📚" label="Average CGPA"     value={Number(stats.averageCGPA||0).toFixed(2)} color="#34d399" />
                  <StatCard icon="📈" label="Pass Rate"         value={`${stats.passRate}%`}        color="#10b981" />
                  <StatCard icon="⚠️" label="At-Risk Students"  value={stats.atRiskStudents}         color="#ef4444" glow />
                  <StatCard icon="📋" label="Attendance Rate"   value={`${attRate}%`} sub={`${attTotal} records`} color={attRate>=75?'#10b981':'#ef4444'} glow={attRate<75} />
                </div>

                {/* Grade distribution chart */}
                {gradeData.length > 0 && (
                  <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:16, padding:24, marginBottom:24, border:'1px solid rgba(255,255,255,0.08)' }}>
                    <h2 style={{ marginBottom:20, fontSize:'1.1rem' }}>📊 Grade Distribution (by CGPA)</h2>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={gradeData} margin={{ top:5, right:20, bottom:5, left:0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="grade" tick={{ fill:'#94a3b8', fontSize:12 }} />
                        <YAxis tick={{ fill:'#94a3b8', fontSize:12 }} />
                        <Tooltip contentStyle={{ background:'#0d1526', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'white' }} />
                        <Bar dataKey="count" name="Students" radius={[4,4,0,0]}>
                          {gradeData.map((_, i) => (
                            <Cell key={i} fill={['#10b981','#3b82f6','#7c3aed','#f59e0b','#f97316','#ef4444','#64748b'][i % 7]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* System status */}
                <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:16, padding:24, border:'1px solid rgba(255,255,255,0.08)' }}>
                  <h2 style={{ marginBottom:16, fontSize:'1.1rem' }}>📌 System Status</h2>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12 }}>
                    {[
                      ['✅ Analytics API', 'Connected'],
                      ['✅ MongoDB', 'Connected'],
                      ['✅ Backend Server', 'Running'],
                      [attRate < 75 ? '⚠️ Attendance' : '✅ Attendance', attRate < 75 ? `Low (${attRate}%)` : `Good (${attRate}%)`],
                      [stats.atRiskStudents > 0 ? '⚠️ At-Risk Alert' : '✅ Student Health', stats.atRiskStudents > 0 ? `${stats.atRiskStudents} students need attention` : 'All students doing well'],
                    ].map(([label, val]) => (
                      <div key={label} style={{ padding:'12px 16px', background:'rgba(255,255,255,0.04)', borderRadius:10, border:'1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{label}</div>
                        <div style={{ color:'#94a3b8', fontSize:'0.8rem', marginTop:4 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ══ AT-RISK STUDENTS ══ */}
            {activeSection === 'atrisk' && (
              <>
                <h1 style={{ fontSize:'2rem', marginBottom:8, marginTop:0 }}>⚠️ At-Risk Students</h1>
                <p style={{ color:'#94a3b8', marginBottom:24 }}>Students with CGPA below 5, attendance below 75%, or high risk score</p>

                {atRiskList.length === 0 ? (
                  <div style={{ textAlign:'center', padding:60, background:'rgba(16,185,129,0.08)', borderRadius:16, border:'1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ fontSize:'3rem', marginBottom:16 }}>🎉</div>
                    <h2 style={{ color:'#10b981' }}>All Students Performing Well!</h2>
                    <p style={{ color:'#94a3b8' }}>No students currently flagged as at-risk.</p>
                  </div>
                ) : (
                  <>
                    <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, padding:'14px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:'1.2rem' }}>🚨</span>
                      <span style={{ color:'#fca5a5', fontWeight:600 }}>{atRiskList.length} students need immediate attention</span>
                    </div>
                    <div style={{ background:'rgba(17,29,53,0.85)', borderRadius:16, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ overflowX:'auto' }}>
                        <table style={{ width:'100%', borderCollapse:'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                              {['Student','Roll No.','Department','Sem','CGPA','Attendance','Risk Score','Risk Level'].map(h => (
                                <th key={h} style={{ padding:'14px 16px', textAlign:'left', fontSize:'0.8rem', color:'#64748b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {atRiskList.map((s, i) => {
                              const risk = s.riskScore || 0;
                              const rColor = RISK_COLOR(risk);
                              const rLabel = risk >= 70 ? 'High Risk' : risk >= 40 ? 'Medium Risk' : 'Low Risk';
                              return (
                                <tr key={s._id} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                                  <td style={{ padding:'14px 16px' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                      <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#ef4444,#dc2626)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700 }}>
                                        {(s.name||'?').slice(0,2).toUpperCase()}
                                      </div>
                                      <div>
                                        <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{s.name}</div>
                                        <div style={{ fontSize:'0.75rem', color:'#64748b' }}>{s.email}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ padding:'14px 16px' }}><code style={{ color:'#60a5fa', fontSize:'0.8rem' }}>{s.rollNumber}</code></td>
                                  <td style={{ padding:'14px 16px', color:'#94a3b8', fontSize:'0.85rem' }}>{s.department}</td>
                                  <td style={{ padding:'14px 16px' }}><span style={{ padding:'3px 10px', borderRadius:20, background:'rgba(59,130,246,0.2)', color:'#60a5fa', fontSize:'0.8rem', fontWeight:600 }}>Sem {s.semester}</span></td>
                                  <td style={{ padding:'14px 16px' }}>
                                    <span style={{ fontWeight:700, color: (s.cgpa||0) >= 6 ? '#f59e0b' : '#ef4444', fontSize:'1rem' }}>{(s.cgpa||0).toFixed(2)}</span>
                                  </td>
                                  <td style={{ padding:'14px 16px' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                      <div style={{ width:50, height:6, borderRadius:3, background:'rgba(255,255,255,0.1)', overflow:'hidden' }}>
                                        <div style={{ height:'100%', width:`${s.attendancePercentage||0}%`, background:(s.attendancePercentage||0)>=75?'#10b981':'#ef4444', borderRadius:3 }} />
                                      </div>
                                      <span style={{ fontSize:'0.8rem', color:(s.attendancePercentage||0)>=75?'#10b981':'#ef4444' }}>{s.attendancePercentage||0}%</span>
                                    </div>
                                  </td>
                                  <td style={{ padding:'14px 16px' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                      <div style={{ width:50, height:6, borderRadius:3, background:'rgba(255,255,255,0.1)', overflow:'hidden' }}>
                                        <div style={{ height:'100%', width:`${risk}%`, background:rColor, borderRadius:3 }} />
                                      </div>
                                      <span style={{ fontSize:'0.8rem', color:rColor }}>{risk}%</span>
                                    </div>
                                  </td>
                                  <td style={{ padding:'14px 16px' }}>
                                    <span style={{ padding:'4px 12px', borderRadius:20, fontSize:'0.75rem', fontWeight:700,
                                      background: risk>=70?'rgba(239,68,68,0.2)':risk>=40?'rgba(245,158,11,0.2)':'rgba(16,185,129,0.2)',
                                      color: rColor }}>{rLabel}</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ══ ATTENDANCE ══ */}
            {activeSection === 'attendance' && (
              <>
                <h1 style={{ fontSize:'2rem', marginBottom:24, marginTop:0 }}>📋 Attendance Overview</h1>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:28 }}>
                  <StatCard icon="📋" label="Total Records" value={attTotal} color="#38bdf8" />
                  <StatCard icon="✅" label="Present"       value={attPresent} color="#10b981" />
                  <StatCard icon="❌" label="Absent"        value={attAbsent}  color="#ef4444" />
                  <StatCard icon="⏰" label="Late"          value={attLate}    color="#f59e0b" />
                  <StatCard icon="📊" label="Overall Rate"  value={`${attRate}%`} color={attRate>=75?'#10b981':'#ef4444'} glow={attRate<75} />
                </div>

                <div style={{ background:'rgba(17,29,53,0.85)', borderRadius:16, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <h2 style={{ margin:0, fontSize:'1.05rem' }}>Recent Attendance Records</h2>
                    <span style={{ fontSize:'0.8rem', color:'#64748b' }}>{recentAtt.length} recent</span>
                  </div>
                  <div style={{ overflowX:'auto' }}>
                    {recentAtt.length === 0 ? (
                      <div style={{ textAlign:'center', padding:48, color:'#64748b' }}>
                        <div style={{ fontSize:'2.5rem', marginBottom:12 }}>📋</div>
                        <div style={{ fontWeight:600 }}>No Attendance Records Yet</div>
                        <div style={{ fontSize:'0.85rem', marginTop:8 }}>Faculty can mark attendance from the Faculty Dashboard → Attendance tab.</div>
                      </div>
                    ) : (
                      <table style={{ width:'100%', borderCollapse:'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                            {['Student','Status','Date'].map(h => (
                              <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:'0.78rem', color:'#64748b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {recentAtt.map((r, i) => (
                            <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                              <td style={{ padding:'12px 16px', fontWeight:600, fontSize:'0.9rem' }}>{r.studentName}</td>
                              <td style={{ padding:'12px 16px' }}>
                                <span style={{ padding:'4px 12px', borderRadius:20, fontSize:'0.8rem', fontWeight:600,
                                  background: r.status==='present'?'rgba(16,185,129,0.2)':r.status==='absent'?'rgba(239,68,68,0.2)':'rgba(245,158,11,0.2)',
                                  color: r.status==='present'?'#10b981':r.status==='absent'?'#ef4444':'#f59e0b' }}>
                                  {r.status}
                                </span>
                              </td>
                              <td style={{ padding:'12px 16px', color:'#94a3b8', fontSize:'0.85rem' }}>
                                {new Date(r.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}