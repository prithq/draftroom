import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Users,
  FileText,
  Video,
  Code2,
  PenTool,
  BookOpen,
  Github,
  Linkedin,
  Twitter,
  Play,
  Check,
  X,
  MessageSquare,
} from "lucide-react";

const GITHUB_URL = "https://github.com";
const DEMO_URL = "#hero";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24">
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

/* ---------- SHARED ---------- */
function Label({ children }: { children: React.ReactNode }) {
  return <span className="label-mono text-muted-foreground">{children}</span>;
}

function PrimaryLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const commonClasses =
    "inline-flex items-center justify-center gap-2 rounded-md bg-foreground px-6 py-3 text-[13px] font-medium tracking-tight text-background transition-colors hover:bg-primary";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={commonClasses}
      >
        {children}
      </a>
    );
  }

  return <Link href={href} className={commonClasses}>{children}</Link>;
}

function GhostLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const commonClasses =
    "inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-[13px] font-medium tracking-tight text-foreground transition-colors hover:border-foreground";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={commonClasses}
      >
        {children}
      </a>
    );
  }

  return <Link href={href} className={commonClasses}>{children}</Link>;
}

/* ---------- NAVBAR ---------- */
function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block h-2.5 w-2.5 rounded-[2px] ${
          dark ? "bg-background" : "bg-primary"
        }`}
      />
      <span
        className={`text-[15px] font-bold tracking-tight ${
          dark ? "text-background" : "text-foreground"
        }`}
      >
        draftroom
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-foreground hover:text-primary"
        >
          <Github className="h-4 w-4" />
          Source
        </a>
      </nav>
    </header>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  return (
    <section id="hero" className="border-b border-border px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Link
          href="#preview"
          className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
        >
          <span className="text-primary">Portfolio Project</span>
          <span className="h-px w-8 bg-border" />
          A full-stack build by one developer
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>

        <h1 className="mt-10 max-w-4xl text-5xl leading-[1.02] sm:text-6xl md:text-7xl">
          Coding interviews
          <br />
          <span className="text-primary">that feel real.</span>
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          DraftRoom is a realtime interview platform I built to explore
          multiplayer editing, WebRTC and collaborative canvases — code editor,
          Excalidraw whiteboard, LeetCode problems and HD video in one room.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <PrimaryLink href={DEMO_URL}>Get Started</PrimaryLink>
          <GhostLink href={GITHUB_URL} external>
            <Github className="h-4 w-4" />
            View Source
          </GhostLink>
        </div>

        <div className="mt-16 grid border-t border-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Realtime multiplayer code editor with syntax highlighting",
            "Excalidraw whiteboard for system design rounds",
            "Curated LeetCode-style problem library",
            "Built-in HD video calling — no Zoom link needed",
          ].map((t, i) => (
            <div
              key={t}
              className="border-b border-border py-6 pr-8 lg:border-b-0 lg:border-r lg:pl-6 lg:first:pl-0 lg:last:border-r-0"
            >
              <Label>{String(i + 1).padStart(2, "0")}</Label>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
                {t}
              </p>
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
    <section className="border-b border-border px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
        <p className="max-w-xs font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-muted-foreground">
          Built on open-source tools I love working with
        </p>
        <div className="flex flex-wrap items-center gap-x-12 gap-y-6">
          {tools.map((t) => (
            <div key={t.name} className="flex items-center gap-2.5">
              <t.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
              <span className="text-base font-medium tracking-tight">
                {t.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- SECTION HEADER ---------- */
function SectionHeader({
  index,
  title,
  body,
}: {
  index: string;
  title: React.ReactNode;
  body: string;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-12">
      <div className="md:col-span-4">
        <Label>{index}</Label>
        <h2 className="mt-3 text-4xl leading-[1.05] md:text-5xl">{title}</h2>
      </div>
      <p className="text-lg leading-relaxed text-muted-foreground md:col-span-7 md:col-start-6">
        {body}
      </p>
    </div>
  );
}

/* ---------- HOW IT WORKS ---------- */
function HowItWorks() {
  return (
    <section id="process" className="border-b border-border px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          index="01 / Process"
          title="How DraftRoom works"
          body="Run a real technical interview in three simple steps."
        />

        <div className="mt-16 grid border-t border-border md:grid-cols-3">
          <StepCard
            icon={Calendar}
            step="01"
            title="Create a Room"
            body="Spin up an interview link in one click. Invite your candidate — no downloads, no installs."
            mock={<RoomMock />}
          />
          <StepCard
            icon={Users}
            step="02"
            title="Collaborate Live"
            body="Code together in the multiplayer editor, sketch systems on the Excalidraw whiteboard, all in realtime."
            mock={<CollabMock />}
          />
          <StepCard
            icon={FileText}
            step="03"
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
  step,
  title,
  body,
  mock,
}: {
  icon: React.ComponentType<{ className?: string }>;
  step: string;
  title: string;
  body: string;
  mock: React.ReactNode;
}) {
  return (
    <div className="flex flex-col border-b border-border py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-primary" />
        <Label>{step}</Label>
      </div>
      <h3 className="mt-6 text-xl">{title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        {body}
      </p>
      <div className="mt-8 flex-1">{mock}</div>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      {children}
    </div>
  );
}

function RoomMock() {
  return (
    <Panel>
      <div className="border-b border-border px-3 py-2">
        <Label>New Interview Room</Label>
      </div>
      <div className="p-3">
        <div className="rounded border border-border px-3 py-2 text-[13px]">
          Senior Backend — Two Sum + System Design
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[10px]">
          <span className="rounded border border-primary/40 px-2 py-0.5 text-primary">
            60 min
          </span>
          <span className="rounded border border-border px-2 py-0.5 text-muted-foreground">
            Python
          </span>
          <span className="rounded border border-border px-2 py-0.5 text-muted-foreground">
            Video on
          </span>
        </div>
        <div className="mt-3 rounded bg-foreground py-2 text-center font-mono text-[11px] text-background">
          Copy invite link
        </div>
      </div>
    </Panel>
  );
}

function CollabMock() {
  return (
    <Panel>
      <div className="grid grid-cols-5 text-[11px]">
        <pre className="col-span-3 border-r border-border bg-muted p-3 font-mono leading-5 text-foreground/80">
{`def two_sum(nums, t):
  seen = {}
  for i, n in enumerate(nums):
    if t - n in seen:
      return [seen[t-n], i]
    seen[n] = i`}
        </pre>
        <div className="col-span-2 p-3">
          <Label>Board</Label>
          <div className="mt-3 space-y-1.5">
            <div className="h-1 w-3/4 bg-primary/40" />
            <div className="h-1 w-1/2 bg-border" />
            <div className="mt-3 flex items-center gap-1.5">
              <div className="h-7 w-7 rounded-[2px] border border-foreground/40" />
              <div className="h-px w-4 bg-foreground/30" />
              <div className="h-7 w-7 rounded-full border border-primary" />
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function ReviewMock() {
  return (
    <Panel>
      <div className="p-3">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
            <Play className="h-3 w-3" fill="currentColor" />
          </div>
          <div className="flex-1">
            <div className="font-mono text-[11px] font-medium">Session Replay</div>
            <div className="font-mono text-[10px] text-muted-foreground">
              42 min · Sarah K.
            </div>
          </div>
        </div>
        <div className="mt-3 h-1 w-full bg-border">
          <div className="h-full w-2/3 bg-primary" />
        </div>
        <div className="mt-4 space-y-2 font-mono text-[11px]">
          <div className="flex justify-between border-b border-border pb-1.5">
            <span className="text-muted-foreground">Code quality</span>
            <span>4.5 / 5</span>
          </div>
          <div className="flex justify-between border-b border-border pb-1.5">
            <span className="text-muted-foreground">System design</span>
            <span>4.0 / 5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Recommendation</span>
            <span className="text-primary">Strong hire</span>
          </div>
        </div>
      </div>
    </Panel>
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
    <section id="benefits" className="border-b border-border px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          index="02 / Features"
          title="What's inside"
          body="Four core surfaces, all wired together in a single collaborative room."
        />
        <div className="mt-16 grid border-t border-border sm:grid-cols-2">
          {items.map((it, i) => (
            <div
              key={it.title}
              className={`border-b border-border py-10 sm:pr-10 ${
                i % 2 === 1 ? "sm:border-l sm:pl-10 sm:pr-0" : ""
              }`}
            >
              <it.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-6 text-xl">{it.title}</h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
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
    <section id="compare" className="border-b border-border px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          index="03 / Comparison"
          title={
            <>
              Why this is
              <br />
              actually better.
            </>
          }
          body="Most interview setups mean juggling three tabs — a video call, a code pad, and a whiteboard. DraftRoom folds them into one screen so the interview stays in flow."
        />

        <div className="mt-16 overflow-hidden rounded-md border border-border bg-card">
          <div className="grid grid-cols-12 border-b border-border bg-muted">
            <div className="label-mono col-span-6 px-5 py-3 text-muted-foreground md:col-span-5">
              Capability
            </div>
            <div className="label-mono col-span-3 px-3 py-3 text-center text-foreground md:col-span-2">
              DraftRoom
            </div>
            <div className="label-mono col-span-3 px-3 py-3 text-center text-muted-foreground md:col-span-2">
              Zoom + Pad
            </div>
            <div className="label-mono hidden px-5 py-3 text-muted-foreground md:col-span-3 md:block">
              Notes
            </div>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.label}
              className={`grid grid-cols-12 items-center ${
                i !== rows.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="col-span-6 px-5 py-4 text-[15px] md:col-span-5">
                {r.label}
              </div>
              <div className="col-span-3 px-3 py-4 text-center md:col-span-2">
                {r.draft ? (
                  <Check className="mx-auto h-4 w-4 text-primary" strokeWidth={2.5} />
                ) : (
                  <X className="mx-auto h-4 w-4 text-muted-foreground/50" />
                )}
              </div>
              <div className="col-span-3 px-3 py-4 text-center md:col-span-2">
                {r.others ? (
                  <Check className="mx-auto h-4 w-4 text-muted-foreground" strokeWidth={2.5} />
                ) : (
                  <X className="mx-auto h-4 w-4 text-muted-foreground/50" />
                )}
              </div>
              <div className="hidden px-5 py-4 text-[13px] text-muted-foreground md:col-span-3 md:block">
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
    <section id="preview" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          index="04 / Preview"
          title="One room. Every tool."
          body="A single workspace that keeps the interview moving: code, sketch, talk and review — without switching tabs or losing context."
        />

        <div className="mt-16 overflow-hidden rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border bg-foreground px-4 py-2.5 text-background">
            <div className="flex items-center gap-2 font-mono text-[12px]">
              <span className="inline-block h-2 w-2 rounded-[2px] bg-primary" />
              draftroom — interview room #42
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1.5">
                <div className="grid h-6 w-6 place-items-center rounded-full bg-primary font-mono text-[9px] text-primary-foreground">
                  You
                </div>
                <div className="grid h-6 w-6 place-items-center rounded-full bg-background font-mono text-[9px] text-foreground">
                  S
                </div>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-background/70">
                Live
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="border-b border-border bg-muted p-5 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                <Label>Editor — Python</Label>
              </div>
              <pre className="mt-4 overflow-x-auto font-mono text-xs leading-6 text-foreground/85 sm:text-[13px]">
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
              <div className="mt-5 flex flex-wrap items-center gap-3 font-mono text-[10px]">
                <span className="inline-flex items-center gap-1 rounded border border-primary/40 px-2 py-0.5 text-primary">
                  <Check className="h-3 w-3" /> Tests passing
                </span>
                <span className="text-muted-foreground">
                  Last edit from Sarah — 2s ago
                </span>
              </div>
            </div>

            <div className="grid grid-rows-2">
              <div className="border-b border-border p-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label>Problem</Label>
                  </span>
                  <span className="rounded border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                    Easy
                  </span>
                </div>
                <p className="mt-4 text-[15px]">Two Sum</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  Return indices of the two numbers such that they add up to the
                  target.
                </p>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1.5">
                  <PenTool className="h-3.5 w-3.5 text-muted-foreground" />
                  <Label>Whiteboard</Label>
                </div>
                <div className="mt-4 grid h-28 place-items-center rounded border border-dashed border-border bg-muted">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-6 w-6 rounded-[2px] border border-foreground/40" />
                      <div className="h-px w-6 bg-foreground/30" />
                      <div className="h-6 w-6 rounded-full border border-primary" />
                    </div>
                    <p className="mt-3 font-mono text-[10px] text-muted-foreground">
                      Sketch a system design here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid border-t border-border sm:grid-cols-2">
            <div className="flex items-center gap-3 border-b border-border p-4 sm:border-b-0 sm:border-r">
              <Video className="h-4 w-4 text-primary" />
              <div>
                <div className="text-[14px]">HD Video Call</div>
                <div className="text-[12px] text-muted-foreground">
                  Built in — no external meeting link
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <MessageSquare className="h-4 w-4 text-primary" />
              <div>
                <div className="text-[14px]">Chat & Notes</div>
                <div className="text-[12px] text-muted-foreground">
                  Capture side thoughts as you go
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <PrimaryLink href={DEMO_URL}>Get Started</PrimaryLink>
          <GhostLink href={GITHUB_URL} external>
            <Github className="h-4 w-4" />
            View Source
          </GhostLink>
        </div>
      </div>
    </section>
  );
}

