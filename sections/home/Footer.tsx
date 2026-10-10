"use client";
import { usePathname } from "next/navigation";
import { C, col } from "@/lib/home/tokensV2";
import FooterStage from "@/components/home/FooterStage";

export default function Footer(){
  const pathname = usePathname();
  const isNew = pathname === "/new" || pathname?.startsWith("/new/");
  const logoSrc = "/images/logo_dark.png";

  if (!isNew) {
    return (
      <footer className="hm-footer-img-wrap" style={{ position: "relative" }}>
        <div className="hm-footer-img-breakout">
          {/* Layered board + objects (idle motion; hover/drag on desktop). Replaces the old flattened footer-pc / footer-mobile images. */}
          <FooterStage />
          <span className="hm-sr-only">Copyright © 2026 Ritam Biswas. All rights reserved.</span>
        </div>
        <style>{`
          .hm-footer-img-wrap { padding-top: 16px; pointer-events: none; }   /* desktop clip box reaches above the footer; only the objects take pointer events */
          .hm-footer-img-breakout {
            position: relative;
            pointer-events: none;
            left: 50%;
            width: 100vw;
            margin-left: -50vw;
            z-index: 1;
          }
          .hm-fs-desktop-wrap { display: none; pointer-events: none; }
          .hm-sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
          @media (min-width: 768px) {
            .hm-fs-desktop-wrap { display: block; }
            .hm-fs-mobile-wrap { display: none; }
            .hm-footer-img-wrap { padding-top: 32px; }
            .hm-footer-img-breakout {
              width: min(900px, 96vw);
              margin-left: calc(min(900px, 96vw) / -2);
            }
          }
        `}</style>
      </footer>
    );
  }

  return(
    <footer style={{...col,padding:"64px 24px 64px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
      <img src={logoSrc} alt="Ritam Biswas" style={{width:28,height:28,objectFit:"contain"}}/>
      <p style={{fontSize:12,fontWeight:600,color:C.t3,letterSpacing:"0.02em"}}>
        &quot;Yes, I know border-radius exists&quot;
      </p>
      <p style={{fontSize:12,fontWeight:600,color:C.t3}}>Copyright © 2026 Ritam Biswas. All rights reserved.</p>
    </footer>
  );
}
