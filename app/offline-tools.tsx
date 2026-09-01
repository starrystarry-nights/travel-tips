"use client";
import { useEffect, useState } from "react";
import { appBase, assetUrl, shareUrl } from "./assets";
import { ArrowIcon } from "./day-components";

type Status = { complete: boolean; done: number; total: number; failed?: number };
type InstallPrompt = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> };
let registration: Promise<ServiceWorkerRegistration> | undefined;
let installPrompt: InstallPrompt | undefined;

function isGitHubPages() {
  return typeof location !== "undefined" && location.hostname.endsWith("github.io");
}

async function clearGitHubPagesOfflineState() {
  if (!isGitHubPages()) return;
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations
      .filter(reg => reg.scope.includes("/travel-tips/"))
      .map(reg => reg.unregister()));
  }
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith("xe-offline:/travel-tips/:"))
      .map(key => caches.delete(key)));
  }
}

export function useOfflineRegistration() {
  useEffect(() => {
    const capture = (event: Event) => { event.preventDefault(); installPrompt = event as InstallPrompt; };
    window.addEventListener("beforeinstallprompt", capture);

    if (isGitHubPages()) {
      clearGitHubPagesOfflineState().catch(() => {});
      return () => window.removeEventListener("beforeinstallprompt", capture);
    }

    if ("serviceWorker" in navigator && location.protocol !== "http:") {
      registration ||= navigator.serviceWorker.register(assetUrl("/sw.js"), { scope: appBase(), updateViaCache: "none" });
      registration.catch(() => { registration = undefined; });
    } else if ("serviceWorker" in navigator && ["localhost", "127.0.0.1"].includes(location.hostname)) {
      registration ||= navigator.serviceWorker.register(assetUrl("/sw.js"), { scope: appBase() });
    }
    return () => window.removeEventListener("beforeinstallprompt", capture);
  }, []);
}

async function askWorker(type: string, progress?: (s: Status) => void): Promise<Status> {
  if (isGitHubPages()) throw new Error("GitHub 公开版当前使用在线更新模式。");
  if (!("serviceWorker" in navigator)) throw new Error("当前浏览器不支持离线保存，请用 Safari 或 Chrome 打开。 ");
  const reg = await Promise.race([navigator.serviceWorker.ready, new Promise<never>((_, reject) => setTimeout(() => reject(new Error("离线服务尚未就绪，请联网刷新后重试")), 20000))]);
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timeout = setTimeout(() => { channel.port1.close(); reject(new Error("下载超时，请保持联网后重试")); }, 180000);
    channel.port1.onmessage = ({ data }) => {
      if (data.type === "progress") { progress?.(data); return; }
      clearTimeout(timeout); channel.port1.close();
      if (data.error) reject(new Error(data.error)); else resolve(data);
    };
    reg.active!.postMessage({ type }, [channel.port2]);
  });
}

export function OfflineNotice() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine); update();
    window.addEventListener("online", update); window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  return offline ? <p className="offline-notice" role="status">当前离线：路线与地点仍可查看。地图底图和实时天气需联网更新。</p> : null;
}

export function OfflineTools() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [update, setUpdate] = useState<ServiceWorkerRegistration | null>(null);
  const githubPages = typeof window !== "undefined" && isGitHubPages();

  useEffect(() => {
    if (isGitHubPages()) {
      clearGitHubPagesOfflineState().then(() => setStatus(null)).catch(() => {});
      return;
    }
    if (!("serviceWorker" in navigator)) return;
    askWorker("STATUS").then(setStatus).catch(() => {});
    navigator.serviceWorker.ready.then(reg => {
      const inspect = () => { if (reg.waiting) setUpdate(reg); };
      inspect();
      reg.installing?.addEventListener("statechange", inspect);
      reg.addEventListener("updatefound", () => reg.installing?.addEventListener("statechange", inspect));
    }).catch(() => {});
  }, []);

  async function download() {
    if (githubPages) { setMessage("GitHub 公开版暂不启用离线缓存，以保证图片和地图始终加载最新版本。"); return; }
    setBusy(true); setMessage("");
    try {
      const result = await askWorker("DOWNLOAD", setStatus); setStatus(result);
      setMessage(result.complete ? "离线包已保存。行程、清单、地点备注和已保存的图片可断网使用。" : `还有 ${result.failed} 个资源未下载，请联网后重试。已下载的会保留。`);
      if (result.complete) await navigator.storage?.persist?.().catch(() => false);
    } catch (error) { setMessage(error instanceof Error ? error.message : "下载失败，请重试"); }
    finally { setBusy(false); }
  }
  async function install() {
    if (installPrompt) { await installPrompt.prompt(); await installPrompt.userChoice; installPrompt = undefined; }
    else setMessage("iPhone：在 Safari 中点分享，再选「添加到主屏幕」。Android：在浏览器菜单中选「安装应用」或「添加到主屏幕」。");
  }
  async function copy() {
    try { await navigator.clipboard.writeText(shareUrl()); setMessage("公开链接已复制，不包含你的备注、勾选或图片。"); }
    catch { setMessage(`请复制这个链接：${shareUrl()}`); }
  }

  return <section className="offline-tools" aria-label="离线与分享">
    <div><small>TAKE IT WITH YOU</small><b>{githubPages ? "公开版在线更新" : status?.complete ? "已准备好离线使用" : "把旅行指南带在手机里"}</b></div>
    <div className="offline-actions">
      <button onClick={download} disabled={busy}>{githubPages ? "在线模式" : busy ? `下载中 ${status?.done || 0}/${status?.total || "…"}` : status?.complete ? "检查离线包" : "下载离线包"}<ArrowIcon direction="up" /></button>
      <button onClick={install}>添加到主屏幕<ArrowIcon direction="up" /></button>
      <button onClick={copy}>复制链接<ArrowIcon /></button>
    </div>
    <p>{githubPages ? "GitHub 公开版优先保证图片、地图和页面更新正常；个人记录仍只保存在本机。" : "首次使用请联网下载。个人记录只存本机；更换网址后，原网址的数据不会自动迁移。"}</p>
    <OfflineNotice />
    {message && <p role="status">{message}</p>}
    {update && <button onClick={() => { navigator.serviceWorker.addEventListener("controllerchange", () => location.reload(), { once: true }); update.waiting?.postMessage({ type: "ACTIVATE" }); }}>新版本已就绪，刷新更新<ArrowIcon /></button>}
  </section>;
}
