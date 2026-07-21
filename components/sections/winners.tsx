import { Crown, Medal, Sparkles, Trophy } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { FINAL_WINNERS } from "@/lib/final-winners";

export function Winners() {
  const [champion, runnerUp] = FINAL_WINNERS;

  return (
    <section
      id="winners"
      aria-labelledby="winners-title"
      className="relative isolate min-h-[78svh] overflow-hidden px-6 pb-20 pt-32 md:pb-28 md:pt-40"
    >
      <div
        className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_18%,rgba(255,214,10,0.18),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(217,4,41,0.12),transparent_28%),linear-gradient(180deg,#071124_0%,#020617_100%)]"
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-grid-faint opacity-70" aria-hidden="true" />
      <div
        className="absolute left-1/2 top-16 -z-10 size-[28rem] -translate-x-1/2 rounded-full border border-gold/10 shadow-[0_0_120px_rgba(255,214,10,0.12)] md:size-[42rem]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-5xl">
        <Reveal className="text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.28em] text-gold">
            <Sparkles className="size-3.5" aria-hidden="true" />
            The final whistle
          </p>
          <h1
            id="winners-title"
            className="text-display mt-7 text-frost"
            style={{ fontSize: "var(--fs-title)" }}
          >
            HCOE Prediction <span className="text-gold-shimmer">Champions</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-frost/55 md:text-lg">
            The predictions are counted, the leaderboard is final, and two names rise above the rest.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid items-end gap-5 md:mt-16 md:grid-cols-[1.12fr_0.88fr]">
          <StaggerItem>
            <article className="glass glass-gold relative overflow-hidden rounded-3xl px-7 py-10 text-center md:px-10 md:py-14">
              <div
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent"
                aria-hidden="true"
              />
              <div className="mx-auto grid size-20 place-items-center rounded-full border border-gold/35 bg-gold/10 shadow-[0_0_50px_rgba(255,214,10,0.2)]">
                <Crown className="size-10 text-gold" aria-hidden="true" />
              </div>
              <p className="mt-7 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-gold/80">
                01 · {champion.title}
              </p>
              <h2 className="text-display mt-3 text-5xl text-frost md:text-7xl">
                {champion.name}
              </h2>
              <p className="text-numeric mt-5 text-3xl text-gold md:text-4xl">
                {champion.points}
                <span className="ml-2 text-xs uppercase tracking-[0.22em] text-frost/40">points</span>
              </p>
              <Trophy className="absolute -bottom-8 -right-7 size-36 rotate-[-12deg] text-gold/[0.06]" aria-hidden="true" />
            </article>
          </StaggerItem>

          <StaggerItem>
            <article className="glass relative overflow-hidden rounded-3xl border-frost/15 px-7 py-9 text-center md:px-9 md:py-11">
              <div className="mx-auto grid size-16 place-items-center rounded-full border border-frost/20 bg-frost/[0.06]">
                <Medal className="size-8 text-frost/75" aria-hidden="true" />
              </div>
              <p className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-frost/45">
                02 · {runnerUp.title}
              </p>
              <h2 className="text-display mt-3 text-4xl text-frost md:text-6xl">
                {runnerUp.name}
              </h2>
              <p className="text-numeric mt-5 text-3xl text-frost md:text-4xl">
                {runnerUp.points}
                <span className="ml-2 text-xs uppercase tracking-[0.22em] text-frost/35">points</span>
              </p>
            </article>
          </StaggerItem>
        </Stagger>

        <Reveal className="mt-10 text-center" delay={0.2}>
          <a
            href="#leaderboard"
            className="inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-frost/40 transition-colors hover:text-gold"
          >
            View final leaderboard <span aria-hidden="true">↓</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
