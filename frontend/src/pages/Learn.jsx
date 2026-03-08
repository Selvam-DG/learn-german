import { useEffect, useState } from "react";
import { learnDaily, learnRandom } from "../api";

const POS = ["noun","verb","adj","adv","prep","pron","conj","det","interj"];

export default function Learn() {
  const [mode, setMode] = useState("daily"); // daily | random
  const [pos, setPos] = useState("");
  const [count, setCount] = useState(10);
  const [items, setItems] = useState([]);
  const [dateStr, setDateStr] = useState("");

  async function load() {
    if (mode === "daily") {
      const data = await learnDaily({ pos, n: count });
      setItems(data.items);
      setDateStr(data.date);
    } else {
      const data = await learnRandom({ pos, limit: count });
      setItems(data);
      setDateStr("");
    }
  }

  useEffect(() => { load(); }, [mode, pos, count]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Learn</h1>

      <div className="flex flex-wrap gap-3 items-center mb-4">
        <select className="border p-2" value={mode} onChange={e=>setMode(e.target.value)}>
          <option value="daily">Words for the day</option>
          <option value="random">Random practice</option>
        </select>

        <select className="border p-2" value={pos} onChange={e=>setPos(e.target.value)}>
          <option value="">All parts of speech</option>
          {POS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select className="border p-2" value={count} onChange={e=>setCount(Number(e.target.value))}>
          {[5,10,20].map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        <button className="border px-3 py-2" onClick={load}>Refresh</button>
      </div>

      {dateStr && <div className="mb-2 text-sm opacity-70">Daily set: {dateStr}</div>}

      <div className="grid gap-3">
        {items.map(v => (
          <div key={v.id} className="border p-3 rounded">
            <div className="flex gap-2 items-baseline">
              <div className="text-lg font-semibold">
                {v.article ? `${v.article} ` : ""}{v.german_word}
              </div>
              <div className="opacity-70">({v.parts_of_speech})</div>
            </div>
            <div className="mt-1">{v.english_word}</div>
            {v.plural && <div className="text-sm opacity-70 mt-1">Plural: {v.plural}</div>}
            {v.phrases && <div className="text-sm mt-2">Phrase: {v.phrases}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}