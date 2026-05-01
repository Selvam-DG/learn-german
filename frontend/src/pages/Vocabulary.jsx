import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { searchVocab, vocabByLetter, vocabDetail } from "../api";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-body font-semibold"
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

function WordCard({ word, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(word)}
      className="group text-left rounded-2xl border border-gold-border bg-navy-light p-5
                 hover:border-gold/60 hover:bg-gold/5 hover:-translate-y-0.5
                 transition-all duration-200 shadow-[0_0_24px_rgba(0,0,0,0.12)]"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            {word.article && (
              <span className="text-gold font-body font-semibold text-sm">
                {word.article}
              </span>
            )}

            <h3 className="font-display font-bold text-cream text-xl leading-tight group-hover:text-gold transition-colors">
              {word.german_word}
            </h3>
          </div>

          <p className="font-body text-cream/55 text-base mt-1 leading-snug">
            {word.english_word}
          </p>
        </div>

        <PosBadge pos={word.parts_of_speech} />
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {word.plural && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-cream/45 font-body">
            Pl. {word.plural}
          </span>
        )}

        {word.phrases && (
          <span className="rounded-full border border-gold-border bg-gold/5 px-2.5 py-1 text-xs text-gold/80 font-body">
            has phrase
          </span>
        )}
      </div>
    </button>
  );
}

function DetailRow({ label, children }) {
  if (!children) return null;

  return (
    <div className="rounded-2xl border border-gold-border bg-navy p-4">
      <p className="font-body text-xs uppercase tracking-[0.16em] text-gold/70 mb-2">
        {label}
      </p>
      <div className="font-body text-cream/80 text-base leading-7">
        {children}
      </div>
    </div>
  );
}

