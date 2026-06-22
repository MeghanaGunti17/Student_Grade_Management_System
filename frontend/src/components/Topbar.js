import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const adminNav = [
  { label: "Overview",         icon: "⬡", to: "/dashboard" },
  { label: "Students",         icon: "🎓", to: "/students" },
  { label: "Analytics",        icon: "📈", to: "/analytics" },
  { label: "Attendance",       icon: "📋", to: "/attendance" },
  { label: "AI Advisor",       icon: "🤖", to: "/ai-advisor" },
  { label: "Settings",         icon: "⚙️", to: "/settings" },
];

const facultyNav = [
  { label: "Marks & Attendance", icon: "✏️", to: "/faculty-dashboard" },
  { label: "Students",           icon: "🎓", to: "/students" },
  { label: "Analytics",          icon: "📈", to: "/analytics" },
  { label: "Attendance Records", icon: "📋", to: "/attendance" },
  { label: "AI Advisor",         icon: "🤖", to: "/ai-advisor" },
];

const studentNav = [
  { label: "My Results",  icon: "📊", to: "/student-dashboard" },
  { label: "AI Advisor",  icon: "🤖", to: "/ai-advisor" },
  { label: "Settings",    icon: "⚙️", to: "/settings" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const role  = localStorage.getItem("role") || "student";
  const name  = localStorage.getItem("userName") || "User";

  const navItems =
    role === "admin"   ? adminNav :
    role === "faculty" ? facultyNav :
    studentNav;

  const initials = name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <aside style={{
      width:"260px", minWidth:"260px", height:"100vh",
      position:"fixed", left:0, top:0, zIndex:1000,
      background:"rgba(9,16,36,0.96)", backdropFilter:"blur(20px)",
      WebkitBackdropFilter:"blur(20px)",
      borderRight:"1px solid rgba(255,255,255,0.07)",
      display:"flex", flexDirection:"column", justifyContent:"space-between",
      padding:"20px", boxSizing:"border-box",
    }}>
      <div>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"24px" }}>
          <div style={{ width:"44px", height:"44px", borderRadius:"12px",
            background:"linear-gradient(135deg,#38bdf8,#2563eb)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px",
            boxShadow:'0 0 16px rgba(56,189,248,0.25)' }}>🎓</div>
          <div>
            <h2 style={{ margin:0, color:"white", fontSize:"1.1rem", fontWeight:700 }}>CampusIQ</h2>
            <p style={{ margin:0, color:"#64748b", fontSize:"11px" }}>Student Management System</p>
          </div>
        </div>

        {/* Role badge */}
        <div style={{ marginBottom:18, padding:'5px 12px', borderRadius:8,
          background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', display:'inline-block' }}>
          <span style={{ fontSize:'0.72rem', color:'#60a5fa', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>
            {role === 'admin' ? '🔑 Administrator' : role === 'faculty' ? '👩‍🏫 Faculty' : '🎓 Student'}
          </span>
        </div>

        {/* Navigation */}
        <nav>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              display:"flex", alignItems:"center", gap:"11px",
              padding:"10px 13px", marginBottom:"4px", borderRadius:"10px",
              textDecoration:"none", color: isActive ? "white" : "#94a3b8",
              fontSize:"0.875rem", fontWeight: isActive ? 600 : 400,
              background: item.label === 'AI Advisor'
                ? isActive ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.06)"
                : isActive ? "rgba(59,130,246,0.25)" : "transparent",
              border: item.label === 'AI Advisor'
                ? isActive ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(124,58,237,0.15)"
                : isActive ? "1px solid rgba(59,130,246,0.4)" : "1px solid transparent",
              transition:'all 0.15s',
            })}>
              <span style={{ fontSize:'1rem', flexShrink:0 }}>{item.icon}</span>
              {item.label}
              {item.label === 'AI Advisor' && (
                <span style={{ marginLeft:'auto', fontSize:'0.65rem', padding:'2px 6px', borderRadius:10, background:'rgba(124,58,237,0.3)', color:'#c4b5fd', fontWeight:700 }}>NEW</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Footer */}
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"11px",
          borderRadius:"12px", background:"rgba(255,255,255,0.05)", border:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ width:"36px", height:"36px", borderRadius:"50%", flexShrink:0,
            background:"linear-gradient(135deg,#38bdf8,#2563eb)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"white", fontWeight:"bold", fontSize:'0.8rem' }}>{initials}</div>
          <div style={{ flex:1, overflow:'hidden' }}>
            <div style={{ color:"white", fontWeight:"600", fontSize:'0.85rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{name}</div>
            <div style={{ color:"#64748b", fontSize:"11px", textTransform:"capitalize", marginTop:1 }}>{role}</div>
          </div>
          <button onClick={handleLogout} title="Logout"
            style={{ background:"none", border:"none", color:"#ef4444", cursor:"pointer", fontSize:"15px", flexShrink:0, padding:4 }}>↩</button>
        </div>
      </div>
    </aside>
  );
}
