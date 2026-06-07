"use client";
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, MessageCircle, Handshake, Calendar, Smartphone, Network } from "lucide-react";
import { hero } from "@/data/content";
import { C, tagStyle, tagHv } from "@/lib/tokens";
import { useAppReady } from "@/lib/AppReadyContext";

// Staggered entry variants
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)",
             transition: { duration: 0.75, ease: [0.22,1,0.36,1] as [number,number,number,number] } },
};

// Subtle parallax tilt on the avatar
function Avatar() {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const sRx = useSpring(rx,{stiffness:160,damping:22});
  const sRy = useSpring(ry,{stiffness:160,damping:22});
  const transform = useTransform(
    [sRx,sRy], ([x,y]) => `perspective(400px) rotateX(${y}deg) rotateY(${x}deg)`,
  );
  const [egg, setEgg] = useState(false);
  const [cursor, setCursor] = useState<{x:number;y:number}|null>(null);
  const move=(e:React.MouseEvent)=>{
    const r=ref.current!.getBoundingClientRect();
    rx.set(((e.clientX-r.left)/r.width-0.5)*12);
    ry.set(-((e.clientY-r.top)/r.height-0.5)*12);
    setCursor({x:e.clientX, y:e.clientY});
  };
  const leave=()=>{ rx.set(0); ry.set(0); setEgg(false); setCursor(null); };
  return (
    <>
      <div ref={ref} onMouseMove={move} onMouseLeave={leave} onMouseEnter={()=>setEgg(true)}
        style={{position:"relative",width:64,height:64,flexShrink:0}}>
        <motion.div style={{width:64,height:64,borderRadius:16,overflow:"hidden",transform}}>
          <div style={{position:"absolute",inset:0,
            background:"conic-gradient(from 0deg, #20d455, #4488ff, #ff2626, #ffc200, #20d455)",
            filter:"blur(8px)",
            animation:"aura 10s linear infinite"}}/>
          <img src={egg ? "/images/happy-catto.gif" : "/images/avatar.png"}
            alt="Ritam Biswas"
            style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",borderRadius:16}}/>
        </motion.div>
      </div>
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
          Yippee!!!
        </div>
      )}
    </>
  );
}

export default function Hero() {
  const { ready } = useAppReady();
  return (
    <section id="hero" style={{maxWidth:768,margin:"0 auto",padding:"32px 24px 0"}}>
      <motion.div variants={container} initial="hidden" animate={ready ? "show" : "hidden"}
        style={{display:"flex",flexDirection:"column",gap:24}}>

        {/* Identity */}
        <motion.div variants={item} style={{display:"flex",alignItems:"center",gap:16}}>
          <Avatar />
          <div>
            <div className="f16" style={{fontWeight:500,color:C.t1,letterSpacing:"0.01em"}}>{hero.name}</div>
            <div className="f16" style={{fontWeight:400,color:C.t2}}>
              {hero.role} <strong style={{color:C.t1,fontWeight:500}}>{hero.roleHighlight}</strong>
            </div>
          </div>
        </motion.div>

        {/* Bio card */}
        <motion.div variants={item}
          style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,
            padding:16,display:"flex",flexDirection:"column",gap:8}}>
          <span style={{fontSize:12,fontWeight:500,color:C.t1,letterSpacing:"0.08em"}}>BIO</span>
          <p className="f16" style={{fontWeight:400,color:C.t2,lineHeight:1.6}}
            dangerouslySetInnerHTML={{__html:hero.bio
              .replace(/<b>/g,'<strong style="color:#fff;font-weight:500">')
              .replace(/<\/b>/g,'</strong>')}}/>
        </motion.div>

        {/* Badges */}
        <motion.div variants={item} style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {[
            {label:"OPEN TO COLLABORATIONS",icon:<Handshake size={12} color={C.accent} strokeWidth={2}/>},
            {label:"2+ YEARS EXP",          icon:<Calendar size={12} color={C.yellow} strokeWidth={2}/>},
            {label:"MOBILE + WEB UX",       icon:<Smartphone size={12} color={C.blue} strokeWidth={2}/>},
            {label:"SYSTEMS THINKING",      icon:<Network size={12} color={C.red} strokeWidth={2}/>},
          ].map(b=>(
            <div key={b.label} style={tagStyle}
              onMouseEnter={e=>tagHv(e,true)} onMouseLeave={e=>tagHv(e,false)}>
              {b.icon} {b.label}
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div variants={item} className="btn-row">
          <a href="#projects" style={{display:"flex",alignItems:"center",gap:10,
            background:C.t1,color:C.bg,padding:"11px 22px",borderRadius:9999,
            fontSize:14,fontWeight:500,textDecoration:"none",
            transition:"opacity 0.25s,transform 0.25s,box-shadow 0.25s"}}
            onMouseEnter={e=>{const a=e.currentTarget;a.style.opacity="0.9";a.style.transform="translateY(-2px)";a.style.boxShadow="0 4px 16px rgba(0,0,0,0.6)";}}
            onMouseLeave={e=>{const a=e.currentTarget;a.style.opacity="1";a.style.transform="";a.style.boxShadow="";}}>
            <ArrowRight size={14} strokeWidth={2}/> View my Work
          </a>
          <a href="#contact" style={{display:"flex",alignItems:"center",gap:10,
            background:"rgba(255,255,255,0.05)",color:C.t1,padding:"11px 22px",borderRadius:9999,
            fontSize:14,fontWeight:500,textDecoration:"none",
            transition:"background 0.25s,transform 0.25s"}}
            onMouseEnter={e=>{const a=e.currentTarget;a.style.background="rgba(255,255,255,0.09)";a.style.transform="translateY(-2px)";}}
            onMouseLeave={e=>{const a=e.currentTarget;a.style.background="rgba(255,255,255,0.05)";a.style.transform="";}}>
            <MessageCircle size={14} strokeWidth={2}/> Let&apos;s Talk
          </a>
        </motion.div>
      </motion.div>

    </section>
  );
}
