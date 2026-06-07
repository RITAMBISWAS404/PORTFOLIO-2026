export const hero = {
  name: "Ritam Biswas",
  role: "Final Year CSE Student at",
  roleHighlight: "IIIT Kalyani",
  bio: `Most apps that handle complex data feel like a spreadsheet someone dressed up. I'm the designer trying to fix that. <b>Product & UX/UI Designer</b> with <b>2+ years</b> shipping mobile-first products, working directly with founders and engineers to get things live.`,
  badges: [
    { label: "OPEN TO COLLABORATIONS", color: "#34a853" },
    { label: "2+ YEARS EXP" },
    { label: "MOBILE + WEB UX" },
    { label: "SYSTEMS THINKING" },
  ],
};

export const zeno = {
  name: "ZENO",
  sub: "Smart EV Charging Management",
  tags: ["UX DESIGN", "EV APP", "CASE STUDY"],
  desc: `ZENO is a smart EV charging app built to make complex energy data simple and actionable. I designed the product end to end from a blank file: user research, information architecture, wireframes, UI design, and developer handoff across 50+ screens and 6 user flows for iOS and Android. The core challenge was reducing cognitive load without stripping away the data users actually needed to make decisions.`,
  stats: [
    { label: "Screens Designed",   num: "35+", body: "Covers every key user flow from onboarding through dashboard, analytics, and account settings." },
    { label: "User Flows Mapped",  num: "06",  body: "Onboarding, charging session, analytics, history, insights, and account management." },
    { label: "Design Iterations",  num: "02",  body: "Two full product iterations shipped, each informed by real user feedback from beta testing." },
    { label: "Component System",   num: "40+", body: "A full design system built using Figma variables and design tokens for UI consistency." },
  ],
};

export const projects = [
  { title: "Smart farming app",            sub: "AI-powered crop management tool.",  tags: ["AGRICULTURE","IN PROGRESS"],  img: "/images/smart farming.png",  href: "https://www.figma.com/design/YjLXUm3ewgTPgoWfI6Ubz2/Smart-Farming-Assistant?node-id=0-1&t=rZMf4eRmUfzfHB6z-1" },
  { title: "Retail shop management app",   sub: "Built at hackathon, redesigned.",   tags: ["RETAIL","CASE STUDY"],       img: "/images/retail.png",         href: "https://www.notion.so/ShopEZ-33630418f5cc80618b9ac5061264f68e?source=copy_link" },
  { title: "Kolkata metro ticketing app",  sub: "A UX redesign concept.",            tags: ["TRANSIT","REDESIGN"],        img: "/images/kolkata metro.png",  href: "https://www.linkedin.com/posts/ritam404_uiux-uxdesign-uidesign-ugcPost-7448791535992848384-PAQR?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEVuVgMBOr5pHJo3NpKGEmtB_wTvaJQiUsM" },
  { title: "EV charging startup website",  sub: "UX/UI design and Framer build.",    tags: ["EV TECH","WEB DESIGN"],      img: "/images/ev website.png",     href: "https://enkelenergi.framer.website/" },
  { title: "Interior design studio branding", sub: "Brand identity case study.",     tags: ["INTERIOR","LOGO DESIGN"],    img: "/images/interior.png",       href: "https://www.notion.so/Manokamna-Interior-Designs-31830418f5cc80fa91b5f6afaddd5574?source=copy_link" },
  { title: "Typographic brand identity design.", sub: "Brand identity case study.",  tags: ["AD AGENCY","LOGO DESIGN"],   img: "/images/growth.png",         href: "https://www.notion.so/Growth-31930418f5cc80a9b18ef7cf94abc41d?source=copy_link" },
];

export const process = [
  { label: "Understand Clearly", num: "01", body: "Understanding user needs, business goals, and product direction before making design decisions." },
  { label: "Explore Structure",  num: "02", body: "Collecting references, exploring interaction patterns, and building clear visual foundations." },
  { label: "Iterate Rapidly",    num: "03", body: "Designing fast, refining continuously, and improving flows through constant feedback loops." },
  { label: "Ship Thoughtfully",  num: "04", body: "Collaborating closely with developers to ensure scalable and production-ready experiences." },
];

export const experience = [
  {
    id: "startup",
    role: "Product Designer at", company: "Europe-based Smart Energy Startup",
    logo: "🔒", logoBg: "#1a1a1a", img: "/images/stealth.png",
    desc: "Designed and shipped two full iterations of a smart EV charging app for iOS and Android, owning the product end-to-end: user research, information architecture, wireframes, UI design, and developer handoff. Built a 40+ component design system using Figma variables and design tokens. Now live with 3,000+ registered users.",
    meta: "Jan 2024 – Present | Remote | Europe",
  },
  {
    id: "statuscode2",
    role: "Lead Designer at", company: "StatusCode2 (MLH)",
    logo: "SC2", logoBg: "linear-gradient(135deg,#4285f4,#34a853)", img: "/images/status code 2.png",
    desc: "Led end-to-end visual identity and branding for StatusCode2, the flagship MLH-associated hackathon of IIIT Kalyani. Designed the event identity system, promotional graphics, and digital assets used across marketing and participant communication for 4,000+ applicants and 500+ selected participants.",
    meta: "May 2025 – Aug 2025 | Hybrid | IIIT Kalyani",
  },
  {
    id: "gdg",
    role: "Creative Lead at", company: "GDG & WOC 4.0",
    logo: "G", logoBg: "linear-gradient(135deg,#4285f4,#34a853)", img: ["/images/gdg.png", "/images/woc.png"] as string[],
    desc: "Directed visual design and branding for 10+ developer community events at GDG IIIT Kalyani. Also led the complete visual identity for WOC 4.0, a Google Summer of Code-inspired open-source contribution program, designing outreach and onboarding assets for 500+ contributors.",
    meta: "Oct 2024 – Dec 2025 | Hybrid | IIIT Kalyani",
  },
  {
    id: "sukriya",
    role: "UI/UX Intern at", company: "Sukriya",
    logo: "Su", logoBg: "linear-gradient(135deg,#0ea5e9,#6366f1)", img: "/images/sukriya.png",
    desc: "Independently owned the full UX process for a freelance marketplace platform: researched 10+ competing platforms, defined product strategy, and designed 27 iOS screens in Figma. Built dual role-based flows for two personas covering onboarding, discovery, messaging, payments, and project management, along with a reusable component library and Dev Mode specs for developer handoff.",
    meta: "Sep 2024 – Mar 2025 | Remote | Kolkata, India",
  },
  {
    id: "foss",
    role: "Core Team Member at", company: "FOSS",
    logo: "F", logoBg: "#1a1a2e", img: ["/images/Foss 1.png", "/images/Foss 2.png"] as string[],
    desc: "Contributed to two chapters of FOSS United, India's leading open-source community. Served as Lead Designer at the IIIT Kalyani campus club and supported the Kolkata city chapter, creating event posters, promotional creatives, and digital assets across meetups, workshops, and community campaigns.",
    meta: "Dec 2023 – Dec 2024 | Hybrid | Kolkata, India",
  },
];

