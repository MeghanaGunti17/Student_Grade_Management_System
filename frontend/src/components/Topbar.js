import { useState, useEffect } from "react";

export default function Topbar({ title = "" }) {
  const [time, setTime] = useState(new Date());

  const name =
    localStorage.getItem("userName") || "User";

  const role =
    localStorage.getItem("role") || "user";

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const greet = () => {
    const h = time.getHours();

    if (h < 12) return "☀️ Good Morning";
    if (h < 17) return "🌤 Good Afternoon";

    return "🌙 Good Evening";
  };

  const formattedDate =
    time.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        padding: "18px 24px",
        borderRadius: "15px",
        background:
          "rgba(15,23,42,0.55)",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter:
          "blur(15px)",
        border:
          "1px solid rgba(255,255,255,0.12)",
      }}
    >
      {/* Left */}
      <div>
        <h2
          style={{
            margin: 0,
            color: "white",
            fontSize: "22px",
          }}
        >
          {title || "Dashboard"}
        </h2>

        <p
          style={{
            margin: "5px 0 0",
            color: "#94a3b8",
            fontSize: "14px",
          }}
        >
          {greet()}{" "}
          <span
            style={{
              color: "#38bdf8",
              fontWeight: "600",
            }}
          >
            {name.split(" ")[0]}
          </span>
        </p>

        <p
          style={{
            margin: "4px 0 0",
            color: "#ffffff",
            fontSize: "12px",
          }}
        >
          {formattedDate}
        </p>
      </div>

      {/* Right */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg,#38bdf8,#2563eb)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
          }}
        >
          {initials}
        </div>

        <div>
          <div
            style={{
              color: "white",
              fontWeight: "600",
            }}
          >
            {name}
          </div>

          <div
            style={{
              color: "#94a3b8",
              fontSize: "12px",
              textTransform: "capitalize",
            }}
          >
            {role}
          </div>
        </div>
      </div>
    </header>
  );
}