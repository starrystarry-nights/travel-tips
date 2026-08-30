/** A relative application base lets the same source run on Sites or GitHub Pages. */
export function appBase() {
  return typeof document === "undefined" ? "/" : (document.querySelector("base")?.getAttribute("href") || "/");
}
export function assetUrl(src: string) {
  return src.startsWith("/") && !src.startsWith("//") ? `${appBase()}${src.slice(1)}` : src;
}
export function shareUrl(day?: number) {
  const url = new URL(appBase(), location.origin);
  if (day) url.searchParams.set("day", String(day));
  return url.href;
}
