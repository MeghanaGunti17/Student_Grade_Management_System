import { useNavigate } from 'react-router-dom';

const features = [
  { icon:'📊', title:'Live Analytics', desc:'Real-time performance dashboards with interactive charts and AI-powered insights.' },
  { icon:'🎓', title:'Student Profiles', desc:'Complete academic records, CGPA tracking, and performance tiers per student.' },
  { icon:'✏️', title:'Marks Management', desc:'Faculty can add, edit, and publish grades with automatic grade computation.' },
  { icon:'📋', title:'Attendance Tracking', desc:'Mark and monitor attendance per subject with low-attendance alerts.' },
  { icon:'📄', title:'PDF Reports', desc:'Students can download their mark sheets as professionally formatted PDFs.' },
  { icon:'🔔', title:'Notifications', desc:'Real-time Socket.IO alerts for result publishing, attendance warnings, and more.' },
];

const roles = [
  { icon:'🛡️', role:'Admin', perks:['Full system control', 'Student & faculty management', 'Analytics dashboard', 'Activity logs'] },
  { icon:'👩‍🏫', role:'Faculty', perks:['Add & edit marks', 'Bulk attendance marking', 'Class performance view', 'Result publishing'] },
  { icon:'🎓', role:'Student', perks:['View results & grades', 'Performance charts', 'PDF mark sheet download', 'Attendance history'] },
];

export default function Home() {
  const navigate  = useNavigate();
  const isLogged  = !!localStorage.getItem('token');
  const role      = localStorage.getItem('role');

  const handleGetStarted = () => {
    if (!isLogged) { navigate('/login'); return; }
    if (role === 'admin')   navigate('/dashboard');
    else if (role === 'faculty') navigate('/faculty-dashboard');
    else navigate('/student-dashboard');
  };

  return (
    <div style={{ minHeight:'100vh', color:'var(--text-primary)' }}>

      {/* ── NAV ── */}
      <nav style={{ position:'sticky', top:0, zIndex:50, backdropFilter:'blur(16px)', background:'rgba(6,11,24,0.8)', borderBottom:'1px solid var(--border-subtle)', padding:'0 40px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, background:'linear-gradient(135deg,var(--brand-500),var(--accent-cyan))', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>🎓</div>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:'1.1rem' }}>CampusIQ</span>
          <span style={{ fontSize:'0.65rem', color:'var(--text-muted)', background:'var(--bg-glass)', border:'1px solid var(--border-subtle)', borderRadius:4, padding:'2px 6px', textTransform:'uppercase', letterSpacing:'0.1em' }}></span>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          {isLogged
            ? <button className="btn btn-primary" onClick={handleGetStarted}>Go to Dashboard →</button>
            : <>
                <button className="btn btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
                <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started</button>
              </>
          }
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth:1200, margin:'0 auto', padding:'100px 40px 80px', textAlign:'center' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.25)', borderRadius:99, padding:'6px 16px', fontSize:'0.8125rem', color:'var(--brand-400)', marginBottom:28 }}>
          ✨ Full-Stack MERN — Now Production-Ready
        </div>

        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'clamp(2.5rem,6vw,4rem)', fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:24 }}>
          Smart Grade Management<br />
          <span style={{ background:'linear-gradient(135deg,#60a5fa,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Built for Modern Institutions</span>
        </h1>

        <p style={{ fontSize:'1.125rem', color:'var(--text-secondary)', maxWidth:620, margin:'0 auto 40px', lineHeight:1.8 }}>
          Manage students, marks, attendance, and analytics — all in one secure, real-time platform for administrators, faculty, and students.
        </p>

        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
            🚀 Get Started Free
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => navigate('/register')}>
            👤 Create Account
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display:'flex', gap:40, justifyContent:'center', marginTop:64, flexWrap:'wrap' }}>
         {[
  ['Role-Based Access','Admin · Faculty · Student'],
  ['Real-Time Updates','Socket.IO Powered'],
  ['Secure Authentication','JWT + Refresh Tokens'],
  ['PDF Reports','One-Click Academic Reports']
].map(([val,lbl]) => (
            <div key={val} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:'1.5rem', color:'var(--text-primary)' }}>{val}</div>
              <div
  style={{
    fontSize: '0.9rem',
    color: '#e2e8f0',
    fontWeight: 500,
    marginTop: 8
  }}
>
  {lbl}
</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth:1200, margin:'0 auto', padding:'60px 40px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'2rem', fontWeight:800 }}>Everything you need</h2>
          <p style={{ color:'var(--text-secondary)', marginTop:8 }}>A complete academic management suite, out of the box.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20 }}>
          {features.map(f => (
            <div key={f.title} className="glass-card" style={{ display:'flex', gap:16 }}>
              <div style={{ width:44, height:44, background:'var(--bg-glass)', border:'1px solid var(--border-default)', borderRadius:'var(--r-sm)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.25rem', flexShrink:0 }}>{f.icon}</div>
              <div>
                <h3 style={{ marginBottom:6 }}>{f.title}</h3>
                <p style={{ fontSize:'0.875rem', lineHeight:1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ROLES ── */}
      <section style={{ maxWidth:1200, margin:'0 auto', padding:'60px 40px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'2rem', fontWeight:800 }}>Built for every role</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
          {roles.map(r => (
            <div key={r.role} className="glass-card">
              <div style={{ fontSize:'2rem', marginBottom:12 }}>{r.icon}</div>
              <h2 style={{ marginBottom:16 }}>{r.role}</h2>
              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:10 }}>
                {r.perks.map(p => (
                  <li key={p} style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.875rem', color:'var(--text-secondary)' }}>
                    <span style={{ color:'var(--accent-green)', fontWeight:700 }}>✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth:700, margin:'60px auto', padding:'60px 40px', textAlign:'center' }}>
        <div className="glass-card" style={{ padding:48 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'1.75rem', fontWeight:800, marginBottom:12 }}>Ready to demo?</h2>
          <p style={{ marginBottom:28 }}>Start with a free account and explore every feature today.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>Create Free Account →</button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:'1px solid var(--border-subtle)', padding:'24px 40px', textAlign:'center', color:'rgba(255,255,255,0.75)', fontSize:'0.8125rem' }}>
        © 2023 CampusIQ · Student Grade Management System · Built with MERN Stack
      </footer>
    </div>
  );
}