import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar  from '../components/Topbar';
import API     from '../services/api';
import toast   from 'react-hot-toast';

const DEPTS = ['Computer Science','Electronics','Mechanical','Civil','Electrical','Information Technology'];

function StudentModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || { name:'', email:'', password:'', rollNumber:'', department:'Computer Science', semester:1, section:'A', batch:'2021-2025' });
  const [loading, setLoading] = useState(false);
  const isEdit = !!initial?._id;

  useEffect(() => { setForm(initial || { name:'', email:'', password:'', rollNumber:'', department:'Computer Science', semester:1, section:'A', batch:'2021-2025' }); }, [initial, open]);
  if (!open) return null;

  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const save = async () => {
    if (!form.name || !form.email || (!isEdit && !form.password) || !form.rollNumber) {
      toast.error('Name, email, password and roll number are required'); return;
    }
    setLoading(true);
    try {
      if (isEdit) await API.put(`/students/${initial._id}`, form);
      else        await API.post('/students', form);
      toast.success(isEdit ? 'Student updated ✓' : 'Student added ✓');
      onSave();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Operation failed');
    } finally { setLoading(false); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? '✏️ Edit Student' : '➕ Add Student'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
          {[
            { name:'name',        label:'Full Name *',    type:'text',   placeholder:'Rahul Sharma',   span:2 },
            { name:'email',       label:'Email *',        type:'email',  placeholder:'rahul@college.edu', span:2 },
            ...(!isEdit ? [{ name:'password', label:'Password *', type:'password', placeholder:'Min 6 chars', span:2 }] : []),
            { name:'rollNumber',  label:'Roll Number *',  type:'text',   placeholder:'21CS001',        span:1 },
            { name:'section',     label:'Section',        type:'text',   placeholder:'A',              span:1 },
            { name:'batch',       label:'Batch',          type:'text',   placeholder:'2021-2025',      span:1 },
          ].map(f => (
            <div key={f.name} className="input-group" style={{ gridColumn: f.span===2 ? '1/-1' : 'auto' }}>
              <label className="input-label">{f.label}</label>
              <input className="input" name={f.name} type={f.type} placeholder={f.placeholder} value={form[f.name]||''} onChange={set} />
            </div>
          ))}
          <div className="input-group">
            <label className="input-label">Department</label>
            <select className="input" name="department" value={form.department} onChange={set}>
              {DEPTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Semester</label>
            <select className="input" name="semester" value={form.semester} onChange={set}>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Update Student' : 'Add Student'}
          </button>
        </div>
      </div>
    </div>
  );
}

function GradeTag({ grade }) {
  const cls = { A:' badge-green', 'A+':' badge-blue', B:' badge-amber', F:' badge-red', '-':' badge-gray' }[grade] || ' badge-gray';
  return <span className={'badge'+cls}>{grade || '—'}</span>;
}

function RiskBar({ score }) {
  const color = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#10b981';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div className="progress-track" style={{ width:60 }}>
        <div className="progress-fill" style={{ width:`${score}%`, background:color }} />
      </div>
      <span style={{ fontSize:'0.75rem', color }}>{score}%</span>
    </div>
  );
}

