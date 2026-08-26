"use client";

import { useEffect, useMemo, useState } from "react";
import { days, preparations, type Stage, type TripDay } from "@/data/product";

function stageLabel(stage: Stage) {
  return stage.kind === "depart" ? "出发前" : stage.kind === "travel" ? "路上" : stage.kind === "arrival" ? "抵达" : stage.kind === "evening" ? "晚上" : stage.kind === "prepare" ? "准备" : "停留";
}

function DayRail({ active, select }: { active: number; select: (day: number) => void }) {
  return <nav className="planner-day-rail" aria-label="切换日期">
    {days.map(day => <button key={day.day} className={active === day.day ? "active" : ""} onClick={() => select(day.day)} aria-current={active === day.day ? "date" : undefined}>
      <span>{day.date.slice(3)}</span><b>{String(day.day).padStart(2, "0")}</b><i />
    </button>)}
  </nav>;
}

function StageItem({ stage, index, expanded, toggle }: { stage: Stage; index: number; expanded: boolean; toggle: () => void }) {
  const tasks = useMemo(() => (stage.taskIds || []).map(id => preparations.find(item => item.id === id)).filter(Boolean), [stage.taskIds]);
  return <article className={`planner-stage ${expanded ? "expanded" : ""}`}>
    <div className="planner-stage-index"><span>{String(index + 1).padStart(2, "0")}</span><i /></div>
    <button className="planner-stage-main" onClick={toggle} aria-expanded={expanded}>
      <small>{stageLabel(stage)}{stage.meta ? ` · ${stage.meta}` : ""}</small>
      <b>{stage.title}</b>
      <span>{expanded ? "收起" : "查看"}</span>
    </button>
    {expanded && <div className="planner-stage-detail">
      {stage.facts?.map(fact => <p key={fact}>{fact}</p>)}
      {tasks.map(task => task && <div className={`planner-confirm ${task.freshness}`} key={task.id}><span>{task.freshness === "today" ? "当天确认" : "出发前确认"}</span><b>{task.title}</b></div>)}
      {stage.packLayer && <div className="planner-bag"><span>DAY 03 · ON YOU</span><b>出发前检查当天随身</b></div>}
      {stage.optional && <span className="planner-optional">可选 · 体力不足可以跳过</span>}
    </div>}
  </article>;
}

function DayPlanner({ day, openDay }: { day: TripDay; openDay: (day: number) => void }) {
  const [expanded, setExpanded] = useState(day.day === 3 ? "d3-before" : day.stages[0]?.id);
  useEffect(() => setExpanded(day.day === 3 ? "d3-before" : day.stages[0]?.id), [day.day, day.stages]);
  return <section className="planner-day">
    <header className="planner-day-head">
      <div><small>DAY {String(day.day).padStart(2, "0")} · {day.date}</small><h1>{day.route.join(" → ")}</h1></div>
      <button onClick={() => openDay(day.day)}>完整信息</button>
    </header>
    <div className="planner-facts"><span>{day.drive || "自由活动"}</span><span>住 {day.sleep}</span>{day.distance && <span>{day.distance}</span>}</div>
    <div className="planner-timeline">{day.stages.map((stage, index) => <StageItem key={stage.id} stage={stage} index={index} expanded={expanded === stage.id} toggle={() => setExpanded(current => current === stage.id ? "" : stage.id)} />)}</div>
  </section>;
}

export function TripPrototype({ openDay, goHome }: { openDay: (day: number) => void; goHome: () => void }) {
  const [active, setActive] = useState(3);
  useEffect(() => { const stored = Number(sessionStorage.getItem("xe-active-day")); if (stored >= 1 && stored <= 7) setActive(stored); }, []);
  const select = (day: number) => { setActive(day); sessionStorage.setItem("xe-active-day", String(day)); };
  return <main className="trip-planner">
    <header className="planner-nav"><button onClick={goHome}>XE</button><div><b>北疆 7 日行程</b><small>12—18 SEP 2026</small></div><span>{active}/7</span></header>
    <DayRail active={active} select={select} />
    <DayPlanner day={days[active - 1]} openDay={openDay} />
  </main>;
}
