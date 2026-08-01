"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { useState } from "react";
import { MdApps } from "react-icons/md";
import SectionHeadingV3 from "@/components/SectionHeadingV3";
import { projects } from "@/data/content";
import { C, tagStyle, tagHv, revealStyle, col } from "@/lib/tokensV2";

function ProjectCard({p,delay}:{p:typeof projects[0];delay:number}){
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"0px"});
  const [cursor,setCursor]=useState<{x:number;y:number}|null>(null);
  return(
    <>
      {/* Outer wrapper carries the card-level shadow (no stroke) */}
      <div ref={ref} style={{
          borderRadius:8,
          overflow:"hidden",
          boxShadow:"0px 2px 4px 0px rgba(0,0,0,0.05)",
          ...revealStyle(inView,delay),
          transition:`${revealStyle(inView,delay).transition},transform 0.2s cubic-bezier(.22,1,.36,1)`,
        }}
        onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";setCursor({x:e.clientX,y:e.clientY});}}
        onMouseMove={e=>{setCursor({x:e.clientX,y:e.clientY});}}
        onMouseLeave={e=>{setCursor(null);e.currentTarget.style.transform="translateY(0)";}}>

        {/* Inner anchor: no background — children set their own */}
        <a href={p.href} target="_blank" rel="noopener noreferrer" style={{
          display:"flex", flexDirection:"column",
          color:"inherit", textDecoration:"none",
        }}>
          {/* Image — no stroke, white background */}
          <div style={{height:192,overflow:"hidden",background:"#ffffff"}}>
            <img src={p.img} alt={p.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} loading="lazy"/>
          </div>
          {/* Title + description — dark background */}
          <div style={{padding:"16px 16px 0",background:"#222222"}}>
            <div style={{fontSize:12,fontWeight:600,color:"#909090",letterSpacing:"0.06em",textTransform:"uppercase"}}>{p.title}</div>
            <div className="f16" style={{fontWeight:600,color:"#ffffff",marginTop:4}}>{p.desc}</div>
          </div>
          {/* Pills — dark background */}
          <div style={{padding:16,display:"flex",flexWrap:"wrap",gap:8,background:"#222222"}}>
            {p.tags.map(t=>(
              <div key={t} style={{...tagStyle,border:"none",borderRadius:4,boxShadow:"none",background:"rgba(255,255,255,0.10)",color:"#ffffff"}}>
                {t}
              </div>
            ))}
          </div>
        </a>
      </div>

      {cursor&&(
        <div style={{
          position:"fixed",left:cursor.x,top:cursor.y,
          transform:"translate(12px,12px)",
          pointerEvents:"none",zIndex:9999,
          display:"flex",alignItems:"center",
          padding:"6px 14px",
          background:C.card,border:`1px solid ${C.borderHv}`,
          borderRadius:"0 8px 8px 8px",
          fontSize:12,fontWeight:600,color:C.t1,
          letterSpacing:"0.08em",whiteSpace:"nowrap",
        }}>
          view project
        </div>
      )}
    </>
  );
}

export default function Projects(){
  return(
    <section id="projects" style={{...col}} className="v3-section">
      <SectionHeadingV3 title="Selected Projects" eyebrow="THERE'S MORE" icon={MdApps} iconAfter={1} />
      <div className="mt-section" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {projects.map((p,i)=><ProjectCard key={p.title} p={p} delay={i*0.06}/>)}
      </div>
    </section>
  );
}
