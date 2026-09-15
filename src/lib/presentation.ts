/** Stable section colours shared by the navigation and working surfaces. */
export function routeTone(pathname: string) {
  if (pathname.startsWith("/steps")) return "movement";
  if (pathname.startsWith("/weight")) return "weight";
  if (pathname.startsWith("/mobility")) return "recovery";
  if (pathname.startsWith("/flexibility-balance")) return "balance";
  if (pathname.startsWith("/workout")) return "training";
  return "neutral";
}
