import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, NavLink, Navigate, useLocation, useNavigate } from "react-router-dom";
import Login      from "./pages/Login";
import Admin      from "./pages/Admin";
import Learn      from "./pages/Learn";
import Home       from "./pages/Home";
import Vocabulary from "./pages/Vocabulary";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function NavBar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const location  = useLocation();
  const navigate  = useNavigate();
  const isHome    = location.pathname === "/";

  // Re-check auth whenever the route changes (e.g. after login/logout)
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  }

  const solid = scrolled || !isHome;

  const navLinkStyle = ({ isActive }) => ({
    fontFamily: "var(--font-body)",
    fontSize: "0.95rem",
    letterSpacing: "0.05em",
    textDecoration: "none",
    color: isActive ? "var(--color-gold)" : "rgba(232,224,208,0.6)",
    borderBottom: isActive ? "1px solid var(--color-gold)" : "1px solid transparent",
    paddingBottom: "2px",
    transition: "color 0.2s",
  });

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 transition-all duration-300"
      style={{
        background:     solid ? "rgba(10,15,30,0.97)" : "transparent",
        backdropFilter: solid ? "blur(12px)" : "none",
        borderBottom:   solid ? "1px solid rgba(212,175,55,0.2)" : "none",
      }}
    >
      <Link to="/" className="no-underline">
        <span style={{ fontFamily: "var(--font-display)", color: "var(--color-gold)", fontSize: "1.4rem", fontWeight: 900, letterSpacing: "0.04em" }}>
          Wortschatz
        </span>
      </Link>

      <div className="flex items-center gap-8">
        {[
          { to: "/",           label: "Home",       end: true  },
          { to: "/vocabulary", label: "Vocabulary",  end: false },
          { to: "/learn",      label: "Practice",    end: false },
        ].map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end} style={navLinkStyle}>
            {label}
          </NavLink>
        ))}

        {/* Admin link — only shown when logged in */}
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <NavLink
              to="/admin"
              style={({ isActive }) => ({
                fontFamily: "var(--font-body)",
                fontSize: "0.78rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
                color: isActive ? "var(--color-gold)" : "rgba(232,224,208,0.55)",
                borderBottom: isActive ? "1px solid var(--color-gold)" : "1px solid transparent",
                paddingBottom: "2px",
                transition: "color 0.2s",
              })}
            >
              Admin
            </NavLink>
            <button
              onClick={handleLogout}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.78rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(232,224,208,0.35)",
                background: "transparent",
                border: "1px solid rgba(212,175,55,0.15)",
                borderRadius: "6px",
                padding: "0.25rem 0.75rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#F5A8A8"; e.currentTarget.style.borderColor = "rgba(245,100,100,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(232,224,208,0.35)"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.15)"; }}
            >
              Logout
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            style={({ isActive }) => ({
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              textDecoration: "none",
              color: isActive ? "var(--color-gold)" : "rgba(232,224,208,0.4)",
              background: "rgba(212,175,55,0.07)",
              border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: "6px",
              padding: "0.3rem 0.9rem",
              transition: "all 0.2s",
            })}
          >
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/vocabulary" element={<Vocabulary />} />
        <Route path="/learn"      element={<Learn />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/admin"      element={<RequireAuth><Admin /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  );
}