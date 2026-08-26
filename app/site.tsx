"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { mediaById, validateMediaLibrary } from "@/data/media";
import { days, packLayers, photoReferences, places, preparations, styleReferences, tripStart, type Freshness, type Preparation, type Stage, type TripDay } from "@/data/product";
import { AppShell, ImageFrame } from "./primitives";
import { TripPrototype } from "./trip-prototype";
import { dayVisuals, visualFor } from "@/data/experience";
import { BottomNav as JournalBottomNav, ChecklistPreview, DayHero, EditorialSection, InfoRail, LandscapePhotoBlock, OutfitPreview, Timeline } from "./day-components";

type View = "home" | "trip" | "map" | "inspire" | "pack";
type PackLayer = keyof typeof packLayers;
type WeatherState = { status: "idle" | "loading" | "ready" | "unavailable"; min?: number; max?: number; feelsMin?: number; feelsMax?: number; rain?: number; wind?: number; uv?: number; message?: string };
declare global { interface Window { L?: any } }

const nav: { id: View; label: string }[] = [{ id: "home", label: "首页" }, { id: "trip", label: "行程" }, { id: "map", label: "地图" }, { id: "inspire", label: "灵感" }, { id: "pack", label: "打包" }];

function Media({ id, priority = false, sizes = "100vw", className = "" }: { id: string; priority?: boolean; sizes?: string; className?: string }) {
  const media = mediaById.get(id); if (!media) return <ImageFrame className={`missing ${className}`}><span /></ImageFrame>;
  return <ImageFrame className={className}><Image src={media.src} alt={media.alt} fill sizes={sizes} priority={priority} unoptimized /></ImageFrame>;
}

function useStoredRecord(key: string) {
  const [value, setValue] = useState<Record<string, boolean>>({});
  useEffect(() => { try { setValue(JSON.parse(localStorage.getItem(key) || "{}")); } catch { setValue({}); } }, [key]);
  const toggle = (id: string) => setValue(old => { const next = { ...old, [id]: !old[id] }; localStorage.setItem(key, JSON.stringify(next)); return next; });
  return { value, toggle };
}

function getDateState(now = new Date()) {
  const start = new Date(tripStart), end = new Date("2026-09-19T00:00:00+08:00"); const daysToGo = Math.ceil((start.getTime() - now.getTime()) / 86400000);
  if (now < start) return { mode: "before" as const, daysToGo };
  if (now >= end) return { mode: "after" as const, daysToGo: 0 };
  const iso = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(now); const current = days.find(d => d.iso === iso);
  return { mode: "during" as const, daysToGo: 0, currentDay: current?.day ?? 1 };
}

function prepActive(item: Preparation, now: Date, state: ReturnType<typeof getDateState>) {
  if (item.window === "available") return true; if (item.window === "not-open") return false;
  if (item.window === "today") return state.mode === "during" && state.currentDay === item.day;
  const diff = Math.ceil((new Date(tripStart).getTime() - now.getTime()) / 86400000);
  return item.window === "48h" ? diff <= 2 && diff >= 0 : item.window === "day-before" ? diff <= 1 && diff >= 0 : false;
}

function FreshnessBadge({ type }: { type: Freshness }) { return <span className={`freshness ${type}`}>{type === "stable" ? "稳定信息" : type === "before" ? "出发前确认" : "当天确认"}</span>; }
function Topbar({ title, back }: { title?: string; back?: () => void }) { return <header className="topbar">{back ? <button onClick={back} aria-label="返回">←</button> : <span className="brand-mark">XE</span>}<div><b>{title || "THE XINJIANG EDIT"}</b><small>北疆秋日旅行指南</small></div><time>12—18 SEP</time></header>; }
function BottomNav({ view, change }: { view: View; change: (v: View) => void }) { return <nav className="basic-nav" aria-label="主要导航">{nav.map(item => <button key={item.id} aria-current={view === item.id ? "page" : undefined} onClick={() => change(item.id)}>{item.label}</button>)}</nav>; }
function Progress({ done, total }: { done: number; total: number }) { return <div className="progress"><span style={{ width: `${total ? done / total * 100 : 0}%` }} /><small>{done} / {total}</small></div>; }

const helperCategories = [
  { id: "outerwear", title: "外层保暖与防风", icon: "◒", items: [["shell", "防风防雨外层", "已准备"], ["warm", "薄抓绒 / 轻保暖层"], ["base", "速干或轻薄打底"], ["pants", "舒适防风长裤"], ["gloves", "薄款手套"], ["warm-hat", "保暖帽"]] },
  { id: "sun", title: "防晒与干燥", icon: "☼", items: [["sun", "防晒霜"], ["sunglasses", "墨镜"], ["sun-hat", "遮阳帽"], ["lip", "润唇膏"], ["moisturizer", "面霜 / 身体乳"]] },
  { id: "footwear", title: "鞋与袜子", icon: "↟", items: [["shoes", "走熟的防滑鞋"], ["rain-boots", "雨靴 / 防水鞋（按预报）"], ["socks", "厚薄袜子各备几双"]] },
  { id: "docs", title: "证件与凭证", icon: "□", items: [["id", "身份证"], ["tickets", "交通电子凭证"], ["bookings", "住宿 / 集合信息截图"], ["cash", "少量现金"]] },
  { id: "electronics", title: "电子设备", icon: "⌁", items: [["phone-cable", "手机充电线"], ["power", "充电宝"], ["camera", "相机 / 备用电池"], ["offline", "离线地图与离线内容"]] },
  { id: "comfort", title: "常备与舒适", icon: "+", items: [["meds", "常用药"], ["water-bottle", "水杯"], ["tissue", "纸巾 / 湿巾"], ["toiletries", "洗漱与卸妆用品"], ["mosquito", "驱蚊用品"]] },
] as const;

