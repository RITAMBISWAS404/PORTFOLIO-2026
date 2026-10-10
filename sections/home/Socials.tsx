"use client";
import { MdPublic } from "react-icons/md";
import SectionHeadingV3 from "@/components/home/SectionHeadingV3";
import { socials } from "@/data/home-content";
import { C, col } from "@/lib/home/tokensV2";

export default function Socials() {
  return (
    <section id="socials" style={{ ...col, paddingBottom: 0 }} className="hm-v3-section">
      <SectionHeadingV3 title="My Socials" eyebrow="THE USUAL SUSPECTS" icon={MdPublic} iconSrc="/images/Social.png" iconAfter={1} />
      <div className="hm-mt-section-card" style={{ marginTop: 0 }}>
        {socials.map((s, i) => (
          <a key={s.name} href={s.href} target="_blank" rel="noopener" data-cursor-kind="social" data-cursor-id={s.name.toLowerCase()} style={{
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
              {i !== 0 && <div className="hm-v3-heading-line" />}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", height:58 }}>
                <span className="hm-f16" style={{ fontWeight:500,color:C.t1 }}>{s.name}</span>
                <span className="hm-f16" style={{ fontWeight:500,color:C.t3, transition:"color 0.25s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLSpanElement).style.color = C.t2}
                  onMouseLeave={e => (e.currentTarget as HTMLSpanElement).style.color = C.t3}>
                  {s.handle}
                </span>
              </div>
            </div>
          </a>
        ))}
        <div style={{ ...col }}>
          <div className="hm-v3-heading-line" />
        </div>
      </div>
    </section>
  );
}
