"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import SectionHeadingV3 from "@/components/SectionHeadingV3";
import { experience } from "@/data/content";
import { C, revealStyle, col } from "@/lib/tokensV2";

const typeLabel: Record<string, string> = {
  startup:     "Professional",
  statuscode2: "Community",
  gdg:         "Community",
  sukriya:     "Professional",
  foss:        "Community",
};

function ExpEntry({ e, delay, isFirst }: { e: typeof experience[0]; delay: number; isFirst: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  const [date, ...rest] = e.meta.split(' | ');
  const type    = typeLabel[e.id] ?? "";
  const details = type ? `${type} | ${rest.join(' | ')}` : rest.join(' | ');
  const fullMeta = type ? `${date} | ${type} | ${rest.join(' | ')}` : e.meta;

  return (
    <div ref={ref} style={{
      marginLeft: "calc(-50vw + 50%)",
      marginRight: "calc(-50vw + 50%)",
      paddingLeft: "calc(50vw - 50%)",
      paddingRight: "calc(50vw - 50%)",
      ...revealStyle(inView, delay),
      transition: `${revealStyle(inView, delay).transition}, background 0.25s`,
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = C.hover; }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ""; }}>
      <div style={{ ...col }}>
        {!isFirst && <div className="v3-heading-line" />}
        <div style={{ paddingTop: 16, paddingBottom: 16 }}>
        <div className="exp-entry-row">
          {/* Left: role + logos + company */}
          <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:8 }}>
            <span className="f16" style={{ fontWeight:500, color:C.t1 }}>{e.role}</span>
            {e.img
              ? (Array.isArray(e.img) ? e.img : [e.img]).map((src: string, idx: number) => (
                  <div key={idx} style={{ width:32, height:32, borderRadius:8, flexShrink:0, overflow:"hidden", border:"1px solid rgba(0,0,0,0.1)"}}>
                    <img src={src} alt={e.company} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                  </div>
                ))
              : <div style={{ width:32, height:32, borderRadius:8, flexShrink:0, background:e.logoBg, border:"1px solid rgba(0,0,0,0.1)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:500, color:"#fff" }}>{e.logo}</div>
            }
            <span className="f16" style={{ fontWeight:500, color:C.t1 }}>{e.company}</span>
          </div>
          {/* Date — desktop right side only */}
          <span className="exp-date f16" style={{ fontWeight:400, color:C.t3 }}>{date}</span>
        </div>
        {/* Mobile: full meta below */}
        <div className="exp-meta-mobile" style={{ fontSize:12, fontWeight:500, color:C.t3, marginTop:8 }}>{fullMeta}</div>
        {/* Desktop: mode + location below */}
        <div className="exp-details-desktop" style={{ fontSize:12, fontWeight:500, color:C.t3, marginTop:8 }}>{details}</div>
        </div>
      </div>
    </div>
  );
}

export default function Experience() {
  return (
    <section id="experience" style={{ ...col, paddingBottom: 0 }} className="v3-section">
      <SectionHeadingV3 title="Experience" eyebrow="SOMEHOW EMPLOYED" />
      <div className="mt-section-card" style={{ marginTop: 0 }}>
        {experience.map((e, i) => (
          <ExpEntry key={e.company} e={e} delay={i * 0.06} isFirst={i === 0} />
        ))}
      </div>
      <style>{`
        .exp-entry-row { display: flex; flex-direction: column; gap: 4px; }
        .exp-date { display: none; }
        .exp-meta-mobile { display: block; }
        .exp-details-desktop { display: none; }
        @media (min-width: 768px) {
          .exp-entry-row { flex-direction: row; align-items: center; justify-content: space-between; gap: 16px; }
          .exp-date { display: block; flex-shrink: 0; }
          .exp-meta-mobile { display: none; }
          .exp-details-desktop { display: block; }
        }
      `}</style>
    </section>
  );
}
