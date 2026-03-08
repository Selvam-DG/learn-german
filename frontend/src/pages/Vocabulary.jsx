import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { searchVocab, vocabByLetter } from "../api";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Part-of-speech colours — Tailwind can't generate dynamic class names at runtime,
// so we use a small inline-style map just for the per-POS accent colour.
const POS_COLOR = {
  noun:  "#D4AF37", verb:  "#7AB8F5", adj:   "#A8D8A8",
  adv:   "#F5A87A", prep:  "#C9A8F5", pron:  "#F5D87A",
  conj:  "#F5A8C9", det:   "#A8F5F5", interj:"#F5A8A8",
};

function PosBadge({ pos }) {
  const c = POS_COLOR[pos] || "#D4AF37";
  return (
    <span
      className="pos-badge"
      style={{ color: c, background: `${c}18`, borderColor: `${c}30` }}
    >
      {pos}
    </span>
  );
}

function WordCard({ word, onClick }) {
  return (
    <div className="word-card" onClick={() => onClick(word)}>
      <div className="flex flex-wrap items-baseline gap-2 mb-1">
        {word.article && (
          <span className="text-gold font-semibold text-sm">{word.article}</span>
        )}
        <span className="font-display font-bold text-cream text-lg leading-tight">
          {word.german_word}
        </span>
        <PosBadge pos={word.parts_of_speech} />
      </div>
      <p className="font-body italic text-cream/60 text-[0.95rem]">
        {word.english_word}
      </p>
      {word.plural && (
        <p className="text-cream/30 text-xs mt-1">Pl. {word.plural}</p>
      )}
    </div>
  );
}

function WordModal({ word, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!word) return null;
  const posColor = POS_COLOR[word.parts_of_speech] || "#D4AF37";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center
                     rounded-lg bg-white/5 border border-white/10 text-cream/40
                     hover:text-cream/80 hover:bg-white/10 transition-colors cursor-pointer text-lg"
        >
          ×
        </button>

        {/* Article pill */}
        {word.article && (
          <div className="inline-block bg-gold-muted border border-gold-border rounded-full
                          px-4 py-1 text-gold font-semibold text-sm mb-3">
            {word.article}
          </div>
        )}

        {/* German word */}
        <h2 className="font-display font-black text-cream leading-tight mb-2"
            style={{ fontSize: "clamp(2rem, 5vw, 2.8rem)" }}>
          {word.german_word}
        </h2>

        {/* POS badge */}
        <div className="mb-5">
          <PosBadge pos={word.parts_of_speech} />
        </div>

        {/* Divider */}
        <div className="h-px bg-gold/10 mb-5" />

        {/* English */}
        <div className="mb-5">
          <p className="section-eyebrow">English</p>
          <p className="font-body font-light italic text-cream text-2xl leading-snug">
            {word.english_word}
          </p>
        </div>

        {/* Plural */}
        {word.plural && (
          <div className="mb-5">
            <p className="section-eyebrow">Plural</p>
            <p className="font-display text-cream/80 text-lg">{word.plural}</p>
          </div>
        )}

        {/* Phrase */}
        {word.phrases && (
          <div>
            <p className="section-eyebrow">Example Phrase</p>
            <div className="bg-gold/5 border border-gold/15 border-l-[3px] border-l-gold
                            rounded-r-xl rounded-bl-xl p-4 font-body italic text-cream/75
                            text-base leading-relaxed">
              {word.phrases}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Vocabulary() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlLetter = searchParams.get("letter") || "";
  const urlSearch = searchParams.get("search") || "";
  const urlDir    = searchParams.get("direction") || "de-en";

  const [activeLetter, setActiveLetter] = useState(urlLetter || "A");
  const [search,       setSearch]       = useState(urlSearch);
  const [direction,    setDirection]    = useState(urlDir);
  const [words,        setWords]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [mode,         setMode]         = useState(urlSearch ? "search" : "browse");
  const [error,        setError]        = useState("");

  const loadByLetter = useCallback(async (letter) => {
    setLoading(true); setError("");
    setMode("browse"); setSearch(""); setActiveLetter(letter);
    setSearchParams({ letter });
    try   { setWords(await vocabByLetter(letter)); }
    catch { setError("Failed to load words. Is the backend running?"); setWords([]); }
    setLoading(false);
  }, [setSearchParams]);

  const doSearch = useCallback(async (q, dir) => {
    if (!q.trim()) return;
    setLoading(true); setError("");
    setMode("search");
    setSearchParams({ search: q, direction: dir });
    try   { setWords(await searchVocab(q, dir)); }
    catch { setError("Search failed. Is the backend running?"); setWords([]); }
    setLoading(false);
  }, [setSearchParams]);

  useEffect(() => {
    if (urlSearch) doSearch(urlSearch, urlDir);
    else           loadByLetter(urlLetter || "A");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pt-16 min-h-screen bg-navy">

      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-navy/95 backdrop-blur-md border-b border-gold-border px-6 pt-5 pb-0">
        <div className="max-w-6xl mx-auto">

          <h1 className="font-display font-bold text-cream text-3xl mb-4">Vocabulary</h1>

          {/* Search bar */}
          <form
            onSubmit={e => { e.preventDefault(); doSearch(search, direction); }}
            className="search-bar max-w-lg mb-4"
          >
            <select
              value={direction}
              onChange={e => setDirection(e.target.value)}
              className="search-select p-2"
            >
              <option value="de-en">DE → EN</option>
              <option value="en-de">EN → DE</option>
            </select>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={direction === "de-en" ? "Search German word…" : "Search English word…"}
              className="search-input p-2 border-1"
            />
            <button type="submit" className="search-btn p-4 underline decoration-white decoration-1">Search</button>
          </form>

          {/* A–Z tabs */}
          <div className="flex flex-wrap gap-0.5 overflow-x-auto pb-0">
            {ALPHABET.map(letter => {
              const isActive = activeLetter === letter && mode === "browse";
              return (
                <button
                  key={letter}
                  onClick={() => loadByLetter(letter)}
                  className={`p-2 no-underline decoration-white decoration-1 hover:underline hover:text-lg transition alpha-btn ${isActive ? "alpha-btn-active" : ""}`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Status bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6
                        text-cream/40 font-body text-sm">
          <span>
            {mode === "browse"
              ? `Words starting with "${activeLetter}"`
              : `Results for "${searchParams.get("search") || ""}"`
            }
            {!loading && words.length > 0 &&
              ` — ${words.length} word${words.length !== 1 ? "s" : ""}`
            }
          </span>
          {mode === "search" && (
            <button
              onClick={() => loadByLetter("A")}
              className="font-body text-gold text-xs border border-gold/20 rounded-md
                         px-3 py-1 hover:bg-gold-muted transition-colors cursor-pointer bg-transparent"
            >
              ← Browse A–Z
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-400/30 rounded-xl
                          px-5 py-4 text-red-300 font-body text-sm mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 text-gold/50 font-body italic text-lg">
            Loading…
          </div>
        )}

        {/* Empty */}
        {!loading && !error && words.length === 0 && (
          <div className="text-center py-20 text-cream/25 font-body italic text-lg">
            {mode === "search"
              ? "No words found. Try a different search."
              : `No words starting with "${activeLetter}" yet.`
            }
          </div>
        )}

        {/* Word grid */}
        {!loading && words.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {words.map(word => (
              <WordCard key={word.id} word={word} onClick={setSelectedWord} />
            ))}
          </div>
        )}
      </div>

      {selectedWord && (
        <WordModal word={selectedWord} onClose={() => setSelectedWord(null)} />
      )}
    </div>
  );
}