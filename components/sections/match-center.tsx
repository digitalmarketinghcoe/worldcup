"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { COUNTRIES, PLAYERS, FIXTURES, type Player, type Confederation } from "@/lib/data";

// ─── shared filter pill ───────────────────────────────────────────────────────

function FilterPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-full px-4 py-1.5 text-[0.7rem] uppercase tracking-[0.18em] font-medium transition-all cursor-pointer ${
            value === o.value
              ? "bg-gold text-midnight"
              : "border border-frost/20 text-frost/55 hover:border-frost/45 hover:text-frost"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── fixtures tab ─────────────────────────────────────────────────────────────

type GroupFilter = "All" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

const GROUP_OPTIONS: { label: string; value: GroupFilter }[] = [
  { label: "All", value: "All" },
  ...("ABCDEFGHIJKL".split("").map((g) => ({ label: `Group ${g}`, value: g as GroupFilter }))),
];

function FixtureRow({ fixture }: { fixture: (typeof FIXTURES)[number] }) {
  const when = new Date(fixture.kickoff).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.012 }}
      className="glass rounded-2xl px-5 py-5 md:px-8 md:py-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3"
    >
      <div className="flex items-center justify-end gap-3 text-right">
        <span className="font-medium text-frost text-sm md:text-base">{fixture.home.name}</span>
        <span className="text-2xl md:text-3xl">{fixture.home.flag}</span>
      </div>
      <div className="text-center px-2 md:px-5">
        <span className="text-numeric block text-gold text-base md:text-xl font-semibold">VS</span>
        <span className="block text-[0.6rem] uppercase tracking-[0.16em] text-frost/40 mt-1 whitespace-nowrap">
          {fixture.stage}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-2xl md:text-3xl">{fixture.away.flag}</span>
        <span className="font-medium text-frost text-sm md:text-base">{fixture.away.name}</span>
      </div>
      <div className="col-span-3 mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-frost/8 pt-2.5 text-[0.62rem] uppercase tracking-[0.14em] text-frost/35">
        <span>{when}</span>
        <span className="hidden sm:inline">·</span>
        <span>{fixture.venue}</span>
      </div>
    </motion.div>
  );
}

function FixturesPanel() {
  const [group, setGroup] = React.useState<GroupFilter>("All");

  const filtered = group === "All"
    ? FIXTURES
    : FIXTURES.filter((f) => f.stage.includes(`Group ${group}`));

  return (
    <>
      <FilterPills options={GROUP_OPTIONS} value={group} onChange={setGroup} />
      <div className="grid gap-3 max-w-3xl mx-auto">
        <AnimatePresence mode="popLayout">
          {filtered.map((f) => (
            <FixtureRow key={f.id} fixture={f} />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="text-center text-frost/35 py-10 text-sm">No fixtures yet for Group {group}.</p>
        )}
      </div>
    </>
  );
}

// ─── nations tab ──────────────────────────────────────────────────────────────

type ConfFilter = "All" | Confederation;

const CONF_OPTIONS: { label: string; value: ConfFilter }[] = [
  { label: "All 48", value: "All" },
  { label: "UEFA", value: "UEFA" },
  { label: "CONMEBOL", value: "CONMEBOL" },
  { label: "CAF", value: "CAF" },
  { label: "AFC", value: "AFC" },
  { label: "CONCACAF", value: "CONCACAF" },
  { label: "OFC", value: "OFC" },
];

function CountryCard({ country }: { country: (typeof COUNTRIES)[number] }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ rotateY: -7, rotateX: 4, y: -6 }}
      style={{ transformStyle: "preserve-3d", perspective: 900 }}
      className="glass group relative rounded-2xl p-5 text-center overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(255,214,10,0.12),transparent_70%)]"
        aria-hidden="true"
      />
      <span className="block text-5xl drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110">
        {country.flag}
      </span>
      <h3 className="text-display mt-3 text-xl text-frost leading-tight">{country.name}</h3>
      <p className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-gold/70">
        {country.confederation}
      </p>
      <div className="mt-2.5 flex items-center justify-center gap-3 text-[0.6rem] uppercase tracking-[0.14em] text-frost/40">
        <span>Rank <span className="text-numeric text-frost/70">#{country.fifaRank}</span></span>
        <span>Grp <span className="text-numeric text-frost/70">{country.group}</span></span>
        {country.titles > 0 && (
          <span>🏆 <span className="text-numeric text-gold">{country.titles}</span></span>
        )}
      </div>
    </motion.div>
  );
}

function NationsPanel() {
  const [conf, setConf] = React.useState<ConfFilter>("All");

  const filtered = conf === "All"
    ? COUNTRIES
    : COUNTRIES.filter((c) => c.confederation === conf);

  return (
    <>
      <FilterPills options={CONF_OPTIONS} value={conf} onChange={setConf} />
      <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 md:gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((c) => (
            <CountryCard key={c.code} country={c} />
          ))}
        </AnimatePresence>
      </motion.div>
      <p className="mt-6 text-center text-[0.62rem] uppercase tracking-[0.18em] text-frost/30">
        {filtered.length} {conf === "All" ? "nations" : conf + " nations"} · Groups A–L · 48 total
      </p>
    </>
  );
}

// ─── player card ──────────────────────────────────────────────────────────────

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-[0.65rem] uppercase tracking-[0.18em] text-frost/50 mb-1.5">
        <span>{label}</span>
        <span className="text-numeric text-gold">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-frost/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="h-full rounded-full bg-gradient-to-r from-crimson via-gold to-gold"
        />
      </div>
    </div>
  );
}

function PlayerCard({ player }: { player: Player }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [spot, setSpot] = React.useState({ x: 50, y: 50 });

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setSpot({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <StaggerItem>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="glass glass-gold group relative rounded-2xl p-6 overflow-hidden"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(420px circle at ${spot.x}% ${spot.y}%, rgba(255,214,10,0.10), transparent 55%)`,
          }}
          aria-hidden="true"
        />
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-display text-3xl text-frost">{player.name}</h3>
            <p className="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-frost/45">
              {player.position} · {player.club}
            </p>
          </div>
          <span className="text-4xl">{player.flag}</span>
        </div>
        <div className="mt-6 space-y-3.5">
          <StatBar label="Pace" value={player.stats.pace} />
          <StatBar label="Shooting" value={player.stats.shooting} />
          <StatBar label="Passing" value={player.stats.passing} />
          <StatBar label="Magic" value={player.stats.magic} />
        </div>
      </motion.div>
    </StaggerItem>
  );
}

// ─── section ──────────────────────────────────────────────────────────────────

export function MatchCenter() {
  return (
    <section id="matches" className="relative px-6 py-28 md:py-40 bg-grid-faint">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          kicker="Match Center"
          title="Fixtures. 48 Nations. Superstars."
          copy="Filter by group or confederation. Lock in your call before kickoff."
        />

        <Tabs defaultValue="fixtures" className="flex flex-col items-center">
          <TabsList className="mb-10">
            <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
            <TabsTrigger value="nations">48 Nations</TabsTrigger>
            <TabsTrigger value="players">Star Players</TabsTrigger>
          </TabsList>

          <TabsContent value="fixtures" className="w-full">
            <FixturesPanel />
          </TabsContent>

          <TabsContent value="nations" className="w-full">
            <NationsPanel />
          </TabsContent>

          <TabsContent value="players" className="w-full">
            <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {PLAYERS.map((p) => (
                <PlayerCard key={p.name} player={p} />
              ))}
            </Stagger>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
