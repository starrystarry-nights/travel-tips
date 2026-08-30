/* Replaced with content-hashed asset lists by scripts/build-offline.mjs. */
const VERSION = "__BUILD_VERSION__";
const CORE = ["__CORE_ASSETS__"];
const OFFLINE = ["__OFFLINE_ASSETS__"];
const SCOPE = new URL(self.registration.scope);
const PREFIX = `xe-offline:${SCOPE.pathname}:`;
const CACHE = PREFIX + VERSION;
const absolute = value => new URL(value, SCOPE).href;
const home = absolute("./");
const coreUrls = CORE[0] === "__CORE_ASSETS__" ? [home, absolute("manifest.webmanifest")] : CORE.map(absolute);
const offlineUrls = OFFLINE[0] === "__OFFLINE_ASSETS__" ? [] : OFFLINE.map(absolute);
const allowedUrls = new Set([...coreUrls, ...offlineUrls]);
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(coreUrls))));
self.addEventListener("activate", event => event.waitUntil((async () => {
  // Retain one older generation for open tabs still running the previous bundle.
  const keys = (await caches.keys()).filter(key => key.startsWith(PREFIX));
  const previous = keys.filter(key => key !== CACHE).at(-1);
  await Promise.all(keys.filter(key => key !== CACHE && key !== previous).map(key => caches.delete(key)));
  await self.clients.claim();
})()));
async function status(cache) {
  let done = 0;
  for (const url of allowedUrls) if (await cache.match(url)) done++;
  return { complete: done === allowedUrls.size, done, total: allowedUrls.size, failed: allowedUrls.size - done };
}
let downloading;
async function download(cache, port) {
  const list = [...allowedUrls]; let done = 0, failed = 0;
  // Bounded concurrency avoids overwhelming mobile connections and storage.
  let cursor = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (cursor < list.length) {
      const url = list[cursor++];
      try {
        if (!(await cache.match(url))) {
          const remote = new URL(url).origin !== SCOPE.origin;
          const response = await fetch(url, { mode: remote ? "cors" : "same-origin", credentials: "omit", signal: AbortSignal.timeout(20000) });
          if (!(response.ok || response.type === "opaque") || response.redirected) throw new Error("resource unavailable");
          await cache.put(url, response);
        }
        done++;
      } catch { failed++; }
      port?.postMessage({ type: "progress", done, total: list.length, failed, complete: false });
    }
  }));
  return status(cache);
}
self.addEventListener("message", event => {
  if (event.data?.type === "ACTIVATE") { event.waitUntil(self.skipWaiting()); return; }
  const port = event.ports[0];
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE);
      if (event.data?.type === "DOWNLOAD") {
        if (!downloading) downloading = download(cache, port).finally(() => { downloading = undefined; });
        port?.postMessage(await downloading);
      } else if (event.data?.type === "STATUS") port?.postMessage(await status(cache));
    } catch { port?.postMessage({ error: "离线空间不足或浏览器不允许保存，请释放空间后重试。" }); }
  })());
});
self.addEventListener("fetch", event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== "GET") return;
  if (url.origin === SCOPE.origin && url.pathname.startsWith(SCOPE.pathname) && request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { signal: AbortSignal.timeout(3500) });
        if (!response.ok || response.redirected) throw new Error("navigation failed");
        return response;
      } catch { return await (await caches.open(CACHE)).match(home) || Response.error(); }
    })());
    return;
  }
  if (!allowedUrls.has(url.href)) return; // Never cache weather, private API data, or arbitrary third parties.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE), saved = await cache.match(request);
    if (saved) return saved;
    const response = await fetch(request);
    if ((response.ok || response.type === "opaque") && !response.redirected) await cache.put(request, response.clone());
    return response; // Never return HTML in place of an image, script, or JSON response.
  })());
});