/* ---------- FOOTER CTA ---------- */
function FooterCTA() {
  return (
    <footer className="bg-foreground px-6 py-20 text-background">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className="text-4xl leading-[1.05] md:text-5xl">
              Curious how it's built?
            </h2>
            <p className="mt-5 max-w-lg text-background/70">
              Poke around the live demo or dive into the source — it's all open.
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-3 md:col-span-5 md:justify-end">
            <Link
              href={DEMO_URL}
              className="inline-flex items-center gap-2 rounded-md bg-background px-6 py-3 text-[13px] font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Get Started
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-background/30 px-6 py-3 text-[13px] font-medium text-background transition-colors hover:border-background"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-background/15 pt-8 md:flex-row md:items-center md:justify-between">
          <Logo dark />
          <ul className="flex flex-wrap items-center gap-8 text-[13px] text-background/70">
            <li><Link href="#process" className="hover:text-background">Process</Link></li>
            <li><Link href="#benefits" className="hover:text-background">Features</Link></li>
            <li><Link href="#compare" className="hover:text-background">Comparison</Link></li>
            <li><Link href="#preview" className="hover:text-background">Preview</Link></li>
          </ul>
          <div className="flex items-center gap-4 text-background/70">
            <a href="#" aria-label="Twitter" className="hover:text-background"><Twitter className="h-4 w-4" /></a>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-background"><Github className="h-4 w-4" /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-background"><Linkedin className="h-4 w-4" /></a>
          </div>
        </div>

        <div className="mt-8 font-mono text-[11px] text-background/50">
          © {new Date().getFullYear()} DraftRoom — a portfolio project. Designed &
          built solo.
        </div>
      </div>
    </footer>
  );
}