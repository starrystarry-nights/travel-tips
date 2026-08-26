"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { mediaById, validateMediaLibrary } from "@/data/media";
import { days, packLayers, photoReferences, places, preparations, styleReferences, tripStart, type Freshness, type Preparation, type Stage, type TripDay } from "@/data/product";
import { AppShell, ImageFrame } from "./primitives";
import { TripPrototype } from "./trip-prototype";

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

function Home({ openDay, goPack, goMap }: { openDay: (n: number) => void; goPack: (l: PackLayer) => void; goMap: (n: number) => void }) {
  const now = useMemo(() => new Date(), []), state = getDateState(now); const { value: packed, toggle } = useStoredRecord("xe-packing-v2"); const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const allItems = helperCategories.flatMap(category => category.items); const packedCount = allItems.filter(([id]) => packed[id]).length; const currentDay = state.mode === "during" ? days[(state.currentDay ?? 1) - 1] : days[0];
  const resetPacking = () => { if (window.confirm("确定要重置所有勾选状态吗？")) { localStorage.setItem("xe-packing-v2", "{}"); location.reload(); } };
  return <main className="screen helper-home">
    <header className="helper-header"><span className="helper-mountain" aria-hidden="true">⌁</span><div><h1>北疆旅行小助手</h1><p>9月12日出发 · 打包清单与行前提醒</p></div></header>
    <section className="helper-countdown" aria-label="旅行倒计时"><strong>{state.mode === "before" ? state.daysToGo : state.mode === "during" ? `D${currentDay.day}` : "✓"}</strong><span>{state.mode === "before" ? "天后出发" : state.mode === "during" ? currentDay.route.join(" → ") : "行程已结束"}</span><small>目标日期：2026年9月12日</small></section>
    <section className="helper-weather" aria-label="九月北疆气候参考"><div><b>20–25℃</b><span>白天常见</span></div><div><b>&lt;10℃</b><span>山区夜间</span></div><div><b>大</b><span>昼夜温差</span></div></section>
    <section className="helper-trip-link"><button onClick={() => openDay(currentDay.day)}><span><small>{state.mode === "during" ? `DAY ${String(currentDay.day).padStart(2, "0")}` : "7 DAY ROUTE"}</small><b>{state.mode === "during" ? currentDay.route.join(" → ") : "查看完整行程"}</b></span><i>→</i></button><button onClick={() => goMap(3)} aria-label="查看路线地图">地图</button></section>
    <section className="helper-packing"><header><div><h2>打包清单</h2><span>{packedCount}/{allItems.length}</span></div><div className="helper-progress"><i style={{ width: `${allItems.length ? packedCount / allItems.length * 100 : 0}%` }} /></div></header>
      <div className="helper-categories">{helperCategories.map(category => { const done = category.items.filter(([id]) => packed[id]).length; const isCollapsed = collapsed[category.id]; return <section className={`helper-category ${isCollapsed ? "collapsed" : ""}`} key={category.id}><button className="helper-category-head" onClick={() => setCollapsed(old => ({ ...old, [category.id]: !old[category.id] }))} aria-expanded={!isCollapsed}><span><i>{category.icon}</i><b>{category.title}</b></span><span>{done}/{category.items.length} <em>⌄</em></span></button>{!isCollapsed && <div>{category.items.map(([id, label, note]) => <button className={`helper-check ${packed[id] ? "checked" : ""}`} key={id} onClick={() => toggle(id)}><i>{packed[id] ? "✓" : ""}</i><span>{label}</span>{note && <small>{note}</small>}</button>)}</div>}</section>; })}</div>
    </section>
    <section className="helper-tips"><h2>行前小提示</h2><ul><li>北疆昼夜温差大，防风外层和轻保暖层都需要。</li><li>喀纳斯、禾木、白哈巴早晚更冷，厚外套不要放进不便取用的大件行李。</li><li>紫外线强，防晒霜、墨镜和帽子随身。</li><li>Day 02、05、06 车程较长，水、零食、纸巾和充电宝放身边。</li><li>出发前一周再看天气；道路、预约和景区状态按提示确认。</li></ul></section>
    <section className="helper-actions"><button onClick={() => goPack("day")}>检查 Day 03 当天随身</button><button onClick={resetPacking}>重置清单</button></section>
  </main>;
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

function DayWorkspace({ dayNumber, close, goMap, goPack, goInspire }: { dayNumber: number; close: () => void; goMap: (n: number, place?: string) => void; goPack: (l: PackLayer) => void; goInspire: () => void }) {
  const day = days[dayNumber - 1], { value, toggle } = useStoredRecord("xe-preparation-v1"); if (dayNumber === 3) return <JournalDayThree close={close} goMap={goMap} goPack={goPack} goInspire={goInspire} />; return <main className={`day-workspace day-${day.day}`}><Topbar title={`DAY ${String(day.day).padStart(2, "0")}`} back={close} /><header className="day-overview"><div><time>{day.date}</time><h1>{day.route.join(" → ")}</h1><p>{[day.distance, day.drive, `住 ${day.sleep}`].filter(Boolean).join(" · ")}</p></div><button onClick={() => goMap(day.day)}>地图</button></header><Weather day={day} /><section className="stage-flow">{day.stages.map(stage => <StageBlock key={stage.id} stage={stage} prepDone={value} togglePrep={toggle} goMap={place => goMap(day.day, place)} goPack={goPack} goInspire={goInspire} />)}</section></main>;
}

function RealMap({ selectedDay, selectedPlaceId, selectDay, openDay }: { selectedDay: number; selectedPlaceId?: string; selectDay: (n: number) => void; openDay: (n: number) => void }) {
  const mapNode = useRef<HTMLDivElement>(null), mapRef = useRef<any>(null), layerRef = useRef<any>(null); const [placeId, setPlaceId] = useState(selectedPlaceId || days[selectedDay - 1].placeIds[0]), [mapReady, setMapReady] = useState(0); const selectedPlace = places.find(p => p.id === placeId) || places[0];
  useEffect(() => { if (selectedPlaceId) setPlaceId(selectedPlaceId); }, [selectedPlaceId]);
  useEffect(() => { if (!days[selectedDay - 1].placeIds.includes(placeId)) setPlaceId(days[selectedDay - 1].placeIds[0]); }, [selectedDay, placeId]);
  useEffect(() => { const load = async () => { if (!document.querySelector('link[data-leaflet]')) { const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; link.dataset.leaflet = "true"; document.head.appendChild(link); } if (!window.L) await new Promise<void>((resolve, reject) => { const s = document.createElement("script"); s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; s.onload = () => resolve(); s.onerror = () => reject(); document.head.appendChild(s); }); if (!mapNode.current || mapRef.current || !window.L) return; const L = window.L, map = L.map(mapNode.current, { zoomControl: false }).setView([47, 87.2], 5); mapRef.current = map; L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 16, attribution: "© OpenStreetMap" }).addTo(map); L.control.zoom({ position: "topright" }).addTo(map); setMapReady(x => x + 1); }; load().catch(() => {}); return () => { mapRef.current?.remove(); mapRef.current = null; }; }, []);
  useEffect(() => { const map = mapRef.current, L = window.L; if (!map || !L) return; layerRef.current?.remove(); const group = L.layerGroup().addTo(map); layerRef.current = group; const day = days[selectedDay - 1], ps = day.placeIds.map(id => places.find(p => p.id === id)!).filter(Boolean), line = ps.map(p => [p.lat, p.lng]); if (line.length > 1) L.polyline(line, { color: "#555", weight: 3, opacity: .75, dashArray: "7 8" }).addTo(group); ps.forEach((p, i) => { const marker = L.circleMarker([p.lat, p.lng], { radius: p.id === placeId ? 9 : 6, color: "#fff", weight: 2, fillColor: p.id === placeId ? "#222" : "#777", fillOpacity: 1 }).addTo(group); marker.bindTooltip(`${i + 1}. ${p.name}`, { permanent: true, direction: "top", className: "xe-map-label" }); marker.on("click", () => setPlaceId(p.id)); }); if (line.length) map.fitBounds(L.latLngBounds(line), { padding: [42, 42], maxZoom: 8 }); }, [selectedDay, placeId, mapReady]);
  const ids = days[selectedDay - 1].placeIds, idx = ids.indexOf(placeId); return <main className="screen map-screen"><Topbar /><header className="map-controls"><div><small>REAL MAP · OPENSTREETMAP</small><h1>路线与地点</h1></div><select value={selectedDay} onChange={e => selectDay(Number(e.target.value))}>{days.map(d => <option key={d.day} value={d.day}>Day {String(d.day).padStart(2, "0")}</option>)}</select></header><div className="map-canvas" ref={mapNode}><div className="map-loading">地图加载中…</div></div><section className="place-sheet"><header><div><small>DAY {selectedDay} · {selectedPlace.en}</small><h2>{selectedPlace.name}</h2></div><button onClick={() => openDay(selectedDay)}>打开当天 →</button></header><p>{selectedPlace.context}</p><div><span><small>上一站</small>{idx > 0 ? places.find(p => p.id === ids[idx - 1])?.name : "—"}</span><span><small>下一站</small>{idx >= 0 && idx < ids.length - 1 ? places.find(p => p.id === ids[idx + 1])?.name : "—"}</span></div>{selectedPlace.confirmationId && <FreshnessBadge type={preparations.find(p => p.id === selectedPlace.confirmationId)?.freshness || "today"} />}</section></main>;
}

