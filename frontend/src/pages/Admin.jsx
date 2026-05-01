import { useEffect, useState } from "react";
import {
  adminList,
  adminCreate,
  adminUpdate,
  adminDelete,
  adminStats,
} from "../api";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../api";
import { logout } from "../api";

const POS = ["noun", "verb", "adj", "adv", "prep", "pron", "conj", "det", "interj"];
const ARTICLES = ["", "der", "die", "das"];

const BLANK = {
  german_word: "",
  english_word: "",
  parts_of_speech: "noun",
  article: "",
  plural: "",
  phrases: "",
};

const inputCls = `w-full bg-navy border border-gold-border rounded-lg px-3 py-2.5
                  text-cream font-body text-sm outline-none
                  focus:border-gold/60 transition-colors duration-200
                  placeholder:text-cream/25`;

const selectCls = `w-full bg-navy border border-gold-border rounded-lg px-3 py-2.5
                   text-cream font-body text-sm outline-none cursor-pointer
                   focus:border-gold/60 transition-colors duration-200`;

const cardCls = `border border-gold-border rounded-2xl p-6 bg-navy-light
                 hover:border-gold/50 hover:-translate-y-1 transition-all duration-200
                 cursor-pointer text-left`;

const actionBtn = `text-xs font-body border px-3 py-1.5 rounded-md transition-colors cursor-pointer bg-transparent`;

