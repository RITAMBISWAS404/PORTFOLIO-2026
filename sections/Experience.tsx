"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { Briefcase } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import { experience } from "@/data/content";
import { C, revealStyle, col } from "@/lib/tokens";

function ExpEntry({ e, delay, isFirst }: { e: typeof experience[0]; delay: number; isFirst: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });

  return (
    <div ref={ref} style={{
      /* Full-width hover via negative margin */
      marginLeft: "calc(-50vw + 50%)",
      marginRight: "calc(-50vw + 50%)",
      paddingLeft: "calc(50vw - 50%)",
      paddingRight: "calc(50vw - 50%)",
      /* Border ONLY between items — not above first */
      ...revealStyle(inView, delay),
      transition: `${revealStyle(inView, delay).transition}, background 0.25s`,
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = C.hover; }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ""; }}>
      <div style={{ ...col, padding: "16px 0", borderTop: isFirst ? "none" : `1px solid ${C.border}` }}>
        <div style={{ display:"flex",alignItems:"center",flexWrap:"wrap",gap:8 }}>
          <span className="f16" style={{ fontWeight:500,color:C.t1 }}>{e.role}</span>
          {e.img
            ? (Array.isArray(e.img) ? e.img : [e.img]).map((src: string, idx: number) => (
                <div key={idx} style={{ width:24,height:24,borderRadius:6,flexShrink:0,overflow:"hidden" }}>
                  <img src={src} alt={e.company} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                </div>
              ))
            : <div style={{ width:24,height:24,borderRadius:6,flexShrink:0,background:e.logoBg,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:500,color:"#fff" }}>{e.logo}</div>
          }
          <span className="f16" style={{ fontWeight:500,color:C.t1 }}>{e.company}</span>
        </div>
        <p className="f16" style={{ fontWeight:400,color:C.t2,lineHeight:1.6,marginTop:8 }}>{e.desc}</p>
        <div style={{ fontSize:12,fontWeight:500,color:C.t3,marginTop:8 }}>{e.meta}</div>
      </div>
    </div>
  );
}

export default function Experience() {
  return (
    <section id="experience" style={{ ...col, padding: "64px 24px 0" }}>
      <SectionLabel icon={Briefcase} label="EXPERIENCE" num="04" iconColor={C.accent} />
      <div style={{ marginTop: 16 }}>
        {experience.map((e, i) => (
          <ExpEntry key={e.company} e={e} delay={i * 0.06} isFirst={i === 0} />
        ))}
      </div>
    </section>
  );
}
