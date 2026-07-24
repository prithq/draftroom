import {
  Zap,
  ArrowRight,
  Calendar,
  Users,
  FileText,
  Video,
  Code2,
  PenTool,
  BookOpen,
  Play,
  Circle,
  Check,
  X,
  Sparkles,
  MessageSquare,
  LayoutTemplate,
} from "lucide-react";
import Link from "next/link";
const GITHUB_URL = "https://github.com";
const DEMO_URL = "#hero";

// --- SVG replacements for missing Lucide icons ---
const GithubSVG = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const LinkedinSVG = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
  </svg>
);

const TwitterSVG = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// --- Main Page Component ---
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-28">
        <Hero />
        <Integrations />
        <HowItWorks />
        <Benefits />
        <Comparison />
        <WorkspacePreview />
      </main>
      <FooterCTA />
    </div>
  );
}

/* ---------- NAVBAR ---------- */
function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`grid h-9 w-9 place-items-center rounded-full ${
          dark ? "bg-white" : "bg-foreground"
        }`}
      >
        <Zap
          className={`h-5 w-5 ${dark ? "text-foreground" : "text-white"}`}
          fill="currentColor"
        />
      </div>
      <span className="font-bricolage text-xl font-extrabold tracking-tight">
        DraftRoom
      </span>
    </div>
  );
}

