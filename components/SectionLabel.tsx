"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { eyebrow } from "@/lib/typography";

interface Props { icon:LucideIcon; label:string; num:string; iconColor?:string; iconHref?:string; iconTarget?:string; }

export default function SectionLabel({ icon:Icon, label, num, iconColor="var(--color-text-3)", iconHref, iconTarget }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-20% 0px" });
  const iconEl = <Icon size={14} color={iconColor} strokeWidth={2}/>;
  return (
    <div ref={ref} style={{display:"flex",alignItems:"center",gap:8,minHeight:15}}>
      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        {iconHref
          ? <a href={iconHref} target={iconTarget} rel={iconTarget === "_blank" ? "noopener noreferrer" : undefined} style={{display:"flex",alignItems:"center",color:"inherit",textDecoration:"none"}} title="View case study">{iconEl}</a>
          : iconEl}
        <span style={{...eyebrow,color:"var(--color-text-1)",whiteSpace:"nowrap"}}>{label}</span>
      </div>
      <div style={{flex:1,height:1,background:"var(--color-border)",transformOrigin:"left center",
        transform:inView?"scaleX(1)":"scaleX(0)",
        transition:"transform 0.9s cubic-bezier(.22,1,.36,1) 0.15s"}}/>
      <span style={{...eyebrow,color:"var(--color-text-1)",flexShrink:0,
        opacity:inView?1:0,transition:"opacity 0.6s ease 0.5s"}}>{num}</span>
    </div>
  );
}
