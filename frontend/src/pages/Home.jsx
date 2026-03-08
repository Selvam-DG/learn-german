import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SAMPLE_WORDS = [
  { german: "der Augenblick",       english: "the moment / blink of an eye",        pos: "noun" },
  { german: "Fernweh",              english: "longing for distant places",           pos: "noun" },
  { german: "Weltschmerz",          english: "world-weariness",                     pos: "noun" },
  { german: "Schadenfreude",        english: "pleasure from another's misfortune",  pos: "noun" },
  { german: "Fingerspitzengefühl",  english: "intuition / sensitivity",             pos: "noun" },
];

const FEATURES = [
  { icon: "🔍", title: "Bidirectional Search",  desc: "Search German → English or English → German. Find any word instantly." },
  { icon: "📖", title: "A–Z Vocabulary",        desc: "Browse the complete lexicon alphabetically. Every word, article, and phrase." },
  { icon: "🎯", title: "Daily Practice",        desc: "A curated set of words every day. Build vocabulary one session at a time." },
  { icon: "⚡", title: "Random Drill",          desc: "Randomised sprints filtered by part of speech to target your weak spots." },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const S = {
  gold:        "var(--color-gold)",
  goldLight:   "var(--color-gold-light)",
  goldMuted:   "var(--color-gold-muted)",
  goldBorder:  "var(--color-gold-border)",
  navy:        "var(--color-navy)",
  navyLight:   "var(--color-navy-light)",
  cream:       "var(--color-cream)",
  creamMuted:  "var(--color-cream-muted)",
  creamFaint:  "var(--color-cream-faint)",
  display:     "var(--font-display)",
  body:        "var(--font-body)",
};

export default function Home() {
  const navigate = useNavigate();
  const [query,     setQuery]     = useState("");
  const [direction, setDirection] = useState("de-en");
  const [wordIdx,   setWordIdx]   = useState(0);
  const [visible,   setVisible]   = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setWordIdx(i => (i + 1) % SAMPLE_WORDS.length); setVisible(true); }, 400);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/vocabulary?search=${encodeURIComponent(query.trim())}&direction=${direction}`);
  }

  const word = SAMPLE_WORDS[wordIdx];

  return (
    <div style={{ background: S.navy }} className="pt-16 min-h-screen">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-radial-gold pointer-events-none" />

        {/* Decorative letters */}
        <span className="absolute top-[8%] left-[3%] pointer-events-none select-none leading-none"
              style={{ fontFamily: S.display, fontSize: "14rem", fontWeight: 900, color: "rgba(212,175,55,0.03)" }}>
          W
        </span>
        <span className="absolute bottom-[4%] right-[2%] pointer-events-none select-none leading-none"
              style={{ fontFamily: S.display, fontSize: "11rem", fontWeight: 900, color: "rgba(212,175,55,0.025)" }}>
          Z
        </span>

        {/* Eyebrow */}
        <div className="relative mb-8 inline-flex items-center gap-2 rounded-full px-5 py-1.5"
             style={{ background: S.goldMuted, border: `1px solid ${S.goldBorder}`, animation: "fadeUp 0.6s ease both" }}>
          <span style={{ fontFamily: S.body, color: S.gold, fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Deutsch • Englisch
          </span>
        </div>

        {/* Heading */}
        <h1 className="relative leading-[1.05] mb-6 max-w-4xl"
            style={{ fontFamily: S.display, fontWeight: 900, fontSize: "clamp(3rem,8vw,6rem)", animation: "fadeUp 0.6s ease 0.1s both" }}>
          <span style={{ color: S.cream }}>Master the</span>
          <br />
          <span className="text-shimmer">German Language</span>
        </h1>

        <p className="relative max-w-lg mb-12 leading-relaxed"
           style={{ fontFamily: S.body, fontWeight: 300, fontSize: "1.2rem", color: "rgba(232,224,208,0.6)", animation: "fadeUp 0.6s ease 0.2s both" }}>
          A curated vocabulary platform — search, browse, and learn
          German words with articles, plurals, and real phrases.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch}
              className="relative flex w-full max-w-xl mb-6 overflow-hidden rounded-xl"
              style={{ border: `1px solid ${S.goldBorder}`, animation: "fadeUp 0.6s ease 0.3s both", boxShadow: "0 0 40px rgba(212,175,55,0.07)" }}>
          <select
            value={direction}
            onChange={e => setDirection(e.target.value)}
            style={{ background: S.goldMuted, borderRight: `1px solid ${S.goldBorder}`, color: S.gold, fontFamily: S.body, fontSize: "0.82rem", letterSpacing: "0.05em" }}
            className="shrink-0 border-none px-4 py-3 outline-none cursor-pointer"
          >
            <option value="de-en">DE → EN</option>
            <option value="en-de">EN → DE</option>
          </select>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={direction === "de-en" ? "Search a German word…" : "Search an English word…"}
            style={{ fontFamily: S.body, color: S.cream, fontSize: "1rem" }}
            className="flex-1 min-w-0 border-none bg-transparent px-4 py-3 outline-none placeholder:text-[rgba(232,224,208,0.25)]"
          />
          <button
            type="submit"
            style={{ background: S.gold, color: S.navy, fontFamily: S.body, fontSize: "0.82rem", letterSpacing: "0.1em", fontWeight: 700 }}
            className="shrink-0 px-6 border-none cursor-pointer uppercase transition-colors duration-200 hover:brightness-110"
          >
            Search
          </button>
        </form>

        {/* CTA buttons */}
        <div className="relative flex flex-wrap gap-4 justify-center" style={{ animation: "fadeUp 0.6s ease 0.4s both" }}>
          <button
            onClick={() => navigate("/vocabulary")}
            style={{ fontFamily: S.body, color: S.gold, border: `1px solid ${S.goldBorder}`, fontSize: "0.95rem", letterSpacing: "0.06em" }}
            className="px-6 py-3 rounded-lg bg-transparent cursor-pointer transition-all duration-200 hover:bg-[rgba(212,175,55,0.08)]"
          >
            Browse A–Z
          </button>
          <button
            onClick={() => navigate("/learn")}
            style={{ fontFamily: S.body, color: "rgba(232,224,208,0.6)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.95rem" }}
            className="px-6 py-3 rounded-lg bg-transparent cursor-pointer transition-all duration-200 hover:text-[var(--color-cream)]"
          >
            Start Practice
          </button>
        </div>
      </section>

      {/* ── FEATURED WORD ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 flex justify-center">
        <div className="w-full max-w-2xl text-center">
          <p style={{ fontFamily: S.body, color: "rgba(212,175,55,0.5)", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "2.5rem" }}>
            ── Featured Word ──
          </p>

          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)", transition: "all 0.4s ease" }}>
            <div style={{ fontFamily: S.display, fontWeight: 700, color: S.gold, fontSize: "clamp(1.8rem,5vw,3.2rem)", marginBottom: "0.5rem" }}>
              {word.german}
            </div>
            <div style={{ fontFamily: S.body, fontWeight: 300, fontStyle: "italic", color: "rgba(232,224,208,0.7)", fontSize: "1.2rem", marginBottom: "1rem" }}>
              {word.english}
            </div>
            <span style={{ fontFamily: S.body, color: S.gold, background: S.goldMuted, border: `1px solid rgba(212,175,55,0.2)`, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase" }}
                  className="inline-block px-3 py-0.5 rounded-full">
              {word.pos}
            </span>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {SAMPLE_WORDS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setVisible(false); setTimeout(() => { setWordIdx(i); setVisible(true); }, 200); }}
                style={{ background: i === wordIdx ? S.gold : "rgba(212,175,55,0.3)", height: "6px", width: i === wordIdx ? "24px" : "6px", borderRadius: "100px", border: "none", cursor: "pointer", transition: "all 0.3s ease" }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 style={{ fontFamily: S.display, fontWeight: 700, color: S.cream, fontSize: "clamp(1.8rem,4vw,2.8rem)" }} className="mb-3">
            Everything you need to learn
          </h2>
          <p style={{ fontFamily: S.body, fontWeight: 300, color: "rgba(232,224,208,0.5)", fontSize: "1.1rem" }}>
            Built around how vocabulary actually sticks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              style={{ border: "1px solid rgba(212,175,55,0.12)", borderRadius: "16px", background: "rgba(255,255,255,0.02)", transition: "all 0.25s ease" }}
              className="p-6 cursor-default hover:bg-[rgba(212,175,55,0.04)] hover:-translate-y-1 hover:border-[rgba(212,175,55,0.3)]"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 style={{ fontFamily: S.display, fontWeight: 700, color: S.cream, fontSize: "1.1rem" }} className="mb-2">{f.title}</h3>
              <p style={{ fontFamily: S.body, fontWeight: 300, color: "rgba(232,224,208,0.5)", fontSize: "0.9rem", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ALPHABET TEASER ───────────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <h2 style={{ fontFamily: S.display, fontWeight: 700, color: S.cream, fontSize: "clamp(1.6rem,3.5vw,2.4rem)" }} className="mb-3">
          Browse the full vocabulary
        </h2>
        <p style={{ fontFamily: S.body, fontWeight: 300, color: "rgba(232,224,208,0.5)", fontSize: "1.05rem" }} className="mb-10">
          Every word, organized alphabetically — from A to Z.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {ALPHABET.map(letter => (
            <button
              key={letter}
              onClick={() => navigate(`/vocabulary?letter=${letter}`)}
              style={{ fontFamily: S.display, fontWeight: 700, color: "rgba(232,224,208,0.6)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "8px", background: "rgba(212,175,55,0.04)", transition: "all 0.15s ease", width: "42px", height: "42px", fontSize: "0.9rem", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.background = S.gold; e.currentTarget.style.color = S.navy; e.currentTarget.style.borderColor = S.gold; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(212,175,55,0.04)"; e.currentTarget.style.color = "rgba(232,224,208,0.6)"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)"; }}
            >
              {letter}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate("/vocabulary")}
          style={{ background: S.gold, color: S.navy, fontFamily: S.body, fontWeight: 700, fontSize: "1rem", letterSpacing: "0.06em" }}
          className="px-8 py-3 rounded-lg border-none cursor-pointer transition-all duration-200 hover:brightness-110"
        >
          Open Full Vocabulary →
        </button>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(212,175,55,0.1)", color: "rgba(232,224,208,0.25)", fontFamily: S.body, fontSize: "0.85rem", letterSpacing: "0.05em" }}
              className="py-8 text-center">
        Wortschatz — German–English Vocabulary Platform
      </footer>
    </div>
  );
}