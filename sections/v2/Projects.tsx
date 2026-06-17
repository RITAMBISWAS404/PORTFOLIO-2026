"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { Icon } from "@iconify/react";
import { useState } from "react";
import SectionLabelV2 from "@/components/SectionLabelV2";
import { projects } from "@/data/content";
import { C, tagStyle, tagHv, revealStyle, col } from "@/lib/tokensV2";

const tagIcons: Record<string,React.ReactNode>={
  "AGRICULTURE":<Icon icon="solar:leaf-bold"             width={12} color={C.accent} />,
  "CASE STUDY": <Icon icon="solar:file-text-bold"        width={12} color={C.blue}   />,
  "RETAIL":     <Icon icon="solar:shop-bold"             width={12} color={C.yellow} />,
  "TRANSIT":    <Icon icon="solar:tram-bold"             width={12} color={C.blue}   />,
  "REDESIGN":   <Icon icon="solar:restart-bold"          width={12} color={C.accent} />,
  "EV TECH":    <Icon icon="solar:bolt-bold"             width={12} color={C.yellow} />,
  "WEB DESIGN": <Icon icon="solar:earth-bold"            width={12} color={C.blue}   />,
  "INTERIOR":   <Icon icon="solar:home-bold"             width={12} color="#fdbd39"  />,
  "LOGO DESIGN":<Icon icon="solar:pen-new-square-bold"   width={12} color={C.accent} />,
  "AD AGENCY":  <Icon icon="solar:buildings-bold"        width={12} color={C.red}    />,
  "IN PROGRESS":<Icon icon="solar:hard-hat-bold"         width={12} color={C.yellow} />,
};

function ProjectCard({p,delay}:{p:typeof projects[0];delay:number}){
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"-10% 0px"});
  const [glow,setGlow]=useState("");
  const [cursor,setCursor]=useState<{x:number;y:number}|null>(null);
  return(
    <>
      <a ref={ref} href={p.href} target="_blank" rel="noopener noreferrer" style={{border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",
        display:"flex",flexDirection:"column",color:"inherit",textDecoration:"none",
        position:"relative",
        background: glow || C.card,
        ...revealStyle(inView,delay),
        transition:`${revealStyle(inView,delay).transition},border-color 0.15s,box-shadow 0.15s,transform 0.2s cubic-bezier(.22,1,.36,1)`}}
        onMouseMove={e=>{
          const r=e.currentTarget.getBoundingClientRect();
          const x=(((e.clientX-r.left)/r.width)*100).toFixed(1);
          const y=(((e.clientY-r.top)/r.height)*100).toFixed(1);
          setGlow(`radial-gradient(circle at ${x}% ${y}%, var(--color-card-glow) 0%, var(--color-card) 65%)`);
          setCursor({x:e.clientX,y:e.clientY});
        }}
        onMouseEnter={e=>{const el=e.currentTarget;el.style.borderColor="var(--color-card-hover-border)";el.style.boxShadow="var(--shadow-card-hover)";el.style.transform="translateY(-4px)";}}
        onMouseLeave={e=>{setGlow("");setCursor(null);const el=e.currentTarget;el.style.borderColor=C.border;el.style.boxShadow="";el.style.transform="translateY(0)";}}>
        <div style={{height:192,overflow:"hidden",background:"transparent"}}>
          <img src={p.img} alt={p.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} loading="lazy"/>
        </div>
        <div style={{padding:"16px 16px 0"}}>
          <div className="f16" style={{fontWeight:500,color:C.t1}}>{p.title}</div>
          <div className="f16" style={{fontWeight:400,color:C.t2,marginTop:4}}>{p.sub}</div>
        </div>
        <div style={{padding:16,display:"flex",flexWrap:"wrap",gap:8}}>
          {p.tags.map(t=>(
            <div key={t} style={tagStyle} onMouseEnter={e=>tagHv(e,true)} onMouseLeave={e=>tagHv(e,false)}>
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
          borderRadius:"0 9999px 9999px 9999px",
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
      <SectionLabelV2 icon="solar:widget-4-bold" label="SELECTED PROJECTS" num="02" iconColor={C.blue}/>
      <div className="mt-section" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {projects.map((p,i)=><ProjectCard key={p.title} p={p} delay={i*0.06}/>)}
      </div>
    </section>
  );
}
