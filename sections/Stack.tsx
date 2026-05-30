"use client";
import { Layers } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import { stack, stackColors } from "@/data/content";
import { C, col } from "@/lib/tokens";

export default function Stack(){
  const doubled=[...stack,...stack];
  return(
    <section id="stack" style={{...col,padding:"64px 24px 0"}}>
      <SectionLabel icon={Layers} label="MY TECH STACK" num="06" iconColor="#6c57f0"/>
      <div style={{position:"relative",overflow:"hidden",marginTop:32}}>
        <div style={{position:"absolute",top:0,bottom:0,left:0,width:48,background:`linear-gradient(to right,${C.bg},transparent)`,zIndex:2,pointerEvents:"none"}}/>
        <div style={{display:"flex",gap:24,width:"max-content",animation:"ticker 22s linear infinite",padding:"4px 0"}}>
          {doubled.map((name,i)=>{
            const c=stackColors[name];
            return(
              <div key={i} aria-hidden={i>=stack.length} style={{
                width:46,height:46,flexShrink:0,borderRadius:12,overflow:"hidden",
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"transform 0.25s"}}
                onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.transform="translateY(-4px)";}}
                onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform="";}}>
                <img src={c.img} alt={name} style={{width:46,height:46,objectFit:"contain"}}/>
              </div>
            );
          })}
        </div>
        <div style={{position:"absolute",top:0,bottom:0,right:0,width:48,background:`linear-gradient(to left,${C.bg},transparent)`,zIndex:2,pointerEvents:"none"}}/>
      </div>
      <p className="f16" style={{fontWeight:400,color:C.t2,lineHeight:1.6,marginTop:24}}>
        Using the right mix of tools, systems, and rapid iteration to turn complex ideas into clean and usable digital experiences.
      </p>
      <style>{`@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </section>
  );
}