function Inspire({ back }: { back: () => void }) {
  const [mode, setMode] = useState<"style" | "photo">("style");
  return <main className="day3-expanded day3-style-full">
    <header className="day3-expanded-nav"><button onClick={back}>← DAY 03</button><span>SEP.14</span></header>
    <section className="day3-style-landscape"><EditorialPhoto src={dayThreePhotos.road} alt="阿禾公路沿途雪山与秋林环境" priority /><div><small>WHAT TO WEAR / 03</small><h1>今天怎么穿</h1><p>阿禾公路 → 禾木</p></div></section>
    <nav className="day3-inspire-switch" aria-label="灵感类型"><button className={mode === "style" ? "active" : ""} onClick={() => setMode("style")}>穿搭参考</button><button className={mode === "photo" ? "active" : ""} onClick={() => setMode("photo")}>照片参考</button></nav>
    {mode === "style" ? <>
      <div className="day3-style-conditions"><span><small>体感</small>早晚偏冷，风明显</span><span><small>车程</small>约 5 小时</span><span><small>中午</small>有太阳会暖一些</span></div>
      <div className="day3-outfit-scroll" aria-label="Day 03 穿搭照片，左右滑动">
        <figure><EditorialPhoto src={dayThreePhotos.wearOne} alt="秋季山地防风外套与围巾穿搭参考" /><figcaption><b>防风外套 + 薄针织 + 宽松长下装</b><span>早上穿完整；中午热时脱外层。</span></figcaption></figure>
        <figure><EditorialPhoto src={dayThreePhotos.wearTwo} alt="秋季山地轻量叠穿与帽子穿搭参考" /><figcaption><b>轻薄长袖 + 针织中层 + 好走的鞋</b><span>进禾木后温度更低，外套别放大箱里。</span></figcaption></figure>
      </div>
      <p className="day3-swipe-note">SWIPE <i /> 参考图</p>
      <section className="day3-wear-facts"><div><small>上身</small><p>长袖或薄针织；怕冷加薄抓绒。最外层选防风外套或冲锋衣。</p></div><div><small>下身 / 鞋</small><p>约 5 小时坐车，下装不要勒腰。鞋底防滑、走熟优先。</p></div><div><small>配件</small><p>防晒 + 墨镜。风大时，能固定的围巾和帽子更实用。</p></div></section>
    </> : <><div className="day3-photo-board">{photoReferences.map((ref, i) => <figure key={ref.media} className={`photo-${i + 1}`}><Media id={ref.media} sizes="80vw" />{ref.annotation && <figcaption>{ref.annotation}</figcaption>}</figure>)}</div><p className="day3-swipe-note">SWIPE <i /> visual references</p></>}
  </main>;
}

