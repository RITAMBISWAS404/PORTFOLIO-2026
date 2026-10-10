// A quiet brand strip (decorative, no focusable content, no hover: the logos are not links). One CSS animation moves a single track holding the sequence twice, so the loop
// is seamless; the duplicate is hidden from assistive technology. Logos are the real assets (lib/home/marqueeLogos.ts), grayscale at reduced opacity via CSS only.
import { MARQUEE_LOGOS, logoLayout } from "@/lib/home/marqueeLogos";

function Sequence({ hidden }: { hidden?: boolean }) {
  return (
    <ul className="hm-lm-seq" aria-hidden={hidden || undefined}>
      {MARQUEE_LOGOS.map(l => {
        const L = logoLayout(l);
        return (
          <li key={l.id} className="hm-lm-item" style={{ ["--w" as string]: `${L.w}px`, ["--h" as string]: `${L.h}px`, ...(l.opacity ? { ["--lo" as string]: l.opacity } : {}) }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={l.src} alt={hidden ? "" : l.name} draggable={false} decoding="async" style={L.img} />
          </li>
        );
      })}
    </ul>
  );
}

export default function LogoMarquee() {
  return (
    <div className="hm-logo-marquee" role="group" aria-label="Communities and teams I've worked with">
      <div className="hm-lm-track">
        <Sequence />
        <Sequence hidden />
      </div>
    </div>
  );
}
