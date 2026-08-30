import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const root = 'https://example.test/travel-tips/';
const built = readFileSync('dist-public/sw.js','utf8');
function harness() {
  const listeners = {}, buckets = new Map();
  const key = r => typeof r === 'string' ? r : r.url;
  const state = { offline: false, bad: '', claimed: false };
  const fetch = async req => { const url = key(req); if (state.offline || url.includes(state.bad || '__never__')) throw new Error('network offline'); return new Response(url === root ? '<html>app shell</html>' : 'resource', { status: 200 }); };
  const caches = {
    keys: async () => [...buckets.keys()],
    delete: async name => buckets.delete(name),
    open: async name => {
      if (!buckets.has(name)) buckets.set(name,new Map());
      const entries = buckets.get(name);
      return { match: async req => entries.get(key(req))?.clone(), put: async (req,res) => entries.set(key(req),res.clone()), addAll: async urls => { const responses = await Promise.all(urls.map(fetch)); responses.forEach((res,i) => entries.set(urls[i],res)); } };
    }
  };
  const self = { registration: { scope: root }, location: { origin: 'https://example.test' }, clients: { claim: async () => { state.claimed = true; } }, skipWaiting: async () => {}, addEventListener: (name, fn) => listeners[name]=fn };
  vm.runInNewContext(built,{ self, caches, fetch, URL, Response, AbortSignal, Set, Promise });
  async function lifecycle(name) { let result; listeners[name]({ waitUntil: p => { result=p; } }); return result; }
  async function message(type) { let result, response; listeners.message({ data:{type}, ports:[{postMessage: value => { if(value.type !== 'progress') response=value; }}], waitUntil:p => {result=p;} }); await result; return response; }
  function request(url, mode='cors', method='GET') { let result; listeners.fetch({ request:{url, mode, method}, respondWith:p => {result=p;} }); return result; }
  return { state, buckets, lifecycle, message, request };
}

test('install precaches shell, assets and valid subpath-scoped install icons', async () => {
  const h=harness(); await h.lifecycle('install');
  const entries=[...h.buckets.values()][0]; assert.ok(entries.has(root));
  assert.ok([...entries.keys()].some(url => url.includes('/travel-tips/assets/') && url.endsWith('.js')));
  assert.ok(entries.has(root+'icons/icon-192.png'));
  assert.ok([...entries.keys()].every(url=>url.startsWith(root)));
  const manifest=JSON.parse(readFileSync('dist-public/manifest.webmanifest'));
  assert.equal(manifest.scope,'./'); assert.equal(manifest.start_url,'./?source=pwa');
  for(const icon of manifest.icons) { const file='dist-public/'+icon.src.replace(/^\.\//,''); assert.ok(existsSync(file)); const png=readFileSync(file); const size=Number(icon.sizes.split('x')[0]); assert.equal(png.readUInt32BE(16),size); assert.equal(png.readUInt32BE(20),size); }
});
test('offline direct day link falls back to application shell', async () => {
  const h=harness(); await h.lifecycle('install'); h.state.offline=true;
  const response=await h.request(root+'?day=7','navigate'); assert.match(await response.text(),/app shell/);
});
test('unvisited days and images are cached by the explicit offline download', async () => {
  const h=harness(); await h.lifecycle('install'); const result=await h.message('DOWNLOAD'); assert.equal(result.complete,true); assert.equal(result.done,result.total);
  h.state.offline=true; const response=await h.request(root+'editorial/day06-hero.jpg'); assert.equal(await response.text(),'resource');
});
test('interrupted resource download does not claim complete and can be resumed', async () => {
  const h=harness(); await h.lifecycle('install'); h.state.bad='day06-hero'; const partial=await h.message('DOWNLOAD'); assert.equal(partial.complete,false); assert.equal(partial.failed,1);
  h.state.bad=''; const complete=await h.message('DOWNLOAD'); assert.equal(complete.complete,true);
});
test('an uncached image fails instead of receiving HTML', async () => {
  const h=harness(); await h.lifecycle('install'); h.state.offline=true;
  await assert.rejects(h.request(root+'editorial/day06-hero.jpg'),/network offline/);
});
test('weather, unrelated requests and mutations are never cached', async () => {
  const h=harness(); assert.equal(h.request('https://api.open-meteo.com/v1/forecast'),undefined); assert.equal(h.request('https://example.test/another-app/'),undefined); assert.equal(h.request(root+'api/private','cors','POST'),undefined);
});
test('cache cleanup preserves other apps and one prior version', async () => {
  const h=harness(); h.buckets.set('other-app',new Map()); h.buckets.set('xe-offline:/travel-tips/:older',new Map()); h.buckets.set('xe-offline:/travel-tips/:previous',new Map()); await h.lifecycle('install'); await h.lifecycle('activate');
  assert.equal(h.state.claimed,true); assert.ok(h.buckets.has('other-app')); assert.ok(h.buckets.has('xe-offline:/travel-tips/:previous')); assert.equal(h.buckets.has('xe-offline:/travel-tips/:older'),false);
});
test('public HTML and all same-origin offline resources resolve inside the built site', async () => {
  const html=readFileSync('dist-public/index.html','utf8'); assert.match(html,/<base href="\/travel-tips\/"/); assert.doesNotMatch(html,/__PUBLIC_URL__|__BUILD_VERSION__|chatgpt-auth/);
  const lists=[...built.matchAll(/const (?:CORE|OFFLINE) = (\[[^\n]+\]);/g)].flatMap(m=>JSON.parse(m[1]));
  for(const path of lists) { if(path==='./'||path.startsWith('https:')) continue; assert.ok(existsSync('dist-public/'+path),path); }
  for(const match of html.matchAll(/(?:src|href)="(\/travel-tips\/[^"?]+)"/g)) assert.ok(existsSync('dist-public/'+match[1].slice('/travel-tips/'.length)));
});
