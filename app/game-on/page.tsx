"use client";
import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";
import {
  MdViewList, MdTimeline, MdFormatQuote, MdLightbulb, MdInfo, MdPerson,
  MdCake, MdNearMe, MdVerifiedUser, MdMobileFriendly, MdEditNote, MdTouchApp,
} from "react-icons/md";
import Footer from "@/sections/v3/Footer";
import GridLines from "@/components/GridLines";
import NavbarNew from "@/components/NavbarNew";
import { ThemeProvider } from "@/lib/ThemeContext";
import SectionHeadingV3 from "@/components/SectionHeadingV3";
import CardV3 from "@/components/CardV3";
import TwoColTable from "@/components/TwoColTable";
import ThreeColTable from "@/components/ThreeColTable";
import DecisionBase from "@/components/Decision";
import { C, col, revealStyle } from "@/lib/tokensV2";
import { FLAT_CARD_VARS } from "@/lib/caseStudySurfaces";
import OrangeCursor from "@/components/home/OrangeCursor";
import { gameOnCursor, GAMEON_COLOR } from "@/lib/caseStudyCursor";
import "../cursor.css";

// GameON is a concept project (never launched). Every claim on this page comes from the original project file and its Notion write-up; where a number in the
// designs is only a claim (the "3x faster" note nudge) or a metric is only a hypothesis, the copy says so.
const BRAND = GAMEON_COLOR;   // GameON red: card icons, decision labels and the cursor
const IMG = "/game-on/";

/* ── Callouts ───────────────────────────────────────────────────── */

function Perspective({ text }: { text: string }) {
  return <CardV3 icon={MdFormatQuote} label="Perspective" body={`“${text}”`} iconColor={BRAND} noHover cursorId="callout-quote" />;
}
function Insight({ text }: { text: string }) {
  return <CardV3 icon={MdLightbulb} label="Insight" body={text} iconColor={BRAND} noHover cursorId="callout-insight" />;
}

/* ── Scroll reveal ──────────────────────────────────────────────── */

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });
  return <div ref={ref} style={revealStyle(inView, delay)}>{children}</div>;
}

/* ── Decision block ─────────────────────────────────────────────── */

function Decision(props: { num: string; title: string; first?: boolean; cursorId: string; children: React.ReactNode }) {
  return <DecisionBase {...props} lineClassName="go-decision-line" labelColor={BRAND} />;
}

/* ── Images ─────────────────────────────────────────────────────── */