export default function Students() {
  const [students, setStudents]   = useState([]);
  const [search, setSearch]       = useState('');
  console.log("students state =", students);
  const [semFilter, setSemFilter] = useState('');
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState(null);

  const limit = 15;

  const fetchStudents = useCallback(async () => {
  setLoading(true);

  try {
    const params = new URLSearchParams({
      page,
      limit,
    });

    if (search) {
      params.set("search", search);
    }

    if (semFilter) {
      params.set("semester", semFilter);
    }

    const { data } = await API.get(`/students?${params}`);

    console.log("API RESPONSE:", data);
    console.log("STUDENTS:", data.data);

    setStudents(data.data || []);
    console.log("AFTER SET =", data.data);
    setTotal(data.total || 0);
  } catch (err) {
    console.error("FETCH STUDENTS ERROR:", err);
    toast.error("Failed to load students");
  } finally {
    setLoading(false);
  }
}, [page, search, semFilter]);

useEffect(() => {
  fetchStudents();
}, [fetchStudents]);

const handleDelete = async (id, name) => {
  if (!window.confirm(`Deactivate ${name}?`)) return;

  try {
    await API.delete(`/students/${id}`);

    toast.success("Student deactivated");

    fetchStudents();
  } catch (err) {
    toast.error(
      err?.response?.data?.message || "Failed"
    );
  }
};

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="page-body">

          <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div>
              <h1>Students</h1>
              <p>{total} students enrolled</p>
            </div>
            <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true); }}>+ Add Student</button>
          </div>

          {/* Filters */}
          <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
            <div className="search-bar" style={{ flex:1, minWidth:220 }}>
              <span className="search-icon">🔍</span>
              <input className="input" placeholder="Search by name or email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="input" style={{ width:160 }} value={semFilter} onChange={e => { setSemFilter(e.target.value); setPage(1); }}>
              <option value="">All Semesters</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="glass-card" style={{ padding:0, overflow:'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {['#','Student','Roll No.','Department','Sem','CGPA','Attendance','Risk','Status','Actions'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array(5).fill(0).map((_, i) => (
                        <tr key={i}>
                          {Array(10).fill(0).map((_,j) => <td key={j}><div className="skeleton" style={{ height:16, width:'80%' }} /></td>)}
                        </tr>
                      ))
                    : students.length === 0
                      ? <tr><td colSpan={10}><div className="empty-state"><div className="empty-icon">🎓</div><h3>No students found</h3><p>Try adjusting your search or filters.</p></div></td></tr>
                      : students.map((s, i) => (
                          <tr key={s._id}>
                            <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{(page-1)*limit + i+1}</td>
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                <div className="avatar-ring" style={{ width:32, height:32, fontSize:'0.75rem' }}>{(s.name||'?').slice(0,2).toUpperCase()}</div>
                                <div>
                                  <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{s.name}</div>
                                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{s.email}</div>
                                </div>
                              </div>
                            </td>
                            <td><code style={{ fontSize:'0.8rem', color:'var(--brand-400)' }}>{s.rollNumber}</code></td>
                            <td style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>{s.department}</td>
                            <td><span className="badge badge-blue">Sem {s.semester}</span></td>
                            <td><span style={{ fontWeight:700, color: s.cgpa >= 8 ? '#10b981' : s.cgpa >= 6 ? '#f59e0b' : s.cgpa > 0 ? '#ef4444' : 'var(--text-muted)' }}>{s.cgpa?.toFixed?.(2) || '—'}</span></td>
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                <div className="progress-track" style={{ width:48 }}>
                                  <div className="progress-fill" style={{ width:`${s.attendancePercentage||0}%`, background: (s.attendancePercentage||0) >= 75 ? '#10b981' : '#ef4444' }} />
                                </div>
                                <span style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>{s.attendancePercentage||0}%</span>
                              </div>
                            </td>
                            <td><RiskBar score={s.riskScore||0} /></td>
                            <td><span className={`badge ${s.isActive ? 'badge-green' : 'badge-red'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                            <td>
                              <div style={{ display:'flex', gap:6 }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(s); setModal(true); }}>Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id, s.name)}>Remove</button>
                              </div>
                            </td>
                          </tr>
                        ))
                  }
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, padding:16, borderTop:'1px solid var(--border-subtle)' }}>
                <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p=>p-1)}>← Prev</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_,i) => (
                  <button key={i+1} className={`btn btn-sm ${page===i+1 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPage(i+1)}>{i+1}</button>
                ))}
                <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p=>p+1)}>Next →</button>
              </div>
            )}
          </div>

        </div>
      </div>

      <StudentModal open={modal} onClose={() => setModal(false)} onSave={() => { setModal(false); fetchStudents(); }} initial={editing} />
    </div>
  );
}