import { useEffect, useState } from "react";
import {
  adminCreate,
  adminListStories,
  adminCreateStory,
  adminUpdateStory,
  adminDeleteStory,
  adminSearchVocab,
  isLoggedIn,
} from "../api";
import { useNavigate } from "react-router-dom";

const POS = ["noun", "verb", "adj", "adv", "prep", "pron", "conj", "det", "interj"];
const ARTICLES = ["", "der", "die", "das"];

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

const makeBlankStory = () => ({
  story_number: "",
  title: "",
  story_date: todayDate(),
  content: "",
  important_points_text: "",
  difficulty: "easy",
  vocab_ids: [],
});

const VOCAB_BLANK = {
  german_word: "",
  english_word: "",
  parts_of_speech: "noun",
  article: "",
  plural: "",
  phrases: "",
};

const inputCls = `w-full bg-navy border border-gold-border rounded-xl px-4 py-3
                  text-cream font-body text-base outline-none
                  focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all
                  placeholder:text-cream/25`;

const selectCls = `w-full bg-navy border border-gold-border rounded-xl px-4 py-3
                   text-cream font-body text-base outline-none cursor-pointer
                   focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all`;

const primaryBtn = `inline-flex items-center justify-center rounded-xl px-5 py-3
                    bg-gold text-navy font-body font-bold text-sm tracking-wide
                    hover:brightness-110 hover:shadow-[0_0_24px_rgba(212,175,55,0.25)]
                    transition-all cursor-pointer`;

const secondaryBtn = `inline-flex items-center justify-center rounded-xl px-4 py-2.5
                      border border-gold-border text-cream/75 bg-gold/5 font-body text-sm
                      hover:border-gold/60 hover:text-cream hover:bg-gold/10
                      transition-all cursor-pointer`;

const dangerBtn = `inline-flex items-center justify-center rounded-xl px-4 py-2.5
                   border border-red-400/25 text-red-300/80 bg-red-500/5 font-body text-sm
                   hover:border-red-400/60 hover:text-red-300 hover:bg-red-500/10
                   transition-all cursor-pointer`;

const actionBtn = `text-xs font-body border px-3 py-1.5 rounded-lg transition-all cursor-pointer bg-transparent`;

