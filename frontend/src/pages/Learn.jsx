import { useEffect, useState } from "react";
import { learnDaily, learnRandom } from "../api";

const POS = ["noun", "verb", "adj", "adv", "prep", "pron", "conj", "det", "interj"];

const POS_COLOR = {
  noun: "#D4AF37",
  verb: "#7AB8F5",
  adj: "#A8D8A8",
  adv: "#F5A87A",
  prep: "#C9A8F5",
  pron: "#F5D87A",
  conj: "#F5A8C9",
  det: "#A8F5F5",
  interj: "#F5A8A8",
};

function PosBadge({ pos }) {
  const color = POS_COLOR[pos] || "#D4AF37";

  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-body font-semibold uppercase tracking-widest"
      style={{
        color,
        background: `${color}18`,
        borderColor: `${color}35`,
      }}
    >
      {pos || "unknown"}
    </span>
  );
}

function DetailBlock({ label, children }) {
  if (!children) return null;

  return (
    <div className="rounded-xl border border-gold-border bg-navy/70 px-4 py-3">
      <p className="text-gold/70 font-body text-[0.65rem] uppercase tracking-[0.16em] mb-1.5">
        {label}
      </p>
      <div className="text-cream/80 font-body text-sm leading-6">
        {children}
      </div>
    </div>
  );
}

