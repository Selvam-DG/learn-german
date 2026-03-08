import { useEffect, useState } from "react";
import { learnDaily, learnRandom } from "../api";

const POS = ["noun","verb","adj","adv","prep","pron","conj","det","interj"];

const POS_COLOR = {
  noun:"#D4AF37", verb:"#7AB8F5", adj:"#A8D8A8",
  adv:"#F5A87A",  prep:"#C9A8F5", pron:"#F5D87A",
  conj:"#F5A8C9", det:"#A8F5F5",  interj:"#F5A8A8",
};

function PosBadge({ pos }) {
  const c = POS_COLOR[pos] || "#D4AF37";
  return (
    <span
      className="inline-block text-[0.65rem] tracking-widest uppercase px-2 py-0.5 rounded-full border"
      style={{ color: c, background: `${c}18`, borderColor: `${c}30` }}
    >
      {pos}
    </span>
  );
}

export default function Learn() {
  const [mode,    setMode]    = useState("daily");
  const [pos,     setPos]     = useState("");
  const [count,   setCount]   = useState(10);
  const [items,   setItems]   = useState([]);
  const [dateStr, setDateStr] = useState("");
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState({});

  async function load() {
    setLoading(true);
    setFlipped({});
    try {
      if (mode === "daily") {
        const data = await learnDaily({ pos, n: count });
        setItems(data.items);
        setDateStr(data.date);
      } else {
        const data = await learnRandom({ pos, limit: count });
        setItems(data);
        setDateStr("");
      }
    } catch {
      setItems([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [mode, pos, count]);

  function toggleFlip(id) {
    setFlipped(f => ({ ...f, [id]: !f[id] }));
  }

  const selectCls = "bg-navy-light border border-gold-border text-cream font-body text-sm px-3 py-2 rounded-lg outline-none focus:border-gold cursor-pointer";

  return (
    <div className="pt-16 min-h-screen bg-navy">
      <div className="max-w-4xl mx-auto px-6 py-10">

        <h1 className="font-display font-bold text-cream text-3xl mb-8">Practice</h1>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center mb-6 p-4
                        border border-gold-border rounded-xl bg-white/[0.02]">
          <select className={selectCls} value={mode} onChange={e => setMode(e.target.value)}>
            <option value="daily">Words for the day</option>
            <option value="random">Random practice</option>
          </select>

          <select className={selectCls} value={pos} onChange={e => setPos(e.target.value)}>
            <option value="">All parts of speech</option>
            {POS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select className={selectCls} value={count} onChange={e => setCount(Number(e.target.value))}>
            {[5, 10, 20].map(n => <option key={n} value={n}>{n} words</option>)}
          </select>

          <button
            onClick={load}
            className="btn-ghost text-sm px-4 py-2 ml-auto"
          >
            ↺ Refresh
          </button>
        </div>

        {dateStr && (
          <p className="text-cream/40 font-body text-sm mb-5 italic">
            Daily set: {dateStr}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-gold/50 font-body italic">Loading…</div>
        )}

        {/* Word cards */}
        {!loading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map(v => (
              <div
                key={v.id}
                onClick={() => toggleFlip(v.id)}
                className="word-card select-none min-h-[120px] flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    {v.article && (
                      <span className="text-gold font-semibold text-sm">{v.article}</span>
                    )}
                    <span className="font-display font-bold text-cream text-xl">
                      {v.german_word}
                    </span>
                    <PosBadge pos={v.parts_of_speech} />
                  </div>

                  {/* Reveal on click */}
                  <div className={`transition-all duration-300 overflow-hidden ${flipped[v.id] ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                    <p className="font-body italic text-cream/70 mt-2">{v.english_word}</p>
                    {v.plural && (
                      <p className="text-cream/35 text-xs mt-1">Plural: {v.plural}</p>
                    )}
                    {v.phrases && (
                      <p className="text-cream/50 text-sm mt-2 border-l-2 border-gold/40 pl-3 italic">
                        {v.phrases}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-cream/20 text-xs mt-3 font-body">
                  {flipped[v.id] ? "Click to hide" : "Click to reveal"}
                </p>
              </div>
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-16 text-cream/25 font-body italic">
            No words found. Try a different filter.
          </div>
        )}
      </div>
    </div>
  );
}