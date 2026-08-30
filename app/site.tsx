"use client";
import { assetUrl, shareUrl } from "./assets";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { mediaById, validateMediaLibrary } from "@/data/media";
import {
  days,
  packLayers,
  photoReferences,
  places,
  preparations,
  styleReferences,
  tripStart,
  type Freshness,
  type Preparation,
  type Stage,
  type TripDay,
} from "@/data/product";
import { AppShell, ImageFrame } from "./primitives";
import { TripPrototype } from "./trip-prototype";
import { OfflineTools, OfflineNotice, useOfflineRegistration } from "./offline-tools";
import { OutfitSheetContent } from "./outfit-sheet";
import { dayVisuals, visualFor } from "@/data/experience";
import {
  ArrowIcon,
  BottomNav as JournalBottomNav,
  ChecklistPreview,
  DayHero,
  EditorialSection,
  InfoRail,
  LandscapePhotoBlock,
  OutfitPreview,
  ShareArrow,
  Timeline,
} from "./day-components";

type View = "home" | "trip" | "map" | "inspire" | "pack";
type PackLayer = keyof typeof packLayers;
type WeatherState = {
  status: "idle" | "loading" | "ready" | "unavailable";
  min?: number;
  max?: number;
  feelsMin?: number;
  feelsMax?: number;
  rain?: number;
  wind?: number;
  uv?: number;
  humidity?: number;
  message?: string;
};
declare global {
  interface Window {
    L?: any;
  }
}

const nav: { id: View; label: string }[] = [
  { id: "home", label: "首页" },
  { id: "trip", label: "行程" },
  { id: "map", label: "地图" },
  { id: "inspire", label: "灵感" },
  { id: "pack", label: "打包" },
];

function Media({
  id,
  priority = false,
  sizes = "100vw",
  className = "",
}: {
  id: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const media = mediaById.get(id);
  if (!media)
    return (
      <ImageFrame className={`missing ${className}`}>
        <span />
      </ImageFrame>
    );
  return (
    <ImageFrame className={className}>
      <Image
        src={assetUrl(media.src)}
        alt={media.alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized
      />
    </ImageFrame>
  );
}

function useStoredRecord(key: string) {
  const [value, setValue] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      setValue(JSON.parse(localStorage.getItem(key) || "{}"));
    } catch {
      setValue({});
    }
  }, [key]);
  const toggle = (id: string) =>
    setValue((old) => {
      const next = { ...old, [id]: !old[id] };
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  return { value, toggle };
}

function useStoredText(key: string) {
  const [value, setValue] = useState("");
  useEffect(() => {
    setValue(localStorage.getItem(key) || "");
  }, [key]);
  const save = (next: string) => {
    setValue(next);
    localStorage.setItem(key, next);
  };
  return { value, save };
}

function DailyPlaceNotes({ day }: { day: number }) {
  const { value, save } = useStoredText(`xe-day-${day}-places-v1`);
  return (
    <div className="publication-notes">
      <p>把临时想到的地点、餐厅、机位或集合信息记在这里。只保存在你当前使用的设备中。</p>
      <label htmlFor={`day-${day}-place-notes`}>我的地点备注</label>
      <textarea
        id={`day-${day}-place-notes`}
        value={value}
        onChange={(event) => save(event.target.value)}
        placeholder={"例如：\n想去的咖啡馆｜地址或关键词\n临时停车点｜司机当天确认\n拍照机位｜日落前到"}
      />
      <small>{value ? "已自动保存" : "输入后自动保存"}</small>
    </div>
  );
}

type PersonalImage = { id: string; day: number; kind: "style" | "photo"; src: string; caption: string };

function openImageDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("xe-personal-images", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("images")) db.createObjectStore("images", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function imageFileToDataUrl(file: File) {
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const image = document.createElement("img");
  image.src = raw;
  await image.decode();
  const scale = Math.min(1, 1800 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.86);
}

function usePersonalImages(day: number, kind: "style" | "photo") {
  const [items, setItems] = useState<PersonalImage[]>([]);
  const [busy, setBusy] = useState(false);
  const refresh = async () => {
    const db = await openImageDb();
    const request = db.transaction("images", "readonly").objectStore("images").getAll();
    request.onsuccess = () => setItems((request.result as PersonalImage[]).filter(item => item.day === day && item.kind === kind));
  };
  useEffect(() => { refresh().catch(() => {}); }, [day, kind]);
  const put = async (item: PersonalImage) => {
    const db = await openImageDb();
    await new Promise<void>((resolve, reject) => {
      const request = db.transaction("images", "readwrite").objectStore("images").put(item);
      request.onsuccess = () => resolve(); request.onerror = () => reject(request.error);
    });
    await refresh();
  };
  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) await put({ id: crypto.randomUUID(), day, kind, src: await imageFileToDataUrl(file), caption: "" });
    } finally { setBusy(false); }
  };
  const remove = async (id: string) => {
    const db = await openImageDb();
    await new Promise<void>((resolve, reject) => {
      const request = db.transaction("images", "readwrite").objectStore("images").delete(id);
      request.onsuccess = () => resolve(); request.onerror = () => reject(request.error);
    });
    await refresh();
  };
  return { items, busy, addFiles, put, remove };
}

function PersonalInspirationGallery({ day, kind }: { day: number; kind: "style" | "photo" }) {
  const { items, busy, addFiles, put, remove } = usePersonalImages(day, kind);
  return <section className="personal-inspiration">
    <label className="personal-upload">
      <span>{busy ? "正在处理…" : "＋ 添加图片"}</span>
      <small>支持一次选择多张，只保存在当前设备</small>
      <input type="file" accept="image/*" multiple disabled={busy} onChange={event => { addFiles(event.target.files); event.currentTarget.value = ""; }}/>
    </label>
    {items.length === 0 ? <div className="personal-empty"><b>这里还没有图片</b><p>上传你真正喜欢的{kind === "style" ? "穿搭" : "拍照"}参考，不再显示系统挑选的图。</p></div> : <div className="personal-image-grid">{items.map(item => <article key={item.id}><img src={item.src} alt={item.caption || "个人灵感图片"}/><div><input value={item.caption} placeholder="添加地点、穿搭或拍照备注" onChange={event => put({ ...item, caption: event.target.value })}/><label><span>替换</span><input type="file" accept="image/*" onChange={async event => { const file = event.target.files?.[0]; if (file) await put({ ...item, src: await imageFileToDataUrl(file) }); }}/></label><button onClick={() => remove(item.id)}>删除</button></div></article>)}</div>}
  </section>;
}

function getDateState(now = new Date()) {
  const start = new Date(tripStart),
    end = new Date("2026-09-19T00:00:00+08:00");
  const daysToGo = Math.ceil((start.getTime() - now.getTime()) / 86400000);
  if (now < start) return { mode: "before" as const, daysToGo };
  if (now >= end) return { mode: "after" as const, daysToGo: 0 };
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
  }).format(now);
  const current = days.find((d) => d.iso === iso);
  return {
    mode: "during" as const,
    daysToGo: 0,
    currentDay: current?.day ?? 1,
  };
}

function prepActive(
  item: Preparation,
  now: Date,
  state: ReturnType<typeof getDateState>,
) {
  if (item.window === "available") return true;
  if (item.window === "not-open") return false;
  if (item.window === "today")
    return state.mode === "during" && state.currentDay === item.day;
  const diff = Math.ceil(
    (new Date(tripStart).getTime() - now.getTime()) / 86400000,
  );
  return item.window === "48h"
    ? diff <= 2 && diff >= 0
    : item.window === "day-before"
      ? diff <= 1 && diff >= 0
      : false;
}