export default function AdminStories() {
  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [vocab, setVocab] = useState([]);

  const [form, setForm] = useState(makeBlankStory());
  const [editingId, setEditingId] = useState(null);

  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [vocabSearch, setVocabSearch] = useState("");
  const [vocabResults, setVocabResults] = useState([]);
  const [searchingVocab, setSearchingVocab] = useState(false);

  const [showNewVocabForm, setShowNewVocabForm] = useState(false);
  const [newVocab, setNewVocab] = useState(VOCAB_BLANK);

  async function load() {
    setLoading(true);
    setErr("");

    try {
      const storyData = await adminListStories();
      setStories(storyData);

      const attachedVocab = [];

      storyData.forEach((story) => {
        (story.vocab_items || []).forEach((v) => {
          if (!attachedVocab.some((x) => x.id === v.id)) {
            attachedVocab.push(v);
          }
        });
      });

      setVocab(attachedVocab);
    } catch (e) {
      setErr(e.message || "Could not load admin story data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    load();
  }, []);

  useEffect(() => {
    const term = vocabSearch.trim();

    if (term.length < 2) {
      setVocabResults([]);
      return;
    }

    let active = true;

    async function runSearch() {
      setSearchingVocab(true);

      try {
        const results = await adminSearchVocab(term, 25);

        if (!active) return;

        setVocabResults(results);

        setVocab((current) => {
          const merged = [...current];

          results.forEach((item) => {
            if (!merged.some((x) => x.id === item.id)) {
              merged.push(item);
            }
          });

          return merged;
        });
      } catch {
        if (active) {
          setErr("Vocabulary search failed.");
        }
      } finally {
        if (active) {
          setSearchingVocab(false);
        }
      }
    }

    const timer = setTimeout(runSearch, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [vocabSearch]);

  function clearMessages() {
    setErr("");
    setSuccess("");
  }

  function toggleVocab(id) {
    setForm((f) => {
      const exists = f.vocab_ids.includes(id);

      return {
        ...f,
        vocab_ids: exists
          ? f.vocab_ids.filter((x) => x !== id)
          : [...f.vocab_ids, id],
      };
    });
  }

  function removeSelectedVocab(id) {
    setForm((f) => ({
      ...f,
      vocab_ids: f.vocab_ids.filter((x) => x !== id),
    }));
  }

  const selectedVocab = vocab.filter((v) => form.vocab_ids.includes(v.id));
  const vocabSearchTerm = vocabSearch.trim().toLowerCase();
  const matchingVocab = vocabResults.filter((v) => !form.vocab_ids.includes(v.id));

  function buildPayload() {
    return {
      story_number: Number(form.story_number),
      title: form.title.trim(),
      story_date: form.story_date || todayDate(),
      content: form.content,
      difficulty: form.difficulty || "easy",
      important_points: form.important_points_text
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
      vocab_ids: form.vocab_ids,
    };
  }

  async function saveStory(e) {
    e.preventDefault();
    clearMessages();

    if (!form.story_number) {
      setErr("Story number is required.");
      return;
    }

    if (!form.title.trim()) {
      setErr("Story title is required.");
      return;
    }

    if (!form.content.trim()) {
      setErr("Story content is required.");
      return;
    }

    try {
      const payload = buildPayload();

      if (editingId) {
        await adminUpdateStory(editingId, payload);
        setSuccess("Story updated successfully.");
      } else {
        await adminCreateStory(payload);
        setSuccess("Story created successfully.");
      }

      setForm(makeBlankStory());
      setEditingId(null);
      setVocabSearch("");
      setVocabResults([]);
      setShowNewVocabForm(false);
      await load();
    } catch (e) {
      setErr(e.message || "Save failed.");
    }
  }

  function startEdit(story) {
    clearMessages();
    setEditingId(story.id);

    const storyVocabItems = story.vocab_items || [];

    setVocab((current) => {
        const merged = [...current];

        storyVocabItems.forEach((item) => {
        if (!merged.some((x) => x.id === item.id)) {
            merged.push(item);
        }
        });

        return merged;
    });

    setForm({
        story_number: story.story_number || "",
        title: story.title || "",
        story_date: story.story_date || todayDate(),
        content: story.content || "",
        difficulty: story.difficulty || "easy",
        important_points_text: Array.isArray(story.important_points)
        ? story.important_points.join("\n")
        : "",
        vocab_ids: storyVocabItems.map((v) => v.id),
    });

    setVocabSearch("");
    setVocabResults([]);
    setShowNewVocabForm(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
    }

  async function removeStory(id) {
    const ok = window.confirm("Delete this story?");
    if (!ok) return;

    clearMessages();

    try {
      await adminDeleteStory(id);
      setSuccess("Story deleted successfully.");
      await load();

      if (editingId === id) {
        cancelEdit();
      }
    } catch {
      setErr("Delete failed.");
    }
  }

  function cancelEdit() {
    clearMessages();
    setEditingId(null);
    setForm(makeBlankStory());
    setVocabSearch("");
    setVocabResults([]);
    setShowNewVocabForm(false);
    setNewVocab(VOCAB_BLANK);
  }

  async function createAndAttachVocab() {
    clearMessages();

    if (!newVocab.german_word.trim()) {
      setErr("German word is required.");
      return;
    }

    if (!newVocab.english_word.trim()) {
      setErr("English word is required.");
      return;
    }

    try {
      const created = await adminCreate({
        ...newVocab,
        german_word: newVocab.german_word.trim(),
        english_word: newVocab.english_word.trim(),
        parts_of_speech: newVocab.parts_of_speech || "noun",
        article: newVocab.article || null,
        plural: newVocab.plural || null,
        phrases: newVocab.phrases || null,
      });

      setVocab((current) => {
        if (current.some((v) => v.id === created.id)) return current;
        return [created, ...current];
      });

      setForm((f) => ({
        ...f,
        vocab_ids: f.vocab_ids.includes(created.id)
          ? f.vocab_ids
          : [...f.vocab_ids, created.id],
      }));

      setNewVocab(VOCAB_BLANK);
      setShowNewVocabForm(false);
      setVocabSearch("");
      setVocabResults([]);
      setSuccess("Vocabulary created and attached to story.");
    } catch (e) {
      setErr(e.message || "Could not create vocabulary.");
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-navy">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-cream text-4xl">
              Admin Stories
            </h1>
            <p className="text-cream/45 font-body mt-2 text-base">
              Add daily stories, attach vocabulary, and manage typing practice content.
            </p>
          </div>

          <div className="ml-auto flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className={secondaryBtn}
            >
              ← Back to Dashboard
            </button>

            {editingId && (
              <button type="button" onClick={cancelEdit} className={dangerBtn}>
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        {err && (
          <p className="text-red-300 text-sm font-body bg-red-500/10 border border-red-400/25 rounded-xl px-4 py-3 mb-6">
            {err}
          </p>
        )}

        {success && (
          <p className="text-green-300 text-sm font-body bg-green-500/10 border border-green-400/25 rounded-xl px-4 py-3 mb-6">
            {success}
          </p>
        )}

        <form
          onSubmit={saveStory}
          className="border border-gold-border rounded-3xl p-6 md:p-8 mb-10 bg-navy-light shadow-[0_0_40px_rgba(0,0,0,0.18)]"
        >
          <div className="flex flex-wrap items-start gap-3 mb-6">
            <div>
              <h2 className="font-display font-bold text-cream text-2xl">
                {editingId ? "Edit Story" : "Add New Story"}
              </h2>
              <p className="text-cream/40 font-body text-base mt-1">
                Use a larger story box for comfortable writing and typing practice.
              </p>
            </div>

            <button type="submit" className={`${primaryBtn} ml-auto`}>
              {editingId ? "Update Story" : "Add Story"}
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-cream/40 font-body text-sm mb-2">
                Story number
              </label>
              <input
                className={inputCls}
                type="number"
                placeholder="1"
                value={form.story_number}
                onChange={(e) =>
                  setForm((f) => ({ ...f, story_number: e.target.value }))
                }
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-cream/40 font-body text-sm mb-2">
                Title
              </label>
              <input
                className={inputCls}
                placeholder="Story title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <label className="block text-cream/40 font-body text-sm mb-2">
                Date
              </label>
              <input
                className={`${inputCls} date-input`}
                
                type="date"
                value={form.story_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, story_date: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-5">
            <div>
              <label className="block text-cream/40 font-body text-sm mb-2">
                Difficulty
              </label>
              <select
                className={selectCls}
                value={form.difficulty || "easy"}
                onChange={(e) =>
                  setForm((f) => ({ ...f, difficulty: e.target.value || "easy" }))
                }
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="md:col-span-3 flex items-end">
              <div className="w-full rounded-xl border border-gold-border bg-gold/5 px-4 py-3 text-cream/45 font-body text-sm">
                Selected vocabulary:{" "}
                <span className="text-gold font-semibold">{selectedVocab.length}</span>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-cream/40 font-body text-sm mb-2">
              Story content
            </label>
            <textarea
              className={`${inputCls} min-h-[420px] text-lg leading-8 resize-y`}
              placeholder="Write the story content here..."
              value={form.content}
              onChange={(e) =>
                setForm((f) => ({ ...f, content: e.target.value }))
              }
              required
            />
          </div>

          <div className="mb-7">
            <label className="block text-cream/40 font-body text-sm mb-2">
              Important points
            </label>
            <textarea
              className={`${inputCls} min-h-[140px] text-base leading-7 resize-y`}
              placeholder="One important point per line"
              value={form.important_points_text}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  important_points_text: e.target.value,
                }))
              }
            />
          </div>

          <div className="rounded-3xl border border-gold-border bg-navy p-5 md:p-6 mb-7">
            <div className="flex flex-wrap items-center gap-3 mb-5">
                <div>
                <h3 className="font-display font-bold text-cream text-xl">
                    Vocabulary in this story
                </h3>
                <p className="text-cream/40 font-body text-sm mt-1">
                    Attach existing words or create a new word for this story.
                </p>
                </div>

                <button
                type="button"
                onClick={() => setShowNewVocabForm((v) => !v)}
                className={`${secondaryBtn} ml-auto`}
                >
                {showNewVocabForm ? "Close New Word" : "+ Add New Word"}
                </button>
            </div>

            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5">
                {/* Left: Selected vocab */}
                <div className="border border-gold-border rounded-2xl bg-navy-light p-4">
                <div className="flex items-center mb-3">
                    <h4 className="font-display font-semibold text-cream">
                    Selected Words
                    </h4>

                    <span className="ml-auto text-gold text-sm font-body">
                    {selectedVocab.length}
                    </span>
                </div>

                {selectedVocab.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                    {selectedVocab.map((v) => (
                        <span
                        key={v.id}
                        className="inline-flex items-center gap-2 border border-gold-border bg-gold/5 rounded-full px-3 py-1.5 text-sm text-cream/80"
                        >
                        <span>
                            {v.article ? `${v.article} ` : ""}
                            <span className="text-cream">{v.german_word}</span>
                            <span className="text-cream/40"> → {v.english_word}</span>
                        </span>

                        <button
                            type="button"
                            onClick={() => removeSelectedVocab(v.id)}
                            className="text-red-300/80 hover:text-red-300 text-base leading-none"
                            title="Remove from story"
                        >
                            ×
                        </button>
                        </span>
                    ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-gold-border/60 bg-navy p-4 text-cream/35 font-body text-sm">
                    No vocabulary selected yet. Search on the right and click a word to attach it.
                    </div>
                )}
                </div>

                {/* Right: Search */}
                <div className="border border-gold-border rounded-2xl bg-navy-light p-4">
                <label className="block text-cream/45 font-body text-sm mb-2">
                    Search vocabulary
                </label>

                <input
                    className={`${inputCls} mb-3 bg-navy`}
                    placeholder="Type German or English word..."
                    value={vocabSearch}
                    onChange={(e) => setVocabSearch(e.target.value)}
                />

                <div className="border border-gold-border rounded-2xl bg-navy overflow-hidden min-h-[170px]">
                    {vocabSearchTerm.length < 2 && (
                    <div className="px-4 py-5 text-cream/35 font-body text-sm">
                        Type at least 2 characters to search.
                    </div>
                    )}

                    {searchingVocab && (
                    <div className="px-4 py-5 text-cream/35 font-body text-sm">
                        Searching vocabulary...
                    </div>
                    )}

                    {!searchingVocab &&
                    vocabSearchTerm.length >= 2 &&
                    matchingVocab.length === 0 && (
                        <div className="px-4 py-5 text-cream/35 font-body text-sm">
                        No matching word found. Use “Add New Word”.
                        </div>
                    )}

                    {matchingVocab.map((v) => (
                    <button
                        type="button"
                        key={v.id}
                        onClick={() => toggleVocab(v.id)}
                        className="w-full text-left px-4 py-4 border-b border-gold-border last:border-b-0 hover:bg-gold/10 transition-colors"
                    >
                        <div className="flex flex-wrap gap-2 items-center">
                        <span className="font-display font-bold text-cream text-lg">
                            {v.article ? `${v.article} ` : ""}
                            {v.german_word}
                        </span>

                        <span className="text-cream/50 font-body text-base">
                            → {v.english_word}
                        </span>

                        <span className="text-gold/80 text-xs border border-gold-border rounded-full px-2 py-0.5">
                            {v.parts_of_speech}
                        </span>
                        </div>

                        {v.phrases && (
                        <div className="text-cream/40 font-body text-sm mt-1">
                            {v.phrases}
                        </div>
                        )}
                    </button>
                    ))}
                </div>
                </div>
            </div>

            {showNewVocabForm && (
                <div
                className="border border-gold-border rounded-2xl p-5 bg-navy-light mt-5"
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    e.preventDefault();
                    }
                }}
                >
                <h4 className="font-display font-bold text-cream text-lg mb-4">
                    Add new vocab and attach to story
                </h4>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <input
                    className={inputCls}
                    placeholder="German word *"
                    value={newVocab.german_word}
                    onChange={(e) =>
                        setNewVocab((f) => ({
                        ...f,
                        german_word: e.target.value,
                        }))
                    }
                    />

                    <input
                    className={inputCls}
                    placeholder="English word *"
                    value={newVocab.english_word}
                    onChange={(e) =>
                        setNewVocab((f) => ({
                        ...f,
                        english_word: e.target.value,
                        }))
                    }
                    />
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <select
                    className={selectCls}
                    value={newVocab.parts_of_speech}
                    onChange={(e) =>
                        setNewVocab((f) => ({
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
                    value={newVocab.article}
                    onChange={(e) =>
                        setNewVocab((f) => ({
                        ...f,
                        article: e.target.value,
                        }))
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
                    value={newVocab.plural}
                    onChange={(e) =>
                        setNewVocab((f) => ({
                        ...f,
                        plural: e.target.value,
                        }))
                    }
                    />
                </div>

                <textarea
                    className={`${inputCls} min-h-[100px] mb-4`}
                    placeholder="Example phrase"
                    value={newVocab.phrases}
                    onChange={(e) =>
                    setNewVocab((f) => ({
                        ...f,
                        phrases: e.target.value,
                    }))
                    }
                />

                <button type="button" onClick={createAndAttachVocab} className={primaryBtn}>
                    Save Word & Attach
                </button>
                </div>
            )}
            </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className={primaryBtn}>
              {editingId ? "Update Story" : "Add Story"}
            </button>

            {editingId && (
              <button type="button" onClick={cancelEdit} className={secondaryBtn}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="flex items-center mb-5">
          <div>
            <h2 className="font-display font-bold text-cream text-2xl">
              Existing Stories
            </h2>
            <p className="text-cream/40 font-body text-sm mt-1">
              Edit or remove previously created stories.
            </p>
          </div>

          <span className="ml-auto text-cream/35 font-body text-sm">
            {stories.length} stor{stories.length === 1 ? "y" : "ies"}
          </span>
        </div>

        {loading && (
          <div className="text-cream/35 font-body py-8">
            Loading stories...
          </div>
        )}

        {!loading && (
          <div className="grid gap-4">
            {stories.map((story) => (
              <div
                key={story.id}
                className="border border-gold-border rounded-2xl p-5 bg-navy-light hover:border-gold/40 transition-colors"
              >
                <div className="flex flex-wrap gap-3 items-center mb-3">
                  <span className="text-gold font-body text-xs uppercase tracking-[0.18em]">
                    Story {story.story_number}
                  </span>

                  <span className="font-display font-bold text-cream text-xl">
                    {story.title}
                  </span>

                  <span className="text-cream/40 font-body text-sm">
                    {story.story_date}
                  </span>

                  <span className="text-gold/75 text-xs border border-gold-border rounded-full px-2 py-0.5">
                    {story.difficulty || "easy"}
                  </span>

                  <button
                    type="button"
                    onClick={() => startEdit(story)}
                    className={`${actionBtn} ml-auto border-gold-border text-cream/70 bg-gold/5 hover:border-gold/70 hover:text-cream hover:bg-gold/10`}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => removeStory(story.id)}
                    className={`${actionBtn} border-red-400/25 text-red-300/80 bg-red-500/5 hover:border-red-400/60 hover:text-red-300 hover:bg-red-500/10`}
                  >
                    Delete
                  </button>
                </div>

                <p className="text-cream/50 font-body text-base line-clamp-3 mb-4 leading-7">
                  {story.content}
                </p>

                {story.vocab_items?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {story.vocab_items.map((v) => (
                      <span
                        key={v.id}
                        className="text-xs text-cream/60 border border-gold-border bg-gold/5 rounded-full px-2.5 py-1"
                      >
                        {v.article ? `${v.article} ` : ""}
                        {v.german_word}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-cream/25 text-sm font-body">
                    No vocabulary attached.
                  </div>
                )}
              </div>
            ))}

            {stories.length === 0 && (
              <div className="text-center py-12 text-cream/25 font-body italic">
                No stories found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}