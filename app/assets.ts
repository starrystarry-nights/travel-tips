/** Resolve the application base for both ChatGPT Sites and GitHub Pages. */
export function appBase() {
  if (typeof window === "undefined") return "/";

  const explicitBase = document.querySelector("base")?.getAttribute("href");
  if (explicitBase && explicitBase !== "/") return explicitBase.endsWith("/") ? explicitBase : `${explicitBase}/`;

  // GitHub project Pages are hosted below /<repo>/ rather than at the domain root.
  if (window.location.hostname.endsWith("github.io")) {
    const firstSegment = window.location.pathname.split("/").filter(Boolean)[0];
    if (firstSegment) return `/${firstSegment}/`;
  }

  return "/";
}

export function assetUrl(src: string) {
  if (/^(?:https?:)?\/\//.test(src) || src.startsWith("data:") || src.startsWith("blob:")) return src;
  return src.startsWith("/") ? `${appBase()}${src.slice(1)}` : `${appBase()}${src}`;
}

export function shareUrl(day?: number) {
  const url = new URL(appBase(), location.origin);
  if (day) url.searchParams.set("day", String(day));
  return url.href;
}