export const stack = ["Figma","Framer","Claude Code","Claude","Gemini","Stitch","VS Code","Notion","Figr","ProtoPie","Painter","Pinterest"];
export const stackColors: Record<string,{bg:string;color:string;img:string}> = {
  Figma:         { bg:"#0c0a1a", color:"#a259ff", img:"/images/new tech stack/figma.png" },
  Framer:        { bg:"#020d1a", color:"#0055ff", img:"/images/new tech stack/framer.png" },
  "Claude Code": { bg:"#0d0a08", color:"#d4a574", img:"/images/new tech stack/caude code.png" },
  Claude:        { bg:"#0d0a08", color:"#d4a574", img:"/images/new tech stack/ckaude.png" },
  Gemini:        { bg:"#050d1a", color:"#4285f4", img:"/images/new tech stack/gemini.png" },
  v0:            { bg:"#0a0a0a", color:"#e5e5e5", img:"/images/new tech stack/v0.png" },
  Miro:          { bg:"#1a1600", color:"#ffd02f", img:"/images/new tech stack/mizo.png" },
  Stitch:        { bg:"#050d1a", color:"#4285f4", img:"/images/new tech stack/stitch.png" },
  "VS Code":     { bg:"#001933", color:"#007acc", img:"/images/new tech stack/vs code.png" },
  Notion:        { bg:"#191919", color:"#e5e5e5", img:"/images/new tech stack/notion.png" },
  Figr:          { bg:"#0c0a1a", color:"#a259ff", img:"/images/new tech stack/figr.png" },
  ProtoPie:      { bg:"#0d0510", color:"#e5e5e5", img:"/images/new tech stack/protopie.png" },
  Painter:       { bg:"#0a0a0a", color:"#e5e5e5", img:"/images/new tech stack/painter.png" },
  Pinterest:     { bg:"#1a0008", color:"#e60023", img:"/images/new tech stack/pinterrest.png" },
};

export const stackTag: Record<string, string> = {
  Figma:         "Primary",
  Framer:        "No Code",
  "Claude Code": "Vibe Coding",
  Claude:        "Usability",
  Gemini:        "Research",
  v0:            "Generative",
  Miro:          "Whiteboard",
  Stitch:        "AI Design",
  "VS Code":     "Editor",
  Notion:        "Planning",
  Figr:          "Tokens",
  ProtoPie:      "Motion",
  Painter:       "Illustration",
  Pinterest:     "Moodboard",
};

export const stackDesc: Record<string, string> = {
  Figma:         "Primary design tool for all UI/UX work — components, prototypes, and developer handoff.",
  Framer:        "Building interactive prototypes and production-ready no-code websites.",
  "Claude Code": "AI coding assistant for vibe coding, debugging, and shipping real products.",
  Claude:        "AI assistant for research, writing, design thinking, and ideation.",
  Gemini:        "Google's AI for research, content workflows, and exploring design problems.",
  v0:            "Rapidly generating and iterating on UI components from natural language.",
  Miro:          "Collaborative whiteboarding for user flows, journey maps, and workshops.",
  Stitch:        "Google's AI-powered tool for fast UI generation and design exploration.",
  "VS Code":     "Code editor for frontend development, vibe coding, and building real products.",
  Notion:        "Project management, design documentation, and client briefs in one place.",
  Figr:          "Design system management and design token documentation for scalable UI.",
  ProtoPie:      "Advanced interaction prototyping for complex animations and micro-interactions.",
  Painter:       "Digital illustration and visual asset creation for branding and campaigns.",
  Pinterest:     "Visual inspiration and mood boarding for design research and creative direction.",
};

export const socials = [
  { name: "LinkedIn",  handle: "in/ritamhere",    href: "https://linkedin.com/in/ritamhere" },
  { name: "X",         handle: "bisaucee",        href: "https://x.com/bisaucee" },
  { name: "Instagram", handle: "_ritam_here",    href: "https://instagram.com/_ritam_here" },
  { name: "Pinterest", handle: "biswasritam404",  href: "https://in.pinterest.com/biswasritam404/" },
];

export const navLinks = [
  { label: "WORK",       href: "#featured" },
  { label: "PROCESS",    href: "#process" },
  { label: "EXPERIENCE", href: "#experience" },
  { label: "STACK",      href: "#stack" },
  { label: "CONTACT",    href: "#contact" },
  { label: "SOCIALS",    href: "#socials" },
];
