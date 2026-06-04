"use client";
import { Layers } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import { stack, stackColors } from "@/data/content";
import { col } from "@/lib/tokens";

export default function Stack(){
  return(
    <section id="stack" style={{...col,padding:"64px 24px 0"}}>
      <SectionLabel icon={Layers} label="MY TECH STACK" num="06" iconColor="#6c57f0"/>
      <div className="mt-section" style={{display:"flex",flexWrap:"wrap",gap:16}}>
        {stack.map((name)=>{
          const c=stackColors[name];
          return(
            <div key={name} style={{
              width:46,height:46,borderRadius:12,overflow:"hidden",flexShrink:0,
              display:"flex",alignItems:"center",justifyContent:"center",
              transition:"transform 0.25s"}}
              onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.transform="translateY(-4px)";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform="";}}>
              <img src={c.img} alt={name} style={{width:46,height:46,objectFit:"contain"}}/>
            </div>
          );
        })}
      </div>
      <p className="f16" style={{fontWeight:400,color:"#888888",lineHeight:1.6,marginTop:24}}>
        Using the right mix of tools, systems, and rapid iteration to turn complex ideas into clean and usable digital experiences.
      </p>
    </section>
  );
}
