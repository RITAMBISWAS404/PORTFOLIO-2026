"use client";
import { C, col } from "@/lib/tokensV2";

export default function Footer(){
  return(
    <footer style={{...col,padding:"64px 24px 64px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
      <img src="/images/logo.png" alt="Ritam Biswas" style={{width:28,height:28,objectFit:"contain",opacity:0.4}}/>
      <p style={{fontSize:12,fontWeight:500,color:C.t3,letterSpacing:"0.02em"}}>
        &quot;Designing with clarity, minimalism, and purpose&quot;
      </p>
      <p style={{fontSize:12,fontWeight:500,color:C.t3}}>Copyright © 2026 Ritam Biswas. All rights reserved.</p>
    </footer>
  );
}
