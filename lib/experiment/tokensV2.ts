// Isolated copy of lib/tokensV2.ts for /experiment-live. Edit freely — nothing
// here is shared with the live site's token file.
export const C = {
  bg:      "var(--color-bg)",
  card:    "var(--color-card)",
  input:   "var(--color-input)",
  border:  "var(--color-border)",
  borderHv:"var(--color-border-hover)",
  hover:   "var(--color-hover)",
  hoverBg: "var(--color-hover-bg)",
  t1:      "var(--color-text-1)",
  t2:      "var(--color-text-2)",
  t3:      "var(--color-text-3)",
  ph:      "var(--color-placeholder)",
  accent:  "var(--color-accent)",
  red:     "var(--color-red)",
  yellow:  "var(--color-yellow)",
  blue:    "var(--color-blue)",
};

export const ease = "cubic-bezier(.22,1,.36,1)";
export const col  = { maxWidth: 768, margin: "0 auto" } as const;

// Figma: https://www.figma.com/design/bNFl0RkpGoTcFlRArpiUeI/portfolio-recreate?node-id=12-1645
// White pill, no stroke, subtle drop-shadow instead of a border, full 9999px radius.
export const tagStyle: React.CSSProperties = {
  display:"flex",alignItems:"center",gap:6,padding:"5px 12px",
  border:"none",borderRadius:9999,
  boxShadow:"0px 2px 4px 0px rgba(0,0,0,0.05)",
  fontSize:12,fontWeight:700,color:C.t1,letterSpacing:"0.08em",
  whiteSpace:"nowrap",cursor:"default",
  transition:"background 0.25s,box-shadow 0.25s",
};
export const tagHv=(e:React.MouseEvent,on:boolean)=>{
  const el=e.currentTarget as HTMLElement;
  el.style.borderColor=on?C.borderHv:C.border;
  el.style.background =on?C.hoverBg:"";
};
export const revealStyle=(inView:boolean,delay=0):React.CSSProperties=>({
  opacity:inView?1:0,
  filter:inView?"blur(0px)":"blur(6px)",
  transform:inView?"translateY(0)":"translateY(16px)",
  transition:`opacity 0.7s ${ease} ${delay}s, filter 0.7s ${ease} ${delay}s, transform 0.7s ${ease} ${delay}s`,
});
export const inputBase:React.CSSProperties={
  width:"100%",background:C.input,border:`1px solid ${C.border}`,borderRadius:8,
  padding:12,fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:14,fontWeight:500,color:C.t1,
  outline:"none",WebkitAppearance:"none",appearance:"none",
  transition:"border-color 0.25s,box-shadow 0.25s,transform 0.25s",
};
