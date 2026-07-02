"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { Leaf,FileText,Store,TrainFront,RefreshCw,Zap,Globe,Home,PenTool,Building2,HardHat } from "lucide-react";
import { useState } from "react";
import SectionHeadingV3 from "@/components/SectionHeadingV3";
import { projects } from "@/data/content";
import { C, tagStyle, tagHv, revealStyle, col } from "@/lib/tokensV2";

const tagIcons: Record<string,React.ReactNode>={
  "AGRICULTURE":<Leaf       size={12} color="#fff" strokeWidth={2}/>,
  "CASE STUDY": <FileText   size={12} color="#fff" strokeWidth={2}/>,
  "RETAIL":     <Store      size={12} color="#fff" strokeWidth={2}/>,
  "TRANSIT":    <TrainFront size={12} color="#fff" strokeWidth={2}/>,
  "REDESIGN":   <RefreshCw  size={12} color="#fff" strokeWidth={2}/>,
  "EV TECH":    <Zap        size={12} color="#fff" strokeWidth={2}/>,
  "WEB DESIGN": <Globe      size={12} color="#fff" strokeWidth={2}/>,
  "INTERIOR":   <Home       size={12} color="#fff" strokeWidth={2}/>,
  "LOGO DESIGN":<PenTool    size={12} color="#fff" strokeWidth={2}/>,
  "AD AGENCY":  <Building2  size={12} color="#fff" strokeWidth={2}/>,
  "IN PROGRESS":<HardHat    size={12} color="#fff" strokeWidth={2}/>,
};

function ProjectCard({p,delay}:{p:typeof projects[0];delay:number}){
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"-10% 0px"});
  const [cursor,setCursor]=useState<{x:number;y:number}|null>(null);
  return(
    <>
      <a ref={ref} href={p.href} target="_blank" rel="noopener noreferrer" style={{borderRadius:4,overflow:"hidden",
        display:"flex",flexDirection:"column",color:"inherit",textDecoration:"none",
        position:"relative",
        background:"#222222",
        ...revealStyle(inView,delay),
        transition:`${revealStyle(inView,delay).transition},box-shadow 0.15s,transform 0.2s cubic-bezier(.22,1,.36,1)`}}
        onMouseEnter={e=>{const el=e.currentTarget;el.style.boxShadow="0 4px 20px rgba(0,0,0,0.4)";el.style.transform="translateY(-4px)";setCursor({x:e.clientX,y:e.clientY});}}
        onMouseMove={e=>{setCursor({x:e.clientX,y:e.clientY});}}
        onMouseLeave={e=>{setCursor(null);const el=e.currentTarget;el.style.boxShadow="";el.style.transform="translateY(0)";}}>
        <div style={{height:192,overflow:"hidden",background:"transparent"}}>
          <img src={p.img} alt={p.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} loading="lazy"/>
        </div>
        <div style={{padding:"16px 16px 0"}}>
          <div className="f16" style={{fontWeight:500,color:"#ffffff"}}>{p.title}</div>
          <div className="f16" style={{fontWeight:400,color:"rgba(255,255,255,0.55)",marginTop:4}}>{p.sub}</div>
        </div>
        <div style={{padding:16,display:"flex",flexWrap:"wrap",gap:8}}>
          {p.tags.map(t=>(
            <div key={t} style={{ ...tagStyle, borderRadius: 4, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.10)", color: "#ffffff" }}>
              {tagIcons[t]}{t}
            </div>
          ))}
        </div>
      </a>
      {cursor && (
        <div style={{
          position:"fixed", left:cursor.x, top:cursor.y,
          transform:"translate(12px, 12px)",
          pointerEvents:"none", zIndex:9999,
          display:"flex", alignItems:"center",
          padding:"6px 14px",
          background:C.card,
          border:`1px solid ${C.borderHv}`,
          borderRadius:"0 4px 4px 4px",
          fontSize:12, fontWeight:500, color:C.t1,
          letterSpacing:"0.08em", whiteSpace:"nowrap",
        }}>
          view project
        </div>
      )}
    </>
  );
}

export default function Projects(){
  return(
    <section id="projects" style={{...col,padding:"64px 24px 0"}}>
      <SectionHeadingV3 num="02" title="Selected Projects" />
      <div className="mt-section" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {projects.map((p,i)=><ProjectCard key={p.title} p={p} delay={i*0.06}/>)}
      </div>
    </section>
  );
}
