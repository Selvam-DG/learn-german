import { useEffect, useState } from "react";
import { adminList, adminCreate, adminUpdate, adminDelete } from "../api";

const POS      = ["noun","verb","adj","adv","prep","pron","conj","det","interj"];
const ARTICLES = ["", "der", "die", "das"];

const BLANK = { german_word:"", english_word:"", parts_of_speech:"noun", article:"", plural:"", phrases:"" };

const inputCls = `w-full bg-navy border border-gold-border rounded-lg px-3 py-2.5
                  text-cream font-body text-sm outline-none
                  focus:border-gold/60 transition-colors duration-200
                  placeholder:text-cream/25`;

const selectCls = `w-full bg-navy border border-gold-border rounded-lg px-3 py-2.5
                   text-cream font-body text-sm outline-none cursor-pointer
                   focus:border-gold/60 transition-colors duration-200`;

export default function Admin() {
  const [items, setItems] = useState([]);
  const [form,  setForm]  = useState(BLANK);
  const [err,   setErr]   = useState("");
  const [pos,   setPos]   = useState("");

  async function load() {
    const data = await adminList(pos || undefined);
    setItems(data);
  }

  useEffect(() => { load(); }, [pos]);

  async function addWord(e) {
    e.preventDefault(); setErr("");
    try {
      await adminCreate({ ...form, article: form.article || null });
      setForm(BLANK);
      load();
    } catch (e) { setErr(e.message); }
  }

  async function quickEdit(id, patch) {
    setErr("");
    try   { await adminUpdate(id, patch); load(); }
    catch { setErr("Update failed (maybe duplicate)."); }
  }

  async function remove(id) {
    setErr("");
    await adminDelete(id);
    load();
  }

  const qBtn = "text-xs font-body border border-gold-border text-cream/60 px-2.5 py-1 rounded-md hover:border-gold/50 hover:text-cream transition-colors cursor-pointer bg-transparent";

  return (
    <div className="pt-16 min-h-screen bg-navy">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <h1 className="font-display font-bold text-cream text-3xl mb-8">Admin</h1>

        {/* ── Add word form ──────────────────────────────────────────── */}
        <form
          onSubmit={addWord}
          className="border border-gold-border rounded-2xl p-6 mb-10 bg-navy-light"
        >
          <h2 className="font-display font-semibold text-cream text-lg mb-5">Add New Word</h2>

          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <input className={inputCls} placeholder="German word *"
                   value={form.german_word}
                   onChange={e => setForm(f => ({ ...f, german_word: e.target.value }))}
                   required />
            <input className={inputCls} placeholder="English word *"
                   value={form.english_word}
                   onChange={e => setForm(f => ({ ...f, english_word: e.target.value }))}
                   required />
          </div>

          <div className="grid md:grid-cols-3 gap-3 mb-3">
            <select className={selectCls}
                    value={form.parts_of_speech}
                    onChange={e => setForm(f => ({ ...f, parts_of_speech: e.target.value }))}>
              {POS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select className={selectCls}
                    value={form.article}
                    onChange={e => setForm(f => ({ ...f, article: e.target.value }))}>
              {ARTICLES.map(a => <option key={a} value={a}>{a || "no article"}</option>)}
            </select>

            <input className={inputCls} placeholder="Plural (optional)"
                   value={form.plural}
                   onChange={e => setForm(f => ({ ...f, plural: e.target.value }))} />
          </div>

          <input className={`${inputCls} mb-4`} placeholder="Example phrase (optional)"
                 value={form.phrases}
                 onChange={e => setForm(f => ({ ...f, phrases: e.target.value }))} />

          {err && (
            <p className="text-red-400 text-sm font-body bg-red-500/10 border border-red-400/20
                          rounded-lg px-3 py-2 mb-4">
              {err}
            </p>
          )}

          <button type="submit" className="btn-gold">Add Word</button>
        </form>

        {/* ── Filter + list ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-cream/40 font-body text-sm">Filter:</span>
          <select
            className="bg-navy-light border border-gold-border text-cream font-body text-sm
                       px-3 py-2 rounded-lg outline-none focus:border-gold cursor-pointer"
            value={pos}
            onChange={e => setPos(e.target.value)}
          >
            <option value="">All parts of speech</option>
            {POS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <span className="ml-auto text-cream/30 font-body text-sm">
            {items.length} word{items.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid gap-3">
          {items.map(v => (
            <div key={v.id}
                 className="border border-gold-border rounded-xl p-4 bg-navy-light hover:border-gold/30 transition-colors">

              {/* Word header */}
              <div className="flex flex-wrap gap-3 items-center mb-3">
                <span className="font-display font-bold text-cream text-lg">
                  {v.article && <span className="text-gold mr-1.5">{v.article}</span>}
                  {v.german_word}
                </span>
                <span className="text-cream/50 font-body text-sm">→ {v.english_word}</span>
                <span className="text-cream/30 font-body text-xs italic">({v.parts_of_speech})</span>
                {v.plural && <span className="text-cream/25 text-xs font-body">Pl. {v.plural}</span>}

                <button
                  onClick={() => remove(v.id)}
                  className="ml-auto text-red-400/60 hover:text-red-400 text-xs font-body
                             border border-red-400/20 hover:border-red-400/50 px-2.5 py-1
                             rounded-md transition-colors cursor-pointer bg-transparent"
                >
                  Delete
                </button>
              </div>

              {/* Quick-edit buttons */}
              <div className="flex flex-wrap gap-2">
                <span className="text-cream/25 font-body text-xs self-center">POS:</span>
                <button className={qBtn} onClick={() => quickEdit(v.id, { parts_of_speech:"noun" })}>noun</button>
                <button className={qBtn} onClick={() => quickEdit(v.id, { parts_of_speech:"verb" })}>verb</button>
                <button className={qBtn} onClick={() => quickEdit(v.id, { parts_of_speech:"adj"  })}>adj</button>

                <span className="text-cream/25 font-body text-xs self-center ml-2">Article:</span>
                <button className={qBtn} onClick={() => quickEdit(v.id, { article: null  })}>none</button>
                <button className={qBtn} onClick={() => quickEdit(v.id, { article:"der"  })}>der</button>
                <button className={qBtn} onClick={() => quickEdit(v.id, { article:"die"  })}>die</button>
                <button className={qBtn} onClick={() => quickEdit(v.id, { article:"das"  })}>das</button>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12 text-cream/25 font-body italic">
            No words found.
          </div>
        )}
      </div>
    </div>
  );
}