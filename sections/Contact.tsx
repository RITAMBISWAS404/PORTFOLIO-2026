"use client";
import { useState, useRef } from "react";
import { Mail, Send, Check, AlertCircle } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import { C, inputBase, col } from "@/lib/tokens";

// ─── Formspree endpoint — replace FORM_ID with yours from formspree.io ─────
// 1. Go to https://formspree.io → New Form → get your form ID
// 2. Replace "YOUR_FORM_ID" below with it (e.g. "xpzgkdbn")
// 3. Formspree sends every submission to the email you register with
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mredrnrp";

type Status = "idle" | "sending" | "sent" | "error";

const lbl: React.CSSProperties = {
  fontSize:14, fontWeight:500, color:C.t3, display:"block", marginBottom:8,
};
const focusIn =(e:React.FocusEvent<HTMLElement>)=>{
  e.target.style.borderColor=C.t3;
  e.target.style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)";
  e.target.style.transform="translateY(-1px)";
};
const focusOut=(e:React.FocusEvent<HTMLElement>)=>{
  e.target.style.borderColor=C.border;
  e.target.style.boxShadow="";
  e.target.style.transform="";
};

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status==="sending"||status==="sent") return;
    const form = formRef.current!;
    const data = new FormData(form);
    // Basic validation
    if (!data.get("name")||!data.get("email")||!data.get("message")) return;
    setStatus("sending");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method:"POST", body:data, headers:{Accept:"application/json"},
      });
      if (res.ok) { setStatus("sent"); form.reset(); setTimeout(()=>setStatus("idle"),5000); }
      else setStatus("error");
    } catch { setStatus("error"); }
  };

  const btnBg   = status==="sent" ? "#1a2a1a" : status==="error" ? "#2a1a1a" : "#333";
  const btnCol  = status==="sent" ? C.accent   : status==="error" ? C.red      : C.t1;
  const btnIcon = status==="sent" ? <Check size={14} strokeWidth={1.75}/>
                : status==="error"? <AlertCircle size={14} strokeWidth={1.75}/>
                : status==="sending"? null
                : <Send size={14} strokeWidth={1.75}/>;
  const btnLabel= status==="sent" ? "Sent!" : status==="error" ? "Try again"
                : status==="sending" ? "Sending…" : "Submit";

  return (
    <section id="contact" style={{...col,padding:"64px 24px 0"}}>
      <SectionLabel icon={Mail} label="LETS CONNECT" num="07" iconColor={C.accent}/>

      <form ref={formRef} onSubmit={handleSubmit}
        style={{display:"flex",flexDirection:"column",gap:20,marginTop:32}}>

        <div style={{display:"grid",gridTemplateColumns:"1fr",gap:16}}>
          <div>
            <label htmlFor="f-name" style={lbl}>Name</label>
            <input id="f-name" name="name" type="text" placeholder="Your name" required
              style={{...inputBase,height:44}}
              onFocus={focusIn as React.FocusEventHandler} onBlur={focusOut as React.FocusEventHandler}/>
          </div>
          <div>
            <label htmlFor="f-email" style={lbl}>Email</label>
            <input id="f-email" name="email" type="email" placeholder="you@company.com" required
              style={{...inputBase,height:44}}
              onFocus={focusIn as React.FocusEventHandler} onBlur={focusOut as React.FocusEventHandler}/>
          </div>
        </div>

        <div>
          <label htmlFor="f-type" style={lbl}>What are you looking for?</label>
          <select id="f-type" name="type" required
            style={{...inputBase,height:44,cursor:"pointer",color:C.ph,
              backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23555'/%3E%3C/svg%3E\")",
              backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center",paddingRight:36}}
            onFocus={focusIn as React.FocusEventHandler} onBlur={focusOut as React.FocusEventHandler}
            defaultValue="">
            <option value="" disabled>Select…</option>
            <option value="Freelance Project">Freelance Project</option>
            <option value="Full-time Role">Full-time Role</option>
            <option value="Collaboration">Collaboration</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="f-msg" style={lbl}>Project / Message</label>
          <textarea id="f-msg" name="message" placeholder="Tell me a bit about the project, role, or idea." required
            style={{...inputBase,height:110,resize:"none"}}
            onFocus={focusIn as React.FocusEventHandler} onBlur={focusOut as React.FocusEventHandler}/>
        </div>

        {/* Hidden honeypot — Formspree spam protection */}
        <input type="text" name="_gotcha" style={{display:"none"}}/>

        <button type="submit" disabled={status==="sending"||status==="sent"}
          style={{height:44,background:btnBg,color:btnCol,borderRadius:9999,border:"none",
            cursor:status==="sending"||status==="sent"?"not-allowed":"pointer",
            fontFamily:"Poppins,sans-serif",fontSize:14,fontWeight:500,
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            transition:"background 0.25s,color 0.25s,transform 0.25s,box-shadow 0.25s",
            opacity:status==="sending"?0.7:1}}
          onMouseEnter={e=>{if(status==="idle"){const b=e.currentTarget;b.style.background="#3a3a3a";b.style.transform="translateY(-2px)";b.style.boxShadow="0 1px 3px rgba(0,0,0,0.5)";}}}
          onMouseLeave={e=>{const b=e.currentTarget;b.style.background=btnBg;b.style.transform="";b.style.boxShadow="";}}>
          {btnIcon}{btnLabel}
        </button>
      </form>

    </section>
  );
}
