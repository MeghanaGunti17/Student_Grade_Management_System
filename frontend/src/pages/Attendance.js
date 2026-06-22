import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import toast from "react-hot-toast";

const STATUSES = ['present','absent','late','leave'];
const STATUS_COLOR = { present:'#10b981', absent:'#ef4444', late:'#f59e0b', leave:'#6366f1' };
const STATUS_BG    = { present:'rgba(16,185,129,0.18)', absent:'rgba(239,68,68,0.18)', late:'rgba(245,158,11,0.18)', leave:'rgba(99,102,241,0.18)' };

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ studentName:'', date: new Date().toISOString().slice(0,10), status:'present', remarks:'' });
  const [saving, setSaving]         = useState(false);
  const role = localStorage.getItem('role') || 'admin';

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("/attendance");
      if (response.data.success) setAttendance(response.data.data || []);
    } catch (error) {
      console.error("Attendance Error:", error);
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  useEffect(() => {
    let data = [...attendance];
    if (searchTerm) data = data.filter(r => (r.studentName||'').toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter !== "all") data = data.filter(r => r.status === statusFilter);
    setFiltered(data);
  }, [attendance, searchTerm, statusFilter]);

  const totalRecords = attendance.length;
  const presentCount = attendance.filter(r => r.status === "present").length;
  const absentCount  = attendance.filter(r => r.status === "absent").length;
  const lateCount    = attendance.filter(r => r.status === "late").length;
  const overallRate  = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

  const handleSubmit = async () => {
    if (!form.studentName || !form.date || !form.status) {
      toast.error("Student name, date and status are required"); return;
    }
    setSaving(true);
    try {
      await API.post('/attendance', {
        studentId: form.studentName,
        studentName: form.studentName,
        subjectId: 'general',
        date: form.date,
        status: form.status,
        remarks: form.remarks,
      });
      toast.success("Attendance marked ✓");
      setForm({ studentName:'', date: new Date().toISOString().slice(0,10), status:'present', remarks:'' });
      setShowForm(false);
      fetchAttendance();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to mark attendance');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this attendance record?')) return;
    try {
      await API.delete(`/attendance/${id}`);
      toast.success('Record removed');
      fetchAttendance();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div style={{ minHeight:"100vh" }}>
      <Sidebar />
      <div style={{ marginLeft:"260px", width:"calc(100% - 260px)", padding:"30px", color:"white", boxSizing:"border-box" }}>
        <Topbar title="Attendance Management" />

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <h1 style={{ fontSize:"2rem", margin:0 }}>📅 Attendance Management</h1>
          {!showForm && (
            <button onClick={() => setShowForm(true)} style={{
              padding:'10px 20px', borderRadius:10, border:'none',
              background:'linear-gradient(135deg,#3b82f6,#2563eb)', color:'white',
              fontWeight:700, cursor:'pointer', fontSize:'0.9rem'
            }}>+ Mark Attendance</button>
          )}
        </div>

        {/* Add Attendance Form */}
        {showForm && (
          <div style={{ background:'rgba(17,29,53,0.9)', borderRadius:16, padding:24, marginBottom:24, border:'1px solid rgba(59,130,246,0.4)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ margin:0, fontSize:'1.1rem' }}>➕ Mark Attendance</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:'1.2rem' }}>✕</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'#94a3b8', marginBottom:6, fontWeight:600 }}>Student Name *</label>
                <input value={form.studentName} onChange={e => setForm(p => ({...p, studentName: e.target.value}))}
                  placeholder="e.g. Ravi Kumar" style={inputStyle} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'#94a3b8', marginBottom:6, fontWeight:600 }}>Date *</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'#94a3b8', marginBottom:6, fontWeight:600 }}>Status *</label>
                <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))} style={inputStyle}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', color:'#94a3b8', marginBottom:6, fontWeight:600 }}>Remarks</label>
                <input value={form.remarks} onChange={e => setForm(p => ({...p, remarks: e.target.value}))}
                  placeholder="Optional note" style={inputStyle} />
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              <button onClick={handleSubmit} disabled={saving} style={{
                padding:'10px 24px', borderRadius:10, border:'none',
                background:'linear-gradient(135deg,#3b82f6,#2563eb)', color:'white',
                fontWeight:700, cursor:saving?'default':'pointer', opacity:saving?0.7:1
              }}>{saving ? 'Saving…' : 'Mark Attendance'}</button>
              <button onClick={() => setShowForm(false)} style={{ padding:'10px 20px', borderRadius:10, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#94a3b8', cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign:'center', padding:60, color:'#94a3b8' }}>⏳ Loading Attendance...</div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginBottom:28 }}>
              {[
                { label:'Total Records', value: totalRecords, icon:'📋', color:'#38bdf8' },
                { label:'✅ Present',    value: presentCount, icon:'✅', color:'#10b981' },
                { label:'❌ Absent',     value: absentCount,  icon:'❌', color:'#ef4444' },
                { label:'⏰ Late',       value: lateCount,    icon:'⏰', color:'#f59e0b' },
                { label:'Overall Rate',  value: `${overallRate}%`, icon:'📊', color: overallRate>=75?'#10b981':'#ef4444' },
              ].map(c => (
                <div key={c.label} style={cardStyle}>
                  <div style={{ fontSize:'1.4rem', marginBottom:8 }}>{c.icon}</div>
                  <div style={{ fontSize:'1.8rem', fontWeight:800, color: c.color }}>{c.value}</div>
                  <div style={{ fontSize:'0.8rem', color:'#94a3b8', marginTop:4 }}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
              <input type="text" placeholder="Search Student..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} style={{ ...inputStyle, flex:1, minWidth:200 }} />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inputStyle, width:180 }}>
                <option value="all">All Status</option>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </div>

            {/* Table */}
            <div style={tableContainer}>
              <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h2 style={{ margin:0, fontSize:'1rem' }}>📋 Attendance Records</h2>
                <span style={{ fontSize:'0.8rem', color:'#64748b' }}>{filtered.length} records</span>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    {['Student', 'Status', 'Date', 'Remarks', ...(role==='admin' ? ['Actions'] : [])].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((record, index) => (
                      <tr key={index} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                        <td style={tdStyle}><span style={{ fontWeight:600 }}>{record.studentName}</span></td>
                        <td style={tdStyle}>
                          <span style={{ padding:"5px 14px", borderRadius:"20px", fontWeight:"600", fontSize:'0.82rem',
                            background: STATUS_BG[record.status] || 'rgba(100,116,139,0.2)',
                            color: STATUS_COLOR[record.status] || '#94a3b8' }}>
                            {record.status}
                          </span>
                        </td>
                        <td style={tdStyle}>{new Date(record.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</td>
                        <td style={{ ...tdStyle, color:'#64748b', fontSize:'0.85rem' }}>{record.remarks || '—'}</td>
                        {role === 'admin' && (
                          <td style={tdStyle}>
                            <button onClick={() => handleDelete(record._id)} style={{ padding:'5px 12px', borderRadius:8, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.1)', color:'#ef4444', cursor:'pointer', fontSize:'0.8rem' }}>Remove</button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={role==='admin'?5:4} style={{ textAlign:"center", padding:"50px", color:"#64748b" }}>
                        <div style={{ fontSize:'2.5rem', marginBottom:12 }}>📋</div>
                        <div style={{ fontWeight:600, marginBottom:6 }}>No Attendance Records Found</div>
                        <div style={{ fontSize:'0.85rem' }}>
                          {role === 'faculty' ? 'Use the Attendance tab in Faculty Dashboard to mark attendance.' : 'Click "+ Mark Attendance" to add records.'}
                        </div>
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
  background: "rgba(17,29,53,0.85)", backdropFilter:"blur(20px)",
  borderRadius:14, padding:"22px 18px",
  border:"1px solid rgba(255,255,255,0.08)", textAlign:"center",
};
const tableContainer = {
  background:"rgba(17,29,53,0.85)", backdropFilter:"blur(20px)",
  borderRadius:16, border:"1px solid rgba(255,255,255,0.08)", overflowX:"auto",
};
const inputStyle = {
  padding:"12px 16px", borderRadius:10,
  border:"1px solid rgba(255,255,255,0.12)",
  background:"rgba(255,255,255,0.06)", color:"white",
  outline:'none', width:'100%', boxSizing:'border-box', fontSize:'0.9rem',
};
const thStyle = { padding:"13px 16px", textAlign:"left", fontSize:'0.78rem', color:'#64748b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid rgba(255,255,255,0.06)' };
const tdStyle  = { padding:"13px 16px" };