// w/h are the file's pixel size, so the aspect ratio is reserved before it loads. `bare`: a phone render with its own rounded corners (no frame drawn around it).
function GoImg({ file, alt, w, h, caption, bare = false, cursorId }: { file: string; alt: string; w: number; h: number; caption?: string; bare?: boolean; cursorId?: string }) {
  return (
    <figure data-cursor-id={cursorId} style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", margin: 0 }}>
      <img
        src={IMG + file} alt={alt} width={w} height={h} loading="lazy" decoding="async"
        style={{ width: "100%", height: "auto", display: "block", borderRadius: bare ? 0 : 8, border: bare ? "none" : `1px solid ${C.border}` }}
      />
      {caption && <figcaption style={{ fontSize: 12, fontWeight: 500, color: C.t3, textAlign: "center", lineHeight: 1.5 }}>{caption}</figcaption>}
    </figure>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>{children}</p>;
}

/* ── Page-level section navigator ───────────────────────────────── */

const NAV_SECTIONS = [
  { id: "go-problem",     label: "The Problem" },
  { id: "go-flow",        label: "The Flow" },
  { id: "go-decisions",   label: "Decisions" },
  { id: "go-exploration", label: "Iterations" },
  { id: "go-screens",     label: "Screens" },
  { id: "go-assumptions", label: "Assumptions" },
  { id: "go-metrics",     label: "Metrics" },
  { id: "go-reflection",  label: "Reflection" },
];

function PageNav() {
  const [active,  setActive]  = useState("go-problem");
  const [visible, setVisible] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const activeObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    NAV_SECTIONS.forEach(({ id }) => { const el = document.getElementById(id); if (el) activeObs.observe(el); });

    const firstEl = document.getElementById("go-problem");
    const footerEl = document.getElementById("go-footer");
    let raf = 0;
    // Shown from the moment the case study content begins until the footer reaches the nav's own bottom edge (same logic as /zeno and /shopez).
    const update = () => {
      raf = 0;
      const nav = navRef.current;
      if (!firstEl || !nav) return;
      const started = firstEl.getBoundingClientRect().top < window.innerHeight * 0.4;
      const footerReached = !!footerEl && footerEl.getBoundingClientRect().top <= nav.getBoundingClientRect().bottom;
      setVisible(started && !footerReached);
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    return () => { activeObs.disconnect(); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); ro.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <nav ref={navRef} className="go-page-nav" data-cursor-id="go-page-nav" aria-label="Case study sections" style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "all" : "none", transition: "opacity 0.4s ease" }}>
      {NAV_SECTIONS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button key={id}
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              display: "flex", alignItems: "center", gap: 8, textAlign: "left",
              fontSize: 12, fontWeight: isActive ? 600 : 500,
              color: isActive ? C.t1 : C.t3,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: "color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = C.t2}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = isActive ? C.t1 : C.t3}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}

function Divider() {
  return <div style={{ width: "100%", height: 0, borderTop: "1px solid var(--color-border)" }} />;
}

/* ── Page ───────────────────────────────────────────────────────── */

export default function GameOnPage() {
  return (
    <ThemeProvider defaultTheme="light">
      <OrangeCursor color={gameOnCursor.color} labelFor={gameOnCursor.labelFor} />
      <NavbarNew homePath="/" />
      <main style={{ position: "relative", ...FLAT_CARD_VARS }} className="v3-white-bg">
        <GridLines />
        <PageNav />

      {/* ── HERO ────────────────────────────────────────────── */}
      <section data-cursor-id="go-hero" style={{ ...col, paddingBottom: 0 }} className="v3-section">
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div>
              <div className="f16" style={{ fontWeight: 700, color: C.t1, letterSpacing: "-0.01em" }}>Game<span style={{ color: BRAND }}>ON</span></div>
              <div className="f16" style={{ fontWeight: 500, color: C.t2 }}>Find a nearby game, with no club to join</div>
            </div>
          </div>

          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 650, letterSpacing: "-0.02em", color: C.t1, lineHeight: 1.15, marginBottom: 24 }}>
            No club, no commitment: designing the moment a stranger asks to join your game.
          </h1>

          <P>You decide to play again, and nobody you used to play with is free. A club would fix that, but it asks for a long-term commitment. I designed the opposite: one flow, five screens, from &ldquo;what&apos;s near me?&rdquo; to &ldquo;you&apos;re in&rdquo;, and the hardest part of it is not finding a game. It is asking a stranger to let you in.</P>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
            <CardV3 icon={MdInfo} label="What this is" iconColor={BRAND} noHover cursorId="go-note"
              body="A mobile product concept, never launched, made for a design brief that asked for one flow, the directions I explored, my assumptions and the metrics it might move. Nothing here was user tested: the project file records no interviews or usability tests, so every assumption and metric below is labelled as an assumption or a hypothesis." />
            <CardV3 icon={MdPerson} label="My role and scope" iconColor={BRAND} noHover cursorId="go-role"
              body="Solo designer, from the desk research through the paper wireframes to the final dark-mode screens and a prototype video. Scope was one happy-path flow, chosen on purpose over a shallow pass at every state." />
          </div>
        </Reveal>
      </section>

      {/* ── HERO IMAGE ──────────────────────────────────────── */}
      <div style={{ ...col, paddingBottom: 0 }} className="v3-section">
        <div data-cursor-id="go-hero-image" className="go-hero-panel">
          <img
            src={IMG + "hero-phone.webp"} width={1600} height={1571} decoding="async"
            alt="The GameON dashboard on a tilted smartphone: Live sports near you, sport filter chips, and a live Sunday 5v5 Kickabout game card with a Follow button."
            style={{ width: "100%", maxWidth: 520, height: "auto", display: "block" }}
          />
        </div>
      </div>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section data-cursor-id="go-stats" style={{ ...col }} className="v3-section">
        <div className="go-stats-grid">
          <CardV3 label="5 Screens" body="Dashboard, Event Info, Request to Join, My Request and All Set." delay={0}    noHover iconColor={BRAND} icon={MdMobileFriendly} cursorId="go-stat-screens" />
          <CardV3 label="4 Directions" body="Create a Game, Browse and Join, Sports Feed and Court Booking. One was chosen." delay={0.08} noHover iconColor={BRAND} icon={MdTimeline} cursorId="go-stat-directions" />
          <CardV3 label="2 Sketch Sheets" body="The whole flow was drawn on paper before it was designed in Figma." delay={0.16} noHover iconColor={BRAND} icon={MdEditNote} cursorId="go-stat-sketches" />
        </div>
      </section>

      <Divider />

      {/* ── 01 THE PROBLEM ──────────────────────────────────── */}
      <section id="go-problem" data-cursor-id="go-problem" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="The problem: wanting to play, with no one to play with" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <P>Schedules fill up, people relocate, and the friends you used to play with scatter. Clubs and classes offer a way back in, but they ask for a long-term commitment that not everyone can make. So someone who just wants a game on Sunday has nobody to ask.</P>
          </Reveal>
          <Reveal delay={0.06}>
            <Perspective text="Help adults find someone to play with, nearby, without any long-term commitment." />
          </Reveal>
          <Reveal delay={0.1}>
            <P>I looked through community platforms, Reddit threads and online discussions about recreational sports. This was desk research, not interviews, so the three themes below are informed starting points, not validated findings. Each one went straight into a screen.</P>
          </Reveal>
          <div className="go-three-grid" data-cursor-id="go-research">
            <CardV3 icon={MdCake} label="Age over skill" body="People want to play with someone in the same phase of life, not only the same skill bracket. It became the age range on every game card." iconColor={BRAND} noHover delay={0}    cursorId="go-research-card" />
            <CardV3 icon={MdNearMe} label="Distance matters" body="A great game 15 km away on a Sunday morning is not practical. Distance stays visible from the dashboard to the confirmation." iconColor={BRAND} noHover delay={0.08} cursorId="go-research-card" />
            <CardV3 icon={MdVerifiedUser} label="Trust is a concern" body="People are open to new players but uneasy about who shows up, and hosts feel the same. It became the request note and the verified badge." iconColor={BRAND} noHover delay={0.16} cursorId="go-research-card" />
          </div>
          <Reveal delay={0.1}>
            <Insight text="Full verification, by photo or identity, was out of scope. The verified badge signals that a trust layer exists without designing it, so trust in this concept rests on the organiser card and the note, not on verification." />
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* ── 02 THE FLOW (SOLUTION JOURNEY) ──────────────────── */}
      <section id="go-flow" data-cursor-id="go-flow" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="One flow, five screens: from “what’s near me?” to “you’re in”" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <P>The player is someone who has not played in a while, is new to the app, and does not know the host. The table follows that one player. The middle column is the question I assumed they have at each step, which is my design intent and not research. The right column is the call I made to answer it.</P>
          </Reveal>
          <Reveal delay={0.06}>
            <GoImg file="flow-five-screens.webp" w={2800} h={1243} bare cursorId="go-flow-image"
              alt="The five screens of the primary flow in a row: Dashboard, Event Info, Request to Join, My Request and All Set, shown in the dark red-accented UI."
              caption="The primary flow, from the dashboard to the confirmed state." />
          </Reveal>
          <Reveal delay={0.1}>
            <div data-cursor-id="go-journey">
              <ThreeColTable
                headers={["Screen", "What the player is trying to work out", "The call I made"]}
                rows={[
                  ["1. Dashboard", "Is anything happening near me, and is it for someone like me?", "Sport chips filter the whole screen. Every card carries age range and distance, so the answer is on the card, not behind a tap (decision 4)."],
                  ["2. Event Info", "Who is this host, and what am I walking into?", "The organiser card comes before date, time and place. A fill bar and rule chips follow, so the commitment is clear before the request (decision 3)."],
                  ["3. Request to Join", "How do I ask a stranger without it feeling cold?", "A bottom sheet over the blurred event, with an optional note. Writing nothing is allowed (decision 2)."],
                  ["4. My Request", "Did it go through, and what did they actually see?", "The sent note is echoed back, a Pending chip says nothing is confirmed, and Browse more games keeps the player moving."],
                  ["5. All Set", "Am I in, and what do I do now?", "A Confirmed chip, where and when in one block, then three next steps that work for any sport: directions, group chat, invite a friend."],
                ]}
              />
            </div>
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* ── 03 DECISION STORIES ─────────────────────────────── */}
      <section id="go-decisions" data-cursor-id="go-decisions" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="Five decisions that shaped the flow" />
        <div className="mt-section">

          <Decision num="01" title="Why I chose Browse and Join over creating a game, a feed or booking a court" first cursorId="go-d1">
            <P>Four ways to answer the same brief were on the table, and three of them made the player do work before they could play. Court booking was the brief&apos;s own example flow, and I still set it aside.</P>
            <div data-cursor-id="go-directions">
              <ThreeColTable
                headers={["Direction", "What it is", "Why it was or was not pursued"]}
                rows={[
                  ["Create a Game",   "The user sets up a session, picks a sport, time and place, then waits for others.", "Too much upfront effort for someone who just wants to play, not plan and organise."],
                  ["Browse and Join (chosen)", "See what is nearby, pick a game, request to join.", "Lowest friction, and it works for every sport."],
                  ["Sports Feed",     "A scrollable feed of nearby sports activity, like Instagram for local games.", "Too passive. Browsing posts does not get you into a game."],
                  ["Court Booking",   "Book a venue first, then find players to fill the slots.", "It puts venue booking and payments before people, so it solves the wrong problem first."],
                ]}
              />
            </div>
            <P>The trade-off is real: Browse and Join gives up everything a host would want, such as creating and managing a session, and it only works if games already exist nearby. I accepted both for one reason. It asks nothing of a player who just opened the app. The security worry went into the request itself, through the note (decision 2).</P>
            <P>Nothing was tested with players, so this is a judgement about friction, not a measured result.</P>
          </Decision>

          <Decision num="02" title="Why a request to join carries an optional note, and is never auto-accepted" cursorId="go-d2">
            <P>Joining means asking a host to say yes to a stranger. My first idea was to remove that question: auto-accept anyone verified. I dropped it, because it takes the organiser out of a decision that belongs to them, and a verified user can still be the wrong fit for a specific game.</P>
            <div className="go-split">
              <GoImg file="phone-request-sheet.webp" w={786} h={1704} bare cursorId="go-d2-image"
                alt="The Request to join bottom sheet over a blurred event screen, with an optional note field holding a short introduction, a 112 of 300 character count, a Send request button and a Maybe later button." />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <P>That left the host deciding on a faceless request. So I borrowed LinkedIn&apos;s connect with a note: up to 300 characters, so a request arrives as an introduction. The host reads it, and can open the requester&apos;s profile, games played and rating, before accepting.</P>
                <P>I considered making the note mandatory and rejected it. A required field costs the most at the moment someone is deciding, which is the drop-off point I least wanted to touch. So the sheet nudges, and Maybe later sits under the primary button as plain text with no visual weight.</P>
                <P>The sheet&apos;s copy says hosts approve requests with notes 3x faster. That number is a claim written into the concept. I did not measure it, and it would need real data before it belonged in a product. The working mockups show the copy getting there: an early version said only that hosts approve faster with a friendly intro.</P>
              </div>
            </div>
            <div className="go-split">
              <GoImg file="phone-my-request.webp" w={786} h={1704} bare cursorId="go-d3-image"
                alt="The My Request screen: a Request sent illustration, a red Pending host approval chip, and a card showing the note the user sent to Rohan, with event details below and a Browse more games button." />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <P>After sending, the player waits, which is where a note could feel like it vanished. The pending screen echoes it back, so the player sees exactly what the host received. A Pending host approval chip says nothing is confirmed yet, and Browse more games stops the wait from being a dead end.</P>
                <P>What is still unknown is whether hosts read the notes at all, and whether a note raises approval or only adds writing for the player. That is the first thing I would test.</P>
              </div>
            </div>
          </Decision>

          <Decision num="03" title="Why the organiser comes before the date, time and place" cursorId="go-d3">
            <GoImg file="crop-organiser-card.webp" w={786} h={165} cursorId="go-d3-organiser"
              alt="The organiser card at the top of the Event Info screen: Rohan, 34 with a verified badge, 24 games organised and a 4.9 rating."
              caption="The organiser card is the first thing on the Event Info screen." />
            <P>The research said people are uneasy about who shows up. The alternative was to lead with when and where, the facts needed to decide. I reversed that: if the host does not feel trustworthy, the time and place do not matter, so the player reads the person first.</P>
            <P>It also answered the stranger concern inside the flow, without adding a step. The cost is that the practical facts sit one card lower, and the verified badge only signals trust, because real verification was out of scope. I did not test whether players read the card in this order.</P>
          </Decision>

          <Decision num="04" title="Why every card shows an age range and a distance, and no skill level" cursorId="go-d4">
            <div className="go-split go-split-wide">
              <GoImg file="crop-meta-grid.webp" w={786} h={350} cursorId="go-d4-image"
                alt="The Event Info details grid: Date and Time Today 6:00 PM, Ages 25 to 40, and Location Salt Lake Stadium with 1.2 km away." />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <P>Matching by skill level was the alternative, and the research pointed somewhere else: people want to play with someone in the same phase of life. Skill cannot be verified. Age can. So each card answers the question people actually ask, is this my kind of crowd?</P>
                <P>Distance sits beside it, because a great game 15 km away on a Sunday morning is not practical. The host sets the age range and players cannot change it, which keeps the crowd the host intended.</P>
                <P>The trade-off is exclusion. An age range can shut out someone who would have fit the game perfectly, and a mixed-skill game has no skill signal at all. Both rest on desk research, not on players, so they stay assumptions.</P>
              </div>
            </div>
          </Decision>

          <Decision num="05" title="Why I took the cost out of the screens" cursorId="go-d5">
            <P>The working HTML mockups from 23 June show a version of the flow with money in it: a rupee-per-head price on the game cards, a cost badge, a price on the Request to join button and a payment reminder on the confirmation. The submitted screens have none of it.</P>
            <P>My reasoning, from the project file: casual sports in India are social, not transactional, so cost was removed from the whole UI. If there is a ground fee to split, that happens in the group chat after confirmation.</P>
            <P>What I gave up is clarity. A player may want to know what a game costs before asking to join, and pushing the fee into the chat moves an awkward conversation to after the commitment. I made the call to keep the request about people, not payment, and I did not test it. It is the assumption I would be least surprised to see fail.</P>
          </Decision>

        </div>
      </section>

      <Divider />

      {/* ── 03b SMALLER CALLS ───────────────────────────────── */}
      <section data-cursor-id="go-small" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="Smaller calls that kept the screens consistent" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <div className="go-pair">
              <GoImg file="crop-card-live-follow.webp" w={676} h={645} cursorId="go-cta-live" alt="A live game card with a Follow button." caption="Live: Follow" />
              <GoImg file="crop-card-upcoming-join.webp" w={726} h={407} cursorId="go-cta-join" alt="An upcoming game card with spots available and a Join button." caption="Upcoming with spots: Join" />
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <GoImg file="crop-player-cards.webp" w={726} h={425} cursorId="go-player-cards"
              alt="Two player cards in a horizontal strip: Rohan, 34 and Priya, 28, each with a verified badge, a sport badge on the avatar, a distance, and a Connect button." />
          </Reveal>
          <Reveal delay={0.08}>
            <TwoColTable
              headers={["Decision", "Reasoning"]}
              rows={[
                ["The button follows the state of the game", "A game can be live, upcoming with spots, or upcoming and full, so the button is Follow, Join or Notify Me. A full game still gives the player something to do, and today's full game can be tomorrow's live one to follow. Notify Me is described in the project file but not drawn in the five final screens."],
                ["Player cards borrow familiar patterns", "A horizontal strip like Instagram's suggested profiles, name and age on one line (Rohan, 34) as dating apps do, and a sport badge on the avatar instead of extra text."],
              ]}
            />
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* ── 04 ITERATION ARCHIVE ────────────────────────────── */}
      <section id="go-exploration" data-cursor-id="go-exploration" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="What I drew, tried and dropped" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <P>Everything was sketched on paper before I opened Figma. Two sheets cover the whole flow, and the first one is where the dashboard was still undecided: one concept with a hero banner, one without it and with filter chips instead. The submitted dashboard uses the chips.</P>
          </Reveal>
          <Reveal delay={0.06}>
            <GoImg file="wireframe-sheet-1-dashboard-event.webp" w={1139} h={825} cursorId="go-sheet-1"
              alt="Hand-drawn orange pen wireframes on dotted paper: Dashboard 1 with a hero banner, Concept 2 with no hero banner and filter chips instead, and an early Event Detail screen with a name, meta grid, organiser row and two CTAs."
              caption="Sheet 1: Dashboard 1 with a hero banner, Concept 2 without it and with filter chips, and an early Event Detail." />
          </Reveal>
          <Reveal delay={0.1}>
            <GoImg file="wireframe-sheet-2-request-flow.webp" w={1139} h={825} cursorId="go-sheet-2"
              alt="Hand-drawn orange pen wireframes of the request flow: a Connect Note bottom sheet over a blurred screen, a Request Sent screen with an echoed note, and a Request Accept screen with event data and instructions."
              caption="Sheet 2: the request flow, from the note sheet to Request Sent and Request Accept." />
          </Reveal>
          <Reveal delay={0.14}>
            <P>The note sheet, the echoed note on Request Sent and the accepted screen are all already on sheet 2, so the core layout of the request flow was settled on paper. Figma adjusted it, it did not redesign it.</P>
          </Reveal>
          <Reveal delay={0.16}>
            <P>Between the sketches and the submitted screens there are three working HTML mockups of the flow and a colour reference. These are the iterations I can show from files that exist today. Their file dates are 23 June 2026, and I treat the order as Mockup 1 to 3.</P>
          </Reveal>
          <Reveal delay={0.18}>
            <div data-cursor-id="go-iterations">
              <ThreeColTable
                headers={["Version", "What it contained", "What changed from the version before"]}
                rows={[
                  ["Mockup 1", "A dark, near-black base. The player flow, plus a host screen listing join requests with Approve and Decline. Two live cards on the dashboard.", "First version. The note prompt said only that a friendly intro helps hosts approve faster."],
                  ["Mockup 2", "A warmer dark gray base. The player flow from dashboard to approved, with one live card and one starting soon. The host screen is gone.", "The live card stays red and the second card turns blue. The note prompt gains the 3x faster claim, and the pending state is explained as honest: orange means waiting, not success."],
                  ["Mockup 3", "The most detailed version: organiser stats, a fill bar, rules, age range and a price per head on cards, and a payment reminder on the confirmation.", "Cards become information-dense. It is the latest of the three, and the one that shows cost."],
                  ["Submitted screens", "Five screens, player side only, with no cost and no host screen.", "Red marks Pending and blue marks Confirmed. Cost and the host view are gone."],
                ]}
              />
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <Insight text="The colour reference written during these rounds assigns roles: red for action and urgency, blue for information, orange for pending and cost, green for confirmation only after the host approves. The submitted screens do not follow it everywhere. Pending is red, Confirmed is blue and orange appears on the Tomorrow badge. I show both rather than pretend the system survived unchanged." />
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* ── 05 SCREEN DETAILS ───────────────────────────────── */}
      <section id="go-screens" data-cursor-id="go-screens" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="Inside the five screens" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <Reveal>
            <P>The journey above shows the order. These are the calls inside each screen, at the top and scrolled.</P>
          </Reveal>

          <div className="go-screen-block" data-cursor-id="go-screen-dashboard">
            <div className="go-screen-label" style={{ color: BRAND }}>SCREEN 01 · DASHBOARD</div>
            <GoImg file="screens-dashboard.webp" w={1612} h={1704} bare alt="The Dashboard screen at the top and scrolled: sport filter chips, a Happening now live card, Players near you cards and a Games this week list." />
            <TwoColTable
              headers={["Element", "The call"]}
              rows={[
                ["Sport filter chips", "They filter the whole screen and the heading updates to match, so the page always says what it is showing."],
                ["One card pattern, used twice", "Happening Now and Games This Week share the same card, horizontal and vertical. Age range, time and distance are always in the same place."],
              ]}
            />
          </div>

          <div className="go-screen-block" data-cursor-id="go-screen-event">
            <div className="go-screen-label" style={{ color: BRAND }}>SCREEN 02 · EVENT INFO</div>
            <GoImg file="screens-event-info.webp" w={1612} h={1704} bare alt="The Event Info screen at the top and scrolled: a sport illustration, organiser card, meta grid, a players fill bar showing 7 joined and 3 spots open, rules chips and an About this game note." />
            <TwoColTable
              headers={["Element", "The call"]}
              rows={[
                ["Hero illustration", "It communicates the sport before any text is read."],
                ["Players fill bar", "7 joined, 3 spots open, 70% full. It signals urgency without extra copy."],
                ["Rules chips and About", "They set expectations up front: clean boots, water and bibs provided, arrive 10 minutes early."],
                ["Request to join", "A sticky CTA that stays visible while the player scrolls."],
              ]}
            />
          </div>

          <div className="go-screen-block" data-cursor-id="go-screen-request">
            <div className="go-screen-label" style={{ color: BRAND }}>SCREEN 03 · REQUEST TO JOIN</div>
            <GoImg file="screens-request-join.webp" w={1612} h={1704} bare alt="Event Info on the left and the Request to join bottom sheet on the right, over a blurred version of the same screen." />
            <TwoColTable
              headers={["Element", "The call"]}
              rows={[
                ["Bottom sheet over a blurred event", "The player never leaves the context they are deciding about."],
                ["Blue focus border on the note", "The focused field stays distinct from the red CTAs, so blue means input and red means action."],
              ]}
            />
          </div>

          <div className="go-screen-block" data-cursor-id="go-screen-pending">
            <div className="go-screen-label" style={{ color: BRAND }}>SCREEN 04 · MY REQUEST</div>
            <GoImg file="screens-my-request.webp" w={1612} h={1704} bare alt="The My Request screen at the top and scrolled, with the Request sent illustration, the echoed note, and the event details with a players fill bar." />
            <TwoColTable
              headers={["Element", "The call"]}
              rows={[
                ["Pending chip", "Red while the request awaits approval, so it is clear that nothing is confirmed yet."],
                ["Event details stay below", "Context is not lost while the player waits."],
                ["Declined state", "Not drawn. This screen covers the pending state only, and the declined state is a known gap."],
              ]}
            />
          </div>

          <div className="go-screen-block" data-cursor-id="go-screen-confirmed">
            <div className="go-screen-label" style={{ color: BRAND }}>SCREEN 05 · ALL SET</div>
            <GoImg file="screens-all-set.webp" w={1612} h={1704} bare alt="The All Set screen at the top and scrolled: a Request accepted illustration, a blue Confirmed chip, event details, and three next-step cards: Get directions, Join the group chat and Invite a friend." />
            <TwoColTable
              headers={["Element", "The call"]}
              rows={[
                ["Confirmed chip", "It turns blue once the host approves, so the change from pending to confirmed needs no extra copy."],
                ["Three generic next steps", "Get directions, Join the group chat and Invite a friend work for any sport, so the cards are reusable across every game type."],
              ]}
            />
          </div>
        </div>
      </section>

      <Divider />

      {/* ── 06 ASSUMPTIONS, SCOPE, METRICS ──────────────────── */}
      <section id="go-assumptions" data-cursor-id="go-assumptions" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="What I assumed, and what I left out" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <P>These are design assumptions, not validated findings. The project file does not include user testing that confirms them.</P>
          </Reveal>
          <Reveal delay={0.06}>
            <TwoColTable
              headers={["Assumption", "What follows from it"]}
              rows={[
                ["No payments in the flow", "Cost is removed from the whole UI. A fee to split is settled in the group chat (decision 5)."],
                ["Location access is granted", "Every near-you feature depends on location permission being on."],
                ["People play near where they live or work", "Users want games within a short distance, which is why distance is on every card."],
                ["The host sets the age range", "Players cannot change it, which protects the social fit of each session (decision 4)."],
              ]}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <Insight text="The documented flow is the primary happy path only: find a game, send a request, get confirmed. Declined requests, status indicators on cards for games already applied to, empty states when no games are nearby, and the host's side of the request were outside it. I chose one complete, coherent flow over a shallow pass at every state." />
          </Reveal>
        </div>
      </section>

      <Divider />

      <section id="go-metrics" data-cursor-id="go-metrics" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="What the design might move (untested)" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <P>GameON was never launched and nothing below was measured. These are hypotheses I would want to test, each tied to a decision above.</P>
          </Reveal>
          <Reveal delay={0.06}>
            <TwoColTable
              headers={["Potential metric", "Why the design might move it"]}
              rows={[
                ["Join request rate", "Asking with a note could feel less cold than asking with a bare button, so more people might send one (decision 2)."],
                ["Host approval rate", "Notes give hosts context to decide with more confidence. This is the 3x claim, and it is still only a claim."],
                ["Return session rate", "Confirmed players may come back, and the Invite a friend card puts a growth moment on the confirmation screen."],
                ["Player connect rate", "Players Near You could build a social graph over time that leads to games organised without the app."],
              ]}
            />
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* ── 07 REFLECTION ───────────────────────────────────── */}
      <section id="go-reflection" data-cursor-id="go-reflection" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="What I'd defend, and what I'd test next" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <P>The decisions I would defend most are about where to add friction and where to remove it. Creating a game, auto-accepting and a mandatory note each moved effort or control to the wrong place.</P>
          </Reveal>
          <div className="go-three-grid">
            <CardV3 icon={MdVerifiedUser} label="Spend friction where trust is built" body="Security came from a visible organiser and a note, not extra steps. Keeping the organiser in the decision mattered more than automating it away." iconColor={BRAND} noHover delay={0}    cursorId="go-reflect-trust" />
            <CardV3 icon={MdTouchApp} label="Make the helpful step optional" body="The note nudges instead of forcing, because a required field costs the most at the moment someone is deciding." iconColor={BRAND} noHover delay={0.08} cursorId="go-reflect-optional" />
            <CardV3 icon={MdViewList} label="Draw the unhappy paths next" body="Declined requests, applied-state indicators, empty states and the full-game Notify Me state still need designing." iconColor={BRAND} noHover delay={0.16} cursorId="go-reflect-edge" />
          </div>
          <Reveal delay={0.1}>
            <P>What I would test first, in this order: whether hosts read the notes at all, whether the age range excludes people a host would have welcomed, and whether players want to see a price before they ask to join. The first checks the 3x claim, the second checks decision 4, and the third checks the assumption I would be least surprised to see fail.</P>
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* ── BACK TO TOP ─────────────────────────────────────── */}
      <div style={{ ...col, display: "flex", justifyContent: "flex-start" }} className="v3-section">
        <button data-cursor-id="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(0,0,0,0.07)", color: C.t1,
            border: "none", padding: "11px 22px",
            borderRadius: 9999, fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: "opacity 0.25s, transform 0.25s",
          }}
          onMouseEnter={e => { const b = e.currentTarget; b.style.opacity = "0.88"; b.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { const b = e.currentTarget; b.style.opacity = "1"; b.style.transform = ""; }}
        >
          Back to top
        </button>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <div id="go-footer" style={{ marginTop: 48 }}>
        <Footer />
      </div>

      <style>{`
        .go-page-nav {
          display: none;
          position: fixed;
          left: calc(50% + 408px);
          top: 50%;
          transform: translateY(-50%);
          flex-direction: column;
          gap: 14px;
          z-index: 100;
        }
        @media (min-width: 1200px) { .go-page-nav { display: flex; } }
        .go-decision-line { height: 0; border-top: 1px solid var(--color-border); margin: 16px -16px; }
        @media (min-width: 768px) { .go-decision-line { margin: 24px -24px; } }
        .go-hero-panel { width: 100%; background: #F6F6F6; border: 1px solid var(--color-border); border-radius: 8px; display: flex; justify-content: center; padding: 24px 16px; overflow: hidden; }
        .go-stats-grid, .go-three-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 600px) { .go-stats-grid, .go-three-grid { grid-template-columns: 1fr 1fr 1fr; } }
        .go-split { display: grid; grid-template-columns: 1fr; gap: 24px; align-items: start; }
        .go-split > figure:first-child { max-width: 300px; margin: 0 auto; }
        @media (min-width: 640px) {
          .go-split { grid-template-columns: 260px 1fr; }
          .go-split > figure:first-child { max-width: none; margin: 0; }
          .go-split-wide { grid-template-columns: 300px 1fr; }
        }
        .go-pair { display: grid; grid-template-columns: 1fr; gap: 16px; align-items: start; }
        @media (min-width: 640px) { .go-pair { grid-template-columns: 1fr 1fr; } }
        .go-screen-block { display: flex; flex-direction: column; gap: 16px; }
        .go-screen-label { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; }
      `}</style>
      </main>
    </ThemeProvider>
  );
}