function Pack({ back }: { back: () => void }) {
  const [filter, setFilter] = useState<"all" | "open" | "done">("all"); const { value, toggle } = useStoredRecord("xe-packing-v2"), items = packLayers.day, done = items.filter(([id]) => value[id]).length, visible = items.filter(([id]) => filter === "all" || (filter === "done" ? value[id] : !value[id]));
  return <main className="day3-expanded day3-pack-full">
    <header className="day3-expanded-nav"><button onClick={back}>← DAY 03</button><span>09.14</span></header>
    <section className="day3-pack-intro"><div><small>DAY 03 · ON YOU</small><h1>当天随身</h1><p>阿勒泰 → 阿禾公路 → 禾木</p></div><strong>{done}<i>/</i>{items.length}</strong><Progress done={done} total={items.length} /></section>
    <section className="day3-luggage-context"><small>进入禾木前</small><h2>大件行李可能暂时不方便拿取。</h2><p>提前拿出今晚与明早的衣物、洗漱用品、充电和常用药。</p></section>
    <nav className="day3-pack-filter"><button onClick={() => setFilter("all")} className={filter === "all" ? "active" : ""}>全部</button><button onClick={() => setFilter("open")} className={filter === "open" ? "active" : ""}>未完成</button><button onClick={() => setFilter("done")} className={filter === "done" ? "active" : ""}>已完成</button></nav>
    <section className="day3-pack-list">{visible.map(([id, label, level]) => <button key={id} className={value[id] ? "done" : ""} onClick={() => toggle(id)}><i>{value[id] ? "✓" : ""}</i><span>{label}</span><small>{level === "required" ? "必带" : level === "recommended" ? "建议" : "可选"}</small></button>)}</section>
    <p className="day3-pack-footnote">白天日照仍然明显；进入阿勒泰山区后，早晚温差与风更需要提前准备。</p>
  </main>;
}

