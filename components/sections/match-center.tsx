"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { SectionHeading, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { COUNTRIES, PLAYERS, FIXTURES, type Player } from "@/lib/data";

function FixtureRow({ index }: { index: number }) {
  const f = FIXTURES[index];
  const date = new Date(f.kickoff);
  const when = date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <StaggerItem>
      <motion.div
        whileHover={{ scale: 1.015 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="glass rounded-2xl px-5 py-5 md:px-8 md:py-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3"
      >
        <div className="flex items-center justify-end gap-3 text-right">
          <span className="font-medium text-frost text-sm md:text-lg">{f.home.name}</span>
          <span className="text-2xl md:text-4xl">{f.home.flag}</span>
        </div>
        <div className="text-center px-2 md:px-6">
          <span className="text-numeric block text-gold text-lg md:text-2xl font-medium">VS</span>
          <span className="block text-[0.62rem] uppercase tracking-[0.18em] text-frost/45 mt-1 whitespace-nowrap">
            {f.stage}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl md:text-4xl">{f.away.flag}</span>
          <span className="font-medium text-frost text-sm md:text-lg">{f.away.name}</span>
        </div>
        <div className="col-span-3 mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 border-t border-frost/8 pt-3 text-[0.7rem] uppercase tracking-[0.16em] text-frost/40">
          <span>{when}</span>
          <span className="hidden md:inline">·</span>
          <span>{f.venue}</span>
        </div>
      </motion.div>
    </StaggerItem>
  );
}

function CountryCard({ index }: { index: number }) {
  const c = COUNTRIES[index];
  return (
    <StaggerItem>
      <motion.div
        whileHover={{ rotateY: -7, rotateX: 4, translateZ: 16, y: -6 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d", perspective: 900 }}
        className="glass group relative rounded-2xl p-6 text-center overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(255,214,10,0.12),transparent_70%)]"
          aria-hidden="true"
        />
        <span className="block text-6xl drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110">
          {c.flag}
        </span>
        <h3 className="text-display mt-4 text-2xl text-frost">{c.name}</h3>
        <div className="mt-3 flex items-center justify-center gap-4 text-[0.68rem] uppercase tracking-[0.16em] text-frost/45">
          <span>Rank <span className="text-numeric text-gold">#{c.fifaRank}</span></span>
          <span>Group <span className="text-numeric text-gold">{c.group}</span></span>
          <span>Titles <span className="text-numeric text-gold">{c.titles}</span></span>
        </div>
      </motion.div>
    </StaggerItem>
  );
}

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

export function MatchCenter() {
  return (
    <section id="matches" className="relative px-6 py-28 md:py-40 bg-grid-faint">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker="Match Center"
          title="Fixtures. Nations. Superstars."
          copy="Everything you need before you lock in a prediction."
        />

        <Tabs defaultValue="fixtures" className="flex flex-col items-center">
          <TabsList className="mb-12">
            <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
            <TabsTrigger value="nations">Nations</TabsTrigger>
            <TabsTrigger value="players">Star Players</TabsTrigger>
          </TabsList>

          <TabsContent value="fixtures" className="w-full">
            <Stagger className="grid gap-4 max-w-3xl mx-auto">
              {FIXTURES.map((_, i) => (
                <FixtureRow key={FIXTURES[i].id} index={i} />
              ))}
            </Stagger>
          </TabsContent>

          <TabsContent value="nations" className="w-full">
            <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {COUNTRIES.map((_, i) => (
                <CountryCard key={COUNTRIES[i].code} index={i} />
              ))}
            </Stagger>
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
