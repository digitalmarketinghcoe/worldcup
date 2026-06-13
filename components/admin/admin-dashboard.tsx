"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Download, LogOut, Search, ArrowUpDown, RefreshCw } from "lucide-react";

type Row = Record<string, unknown>;

type Column = { key: string; label: string };

const PREDICTION_COLS: Column[] = [
  { key: "created_at", label: "Submitted" },
  { key: "full_name", label: "Name" },
  { key: "student_id", label: "Student ID" },
  { key: "program", label: "Program" },
  { key: "golden_ball", label: "Golden Ball" },
  { key: "golden_boot", label: "Golden Boot" },
  { key: "young_player", label: "Young Player" },
  { key: "golden_gloves", label: "Golden Gloves" },
  { key: "final_score", label: "Final Score" },
  { key: "final_team", label: "Winner" },
  { key: "final_match_goal_scorer", label: "Final Scorer" },
  { key: "first_place", label: "1st" },
  { key: "second_place", label: "2nd" },
  { key: "third_place", label: "3rd" },
  { key: "best_xi", label: "Best XI" },
];

const MATCH_COLS: Column[] = [
  { key: "created_at", label: "Submitted" },
  { key: "full_name", label: "Name" },
  { key: "student_id", label: "Student ID" },
  { key: "program", label: "Program" },
  { key: "match_label", label: "Match" },
  { key: "home_team", label: "Home" },
  { key: "away_team", label: "Away" },
  { key: "outcome", label: "Pick" },
  { key: "match_number", label: "Match #" },
  { key: "event_id", label: "Event ID" },
];

const TABS = [
  { id: "predictions" as const, label: "Tournament Predictions", cols: PREDICTION_COLS },
  { id: "matchPredictions" as const, label: "Daily Match Picks", cols: MATCH_COLS },
];

type TabId = (typeof TABS)[number]["id"];

function cellText(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

function fmtCell(key: string, v: unknown): string {
  if (key === "created_at" && v) {
    return new Date(String(v)).toLocaleString("en-GB", { timeZone: "Asia/Kathmandu" });
  }
  if (key === "outcome") {
    const map: Record<string, string> = { home: "Home win", away: "Away win", draw: "Draw" };
    return map[String(v)] ?? cellText(v);
  }
  return cellText(v);
}

export function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = React.useState<TabId>("predictions");
  const [data, setData] = React.useState<Record<TabId, Row[]>>({
    predictions: [],
    matchPredictions: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<{ key: string; dir: "asc" | "desc" }>({
    key: "created_at",
    dir: "desc",
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/data", { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const d = await res.json();
      if (!d.ok) {
        setError(d.error ?? "Could not load data.");
        return;
      }
      setData({ predictions: d.predictions ?? [], matchPredictions: d.matchPredictions ?? [] });
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    load();
  }, [load]);

  const cols = TABS.find((t) => t.id === tab)!.cols;
  const rows = data[tab];

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows;
    if (q) {
      out = rows.filter((r) =>
        cols.some((c) => fmtCell(c.key, r[c.key]).toLowerCase().includes(q)),
      );
    }
    const { key, dir } = sort;
    const sign = dir === "asc" ? 1 : -1;
    return [...out].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      // numeric sort when both look numeric
      const an = Number(av);
      const bn = Number(bv);
      if (Number.isFinite(an) && Number.isFinite(bn) && av !== "" && bv !== "") {
        return (an - bn) * sign;
      }
      return fmtCell(key, av).localeCompare(fmtCell(key, bv)) * sign;
    });
  }, [rows, cols, query, sort]);

  const toggleSort = (key: string) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const active = TABS.find((t) => t.id === tab)!;
    const sheetRows = filtered.map((r) => {
      const o: Record<string, string> = {};
      for (const c of active.cols) o[c.label] = fmtCell(c.key, r[c.key]);
      return o;
    });
    const ws = XLSX.utils.json_to_sheet(sheetRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, active.label.slice(0, 31));
    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `hcoe-${tab}-${stamp}.xlsx`);
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <main className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-display text-4xl text-frost">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-frost/50">Form submissions — view, sort, search, export.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-full border border-frost/20 px-4 py-2 text-sm text-frost/70 hover:text-frost hover:border-frost/40 transition-colors cursor-pointer"
            >
              <RefreshCw className="size-4" aria-hidden="true" /> Refresh
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-crimson/30 bg-crimson/10 px-4 py-2 text-sm text-crimson hover:bg-crimson/20 transition-colors cursor-pointer"
            >
              <LogOut className="size-4" aria-hidden="true" /> Log out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setQuery("");
                  setSort({ key: "created_at", dir: "desc" });
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  active ? "bg-gold text-pitch" : "border border-frost/15 text-frost/60 hover:text-frost"
                }`}
              >
                {t.label}
                <span className={`ml-2 text-xs ${active ? "text-pitch/70" : "text-frost/35"}`}>
                  {data[t.id].length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-frost/40"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, ID, program, picks…"
              className="w-full rounded-lg border border-frost/15 bg-midnight/60 py-2.5 pl-10 pr-4 text-sm text-frost placeholder:text-frost/35 outline-none focus:border-gold/60"
            />
          </div>
          <span className="text-sm text-frost/45">{filtered.length} rows</span>
          <button
            onClick={exportExcel}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 rounded-full border border-turf/40 bg-turf/10 px-4 py-2 text-sm text-turf hover:bg-turf/20 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Download className="size-4" aria-hidden="true" /> Download Excel
          </button>
        </div>

        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-2xl border border-frost/10">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="bg-white/5 text-left">
                {cols.map((c) => (
                  <th key={c.key} className="whitespace-nowrap px-4 py-3 font-medium text-frost/70">
                    <button
                      onClick={() => toggleSort(c.key)}
                      className="inline-flex items-center gap-1.5 hover:text-frost cursor-pointer"
                    >
                      {c.label}
                      <ArrowUpDown
                        className={`size-3 ${sort.key === c.key ? "text-gold" : "text-frost/25"}`}
                        aria-hidden="true"
                      />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={(r.id as string) ?? i} className="border-t border-frost/8 hover:bg-white/5">
                  {cols.map((c) => (
                    <td
                      key={c.key}
                      className="max-w-[260px] truncate px-4 py-3 text-frost/80"
                      title={fmtCell(c.key, r[c.key])}
                    >
                      {fmtCell(c.key, r[c.key]) || <span className="text-frost/25">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {loading && <p className="px-4 py-10 text-center text-frost/40 text-sm">Loading…</p>}
          {!loading && error && (
            <p className="px-4 py-10 text-center text-crimson text-sm">{error}</p>
          )}
          {!loading && !error && filtered.length === 0 && (
            <p className="px-4 py-10 text-center text-frost/40 text-sm">No submissions yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
