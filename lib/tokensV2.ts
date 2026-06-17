// CSS-variable-based design tokens for the /new staging page.
// Values are CSS custom property references so that toggling
// data-theme="light" on <html> re-skins every component automatically
// without any React re-renders — the browser resolves the vars at paint time.
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
  opacity:inView?1:0,
  filter:inView?"blur(0px)":"blur(6px)",
  transform:inView?"translateY(0)":"translateY(16px)",
  transition:`opacity 0.7s ${ease} ${delay}s, filter 0.7s ${ease} ${delay}s, transform 0.7s ${ease} ${delay}s`,
});
export const inputBase:React.CSSProperties={
  width:"100%",background:C.input,border:`1px solid ${C.border}`,borderRadius:16,
  padding:12,fontFamily:"Poppins,sans-serif",fontSize:14,fontWeight:400,color:C.t1,
  outline:"none",WebkitAppearance:"none",appearance:"none",
  transition:"border-color 0.25s,box-shadow 0.25s,transform 0.25s",
};
