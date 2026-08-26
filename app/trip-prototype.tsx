"use client";
import { useEffect, useRef, useState } from "react";
import { days } from "@/data/product";
import { visualFor } from "@/data/experience";
import { LandscapePhotoBlock } from "./day-components";

export function TripPrototype({openDay,goHome}:{openDay:(day:number)=>void;goHome:()=>void}){
  const [active,setActive]=useState(1); const rail=useRef<HTMLDivElement>(null);
  useEffect(()=>{const node=rail.current;if(!node)return;const onScroll=()=>{const cards=[...node.children] as HTMLElement[];let best=0,dist=Infinity;cards.forEach((c,i)=>{const d=Math.abs(c.offsetLeft-node.scrollLeft-18);if(d<dist){dist=d;best=i}});setActive(best+1)};node.addEventListener("scroll",onScroll,{passive:true});return()=>node.removeEventListener("scroll",onScroll)},[]);
  return <main className="journal-trip"><header className="journal-trip-nav"><button onClick={goHome}>THE XINJIANG EDIT</button><span>12—18 SEP 2026</span></header><section className="journal-trip-intro"><small>7 DAYS · NORTHERN XINJIANG</small><p>向左滑动查看七天路线。跟团行程集中在 09.13—09.17，首尾两天自由安排。</p></section><div className="journal-day-deck" ref={rail}>{days.map(day=>{const visual=visualFor(day);return <article key={day.day} className={active===day.day?"active":""}><button onClick={()=>openDay(day.day)}><LandscapePhotoBlock source={visual.hero} priority={day.day===1}/><div className="journal-day-deck-copy"><small>{day.date}　DAY {String(day.day).padStart(2,"0")}</small><h2>{day.route.join(" → ")}</h2><p>{[day.drive,`住 ${day.sleep}`].filter(Boolean).join(" · ")}</p></div></button></article>})}</div><footer className="journal-deck-index"><span>{String(active).padStart(2,"0")}</span><i><b style={{width:`${active/7*100}%`}}/></i><span>07</span></footer></main>
}