export default function Admin() {
  const navigate = useNavigate();

  const [view, setView] = useState("dashboard");

  const [items, setItems] = useState([]);
  const [storiesCount, setStoriesCount] = useState(0);

  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [err, setErr] = useState("");
  const [pos, setPos] = useState("");
  const [vocabCount, setVocabCount] = useState(0);

  async function loadVocab() {
    const data = await adminList(pos || undefined);
    setItems(data);
  }

  async function loadCounts() {
    try {
      const stats = await adminStats();

      setItems((current) => current);
      setStoriesCount(stats.stories_count || 0);

      // Store real vocab count separately
      setVocabCount(stats.vocab_count || 0);
    } catch {
      setErr("Could not load admin dashboard.");
    }
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    loadCounts();
  }, []);

  useEffect(() => {
    if (view === "vocab") {
      loadVocab().catch(() => setErr("Could not load vocabulary."));
    }
  }, [pos, view]);

  function openAddForm() {
    setEditingId(null);
    setForm(BLANK);
    setShowForm(true);
    setErr("");
  }

  function openEditForm(vocab) {
    setEditingId(vocab.id);

    setForm({
      german_word: vocab.german_word || "",
      english_word: vocab.english_word || "",
      parts_of_speech: vocab.parts_of_speech || "noun",
      article: vocab.article || "",
      plural: vocab.plural || "",
      phrases: vocab.phrases || "",
    });

    setShowForm(true);
    setErr("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelForm() {
    setEditingId(null);
    setForm(BLANK);
    setShowForm(false);
    setErr("");
  }

  async function saveWord(e) {
    e.preventDefault();
    setErr("");

    const payload = {
      ...form,
      article: form.article || null,
      plural: form.plural || null,
      phrases: form.phrases || null,
    };

    try {
      if (editingId) {
        await adminUpdate(editingId, payload);
      } else {
        await adminCreate(payload);
      }

      setForm(BLANK);
      setEditingId(null);
      setShowForm(false);
      await loadVocab();
      await loadCounts();
    } catch (e) {
      setErr(e.message || "Save failed.");
    }
  }

  async function remove(id) {
    const ok = window.confirm("Delete this vocabulary word?");
    if (!ok) return;

    setErr("");

    try {
      await adminDelete(id);
      await loadVocab();
      await loadCounts();
    } catch {
      setErr("Delete failed.");
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-navy">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-cream text-3xl">
              Admin Dashboard
            </h1>
            <p className="text-cream/40 font-body mt-2">
              Manage vocabulary and daily reading stories.
            </p>
          </div>

          {view !== "dashboard" && (
            <button
              onClick={() => {
                setView("dashboard");
                cancelForm();
              }}
              className="ml-auto border border-gold-border text-cream/70 px-4 py-2 rounded-lg hover:border-gold/50 transition-colors"
            >
              Back to Dashboard
            </button>
          )}
        </div>

        {err && (
          <p className="text-red-400 text-sm font-body bg-red-500/10 border border-red-400/20 rounded-lg px-3 py-2 mb-6">
            {err}
          </p>
        )}

        {view === "dashboard" && (
          <div className="grid md:grid-cols-2 gap-5">
            <button
              onClick={() => setView("vocab")}
              className={cardCls}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">📚</div>

                <div className="flex-1">
                  <p className="text-gold font-body text-xs uppercase tracking-[0.18em] mb-2">
                    Vocabulary
                  </p>

                  <h2 className="font-display font-bold text-cream text-2xl mb-2">
                    Manage Words
                  </h2>

                  <p className="text-cream/45 font-body text-sm leading-6 mb-5">
                    Add, edit, delete, and organize German-English vocabulary with
                    article, plural, phrase, and part of speech.
                  </p>

                  <div className="text-cream font-display text-4xl">
                    {vocabCount}
                    <span className="text-cream/30 text-base font-body ml-2">
                      words
                    </span>
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/stories")}
              className={cardCls}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">✍️</div>

                <div className="flex-1">
                  <p className="text-gold font-body text-xs uppercase tracking-[0.18em] mb-2">
                    Stories
                  </p>

                  <h2 className="font-display font-bold text-cream text-2xl mb-2">
                    Manage Stories
                  </h2>

                  <p className="text-cream/45 font-body text-sm leading-6 mb-5">
                    Create daily reading stories, attach vocabulary, add important
                    points, and manage typing practice content.
                  </p>

                  <div className="text-cream font-display text-4xl">
                    {storiesCount}
                    <span className="text-cream/30 text-base font-body ml-2">
                      stories
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {view === "vocab" && (
          <>
            <div className="border border-gold-border rounded-2xl p-6 mb-8 bg-navy-light">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <h2 className="font-display font-bold text-cream text-2xl">
                    Vocabulary Manager
                  </h2>
                  <p className="text-cream/40 font-body mt-1">
                    Add new words or edit existing vocabulary entries.
                  </p>
                </div>

                <button onClick={openAddForm} className="btn-gold ml-auto">
                  Add New Vocab
                </button>
              </div>
            </div>

            {showForm && (
              <form
                onSubmit={saveWord}
                className="border border-gold-border rounded-2xl p-6 mb-10 bg-navy-light"
              >
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="font-display font-semibold text-cream text-lg">
                    {editingId ? "Edit Vocabulary" : "Add New Vocabulary"}
                  </h2>

                  <button
                    type="button"
                    onClick={cancelForm}
                    className="ml-auto border border-gold-border text-cream/60 px-3 py-1.5 rounded-lg text-sm hover:border-gold/50"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-3 mb-3">
                  <input
                    className={inputCls}
                    placeholder="German word *"
                    value={form.german_word}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, german_word: e.target.value }))
                    }
                    required
                  />

                  <input
                    className={inputCls}
                    placeholder="English word *"
                    value={form.english_word}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, english_word: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-3 mb-3">
                  <select
                    className={selectCls}
                    value={form.parts_of_speech}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        parts_of_speech: e.target.value,
                      }))
                    }
                  >
                    {POS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  <select
                    className={selectCls}
                    value={form.article}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, article: e.target.value }))
                    }
                  >
                    {ARTICLES.map((a) => (
                      <option key={a} value={a}>
                        {a || "no article"}
                      </option>
                    ))}
                  </select>

                  <input
                    className={inputCls}
                    placeholder="Plural"
                    value={form.plural}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, plural: e.target.value }))
                    }
                  />
                </div>

                <textarea
                  className={`${inputCls} min-h-[110px] mb-4`}
                  placeholder="Example phrase / notes"
                  value={form.phrases}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phrases: e.target.value }))
                  }
                />

                <button type="submit" className="btn-gold">
                  {editingId ? "Update Vocabulary" : "Add Vocabulary"}
                </button>
              </form>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="text-cream/40 font-body text-sm">Filter:</span>

              <select
                className="bg-navy-light border border-gold-border text-cream font-body text-sm px-3 py-2 rounded-lg outline-none focus:border-gold cursor-pointer"
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

              <span className="ml-auto text-cream/30 font-body text-sm">
                {items.length} word{items.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="border border-gold-border rounded-2xl overflow-hidden bg-navy-light">
              <div className="hidden md:grid grid-cols-[1.2fr_1.2fr_0.7fr_0.7fr_1.3fr_160px] gap-3 px-4 py-3 border-b border-gold-border text-cream/35 text-xs uppercase tracking-[0.12em] font-body">
                <div>German</div>
                <div>English</div>
                <div>POS</div>
                <div>Plural</div>
                <div>Phrase</div>
                <div className="text-right">Actions</div>
              </div>

              <div className="divide-y divide-gold-border">
                {items.map((v) => (
                  <div
                    key={v.id}
                    className="grid md:grid-cols-[1.2fr_1.2fr_0.7fr_0.7fr_1.3fr_160px] gap-3 px-4 py-4 items-center hover:bg-gold/5 transition-colors"
                  >
                    <div>
                      <div className="md:hidden text-cream/25 text-xs mb-1">
                        German
                      </div>

                      <div className="font-display font-bold text-cream">
                        {v.article && (
                          <span className="text-gold mr-1">{v.article}</span>
                        )}
                        {v.german_word}
                      </div>
                    </div>

                    <div>
                      <div className="md:hidden text-cream/25 text-xs mb-1">
                        English
                      </div>
                      <div className="text-cream/65 font-body text-sm">
                        {v.english_word}
                      </div>
                    </div>

                    <div>
                      <div className="md:hidden text-cream/25 text-xs mb-1">
                        POS
                      </div>
                      <span className="text-xs text-gold border border-gold-border rounded-full px-2 py-1">
                        {v.parts_of_speech}
                      </span>
                    </div>

                    <div>
                      <div className="md:hidden text-cream/25 text-xs mb-1">
                        Plural
                      </div>
                      <div className="text-cream/45 font-body text-sm">
                        {v.plural || "—"}
                      </div>
                    </div>

                    <div>
                      <div className="md:hidden text-cream/25 text-xs mb-1">
                        Phrase
                      </div>
                      <div className="text-cream/40 font-body text-sm line-clamp-2">
                        {v.phrases || "—"}
                      </div>
                    </div>

                    <div className="flex md:justify-end gap-2">
                      <button
                        onClick={() => openEditForm(v)}
                        className={`${actionBtn} border-gold-border text-cream/60 hover:border-gold/60 hover:text-cream`}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => remove(v.id)}
                        className={`${actionBtn} border-red-400/20 text-red-400/70 hover:border-red-400/50 hover:text-red-400`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="text-center py-12 text-cream/25 font-body italic">
                    No words found.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}