function WordDrawer({ word, loading, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!word) return null;

  const stories = word.stories || [];
  const synonyms = word.synonyms || [];
  const notes = word.notes || "";

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside
        className="fixed right-0 top-0 z-[80] h-screen w-full max-w-xl overflow-y-auto
                   border-l border-gold-border bg-navy-light shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gold-border bg-navy-light/95 px-6 py-4 backdrop-blur-md">
          <div>
            <p className="font-body text-xs uppercase tracking-[0.18em] text-gold/70">
              Vocabulary Details
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gold-border bg-gold/5 px-3 py-2 text-cream/70 hover:border-gold/60 hover:text-cream transition-colors"
          >
            Close
          </button>
        </div>

        <div className="px-6 py-7">
          {loading && (
            <div className="mb-5 rounded-2xl border border-gold-border bg-navy p-4 text-cream/40 font-body">
              Loading full details...
            </div>
          )}

          {word.article && (
            <span className="inline-flex rounded-full border border-gold-border bg-gold/10 px-4 py-1 text-gold font-body font-semibold mb-4">
              {word.article}
            </span>
          )}

          <h2 className="font-display font-black text-cream text-5xl leading-tight mb-3">
            {word.german_word}
          </h2>

          <div className="mb-6">
            <PosBadge pos={word.parts_of_speech} />
          </div>

          <div className="grid gap-4">
            <DetailRow label="Translation">
              <span className="text-2xl italic text-cream">
                {word.english_word}
              </span>
            </DetailRow>

            {word.plural && (
              <DetailRow label="Plural">
                <span className="font-display text-xl text-cream">
                  {word.plural}
                </span>
              </DetailRow>
            )}

            {word.phrases && (
              <DetailRow label="Example Phrase">
                <div className="border-l-4 border-gold bg-gold/5 rounded-r-xl px-4 py-3 italic">
                  {word.phrases}
                </div>
              </DetailRow>
            )}

            <DetailRow label="Synonyms">
              {synonyms.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {synonyms.map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className="rounded-full border border-gold-border bg-gold/5 px-3 py-1 text-cream/75"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-cream/35">No synonyms added yet.</span>
              )}
            </DetailRow>

            <DetailRow label="Notes">
              {notes ? (
                <div className="whitespace-pre-wrap">{notes}</div>
              ) : (
                <span className="text-cream/35">No notes added yet.</span>
              )}
            </DetailRow>

            <DetailRow label="Stories Linked To This Word">
              {stories.length > 0 ? (
                <div className="grid gap-2">
                  {stories.map((story) => (
                    <div
                      key={story.id}
                      className="rounded-xl border border-gold-border bg-gold/5 px-4 py-3"
                    >
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-gold text-xs font-body uppercase tracking-[0.14em]">
                          Story {story.story_number}
                        </span>
                        <span className="font-display font-semibold text-cream">
                          {story.title}
                        </span>
                      </div>

                      {story.story_date && (
                        <p className="text-cream/35 text-sm mt-1">
                          {story.story_date}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-cream/35">
                  This word is not linked to any story yet.
                </span>
              )}
            </DetailRow>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function Vocabulary() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlLetter = searchParams.get("letter") || "";
  const urlSearch = searchParams.get("search") || "";
  const urlDir = searchParams.get("direction") || "de-en";

  const [activeLetter, setActiveLetter] = useState(urlLetter || "A");
  const [search, setSearch] = useState(urlSearch);
  const [direction, setDirection] = useState(urlDir);

  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const [selectedWord, setSelectedWord] = useState(null);
  const [mode, setMode] = useState(urlSearch ? "search" : "browse");
  const [error, setError] = useState("");

  const loadByLetter = useCallback(
    async (letter) => {
      setLoading(true);
      setError("");
      setMode("browse");
      setSearch("");
      setActiveLetter(letter);
      setSelectedWord(null);
      setSearchParams({ letter });

      try {
        const data = await vocabByLetter(letter);
        setWords(data);
      } catch {
        setError("Failed to load words. Is the backend running?");
        setWords([]);
      } finally {
        setLoading(false);
      }
    },
    [setSearchParams]
  );

  const doSearch = useCallback(
    async (q, dir) => {
      const clean = q.trim();
      if (!clean) return;

      setLoading(true);
      setError("");
      setMode("search");
      setSelectedWord(null);
      setSearchParams({ search: clean, direction: dir });

      try {
        const data = await searchVocab(clean, dir);
        setWords(data);
      } catch {
        setError("Search failed. Is the backend running?");
        setWords([]);
      } finally {
        setLoading(false);
      }
    },
    [setSearchParams]
  );

  async function openWord(word) {
    setSelectedWord(word);

    try {
      setDrawerLoading(true);
      const full = await vocabDetail(word.id);
      setSelectedWord({ ...word, ...full });
    } catch {
      setSelectedWord(word);
    } finally {
      setDrawerLoading(false);
    }
  }

  useEffect(() => {
    if (urlSearch) {
      doSearch(urlSearch, urlDir);
    } else {
      loadByLetter(urlLetter || "A");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title =
    mode === "browse"
      ? `Words starting with "${activeLetter}"`
      : `Search results for "${searchParams.get("search") || ""}"`;

  return (
    <div className="pt-16 min-h-screen bg-navy">
      <section className="border-b border-gold-border bg-navy-light/60">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-wrap gap-6 items-end justify-between mb-8">
            <div>
              <p className="font-body text-xs uppercase tracking-[0.2em] text-gold/70 mb-2">
                German–English Dictionary
              </p>
              <h1 className="font-display font-black text-cream text-4xl md:text-5xl">
                Vocabulary
              </h1>
              <p className="font-body text-cream/45 text-base mt-3 max-w-2xl leading-7">
                Search, browse, and open each word for translation, grammar,
                phrases, notes, and story connections.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                doSearch(search, direction);
              }}
              className="w-full lg:w-[560px] rounded-2xl border border-gold-border bg-navy p-2 shadow-[0_0_28px_rgba(0,0,0,0.18)]"
            >
              <div className="flex gap-2">
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  className="rounded-xl border border-gold-border bg-gold/10 px-3 py-3 text-gold font-body text-sm outline-none"
                >
                  <option value="de-en">DE → EN</option>
                  <option value="en-de">EN → DE</option>
                </select>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    direction === "de-en"
                      ? "Search German word..."
                      : "Search English word..."
                  }
                  className="min-w-0 flex-1 rounded-xl border border-gold-border bg-navy px-4 py-3 text-cream font-body text-base outline-none placeholder:text-cream/25 focus:border-gold"
                />

                <button
                  type="submit"
                  className="rounded-xl bg-gold px-5 py-3 font-body font-bold text-navy hover:brightness-110 transition-all"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-gold-border bg-navy p-3">
            <div className="flex flex-wrap gap-2">
              {ALPHABET.map((letter) => {
                const isActive = activeLetter === letter && mode === "browse";

                return (
                  <button
                    type="button"
                    key={letter}
                    onClick={() => loadByLetter(letter)}
                    className={`h-10 w-10 rounded-xl border font-display font-bold transition-all ${
                      isActive
                        ? "border-gold bg-gold text-navy"
                        : "border-gold-border bg-gold/5 text-cream/60 hover:border-gold/60 hover:text-cream"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-display font-bold text-cream text-2xl">
              {title}
            </h2>
            <p className="font-body text-cream/35 text-sm mt-1">
              {!loading && words.length > 0
                ? `${words.length} word${words.length !== 1 ? "s" : ""} found`
                : "Click a word card to open details."}
            </p>
          </div>

          {mode === "search" && (
            <button
              type="button"
              onClick={() => loadByLetter("A")}
              className="rounded-xl border border-gold-border bg-gold/5 px-4 py-2.5 text-gold font-body text-sm hover:border-gold/60"
            >
              ← Browse A–Z
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-red-300 font-body text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-gold-border bg-navy-light px-6 py-20 text-center text-gold/60 font-body italic text-lg">
            Loading vocabulary...
          </div>
        )}

        {!loading && !error && words.length === 0 && (
          <div className="rounded-2xl border border-gold-border bg-navy-light px-6 py-20 text-center text-cream/30 font-body italic text-lg">
            {mode === "search"
              ? "No words found. Try a different search."
              : `No words starting with "${activeLetter}" yet.`}
          </div>
        )}

        {!loading && words.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {words.map((word) => (
              <WordCard key={word.id} word={word} onClick={openWord} />
            ))}
          </div>
        )}
      </main>

      <WordDrawer
        word={selectedWord}
        loading={drawerLoading}
        onClose={() => setSelectedWord(null)}
      />
    </div>
  );
}