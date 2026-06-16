import { useEffect, useState } from 'react';
import API    from '../services/api';
import Sidebar from '../components/Sidebar';
import Topbar  from '../components/Topbar';
import toast   from 'react-hot-toast';
import jsPDF   from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';

const GRADE_COLORS_MAP = { O:'#10b981','A+':'#3b82f6',A:'#6366f1','B+':'#7c3aed',B:'#f59e0b',C:'#f97316',D:'#ef4444',F:'#dc2626' };
const BADGE_CLASS = { O:'badge-green','A+':'badge-blue',A:'badge-purple','B+':'badge-blue',B:'badge-amber',C:'badge-amber',D:'badge-red',F:'badge-red' };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div style={{ fontWeight:600, marginBottom:4 }}>{label}</div>
      <div style={{ color:'#60a5fa', fontSize:'0.8125rem' }}>Marks: {payload[0]?.value} / {payload[0]?.payload?.maxMarks}</div>
      <div style={{ color:'#94a3b8', fontSize:'0.8125rem' }}>Grade: {payload[0]?.payload?.grade}</div>
    </div>
  );
}

export default function StudentDashboard() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const name  = localStorage.getItem('userName') || 'Student';
  const email = localStorage.getItem('userEmail') || '';

  useEffect(() => {
    API.get('/results/my-results').then(r => {
      setResults(r.data.data || []);
    }).catch(() => {
      // fallback: try by name
      API.get(`/results/student/${encodeURIComponent(name)}`).then(r => {
        setResults(r.data.data || []);
      }).catch(() => toast.error('Failed to load results'));
    }).finally(() => setLoading(false));
  }, [name]);

// Calculations
const published = results.filter(
  r => r.isPublished !== false
);

const totalSubjects = published.length;

const totalMarks = published.reduce(
  (sum, r) => sum + (r.marksObtained || 0),
  0
);

const avgMarks =
  totalSubjects > 0
    ? (totalMarks / totalSubjects).toFixed(1)
    : "0";

const highest =
  totalSubjects > 0
    ? Math.max(
        ...published.map(
          r => r.marksObtained || 0
        )
      )
    : 0;

const cgpa =
  totalSubjects > 0
    ? (
        published.reduce(
          (sum, r) => {
            const percent =
              ((r.marksObtained || 0) /
                (r.maxMarks || 100)) *
              100;

            let gp = 0;

            if (percent >= 90) gp = 10;
            else if (percent >= 80) gp = 9;
            else if (percent >= 70) gp = 8;
            else if (percent >= 60) gp = 7;
            else if (percent >= 50) gp = 6;
            else if (percent >= 40) gp = 5;

            return sum + gp;
          },
          0
        ) / totalSubjects
      ).toFixed(2)
    : "0.00";

const passCount = published.filter(
  r =>
    (r.marksObtained || 0) >=
    (r.maxMarks || 100) * 0.4
).length;

