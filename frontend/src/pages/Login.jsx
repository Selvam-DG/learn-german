import { useState } from "react";
import { login } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const data = await login(username, password);
      localStorage.setItem("token", data.access_token);
      nav("/admin");
    } catch {
      setErr("Invalid login");
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-4">Admin Login</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input className="border p-2" placeholder="Username" value={username} onChange={e=>setU(e.target.value)} />
        <input className="border p-2" placeholder="Password" type="password" value={password} onChange={e=>setP(e.target.value)} />
        {err && <div className="text-red-600">{err}</div>}
        <button className="border px-3 py-2">Login</button>
      </form>
    </div>
  );
}