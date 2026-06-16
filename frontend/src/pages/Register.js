import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'student', rollNumber:'', department:'', semester:1 });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill all required fields'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post('https://campusiq-backend-5tb3.onrender.com/api/auth/register', form);
      if (data.success) {
        toast.success('Account created! Please sign in 🎉');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ position:'fixed', top:'15%', right:'10%', width:300, height:300, background:'rgba(59,130,246,0.05)', borderRadius:'50%', filter:'blur(80px)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:460 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:56, height:56, background:'linear-gradient(135deg,var(--brand-500),var(--accent-cyan))', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', margin:'0 auto 16px' }}>🎓</div>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'1.75rem', fontWeight:800, marginBottom:6 }}>Create Account</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>Join CampusIQ — it's free</p>
        </div>

        <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-default)', borderRadius:'var(--r-xl)', padding:32, boxShadow:'var(--shadow-lg)' }}>
          <form onSubmit={handleRegister}>
            {/* Role selector */}
            <div style={{ display:'flex', gap:8, marginBottom:24, background:'var(--bg-glass)', borderRadius:'var(--r-sm)', padding:4 }}>
              {['student','faculty','admin'].map(r => (
                <button key={r} type="button" onClick={() => setForm(p => ({...p, role:r}))}
                  style={{ flex:1, padding:'8px 4px', borderRadius:'var(--r-sm)', border:'none', cursor:'pointer', fontSize:'0.8125rem', fontWeight:600, textTransform:'capitalize', transition:'all 0.15s',
                    background: form.role === r ? 'linear-gradient(135deg,var(--brand-500),var(--brand-700))' : 'transparent',
                    color: form.role === r ? '#fff' : 'var(--text-muted)' }}>
                  {r === 'admin' ? '🛡️' : r === 'faculty' ? '👩‍🏫' : '🎓'} {r}
                </button>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div className="input-group" style={{ gridColumn:'1/-1' }}>
                <label className="input-label">Full Name *</label>
                <input className="input" name="name" placeholder="e.g. Ravi Kumar" value={form.name} onChange={handleChange} />
              </div>
              <div className="input-group" style={{ gridColumn:'1/-1' }}>
                <label className="input-label">Email Address *</label>
                <input className="input" name="email" type="email" placeholder="you@college.edu" value={form.email} onChange={handleChange} />
              </div>
              <div className="input-group" style={{ gridColumn:'1/-1', position:'relative' }}>
                <label className="input-label">Password *</label>
                <input className="input" name="password" type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={handleChange} style={{ paddingRight:44 }} />
                <button type="button" onClick={() => setShowPw(p=>!p)} style={{ position:'absolute', right:12, bottom:10, background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'0.9rem' }}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>

              {form.role === 'student' && <>
                <div className="input-group">
                  <label className="input-label">Roll Number</label>
                  <input className="input" name="rollNumber" placeholder="e.g. 21CS001" value={form.rollNumber} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label className="input-label">Semester</label>
                  <select className="input" name="semester" value={form.semester} onChange={handleChange}>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ gridColumn:'1/-1' }}>
                  <label className="input-label">Department</label>
                  <select className="input" name="department" value={form.department} onChange={handleChange}>
                    <option value="">Select Department</option>
                    {['Computer Science','Electronics','Mechanical','Civil','Electrical','Information Technology'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </>}
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width:'100%', padding:'13px', fontSize:'1rem', justifyContent:'center', marginTop:8 }}>
              {loading
                ? <span style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />Creating account…</span>
                : '→ Create Account'
              }
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:24, fontSize:'0.875rem', color:'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--brand-400)', fontWeight:600 }}>Sign in →</Link>
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