function FreshnessBadge({ type }: { type: Freshness }) {
  return (
    <span className={`freshness ${type}`}>
      {type === "stable"
        ? "稳定信息"
        : type === "before"
          ? "出发前确认"
          : "当天确认"}
    </span>
  );
}
function Topbar({ title, back }: { title?: string; back?: () => void }) {
  return (
    <header className="topbar">
      {back ? (
        <button onClick={back} aria-label="返回">
          <ArrowIcon direction="back" />
        </button>
      ) : (
        <span className="brand-mark">XE</span>
      )}
      <div>
        <b>{title || "THE XINJIANG EDIT"}</b>
        <small>北疆秋日旅行指南</small>
      </div>
      <time>12—18 SEP</time>
    </header>
  );
}
function BottomNav({
  view,
  change,
}: {
  view: View;
  change: (v: View) => void;
}) {
  return (
    <nav className="basic-nav" aria-label="主要导航">
      {nav.map((item) => (
        <button
          key={item.id}
          aria-current={view === item.id ? "page" : undefined}
          onClick={() => change(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
function Progress({ done, total }: { done: number; total: number }) {
  return (
    <div className="progress">
      <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      <small>
        {done} / {total}
      </small>
    </div>
  );
}

const helperCategories = [
  {
    id: "clothes",
    title: "衣物",
    items: [
      ["base-short", "短袖或背心 ×1（城市 / 车内打底）"],
      ["long-sleeve", "长袖打底 ×3（至少 1 件速干）"],
      ["pants", "宽松长裤 ×2"],
      ["thermal-pants", "保暖打底裤 ×1（禾木、喀纳斯备用）"],
      ["fleece-thin", "薄抓绒或针织中层 ×1"],
      ["fleece-thick", "厚抓绒 / 轻薄羽绒 ×1"],
      ["shell", "防风防雨外套 ×1"],
      ["underwear", "贴身衣物 ×7（或按洗衣计划减少）"],
      ["socks", "袜子 ×7（至少 2 双稍厚）"],
      ["shoes", "走熟、防滑、可久走的鞋 ×1"],
      ["warm-hat", "能固定的帽子"],
      ["scarf", "围巾 / 脖套"],
    ],
  },
  {
    id: "meds",
    title: "药品包",
    items: [
      ["motion", "晕车药（长车程提前服用）"],
      ["stomach", "蒙脱石散 / 肠胃药"],
      ["cold", "感冒药"],
      ["ibuprofen", "布洛芬等个人常用止痛药"],
      ["bandage", "创口贴 / 防磨脚贴"],
      ["eye-drops", "眼药水"],
      ["personal-meds", "个人常用药"],
    ],
  },
  {
    id: "care",
    title: "防晒与干燥",
    items: [
      ["sun", "防晒霜"],
      ["sun-mask", "防晒口罩"],
      ["sunglasses", "墨镜"],
      ["lip", "润唇膏（随身）"],
      ["moisturizer", "面霜 / 身体乳"],
      ["skincare", "护肤品旅行装 + 密封袋"],
      ["mask", "面膜"],
      ["hand-cream", "护手霜"],
    ],
  },
  {
    id: "daily",
    title: "长车程小物",
    items: [
      ["day-bag", "可折叠轻便小包"],
      ["water-bottle", "保温杯 / 水杯"],
      ["tissue", "纸巾 / 湿巾"],
      ["snacks", "少量方便吃的零食"],
      ["trash-bags", "垃圾袋 / 脏衣袋"],
      ["neck-pillow", "颈枕或腰靠（两段长车程按需）"],
      ["warm-layer-bag", "可装外套的轻便收纳袋"],
    ],
  },
  {
    id: "important",
    title: "重要物品",
    items: [
      ["id", "身份证"],
      ["phone", "手机"],
      ["earphones", "耳机"],
      ["phone-cable", "充电器与充电线"],
      ["power", "合规充电宝"],
      ["tickets", "交通、住宿与集合信息截图"],
      ["cash", "少量现金"],
      ["offline", "离线地图与离线内容"],
      ["camera", "相机 / 备用电池（如需）"],
    ],
  },
  {
    id: "toiletries",
    title: "洗护与收纳",
    items: [
      ["toiletries", "牙刷、牙膏与洗漱用品"],
      ["makeup", "日常化妆品"],
      ["remover", "卸妆用品"],
      ["towel", "一次性洗脸巾 / 小毛巾"],
      ["zip-bags", "密封袋（液体与管状护肤品）"],
      ["laundry", "少量洗衣液 / 洗衣片（按需）"],
    ],
  },
] as const;

function Home({
  openDay,
  goPack,
  goMap,
  goTrip,
  share,
}: {
  openDay: (n: number) => void;
  goPack: (l: PackLayer) => void;
  goMap: (n: number) => void;
  goTrip: () => void;
  share: () => void;
}) {
  const now = useMemo(() => new Date(), []),
    state = getDateState(now),
    { value: packed } = useStoredRecord("xe-packing-v2"),
    { value: prep } = useStoredRecord("xe-preparation-v1");
  const all = helperCategories.flatMap<readonly [string, string]>((c) => c.items),
    done = all.filter(([id]) => packed[id]).length,
    current =
      state.mode === "during" ? days[(state.currentDay || 1) - 1] : days[0],
    activePrep = preparations.filter(
      (p) => prepActive(p, now, state) && !prep[p.id],
    );
  return (
    <main className="journal-home">
      <section className="journal-home-scene">
        <LandscapePhotoBlock
          source={
            state.mode === "during"
              ? visualFor(current).hero
              : "/editorial/day03-hero.jpg"
          }
          priority
        />
        <header>
          <span>THE XINJIANG EDIT</span>
          <button onClick={share} className="journal-home-share">
            SHARE <ShareArrow />
          </button>
        </header>
        <div>
          <small>
            {state.mode === "before"
              ? "BEFORE THE TRIP"
              : state.mode === "during"
                ? `DAY ${String(current.day).padStart(2, "0")}`
                : "TRIP ARCHIVE"}
          </small>
          <h1>
            {state.mode === "before"
              ? `${state.daysToGo} 天后出发`
              : current.route.join(" — ")}
          </h1>
          <p>北疆秋日旅行指南 · 12—18 SEP 2026</p>
        </div>
      </section>
      <OfflineTools />
      <section className="journal-home-actions">
        <button onClick={() => openDay(current.day)}>
          <small>{state.mode === "during" ? "TODAY" : "NEXT DAY"}</small>
          <b>{current.route.join(" — ")}</b>
          <span>{current.drive || "自由活动"}　<ArrowIcon /></span>
        </button>
        <button onClick={goTrip}>
          <small>THE JOURNEY</small>
          <b>7 天路线</b>
          <span>09.13—09.17 跟团行程　<ArrowIcon /></span>
        </button>
      </section>
      <section className="journal-home-prep">
        <header>
          <small>PREPARATION</small>
          <h2>出发前准备</h2>
        </header>
        <div>
          <button onClick={() => goPack("day")}>
            <strong>
              {done}/{all.length}
            </strong>
            <span>整趟清单进度</span>
          </button>
          <button onClick={() => goMap(current.day)}>
            <strong>{activePrep.length}</strong>
            <span>当前待确认</span>
          </button>
        </div>
        {activePrep.slice(0, 2).map((p) => (
          <p key={p.id}>
            <b>{p.title}</b>
            <span>{p.freshness === "today" ? "当天确认" : "出发前确认"}</span>
          </p>
        ))}
      </section>
    </main>
  );
}

function PackMini({ open }: { open: () => void }) {
  const { value } = useStoredRecord("xe-packing-v2");
  const items = packLayers.day;
  const required = items.filter(([, , level]) => level === "required");
  const done = items.filter(([id]) => value[id]).length,
    missing = required.filter(([id]) => !value[id]).length;
  return (
    <button className="pack-mini day" onClick={open}>
      <div>
        <small>DAY 03 · ON YOU</small>
        <b>{missing ? `${missing} 件必带物品未完成` : "必带物品已完成"}</b>
      </div>
      <span>
        {done}/{items.length} <ArrowIcon />
      </span>
    </button>
  );
}

function Weather({
  day,
  variant = "default",
}: {
  day: TripDay;
  variant?: "default" | "rail";
}) {
  const [weather, setWeather] = useState<WeatherState>({ status: "idle" });
  useEffect(() => {
    const controller = new AbortController();
    const key = `xe-weather-${day.iso}-${day.day}`;
    let cached: WeatherState | undefined;
    try { cached = JSON.parse(localStorage.getItem(key) || "null") || undefined; } catch {}
    const fallback = (message: string) => {
      if (!controller.signal.aborted) setWeather(cached ? { ...cached, message: `缓存预报 · ${message}` } : { status: "unavailable", message });
    };
    if (!navigator.onLine) { fallback("离线，未更新"); return () => controller.abort(); }
    const target = new Date(`${day.iso}T12:00:00+08:00`);
    const diff = Math.ceil((target.getTime() - Date.now()) / 86400000);
    if (diff > 15 || diff < -2) {
      const availableLabel = new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "numeric", day: "numeric" }).format(new Date(target.getTime() - 15 * 86400000));
      fallback(diff > 15 ? `${availableLabel} 起可查` : "日期已过，未更新");
      return () => controller.abort();
    }
    const place = places.find((p) => p.id === day.placeIds.at(-1)) || places[0];
    setWeather(cached ? { ...cached, message: "缓存预报 · 更新中" } : { status: "loading" });
    const timeout = setTimeout(() => { fallback("更新超时"); controller.abort(); }, 10000);
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lng}&daily=temperature_2m_min,temperature_2m_max,apparent_temperature_min,apparent_temperature_max,precipitation_probability_max,wind_speed_10m_max,uv_index_max&hourly=relative_humidity_2m&timezone=Asia%2FShanghai&start_date=${day.iso}&end_date=${day.iso}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        if (controller.signal.aborted) return;
        if (typeof data.daily?.temperature_2m_min?.[0] !== "number" || typeof data.daily?.temperature_2m_max?.[0] !== "number") throw new Error();
        const humidity: number[] = (data.hourly?.relative_humidity_2m || []).filter((v: unknown) => typeof v === "number");
        const next: WeatherState = { status: "ready", min: data.daily.temperature_2m_min[0], max: data.daily.temperature_2m_max[0], feelsMin: data.daily.apparent_temperature_min[0], feelsMax: data.daily.apparent_temperature_max[0], rain: data.daily.precipitation_probability_max[0], wind: data.daily.wind_speed_10m_max[0], uv: data.daily.uv_index_max[0], humidity: humidity.length ? Math.round(humidity.reduce((a, b) => a + b, 0) / humidity.length) : undefined, message: `更新于 ${new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date())}` };
        setWeather(next);
        try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      })
      .catch(() => fallback("天气服务暂时不可用"))
      .finally(() => clearTimeout(timeout));
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [day.iso, day.day]);
  if (variant === "rail")
    return (
      <section
        className={`day3-weather-rail ${weather.status}`}
        aria-label={`Day ${day.day} 天气与体感`}
      >
        <div>
          <small>WEATHER</small>
          <b>
            {weather.status === "ready"
              ? `${weather.min}—${weather.max}°`
              : weather.status === "unavailable" ? weather.message : "—"}
          </b>
          <span>
            {weather.status === "loading"
              ? "正在获取"
              : weather.status === "ready"
                ? weather.message || "最低 / 最高"
                : "联网后可更新"}
          </span>
        </div>
        <div>
          <small>FEELS</small>
          <b>
            {weather.status === "ready"
              ? `${weather.feelsMin}—${weather.feelsMax}°`
              : weather.status === "unavailable" ? "待更新" : "—"}
          </b>
          <span>体感范围</span>
        </div>
        <div>
          <small>RAIN</small>
          <b>{weather.status === "ready" ? `${weather.rain}%` : weather.status === "unavailable" ? "待更新" : "—"}</b>
          <span>降水概率</span>
        </div>
        <div>
          <small>WIND</small>
          <b>{weather.status === "ready" ? `${weather.wind}` : weather.status === "unavailable" ? "待更新" : "—"}</b>
          <span>km/h</span>
        </div>
        <div>
          <small>HUMIDITY</small>
          <b>{weather.status === "ready" && weather.humidity != null ? `${weather.humidity}%` : weather.status === "unavailable" ? "待更新" : "—"}</b>
          <span>日均湿度</span>
        </div>
      </section>
    );
  if (weather.status !== "ready")
    return (
      <section className="weather unavailable">
        <header>
          <small>WEATHER · {day.route.at(-1)}</small>
          <b>{weather.status === "loading" ? "正在获取" : weather.message}</b>
        </header>
        <p>不使用虚构天气。临近日期后自动提供穿衣与随身建议。</p>
      </section>
    );
  const decisions = [
    weather.min! <= 10 && `最低 ${weather.min}°C：保暖层随身`,
    weather.rain! >= 35 && `降水概率 ${weather.rain}%：防雨外层与鞋`,
    weather.wind! >= 25 && `风约 ${weather.wind} km/h：固定帽子和围巾`,
    weather.uv! >= 6 && `UV ${weather.uv}：防晒与遮挡`,
  ].filter(Boolean);
  return (
    <section className="weather">
      <header>
        <small>WEATHER · {day.route.at(-1)}</small>
        <b>
          {weather.min}° — {weather.max}°
        </b>
        <span>
          降水 {weather.rain}% · 风 {weather.wind} km/h · 湿度 {weather.humidity ?? "—"}%
        </span>
      </header>
      <div>
        {decisions.length ? (
          decisions.map((x) => <p key={String(x)}>{x}</p>)
        ) : (
          <p>当前预报没有需要特别升级的装备提示。</p>
        )}
      </div>
      <small>数据：Open‑Meteo · {weather.message || "预报可能变化"}</small>
    </section>
  );
}

function StageBlock({
  stage,
  prepDone,
  togglePrep,
  goMap,
  goPack,
  goInspire,
}: {
  stage: Stage;
  prepDone: Record<string, boolean>;
  togglePrep: (id: string) => void;
  goMap: (place?: string) => void;
  goPack: (l: PackLayer) => void;
  goInspire: () => void;
}) {
  const linked =
    stage.taskIds
      ?.map((id) => preparations.find((p) => p.id === id)!)
      .filter(Boolean) || [];
  return (
    <article className={`stage stage-${stage.kind}`}>
      <div className="stage-dot" />
      <header>
        <small>{stage.kind.toUpperCase()}</small>
        <h2>{stage.title}</h2>
        {stage.meta && <span>{stage.meta}</span>}
      </header>
      {stage.facts?.map((f) => (
        <p key={f}>{f}</p>
      ))}
      {stage.placeId && (
        <button className="inline-link" onClick={() => goMap(stage.placeId)}>
          地图位置 <ArrowIcon />
        </button>
      )}
      {linked.map((item) => (
        <button
          className={`confirmation ${prepDone[item.id] ? "done" : ""}`}
          key={item.id}
          onClick={() => togglePrep(item.id)}
        >
          <div>
            <FreshnessBadge type={item.freshness} />
            <b>{item.title}</b>
            <small>{item.sourceLabel}</small>
          </div>
          <span>{prepDone[item.id] ? "已完成 ✓" : "待确认 ○"}</span>
        </button>
      ))}
      {stage.packLayer && <PackMini open={() => goPack("day")} />}
      {stage.id === "d3-ahe" && (
        <button className="inspire-inline" onClick={goInspire}>
          <Media id="style-forest-01" sizes="34vw" />
          <span>
            <small>DAY 03 · INSPIRE</small>
            <b>查看穿搭与照片参考</b><ArrowIcon />
          </span>
        </button>
      )}
      {stage.optional && <span className="optional">可选 · 不影响主行程</span>}
    </article>
  );
}

const dayThreePhotos = {
  village:
    "https://images.unsplash.com/photo-1729581173921-417f634eb443?auto=format&fit=crop&fm=jpg&q=82&w=1800",
  road: "https://images.unsplash.com/photo-1729299960640-f56dac79d34e?auto=format&fit=crop&fm=jpg&q=82&w=1800",
  valley:
    "https://images.unsplash.com/photo-1619410485950-ca49269762de?auto=format&fit=crop&fm=jpg&q=82&w=1800",
  wearOne:
    "https://images.pexels.com/photos/31613705/pexels-photo-31613705.jpeg?auto=compress&cs=tinysrgb&w=1200",
  wearTwo:
    "https://images.pexels.com/photos/16236785/pexels-photo-16236785.jpeg?auto=compress&cs=tinysrgb&w=1200",
};

function EditorialPhoto({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      className={className}
      src={assetUrl(src)}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

function DayThreeMap({ openFullMap }: { openFullMap: () => void }) {
  const node = useRef<HTMLDivElement>(null),
    map = useRef<any>(null);
  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      if (!document.querySelector("link[data-leaflet]")) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = assetUrl("/vendor/leaflet/leaflet.css");
        link.dataset.leaflet = "true";
        document.head.appendChild(link);
      }
      if (!window.L)
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector(
            "script[data-leaflet]",
          ) as HTMLScriptElement | null;
          if (existing) {
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", () => reject(), { once: true });
            return;
          }
          const script = document.createElement("script");
          script.src = assetUrl("/vendor/leaflet/leaflet.js");
          script.dataset.leaflet = "true";
          script.onload = () => resolve();
          script.onerror = () => reject();
          document.head.appendChild(script);
        });
      if (cancelled || !node.current || map.current) return;
      const L = window.L;
      const points = [
        places.find((p) => p.id === "altay")!,
        places.find((p) => p.id === "ahe")!,
        places.find((p) => p.id === "hemu")!,
      ];
      const instance = L.map(node.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false,
      });
      map.current = instance;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "© OpenStreetMap",
      }).addTo(instance);
      const latLngs = points.map((p) => [p.lat, p.lng]);
      L.polyline(latLngs, { color: "#5d715c", weight: 4, opacity: 0.9 }).addTo(
        instance,
      );
      points.forEach((p, index) =>
        L.circleMarker([p.lat, p.lng], {
          radius: index === 1 ? 7 : 5,
          color: "#f6f1e6",
          weight: 2,
          fillColor: index === 1 ? "#7f514b" : "#5d715c",
          fillOpacity: 1,
        })
          .bindTooltip(`${index + 1}. ${p.name}`, {
            permanent: true,
            direction: index === 1 ? "right" : "top",
            className: "day3-map-label",
          })
          .addTo(instance),
      );
      instance.fitBounds(latLngs, { padding: [28, 28] });
    };
    boot().catch(() => {});
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, []);
  return (
    <section className="day3-map-insert">
      <OfflineNotice />
      <div
        ref={node}
        className="day3-map-canvas"
        aria-label="阿勒泰到禾木真实路线地图"
      />
      <ol>
        <li>
          <b>阿勒泰</b>
          <small>出发</small>
        </li>
        <li>
          <b>阿禾公路</b>
          <small>景观路段 · 当天确认开放</small>
        </li>
        <li>
          <b>禾木</b>
          <small>今晚住宿</small>
        </li>
      </ol>
      <button onClick={openFullMap}>打开完整地图 <ArrowIcon /></button>
    </section>
  );
}

