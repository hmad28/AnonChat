const AVATAR_COLORS = [
  'bg-emerald-500 text-white',
  'bg-violet-500 text-white',
  'bg-amber-500 text-slate-950',
  'bg-rose-500 text-white',
  'bg-cyan-500 text-slate-950',
  'bg-indigo-500 text-white',
  'bg-fuchsia-500 text-white',
  'bg-teal-500 text-white',
  'bg-orange-500 text-white',
  'bg-blue-500 text-white',
];

export function getRandomColor(): string {
  const index = Math.floor(Math.random() * AVATAR_COLORS.length);
  return AVATAR_COLORS[index];
}

export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
