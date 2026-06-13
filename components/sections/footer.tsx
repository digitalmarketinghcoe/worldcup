import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative border-t border-frost/10 px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 md:flex-row md:justify-between">
        <div className="flex items-center gap-5">
          <Image
            src="/Himalaya_Logo_White.png"
            alt="Himalaya College of Engineering"
            width={200}
            height={54}
            className="h-20 w-auto opacity-90 drop-shadow-[0_2px_12px_rgba(226,232,240,0.12)]"
          />
          <div className="text-left border-l border-frost/15 pl-5">
            <p className="text-display text-2xl text-frost leading-tight">Fan Zone 2026</p>
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-frost/40 mt-0.5">
              Engineering Meets Football
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-6 text-[0.72rem] uppercase tracking-[0.18em] text-frost/45">
          <a href="#matches" className="hover:text-gold transition-colors">Matches</a>
          <a href="#predict" className="hover:text-gold transition-colors">Predict</a>
          <a href="#leaderboard" className="hover:text-gold transition-colors">Leaderboard</a>
          <a href="#prizes" className="hover:text-gold transition-colors">Prizes</a>
          <a href="#hcoe" className="hover:text-gold transition-colors">HCOE</a>
        </nav>
      </div>
      <p className="mt-10 text-center text-[0.65rem] uppercase tracking-[0.2em] text-frost/30">
        © 2026 Himalaya College of Engineering · Lalitpur, Nepal · Not affiliated with FIFA · Built with ❤️ by Cherry Holdings
      </p>
    </footer>
  );
}
