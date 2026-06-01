"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { LayoutGrid,Leaf,FileText,Store,TrainFront,RefreshCw,Zap,Globe,Home,PenTool,Building2 } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import { projects } from "@/data/content";
import { C, tagStyle, tagHv, revealStyle, col } from "@/lib/tokens";

const tagIcons: Record<string,React.ReactNode>={
  "AGRICULTURE":<Leaf       size={12} color={C.accent} strokeWidth={2}/>,
  "CASE STUDY": <FileText   size={12} color={C.blue}   strokeWidth={2}/>,
  "RETAIL":     <Store      size={12} color={C.yellow} strokeWidth={2}/>,
  "TRANSIT":    <TrainFront size={12} color={C.blue}   strokeWidth={2}/>,
  "REDESIGN":   <RefreshCw  size={12} color={C.accent} strokeWidth={2}/>,
  "EV TECH":    <Zap        size={12} color={C.yellow} strokeWidth={2}/>,
  "WEB DESIGN": <Globe      size={12} color={C.blue}   strokeWidth={2}/>,
  "INTERIOR":   <Home       size={12} color="#fdbd39"  strokeWidth={2}/>,
  "LOGO DESIGN":<PenTool    size={12} color={C.accent} strokeWidth={2}/>,
  "AD AGENCY":  <Building2  size={12} color={C.red}    strokeWidth={2}/>,
};

function ProjectCard({p,delay}:{p:typeof projects[0];delay:number}){
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"-10% 0px"});
  return(
    <a ref={ref} href={p.href} target="_blank" rel="noopener noreferrer" style={{border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",
      display:"flex",flexDirection:"column",color:"inherit",textDecoration:"none",
      ...revealStyle(inView,delay),
      transition:`${revealStyle(inView,delay).transition},border-color 0.15s,box-shadow 0.15s,transform 0.2s cubic-bezier(.22,1,.36,1)`}}
      onMouseEnter={e=>{const el=e.currentTarget;el.style.borderColor="rgba(255,255,255,0.12)";el.style.boxShadow="0 4px 20px rgba(0,0,0,0.5)";el.style.transform="translateY(-4px)";}}
      onMouseLeave={e=>{const el=e.currentTarget;el.style.borderColor=C.border;el.style.boxShadow="";el.style.transform="translateY(0)";}}>
      <div style={{height:192,overflow:"hidden",background:C.card}}>
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
  );
}

export default function Projects(){
  return(
    <section id="projects" style={{...col,padding:"64px 24px 0"}}>
      <SectionLabel icon={LayoutGrid} label="PROJECTS GRID" num="02" iconColor={C.blue}/>
      <div className="mt-section" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {projects.map((p,i)=><ProjectCard key={p.title} p={p} delay={i*0.06}/>)}
      </div>
    </section>
  );
}
