"use client";
import { usePathname } from "next/navigation";
import { C, col } from "@/lib/tokensV2";

const FOOTER_PC_SRC = "/images/footer-pc.png";
const FOOTER_MOBILE_SRC = "/images/footer-mobile.png";

export default function Footer(){
  const pathname = usePathname();
  const isNew = pathname === "/new" || pathname?.startsWith("/new/");
  const logoSrc = "/images/logo_dark.png";

  if (!isNew) {
    return (
      <footer className="footer-img-wrap" style={{ position: "relative" }}>
        <div className="footer-img-breakout">
          <picture>
            <source media="(min-width: 768px)" srcSet={FOOTER_PC_SRC} />
            <img src={FOOTER_MOBILE_SRC} alt="" style={{ display: "block", width: "100%", height: "auto" }} />
          </picture>
        </div>
        <style>{`
          .footer-img-wrap { padding-top: 16px; }
          .footer-img-breakout {
            position: relative;
            left: 50%;
            width: 100vw;
            margin-left: -50vw;
            z-index: 1;
          }
          @media (min-width: 768px) {
            .footer-img-wrap { padding-top: 32px; }
            .footer-img-breakout {
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
