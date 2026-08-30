import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
const dir = "dist-public";
async function files(root, prefix = "") {
  const result = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (entry.isDirectory()) result.push(...await files(join(root, entry.name), name + "/"));
    else result.push(name);
  }
  return result.sort();
}
const all = (await files(dir)).filter(file => !["sw.js", "404.html", ".nojekyll"].includes(file));
const core = ["./", ...all.filter(file => file !== "index.html" && (/\.(js|css|webmanifest)$/.test(file) || file.startsWith("icons/") || file === "favicon.svg"))];
const external = new Set();
for (const file of ["app/site.tsx", "data/experience.ts"]) {
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(/https:\/\/images\.(?:unsplash|pexels)\.com\/[^"\s]+/g)) external.add(match[0]);
}
const offline = [...all.filter(file => file !== "index.html" && !core.includes(file)), ...external];
const hash = createHash("sha256");
for (const file of all) { hash.update(file); hash.update(await readFile(join(dir, file))); }
const template = await readFile("public/sw.js", "utf8"); hash.update(template);
const version = hash.digest("hex").slice(0,16);
await writeFile(join(dir, "sw.js"), template.replace('"__BUILD_VERSION__"', JSON.stringify(version)).replace('["__CORE_ASSETS__"]', JSON.stringify(core)).replace('["__OFFLINE_ASSETS__"]', JSON.stringify(offline)));
await writeFile(join(dir, ".nojekyll"), "");
await writeFile(join(dir, "404.html"), await readFile(join(dir, "index.html")));
console.log(`Public PWA built: ${core.length} core resources; ${offline.length} downloadable resources; version ${version}`);
