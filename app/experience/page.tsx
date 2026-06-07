"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Footer from "@/sections/Footer";
import { C, col, revealStyle } from "@/lib/tokens";

type ExpEntry = {
  id: string;
  role: string;
  company: string;
  logo?: string;
  logoBg?: string;
  img?: string | string[];
  meta: string;
  paragraphs: string[];
};

const experiences: ExpEntry[] = [
  {
    id: "startup",
    role: "Product Designer at",
    company: "Europe-based Smart Energy Startup",
    logo: "🔒", logoBg: "#1a1a1a", img: "/images/stealth.png",
    meta: "Jan 2024 – Present | Remote | Europe",
    paragraphs: [
      "I joined this Copenhagen-based energy startup when they had just an idea and no product.",
      "I owned the design end-to-end from day one: user research, information architecture, screen design, and developer handoff. All of it, from scratch.",
      "The product is a smart EV charging app that helps users charge their car at the cheapest electricity hour of the day. Users can connect their car and charger, set a departure time, set a target charge level, and track their charging history and analytics.",
      "I built a 40+ component design system using Figma variables and design tokens to keep the UI consistent across two full product iterations. The latest version is live on the App Store and Play Store with 3,000+ registered users in Denmark.",
    ],
  },
  {
    id: "statuscode2",
    role: "Lead Designer at",
    company: "StatusCode2 (MLH)",
    logo: "SC2", logoBg: "linear-gradient(135deg,#4285f4,#34a853)", img: "/images/status code 2.png",
    meta: "May 2025 – Aug 2025 | Hybrid | IIIT Kalyani",
    paragraphs: [
      "StatusCode2 is the flagship hackathon of IIIT Kalyani, run in association with Major League Hacking.",
      "I led the complete visual identity and branding for the event from scratch: the event identity system, promotional graphics, social media creatives, and all digital assets used across marketing and participant communication.",
      "The hackathon received 4,000+ applicants and selected 500+ participants.",
      "I was responsible for maintaining a cohesive and professional design language across the entire event experience, from the first promotional post to the final event day assets.",
    ],
  },
  {
    id: "gdg",
    role: "Creative Lead at",
    company: "GDG IIIT Kalyani & Winter of Code 4.0",
    logo: "G", logoBg: "linear-gradient(135deg,#4285f4,#34a853)", img: ["/images/gdg.png", "/images/woc.png"],
    meta: "Oct 2024 – Dec 2025 | Hybrid | IIIT Kalyani",
    paragraphs: [
      "I served as Creative Lead for the Google Developer Group on Campus at IIIT Kalyani, directing visual design and branding across 10+ developer community events throughout the year.",
      "In parallel, I also led the complete visual identity for Winter of Code 4.0, the chapter's flagship open-source contribution program inspired by Google Summer of Code. WOC 4.0 saw 500+ contributors participate across the program.",
      "My work covered everything from the initial identity and outreach assets to onboarding materials and event day creatives, maintaining consistent branding across both initiatives throughout the entire duration.",
    ],
  },
  {
    id: "sukriya",
    role: "UI/UX Design Intern at",
    company: "Sukriya",
    logo: "Su", logoBg: "linear-gradient(135deg,#0ea5e9,#6366f1)", img: "/images/sukriya.png",
    meta: "Sep 2024 – Mar 2025 | Remote | Kolkata, India",
    paragraphs: [
      "I independently owned the full UX process for Sukriya's freelance marketplace platform, starting from scratch with no existing design foundation.",
      "I researched 10+ competing platforms including Fiverr, Upwork, and Behance to identify UX gaps and define the product's core strategy based on what was missing in the market.",
      "I designed 27 iOS screens covering dual role-based user flows for two distinct personas: a Client hiring journey and a Freelancer portfolio journey, spanning onboarding, discovery, messaging, payments, and project management.",
      "I also built a reusable component library and documented screen-level Dev Mode specifications so the engineering team could move straight into development without any back and forth.",
    ],
  },
  {
    id: "foss",
    role: "Lead Designer at",
    company: "FOSS United Kolkata & FOSS IIIT-K",
    logo: "F", logoBg: "#1a1a2e", img: ["/images/Foss 1.png", "/images/Foss 2.png"],
    meta: "Dec 2023 – Dec 2024 | Hybrid | Kolkata, India",
    paragraphs: [
      "I contributed to two chapters of FOSS United, India's leading open-source community.",
      "At the IIIT Kalyani campus club I served as Lead Designer, creating posters, social media content, and promotional creatives for major events and campaigns that improved the club's visibility and reach on digital platforms.",
      "I also supported the Kolkata city chapter, designing event assets, promotional materials, and community campaign visuals across meetups, workshops, and outreach initiatives.",
      "This was my earliest design leadership role and where I built my foundation in visual communication and brand consistency.",
    ],
  },
];

