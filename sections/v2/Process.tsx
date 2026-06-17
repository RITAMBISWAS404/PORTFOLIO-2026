"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { Lightbulb } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import Card from "@/components/Card";
import { process as pd } from "@/data/content";
import { C, revealStyle, col } from "@/lib/tokensV2";

export default function Process(){
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"-10% 0px"});
  return(
    <section id="process" style={{...col,padding:"64px 24px 0"}}>
      <SectionLabel icon={Lightbulb} label="HOW I WORK" num="03" iconColor={C.yellow}/>
      <p ref={ref} className="f16 mt-section" style={{fontWeight:400,color:C.t2,lineHeight:1.6,...revealStyle(inView)}}>
        Good design doesn&apos;t happen by accident. I follow a clear headspace when approaching any problem, starting with understanding, moving through exploration, and always ending with something that actually ships.
      </p>
      <div className="process-grid" style={{gap:16,marginTop:24}}>
        {pd.map((p,i)=><Card key={p.label} label={p.label} num={p.num} body={p.body} delay={i*0.08}/>)}
      </div>
      <style>{`
        .process-grid { display: grid; grid-template-columns: 1fr; }
        @media (min-width: 768px) { .process-grid { grid-template-columns: 1fr 1fr 1fr; } }
      `}</style>
    </section>
  );
}
