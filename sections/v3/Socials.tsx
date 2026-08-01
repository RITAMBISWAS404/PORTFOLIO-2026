"use client";
import { MdPublic } from "react-icons/md";
import SectionHeadingV3 from "@/components/SectionHeadingV3";
import { socials } from "@/data/content";
import { C, col } from "@/lib/tokensV2";

export default function Socials() {
  return (
    <section id="socials" style={{ ...col, paddingBottom: 0 }} className="v3-section">
      <SectionHeadingV3 title="My Socials" eyebrow="THE USUAL SUSPECTS" icon={MdPublic} iconAfter={1} />
      <div className="mt-section-card" style={{ marginTop: 0 }}>
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
            <div style={{ ...col }}>
              {i !== 0 && <div className="v3-heading-line" />}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", height:58 }}>
                <span className="f16" style={{ fontWeight:500,color:C.t1 }}>{s.name}</span>
                <span className="f16" style={{ fontWeight:500,color:C.t3, transition:"color 0.25s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLSpanElement).style.color = C.t2}
                  onMouseLeave={e => (e.currentTarget as HTMLSpanElement).style.color = C.t3}>
                  {s.handle}
                </span>
              </div>
            </div>
          </a>
        ))}
        <div style={{ ...col }}>
          <div className="v3-heading-line" />
        </div>
      </div>
    </section>
  );
}
