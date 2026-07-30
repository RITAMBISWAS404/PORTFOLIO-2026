import { C } from "@/lib/tokensV2";
import { tableHeader, tableCellMuted, tableCellStrong } from "@/lib/typography";

interface Props {
  headers: [string, string, string];
  rows: [string, string, string][];
  /** "graduated": first column muted, rest emphasized (default). "muted": every column muted. */
  cellColor?: "graduated" | "muted";
  preLine?: boolean;
}

export default function ThreeColTable({ headers, rows, cellColor = "graduated", preLine = false }: Props) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", overflowX: "auto" }}>
      <div style={{ minWidth: 480, display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
        {headers.map((h, i) => (
          <div key={i} style={{
            ...tableHeader, padding: "10px 16px",
            borderRight: i < 2 ? `1px solid ${C.border}` : "none",
          }}>{h}</div>
        ))}
      </div>
      {rows.map((row, i) => (
        <div key={i} style={{ minWidth: 480, display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          {row.map((cell, j) => (
            <div key={j} style={{
              ...(cellColor === "graduated" && j === 0 ? tableCellMuted : cellColor === "graduated" ? tableCellStrong : tableCellMuted),
              padding: "12px 16px",
              whiteSpace: preLine ? "pre-line" : undefined,
              borderTop: `1px solid ${C.border}`,
              borderRight: j < 2 ? `1px solid ${C.border}` : "none",
            }}>{cell}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
