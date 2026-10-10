"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { usePathname } from "next/navigation";
import { MdApps } from "react-icons/md";
import SectionHeadingV3 from "@/components/home/SectionHeadingV3";
import { projects } from "@/data/home-content";
import { tagStyle, revealStyle, col } from "@/lib/home/tokensV2";

function ProjectCardBleed({p,delay,isNew}:{p:typeof projects[0];delay:number;isNew:boolean}){
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"0px"});
  return(
    <div ref={ref} className="hm-lift hm-lift-dark" style={{
        borderRadius:8,
        overflow:"hidden",
        boxShadow:isNew?"0px 2px 4px 0px rgba(0,0,0,0.05)":"0px 2px 9px 0px rgba(0,0,0,0.05)",
        ...revealStyle(inView,delay),
        transition:`${revealStyle(inView,delay).transition}, translate 200ms cubic-bezier(.22,1,.36,1), box-shadow 200ms cubic-bezier(.22,1,.36,1), border-color 200ms cubic-bezier(.22,1,.36,1)`,
      }}>
      <a href={p.href} target="_blank" rel="noopener noreferrer" data-cursor-kind="project" data-cursor-id={p.id} className="hm-proj-card-row" style={{
        color:"inherit", textDecoration:"none",
        background:"var(--hm-black, #222222)",
      }}>
        {/* Text: eyebrow, title, short description, orange USP, then pills pinned to the bottom */}
        <div className="hm-proj-card-text" style={{
          display:"flex", flexDirection:"column", justifyContent:"space-between", gap:16,
        }}>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{fontSize:12,fontWeight:600,color:"#909090",letterSpacing:"0.06em",textTransform:"uppercase"}}>{p.eyebrow}</div>
            <div className="hm-proj-title" style={{fontWeight:600,color:"#ffffff",lineHeight:1.3}}>{p.title}</div>
            <p className="hm-f16" style={{margin:0,fontWeight:500,color:"rgba(255,255,255,0.72)",lineHeight:1.55}}>{p.desc}</p>
            <div style={{fontSize:14,fontWeight:600,color:"#ED7454",lineHeight:1.4,marginTop:4}}>{p.usp}</div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {p.tags.map(t=>(
              <div key={t} style={{...tagStyle,padding:"5px 12px",border:"none",borderRadius:isNew?4:"var(--hm-pill-radius, 9999px)",boxShadow:"none",background:"var(--hm-pill-fill, rgba(255,255,255,0.10))",color:"#ffffff"}}>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Image: wraps the image at its natural size — image drives card height, full width on mobile */}
        <div className="hm-proj-card-imgwrap">
          <img src={p.cardImg} alt={p.title} width={836} height={720} style={{ display:"block", width:"100%", height:"auto" }} loading="lazy"/>
        </div>
      </a>
    </div>
  );
}

export default function Projects(){
  const pathname = usePathname();
  const isNew = pathname === "/new" || pathname?.startsWith("/new/");

  return(
    <section id="projects" style={{...col}} className="hm-v3-section">
      <SectionHeadingV3 title="Selected Projects" eyebrow="THERE'S MORE" icon={MdApps} iconSrc="/images/Selected%20project.png" iconAfter={1} />
      <div className="hm-mt-section" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(360px,100%),1fr))",gap:16}}>
        {projects.map((p,i)=><ProjectCardBleed key={p.title} p={p} delay={i*0.06} isNew={isNew}/>)}
      </div>
      <style>{`
        .hm-proj-card-row { display: flex; flex-direction: column; gap: 0; }
        .hm-proj-card-text { padding: 20px; }
        .hm-proj-title { font-size: 18px; }
        .hm-proj-card-imgwrap { display: flex; align-items: flex-end; }
        @media (min-width: 768px) {
          .hm-proj-card-row { flex-direction: row; gap: 0; }
          .hm-proj-card-text { flex: 0 0 41.944%; min-width: 0; }
          .hm-proj-title { font-size: 20px; }
          .hm-proj-card-imgwrap { flex: 0 0 58.056%; }
        }
      `}</style>
    </section>
  );
}
