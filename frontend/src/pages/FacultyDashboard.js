import { useEffect, useState, useCallback } from 'react';
import API   from '../services/api';
import Sidebar from '../components/Sidebar';
import Topbar  from '../components/Topbar';
import toast   from 'react-hot-toast';

const EXAM_TYPES = ['internal','external','midterm','final','quiz','assignment'];
const GRADE_COLORS = { O:'badge-green', 'A+':'badge-blue', A:'badge-purple', 'B+':'badge-blue', B:'badge-amber', C:'badge-amber', D:'badge-amber', F:'badge-red' };

const empty = { studentName:'', subjectName:'', marksObtained:'', maxMarks:100, semester:1, examType:'internal', remarks:'' };

export default function FacultyDashboard() {
  const [form, setForm]         = useState(empty);
  const [results, setResults]   = useState([]);
  const [editId, setEditId]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch]     = useState('');
  const [filterExam, setFilterExam] = useState('');
  const [showForm, setShowForm] = useState(false);
  const facultyName = localStorage.getItem('userName') || 'Faculty';

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

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.studentName || !form.subjectName || form.marksObtained === '') {
      toast.error('Student name, subject, and marks are required');
      return;
    }
    const marks = Number(form.marksObtained);
    if (isNaN(marks) || marks < 0 || marks > Number(form.maxMarks)) {
      toast.error(`Marks must be between 0 and ${form.maxMarks}`);
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, marksObtained: marks, maxMarks: Number(form.maxMarks), faculty: facultyName };
      if (editId) {
        await API.put(`/results/${editId}`, payload);
        toast.success('Marks updated ✓');
      } else {
        await API.post('/results', payload);
        toast.success('Marks added ✓');
      }
      setForm(empty); setEditId(null); setShowForm(false);
      fetchResults();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleEdit = (item) => {
    setForm({ studentName: item.studentName||'', subjectName: item.subjectName||'', marksObtained: item.marksObtained||'', maxMarks: item.maxMarks||100, semester: item.semester||1, examType: item.examType||'internal', remarks: item.remarks||'' });
    setEditId(item._id);
    setShowForm(true);
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this result?')) return;
    try {
      await API.delete(`/results/${id}`);
      toast.success('Result deleted');
      fetchResults();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  const handlePublish = async (id) => {
    try {
      await API.patch(`/results/${id}/publish`);
      toast.success('Published to student!');
      fetchResults();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  const cancelEdit = () => { setForm(empty); setEditId(null); setShowForm(false); };

  const pct = (m, max) => max > 0 ? Math.round((m/max)*100) : 0;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="page-body">

          <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div>
              <h1>Marks Entry</h1>
              <p>Add, edit, and publish student results</p>
            </div>
            {!showForm && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Marks</button>
            )}
          </div>

          {/* Form */}
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
                    <input className="input" name={f.name} type={f.type} placeholder={f.placeholder} value={form[f.name]} onChange={set} />
                  </div>
                ))}
                <div className="input-group">
                  <label className="input-label">Semester</label>
                  <select className="input" name="semester" value={form.semester} onChange={set}>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Exam Type</label>
                  <select className="input" name="examType" value={form.examType} onChange={set}>
                    {EXAM_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ gridColumn:'1/-1' }}>
                  <label className="input-label">Remarks (optional)</label>
                  <input className="input" name="remarks" placeholder="e.g. Good improvement" value={form.remarks} onChange={set} />
                </div>
              </div>
              {/* Grade preview */}
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

          {/* Filters */}
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

          {/* Results Table */}
          <div className="glass-card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border-subtle)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ margin:0 }}>📚 All Results</h2>
              <span style={{ fontSize:'0.8125rem', color:'var(--text-muted)' }}>{results.length} records</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {['Student','Subject','Marks','Grade','Exam Type','Semester','Status','Actions'].map(h => <th key={h}>{h}</th>)}
                  </tr>
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
                                {!r.isPublished && (
                                  <button className="btn btn-success btn-sm" onClick={() => handlePublish(r._id)}>Publish</button>
                                )}
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

        </div>
      </div>
    </div>
  );
}