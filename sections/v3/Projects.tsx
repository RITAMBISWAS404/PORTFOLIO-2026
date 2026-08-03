"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { usePathname } from "next/navigation";
import { MdApps } from "react-icons/md";
import SectionHeadingV3 from "@/components/SectionHeadingV3";
import { projects } from "@/data/content";
import { tagStyle, revealStyle, col } from "@/lib/tokensV2";

function ProjectCardBleed({p,delay,isNew}:{p:typeof projects[0];delay:number;isNew:boolean}){
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"0px"});
  return(
    <div ref={ref} style={{
        borderRadius:isNew?8:0,
        overflow:"hidden",
        boxShadow:isNew?"0px 2px 4px 0px rgba(0,0,0,0.05)":"none",
        ...revealStyle(inView,delay),
        transition:`${revealStyle(inView,delay).transition},transform 0.2s cubic-bezier(.22,1,.36,1)`,
      }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";}}>
      <a href={p.href} target="_blank" rel="noopener noreferrer" className="proj-card-row" style={{
        color:"inherit", textDecoration:"none",
        background:"var(--exp-black, #222222)",
      }}>
        {/* Text: eyebrow + description, tags pinned to the bottom */}
        <div className="proj-card-text" style={{
          display:"flex", flexDirection:"column", justifyContent:"space-between", gap:16,
        }}>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:"#909090",letterSpacing:"0.06em",textTransform:"uppercase"}}>{p.title}</div>
            <div className="f16" style={{fontWeight:600,color:"#ffffff",marginTop:8}}>{p.desc}</div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {p.tags.map(t=>(
              <div key={t} style={{...tagStyle,border:"none",borderRadius:isNew?4:0,boxShadow:"none",background:"rgba(255,255,255,0.10)",color:"#ffffff"}}>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Image: wraps the image at its natural size — image drives card height, full width on mobile */}
        <div className="proj-card-imgwrap">
          <img src={p.cardImg} alt={p.title} style={{ display:"block", width:"100%", height:"auto" }} loading="lazy"/>
        </div>
      </a>
    </div>
  );
}

export default function Projects(){
  const pathname = usePathname();
  const isNew = pathname === "/new" || pathname?.startsWith("/new/");

  return(
    <section id="projects" style={{...col}} className="v3-section">
      <SectionHeadingV3 title="Selected Projects" eyebrow="THERE'S MORE" icon={MdApps} iconSrc="/images/Selected%20project.png" iconAfter={1} />
      <div className="mt-section" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(360px,1fr))",gap:16}}>
        {projects.map((p,i)=><ProjectCardBleed key={p.title} p={p} delay={i*0.06} isNew={isNew}/>)}
      </div>
      <style>{`
        .proj-card-row { display: flex; flex-direction: column; gap: 0; }
        .proj-card-text { padding: 20px; }
        .proj-card-imgwrap { display: flex; align-items: flex-end; }
        @media (min-width: 768px) {
          .proj-card-row { flex-direction: row; gap: 0; }
          .proj-card-text { flex: 0 0 41.944%; min-width: 0; }
          .proj-card-imgwrap { flex: 0 0 58.056%; }
        }
      `}</style>
    </section>
  );
}
