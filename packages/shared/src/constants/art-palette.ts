/** Vibrant art-studio palette for category accents and UI flourishes */
export const artPalette = {
  canvas: { bg: "from-blue-500 to-indigo-600", pill: "bg-blue-500", text: "text-blue-600" },
  photo: { bg: "from-slate-500 to-zinc-600", pill: "bg-slate-500", text: "text-slate-600" },
  framed: { bg: "from-amber-500 to-orange-600", pill: "bg-amber-500", text: "text-amber-600" },
  mugs: { bg: "from-orange-400 to-rose-500", pill: "bg-orange-500", text: "text-orange-600" },
  calendars: { bg: "from-emerald-500 to-teal-600", pill: "bg-emerald-500", text: "text-emerald-600" },
  phone: { bg: "from-violet-500 to-purple-600", pill: "bg-violet-500", text: "text-violet-600" },
  books: { bg: "from-rose-500 to-pink-600", pill: "bg-rose-500", text: "text-rose-600" },
} as const;

export const categoryArtColors: Record<
  string,
  { gradient: string; pill: string; ring: string }
> = {
  "canvas-prints": {
    gradient: "from-blue-500/40 via-indigo-400/30 to-violet-300/20",
    pill: "bg-blue-500 hover:bg-blue-600",
    ring: "ring-blue-400/40",
  },
  "photo-prints": {
    gradient: "from-cyan-500/40 via-sky-400/30 to-blue-300/20",
    pill: "bg-cyan-500 hover:bg-cyan-600",
    ring: "ring-cyan-400/40",
  },
  "framed-prints": {
    gradient: "from-amber-500/40 via-orange-400/30 to-yellow-300/20",
    pill: "bg-amber-500 hover:bg-amber-600",
    ring: "ring-amber-400/40",
  },
  mugs: {
    gradient: "from-orange-500/40 via-red-400/30 to-rose-300/20",
    pill: "bg-orange-500 hover:bg-orange-600",
    ring: "ring-orange-400/40",
  },
  calendars: {
    gradient: "from-emerald-500/40 via-green-400/30 to-teal-300/20",
    pill: "bg-emerald-500 hover:bg-emerald-600",
    ring: "ring-emerald-400/40",
  },
  "phone-cases": {
    gradient: "from-violet-500/40 via-purple-400/30 to-fuchsia-300/20",
    pill: "bg-violet-500 hover:bg-violet-600",
    ring: "ring-violet-400/40",
  },
  "photo-books": {
    gradient: "from-rose-500/40 via-pink-400/30 to-red-300/20",
    pill: "bg-rose-500 hover:bg-rose-600",
    ring: "ring-rose-400/40",
  },
};

export const heroMeshColors = [
  "#2563EB",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#06B6D4",
] as const;
