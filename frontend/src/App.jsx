import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Learn from "./pages/Learn";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="p-4 max-w-5xl mx-auto">
        <nav className="flex gap-4 mb-6">
          <Link className="underline" to="/">Learn</Link>
          <Link className="underline" to="/admin">Admin</Link>
          <Link className="underline" to="/login">Login</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Learn />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <Admin />
              </RequireAuth>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}