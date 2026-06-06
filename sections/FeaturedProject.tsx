"use client";
import { useRef, useState, useCallback } from "react";
import { useInView } from "framer-motion";
import { Star, PenTool, Zap, FileText, BookOpen } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import Card from "@/components/Card";
import { zeno } from "@/data/content";
import { C, tagStyle, tagHv, revealStyle, col } from "@/lib/tokens";

const tags = [
  { label: "UX DESIGN",  icon: <PenTool  size={12} color={C.accent} strokeWidth={2} /> },
  { label: "EV APP",     icon: <Zap      size={12} color={C.yellow} strokeWidth={2} /> },
  { label: "CASE STUDY", icon: <FileText size={12} color={C.blue}   strokeWidth={2} /> },
];

export default function FeaturedProject() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [cursor, setCursor] = useState({ x: -999, y: -999 });
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setCursor({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);
  const onMouseLeave = useCallback(() => setCursor({ x: -999, y: -999 }), []);

  return (
    <>
      {/* Section label */}
      <div id="featured" style={{ ...col, padding: "64px 24px 32px" }}>
        <SectionLabel icon={Star} label="FEATURED PROJECT" num="01" iconColor={C.yellow} />
      </div>

      {/* ── Static feature image with dot pattern ── */}
      <div className="dot-bg"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ position: "relative" }}>

        {/* Bright dot layer — same pattern, masked to cursor radius */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.75) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
          WebkitMaskImage: `radial-gradient(circle 140px at ${cursor.x}px ${cursor.y}px, black 0%, transparent 100%)`,
          maskImage: `radial-gradient(circle 140px at ${cursor.x}px ${cursor.y}px, black 0%, transparent 100%)`,
        }}/>

        <div style={{ ...col, position: "relative", zIndex: 1 }}>
          <div className="feature-img-wrap" style={{ borderRadius: 16, overflow: "hidden", width: "100%" }}>
            <picture>
              <source media="(min-width: 768px)" srcSet="/images/16_9.png" />
              <img
                src="/images/4_3.png"
                alt="ZENO App"
                style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
              />
            </picture>
          </div>
        </div>

        <style>{`
          .feature-img-wrap { aspect-ratio: 4 / 3; }
          @media (min-width: 768px) { .feature-img-wrap { aspect-ratio: 16 / 9; } }
          .dot-bg { background-color: #0d0d0d; padding: 0 24px; }
          @media (min-width: 768px) {
            .dot-bg {
              background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px);
              background-size: 14px 14px;
              padding: 40px 24px;
            }
          }
        `}</style>
      </div>

      {/* ── ZENO detail ── */}
      <div ref={ref} style={{ ...col, padding: "32px 24px 0" }}>
        <div style={{ display:"flex",flexDirection:"column",gap:24,...revealStyle(inView) }}>

          {/* Identity */}
          <div style={{ display:"flex",alignItems:"center",gap:16 }}>
            <div style={{ width:64,height:64,borderRadius:16,overflow:"hidden",flexShrink:0 }}>
              <img src="/images/zeno logo.png" alt="ZENO" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            </div>
            <div>
              <div className="f16" style={{ fontWeight:500,color:C.t1 }}>{zeno.name}</div>
              <div className="f16" style={{ fontWeight:400,color:C.t2 }}>{zeno.sub}</div>
            </div>
          </div>

          {/* Tags */}
          <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
            {tags.map(t => (
              <div key={t.label} style={tagStyle}
                onMouseEnter={e => tagHv(e,true)} onMouseLeave={e => tagHv(e,false)}>
                {t.icon}{t.label}
              </div>
            ))}
          </div>

          <p className="f16" style={{ fontWeight:400,color:C.t2,lineHeight:1.6 }}>{zeno.desc}</p>
        </div>

        {/* Stats grid */}
        <div className="stats-grid" style={{ display:"grid",gap:16,marginTop:24 }}>
          {zeno.stats.map((s,i) => (
            <Card key={s.label} label={s.label} num={s.num} body={s.body} delay={i*0.08}/>
          ))}
        </div>

        {/* CTAs */}
        <div className="btn-row" style={{ marginTop:24 }}>
          {[
            { label:"Read Case Study", icon:<BookOpen size={14} strokeWidth={2}/>, bg:C.t1,  color:C.bg, href:"/zeno" },
            { label:"View in Figma",   icon:<PenTool  size={14} strokeWidth={2}/>, bg:"rgba(255,255,255,0.05)", color:C.t1, href:"https://www.figma.com/design/HQiowSEZWtefmjVP5cqZuY/ZENO?node-id=0-1&p=f&t=ZuWU0JArTeGN7yjv-0" },
          ].map(btn => (
            <a key={btn.label} href={btn.href} target="_blank" rel="noopener noreferrer" style={{
              display:"flex",alignItems:"center",gap:10,
              background:btn.bg,color:btn.color,padding:"11px 22px",
              borderRadius:9999,fontSize:14,fontWeight:500,textDecoration:"none",
              transition:"opacity 0.25s,transform 0.25s"}}
              onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.opacity="0.88";(e.currentTarget as HTMLAnchorElement).style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.opacity="1";(e.currentTarget as HTMLAnchorElement).style.transform="";}}>
              {btn.icon}{btn.label}
            </a>
          ))}
        </div>
      </div>

      <style>{`
        .stats-grid { grid-template-columns: 1fr; }
        @media (min-width: 768px) { .stats-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </>
  );
}