function Home({ openDay, goPack, goMap, goTrip, share }: { openDay: (n: number) => void; goPack: (l: PackLayer) => void; goMap: (n: number) => void; goTrip:()=>void; share:()=>void }) {
  const now=useMemo(()=>new Date(),[]),state=getDateState(now),{value:packed}=useStoredRecord("xe-packing-v2"),{value:prep}=useStoredRecord("xe-preparation-v1");
  const all=helperCategories.flatMap(c=>c.items),done=all.filter(([id])=>packed[id]).length,current=state.mode==="during"?days[(state.currentDay||1)-1]:days[0],activePrep=preparations.filter(p=>prepActive(p,now,state)&&!prep[p.id]);
  return <main className="journal-home"><section className="journal-home-scene"><LandscapePhotoBlock source={state.mode==="during"?visualFor(current).hero:"ahe-road-01"} priority/><header><span>THE XINJIANG EDIT</span><button onClick={share}>SHARE ↗</button></header><div><small>{state.mode==="before"?"BEFORE THE TRIP":state.mode==="during"?`DAY ${String(current.day).padStart(2,"0")}`:"TRIP ARCHIVE"}</small><h1>{state.mode==="before"?`${state.daysToGo} 天后出发`:current.route.join(" → ")}</h1><p>北疆秋日旅行指南 · 12—18 SEP 2026</p></div></section><section className="journal-home-actions"><button onClick={()=>openDay(current.day)}><small>{state.mode==="during"?"TODAY":"NEXT DAY"}</small><b>{current.route.join(" → ")}</b><span>{current.drive||"自由活动"}　→</span></button><button onClick={goTrip}><small>THE JOURNEY</small><b>7 天路线</b><span>09.13—09.17 跟团行程　→</span></button></section><section className="journal-home-prep"><header><small>PREPARATION</small><h2>出发前准备</h2></header><div><button onClick={()=>goPack("day")}><strong>{done}/{all.length}</strong><span>整趟清单进度</span></button><button onClick={()=>goMap(3)}><strong>{activePrep.length}</strong><span>当前待确认</span></button></div>{activePrep.slice(0,2).map(p=><p key={p.id}><b>{p.title}</b><span>{p.freshness==="today"?"当天确认":"出发前确认"}</span></p>)}</section></main>
}

function PackMini({ open }: { open: () => void }) { const { value } = useStoredRecord("xe-packing-v2"); const items = packLayers.day; const required = items.filter(([, , level]) => level === "required"); const done = items.filter(([id]) => value[id]).length, missing = required.filter(([id]) => !value[id]).length; return <button className="pack-mini day" onClick={open}><div><small>DAY 03 · ON YOU</small><b>{missing ? `${missing} 件必带物品未完成` : "必带物品已完成"}</b></div><span>{done}/{items.length} →</span></button>; }

