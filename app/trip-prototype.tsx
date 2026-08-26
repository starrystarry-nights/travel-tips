"use client";
import { useEffect, useState } from "react";
import { days } from "@/data/product";
import { visualFor } from "@/data/experience";
import { LandscapePhotoBlock, Timeline } from "./day-components";

export function TripPrototype({ openDay, goHome }: { openDay: (day: number) => void; goHome: () => void }) {
  const [active, setActive] = useState(3), day = days[active - 1];
  useEffect(() => { const stored = Number(sessionStorage.getItem("xe-active-day")); if (stored >= 1 && stored <= 7) setActive(stored); }, []);
  const select = (n: number) => { setActive(n); sessionStorage.setItem("xe-active-day", String(n)); };
  return <main className="journey-overview">
    <header className="journey-head"><button onClick={goHome}>XE</button><div><small>12—18 SEP 2026</small><b>北疆七日</b></div><span>{String(active).padStart(2, "0")} / 07</span></header>
    <nav className="journey-deck" aria-label="左右滑动浏览七天">{days.map(item => <button key={item.day} className={item.day === active ? "active" : ""} onClick={() => select(item.day)} onDoubleClick={() => openDay(item.day)}><LandscapePhotoBlock source={visualFor(item).hero} priority={item.day === 3} /><div><small>DAY {String(item.day).padStart(2, "0")} · {item.date}</small><h2>{item.route.join(" → ")}</h2><p>{item.drive || "自由活动"}{item.distance ? ` · ${item.distance}` : ""}</p><span>住 {item.sleep}</span></div></button>)}</nav>
    <section className="journey-active"><header><div><small>DAY {String(day.day).padStart(2, "0")}</small><h1>{day.route.at(-1)}</h1></div><button onClick={() => openDay(day.day)}>打开当天 ↗</button></header><Timeline stages={day.stages} openStage={() => openDay(day.day)} /></section>
  </main>;
}
