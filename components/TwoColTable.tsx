import { C } from "@/lib/tokensV2";
import { tableHeader, tableCellMuted, tableCellStrong } from "@/lib/typography";

interface Props { headers: [string, string]; rows: [string, string][]; }

export default function TwoColTable({ headers, rows }: Props) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {headers.map((h, i) => (
          <div key={i} style={{
            ...tableHeader, padding: "10px 16px",
            borderRight: i === 0 ? `1px solid ${C.border}` : "none",
          }}>{h}</div>
        ))}
      </div>
      {rows.map(([left, right], i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ ...tableCellMuted, padding: "12px 16px", borderTop: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}` }}>{left}</div>
          <div style={{ ...tableCellStrong, padding: "12px 16px", borderTop: `1px solid ${C.border}` }}>{right}</div>
        </div>
      ))}
    </div>
  );
}
