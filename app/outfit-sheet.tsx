"use client";
import { assetUrl, shareUrl } from "./assets";

import type { DayVisual } from "@/data/experience";
import { ArrowIcon } from "./day-components";

/** One rendering path for all seven days, including the approved Day 03. */
export function OutfitSheetContent({ day, visual, openInspiration }: {
  day: number;
  visual: DayVisual;
  openInspiration: () => void;
}) {
  const photos = [{
    src: visual.outfit,
    alt: visual.outfitAlt ?? "秋季旅行穿搭参考",
    caption: day === 3 ? "防风外层 + 柔软围巾 + 宽松下装" : visual.outfitCopy,
    position: visual.outfitPosition,
  }, ...(visual.outfitSecondary ? [{
    src: visual.outfitSecondary,
    alt: "秋季旅行叠穿参考",
    caption: visual.outfitSecondaryCopy,
    position: undefined,
  }] : [])];
  const moments = day === 3
    ? [["早上", "完整层次"], ["中午", "脱外层"], ["进禾木", "外层穿回"]]
    : [[day === 1 || day === 7 ? "抵达 / 返程" : "早上", "完整层次"],
       [day === 2 || day === 5 ? "车内" : "中午", "热时脱外层"],
       [day === 4 ? "湖边" : day === 6 ? "魔鬼城" : "傍晚", "防风层穿回"]];

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
      {moments.map(([time, instruction]) => <span key={time}>
        <small>{time}</small>{instruction}
      </span>)}
    </div>
    <p className="day3-sheet-note">{day === 3
      ? "约 5 小时坐车，避免勒腰或勒腿的下装。鞋以长时间坐车和短距离步行为准。"
      : visual.outfitNote}</p>
    <button className="day3-sheet-link" onClick={openInspiration}>
      打开完整灵感库 <ArrowIcon />
    </button>
  </>;
}