export function Site() { const [view, setView] = useState<View>("home"), [day, setDay] = useState<number | null>(3), [mapDay, setMapDay] = useState(3), [mapPlace, setMapPlace] = useState<string | undefined>(), [qaWidth, setQaWidth] = useState<number | null>(null); useEffect(() => { validateMediaLibrary(); const query = new URLSearchParams(location.search), requestedWidth = Number(query.get("viewport")); setQaWidth([375, 390, 393, 430].includes(requestedWidth) ? requestedWidth : null); if (query.get("proof") === "trip") { setDay(null); setView("trip"); } else if (query.get("home") === "1") { setDay(null); setView("home"); } else if (query.get("detail") === "pack") { setDay(null); setView("pack"); } else if (query.get("detail") === "style") { setDay(null); setView("inspire"); } else if (query.get("day")) { const requestedDay = Number(query.get("day")); if (requestedDay >= 1 && requestedDay <= 7) setDay(requestedDay); } if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {}); }, []); useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [view, day]); const change = (v: View) => { setDay(null); setView(v); }, goPack = (_l: PackLayer) => { setDay(null); setView("pack"); }, goMap = (n: number, place?: string) => { setMapDay(n); setMapPlace(place); setDay(null); setView("map"); }, returnDayThree = () => { setView("home"); setDay(3); }, shellStyle = qaWidth ? { width: `${qaWidth}px` } : undefined, shellClass = qaWidth ? "qa-mobile" : ""; if (day) return <AppShell className={shellClass} style={shellStyle}><DayWorkspace dayNumber={day} close={() => { setDay(null); setView("trip"); }} goMap={goMap} goPack={goPack} goInspire={() => { setDay(null); setView("inspire"); }} /></AppShell>; return <AppShell className={shellClass} style={shellStyle}>{view === "home" && <Home openDay={setDay} goPack={goPack} goMap={goMap} />}{view === "trip" && <TripPrototype openDay={setDay} goHome={() => change("home")} />}{view === "map" && <RealMap selectedDay={mapDay} selectedPlaceId={mapPlace} selectDay={n => { setMapDay(n); setMapPlace(undefined); }} openDay={setDay} />}{view === "inspire" && <Inspire back={returnDayThree} />}{view === "pack" && <Pack back={returnDayThree} />}{!(["trip", "inspire", "pack"] as View[]).includes(view) && <BottomNav view={view} change={change} />}</AppShell>; }