function Weather({ day, variant = "default" }: { day: TripDay; variant?: "default" | "rail" }) {
  const [weather, setWeather] = useState<WeatherState>({ status: "idle" });
  useEffect(() => { const target = new Date(`${day.iso}T12:00:00+08:00`), diff = Math.ceil((target.getTime() - Date.now()) / 86400000); if (diff > 16 || diff < -2) { setWeather({ status: "unavailable", message: diff > 16 ? "尚未进入可查询窗口" : "历史天气未加载" }); return; } const place = places.find(p => p.id === day.placeIds.at(-1)) || places[0]; setWeather({ status: "loading" }); fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lng}&daily=temperature_2m_min,temperature_2m_max,apparent_temperature_min,apparent_temperature_max,precipitation_probability_max,wind_speed_10m_max,uv_index_max&timezone=Asia%2FShanghai&start_date=${day.iso}&end_date=${day.iso}`).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(data => setWeather({ status: "ready", min: data.daily.temperature_2m_min[0], max: data.daily.temperature_2m_max[0], feelsMin: data.daily.apparent_temperature_min[0], feelsMax: data.daily.apparent_temperature_max[0], rain: data.daily.precipitation_probability_max[0], wind: data.daily.wind_speed_10m_max[0], uv: data.daily.uv_index_max[0] })).catch(() => setWeather({ status: "unavailable", message: "天气服务暂时不可用" })); }, [day]);
  if (variant === "rail") return <section className={`day3-weather-rail ${weather.status}`} aria-label="Day 03 天气">
    <div><small>WEATHER</small><b>{weather.status === "ready" ? `${weather.min}—${weather.max}°` : "—"}</b><span>{weather.status === "loading" ? "正在获取" : weather.status === "ready" ? "最低 / 最高" : weather.message}</span></div>
    <div><small>FEELS</small><b>{weather.status === "ready" ? `${weather.feelsMin}—${weather.feelsMax}°` : "—"}</b><span>体感范围</span></div>
    <div><small>RAIN</small><b>{weather.status === "ready" ? `${weather.rain}%` : "—"}</b><span>降水概率</span></div>
    <div><small>WIND</small><b>{weather.status === "ready" ? `${weather.wind}` : "—"}</b><span>km/h</span></div>
  </section>;
  if (weather.status !== "ready") return <section className="weather unavailable"><header><small>WEATHER · {day.route.at(-1)}</small><b>{weather.status === "loading" ? "正在获取" : weather.message}</b></header><p>不使用虚构天气。临近日期后自动提供穿衣与随身建议。</p></section>;
  const decisions = [weather.min! <= 10 && `最低 ${weather.min}°C：保暖层随身`, weather.rain! >= 35 && `降水概率 ${weather.rain}%：防雨外层与鞋`, weather.wind! >= 25 && `风约 ${weather.wind} km/h：固定帽子和围巾`, weather.uv! >= 6 && `UV ${weather.uv}：防晒与遮挡`].filter(Boolean);
  return <section className="weather"><header><small>WEATHER · {day.route.at(-1)}</small><b>{weather.min}° — {weather.max}°</b><span>降水 {weather.rain}% · 风 {weather.wind} km/h</span></header><div>{decisions.length ? decisions.map(x => <p key={String(x)}>{x}</p>) : <p>当前预报没有需要特别升级的装备提示。</p>}</div><small>数据：Open‑Meteo · 预报可能变化</small></section>;
}

function StageBlock({ stage, prepDone, togglePrep, goMap, goPack, goInspire }: { stage: Stage; prepDone: Record<string, boolean>; togglePrep: (id: string) => void; goMap: (place?: string) => void; goPack: (l: PackLayer) => void; goInspire: () => void }) {
  const linked = stage.taskIds?.map(id => preparations.find(p => p.id === id)!).filter(Boolean) || [];
  return <article className={`stage stage-${stage.kind}`}><div className="stage-dot" /><header><small>{stage.kind.toUpperCase()}</small><h2>{stage.title}</h2>{stage.meta && <span>{stage.meta}</span>}</header>{stage.facts?.map(f => <p key={f}>{f}</p>)}{stage.placeId && <button className="inline-link" onClick={() => goMap(stage.placeId)}>地图位置 →</button>}{linked.map(item => <button className={`confirmation ${prepDone[item.id] ? "done" : ""}`} key={item.id} onClick={() => togglePrep(item.id)}><div><FreshnessBadge type={item.freshness} /><b>{item.title}</b><small>{item.sourceLabel}</small></div><span>{prepDone[item.id] ? "已完成 ✓" : "待确认 ○"}</span></button>)}{stage.packLayer && <PackMini open={() => goPack("day")} />}{stage.id === "d3-ahe" && <button className="inspire-inline" onClick={goInspire}><Media id="style-forest-01" sizes="34vw" /><span><small>DAY 03 · INSPIRE</small><b>查看穿搭与照片参考</b>→</span></button>}{stage.optional && <span className="optional">可选 · 不影响主行程</span>}</article>;
}

const dayThreePhotos = {
  village: "https://images.unsplash.com/photo-1729581173921-417f634eb443?auto=format&fit=crop&fm=jpg&q=82&w=1800",
  road: "https://images.unsplash.com/photo-1729299960640-f56dac79d34e?auto=format&fit=crop&fm=jpg&q=82&w=1800",
  valley: "https://images.unsplash.com/photo-1619410485950-ca49269762de?auto=format&fit=crop&fm=jpg&q=82&w=1800",
  wearOne: "https://images.pexels.com/photos/31613705/pexels-photo-31613705.jpeg?auto=compress&cs=tinysrgb&w=1200",
  wearTwo: "https://images.pexels.com/photos/16236785/pexels-photo-16236785.jpeg?auto=compress&cs=tinysrgb&w=1200",
};

function EditorialPhoto({ src, alt, className = "", priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) {
  return <img className={className} src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" />;
}

function DayThreeMap({ openFullMap }: { openFullMap: () => void }) {
  const node = useRef<HTMLDivElement>(null), map = useRef<any>(null);
  useEffect(() => { let cancelled = false; const boot = async () => {
    if (!document.querySelector('link[data-leaflet]')) { const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; link.dataset.leaflet = "true"; document.head.appendChild(link); }
    if (!window.L) await new Promise<void>((resolve, reject) => { const existing = document.querySelector('script[data-leaflet]') as HTMLScriptElement | null; if (existing) { existing.addEventListener("load", () => resolve(), { once: true }); existing.addEventListener("error", () => reject(), { once: true }); return; } const script = document.createElement("script"); script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; script.dataset.leaflet = "true"; script.onload = () => resolve(); script.onerror = () => reject(); document.head.appendChild(script); });
    if (cancelled || !node.current || map.current) return; const L = window.L; const points = [places.find(p => p.id === "altay")!, places.find(p => p.id === "ahe")!, places.find(p => p.id === "hemu")!]; const instance = L.map(node.current, { zoomControl: false, attributionControl: true, scrollWheelZoom: false }); map.current = instance; L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(instance); const latLngs = points.map(p => [p.lat, p.lng]); L.polyline(latLngs, { color: "#5d715c", weight: 4, opacity: .9 }).addTo(instance); points.forEach((p, index) => L.circleMarker([p.lat, p.lng], { radius: index === 1 ? 7 : 5, color: "#f6f1e6", weight: 2, fillColor: index === 1 ? "#7f514b" : "#5d715c", fillOpacity: 1 }).bindTooltip(`${index + 1}. ${p.name}`, { permanent: true, direction: index === 1 ? "right" : "top", className: "day3-map-label" }).addTo(instance)); instance.fitBounds(latLngs, { padding: [28, 28] });
  }; boot().catch(() => {}); return () => { cancelled = true; map.current?.remove(); map.current = null; }; }, []);
  return <section className="day3-map-insert"><div ref={node} className="day3-map-canvas" aria-label="阿勒泰到禾木真实路线地图" /><ol><li><b>阿勒泰</b><small>出发</small></li><li><b>阿禾公路</b><small>景观路段 · 当天确认开放</small></li><li><b>禾木</b><small>今晚住宿</small></li></ol><button onClick={openFullMap}>打开完整地图 ↗</button></section>;
}

function DayThreeTimeline({ prepDone, togglePrep, goPack }: { prepDone: Record<string, boolean>; togglePrep: (id: string) => void; goPack: (layer: PackLayer) => void }) {
  const moments = [
    { time: "08:00", label: "离开阿勒泰前", copy: "早餐、洗手间、水和充电完成后出发。", task: "ahe-road" },
    { time: "途中", label: "阿禾公路", copy: "原野 → 森林 → 草原 → 山地；停车与下车服从当天安排。" },
    { time: "午间", label: "长车程", copy: "约 5 小时。水、纸巾、充电宝留在座位附近。" },
    { time: "进入前", label: "整理随手要用的东西", copy: "大件行李可能暂时不方便拿取；提前拿出今晚与明早的衣物、洗漱、充电和常用药。", bag: true },
    { time: "抵达后", label: "禾木", copy: "先吃饭、入住；旅拍、民俗馆和篝火按开放状态与体力选择。", task: "hemu-activity" },
    { time: "晚间", label: "准备明天", copy: "外层穿回，设备充电，准备次日衣物。" },
  ];
  return <section className="day3-timeline"><header><small>ITINERARY</small><h2>今天行程</h2></header><div>{moments.map((moment, index) => <article key={moment.label}><time>{moment.time}</time><i /><div><span>{String(index + 1).padStart(2, "0")}</span><h3>{moment.label}</h3><p>{moment.copy}</p>{moment.task && <button className={prepDone[moment.task] ? "checked" : ""} onClick={() => togglePrep(moment.task)}>{prepDone[moment.task] ? "已确认 ✓" : "当天确认 ○"}</button>}{moment.bag && <button onClick={() => goPack("day")}>查看当天随身 ↗</button>}</div></article>)}</div></section>;
}

function DayThreeDayBag({ openAll }: { openAll: () => void }) {
  const { value, toggle } = useStoredRecord("xe-packing-v2"), items = packLayers.day; const done = items.filter(([id]) => value[id]).length;
  return <section className="day3-daybag"><header><div><small>DAY BAG</small><h2>出门前检查</h2></div><span>{done}/{items.length}</span></header><div>{items.map(([id, label, level]) => <button key={id} className={value[id] ? "checked" : ""} onClick={() => toggle(id)}><i>{value[id] ? "✓" : ""}</i><span>{label}</span>{level === "required" && <small>必要</small>}</button>)}</div><button className="day3-text-link" onClick={openAll}>查看完整清单 ↗</button></section>;
}

type DayThreePanel = "weather" | "itinerary" | "map" | "wear" | "bag" | "road" | "stay";

function DayThreeSheet({ panel, close, day, prepDone, togglePrep, goMap, goPack, goInspire }: { panel: DayThreePanel; close: () => void; day: TripDay; prepDone: Record<string, boolean>; togglePrep: (id: string) => void; goMap: (n: number, place?: string) => void; goPack: (layer: PackLayer) => void; goInspire: () => void }) {
  const title: Record<DayThreePanel, [string, string]> = {
    weather: ["WEATHER", "天气与体感"], itinerary: ["ITINERARY", "今天行程"], map: ["ROUTE MAP", "路线地图"], wear: ["WHAT TO WEAR", "今天怎么穿"], bag: ["DAY BAG", "当天随身"], road: ["CHECK TODAY", "阿禾公路"], stay: ["TONIGHT", "今晚住宿"],
  };
  return <div className="day3-sheet-backdrop" role="presentation" onClick={close}><section className={`day3-sheet day3-sheet-${panel}`} role="dialog" aria-modal="true" aria-label={title[panel][1]} onClick={event => event.stopPropagation()}><header><div><small>{title[panel][0]}</small><h2>{title[panel][1]}</h2></div><button onClick={close} aria-label="关闭">×</button></header><div className="day3-sheet-body">
    {panel === "weather" && <><Weather day={day} /><p className="day3-sheet-note">临近 9 月 14 日进入预报窗口后显示真实温度、体感、降水与风速；当前不填充历史平均值。</p></>}
    {panel === "itinerary" && <DayThreeTimeline prepDone={prepDone} togglePrep={togglePrep} goPack={goPack} />}
    {panel === "map" && <DayThreeMap openFullMap={() => goMap(3, "ahe")} />}
    {panel === "wear" && <><div className="day3-wear-track"><figure><EditorialPhoto src={dayThreePhotos.wearOne} alt="秋季山野叠穿参考" /><figcaption>防风外层 + 柔软围巾 + 宽松下装</figcaption></figure><figure><EditorialPhoto src={dayThreePhotos.wearTwo} alt="山地环境头巾与外套穿搭参考" /><figcaption>轻层次；外层方便穿脱</figcaption></figure></div><div className="day3-comfort-line"><span><small>早上</small>完整层次</span><span><small>中午</small>脱外层</span><span><small>进禾木</small>外层穿回</span></div><p className="day3-sheet-note">约 5 小时坐车，避免勒腰或勒腿的下装。鞋以长时间坐车和短距离步行为准。</p><button className="day3-sheet-link" onClick={goInspire}>打开完整灵感库 ↗</button></>}
    {panel === "bag" && <DayThreeDayBag openAll={() => goPack("day")} />}
    {panel === "road" && <div className="day3-road-sheet"><button className={prepDone["ahe-road"] ? "checked" : ""} onClick={() => togglePrep("ahe-road")}><i>{prepDone["ahe-road"] ? "✓" : ""}</i><span><b>开放状态与通行安排</b><small>当天确认</small></span></button><dl><div><dt>距离</dt><dd>约 220 km</dd></div><div><dt>车程</dt><dd>约 5 h</dd></div><div><dt>海拔</dt><dd>禾木约 1,200 m</dd></div></dl><p>道路受天气和季节影响；关闭时可能调整路线。以团队或当地当天通知为准。</p></div>}
    {panel === "stay" && <div className="day3-stay-sheet"><figure><EditorialPhoto src={dayThreePhotos.village} alt="禾木村晨雾与木屋实景" /></figure><p>今晚住禾木。具体住宿名称、地址和联系电话尚未录入，以团队通知为准。</p><p>进入禾木前，提前拿出今晚与明早要用的衣物、洗漱、充电和常用药。</p><button onClick={() => goMap(3, "hemu")}>地图位置 ↗</button><button onClick={() => goPack("day")}>查看当天随身 ↗</button></div>}
  </div></section></div>;
}

function JournalDayThree({ close, goMap, goPack, goInspire }: { close: () => void; goMap: (n: number, place?: string) => void; goPack: (layer: PackLayer) => void; goInspire: () => void }) {
  const day = days[2], { value, toggle } = useStoredRecord("xe-preparation-v1"), [panel, setPanel] = useState<DayThreePanel | null>(null);
  return <main className="day3-publication">
    <header className="day3-floating-nav"><button onClick={close}>← 行程</button><span>03 / 07</span><time>SEP.14</time></header>
    <section className="day3-opening">
      <div className="day3-hero-track" aria-label="Day 03 风景照片，左右滑动"><figure><EditorialPhoto src={dayThreePhotos.village} alt="禾木村晨雾与群山实景" priority /><figcaption>01 / HEMU · PHOTO BY FISH SUN</figcaption></figure><figure><EditorialPhoto src={dayThreePhotos.road} alt="前往禾木途中雪山与秋林实景" /><figcaption>02 / ON THE WAY TO HEMU · PHOTO BY SAMI CHAU</figcaption></figure><figure><EditorialPhoto src={dayThreePhotos.valley} alt="新疆秋季山谷与村落实景" /><figcaption>03 / XINJIANG · PHOTO BY SAMMY WONG</figcaption></figure></div>
      <div className="day3-route-title"><small>DAY 03 · SEP.14</small><h1>阿勒泰 → 阿禾公路 → 禾木</h1><p>220 KM　·　约 5 H　·　住禾木</p></div>
      <p className="day3-script">Altay to Hemu</p>
      <button className="day3-weather-trigger" onClick={() => setPanel("weather")} aria-label="查看详细天气"><Weather day={day} variant="rail" /></button>
    </section>
    <section className="day3-control"><header><div><small>NEXT / 08:00</small><b>离开阿勒泰前</b></div><p>早餐、洗手间、水与充电。</p></header><div className="day3-quick-track"><button onClick={() => setPanel("road")}><small>CHECK</small><b>阿禾公路</b><span>{value["ahe-road"] ? "已确认" : "当天确认"}</span></button><button onClick={() => setPanel("stay")}><small>TONIGHT</small><b>禾木</b><span>行李提前整理</span></button><button onClick={() => setPanel("weather")}><small>ALTITUDE</small><b>约 1,200 m</b><span>禾木参考</span></button></div></section>
    <nav className="day3-primary-dock" aria-label="DAY 03 功能"><button onClick={() => setPanel("itinerary")}><b>行程</b><small>ITINERARY</small></button><button onClick={() => setPanel("wear")}><b>穿搭</b><small>STYLE</small></button><button onClick={() => setPanel("map")}><b>地图</b><small>MAP</small></button><button onClick={() => setPanel("bag")}><b>随身</b><small>DAY BAG</small></button></nav>
    {panel && <DayThreeSheet panel={panel} close={() => setPanel(null)} day={day} prepDone={value} togglePrep={toggle} goMap={goMap} goPack={goPack} goInspire={goInspire} />}
  </main>;
}

function GenericDaySheet({kind,day,close,goMap,goPack,goInspire,prep,togglePrep}:{kind:"stage"|"confirm";day:TripDay;close:()=>void;goMap:(n:number,p?:string)=>void;goPack:(l:PackLayer)=>void;goInspire:()=>void;prep:Record<string,boolean>;togglePrep:(id:string)=>void}){
  return <div className="journal-overlay" onClick={close}><section className="journal-sheet" onClick={e=>e.stopPropagation()}><header><div><small>{kind==="stage"?"ITINERARY":"CHECK"} · DAY {String(day.day).padStart(2,"0")}</small><h2>{kind==="stage"?"今天行程":"需要确认"}</h2></div><button onClick={close}>×</button></header>{kind==="stage"?<div className="journal-stage-details">{day.stages.map(stage=><article key={stage.id}><small>{stage.meta||stage.kind}</small><h3>{stage.title}</h3>{stage.facts?.map(f=><p key={f}>{f}</p>)}{stage.placeId&&<button onClick={()=>goMap(day.day,stage.placeId)}>地图位置 ↗</button>}{stage.optional&&<em>可选</em>}</article>)}</div>:<div className="journal-confirm-list">{day.stages.flatMap(s=>s.taskIds||[]).map(id=>preparations.find(p=>p.id===id)).filter(Boolean).map(item=><button key={item!.id} className={prep[item!.id]?"done":""} onClick={()=>togglePrep(item!.id)}><span><small>{item!.freshness==="today"?"当天确认":"出发前确认"}</small><b>{item!.title}</b></span><i>{prep[item!.id]?"✓":"○"}</i></button>)}{!day.stages.some(s=>s.taskIds?.length)&&<p>这一天没有额外预约项目。</p>}</div>}<footer><button onClick={()=>goPack("day")}>当天随身</button><button onClick={goInspire}>穿搭参考</button></footer></section></div>
}

function DayWorkspace({ dayNumber, close, goMap, goPack, goInspire }: { dayNumber: number; close: () => void; goMap: (n: number, place?: string) => void; goPack: (l: PackLayer) => void; goInspire: () => void }) {
  const day=days[dayNumber-1],visual=visualFor(day),{value:prep,toggle:togglePrep}=useStoredRecord("xe-preparation-v1"),{value:bag}=useStoredRecord("xe-packing-v2"),[sheet,setSheet]=useState<"stage"|"confirm"|null>(null);
  if(dayNumber===3)return <JournalDayThree close={close} goMap={goMap} goPack={goPack} goInspire={goInspire}/>;
  return <main className={`journal-day journal-day-${day.day}`}><DayHero day={day} visual={visual} weather={<Weather day={day} variant="rail"/>} back={close}/><InfoRail day={day} visual={visual} openMap={()=>goMap(day.day)} openConfirm={()=>setSheet("confirm")}/><EditorialSection eyebrow="ITINERARY" title="今天行程" action={<button onClick={()=>setSheet("stage")}>查看详情 →</button>}><Timeline stages={day.stages} openStage={()=>setSheet("stage")}/></EditorialSection><OutfitPreview visual={visual} open={goInspire}/><ChecklistPreview visual={visual} values={bag} open={()=>goPack("day")}/><EditorialSection eyebrow="TONIGHT" title={day.sleep==="—"?"返程":"住 · "+day.sleep}><p className="journal-stay-copy">具体住宿、集合地点与联系方式以公开行程或团队当天通知为准。</p><button className="journal-inline-link" onClick={()=>goMap(day.day)}>查看位置 ↗</button></EditorialSection>{sheet&&<GenericDaySheet kind={sheet} day={day} close={()=>setSheet(null)} goMap={goMap} goPack={goPack} goInspire={goInspire} prep={prep} togglePrep={togglePrep}/>}</main>;
}

function RealMap({ selectedDay, selectedPlaceId, selectDay, openDay }: { selectedDay: number; selectedPlaceId?: string; selectDay: (n: number) => void; openDay: (n: number) => void }) {
  const mapNode = useRef<HTMLDivElement>(null), mapRef = useRef<any>(null), layerRef = useRef<any>(null); const [placeId, setPlaceId] = useState(selectedPlaceId || days[selectedDay - 1].placeIds[0]), [mapReady, setMapReady] = useState(0); const selectedPlace = places.find(p => p.id === placeId) || places[0];
  useEffect(() => { if (selectedPlaceId) setPlaceId(selectedPlaceId); }, [selectedPlaceId]);
  useEffect(() => { if (!days[selectedDay - 1].placeIds.includes(placeId)) setPlaceId(days[selectedDay - 1].placeIds[0]); }, [selectedDay, placeId]);
  useEffect(() => { const load = async () => { if (!document.querySelector('link[data-leaflet]')) { const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; link.dataset.leaflet = "true"; document.head.appendChild(link); } if (!window.L) await new Promise<void>((resolve, reject) => { const s = document.createElement("script"); s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; s.onload = () => resolve(); s.onerror = () => reject(); document.head.appendChild(s); }); if (!mapNode.current || mapRef.current || !window.L) return; const L = window.L, map = L.map(mapNode.current, { zoomControl: false }).setView([47, 87.2], 5); mapRef.current = map; L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 16, attribution: "© OpenStreetMap" }).addTo(map); L.control.zoom({ position: "topright" }).addTo(map); setMapReady(x => x + 1); }; load().catch(() => {}); return () => { mapRef.current?.remove(); mapRef.current = null; }; }, []);
  useEffect(() => { const map = mapRef.current, L = window.L; if (!map || !L) return; layerRef.current?.remove(); const group = L.layerGroup().addTo(map); layerRef.current = group; const day = days[selectedDay - 1], ps = day.placeIds.map(id => places.find(p => p.id === id)!).filter(Boolean), line = ps.map(p => [p.lat, p.lng]); if (line.length > 1) L.polyline(line, { color: "#555", weight: 3, opacity: .75, dashArray: "7 8" }).addTo(group); ps.forEach((p, i) => { const marker = L.circleMarker([p.lat, p.lng], { radius: p.id === placeId ? 9 : 6, color: "#fff", weight: 2, fillColor: p.id === placeId ? "#222" : "#777", fillOpacity: 1 }).addTo(group); marker.bindTooltip(`${i + 1}. ${p.name}`, { permanent: true, direction: "top", className: "xe-map-label" }); marker.on("click", () => setPlaceId(p.id)); }); if (line.length) map.fitBounds(L.latLngBounds(line), { padding: [42, 42], maxZoom: 8 }); }, [selectedDay, placeId, mapReady]);
  const ids = days[selectedDay - 1].placeIds, idx = ids.indexOf(placeId); return <main className="screen map-screen"><Topbar /><header className="map-controls"><div><small>REAL MAP · OPENSTREETMAP</small><h1>路线与地点</h1></div><select value={selectedDay} onChange={e => selectDay(Number(e.target.value))}>{days.map(d => <option key={d.day} value={d.day}>Day {String(d.day).padStart(2, "0")}</option>)}</select></header><div className="map-canvas" ref={mapNode}><div className="map-loading">地图加载中…</div></div><section className="place-sheet"><header><div><small>DAY {selectedDay} · {selectedPlace.en}</small><h2>{selectedPlace.name}</h2></div><button onClick={() => openDay(selectedDay)}>打开当天 →</button></header><p>{selectedPlace.context}</p><div><span><small>上一站</small>{idx > 0 ? places.find(p => p.id === ids[idx - 1])?.name : "—"}</span><span><small>下一站</small>{idx >= 0 && idx < ids.length - 1 ? places.find(p => p.id === ids[idx + 1])?.name : "—"}</span></div>{selectedPlace.confirmationId && <FreshnessBadge type={preparations.find(p => p.id === selectedPlace.confirmationId)?.freshness || "today"} />}</section></main>;
}

function Inspire({ back, initialDay=3 }: { back: () => void; initialDay?:number }) {
  const [mode, setMode] = useState<"style" | "photo">("style"),[selected,setSelected]=useState(initialDay); const day=days[selected-1],visual=visualFor(day);
  return <main className="day3-expanded day3-style-full">
    <header className="day3-expanded-nav"><button onClick={back}>← 返回</button><span>INSPIRE · {day.date}</span></header>
    <section className="day3-style-landscape"><LandscapePhotoBlock source={visual.secondary} priority/><div><small>WHAT TO WEAR / {String(day.day).padStart(2,"0")}</small><h1>今天怎么穿</h1><p>{day.route.join(" → ")}</p></div></section>
    <nav className="journal-inspire-days" aria-label="选择日期">{days.map(d=><button key={d.day} onClick={()=>setSelected(d.day)} className={selected===d.day?"active":""}>{String(d.day).padStart(2,"0")}</button>)}</nav>
    <nav className="day3-inspire-switch" aria-label="灵感类型"><button className={mode === "style" ? "active" : ""} onClick={() => setMode("style")}>穿搭参考</button><button className={mode === "photo" ? "active" : ""} onClick={() => setMode("photo")}>照片参考</button></nav>
    {mode === "style" ? <>
      <div className="day3-style-conditions"><span><small>环境</small>{day.route.at(-1)}</span><span><small>车程</small>{day.drive||"自由安排"}</span><span><small>海拔</small>{visual.altitude}</span></div>
      <div className="day3-outfit-scroll" aria-label="Day 03 穿搭照片，左右滑动">
        <figure><LandscapePhotoBlock source={visual.outfit}/><figcaption><b>{visual.outfitCopy}</b><span>{visual.outfitNote}</span></figcaption></figure>
        <figure><LandscapePhotoBlock source={visual.hero}/><figcaption><b>先看今天的环境</b><span>外层便于穿脱，鞋以当天步行量和防滑为准。</span></figcaption></figure>
      </div>
      <p className="day3-swipe-note">SWIPE <i /> 参考图</p>
      <section className="day3-wear-facts"><div><small>上身</small><p>长袖或薄针织；怕冷加薄抓绒。最外层选防风外套或冲锋衣。</p></div><div><small>下身 / 鞋</small><p>约 5 小时坐车，下装不要勒腰。鞋底防滑、走熟优先。</p></div><div><small>配件</small><p>防晒 + 墨镜。风大时，能固定的围巾和帽子更实用。</p></div></section>
    </> : <><div className="day3-photo-board">{photoReferences.map((ref, i) => <figure key={ref.media} className={`photo-${i + 1}`}><Media id={ref.media} sizes="80vw" />{ref.annotation && <figcaption>{ref.annotation}</figcaption>}</figure>)}</div><p className="day3-swipe-note">SWIPE <i /> visual references</p></>}
  </main>;
}

function Pack({ back }: { back: () => void }) {
  const [filter,setFilter]=useState<"all"|"open"|"done">("all"),{value,toggle}=useStoredRecord("xe-packing-v2"); const items=helperCategories.flatMap(category=>category.items.map(([id,label])=>[id,label,"recommended"] as const)),done=items.filter(([id])=>value[id]).length,visible=items.filter(([id])=>filter==="all"||(filter==="done"?value[id]:!value[id]));
  return <main className="day3-expanded day3-pack-full">
    <header className="day3-expanded-nav"><button onClick={back}>← 返回</button><span>PREP · 12—18 SEP</span></header>
    <section className="day3-pack-intro"><div><small>BEFORE THE TRIP</small><h1>行前准备</h1><p>北疆 9 月 · 温差、风、长车程与干燥</p></div><strong>{done}<i>/</i>{items.length}</strong><Progress done={done} total={items.length} /></section>
    <section className="day3-luggage-context"><small>九月北疆</small><h2>山区早晚冷，白天日照仍然明显。</h2><p>长袖、针织或薄抓绒、防风外套、走熟的鞋；长车程把水、纸巾、零食和充电宝留在身边。</p></section>
    <nav className="day3-pack-filter"><button onClick={() => setFilter("all")} className={filter === "all" ? "active" : ""}>全部</button><button onClick={() => setFilter("open")} className={filter === "open" ? "active" : ""}>未完成</button><button onClick={() => setFilter("done")} className={filter === "done" ? "active" : ""}>已完成</button></nav>
    <section className="day3-pack-list">{visible.map(([id, label, level]) => <button key={id} className={value[id] ? "done" : ""} onClick={() => toggle(id)}><i>{value[id] ? "✓" : ""}</i><span>{label}</span><small>{level === "required" ? "必带" : level === "recommended" ? "建议" : "可选"}</small></button>)}</section>
    <p className="day3-pack-footnote">清单只保存在当前设备，不需要登录，也不会上传个人信息。</p>
  </main>;
}

export function Site() { const [view,setView]=useState<View>("home"),[day,setDay]=useState<number|null>(null),[mapDay,setMapDay]=useState(3),[mapPlace,setMapPlace]=useState<string|undefined>(),[qaWidth,setQaWidth]=useState<number|null>(null);useEffect(()=>{validateMediaLibrary();const query=new URLSearchParams(location.search),w=Number(query.get("viewport"));setQaWidth([375,390,393,430].includes(w)?w:null);if(query.get("day")){const d=Number(query.get("day"));if(d>=1&&d<=7)setDay(d)}else if(query.get("view")){const v=query.get("view") as View;if(nav.some(n=>n.id===v))setView(v)}if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>{})},[]);useEffect(()=>window.scrollTo({top:0,behavior:"instant"}),[view,day]);const change=(v:View)=>{setDay(null);setView(v)},goPack=(_:PackLayer)=>change("pack"),goMap=(n:number,p?:string)=>{setMapDay(n);setMapPlace(p);change("map")},share=async()=>{const data={title:"THE XINJIANG EDIT",text:"北疆秋日旅行指南",url:location.href};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(location.href);alert("链接已复制")}}catch{}},style=qaWidth?{width:`${qaWidth}px`}:undefined,cls=qaWidth?"qa-mobile":"";if(day)return <AppShell className={cls} style={style}><DayWorkspace dayNumber={day} close={()=>change("trip")} goMap={goMap} goPack={goPack} goInspire={()=>change("inspire")}/></AppShell>;return <AppShell className={cls} style={style}>{view==="home"&&<Home openDay={setDay} goPack={goPack} goMap={goMap} goTrip={()=>change("trip")} share={share}/>} {view==="trip"&&<TripPrototype openDay={setDay} goHome={()=>change("home")}/>} {view==="map"&&<RealMap selectedDay={mapDay} selectedPlaceId={mapPlace} selectDay={n=>{setMapDay(n);setMapPlace(undefined)}} openDay={setDay}/>} {view==="inspire"&&<Inspire back={()=>change("home")}/>} {view==="pack"&&<Pack back={()=>change("home")}/>}<JournalBottomNav active={view} change={change} share={share}/></AppShell>}
