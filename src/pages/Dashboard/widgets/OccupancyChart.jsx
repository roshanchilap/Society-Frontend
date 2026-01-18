import { useState } from "react";

const THEMES = ["auto", "calm", "balanced", "busy"];

const QUOTES = {
  calm: [
    "Stability builds stronger communities.",
    "A peaceful home is real wealth.",
  ],
  balanced: [
    "Balance is not something you find, it’s something you create.",
    "Harmony is the right mix of change and comfort.",
  ],
  busy: ["Energy brings growth.", "Movement means life."],
};

export default function OccupancyChart({ owners, tenants }) {
  const total = owners + tenants;
  const ownerRatio = total === 0 ? 0 : owners / total;

  const [themeIndex, setThemeIndex] = useState(0);
  const theme = THEMES[themeIndex];

  const nextTheme = () => setThemeIndex((prev) => (prev + 1) % THEMES.length);

  const randomQuote = (arr) => arr[Math.floor(Math.random() * arr.length)];

  let mood = "";
  let color = "";
  let label = "";
  let currentMood = "";
  let quote = "";

  if (theme === "auto") {
    label = "Auto";
    if (ownerRatio > 0.7) {
      currentMood = "calm";
    } else if (ownerRatio < 0.3) {
      currentMood = "busy";
    } else {
      currentMood = "balanced";
    }
  } else {
    label = theme.charAt(0).toUpperCase() + theme.slice(1);
    currentMood = theme;
  }

  if (currentMood === "calm") {
    mood = "🌿 Calm & Stable";
    color = "bg-green-100 text-green-700";
    quote = randomQuote(QUOTES.calm);
  }

  if (currentMood === "balanced") {
    mood = "🏢 Balanced";
    color = "bg-yellow-100 text-yellow-800";
    quote = randomQuote(QUOTES.balanced);
  }

  if (currentMood === "busy") {
    mood = "🚧 Busy & Dynamic";
    color = "bg-purple-100 text-purple-700";
    quote = randomQuote(QUOTES.busy);
  }

  const [activeQuote, setActiveQuote] = useState(quote);

  // refresh quote when mood changes
  if (activeQuote !== quote) {
    setActiveQuote(quote);
  }

  return (
    <div
      className={`rounded-xl shadow p-6 transition-all duration-500 ${color}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Building Mood</h3>

        <button
          onClick={nextTheme}
          className="px-3 py-1 text-xs font-semibold rounded-full
                     bg-white/70 border border-white
                     hover:bg-white transition active:scale-95"
        >
          🔁 {label}
        </button>
      </div>

      {/* Mood */}
      <p className="text-2xl font-bold flex items-center gap-2">
        <span className="animate-pulse">{mood.split(" ")[0]}</span>
        {mood.replace(/^[^\s]+ /, "")}
      </p>

      {/* Since */}
      <p className="mt-1 text-xs opacity-60">for the last 12 days</p>

      {/* Divider */}
      <div className="my-3 h-px bg-white/50" />

      {/* Quote (click to refresh) */}
      <p
        onClick={() => setActiveQuote(randomQuote(QUOTES[currentMood]))}
        className="text-sm italic opacity-80 cursor-pointer hover:opacity-100 transition"
        title="Click to refresh quote"
      >
        “{activeQuote}”
      </p>

      {/* Context */}
      <p className="mt-1 text-xs opacity-60">Based on current occupancy mix</p>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 text-center text-xs">
        <div>
          <p className="font-bold">{owners}</p>
          <p className="opacity-70">Owners</p>
        </div>
        <div>
          <p className="font-bold">{tenants}</p>
          <p className="opacity-70">Tenants</p>
        </div>
        <div>
          <p className="font-bold">{owners + tenants}</p>
          <p className="opacity-70">Total</p>
        </div>
      </div>

      {/* Auto hint */}
      {theme === "auto" && (
        <p className="mt-3 text-[11px] opacity-50">Auto-adjusted</p>
      )}
    </div>
  );
}