function DayThreeTimeline({
  prepDone,
  togglePrep,
  goPack,
}: {
  prepDone: Record<string, boolean>;
  togglePrep: (id: string) => void;
  goPack: (layer: PackLayer) => void;
}) {
  const moments = [
    {
      time: "08:00",
      label: "离开阿勒泰前",
      copy: "早餐、洗手间、水和充电完成后出发。",
      task: "ahe-road",
    },
    {
      time: "途中",
      label: "阿禾公路",
      copy: "原野 · 森林 · 草原 · 山地；停车与下车服从当天安排。",
    },
    {
      time: "午间",
      label: "长车程",
      copy: "约 5 小时。水、纸巾、充电宝留在座位附近。",
    },
    {
      time: "进入前",
      label: "整理随手要用的东西",
      copy: "大件行李可能暂时不方便拿取；提前拿出今晚与明早的衣物、洗漱、充电和常用药。",
      bag: true,
    },
    {
      time: "抵达后",
      label: "禾木",
      copy: "先吃饭、入住；旅拍、民俗馆和篝火按开放状态与体力选择。",
      task: "hemu-activity",
    },
    {
      time: "晚间",
      label: "准备明天",
      copy: "外层穿回，设备充电，准备次日衣物。",
    },
  ];
  return (
    <section className="day3-timeline">
      <header>
        <small>ITINERARY</small>
        <h2>今天行程</h2>
      </header>
      <div>
        {moments.map((moment, index) => (
          <article key={moment.label}>
            <time>{moment.time}</time>
            <i />
            <div>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{moment.label}</h3>
              <p>{moment.copy}</p>
              {moment.task && (
                <button
                  className={prepDone[moment.task] ? "checked" : ""}
                  onClick={() => togglePrep(moment.task)}
                >
                  {prepDone[moment.task] ? "已确认 ✓" : "当天确认 ○"}
                </button>
              )}
              {moment.bag && (
                <button onClick={() => goPack("day")}>查看当天随身 <ArrowIcon /></button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DayThreeDayBag({ openAll }: { openAll: () => void }) {
  const { value, toggle } = useStoredRecord("xe-packing-v2"),
    items = packLayers.day;
  const done = items.filter(([id]) => value[id]).length;
  return (
    <section className="day3-daybag">
      <header>
        <div>
          <small>DAY BAG</small>
          <h2>出门前检查</h2>
        </div>
        <span>
          {done}/{items.length}
        </span>
      </header>
      <div>
        {items.map(([id, label, level]) => (
          <button
            key={id}
            className={value[id] ? "checked" : ""}
            onClick={() => toggle(id)}
          >
            <i>{value[id] ? "✓" : ""}</i>
            <span>{label}</span>
            {level === "required" && <small>必要</small>}
          </button>
        ))}
      </div>
      <button className="day3-text-link" onClick={openAll}>
        查看完整清单 <ArrowIcon />
      </button>
    </section>
  );
}

type DayThreePanel =
  "weather" | "itinerary" | "map" | "wear" | "bag" | "road" | "stay" | "notes";

function DayThreeSheet({
  panel,
  close,
  day,
  prepDone,
  togglePrep,
  goMap,
  goPack,
  goInspire,
}: {
  panel: DayThreePanel;
  close: () => void;
  day: TripDay;
  prepDone: Record<string, boolean>;
  togglePrep: (id: string) => void;
  goMap: (n: number, place?: string) => void;
  goPack: (layer: PackLayer) => void;
  goInspire: () => void;
}) {
  const title: Record<DayThreePanel, [string, string]> = {
    weather: ["WEATHER", "天气与体感"],
    itinerary: ["ITINERARY", "今天行程"],
    map: ["ROUTE MAP", "路线地图"],
    wear: ["WHAT TO WEAR", "今天怎么穿"],
    bag: ["DAY BAG", "当天随身"],
    road: ["CHECK TODAY", "阿禾公路"],
    stay: ["TONIGHT", "今晚住宿"],
    notes: ["MY PLACES", "我的地点备注"],
  };
  return (
    <div className="day3-sheet-backdrop" role="presentation" onClick={close}>
      <section
        className={`day3-sheet day3-sheet-${panel}`}
        role="dialog"
        aria-modal="true"
        aria-label={title[panel][1]}
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <small>{title[panel][0]}</small>
            <h2>{title[panel][1]}</h2>
          </div>
          <button onClick={close} aria-label="关闭">
            ×
          </button>
        </header>
        <div className="day3-sheet-body">
          {panel === "weather" && (
            <>
              <Weather key={day.iso} day={day} />
              <p className="day3-sheet-note">
                临近 9 月 14
                日进入预报窗口后显示真实温度、体感、降水与风速；当前不填充历史平均值。
              </p>
            </>
          )}
          {panel === "itinerary" && (
            <DayThreeTimeline
              prepDone={prepDone}
              togglePrep={togglePrep}
              goPack={goPack}
            />
          )}
          {panel === "map" && (
            <DayThreeMap openFullMap={() => goMap(3, "ahe")} />
          )}
          {panel === "wear" && (
            <OutfitSheetContent day={3} visual={dayVisuals[3]} openInspiration={goInspire} />
          )}
          {panel === "bag" && <DayThreeDayBag openAll={() => goPack("day")} />}
          {panel === "road" && (
            <div className="day3-road-sheet">
              <button
                className={prepDone["ahe-road"] ? "checked" : ""}
                onClick={() => togglePrep("ahe-road")}
              >
                <i>{prepDone["ahe-road"] ? "✓" : ""}</i>
                <span>
                  <b>开放状态与通行安排</b>
                  <small>当天确认</small>
                </span>
              </button>
              <dl>
                <div>
                  <dt>距离</dt>
                  <dd>约 220 km</dd>
                </div>
                <div>
                  <dt>车程</dt>
                  <dd>约 5 h</dd>
                </div>
                <div>
                  <dt>海拔</dt>
                  <dd>禾木约 1,200 m</dd>
                </div>
              </dl>
              <p>
                道路受天气和季节影响；关闭时可能调整路线。以团队或当地当天通知为准。
              </p>
              <div className="publication-reminders">
                {visualFor(day).reminders.map((item, index) => (
                  <DailyReminder key={item} day={day.day} index={index} label={item} />
                ))}
              </div>
            </div>
          )}
          {panel === "stay" && (
            <div className="day3-stay-sheet">
              <figure>
                <EditorialPhoto
                  src={dayThreePhotos.village}
                  alt="禾木村晨雾与木屋实景"
                />
              </figure>
              <p>
                今晚住禾木。具体住宿名称、地址和联系电话尚未录入，以团队通知为准。
              </p>
              <p>
                进入禾木前，提前拿出今晚与明早要用的衣物、洗漱、充电和常用药。
              </p>
              <button onClick={() => goMap(3, "hemu")}>地图位置 <ArrowIcon /></button>
              <button onClick={() => goPack("day")}>查看当天随身 <ArrowIcon /></button>
            </div>
          )}
          {panel === "notes" && <DailyPlaceNotes day={day.day} />}
        </div>
      </section>
    </div>
  );
}

function JournalDayThree({
  close,
  goMap,
  goPack,
  goInspire,
}: {
  close: () => void;
  goMap: (n: number, place?: string) => void;
  goPack: (layer: PackLayer) => void;
  goInspire: () => void;
}) {
  const day = days[2],
    { value, toggle } = useStoredRecord("xe-preparation-v1"),
    [panel, setPanel] = useState<DayThreePanel | null>(null);
  return (
    <main className="day3-publication">
      <header className="day3-floating-nav">
        <button onClick={close}><ArrowIcon direction="back" />行程</button>
        <span>03 / 07</span>
        <time>SEP.14</time>
      </header>
      <section className="day3-opening">
        <div className="day3-hero-track" aria-label="Day 03 风景照片，左右滑动">
          <figure>
            <EditorialPhoto
              src={dayThreePhotos.village}
              alt="禾木村晨雾与群山实景"
              priority
            />
            <figcaption>01 / HEMU · PHOTO BY FISH SUN</figcaption>
          </figure>
          <figure>
            <EditorialPhoto
              src={dayThreePhotos.road}
              alt="前往禾木途中雪山与秋林实景"
            />
            <figcaption>
              02 / ON THE WAY TO HEMU · PHOTO BY SAMI CHAU
            </figcaption>
          </figure>
          <figure>
            <EditorialPhoto
              src={dayThreePhotos.valley}
              alt="新疆秋季山谷与村落实景"
            />
            <figcaption>03 / XINJIANG · PHOTO BY SAMMY WONG</figcaption>
          </figure>
        </div>
        <div className="day3-route-title">
          <small>DAY 03 · SEP.14</small>
          <h1>阿勒泰 — 阿禾公路 — 禾木</h1>
          <p>220 KM　·　约 5 H　·　住禾木</p>
        </div>
        <p className="day3-script">Altay to Hemu</p>
        <button
          className="day3-weather-trigger"
          onClick={() => setPanel("weather")}
          aria-label="查看详细天气"
        >
          <Weather key={day.iso} day={day} variant="rail" />
        </button>
      </section>
      <section className="day3-control">
        <header>
          <div>
            <small>NEXT / 08:00</small>
            <b>离开阿勒泰前</b>
          </div>
          <p>早餐、洗手间、水与充电。</p>
        </header>
        <div className="day3-quick-track">
          <button onClick={() => setPanel("road")}>
            <small>CHECK</small>
            <b>阿禾公路</b>
            <span>{value["ahe-road"] ? "已确认" : "当天确认"}</span>
          </button>
          <button onClick={() => setPanel("stay")}>
            <small>TONIGHT</small>
            <b>禾木</b>
            <span>行李提前整理</span>
          </button>
          <button onClick={() => setPanel("weather")}>
            <small>ALTITUDE</small>
            <b>约 1,200 m</b>
            <span>禾木参考</span>
          </button>
          <button onClick={() => setPanel("notes")}>
            <small>MY PLACES</small>
            <b>地点备注</b>
            <span>随时添加</span>
          </button>
        </div>
      </section>
      <nav className="day3-primary-dock" aria-label="DAY 03 功能">
        <button onClick={() => setPanel("itinerary")}>
          <b>行程</b>
          <small>ITINERARY</small>
        </button>
        <button onClick={() => setPanel("wear")}>
          <b>穿搭</b>
          <small>STYLE</small>
        </button>
        <button onClick={() => setPanel("map")}>
          <b>地图</b>
          <small>MAP</small>
        </button>
        <button onClick={() => setPanel("bag")}>
          <b>随身</b>
          <small>DAY BAG</small>
        </button>
        <button onClick={() => setPanel("notes")}>
          <b>地点</b>
          <small>MY PLACES</small>
        </button>
      </nav>
      {panel && (
        <DayThreeSheet
          panel={panel}
          close={() => setPanel(null)}
          day={day}
          prepDone={value}
          togglePrep={toggle}
          goMap={goMap}
          goPack={goPack}
          goInspire={goInspire}
        />
      )}
    </main>
  );
}

type PublicationPanel = "weather" | "itinerary" | "map" | "wear" | "bag" | "check" | "stay" | "notes";

function DailyReminder({ day, index, label }: { day: number; index: number; label: string }) {
  const { value, toggle } = useStoredRecord("xe-daily-reminders-v1");
  const id = `day-${day}-${index}`;
  return <button className={value[id] ? "checked" : ""} onClick={() => toggle(id)}><i>{value[id] ? "✓" : ""}</i><span><b>{label}</b><small>当天提醒</small></span></button>;
}

function PublicationDaySheet({ panel, day, visual, close, goMap, goPack, goInspire }: { panel: PublicationPanel; day: TripDay; visual: ReturnType<typeof visualFor>; close: () => void; goMap: (n: number, place?: string) => void; goPack: (l: PackLayer) => void; goInspire: () => void }) {
  const { value: prep, toggle: togglePrep } = useStoredRecord("xe-preparation-v1"), { value: bag, toggle: toggleBag } = useStoredRecord("xe-packing-v2");
  const tasks = day.stages.flatMap(stage => stage.taskIds || []).map(id => preparations.find(item => item.id === id)).filter(Boolean) as Preparation[];
  const labels: Record<PublicationPanel, [string, string]> = { weather: ["WEATHER", "天气与体感"], itinerary: ["ITINERARY", "今天行程"], map: ["ROUTE MAP", "路线地图"], wear: ["WHAT TO WEAR", "今天怎么穿"], bag: ["DAY BAG", "当天随身"], check: ["CHECK TODAY", "当天提醒"], stay: ["TONIGHT", day.sleep === "—" ? "返程安排" : `住 · ${day.sleep}`], notes: ["MY PLACES", "我的地点备注"] };
  return <div className="day3-sheet-backdrop" role="presentation" onClick={close}><section className={`day3-sheet day3-sheet-${panel}`} role="dialog" aria-modal="true" aria-label={labels[panel][1]} onClick={event => event.stopPropagation()}><header><div><small>{labels[panel][0]}</small><h2>{labels[panel][1]}</h2></div><button onClick={close} aria-label="关闭">×</button></header><div className="day3-sheet-body">
    {panel === "weather" && <><Weather key={day.iso} day={day}/><p className="day3-sheet-note">临近出发进入预报窗口后显示真实温度、体感、降水与风速；现在不使用虚构天气。</p></>}
    {panel === "itinerary" && <section className="day3-timeline publication-timeline"><div>{day.stages.map((stage,index)=><article key={stage.id}><time>{stage.meta || String(index + 1).padStart(2,"0")}</time><i/><div><span>{String(index + 1).padStart(2,"0")}</span><h3>{stage.title}</h3>{stage.facts?.map(fact=><p key={fact}>{fact}</p>)}{stage.placeId&&<button onClick={()=>goMap(day.day,stage.placeId)}>地图位置 <ArrowIcon /></button>}</div></article>)}</div></section>}
    {panel === "map" && <div className="publication-route-sheet"><LandscapePhotoBlock source={visual.secondary}/><ol>{day.route.map((stop,index)=><li key={`${stop}-${index}`}><span>{String(index+1).padStart(2,"0")}</span><b>{stop}</b></li>)}</ol><button className="day3-sheet-link" onClick={()=>goMap(day.day)}>打开完整地图 <ArrowIcon /></button></div>}
    {panel === "wear" && <OutfitSheetContent day={day.day} visual={visual} openInspiration={goInspire} />}
    {panel === "bag" && <div className="publication-bag">{visual.dayBag.map(([id,label,level])=><button key={id} className={bag[id]?"checked":""} onClick={()=>toggleBag(id)}><i>{bag[id]?"✓":""}</i><span>{label}</span><small>{level==="required"?"必带":level==="recommended"?"建议":"按需"}</small></button>)}<button className="day3-sheet-link" onClick={()=>goPack("day")}>查看完整清单 <ArrowIcon /></button></div>}
    {panel === "check" && <div className="day3-road-sheet publication-check"><div className="publication-reminders">{visual.reminders.map((item,index)=><DailyReminder key={item} day={day.day} index={index} label={item}/>)}</div>{tasks.length>0&&<><p className="publication-check-heading">需要动态确认</p>{tasks.map(item=><button key={item.id} className={prep[item.id]?"checked":""} onClick={()=>togglePrep(item.id)}><i>{prep[item.id]?"✓":""}</i><span><b>{item.title}</b><small>{item.freshness==="today"?"当天确认":"出发前确认"}</small></span></button>)}</>}</div>}
    {panel === "stay" && <div className="day3-stay-sheet"><figure><LandscapePhotoBlock source={visual.secondary}/></figure><p>{day.sleep === "—" ? "今天返程。提前确认交通时间，证件、充电宝和个人物品不要留在车上。" : `今晚住 ${day.sleep}。具体住宿名称、地址和联系方式以团队通知为准。`}</p><button onClick={()=>goMap(day.day)}>查看位置 <ArrowIcon /></button></div>}
    {panel === "notes" && <DailyPlaceNotes day={day.day}/>} 
  </div></section></div>;
}

function JournalDayTemplate({ day, close, goMap, goPack, goInspire }: { day: TripDay; close: () => void; goMap: (n: number, place?: string) => void; goPack: (l: PackLayer) => void; goInspire: () => void }) {
  const visual = visualFor(day), [panel,setPanel] = useState<PublicationPanel|null>(null), tasks = day.stages.flatMap(stage=>stage.taskIds||[]), first = day.stages[0];
  const nextCopy = first?.facts?.[0] || (day.drive ? `今天约 ${day.drive}，水和充电宝放在随手位置。` : "按当天节奏出发。");
  const routeScript = day.placeIds.map(id=>places.find(place=>place.id===id)?.en || places.find(place=>place.id===id)?.name).filter(Boolean).join(" to ");
  return <main className={`day3-publication publication-day publication-day-${day.day}`}><header className="day3-floating-nav"><button onClick={close}><ArrowIcon direction="back" />行程</button><span>{String(day.day).padStart(2,"0")} / 07</span><time>SEP.{day.date.slice(3)}</time></header><section className="day3-opening"><div className="day3-hero-track" aria-label={`Day ${day.day} 风景照片，左右滑动`}><figure><EditorialPhoto src={visual.hero} alt={`${day.route.join("至")}风景`} priority/><figcaption>01 / {day.route.at(-1)?.toUpperCase()} · LANDSCAPE</figcaption></figure><figure><EditorialPhoto src={visual.secondary} alt={`${day.route.join("至")}沿途风景`}/><figcaption>02 / ON THE ROUTE · LANDSCAPE</figcaption></figure></div><div className="day3-route-title"><small>DAY {String(day.day).padStart(2,"0")} · {day.date}</small><h1>{day.route.join(" — ")}</h1><p>{[day.distance,day.drive,day.sleep!=="—"?`住${day.sleep}`:"返程"].filter(Boolean).join("　·　")}</p></div><p className="day3-script">{routeScript}</p><button className="day3-weather-trigger" onClick={()=>setPanel("weather")} aria-label="查看详细天气"><Weather key={day.iso} day={day} variant="rail"/></button></section><section className="day3-control"><header><div><small>NEXT / {first?.meta || "TODAY"}</small><b>{first?.title || "今天出发"}</b></div><p>{nextCopy}</p></header><div className="day3-quick-track"><button onClick={()=>setPanel("check")}><small>CHECK</small><b>当天提醒</b><span>{visual.reminders.length} 项 + 动态确认</span></button><button onClick={()=>setPanel("stay")}><small>TONIGHT</small><b>{day.sleep==="—"?"返程":day.sleep}</b><span>{day.sleep==="—"?"检查随身物品":"入住前确认"}</span></button><button onClick={()=>setPanel("weather")}><small>ALTITUDE</small><b>{visual.altitude}</b><span>{day.route.at(-1)}参考</span></button></div></section><nav className="day3-primary-dock" aria-label={`DAY ${day.day} 功能`}><button onClick={()=>setPanel("itinerary")}><b>行程</b><small>ITINERARY</small></button><button onClick={()=>setPanel("wear")}><b>穿搭</b><small>STYLE</small></button><button onClick={()=>setPanel("map")}><b>地图</b><small>MAP</small></button><button onClick={()=>setPanel("bag")}><b>随身</b><small>DAY BAG</small></button><button onClick={()=>setPanel("notes")}><b>地点</b><small>MY PLACES</small></button></nav>{panel&&<PublicationDaySheet panel={panel} day={day} visual={visual} close={()=>setPanel(null)} goMap={goMap} goPack={goPack} goInspire={goInspire}/>}</main>;
}

function GenericDaySheet({
  kind,
  day,
  close,
  goMap,
  goPack,
  goInspire,
  prep,
  togglePrep,
}: {
  kind: "stage" | "confirm";
  day: TripDay;
  close: () => void;
  goMap: (n: number, p?: string) => void;
  goPack: (l: PackLayer) => void;
  goInspire: () => void;
  prep: Record<string, boolean>;
  togglePrep: (id: string) => void;
}) {
  return (
    <div className="journal-overlay" onClick={close}>
      <section className="journal-sheet" onClick={(e) => e.stopPropagation()}>
        <header>
          <div>
            <small>
              {kind === "stage" ? "ITINERARY" : "CHECK"} · DAY{" "}
              {String(day.day).padStart(2, "0")}
            </small>
            <h2>{kind === "stage" ? "今天行程" : "需要确认"}</h2>
          </div>
          <button onClick={close}>×</button>
        </header>
        {kind === "stage" ? (
          <div className="journal-stage-details">
            {day.stages.map((stage) => (
              <article key={stage.id}>
                <small>{stage.meta || stage.kind}</small>
                <h3>{stage.title}</h3>
                {stage.facts?.map((f) => (
                  <p key={f}>{f}</p>
                ))}
                {stage.placeId && (
                  <button onClick={() => goMap(day.day, stage.placeId)}>
                    地图位置 <ArrowIcon />
                  </button>
                )}
                {stage.optional && <em>可选</em>}
              </article>
            ))}
          </div>
        ) : (
          <div className="journal-confirm-list">
            {day.stages
              .flatMap((s) => s.taskIds || [])
              .map((id) => preparations.find((p) => p.id === id))
              .filter(Boolean)
              .map((item) => (
                <button
                  key={item!.id}
                  className={prep[item!.id] ? "done" : ""}
                  onClick={() => togglePrep(item!.id)}
                >
                  <span>
                    <small>
                      {item!.freshness === "today" ? "当天确认" : "出发前确认"}
                    </small>
                    <b>{item!.title}</b>
                  </span>
                  <i>{prep[item!.id] ? "✓" : "○"}</i>
                </button>
              ))}
            {!day.stages.some((s) => s.taskIds?.length) && (
              <p>这一天没有额外预约项目。</p>
            )}
          </div>
        )}
        <footer>
          <button onClick={() => goPack("day")}>当天随身</button>
          <button onClick={goInspire}>穿搭参考</button>
        </footer>
      </section>
    </div>
  );
}

function DayWorkspace({
  dayNumber,
  close,
  goMap,
  goPack,
  goInspire,
}: {
  dayNumber: number;
  close: () => void;
  goMap: (n: number, place?: string) => void;
  goPack: (l: PackLayer) => void;
  goInspire: () => void;
}) {
  const day = days[dayNumber - 1],
    visual = visualFor(day),
    { value: prep, toggle: togglePrep } = useStoredRecord("xe-preparation-v1"),
    { value: bag } = useStoredRecord("xe-packing-v2"),
    [sheet, setSheet] = useState<"stage" | "confirm" | null>(null);
  if (dayNumber === 3)
    return (
      <JournalDayThree
        close={close}
        goMap={goMap}
        goPack={goPack}
        goInspire={goInspire}
      />
    );
  return <JournalDayTemplate day={day} close={close} goMap={goMap} goPack={goPack} goInspire={goInspire}/>;
}

function RealMap({
  selectedDay,
  selectedPlaceId,
  selectDay,
  openDay,
}: {
  selectedDay: number;
  selectedPlaceId?: string;
  selectDay: (n: number) => void;
  openDay: (n: number) => void;
}) {
  const mapNode = useRef<HTMLDivElement>(null),
    mapRef = useRef<any>(null),
    layerRef = useRef<any>(null);
  const [placeId, setPlaceId] = useState(
      selectedPlaceId || days[selectedDay - 1].placeIds[0],
    ),
    [mapReady, setMapReady] = useState(0);
  const selectedPlace = places.find((p) => p.id === placeId) || places[0];
  useEffect(() => {
    if (selectedPlaceId) setPlaceId(selectedPlaceId);
  }, [selectedPlaceId]);
  useEffect(() => {
    if (!days[selectedDay - 1].placeIds.includes(placeId))
      setPlaceId(days[selectedDay - 1].placeIds[0]);
  }, [selectedDay, placeId]);
  useEffect(() => {
    const load = async () => {
      if (!document.querySelector("link[data-leaflet]")) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = assetUrl("/vendor/leaflet/leaflet.css");
        link.dataset.leaflet = "true";
        document.head.appendChild(link);
      }
      if (!window.L)
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = assetUrl("/vendor/leaflet/leaflet.js");
          s.onload = () => resolve();
          s.onerror = () => reject();
          document.head.appendChild(s);
        });
      if (!mapNode.current || mapRef.current || !window.L) return;
      const L = window.L,
        map = L.map(mapNode.current, { zoomControl: false }).setView(
          [47, 87.2],
          5,
        );
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 16,
        attribution: "© OpenStreetMap",
      }).addTo(map);
      L.control.zoom({ position: "topright" }).addTo(map);
      setMapReady((x) => x + 1);
    };
    load().catch(() => {});
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);
  useEffect(() => {
    const map = mapRef.current,
      L = window.L;
    if (!map || !L) return;
    layerRef.current?.remove();
    const group = L.layerGroup().addTo(map);
    layerRef.current = group;
    const day = days[selectedDay - 1],
      ps = day.placeIds
        .map((id) => places.find((p) => p.id === id)!)
        .filter(Boolean),
      line = ps.map((p) => [p.lat, p.lng]);
    if (line.length > 1)
      L.polyline(line, {
        color: "#555",
        weight: 3,
        opacity: 0.75,
        dashArray: "7 8",
      }).addTo(group);
    ps.forEach((p, i) => {
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: p.id === placeId ? 9 : 6,
        color: "#fff",
        weight: 2,
        fillColor: p.id === placeId ? "#222" : "#777",
        fillOpacity: 1,
      }).addTo(group);
      marker.bindTooltip(`${i + 1}. ${p.name}`, {
        permanent: true,
        direction: "top",
        className: "xe-map-label",
      });
      marker.on("click", () => setPlaceId(p.id));
    });
    if (line.length)
      map.fitBounds(L.latLngBounds(line), { padding: [42, 42], maxZoom: 8 });
  }, [selectedDay, placeId, mapReady]);
  const ids = days[selectedDay - 1].placeIds,
    idx = ids.indexOf(placeId);
  return (
    <main className="screen map-screen">
      <OfflineNotice />
      <Topbar />
      <header className="map-controls">
        <div>
          <small>REAL MAP · OPENSTREETMAP</small>
          <h1>路线与地点</h1>
        </div>
        <select
          value={selectedDay}
          onChange={(e) => selectDay(Number(e.target.value))}
        >
          {days.map((d) => (
            <option key={d.day} value={d.day}>
              Day {String(d.day).padStart(2, "0")}
            </option>
          ))}
        </select>
      </header>
      <div className="map-canvas" ref={mapNode}>
        <div className="map-loading">地图加载中…</div>
      </div>
      <section className="place-sheet">
        <header>
          <div>
            <small>
              DAY {selectedDay} · {selectedPlace.en}
            </small>
            <h2>{selectedPlace.name}</h2>
          </div>
          <button onClick={() => openDay(selectedDay)}>打开当天 <ArrowIcon /></button>
        </header>
        <p>{selectedPlace.context}</p>
        <div>
          <span>
            <small>上一站</small>
            {idx > 0 ? places.find((p) => p.id === ids[idx - 1])?.name : "—"}
          </span>
          <span>
            <small>下一站</small>
            {idx >= 0 && idx < ids.length - 1
              ? places.find((p) => p.id === ids[idx + 1])?.name
              : "—"}
          </span>
        </div>
        {selectedPlace.confirmationId && (
          <FreshnessBadge
            type={
              preparations.find((p) => p.id === selectedPlace.confirmationId)
                ?.freshness || "today"
            }
          />
        )}
      </section>
    </main>
  );
}

function Inspire({
  back,
  initialDay = 3,
  onDayChange,
}: {
  back: () => void;
  initialDay?: number;
  onDayChange?: (day: number) => void;
}) {
  const [mode, setMode] = useState<"style" | "photo">("style"),
    [selected, setSelected] = useState(initialDay);
  const day = days[selected - 1],
    visual = visualFor(day);
  return (
    <main className="day3-expanded day3-style-full">
      <header className="day3-expanded-nav">
        <button onClick={back}><ArrowIcon direction="back" />返回</button>
        <span>INSPIRE · {day.date}</span>
      </header>
      <section className="day3-style-landscape">
        <LandscapePhotoBlock source={visual.secondary} priority />
        <div>
          <small>WHAT TO WEAR / {String(day.day).padStart(2, "0")}</small>
          <h1>今天怎么穿</h1>
          <p>{day.route.join(" — ")}</p>
        </div>
      </section>
      <nav className="journal-inspire-days" aria-label="选择日期">
        {days.map((d) => (
          <button
            key={d.day}
            onClick={() => { setSelected(d.day); onDayChange?.(d.day); }}
            className={selected === d.day ? "active" : ""}
          >
            {String(d.day).padStart(2, "0")}
          </button>
        ))}
      </nav>
      <nav className="day3-inspire-switch" aria-label="灵感类型">
        <button
          className={mode === "style" ? "active" : ""}
          onClick={() => setMode("style")}
        >
          穿搭参考
        </button>
        <button
          className={mode === "photo" ? "active" : ""}
          onClick={() => setMode("photo")}
        >
          照片参考
        </button>
      </nav>
      {mode === "style" ? (
        <>
          <div className="day3-style-conditions">
            <span>
              <small>环境</small>
              {day.route.at(-1)}
            </span>
            <span>
              <small>车程</small>
              {day.drive || "自由安排"}
            </span>
            <span>
              <small>海拔</small>
              {visual.altitude}
            </span>
          </div>
          <PersonalInspirationGallery day={day.day} kind="style" />
        </>
      ) : (
        <PersonalInspirationGallery day={day.day} kind="photo" />
      )}
    </main>
  );
}

function Pack({ back }: { back: () => void }) {
  const [filter, setFilter] = useState<"all" | "open" | "done">("all"),
    { value, toggle } = useStoredRecord("xe-packing-v2");
  const items = helperCategories.flatMap((category) =>
      category.items.map(([id, label]) => [id, label, "recommended"] as const),
    ),
    done = items.filter(([id]) => value[id]).length;
  const visibleCategories = helperCategories
    .map((category) => ({
      ...category,
      items: category.items.filter(
        ([id]) =>
          filter === "all" || (filter === "done" ? value[id] : !value[id]),
      ),
    }))
    .filter((category) => category.items.length);
  const important = new Set([
    "id",
    "phone",
    "phone-cable",
    "power",
    "tickets",
    "personal-meds",
    "shell",
    "shoes",
  ]);
  return (
    <main className="day3-expanded day3-pack-full">
      <header className="day3-expanded-nav">
        <button onClick={back}><ArrowIcon direction="back" />返回</button>
        <span>PREP · 12—18 SEP</span>
      </header>
      <section className="day3-pack-intro">
        <div>
          <small>BEFORE THE TRIP</small>
          <h1>行前准备</h1>
          <p>北疆 9 月 · 温差、风、长车程与干燥</p>
        </div>
        <strong>
          {done}
          <i>/</i>
          {items.length}
        </strong>
        <Progress done={done} total={items.length} />
      </section>
      <section className="day3-luggage-context">
        <small>温度实感</small>
        <h2>昼夜温差大，山区比乌鲁木齐冷得更明显。</h2>
        <p>
          乌鲁木齐与克拉玛依白天日照强、早晚凉；阿勒泰、禾木、喀纳斯清晨和入夜更冷，湖边与山口风大。临近出发再按实时预报增减厚度。
        </p>
      </section>
      <section className="day3-wear-guide">
        <small>分区穿衣</small>
        <article>
          <b>乌鲁木齐 · 克拉玛依</b>
          <p>长袖或轻薄打底 + 薄外套；魔鬼城加防风层、帽子和墨镜。</p>
        </article>
        <article>
          <b>阿勒泰 · 禾木 · 喀纳斯</b>
          <p>
            长袖速干 + 抓绒 +
            防风外套；下身长裤，怕冷可叠穿保暖打底。清晨把围巾或脖套带上。
          </p>
        </article>
      </section>
      <nav className="day3-pack-filter">
        <button
          onClick={() => setFilter("all")}
          className={filter === "all" ? "active" : ""}
        >
          全部
        </button>
        <button
          onClick={() => setFilter("open")}
          className={filter === "open" ? "active" : ""}
        >
          未完成
        </button>
        <button
          onClick={() => setFilter("done")}
          className={filter === "done" ? "active" : ""}
        >
          已完成
        </button>
      </nav>
      <div className="day3-pack-groups">
        {visibleCategories.map((category) => (
          <section key={category.id} className="day3-pack-group">
            <header>
              <small>{category.id.toUpperCase()}</small>
              <h2>{category.title}</h2>
            </header>
            <div className="day3-pack-list">
              {category.items.map(([id, label]) => (
                <button
                  key={id}
                  className={value[id] ? "done" : ""}
                  onClick={() => toggle(id)}
                >
                  <i>{value[id] ? "✓" : ""}</i>
                  <span>{label}</span>
                  <small>
                    {important.has(id)
                      ? "必带"
                      : id === "neck-pillow" ||
                          id === "camera" ||
                          id === "laundry"
                        ? "按需"
                        : "建议"}
                  </small>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <section className="day3-pack-summary">
        <small>最后提醒</small>
        <p>
          九月北疆的关键是叠穿、防风、防晒。最厚的一套不要塞进箱底，长车程随身留好水、纸巾、零食、充电宝和常用药。
        </p>
      </section>
      <p className="day3-pack-footnote">
        清单只保存在当前设备，不需要登录，也不会上传个人信息。
      </p>
    </main>
  );
}

export function Site() {
  useOfflineRegistration();
  const [view, setView] = useState<View>("home"),
    [day, setDay] = useState<number | null>(null),
    [focusDay, setFocusDay] = useState(1),
    [mapDay, setMapDay] = useState(1),
    [mapPlace, setMapPlace] = useState<string | undefined>(),
    [qaWidth, setQaWidth] = useState<number | null>(null);
  useEffect(() => {
    validateMediaLibrary();
    const query = new URLSearchParams(location.search),
      w = Number(query.get("viewport"));
    setQaWidth([375, 390, 393, 430].includes(w) ? w : null);
    if (query.get("day")) {
      const d = Number(query.get("day"));
      if (d >= 1 && d <= 7) { setFocusDay(d); setDay(d); }
    } else if (query.get("view")) {
      const v = query.get("view") as View;
      if (nav.some((n) => n.id === v)) setView(v);
    }

  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [view, day]);
  const change = (v: View) => {
      setDay(null);
      setView(v);
    },
    goPack = (_: PackLayer) => change("pack"),
    openDay = (n: number) => {
      setFocusDay(n);
      setDay(n);
    },
    goMap = (n: number, p?: string) => {
      setFocusDay(n);
      setMapDay(n);
      setMapPlace(p);
      change("map");
    },
    navChange = (v: View) => {
      if (v === "map") { setMapDay(focusDay); setMapPlace(undefined); }
      change(v);
    },
    share = async () => {
      const data = {
        title: "THE XINJIANG EDIT",
        text: "北疆秋日旅行指南",
        url: shareUrl(day || undefined),
      };
      try {
        if (navigator.share) await navigator.share(data);
        else {
          await navigator.clipboard.writeText(shareUrl(day || undefined));
          alert("链接已复制");
        }
      } catch {}
    },
    style = qaWidth ? { width: `${qaWidth}px` } : undefined,
    cls = qaWidth ? "qa-mobile" : "";
  if (day)
    return (
      <AppShell className={cls} style={style}>
        <DayWorkspace
          dayNumber={day}
          close={() => change("trip")}
          goMap={goMap}
          goPack={goPack}
          goInspire={() => { setFocusDay(day); change("inspire"); }}
        />
      </AppShell>
    );
  return (
    <AppShell className={cls} style={style}>
      {view === "home" && (
        <Home
          openDay={openDay}
          goPack={goPack}
          goMap={goMap}
          goTrip={() => change("trip")}
          share={share}
        />
      )}{" "}
      {view === "trip" && (
        <TripPrototype openDay={openDay} goHome={() => change("home")} />
      )}{" "}
      {view === "map" && (
        <RealMap
          selectedDay={mapDay}
          selectedPlaceId={mapPlace}
          selectDay={(n) => {
            setFocusDay(n);
            setMapDay(n);
            setMapPlace(undefined);
          }}
          openDay={openDay}
        />
      )}{" "}
      {view === "inspire" && <Inspire back={() => change("home")} initialDay={focusDay} onDayChange={setFocusDay} />}{" "}
      {view === "pack" && <Pack back={() => change("home")} />}
      <JournalBottomNav active={view} change={navChange} share={share} />
    </AppShell>
  );
}
