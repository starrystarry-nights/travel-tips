import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = new URL("../", import.meta.url);
function loadSource(path) {
  const source = readFileSync(new URL(path, root), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2022,
  } });
  const module = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    name => name === "./assets" ? { assetUrl: src => src } : name === "./day-components"
      ? { ArrowIcon: () => React.createElement("svg", { "aria-hidden": true }) }
      : require(name), module, module.exports);
  return module.exports;
}
const { dayVisuals } = loadSource("data/experience.ts");
const { OutfitSheetContent } = loadSource("app/outfit-sheet.tsx");
const renderDay = day => renderToStaticMarkup(React.createElement(OutfitSheetContent,
  { day, visual: dayVisuals[day], openInspiration() {} }));

test("all seven days render the shared layout and their own day label", () => {
  for (let day = 1; day <= 7; day++) {
    const html = renderDay(day);
    assert.match(html, new RegExp(`Day 0${day} 穿搭参考`));
    assert.match(html, /day3-comfort-line/);
    assert.match(html, /打开完整灵感库/);
    assert.equal((html.match(/<figure/g) || []).length,
      dayVisuals[day].outfitSecondary ? 2 : 1);
    assert.doesNotMatch(html, /src="(?:undefined|)"/);
  }
});
test("approved Day 03 and Day 06 photos stay unchanged", () => {
  assert.match(dayVisuals[3].outfit, /photos\/31613705\//);
  assert.match(dayVisuals[3].outfitSecondary, /photos\/16236785\//);
  assert.equal(dayVisuals[6].outfit, "/media/style/s-13.webp");
  assert.equal(dayVisuals[6].outfitSecondary, "/media/style/s-11.webp");
  assert.match(renderDay(3), /防风外层 \+ 柔软围巾 \+ 宽松下装/);
  assert.match(renderDay(3), /进禾木/);
});
test("new destination photos are distinct local assets with focal positions", () => {
  assert.notEqual(dayVisuals[1].outfit, dayVisuals[4].outfit);
  for (const day of [1, 4]) {
    assert.ok(existsSync(new URL(`public${dayVisuals[day].outfit}`, root)));
    assert.ok(dayVisuals[day].outfitAlt);
    assert.match(renderDay(day), /object-position:/);
    assert.match(renderDay(day), /data-count="1"/);
    assert.doesNotMatch(renderDay(day), /\/media\/style\//);
  }
});
test("Day 03 and generic sheets both use the shared component", () => {
  const source = readFileSync(new URL("app/site.tsx", root), "utf8");
  assert.equal((source.match(/<OutfitSheetContent /g) || []).length, 2);
  assert.doesNotMatch(source, /className="day3-wear-track"/);
  const css = readFileSync(new URL("app/globals.css", root), "utf8");
  assert.match(css, /\.day3-wear-track img\s*\{[^}]*display: block;/);
  assert.match(css, /\.day3-wear-track\[data-count="1"\]\s*\{\s*grid-auto-columns: 100%;/);
});
