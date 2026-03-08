import { useEffect, useState } from "react";
import { adminList, adminCreate, adminUpdate, adminDelete } from "../api";

const POS = ["noun","verb","adj","adv","prep","pron","conj","det","interj"];
const ARTICLES = ["", "der", "die", "das"];

export default function Admin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    german_word: "",
    english_word: "",
    parts_of_speech: "noun",
    article: "",
    plural: "",
    phrases: "",
  });
  const [err, setErr] = useState("");

  async function load() {
    const data = await adminList();
    setItems(data);
  }

  useEffect(() => { load(); }, []);

  async function addWord(e) {
    e.preventDefault();
    setErr("");
    try {
      const payload = { ...form, article: form.article || null };
      await adminCreate(payload);
      setForm({ german_word:"", english_word:"", parts_of_speech:"noun", article:"", plural:"", phrases:"" });
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function quickEdit(id, patch) {
    setErr("");
    try {
      await adminUpdate(id, patch);
      load();
    } catch {
      setErr("Update failed (maybe duplicate).");
    }
  }

  async function remove(id) {
    setErr("");
    await adminDelete(id);
    load();
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Admin</h1>

      <form onSubmit={addWord} className="border p-3 rounded mb-6 grid gap-3">
        <div className="grid md:grid-cols-2 gap-3">
          <input className="border p-2" placeholder="German word"
                 value={form.german_word} onChange={e=>setForm(f=>({...f, german_word:e.target.value}))} />
          <input className="border p-2" placeholder="English word"
                 value={form.english_word} onChange={e=>setForm(f=>({...f, english_word:e.target.value}))} />
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <select className="border p-2"
                  value={form.parts_of_speech}
                  onChange={e=>setForm(f=>({...f, parts_of_speech:e.target.value}))}>
            {POS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select className="border p-2"
                  value={form.article}
                  onChange={e=>setForm(f=>({...f, article:e.target.value}))}>
            {ARTICLES.map(a => <option key={a} value={a}>{a || "no article"}</option>)}
          </select>

          <input className="border p-2" placeholder="Plural (optional)"
                 value={form.plural} onChange={e=>setForm(f=>({...f, plural:e.target.value}))} />
        </div>

        <input className="border p-2" placeholder="Phrase (optional)"
               value={form.phrases} onChange={e=>setForm(f=>({...f, phrases:e.target.value}))} />

        {err && <div className="text-red-600">{err}</div>}
        <button className="border px-3 py-2 w-fit">Add word</button>
      </form>

      <div className="grid gap-3">
        {items.map(v => (
          <div key={v.id} className="border p-3 rounded">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="font-semibold">{v.article ? `${v.article} ` : ""}{v.german_word}</div>
              <div>→ {v.english_word}</div>
              <div className="opacity-70">({v.parts_of_speech})</div>
              <button className="border px-2 py-1 ml-auto" onClick={()=>remove(v.id)}>Delete</button>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <button className="border px-2 py-1" onClick={()=>quickEdit(v.id, { parts_of_speech: "noun" })}>noun</button>
              <button className="border px-2 py-1" onClick={()=>quickEdit(v.id, { parts_of_speech: "verb" })}>verb</button>
              <button className="border px-2 py-1" onClick={()=>quickEdit(v.id, { article: null })}>no article</button>
              <button className="border px-2 py-1" onClick={()=>quickEdit(v.id, { article: "der" })}>der</button>
              <button className="border px-2 py-1" onClick={()=>quickEdit(v.id, { article: "die" })}>die</button>
              <button className="border px-2 py-1" onClick={()=>quickEdit(v.id, { article: "das" })}>das</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}