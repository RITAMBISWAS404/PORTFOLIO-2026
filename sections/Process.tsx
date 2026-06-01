"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { Lightbulb } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import Card from "@/components/Card";
import { process as pd } from "@/data/content";
import { C, revealStyle, col } from "@/lib/tokens";

export default function Process(){
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"-10% 0px"});
  return(
    <section id="process" style={{...col,padding:"64px 24px 0"}}>
      <SectionLabel icon={Lightbulb} label="PROCESS AND PERSPECTIVE" num="03" iconColor={C.yellow}/>
      <p ref={ref} className="f16 mt-section" style={{fontWeight:400,color:C.t2,lineHeight:1.6,...revealStyle(inView)}}>
        I believe great digital products come from balancing clarity, functionality, and thoughtful systems thinking. My process focuses on understanding problems deeply, exploring structured ideas quickly, and designing scalable experiences that feel intuitive for users and practical for engineering teams.
      </p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16,marginTop:24}}>
        {pd.map((p,i)=><Card key={p.label} label={p.label} num={p.num} body={p.body} delay={i*0.08}/>)}
      </div>
    </section>
  );
}
