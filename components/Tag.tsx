interface Props { label: string; iconColor?: string; }

export default function Tag({ label, iconColor = "#555" }: Props) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 12px 8px 10px",
      border: "1px solid #222", borderRadius: 9999,
      fontSize: 12, fontWeight: 500, color: "#fff",
      letterSpacing: "0.08em", whiteSpace: "nowrap",
      transition: "border-color 0.25s, background 0.25s",
      cursor: "default",
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = "#2a2a2a";
      (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = "#222";
      (e.currentTarget as HTMLDivElement).style.background = "";
    }}>
      {label}
    </div>
  );
}
