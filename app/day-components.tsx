"use client";
import { assetUrl, shareUrl } from "./assets";
import Image from "next/image";
import type { ReactNode } from "react";
import { mediaById } from "@/data/media";
import type { Stage, TripDay } from "@/data/product";
import type { DayVisual } from "@/data/experience";

export function ArrowIcon({ direction = "forward" }: { direction?: "forward" | "back" | "up" }) {
  const transform = direction === "back" ? "rotate(180 12 12)" : direction === "up" ? "rotate(-45 12 12)" : undefined;
  return <svg className="ui-arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><g transform={transform}><path d="M5 12h13M13 7l5 5-5 5" /></g></svg>;
}

export function LandscapePhotoBlock({
  source,
  alt,
  priority = false,
  className = "",
  position,
}: {
  source: string;
  alt?: string;
  priority?: boolean;
  className?: string;
  position?: string;
}) {
  const m = mediaById.get(source);
  return (
    <figure className={`journal-photo ${className}`}>
      {m ? (
        <Image
          src={assetUrl(m.src)}
          alt={alt || m.alt}
          fill
          sizes="(max-width:720px) 100vw,720px"
          priority={priority}
          unoptimized
          style={{ objectPosition: position }}
        />
      ) : (
        <img
          src={assetUrl(source)}
          alt={alt || "北疆旅行环境"}
          loading={priority ? "eager" : "lazy"}
          style={{ objectPosition: position }}
        />
      )}
    </figure>
  );
}
export function EditorialSection({
  eyebrow,
  title,
  action,
  children,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`journal-section ${className}`}>
      <header>
        <div>
          {eyebrow && <small>{eyebrow}</small>}
          <h2>{title}</h2>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
export function DayHero({
  day,
  visual,
  weather,
  back,
}: {
  day: TripDay;
  visual: DayVisual;
  weather: ReactNode;
  back: () => void;
}) {
  return (
    <section className="journal-day-hero">
      <header>
        <button onClick={back}><ArrowIcon direction="back" />行程</button>
        <span>{String(day.day).padStart(2, "0")} / 07</span>
        <time>SEP.{day.date.slice(3)}</time>
      </header>
      <div className="journal-photo-swipe">
        <LandscapePhotoBlock source={visual.hero} priority />
        <LandscapePhotoBlock source={visual.secondary} />
      </div>
      <div className="journal-day-title">
        <small>
          DAY {String(day.day).padStart(2, "0")} · {day.date}
        </small>
        <h1>{day.route.join(" — ")}</h1>
        <p>
          {[
            day.distance,
            day.drive,
            day.sleep !== "—" ? `住 ${day.sleep}` : "返程",
          ]
            .filter(Boolean)
            .join("　·　")}
        </p>
      </div>
      <div className="journal-weather-slot">{weather}</div>
    </section>
  );
}
export function InfoRail({
  day,
  visual,
  openMap,
  openConfirm,
}: {
  day: TripDay;
  visual: DayVisual;
  openMap: () => void;
  openConfirm: () => void;
}) {
  return (
    <div className="journal-info-rail">
      <button onClick={openMap}>
        <small>ROUTE</small>
        <b>{day.drive || "市内自由活动"}</b>
        <span>{day.distance || day.route.at(-1)}</span>
      </button>
      <span>
        <small>ALTITUDE</small>
        <b>{visual.altitude}</b>
        <em>{day.route.at(-1)}</em>
      </span>
      <button onClick={openConfirm}>
        <small>CHECK</small>
        <b>需要确认</b>
        <span>查看当天状态</span>
      </button>
    </div>
  );
}
export function Timeline({
  stages,
  openStage,
}: {
  stages: Stage[];
  openStage: (s: Stage) => void;
}) {
  return (
    <div className="journal-timeline-new">
      {stages.map((s, i) => (
        <button key={s.id} onClick={() => openStage(s)}>
          <time>{s.meta || String(i + 1).padStart(2, "0")}</time>
          <i />
          <span>
            <small>
              {s.kind === "depart"
                ? "出发前"
                : s.kind === "travel"
                  ? "路上"
                  : s.kind === "arrival"
                    ? "抵达"
                    : s.kind === "evening"
                      ? "晚间"
                      : s.kind === "prepare"
                        ? "准备"
                        : "停留"}
            </small>
            <b>{s.title}</b>
            <em><ArrowIcon /></em>
          </span>
        </button>
      ))}
    </div>
  );
}
export function OutfitPreview({
  visual,
  open,
}: {
  visual: DayVisual;
  open: () => void;
}) {
  return (
    <button className="journal-outfit-preview" onClick={open}>
      <LandscapePhotoBlock source={visual.outfit} alt={visual.outfitAlt || "秋季旅行穿搭参考"} position={visual.outfitPosition} />
      <span>
        <small>WHAT TO WEAR</small>
        <b>{visual.outfitCopy}</b>
        <p>{visual.outfitNote}</p>
        <em>查看完整穿搭 <ArrowIcon /></em>
      </span>
    </button>
  );
}
export function ChecklistPreview({
  visual,
  values,
  open,
}: {
  visual: DayVisual;
  values: Record<string, boolean>;
  open: () => void;
}) {
  const done = visual.dayBag.filter(([id]) => values[id]).length;
  return (
    <button className="journal-check-preview" onClick={open}>
      <span>
        <small>DAY BAG</small>
        <b>当天随身</b>
        <em>
          {done}/{visual.dayBag.length}
        </em>
      </span>
      <strong>检查 <ArrowIcon /></strong>
    </button>
  );
}
export function ShareArrow() {
  return <ArrowIcon direction="up" />;
}
export function BottomNav({
  active,
  change,
  share,
}: {
  active: string;
  change: (v: "home" | "trip" | "map" | "inspire" | "pack") => void;
  share: () => void;
}) {
  return (
    <nav className="journal-bottom-nav" aria-label="主要导航">
      {[
        ["home", "首页"],
        ["trip", "行程"],
        ["map", "地图"],
        ["inspire", "灵感"],
        ["pack", "准备"],
      ].map(([id, label]) => (
        <button
          key={id}
          aria-current={active === id ? "page" : undefined}
          onClick={() => change(id as any)}
        >
          {label}
        </button>
      ))}
      <button className="journal-share" onClick={share} aria-label="分享">
        <ShareArrow />
      </button>
    </nav>
  );
}
