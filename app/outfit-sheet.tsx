"use client";
import { assetUrl } from "./assets";
import { useEffect, useMemo, useState } from "react";
import type { DayVisual } from "@/data/experience";
import { days, places } from "@/data/product";
import { ArrowIcon } from "./day-components";

type OutfitWeather = { min: number; max: number; wind: number };

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

/** One rendering path for all seven days. Outfit guidance follows the day's forecast when available. */
export function OutfitSheetContent({ day, visual, openInspiration }: {
  day: number;
  visual: DayVisual;
  openInspiration: () => void;
}) {
  const [weather, setWeather] = useState<OutfitWeather | null>(null);

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
  const photos = [{
    src: visual.outfit,
    alt: visual.outfitAlt ?? "秋季旅行穿搭参考",
    caption: guidance.caption,
    position: visual.outfitPosition,
  }, ...(visual.outfitSecondary ? [{
    src: visual.outfitSecondary,
    alt: "秋季旅行叠穿参考",
    caption: visual.outfitSecondaryCopy,
    position: undefined,
  }] : [])];

  return <>
    <div className="day3-wear-track" data-count={photos.length} key={day}
      aria-label={`Day ${String(day).padStart(2, "0")} 穿搭参考`}>
      {photos.map(photo => <figure key={photo.src}>
        <img src={assetUrl(photo.src)} alt={photo.alt} loading="lazy" decoding="async"
          style={{ objectPosition: photo.position }} />
        <figcaption>{photo.caption}</figcaption>
      </figure>)}
    </div>
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