function ExpDetailEntry({ e, isFirst }: { e: ExpEntry; isFirst: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  const imgs = e.img ? (Array.isArray(e.img) ? e.img : [e.img]) : [];

  return (
    <div
      id={e.id}
      ref={ref}
      style={{
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        paddingLeft: "calc(50vw - 50%)",
        paddingRight: "calc(50vw - 50%)",
        ...revealStyle(inView),
        transition: `${revealStyle(inView).transition}, background 0.25s`,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = C.hover; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ""; }}
    >
      {!isFirst && (
        <div style={{ ...col, padding: "0 24px" }}>
          <div style={{ height: 1, background: C.border }} />
        </div>
      )}
      <div style={{ ...col, padding: "24px 24px" }}>

        {/* Role + logos + company */}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span className="f16" style={{ fontWeight: 500, color: C.t1 }}>{e.role}</span>
          {imgs.length > 0
            ? imgs.map((src, idx) => (
                <div key={idx} style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, overflow: "hidden" }}>
                  <img src={src} alt={e.company} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              ))
            : (
                <div style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                  background: e.logoBg, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 10, fontWeight: 500, color: "#fff",
                }}>
                  {e.logo}
                </div>
              )
          }
          <span className="f16" style={{ fontWeight: 500, color: C.t1 }}>{e.company}</span>
        </div>

        {/* Meta */}
        <div style={{ fontSize: 12, fontWeight: 500, color: C.t3, marginTop: 8 }}>{e.meta}</div>

        {/* Paragraphs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
          {e.paragraphs.map((p, i) => (
            <p key={i} className="f16" style={{ fontWeight: 400, color: C.t2, lineHeight: 1.7 }}>{p}</p>
          ))}
        </div>

      </div>
    </div>
  );
}

export default function ExperiencePage() {
  return (
    <main>
      <section style={{ ...col, padding: "48px 24px 0" }}>
        <a href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.05)", color: C.t2,
            border: `1px solid ${C.border}`, padding: "8px 16px",
            borderRadius: 9999, fontSize: 13, fontWeight: 500,
            textDecoration: "none", marginBottom: 32,
            transition: "background 0.25s, color 0.25s, transform 0.25s",
          }}
          onMouseEnter={e => { const a = e.currentTarget; a.style.background = "rgba(255,255,255,0.09)"; a.style.color = C.t1; a.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { const a = e.currentTarget; a.style.background = "rgba(255,255,255,0.05)"; a.style.color = C.t2; a.style.transform = ""; }}
        >
          <ArrowLeft size={13} strokeWidth={2} /> Back to Portfolio
        </a>
        <h1 style={{
          fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 500,
          color: C.t1, lineHeight: 1.35, fontFamily: "Poppins, sans-serif",
          marginBottom: 12,
        }}>
          The Journey So Far
        </h1>
        <p className="f16" style={{ fontWeight: 400, color: C.t2, lineHeight: 1.6 }}>
          Startups, open source, and student communities, each one sharpened something different.
        </p>
      </section>

      <div style={{ marginTop: 32 }}>
        {experiences.map((e, i) => (
          <ExpDetailEntry key={e.company} e={e} isFirst={i === 0} />
        ))}
      </div>

      <div style={{ marginTop: 48 }}>
        <Footer />
      </div>
    </main>
  );
}
