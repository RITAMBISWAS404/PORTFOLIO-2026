"use client";
import { Share2 } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import { socials } from "@/data/content";
import { C, col } from "@/lib/tokens";

export default function Socials() {
  return (
    <section id="socials" style={{ ...col, padding: "64px 24px 0" }}>
      <SectionLabel icon={Share2} label="MY SOCIALS" num="08" iconColor={C.blue} />
      <div className="mt-section-card">
        {socials.map((s, i) => (
          <a key={s.name} href={s.href} target="_blank" rel="noopener" style={{
            display: "block", textDecoration: "none", color: "inherit",
            /* Full-width hover */
            marginLeft: "calc(-50vw + 50%)",
            marginRight: "calc(-50vw + 50%)",
            paddingLeft: "calc(50vw - 50%)",
            paddingRight: "calc(50vw - 50%)",
            transition: "background 0.25s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = C.hover; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}>
            <div style={{ ...col, padding: "0", display:"flex",
              borderTop: i === 0 ? "none" : `1px solid ${C.border}`,
              alignItems:"center", justifyContent:"space-between", height:58 }}>
              <span className="f16" style={{ fontWeight:400,color:C.t1 }}>{s.name}</span>
              <span className="f16" style={{ fontWeight:400,color:C.t3, transition:"color 0.25s" }}
                onMouseEnter={e => (e.currentTarget as HTMLSpanElement).style.color = C.t2}
                onMouseLeave={e => (e.currentTarget as HTMLSpanElement).style.color = C.t3}>
                {s.handle}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
