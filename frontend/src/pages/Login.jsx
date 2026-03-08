import { useState } from "react";
import { login } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err,      setErr] = useState("");
  const [loading,  setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const data = await login(username, password);
      localStorage.setItem("token", data.access_token);
      nav("/admin");
    } catch {
      setErr("Invalid username or password.");
    }
    setLoading(false);
  }

  const inputCls = `w-full bg-navy-light border border-gold-border rounded-lg px-4 py-3
                    text-cream font-body text-base outline-none
                    focus:border-gold/60 transition-colors duration-200
                    placeholder:text-cream/25`;

  return (
    <div className="pt-16 min-h-screen bg-navy flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display font-black text-gold text-3xl mb-2">Wortschatz</h1>
          <p className="text-cream/40 font-body text-sm tracking-wide">Admin Access</p>
        </div>

        {/* Card */}
        <div className="bg-navy-light border border-gold-border rounded-2xl p-8
                        shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
          <h2 className="font-display font-bold text-cream text-xl mb-6">Sign In</h2>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <input
              className={inputCls}
              placeholder="Username"
              value={username}
              onChange={e => setU(e.target.value)}
              autoComplete="username"
            />
            <input
              className={inputCls}
              placeholder="Password"
              type="password"
              value={password}
              onChange={e => setP(e.target.value)}
              autoComplete="current-password"
            />

            {err && (
              <p className="text-red-400 font-body text-sm bg-red-500/10
                            border border-red-400/20 rounded-lg px-3 py-2">
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}