import { useEffect, useState } from "react";
import { listStories, storyDetail } from "../api";

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [err, setErr] = useState("");
  const [typed, setTyped] = useState("");
  const [seconds, setSeconds] = useState(600);
  const [running, setRunning] = useState(false);

  async function loadStories() {
    try {
      const data = await listStories();
      setStories(data);
    } catch {
      setErr("Could not load stories.");
    }
  }

  async function openStory(id) {
    setErr("");
    setTyped("");
    setSeconds(600);
    setRunning(false);

    try {
      const data = await storyDetail(id);
      setSelected(data);
    } catch {
      setErr("Could not load story.");
    }
  }

  useEffect(() => {
    loadStories();
  }, []);

  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running]);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  const original = selected?.content || "";
  const typedChars = typed.length;
  const correctChars = typed
    .split("")
    .filter((char, i) => char === original[i]).length;

  const accuracy =
    typedChars > 0 ? Math.round((correctChars / typedChars) * 100) : 0;

  return (
    <div className="pt-16 min-h-screen bg-navy">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-cream text-3xl">
              Daily Stories
            </h1>
            <p className="text-cream/40 font-body mt-2">
              Read and type German stories for 10 minutes to improve vocabulary and typing.
            </p>
          </div>

          {selected && (
            <button
              onClick={() => setSelected(null)}
              className="ml-auto border border-gold-border text-cream/70 px-4 py-2 rounded-lg hover:border-gold/50"
            >
              Back to stories
            </button>
          )}
        </div>

        {err && (
          <p className="text-red-400 text-sm font-body bg-red-500/10 border border-red-400/20 rounded-lg px-3 py-2 mb-4">
            {err}
          </p>
        )}

        {!selected && (
          <div className="grid md:grid-cols-2 gap-4">
            {stories.map((story, index) => (
              <button
                key={story.id}
                onClick={() => openStory(story.id)}
                className="text-left border border-gold-border rounded-xl p-5 bg-navy-light hover:border-gold/40 transition-colors"
              >
                <div className="text-gold font-body text-xs uppercase tracking-[0.18em] mb-2">
                  Story {story.story_number || index + 1}
                </div>

                <h2 className="font-display font-bold text-cream text-xl mb-2">
                  {story.title}
                </h2>

                <div className="flex flex-wrap gap-3 text-cream/35 font-body text-sm">
                  {story.story_date && <span>{story.story_date}</span>}
                  {story.difficulty && <span>{story.difficulty}</span>}
                </div>
              </button>
            ))}

            {stories.length === 0 && (
              <div className="text-cream/30 font-body italic">
                No stories available yet.
              </div>
            )}
          </div>
        )}

        {selected && (
          <div className="grid lg:grid-cols-2 gap-6">
            <section className="border border-gold-border rounded-2xl p-6 bg-navy-light">
              <div className="text-gold font-body text-s uppercase tracking-[0.18em] mb-2">
                Story {selected.story_number}
              </div>

              <h2 className="font-display font-bold text-cream text-2xl mb-2">
                {selected.title}
              </h2>

              <div className="text-cream/35 font-body text-sm mb-5">
                {selected.story_date}
                {selected.difficulty ? ` • ${selected.difficulty}` : ""}
              </div>

              <div className="whitespace-pre-wrap text-cream/80 text-lg font-body leading-8">
                {selected.content}
              </div>

              {selected.vocab_items?.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-display font-semibold text-cream mb-3">
                    Vocabulary in this story
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {selected.vocab_items.map((v) => (
                      <span
                        key={v.id}
                        className="border border-gold-border rounded-full px-3 py-1 text-sm text-cream/70"
                      >
                        {v.article ? `${v.article} ` : ""}
                        {v.german_word} → {v.english_word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selected.important_points?.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-display font-semibold text-cream mb-3">
                    Important points
                  </h3>

                  <ul className="list-disc pl-5 text-cream/60 font-body space-y-1">
                    {selected.important_points.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="border border-gold-border rounded-2xl p-6 bg-navy-light">
              <div className="flex items-center gap-4 mb-5">
                <div>
                  <h3 className="font-display font-semibold text-cream text-xl">
                    Typing Practice
                  </h3>
                  <p className="text-cream/35 font-body text-sm">
                    Type the story for 10 minutes.
                  </p>
                </div>

                <div className="ml-auto text-gold font-display text-2xl">
                  {minutes}:{secs}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="border border-gold-border rounded-lg p-3">
                  <div className="text-cream/30 text-xs font-body">Accuracy</div>
                  <div className="text-cream font-display text-xl">{accuracy}%</div>
                </div>

                <div className="border border-gold-border rounded-lg p-3">
                  <div className="text-cream/30 text-xs font-body">Typed</div>
                  <div className="text-cream font-display text-xl">{typedChars}</div>
                </div>

                <div className="border border-gold-border rounded-lg p-3">
                  <div className="text-cream/30 text-xs font-body">Correct</div>
                  <div className="text-cream font-display text-xl">{correctChars}</div>
                </div>
              </div>

              <textarea
                value={typed}
                onChange={(e) => {
                  setTyped(e.target.value);
                  if (!running && seconds > 0) setRunning(true);
                }}
                placeholder="Start typing the story here..."
                className="w-full min-h-[360px] bg-navy border border-gold-border rounded-lg px-4 py-3 text-cream font-body outline-none focus:border-gold/60 placeholder:text-cream/25"
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setRunning((v) => !v)}
                  className="btn-gold"
                >
                  {running ? "Pause" : "Start"}
                </button>

                <button
                  onClick={() => {
                    setTyped("");
                    setSeconds(600);
                    setRunning(false);
                  }}
                  className="border border-gold-border text-cream/70 px-4 py-2 rounded-lg hover:border-gold/50"
                >
                  Reset
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}