const passRate =
  totalSubjects > 0
    ? Math.round(
        (passCount / totalSubjects) * 100
      )
    : 0;

  const chartData = published.map(r => ({
    subject:  (r.subjectName||'').length > 10 ? r.subjectName.slice(0,10)+'…' : r.subjectName,
    marks:    r.marksObtained||0,
    maxMarks: r.maxMarks||100,
    grade:    r.grade||'—',
  }));

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(6,11,24);
    doc.rect(0,0,210,40,'F');
    doc.setFontSize(20);
    doc.setTextColor(240,244,255);
    doc.text('CampusIQ — Academic Report', 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(148,163,184);
    doc.text(`Student: ${name}   |   Email: ${email}`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}`, 14, 36);

    autoTable(doc, {
      startY: 50,
      head: [['Subject','Marks Obtained','Max Marks','Percentage','Grade','Exam Type']],
      body: published.map(r => [
        r.subjectName||'—',
        r.marksObtained||0,
        r.maxMarks||100,
        `${Math.round(((r.marksObtained||0)/(r.maxMarks||100))*100)}%`,
        r.grade||'—',
        r.examType||'—',
      ]),
      headStyles: { fillColor:[37,99,235], textColor:[255,255,255], fontStyle:'bold', fontSize:9 },
      bodyStyles: { fontSize:9, textColor:[30,40,60] },
      alternateRowStyles: { fillColor:[240,245,255] },
      foot: [['','','','Average','CGPA: '+cgpa,'Pass Rate: '+passRate+'%']],
      footStyles: { fillColor:[14,23,56], textColor:[255,255,255], fontStyle:'bold', fontSize:9 },
    });

    doc.save(`${name.replace(/\s+/g,'_')}_Report.pdf`);
    toast.success('PDF downloaded!');
  };

  const statCards = [
    { label:'Total Subjects', value: totalSubjects || '—', icon:'📚', accent:'linear-gradient(90deg,#3b82f6,#06b6d4)' },
    { label:'Average Marks',  value: avgMarks,             icon:'📊', accent:'linear-gradient(90deg,#10b981,#059669)' },
    { label:'Highest Score',  value: highest || '—',       icon:'🏆', accent:'linear-gradient(90deg,#f59e0b,#ef4444)' },
    { label:'CGPA',           value: cgpa,                 icon:'⭐', accent:'linear-gradient(90deg,#7c3aed,#6366f1)' },
    { label:'Pass Rate',      value: `${passRate}%`,       icon:'✅', accent:'linear-gradient(90deg,#10b981,#3b82f6)' },
  ];

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="page-body">

          {/* Header */}
          <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
            <div>
              <h1>My Academic Results</h1>
              <p>Hello {name.split(' ')[0]} — here's your performance summary</p>
            </div>
            <button className="btn btn-success" onClick={downloadPDF} disabled={published.length === 0}>
              📄 Download PDF Report
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid-4" style={{ marginBottom:28 }}>
            {statCards.map((c, i) => (
              <div key={i} className="stat-card" style={{ '--card-accent': c.accent }}>
                <div className="stat-icon" style={{ background:'var(--bg-glass)', border:'1px solid var(--border-default)' }}>{c.icon}</div>
                <div className="stat-label">{c.label}</div>
                <div className="stat-value">{loading ? <div className="skeleton" style={{ height:32, width:60 }} /> : c.value}</div>
              </div>
            ))}
          </div>

          {/* Performance Chart */}
          {published.length > 0 && (
            <div className="glass-card" style={{ marginBottom:24 }}>
              <h2 style={{ marginBottom:20 }}>📊 Performance by Subject</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} barSize={36}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="subject" stroke="var(--text-muted)" tick={{ fontSize:11 }} />
                  <YAxis domain={[0,'dataMax+10']} stroke="var(--text-muted)" tick={{ fontSize:11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="marks" radius={[6,6,0,0]}>
                    {chartData.map((d,i) => (
                      <Cell key={i} fill={GRADE_COLORS_MAP[d.grade] || '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginTop:16, justifyContent:'center' }}>
                {Object.entries(GRADE_COLORS_MAP).map(([g,c]) => (
                  <div key={g} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.75rem', color:'var(--text-secondary)' }}>
                    <div style={{ width:10, height:10, borderRadius:2, background:c }} />
                    {g}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Table */}
          <div className="glass-card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border-subtle)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ margin:0 }}>📋 My Marks</h2>
              <span style={{ fontSize:'0.8125rem', color:'var(--text-muted)' }}>{published.length} subjects</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {['Subject','Marks','Percentage','Grade','Exam Type','Semester','Faculty'].map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array(5).fill(0).map((_,i) => <tr key={i}>{Array(7).fill(0).map((_,j)=><td key={j}><div className="skeleton" style={{ height:16,width:'80%' }} /></td>)}</tr>)
                    : published.length === 0
                      ? <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">📊</div><h3>No results published yet</h3><p>Your faculty will publish your marks once grading is complete.</p></div></td></tr>
                      : published.map((r,i) => {
                          const pct = Math.round(((r.marksObtained||0)/(r.maxMarks||100))*100);
                          return (
                            <tr key={i}>
                              <td style={{ fontWeight:600 }}>{r.subjectName}</td>
                              <td>
                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                  <span style={{ fontWeight:700, fontSize:'1rem' }}>{r.marksObtained}</span>
                                  <span style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>/{r.maxMarks}</span>
                                </div>
                              </td>
                              <td>
                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                  <div className="progress-track" style={{ width:60 }}>
                                    <div className="progress-fill" style={{ width:`${pct}%`, background: pct>=60 ? '#10b981' : pct>=40 ? '#f59e0b' : '#ef4444' }} />
                                  </div>
                                  <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{pct}%</span>
                                </div>
                              </td>
                              <td><span className={`badge ${BADGE_CLASS[r.grade] || 'badge-gray'}`}>{r.grade || '—'}</span></td>
                              <td><span className="badge badge-blue">{r.examType||'—'}</span></td>
                              <td style={{ color:'var(--text-muted)' }}>Sem {r.semester}</td>
                              <td style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>{r.faculty||'—'}</td>
                            </tr>
                          );
                        })
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