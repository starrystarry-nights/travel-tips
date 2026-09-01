"use client";
import { useEffect, useMemo, useState } from "react";
import type { DayVisual } from "@/data/experience";
import { days, places } from "@/data/product";
import { ArrowIcon } from "./day-components";

type OutfitWeather = { min: number; max: number; wind: number };
type PrivateImage = { id: string; day: number; kind: "style"; src: string; caption?: string };

function guidanceFor(day: number, visual: DayVisual, weather: OutfitWeather | null) {
  if (!weather) {
    return {
      caption: visual.outfitCopy,
      moments: [[day === 1 || day === 7 ? "抵达 / 返程" : "早上", "按体感叠穿"], [day === 2 || day === 5 ? "车内" : "中午", "热时减层"], [day === 4 ? "湖边" : day === 6 ? "魔鬼城" : "傍晚", "防风层备用"]],
      note: visual.outfitNote,
    };
  }

  const { min, max, wind } = weather;
  const mountain = [3, 4, 5].includes(day);
  const windy = wind >= 25;
  let caption: string;
  let morning: string;
  let midday: string;
  let evening: string;

  if (max >= 30) {
    caption = "短袖 / 薄长袖 + 宽松长下装；轻薄外套随身";
    morning = min < 18 ? "薄外套按需" : "单层即可";
    midday = "单层透气";
    evening = min < 18 ? "轻外套穿回" : "仍以轻薄为主";
  } else if (max >= 25) {
    caption = "薄长袖或短袖 + 宽松长裤 / 长裙；轻外套备用";
    morning = "薄外层可带";
    midday = "脱外层";
    evening = min < 15 ? "轻外套穿回" : "按体感加层";
  } else if (max >= 18) {
    caption = "薄长袖 + 轻针织 / 薄抓绒 + 宽松长下装";
    morning = "两层起步";
    midday = "热时减中层";
    evening = "外层穿回";
  } else if (max >= 12) {
    caption = "长袖打底 + 针织 / 抓绒 + 防风外层 + 长裤";
    morning = "完整层次";
    midday = "按体感减一层";
    evening = "防风保暖";
  } else {
    caption = "保暖打底 + 抓绒 / 针织 + 防风外层；必要时加轻薄羽绒";
    morning = "保暖层穿全";
    midday = "只在体感暖时减层";
    evening = "保暖层穿回";
  }

  const extras: string[] = [];
  if (mountain && min <= 12) extras.push("山区早晚降温快，保暖层不要放在大行李里");
  if (windy) extras.push(`最大风速约 ${Math.round(wind)} km/h，优先带能挡风的外层，帽子和围巾要固定`);
  if (max >= 28) extras.push("白天偏热，不建议为了拍照穿厚抓绒或厚长外套");

  return {
    caption,
    moments: [["早上", morning], ["中午", midday], ["傍晚", evening]],
    note: `${Math.round(min)}–${Math.round(max)}°C${wind ? ` · 风约 ${Math.round(wind)} km/h` : ""}。${extras.join("；") || visual.outfitNote}`,
  };
}

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

function usePrivateOutfitImages(day: number) {
  const [items, setItems] = useState<PrivateImage[]>([]);
  const [busy, setBusy] = useState(false);
  const refresh = async () => {
    const db = await openImageDb();
    const request = db.transaction("images", "readonly").objectStore("images").getAll();
    request.onsuccess = () => setItems((request.result as PrivateImage[]).filter(item => item.day === day && item.kind === "style"));
  };
  useEffect(() => { refresh().catch(() => {}); }, [day]);
  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const db = await openImageDb();
      for (const file of Array.from(files)) {
        const item: PrivateImage = { id: crypto.randomUUID(), day, kind: "style", src: await imageFileToDataUrl(file), caption: "" };
        await new Promise<void>((resolve, reject) => {
          const request = db.transaction("images", "readwrite").objectStore("images").put(item);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
      await refresh();
    } finally { setBusy(false); }
  };
  const clear = async () => {
    const db = await openImageDb();
    for (const item of items) {
      await new Promise<void>((resolve, reject) => {
        const request = db.transaction("images", "readwrite").objectStore("images").delete(item.id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
    await refresh();
  };
  return { items, busy, addFiles, clear };
}

/** Outfit guidance follows weather; outfit photos are private and stay on this device only. */
export function OutfitSheetContent({ day, visual, openInspiration }: {
  day: number;
  visual: DayVisual;
  openInspiration: () => void;
}) {
  const [weather, setWeather] = useState<OutfitWeather | null>(null);
  const { items, busy, addFiles, clear } = usePrivateOutfitImages(day);

  useEffect(() => {
    const tripDay = days[day - 1];
    if (!tripDay) return;
    const place = places.find((item) => item.id === tripDay.placeIds.at(-1)) || places[0];
    const controller = new AbortController();
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lng}&daily=temperature_2m_min,temperature_2m_max,wind_speed_10m_max&timezone=Asia%2FShanghai&start_date=${tripDay.iso}&end_date=${tripDay.iso}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        const min = data.daily?.temperature_2m_min?.[0];
        const max = data.daily?.temperature_2m_max?.[0];
        const wind = data.daily?.wind_speed_10m_max?.[0];
        if (typeof min === "number" && typeof max === "number") setWeather({ min, max, wind: typeof wind === "number" ? wind : 0 });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [day]);

  const guidance = useMemo(() => guidanceFor(day, visual, weather), [day, visual, weather]);

  return <>
    {items.length ? (
      <div className="day3-wear-track" data-count={items.length} key={day} aria-label={`Day ${String(day).padStart(2, "0")} 私人穿搭参考`}>
        {items.map((photo, index) => <figure key={photo.id}>
          <img src={photo.src} alt="我的私人穿搭参考" loading="lazy" decoding="async" />
          <figcaption>{index === 0 ? guidance.caption : "私人穿搭参考 · 仅保存在当前设备"}</figcaption>
        </figure>)}
      </div>
    ) : (
      <div className="personal-empty">
        <b>添加你的穿搭参考</b>
        <p>不再显示公开图库照片。你添加的图片只保存在当前设备，不会上传到 GitHub，也不会随分享链接公开。</p>
      </div>
    )}

    <label className="day3-sheet-link" style={{ display: "flex", cursor: "pointer" }}>
      {busy ? "正在处理图片…" : items.length ? "继续添加私人图片" : "添加私人穿搭图"} <ArrowIcon />
      <input type="file" accept="image/*" multiple disabled={busy} style={{ display: "none" }} onChange={event => { addFiles(event.target.files); event.currentTarget.value = ""; }} />
    </label>
    {items.length > 0 && <button className="day3-sheet-link" onClick={clear}>清空本日私人图片 <ArrowIcon /></button>}

    <div className="day3-comfort-line">
      {guidance.moments.map(([time, instruction]) => <span key={time}>
        <small>{time}</small>{instruction}
      </span>)}
    </div>
    <p className="day3-sheet-note">{guidance.note}</p>
    <button className="day3-sheet-link" onClick={openInspiration}>
      打开完整灵感库 <ArrowIcon />
    </button>
  </>;
}
