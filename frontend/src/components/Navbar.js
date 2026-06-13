import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      style={{
        background: "rgba(15,23,42,0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",

        borderBottom:
          "1px solid rgba(255,255,255,0.1)",

        padding: "16px 40px",

        display: "flex",

        justifyContent: "space-between",

        alignItems: "center",

        position: "sticky",

        top: 0,

        zIndex: 1000,
      }}
    >
      <h2
        style={{
          color: "white",

          margin: 0,

          fontSize: "28px",

          fontWeight: "bold",
        }}
      >
        🎓 CampusIQ
      </h2>

      <div
        style={{
          display: "flex",

          gap: "25px",

          alignItems: "center",
        }}
      >
        <Link to="/" style={linkStyle}>
          Home
        </Link>

        <Link to="/login" style={linkStyle}>
          Login
        </Link>

        <Link to="/register" style={linkStyle}>
          Register
        </Link>

        <Link to="/dashboard" style={linkStyle}>
          Dashboard
        </Link>
      </div>
    </nav>
  );
}

const linkStyle = {
  color: "#e2e8f0",

  textDecoration: "none",

  fontSize: "17px",

  fontWeight: "500",

  transition: "0.3s",
};

export default Navbar;