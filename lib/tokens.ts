// Single source of truth — all values are CSS custom properties
// so they respond to [data-theme] changes without React re-renders.
export const C = {
  bg:      "var(--c-bg)",
  card:    "var(--c-card)",
  input:   "var(--c-input)",
  border:  "var(--c-border)",
  borderHv:"var(--c-border-hv)",
  hover:   "var(--c-hover)",
  hoverBg: "var(--c-hover-bg)",
  t1:      "var(--c-t1)",
  t2:      "var(--c-t2)",
  t3:      "var(--c-t3)",
  ph:      "var(--c-ph)",
  accent:  "var(--c-accent)",
  red:     "var(--c-red)",
  yellow:  "var(--c-yellow)",
  blue:    "var(--c-blue)",
};

export const ease = "cubic-bezier(.22,1,.36,1)";
export const col  = { maxWidth: 768, margin: "0 auto" } as const;

export const tagStyle: React.CSSProperties = {
  display:"flex",alignItems:"center",gap:6,padding:"5px 12px 5px 10px",
  border:`1px solid var(--c-border)`,borderRadius:9999,
  fontSize:12,fontWeight:500,color:"var(--c-t1)",letterSpacing:"0.08em",
  whiteSpace:"nowrap",cursor:"default",
  transition:"border-color 0.25s,background 0.25s",
};
export const tagHv=(e:React.MouseEvent,on:boolean)=>{
  const el=e.currentTarget as HTMLElement;
  el.style.borderColor=on?"var(--c-border-hv)":"var(--c-border)";
  el.style.background =on?"var(--c-hover-bg)":"";
};
export const revealStyle=(inView:boolean,delay=0):React.CSSProperties=>({
  opacity:inView?1:0,
  filter:inView?"blur(0px)":"blur(6px)",
  transform:inView?"translateY(0)":"translateY(16px)",
  transition:`opacity 0.7s ${ease} ${delay}s, filter 0.7s ${ease} ${delay}s, transform 0.7s ${ease} ${delay}s`,
});
export const inputBase:React.CSSProperties={
  width:"100%",background:"var(--c-input)",border:`1px solid var(--c-border)`,borderRadius:16,
  padding:12,fontFamily:"Poppins,sans-serif",fontSize:14,fontWeight:400,color:"var(--c-t1)",
  outline:"none",WebkitAppearance:"none",appearance:"none",
  transition:"border-color 0.25s,box-shadow 0.25s,transform 0.25s",
};
