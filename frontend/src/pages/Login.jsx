import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");

    try {
      await login(username, password);
      navigate("/admin");
    } catch (e) {
      setErr(e.message || "Login failed");
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-navy flex items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md border border-gold-border rounded-2xl p-6 bg-navy-light"
      >
        <h1 className="font-display font-bold text-cream text-3xl mb-6">
          Admin Login
        </h1>

        <input
          className="w-full bg-navy border border-gold-border rounded-lg px-3 py-2.5 text-cream font-body text-sm outline-none focus:border-gold/60 mb-3"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          className="w-full bg-navy border border-gold-border rounded-lg px-3 py-2.5 text-cream font-body text-sm outline-none focus:border-gold/60 mb-4"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {err && (
          <p className="text-red-400 text-sm font-body bg-red-500/10 border border-red-400/20 rounded-lg px-3 py-2 mb-4">
            {err}
          </p>
        )}

        <button type="submit" className="btn-gold w-full">
          Login
        </button>
      </form>
    </div>
  );
}