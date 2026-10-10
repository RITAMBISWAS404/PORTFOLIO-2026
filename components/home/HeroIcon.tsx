"use client";
// Decorative sticker icon inside the Hero heading. It is no longer a manual drag target: the Icon Courier (courierController.ts, via useHeroCourier) delivers it into
// the heading, and it then keeps the same tiny stop-motion idle tilt it always had. Purely decorative: not a control, not focusable, no cursor label.
export default function HeroIcon({ src, idle }: { src: string; idle: "icon1" | "icon2" }) {
  return (
    <span className="hm-icon">
      <span className={`hm-hs-idle hm-idle-${idle}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" draggable={false} style={{ display: "block", width: "1.2em", height: "1.2em", objectFit: "contain" }} />
      </span>
    </span>
  );
}