function Navbar() {
  const links = [
    { label: "Process", href: "#process" },
    { label: "Features", href: "#benefits" },
    { label: "Why It's Different", href: "#compare" },
    { label: "Preview", href: "#preview" },
  ];
  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border-2 border-foreground/80 bg-background/70 py-2.5 pl-6 pr-2.5 shadow-[0_4px_0_0_hsl(0_0%_0%)] backdrop-blur-xl">
        <Logo />
        <ul className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-[15px] font-medium text-foreground/80 hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          <GithubSVG className="h-4 w-4" />
          Source
        </a>
      </nav>
    </header>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  return (
    <section id="hero" className="px-4 pb-24 pt-8">
      <div className="mx-auto max-w-5xl text-center">
        <a
          href="#preview"
          className="inline-flex items-center gap-3 rounded-full border-2 border-foreground bg-white py-1.5 pl-1.5 pr-5 text-sm font-medium"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-primary-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Portfolio Project
          </span>
          A full-stack build by one developer
          <ArrowRight className="h-4 w-4" />
        </a>

        <h1 className="mt-8 font-bricolage font-black text-5xl leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-[92px]">
          Coding Interviews
          <br />
          That Feel Real.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/70">
          DraftRoom is a realtime interview platform I built to explore
          multiplayer editing, WebRTC and collaborative canvases — code editor,
          Excalidraw whiteboard, LeetCode problems and HD video in one room.
        </p>

        <div className="mx-auto mt-10 flex max-w-lg flex-col items-stretch justify-center gap-3 sm:flex-row">
          <Link
  href="/signup"
  className="inline-flex h-fit items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-foreground shadow"
>
  <Zap className="h-4 w-4" fill="currentColor" />
  Get Started
</Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground bg-white px-7 py-3.5 text-sm font-semibold hover:bg-muted"
          >
            <GithubSVG className="h-4 w-4" />
            View Source
          </a>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-x-8 gap-y-4 text-left sm:grid-cols-2">
          {[
            "Realtime multiplayer code editor with syntax highlighting",
            "Excalidraw whiteboard for system design rounds",
            "Curated LeetCode-style problem library",
            "Built-in HD video calling — no Zoom link needed",
          ].map((t) => (
            <div key={t} className="flex items-start gap-3">
              <Zap
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                fill="currentColor"
              />
              <span className="text-[15px] text-foreground/80">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- INTEGRATIONS ---------- */
function Integrations() {
  const tools = [
    { name: "Excalidraw", icon: PenTool },
    { name: "Monaco", icon: Code2 },
    { name: "LeetCode", icon: BookOpen },
    { name: "WebRTC", icon: Video },
  ];
  return (
    <section className="px-4 py-20">
      <p className="text-center text-base text-foreground/70">
        Built on open-source tools I love working with.
      </p>
      <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-x-16 gap-y-8">
        {tools.map((t) => (
          <div key={t.name} className="flex items-center gap-3 opacity-80">
            <t.icon className="h-8 w-8" strokeWidth={1.75} />
            <span className="font-bricolage text-2xl font-bold tracking-tight">
              {t.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- HOW IT WORKS ---------- */
function HowItWorks() {
  return (
    <section id="process" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="font-bricolage font-extrabold text-5xl md:text-6xl">How DraftRoom Works</h2>
          <p className="mt-4 text-lg text-foreground/70">
            Run a real technical interview in three simple steps.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <StepCard
            icon={Calendar}
            title="Create a Room"
            body="Spin up an interview link in one click. Invite your candidate — no downloads, no installs."
            mock={<RoomMock />}
          />
          <StepCard
            icon={Users}
            title="Collaborate Live"
            body="Code together in the multiplayer editor, sketch systems on the Excalidraw whiteboard, all in realtime."
            mock={<CollabMock />}
          />
          <StepCard
            icon={FileText}
            title="Review & Decide"
            body="Get a session replay with code diffs, whiteboard snapshots and video — share it with your hiring team."
            mock={<ReviewMock />}
          />
        </div>
      </div>
    </section>
  );
}

function StepCard({
  icon: Icon,
  title,
  body,
  mock,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  mock: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-3xl bg-white/70 p-8 ring-1 ring-foreground/10">
      <Icon className="h-8 w-8" />
      <h3 className="mt-6 font-bricolage text-2xl font-bold">{title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-foreground/70">{body}</p>
      <div className="mt-8 flex-1">{mock}</div>
    </div>
  );
}

function BrowserChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-foreground/15 bg-white shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-foreground/10 bg-muted px-3 py-2">
        <Circle className="h-2.5 w-2.5 fill-red-400 text-red-400" />
        <Circle className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
        <Circle className="h-2.5 w-2.5 fill-green-400 text-green-400" />
      </div>
      {children}
    </div>
  );
}

function RoomMock() {
  return (
    <BrowserChrome>
      <div className="p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground/50">
          New Interview Room
        </div>
        <div className="mt-2 rounded-lg border border-foreground/10 px-3 py-2 text-sm">
          Senior Backend — Two Sum + System Design
        </div>
        <div className="mt-3 flex gap-2">
          <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary">
            60 min
          </span>
          <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-[11px] font-medium">
            Python
          </span>
          <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-[11px] font-medium">
            Video on
          </span>
        </div>
        <button className="mt-3 w-full rounded-lg bg-foreground py-2 text-xs font-semibold text-white">
          Copy invite link
        </button>
      </div>
    </BrowserChrome>
  );
}

function CollabMock() {
  return (
    <BrowserChrome>
      <div className="grid grid-cols-5 text-[11px]">
        <pre className="col-span-3 border-r border-foreground/10 bg-[oklch(0.98_0.01_240)] p-3 font-mono leading-5 text-foreground/80">
{`def two_sum(nums, t):
  seen = {}
  for i, n in enumerate(nums):
    if t - n in seen:
      return [seen[t-n], i]
    seen[n] = i`}
        </pre>
        <div className="col-span-2 p-3">
          <div className="text-[10px] font-semibold text-foreground/50">
            WHITEBOARD
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="h-1.5 w-3/4 rounded bg-primary/40" />
            <div className="h-1.5 w-1/2 rounded bg-foreground/20" />
            <div className="mt-2 flex gap-1.5">
              <div className="h-8 w-8 rounded border-2 border-foreground/30" />
              <div className="mt-3 h-0.5 w-4 bg-foreground/30" />
              <div className="h-8 w-8 rounded-full border-2 border-primary" />
            </div>
          </div>
        </div>
      </div>
    </BrowserChrome>
  );
}

function ReviewMock() {
  return (
    <BrowserChrome>
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-white">
            <Play className="h-3.5 w-3.5" fill="currentColor" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold">Session Replay</div>
            <div className="text-[10px] text-foreground/50">42 min · Sarah K.</div>
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-foreground/10">
          <div className="h-full w-2/3 rounded-full bg-primary" />
        </div>
        <div className="mt-4 space-y-1.5 text-[11px]">
          <div className="flex justify-between">
            <span className="text-foreground/60">Code quality</span>
            <span className="font-semibold">4.5 / 5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">System design</span>
            <span className="font-semibold">4.0 / 5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Recommendation</span>
            <span className="font-semibold text-primary">Strong hire</span>
          </div>
        </div>
      </div>
    </BrowserChrome>
  );
}

/* ---------- BENEFITS ---------- */
function Benefits() {
  const items = [
    {
      icon: Code2,
      title: "Realtime Multiplayer Editor",
      body: "See every keystroke live. Syntax highlighting for 30+ languages with instant run and test output.",
    },
    {
      icon: PenTool,
      title: "Whiteboard for System Design",
      body: "A full Excalidraw canvas — draw architectures, DBs, and API flows with your candidate in realtime.",
    },
    {
      icon: BookOpen,
      title: "Curated LeetCode Library",
      body: "Hundreds of vetted problems, filter by topic and difficulty, and clone your own custom question bank.",
    },
    {
      icon: Video,
      title: "HD Video, Built In",
      body: "No Zoom link, no Meet setup. Video and screen share are part of the same room, on every call.",
    },
  ];
  return (
    <section id="benefits" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="font-bricolage font-extrabold text-5xl md:text-6xl">What's Inside</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-foreground/70">
            Four core surfaces, all wired together in a single collaborative room.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {items.map((it) => (
            <div
              key={it.title}
              className="rounded-3xl border border-foreground/15 bg-white/60 p-8"
            >
              <it.icon className="h-8 w-8" />
              <h3 className="mt-6 font-bricolage text-2xl font-bold">{it.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/70">
                {it.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- COMPARISON ---------- */
function Comparison() {
  const rows = [
    { label: "Multiplayer code editor", draft: true, others: false, note: "Zoom / Meet only share a screen" },
    { label: "Built-in whiteboard for system design", draft: true, others: false, note: "Requires a second Miro/Excalidraw tab" },
    { label: "HD video in the same room", draft: true, others: false, note: "Coderpad-style tools need an external call" },
    { label: "Curated problem library", draft: true, others: true, note: "Table stakes — DraftRoom includes it too" },
    { label: "Session replay with code + canvas + video", draft: true, others: false, note: "Most tools only save the final code" },
    { label: "Zero install for candidates", draft: true, others: true, note: "" },
  ];
  return (
    <section id="compare" className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="font-bricolage font-extrabold text-5xl md:text-6xl">
            Why This Is
            <br />
            Actually Better.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/70">
            Most interview setups mean juggling three tabs — a video call, a
            code pad, and a whiteboard. DraftRoom folds them into one screen
            so the interview stays in flow.
          </p>
        </div>

        <div className="mt-14 overflow-hidden rounded-3xl border-2 border-foreground bg-white shadow-[0_6px_0_0_hsl(0_0%_0%)]">
          <div className="grid grid-cols-12 border-b-2 border-foreground bg-foreground text-white">
            <div className="col-span-6 px-5 py-4 text-sm font-semibold uppercase tracking-wider md:col-span-5">
              Capability
            </div>
            <div className="col-span-3 px-3 py-4 text-center text-sm font-semibold uppercase tracking-wider md:col-span-2">
              DraftRoom
            </div>
            <div className="col-span-3 px-3 py-4 text-center text-sm font-semibold uppercase tracking-wider md:col-span-2">
              Zoom + Pad
            </div>
            <div className="hidden px-5 py-4 text-sm font-semibold uppercase tracking-wider md:col-span-3 md:block">
              Notes
            </div>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.label}
              className={`grid grid-cols-12 items-center ${
                i !== rows.length - 1 ? "border-b border-foreground/10" : ""
              }`}
            >
              <div className="col-span-6 px-5 py-4 text-[15px] font-medium md:col-span-5">
                {r.label}
              </div>
              <div className="col-span-3 px-3 py-4 text-center md:col-span-2">
                {r.draft ? (
                  <Check className="mx-auto h-5 w-5 text-primary" strokeWidth={3} />
                ) : (
                  <X className="mx-auto h-5 w-5 text-foreground/30" />
                )}
              </div>
              <div className="col-span-3 px-3 py-4 text-center md:col-span-2">
                {r.others ? (
                  <Check className="mx-auto h-5 w-5 text-foreground/40" strokeWidth={3} />
                ) : (
                  <X className="mx-auto h-5 w-5 text-foreground/30" />
                )}
              </div>
              <div className="hidden px-5 py-4 text-[13px] text-foreground/60 md:col-span-3 md:block">
                {r.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- WORKSPACE PREVIEW ---------- */
function WorkspacePreview() {
  return (
    <section id="preview" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
            <LayoutTemplate className="h-3.5 w-3.5" /> See It In Action
          </div>
          <h2 className="mt-5 font-bricolage font-black text-5xl leading-none md:text-6xl">
            One Room. Every Tool.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-foreground/70">
            A single workspace that keeps the interview moving: code, sketch,
            talk and review — without switching tabs or losing context.
          </p>
        </div>

        <div className="mt-14 overflow-hidden rounded-3xl border-2 border-foreground bg-white shadow-[0_8px_0_0_hsl(0_0%_0%)]">
          <div className="flex items-center justify-between border-b-2 border-foreground bg-foreground px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" fill="currentColor" />
              <span className="text-sm font-semibold">DraftRoom — Interview Room #42</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="grid h-7 w-7 place-items-center rounded-full border-2 border-foreground bg-primary text-[10px] font-semibold">You</div>
                <div className="grid h-7 w-7 place-items-center rounded-full border-2 border-foreground bg-white text-[10px] font-semibold text-foreground">S</div>
              </div>
              <span className="rounded-full bg-green-500/20 px-2.5 py-1 text-[10px] font-semibold text-green-300">Live</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="border-r-2 border-foreground/10 bg-[oklch(0.97_0.01_240)] p-4">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
                <Code2 className="h-3.5 w-3.5" />
                Editor — Python
              </div>
              <pre className="mt-3 overflow-x-auto text-xs leading-5 text-foreground/80 sm:text-sm">
{`def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Discuss time/space complexity here`}
              </pre>
              <div className="mt-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-semibold text-green-700">
                  <Check className="h-3 w-3" /> Tests passing
                </span>
                <span className="text-[10px] text-foreground/50">Last edit from Sarah — 2s ago</span>
              </div>
            </div>

            <div className="grid grid-rows-2">
              <div className="border-b-2 border-foreground/10 p-4">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
                  <span className="inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Problem</span>
                  <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[9px]">Easy</span>
                </div>
                <p className="mt-3 text-sm font-medium">Two Sum</p>
                <p className="mt-1 text-[13px] leading-relaxed text-foreground/70">
                  Return indices of the two numbers such that they add up to the target.
                </p>
              </div>
              <div className="p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
                  <PenTool className="mb-1 h-3.5 w-3.5" /> Whiteboard
                </div>
                <div className="mt-3 grid h-28 place-items-center rounded-2xl border-2 border-dashed border-foreground/20 bg-[oklch(0.98_0.01_90)]">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-6 w-6 rounded border-2 border-foreground/40" />
                      <div className="h-0.5 w-6 bg-foreground/30" />
                      <div className="h-6 w-6 rounded-full border-2 border-primary" />
                    </div>
                    <p className="mt-2 text-[10px] text-foreground/50">Sketch a system design here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid border-t-2 border-foreground/10 bg-white sm:grid-cols-2">
            <div className="flex items-center gap-3 border-b border-foreground/10 p-3 sm:border-b-0 sm:border-r">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">HD Video Call</div>
                <div className="text-xs text-foreground/60">Built in — no external meeting link</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Chat & Notes</div>
                <div className="text-xs text-foreground/60">Capture side thoughts as you go</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a
            href={DEMO_URL}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110"
          >
            <Zap className="h-4 w-4" fill="currentColor" />
            Get Started
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-white px-6 py-3 text-sm font-semibold"
          >
            <GithubSVG className="h-4 w-4" />
            View Source
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- FOOTER CTA ---------- */
function FooterCTA() {
  return (
    <footer className="px-4 pb-8">
      <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-primary p-10 md:p-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-bricolage font-extrabold text-4xl leading-[1.05] text-primary-foreground md:text-5xl">
              Curious how it's built?
            </h2>
            <p className="mt-4 text-primary-foreground/85">
              Poke around the live demo or dive into the source — it's all open.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={DEMO_URL}
              className="inline-flex h-fit items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-foreground shadow"
            >
              <Zap className="h-4 w-4" fill="currentColor" />
              Get Started
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-fit items-center gap-2 rounded-full border-2 border-white/60 px-7 py-3.5 text-sm font-semibold text-white"
            >
              <GithubSVG className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/20 pt-8 md:flex-row md:items-center md:justify-between">
          <Logo dark />
          <ul className="flex flex-wrap items-center gap-8 text-sm font-medium text-primary-foreground/90">
            <li><a href="#process">Process</a></li>
            <li><a href="#benefits">Features</a></li>
            <li><a href="#compare">Comparison</a></li>
            <li><a href="#preview">Preview</a></li>
          </ul>
          <div className="flex items-center gap-4 text-primary-foreground">
            <a href="#" aria-label="Twitter"><TwitterSVG className="h-5 w-5" /></a>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub"><GithubSVG className="h-5 w-5" /></a>
            <a href="#" aria-label="LinkedIn"><LinkedinSVG className="h-5 w-5" /></a>
          </div>
        </div>

        <div className="mt-8 text-xs text-primary-foreground/70">
          © {new Date().getFullYear()} DraftRoom — a portfolio project. Designed & built solo.
        </div>
      </div>
    </footer>
  );
}