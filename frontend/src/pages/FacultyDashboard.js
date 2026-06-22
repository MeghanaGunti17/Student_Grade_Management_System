import { useEffect, useState, useCallback } from 'react';
import API   from '../services/api';
import Sidebar from '../components/Sidebar';
import Topbar  from '../components/Topbar';
import toast   from 'react-hot-toast';

const EXAM_TYPES = ['internal','external','midterm','final','quiz','assignment'];
const GRADE_COLORS = { O:'badge-green', 'A+':'badge-blue', A:'badge-purple', 'B+':'badge-blue', B:'badge-amber', C:'badge-amber', D:'badge-amber', F:'badge-red' };
const emptyMarks = { studentName:'', subjectName:'', marksObtained:'', maxMarks:100, semester:1, examType:'internal', remarks:'' };
const emptyAtt   = { studentName:'', subjectId:'', subjectName:'', date: new Date().toISOString().slice(0,10), status:'present', remarks:'' };
const ATTENDANCE_STATUSES = ['present','absent','late','leave'];

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState('marks');

  // ── MARKS STATE ──
  const [form, setForm]         = useState(emptyMarks);
  const [results, setResults]   = useState([]);
  const [editId, setEditId]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch]     = useState('');
  const [filterExam, setFilterExam] = useState('');
  const [showForm, setShowForm] = useState(false);

  // ── ATTENDANCE STATE ──
  const [attForm, setAttForm]       = useState(emptyAtt);
  const [attRecords, setAttRecords] = useState([]);
  const [attFetching, setAttFetching] = useState(false);
  const [attLoading, setAttLoading] = useState(false);
  const [attSearch, setAttSearch]   = useState('');
  const [attStatus, setAttStatus]   = useState('');
  const [showAttForm, setShowAttForm] = useState(false);
  const [bulkMode, setBulkMode]     = useState(false);
  const [bulkStudents, setBulkStudents] = useState([]);
  const [bulkDate, setBulkDate]     = useState(new Date().toISOString().slice(0,10));
  const [bulkSubject, setBulkSubject] = useState('');
  const [students, setStudents]     = useState([]);

  const facultyName = localStorage.getItem('userName') || 'Faculty';

  // ── MARKS FETCH ──
  const fetchResults = useCallback(async () => {
    setFetching(true);
    try {
      const params = new URLSearchParams({ limit:100 });
      if (search)     params.set('search', search);
      if (filterExam) params.set('examType', filterExam);
      const { data } = await API.get(`/results?${params}`);
      setResults(data.data || []);
    } catch { toast.error('Failed to load results'); }
    finally  { setFetching(false); }
  }, [search, filterExam]);

  // ── ATTENDANCE FETCH ──
  const fetchAttendance = useCallback(async () => {
    setAttFetching(true);
    try {
      const { data } = await API.get('/attendance');
      setAttRecords(data.data || []);
    } catch { toast.error('Failed to load attendance'); }
    finally  { setAttFetching(false); }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const { data } = await API.get('/students?limit=200');
      setStudents(data.data || []);
    } catch {}
  }, []);

  useEffect(() => { fetchResults(); }, [fetchResults]);
  useEffect(() => { if (activeTab === 'attendance') { fetchAttendance(); fetchStudents(); } }, [activeTab, fetchAttendance, fetchStudents]);

  // ── MARKS HANDLERS ──
  const setF = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.studentName || !form.subjectName || form.marksObtained === '') {
      toast.error('Student name, subject, and marks are required'); return;
    }
    const marks = Number(form.marksObtained);
    if (isNaN(marks) || marks < 0 || marks > Number(form.maxMarks)) {
      toast.error(`Marks must be between 0 and ${form.maxMarks}`); return;
    }
    setLoading(true);
    try {
      const payload = { ...form, marksObtained: marks, maxMarks: Number(form.maxMarks), faculty: facultyName };
      if (editId) { await API.put(`/results/${editId}`, payload); toast.success('Marks updated ✓'); }
      else        { await API.post('/results', payload);          toast.success('Marks added ✓'); }
      setForm(emptyMarks); setEditId(null); setShowForm(false); fetchResults();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleEdit = (item) => {
    setForm({ studentName: item.studentName||'', subjectName: item.subjectName||'', marksObtained: item.marksObtained||'', maxMarks: item.maxMarks||100, semester: item.semester||1, examType: item.examType||'internal', remarks: item.remarks||'' });
    setEditId(item._id); setShowForm(true); window.scrollTo({ top:0, behavior:'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this result?')) return;
    try { await API.delete(`/results/${id}`); toast.success('Result deleted'); fetchResults(); }
    catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  const handlePublish = async (id) => {
    try { await API.patch(`/results/${id}/publish`); toast.success('Published to student!'); fetchResults(); }
    catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  // ── ATTENDANCE HANDLERS ──
  const setAF = e => setAttForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleAttSubmit = async () => {
    if (!attForm.studentName || !attForm.date || !attForm.status) {
      toast.error('Student name, date, and status are required'); return;
    }
    setAttLoading(true);
    try {
      const payload = {
        studentId: students.find(s => s.name === attForm.studentName)?._id || attForm.studentName,
        studentName: attForm.studentName,
        subjectId: attForm.subjectId || 'general',
        date: attForm.date,
        status: attForm.status,
        remarks: attForm.remarks,
      };
      await API.post('/attendance', payload);
      toast.success('Attendance marked ✓');
      setAttForm(emptyAtt); setShowAttForm(false); fetchAttendance();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
    finally { setAttLoading(false); }
  };

  const handleBulkAttendance = async () => {
    if (!bulkDate || !bulkSubject) { toast.error('Date and subject are required'); return; }
    const records = bulkStudents.filter(s => s.status).map(s => ({
      studentId: s._id,
      studentName: s.name,
      subjectId: bulkSubject,
      date: bulkDate,
      status: s.status || 'present',
    }));
    if (records.length === 0) { toast.error('Mark at least one student'); return; }
    setAttLoading(true);
    try {
      await API.post('/attendance/bulk', { records });
      toast.success(`Attendance saved for ${records.length} students ✓`);
      setBulkMode(false); fetchAttendance();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
    finally { setAttLoading(false); }
  };

  // ── Load students into bulk list when bulk mode opens ──
  useEffect(() => {
    if (bulkMode) setBulkStudents(students.map(s => ({ ...s, status: 'present' })));
  }, [bulkMode, students]);

  const cancelEdit = () => { setForm(emptyMarks); setEditId(null); setShowForm(false); };
  const pct = (m, max) => max > 0 ? Math.round((m/max)*100) : 0;

  const filteredAtt = attRecords.filter(r => {
    const nameMatch = !attSearch || (r.studentName||'').toLowerCase().includes(attSearch.toLowerCase());
    const statusMatch = !attStatus || r.status === attStatus;
    return nameMatch && statusMatch;
  });

  // ── Attendance stats ──
  const attTotal   = attRecords.length;
  const attPresent = attRecords.filter(r => r.status === 'present').length;
  const attAbsent  = attRecords.filter(r => r.status === 'absent').length;
  const attLate    = attRecords.filter(r => r.status === 'late').length;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="page-body">

          {/* ── TAB HEADER ── */}
          <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div>
              <h1>{activeTab === 'marks' ? 'Marks Entry' : 'Attendance Management'}</h1>
              <p>{activeTab === 'marks' ? 'Add, edit, and publish student results' : 'Mark and track student attendance'}</p>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className={`btn ${activeTab==='marks' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setActiveTab('marks'); setShowAttForm(false); setBulkMode(false); }}>✏️ Marks Entry</button>
              <button className={`btn ${activeTab==='attendance' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setActiveTab('attendance'); setShowForm(false); }}>📋 Attendance</button>
            </div>
          </div>

          {/* ════════════════════════════ MARKS TAB ════════════════════════════ */}
          {activeTab === 'marks' && (
            <>
              {!showForm && (
                <div style={{ marginBottom:16 }}>
                  <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Marks</button>
                </div>
              )}

              {showForm && (
                <div className="glass-card" style={{ marginBottom:24, borderColor: editId ? 'rgba(245,158,11,0.3)' : 'var(--border-brand)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                    <h2>{editId ? '✏️ Edit Result' : '➕ Add Marks'}</h2>
                    <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>Cancel</button>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'0 16px' }}>
                    {[
                      { name:'studentName',   label:'Student Name *', type:'text',   placeholder:'e.g. Ravi Kumar' },
                      { name:'subjectName',   label:'Subject *',       type:'text',   placeholder:'e.g. Data Structures' },
                      { name:'marksObtained', label:'Marks Obtained *', type:'number', placeholder:'0 – 100' },
                      { name:'maxMarks',      label:'Max Marks',        type:'number', placeholder:'100' },
                    ].map(f => (
                      <div key={f.name} className="input-group">
                        <label className="input-label">{f.label}</label>
                        <input className="input" name={f.name} type={f.type} placeholder={f.placeholder} value={form[f.name]} onChange={setF} />
                      </div>
                    ))}
                    <div className="input-group">
                      <label className="input-label">Semester</label>
                      <select className="input" name="semester" value={form.semester} onChange={setF}>
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Exam Type</label>
                      <select className="input" name="examType" value={form.examType} onChange={setF}>
                        {EXAM_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                      </select>
                    </div>
                    <div className="input-group" style={{ gridColumn:'1/-1' }}>
                      <label className="input-label">Remarks (optional)</label>
                      <input className="input" name="remarks" placeholder="e.g. Good improvement" value={form.remarks} onChange={setF} />
                    </div>
                  </div>
                  {form.marksObtained !== '' && (
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, padding:'12px 16px', background:'var(--bg-glass)', borderRadius:'var(--r-sm)', border:'1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>Grade preview:</span>
                      <span style={{ fontWeight:700, color:'var(--brand-400)', fontSize:'1.1rem' }}>
                        {pct(form.marksObtained, form.maxMarks) >= 90 ? 'O' : pct(form.marksObtained, form.maxMarks) >= 80 ? 'A+' : pct(form.marksObtained, form.maxMarks) >= 70 ? 'A' : pct(form.marksObtained, form.maxMarks) >= 60 ? 'B+' : pct(form.marksObtained, form.maxMarks) >= 50 ? 'B' : pct(form.marksObtained, form.maxMarks) >= 40 ? 'C' : 'F'}
                      </span>
                      <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{pct(form.marksObtained, form.maxMarks)}%</span>
                    </div>
                  )}
                  <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Saving…' : editId ? 'Update Result' : 'Save Result'}
                  </button>
                </div>
              )}

              <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
                <div className="search-bar" style={{ flex:1, minWidth:200 }}>
                  <span className="search-icon">🔍</span>
                  <input className="input" placeholder="Search by student name…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="input" style={{ width:160 }} value={filterExam} onChange={e => setFilterExam(e.target.value)}>
                  <option value="">All Exam Types</option>
                  {EXAM_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>

              <div className="glass-card" style={{ padding:0, overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border-subtle)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <h2 style={{ margin:0 }}>📚 All Results</h2>
                  <span style={{ fontSize:'0.8125rem', color:'var(--text-muted)' }}>{results.length} records</span>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>{['Student','Subject','Marks','Grade','Exam Type','Semester','Status','Actions'].map(h => <th key={h}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {fetching
                        ? Array(6).fill(0).map((_,i) => <tr key={i}>{Array(8).fill(0).map((_,j) => <td key={j}><div className="skeleton" style={{ height:16, width:'80%' }} /></td>)}</tr>)
                        : results.length === 0
                          ? <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">📝</div><h3>No results yet</h3><p>Add the first marks entry to get started.</p></div></td></tr>
                          : results.map(r => (
                              <tr key={r._id}>
                                <td style={{ fontWeight:600 }}>{r.studentName}</td>
                                <td style={{ color:'var(--text-secondary)' }}>{r.subjectName}</td>
                                <td>
                                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                    <span style={{ fontWeight:700 }}>{r.marksObtained}</span>
                                    <span style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>/{r.maxMarks}</span>
                                    <div className="progress-track" style={{ width:40 }}>
                                      <div className="progress-fill" style={{ width:`${pct(r.marksObtained, r.maxMarks)}%`, background: pct(r.marksObtained,r.maxMarks) >= 60 ? '#10b981' : pct(r.marksObtained,r.maxMarks) >= 40 ? '#f59e0b' : '#ef4444' }} />
                                    </div>
                                  </div>
                                </td>
                                <td><span className={`badge ${GRADE_COLORS[r.grade] || 'badge-gray'}`}>{r.grade || '—'}</span></td>
                                <td><span className="badge badge-blue">{r.examType}</span></td>
                                <td style={{ color:'var(--text-muted)' }}>Sem {r.semester}</td>
                                <td><span className={`badge ${r.isPublished ? 'badge-green' : 'badge-gray'}`}>{r.isPublished ? '✓ Published' : 'Draft'}</span></td>
                                <td>
                                  <div style={{ display:'flex', gap:6 }}>
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(r)}>Edit</button>
                                    {!r.isPublished && <button className="btn btn-success btn-sm" onClick={() => handlePublish(r._id)}>Publish</button>}
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)}>Delete</button>
                                  </div>
                                </td>
                              </tr>
                            ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ════════════════════════════ ATTENDANCE TAB ════════════════════════════ */}
          {activeTab === 'attendance' && (
            <>
              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:24 }}>
                {[
                  { label:'Total Records', value: attTotal,   icon:'📋', color:'var(--brand-400)' },
                  { label:'Present',       value: attPresent, icon:'✅', color:'#10b981' },
                  { label:'Absent',        value: attAbsent,  icon:'❌', color:'#ef4444' },
                  { label:'Late',          value: attLate,    icon:'⏰', color:'#f59e0b' },
                ].map(c => (
                  <div key={c.label} className="glass-card" style={{ textAlign:'center', padding:'20px 16px' }}>
                    <div style={{ fontSize:'1.5rem', marginBottom:8 }}>{c.icon}</div>
                    <div style={{ fontSize:'1.8rem', fontWeight:800, color:c.color }}>{c.value}</div>
                    <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:4 }}>{c.label}</div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
                {!showAttForm && !bulkMode && (
                  <>
                    <button className="btn btn-primary" onClick={() => setShowAttForm(true)}>+ Mark Single Attendance</button>
                    <button className="btn btn-secondary" style={{ background:'rgba(124,58,237,0.2)', border:'1px solid rgba(124,58,237,0.4)', color:'#a78bfa' }} onClick={() => setBulkMode(true)}>📋 Bulk Attendance</button>
                  </>
                )}
                {(showAttForm || bulkMode) && (
                  <button className="btn btn-ghost" onClick={() => { setShowAttForm(false); setBulkMode(false); }}>← Back to Records</button>
                )}
              </div>

              {/* Single attendance form */}
              {showAttForm && (
                <div className="glass-card" style={{ marginBottom:24, borderColor:'var(--border-brand)' }}>
                  <h2 style={{ marginBottom:20 }}>➕ Mark Attendance</h2>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'0 16px' }}>
                    <div className="input-group">
                      <label className="input-label">Student Name *</label>
                      {students.length > 0 ? (
                        <select className="input" name="studentName" value={attForm.studentName} onChange={setAF}>
                          <option value="">Select Student</option>
                          {students.map(s => <option key={s._id} value={s.name}>{s.name} ({s.rollNumber})</option>)}
                        </select>
                      ) : (
                        <input className="input" name="studentName" placeholder="e.g. Ravi Kumar" value={attForm.studentName} onChange={setAF} />
                      )}
                    </div>
                    <div className="input-group">
                      <label className="input-label">Subject / Class</label>
                      <input className="input" name="subjectName" placeholder="e.g. Data Structures" value={attForm.subjectName} onChange={setAF} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Date *</label>
                      <input className="input" name="date" type="date" value={attForm.date} onChange={setAF} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Status *</label>
                      <select className="input" name="status" value={attForm.status} onChange={setAF}>
                        {ATTENDANCE_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                      </select>
                    </div>
                    <div className="input-group" style={{ gridColumn:'1/-1' }}>
                      <label className="input-label">Remarks (optional)</label>
                      <input className="input" name="remarks" placeholder="e.g. Medical leave" value={attForm.remarks} onChange={setAF} />
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:10, marginTop:8 }}>
                    <button className="btn btn-primary" onClick={handleAttSubmit} disabled={attLoading}>
                      {attLoading ? 'Saving…' : 'Mark Attendance'}
                    </button>
                    <button className="btn btn-ghost" onClick={() => { setShowAttForm(false); setAttForm(emptyAtt); }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Bulk attendance form */}
              {bulkMode && (
                <div className="glass-card" style={{ marginBottom:24, borderColor:'rgba(124,58,237,0.4)' }}>
                  <h2 style={{ marginBottom:20 }}>📋 Bulk Attendance — Mark Entire Class</h2>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'0 16px', marginBottom:20 }}>
                    <div className="input-group">
                      <label className="input-label">Date *</label>
                      <input className="input" type="date" value={bulkDate} onChange={e => setBulkDate(e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Subject / Class *</label>
                      <input className="input" placeholder="e.g. Data Structures" value={bulkSubject} onChange={e => setBulkSubject(e.target.value)} />
                    </div>
                    <div className="input-group" style={{ display:'flex', alignItems:'flex-end', gap:8 }}>
                      <button className="btn btn-ghost btn-sm" style={{ marginBottom:4 }} onClick={() => setBulkStudents(prev => prev.map(s => ({ ...s, status:'present' })))}>✅ All Present</button>
                      <button className="btn btn-ghost btn-sm" style={{ marginBottom:4 }} onClick={() => setBulkStudents(prev => prev.map(s => ({ ...s, status:'absent' })))}>❌ All Absent</button>
                    </div>
                  </div>
                  {students.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'24px', color:'var(--text-muted)' }}>No students found. Add students first.</div>
                  ) : (
                    <div className="table-wrap" style={{ maxHeight:400, overflowY:'auto' }}>
                      <table>
                        <thead>
                          <tr><th>#</th><th>Student</th><th>Roll No.</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                          {bulkStudents.map((s, i) => (
                            <tr key={s._id}>
                              <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{i+1}</td>
                              <td style={{ fontWeight:600 }}>{s.name}</td>
                              <td><code style={{ fontSize:'0.8rem', color:'var(--brand-400)' }}>{s.rollNumber}</code></td>
                              <td>
                                <div style={{ display:'flex', gap:6 }}>
                                  {ATTENDANCE_STATUSES.map(st => (
                                    <button key={st} onClick={() => setBulkStudents(prev => prev.map(x => x._id === s._id ? { ...x, status: st } : x))}
                                      style={{ padding:'4px 10px', borderRadius:6, border:'1px solid', fontSize:'0.75rem', cursor:'pointer',
                                        background: s.status === st ? (st==='present'?'rgba(16,185,129,0.25)':st==='absent'?'rgba(239,68,68,0.25)':st==='late'?'rgba(245,158,11,0.25)':'rgba(99,102,241,0.25)') : 'transparent',
                                        borderColor: s.status === st ? (st==='present'?'#10b981':st==='absent'?'#ef4444':st==='late'?'#f59e0b':'#6366f1') : 'var(--border-subtle)',
                                        color: s.status === st ? (st==='present'?'#10b981':st==='absent'?'#ef4444':st==='late'?'#f59e0b':'#a5b4fc') : 'var(--text-muted)' }}>
                                      {st.charAt(0).toUpperCase()+st.slice(1)}
                                    </button>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div style={{ display:'flex', gap:10, marginTop:16 }}>
                    <button className="btn btn-primary" onClick={handleBulkAttendance} disabled={attLoading || students.length === 0}>
                      {attLoading ? 'Saving…' : `Save Attendance (${bulkStudents.filter(s=>s.status).length} students)`}
                    </button>
                    <button className="btn btn-ghost" onClick={() => setBulkMode(false)}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Attendance Records Table */}
              {!showAttForm && !bulkMode && (
                <>
                  <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
                    <div className="search-bar" style={{ flex:1, minWidth:200 }}>
                      <span className="search-icon">🔍</span>
                      <input className="input" placeholder="Search by student name…" value={attSearch} onChange={e => setAttSearch(e.target.value)} />
                    </div>
                    <select className="input" style={{ width:160 }} value={attStatus} onChange={e => setAttStatus(e.target.value)}>
                      <option value="">All Statuses</option>
                      {ATTENDANCE_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                    </select>
                  </div>

                  <div className="glass-card" style={{ padding:0, overflow:'hidden' }}>
                    <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border-subtle)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <h2 style={{ margin:0 }}>📋 Attendance Records</h2>
                      <span style={{ fontSize:'0.8125rem', color:'var(--text-muted)' }}>{filteredAtt.length} records</span>
                    </div>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>{['Student','Status','Date','Remarks'].map(h => <th key={h}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {attFetching
                            ? Array(5).fill(0).map((_,i) => <tr key={i}>{Array(4).fill(0).map((_,j) => <td key={j}><div className="skeleton" style={{ height:16, width:'80%' }} /></td>)}</tr>)
                            : filteredAtt.length === 0
                              ? <tr><td colSpan={4}><div className="empty-state"><div className="empty-icon">📋</div><h3>No attendance records</h3><p>Mark attendance using the buttons above.</p></div></td></tr>
                              : filteredAtt.map((r, i) => (
                                  <tr key={i}>
                                    <td style={{ fontWeight:600 }}>{r.studentName}</td>
                                    <td>
                                      <span style={{ padding:'4px 12px', borderRadius:20, fontSize:'0.8rem', fontWeight:600,
                                        background: r.status==='present'?'rgba(16,185,129,0.2)':r.status==='absent'?'rgba(239,68,68,0.2)':r.status==='late'?'rgba(245,158,11,0.2)':'rgba(99,102,241,0.2)',
                                        color: r.status==='present'?'#10b981':r.status==='absent'?'#ef4444':r.status==='late'?'#f59e0b':'#a5b4fc' }}>
                                        {r.status}
                                      </span>
                                    </td>
                                    <td style={{ color:'var(--text-secondary)' }}>{new Date(r.date).toLocaleDateString()}</td>
                                    <td style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>{r.remarks || '—'}</td>
                                  </tr>
                                ))
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