function FlashCard({ word, flipped, onFlip }) {
  const synonyms = Array.isArray(word.synonyms) ? word.synonyms : [];

  return (
    <div className="h-[360px] perspective-1000">
      <button
        type="button"
        onClick={onFlip}
        className="relative h-full w-full cursor-pointer bg-transparent text-left"
        style={{ perspective: "1000px" }}
      >
        <div
          className="relative h-full w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-3xl border border-gold-border bg-navy-light p-6 shadow-[0_0_32px_rgba(0,0,0,0.18)] hover:border-gold/50 transition-colors"
            style={{
              backfaceVisibility: "hidden",
            }}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3 mb-6">
                <PosBadge pos={word.parts_of_speech} />

                <span className="text-cream/25 font-body text-xs">
                  Click to flip
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {word.article && (
                  <div className="mb-3">
                    <span className="inline-flex rounded-full border border-gold-border bg-gold/10 px-4 py-1 text-gold font-body font-semibold">
                      {word.article}
                    </span>
                  </div>
                )}

                <h2 className="font-display font-black text-cream text-4xl leading-tight mb-4">
                  {word.german_word}
                </h2>

                {word.plural && (
                  <p className="font-body text-cream/35 text-base">
                    Plural available
                  </p>
                )}
              </div>

              <div className="border-t border-gold-border pt-4 text-cream/30 font-body text-sm">
                Think of the English meaning, then flip.
              </div>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-3xl border border-gold-border bg-navy-light p-6 shadow-[0_0_32px_rgba(0,0,0,0.18)]"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="h-full overflow-y-auto pr-1">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <p className="text-gold/70 font-body text-xs uppercase tracking-[0.18em] mb-1">
                    Translation
                  </p>

                  <h3 className="font-display font-bold text-cream text-3xl leading-tight">
                    {word.english_word}
                  </h3>
                </div>

                <span className="text-cream/25 font-body text-xs">
                  Click to return
                </span>
              </div>

              <div className="grid gap-3">
                <DetailBlock label="German">
                  <div className="text-lg">
                    {word.article ? `${word.article} ` : ""}
                    <span className="font-semibold text-cream">
                      {word.german_word}
                    </span>
                  </div>
                </DetailBlock>

                <DetailBlock label="Part of speech">
                  <PosBadge pos={word.parts_of_speech} />
                </DetailBlock>

                {word.plural && (
                  <DetailBlock label="Plural">
                    <span className="text-cream">{word.plural}</span>
                  </DetailBlock>
                )}

                {word.phrases && (
                  <DetailBlock label="Example phrase">
                    <div className="border-l-4 border-gold bg-gold/5 rounded-r-xl px-4 py-2 italic">
                      {word.phrases}
                    </div>
                  </DetailBlock>
                )}

                <DetailBlock label="Synonyms">
                  {synonyms.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {synonyms.map((s, index) => (
                        <span
                          key={`${s}-${index}`}
                          className="rounded-full border border-gold-border bg-gold/5 px-3 py-1 text-cream/75"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-cream/35">No synonyms added yet.</span>
                  )}
                </DetailBlock>

                <DetailBlock label="Notes">
                  {word.notes ? (
                    <div className="whitespace-pre-wrap">{word.notes}</div>
                  ) : (
                    <span className="text-cream/35">No notes added yet.</span>
                  )}
                </DetailBlock>
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

export default function Learn() {
  const [mode, setMode] = useState("daily");
  const [pos, setPos] = useState("");
  const [count, setCount] = useState(10);

  const [items, setItems] = useState([]);
  const [dateStr, setDateStr] = useState("");
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState({});
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    setFlipped({});

    try {
      if (mode === "daily") {
        const data = await learnDaily({ pos, n: count });
        setItems(data.items || []);
        setDateStr(data.date || "");
      } else {
        const data = await learnRandom({ pos, limit: count });
        setItems(data || []);
        setDateStr("");
      }
    } catch {
      setItems([]);
      setError("Could not load practice words. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [mode, pos, count]);

  function toggleFlip(id) {
    setFlipped((f) => ({ ...f, [id]: !f[id] }));
  }

  function resetCards() {
    setFlipped({});
  }

  const revealedCount = Object.values(flipped).filter(Boolean).length;

  const selectCls =
    "bg-navy border border-gold-border text-cream font-body text-sm px-4 py-3 rounded-xl outline-none focus:border-gold cursor-pointer";

  return (
    <div className="pt-16 min-h-screen bg-navy">
      <section className="border-b border-gold-border bg-navy-light/60">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
            <div>
              <p className="font-body text-xs uppercase tracking-[0.2em] text-gold/70 mb-2">
                Flashcard Practice
              </p>

              <h1 className="font-display font-black text-cream text-4xl md:text-5xl">
                Practice
              </h1>

              <p className="font-body text-cream/45 text-base mt-3 max-w-2xl leading-7">
                Flip each card to check translation, grammar, examples, synonyms, and notes.
              </p>
            </div>

            <div className="rounded-2xl border border-gold-border bg-navy px-5 py-4 min-w-[220px]">
              <p className="text-cream/35 font-body text-xs uppercase tracking-[0.14em] mb-1">
                Progress
              </p>
              <div className="font-display text-cream text-3xl">
                {revealedCount}
                <span className="text-cream/30 text-base font-body">
                  {" "}
                  / {items.length}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gold-border bg-navy p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <select
                className={selectCls}
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="daily">Words for the day</option>
                <option value="random">Random practice</option>
              </select>

              <select
                className={selectCls}
                value={pos}
                onChange={(e) => setPos(e.target.value)}
              >
                <option value="">All parts of speech</option>
                {POS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <select
                className={selectCls}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              >
                {[5, 10, 20].map((n) => (
                  <option key={n} value={n}>
                    {n} words
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={load}
                className="ml-auto rounded-xl border border-gold-border bg-gold/5 px-4 py-3 text-gold font-body text-sm hover:border-gold/60 hover:bg-gold/10 transition-all"
              >
                ↺ Refresh
              </button>

              <button
                type="button"
                onClick={resetCards}
                className="rounded-xl border border-gold-border bg-white/5 px-4 py-3 text-cream/65 font-body text-sm hover:border-gold/60 hover:text-cream transition-all"
              >
                Reset flips
              </button>
            </div>
          </div>

          {dateStr && (
            <p className="text-cream/40 font-body text-sm mt-4 italic">
              Daily set: {dateStr}
            </p>
          )}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-red-300 font-body text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-gold-border bg-navy-light px-6 py-20 text-center text-gold/60 font-body italic text-lg">
            Loading practice cards...
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-2xl border border-gold-border bg-navy-light px-6 py-20 text-center text-cream/30 font-body italic text-lg">
            No words found. Try a different filter.
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((word) => (
              <FlashCard
                key={word.id}
                word={word}
                flipped={!!flipped[word.id]}
                onFlip={() => toggleFlip(word.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}