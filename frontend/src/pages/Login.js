import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from "../services/api";
export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'', role:'student' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

const handleLogin = async (e) => {
  e.preventDefault();

  if (!form.email || !form.password) {
    toast.error("Please fill all fields");
    return;
  }

  setLoading(true);

  try {
    const response = await API.post(
      "/auth/login",
      form
    );

    const data = response.data;

    const token = data.token;
    const refreshToken =
      data.refreshToken;

    const user = data.user;

    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "refreshToken",
      refreshToken
    );

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    localStorage.setItem(
      "role",
      user.role
    );

    localStorage.setItem(
      "userName",
      user.name
    );

    localStorage.setItem(
      "userEmail",
      user.email
    );

    toast.success(
      `Welcome back, ${user.name}!`
    );

    if (user.role === "admin") {
      navigate("/dashboard");
    } else if (
      user.role === "faculty"
    ) {
      navigate(
        "/faculty-dashboard"
      );
    } else {
      navigate(
        "/student-dashboard"
      );
    }
  } catch (err) {
    console.error(err);

    toast.error(
      err?.response?.data?.message ||
        "Login failed"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      {/* Background decoration */}
      <div style={{ position:'fixed', top:'20%', left:'10%', width:300, height:300, background:'rgba(59,130,246,0.05)', borderRadius:'50%', filter:'blur(80px)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'20%', right:'10%', width:250, height:250, background:'rgba(124,58,237,0.05)', borderRadius:'50%', filter:'blur(80px)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:56, height:56, background:'linear-gradient(135deg,var(--brand-500),var(--accent-cyan))', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', margin:'0 auto 16px' }}>🎓</div>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'1.75rem', fontWeight:800, marginBottom:6 }}>Sign In</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>Access your CampusIQ dashboard</p>
        </div>

        {/* Card */}
        <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-default)', borderRadius:'var(--r-xl)', padding:32, boxShadow:'var(--shadow-lg)' }}>
          <form onSubmit={handleLogin}>
            {/* Role selector */}
            <div style={{ display:'flex', gap:8, marginBottom:24, background:'var(--bg-glass)', borderRadius:'var(--r-sm)', padding:4 }}>
              {['admin','faculty','student'].map(r => (
                <button
                  key={r} type="button"
                  onClick={() => setForm(p => ({...p, role: r}))}
                  style={{
                    flex:1, padding:'8px 4px',
                    borderRadius:'var(--r-sm)',
                    border:'none', cursor:'pointer',
                    fontSize:'0.8125rem', fontWeight:600,
                    textTransform:'capitalize',
                    transition:'all 0.15s',
                    background: form.role === r ? 'linear-gradient(135deg,var(--brand-500),var(--brand-700))' : 'transparent',
                    color: form.role === r ? '#fff' : 'var(--text-muted)',
                    boxShadow: form.role === r ? '0 2px 8px rgba(59,130,246,0.3)' : 'none',
                  }}
                >
                  {r === 'admin' ? '🛡️' : r === 'faculty' ? '👩‍🏫' : '🎓'} {r}
                </button>
              ))}
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-icon-wrap">
                <span className="input-icon">✉</span>
                <input className="input" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} autoComplete="email" />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom:28 }}>
              <label className="input-label">Password</label>
              <div className="input-icon-wrap" style={{ position:'relative' }}>
                <span className="input-icon">🔒</span>
                <input className="input" name="password" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={handleChange} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(p=>!p)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'0.9rem' }}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width:'100%', padding:'13px', fontSize:'1rem', justifyContent:'center' }}>
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                  Signing in…
                </span>
              ) : '→ Sign In'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:24, fontSize:'0.875rem', color:'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'var(--brand-400)', fontWeight:600 }}>Create one →</Link>
          </p>
        </div>

        <p style={{ textAlign:'center', marginTop:20, fontSize:'0.75rem', color:'var(--text-muted)' }}>
          <Link to="/" style={{ color:'var(--text-muted)' }}>← Back to home</Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}