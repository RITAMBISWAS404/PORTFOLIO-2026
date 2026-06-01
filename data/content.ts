export const hero = {
  name: "Ritam Biswas",
  role: "Final Year CSE Student at",
  roleHighlight: "IIIT Kalyani",
  bio: `Namaste, I'm a Product & UX/UI Designer with <b>2+ years</b> building mobile-first experiences for <b>data-heavy digital products</b>. I design scalable interfaces through research, systems thinking, and close collaboration with engineering teams using <b>AI-assisted workflows</b>.`,
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
    { label: "Screens Designed",   num: "50+", body: "Covers every key user flow from onboarding through dashboard, analytics, and account settings." },
    { label: "User Flows Mapped",  num: "06",  body: "Onboarding, charging session, analytics, history, insights, and account management." },
    { label: "Design Iterations",  num: "02",  body: "Two full product iterations shipped, each informed by real user feedback from beta testing." },
    { label: "Component System",   num: "40+", body: "A full design system built using Figma variables and design tokens for UI consistency." },
  ],
};

export const projects = [
  { title: "Smart farming app",            sub: "AI-powered crop management tool.",  tags: ["AGRICULTURE","CASE STUDY"],  img: "/images/smart farming.png",  href: "https://www.figma.com/design/YjLXUm3ewgTPgoWfI6Ubz2/Smart-Farming-Assistant?node-id=0-1&t=rZMf4eRmUfzfHB6z-1" },
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
    role: "Product Designer at", company: "Stealth Startup",
    logo: "🔒", logoBg: "#1a1a1a", img: "/images/stealth.png",
    desc: "Designing the mobile app, website, and design system for a smart energy management platform, currently pre-launch and in stealth. Working closely with engineering on a small team that ships weekly.",
    meta: "Jan 2024 – Present | Remote | Copenhagen, Denmark",
  },
  {
    role: "Lead Designer at", company: "Status Code 2",
    logo: "SC2", logoBg: "linear-gradient(135deg,#4285f4,#34a853)", img: "/images/status code 2.png",
    desc: "Led the visual identity and branding for an MLH-associated hackathon organised by IIT Kalyani. Designed the event identity system, promotional graphics, and digital assets used across marketing and participant communication.",
    meta: "May 2025 – Aug 2025 | Hybrid",
  },
  {
    role: "Lead Designer at", company: "GDG & WOC 4.0",
    logo: "G", logoBg: "linear-gradient(135deg,#4285f4,#34a853)", img: ["/images/gdg.png", "/images/woc.png"] as string[],
    desc: "Led design and visual branding for the Google Developer Group on Campus at IIIT Kalyani. Also directed the complete visual identity for WOC 4.0, the chapter's flagship open-source contribution program.",
    meta: "Oct 2024 – Feb 2025 | Hybrid",
  },
  {
    role: "UI/UX Intern at", company: "Sukriya",
    logo: "Su", logoBg: "linear-gradient(135deg,#0ea5e9,#6366f1)", img: "/images/sukriya.png",
    desc: "Designed mobile interfaces in Figma, covering wireframes, high-fidelity UI, and reusable component libraries. Worked directly alongside developers and continuously refined the product through usability feedback.",
    meta: "Sept 2024 – Mar 2025 | Remote",
  },
  {
    role: "Core Team Member at", company: "FOSS",
    logo: "F", logoBg: "#1a1a2e", img: ["/images/Foss 1.png", "/images/Foss 2.png"] as string[],
    desc: "Contributed to two chapters of India's leading open source community, FOSS United. Led visual design at the IIIT Kalyani campus club and supported the Kolkata city chapter, creating event posters and promotional creatives.",
    meta: "Dec 2023 – Dec 2024 | Hybrid",
  },
];

export const stack = ["Figma","Framer","Claude Code","Claude","Gemini","v0","Miro","Stitch","VS Code","Notion","Figr","ProtoPie","Painter","Pinterest"];
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

export const socials = [
  { name: "LinkedIn",  handle: "in/ritam404",    href: "https://linkedin.com/in/ritam404" },
  { name: "Instagram", handle: "_ritam_here",    href: "https://instagram.com/_ritam_here" },
  { name: "Pinterest", handle: "biswasritam404",  href: "https://in.pinterest.com/biswasritam404/" },
  { name: "X",         handle: "bisaucee",        href: "https://x.com/bisaucee" },
];

export const navLinks = [
  { label: "WORK",       href: "#featured" },
  { label: "PROCESS",    href: "#process" },
  { label: "EXPERIENCE", href: "#experience" },
  { label: "STACK",      href: "#stack" },
  { label: "CONTACT",    href: "#contact" },
];
