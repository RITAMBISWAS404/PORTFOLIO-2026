// Single source of truth for all design tokens used in inline styles
export const C = {
  bg:      "#0d0d0d",  card:    "#121212",  input:   "#111111",
  border:  "#222222",  borderHv:"#2a2a2a",  hover:   "rgba(255,255,255,0.018)",
  hoverBg: "rgba(255,255,255,0.03)",
  t1:      "#ffffff",  t2:      "#888888",  t3:      "#555555",  ph: "#999999",
  accent:  "#34a853",  red:     "#f43f5e",  yellow:  "#fbbc05",  blue: "#4285f4",
};
export const ease = "cubic-bezier(.22,1,.36,1)";
export const col  = { maxWidth: 768, margin: "0 auto" } as const;

export const tagStyle: React.CSSProperties = {
  display:"flex",alignItems:"center",gap:6,padding:"5px 12px 5px 10px",
  border:`1px solid ${C.border}`,borderRadius:9999,
  fontSize:12,fontWeight:500,color:C.t1,letterSpacing:"0.08em",
  whiteSpace:"nowrap",cursor:"default",
  transition:"border-color 0.25s,background 0.25s",
};
export const tagHv=(e:React.MouseEvent,on:boolean)=>{
  const el=e.currentTarget as HTMLElement;
  el.style.borderColor=on?C.borderHv:C.border;
  el.style.background =on?C.hoverBg:"";
};
export const revealStyle=(inView:boolean,delay=0):React.CSSProperties=>({
  opacity:inView?1:0,transform:inView?"translateY(0)":"translateY(16px)",
  transition:`opacity 0.7s ${ease} ${delay}s,transform 0.7s ${ease} ${delay}s`,
});
export const inputBase:React.CSSProperties={
  width:"100%",background:C.input,border:`1px solid ${C.border}`,borderRadius:16,
  padding:12,fontFamily:"Poppins,sans-serif",fontSize:14,fontWeight:400,color:C.t1,
  outline:"none",WebkitAppearance:"none",appearance:"none",
  transition:"border-color 0.25s,box-shadow 0.25s,transform 0.25s",
};
