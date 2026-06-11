import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative border-t border-frost/10 px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 md:flex-row md:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/Himalaya_Logo_White.png"
            alt="Himalaya College of Engineering"
            width={140}
            height={38}
            className="h-9 w-auto opacity-75"
          />
          <div className="text-left">
            <p className="text-display text-lg text-frost">Fan Zone 2026</p>
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-frost/40">
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
        © 2026 Himalaya College of Engineering · Lalitpur, Nepal · Not affiliated with FIFA
      </p>
    </footer>
  );
}
