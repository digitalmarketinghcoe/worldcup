"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  LogOut,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Trophy,
  Swords,
  Calendar,
  GraduationCap,
} from "lucide-react";

const PAGE_SIZE = 25;

type Row = Record<string, unknown>;
type Column = { key: string; label: string; width?: string };

const PREDICTION_COLS: Column[] = [
  { key: "created_at",             label: "Submitted",     width: "w-36"  },
  { key: "full_name",              label: "Name",          width: "w-40"  },
  { key: "student_id",             label: "Student ID",    width: "w-28"  },
  { key: "program",                label: "Program",       width: "w-24"  },
  { key: "golden_ball",            label: "Golden Ball",   width: "w-32"  },
  { key: "golden_boot",            label: "Golden Boot",   width: "w-32"  },
  { key: "young_player",           label: "Young Player",  width: "w-32"  },
  { key: "golden_gloves",          label: "Golden Gloves", width: "w-32"  },
  { key: "final_score",            label: "Final Score",   width: "w-24"  },
  { key: "final_team",             label: "Winner",        width: "w-32"  },
  { key: "final_match_goal_scorer",label: "Final Scorer",  width: "w-32"  },
  { key: "first_place",            label: "1st",           width: "w-28"  },
  { key: "second_place",           label: "2nd",           width: "w-28"  },
  { key: "third_place",            label: "3rd",           width: "w-28"  },
  { key: "best_xi",                label: "Best XI",       width: "w-64"  },
];

const MATCH_COLS: Column[] = [
  { key: "created_at",   label: "Submitted",  width: "w-36" },
  { key: "full_name",    label: "Name",       width: "w-40" },
  { key: "student_id",   label: "Student ID", width: "w-28" },
  { key: "program",      label: "Program",    width: "w-24" },
  { key: "match_label",  label: "Match",      width: "w-52" },
  { key: "outcome",      label: "Pick",       width: "w-28" },
  { key: "match_number", label: "Match #",    width: "w-20" },
  { key: "event_id",     label: "Event ID",   width: "w-28" },
];

const TABS = [
  { id: "predictions"    as const, label: "Tournament Predictions", icon: Trophy, cols: PREDICTION_COLS },
  { id: "matchPredictions" as const, label: "Daily Match Picks",    icon: Swords, cols: MATCH_COLS      },
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
  return cellText(v);
}

const OUTCOME_CLS: Record<string, string> = {
  home: "bg-turf/15 text-turf border border-turf/25",
  away: "bg-gold/15 text-gold border border-gold/25",
  draw: "bg-frost/10 text-frost/70 border border-frost/15",
};

function CellContent({ col, value, row }: { col: Column; value: unknown; row: Row }) {
  if (col.key === "outcome" && value) {
    const outcome = String(value);
    const cls = OUTCOME_CLS[outcome];
    if (cls) {
      let label: string;
      if (outcome === "home") {
        label = row.home_team ? String(row.home_team) : "Home Win";
      } else if (outcome === "away") {
        label = row.away_team ? String(row.away_team) : "Away Win";
      } else {
        label = "Draw";
      }
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
          {label}
        </span>
      );
    }
  }
  const text = fmtCell(col.key, value);
  if (!text) return <span className="text-frost/25">—</span>;
  return <span className="truncate block" title={text}>{text}</span>;
}

function SortIcon({ colKey, sort }: { colKey: string; sort: { key: string; dir: "asc" | "desc" } }) {
  if (sort.key !== colKey) return <ChevronsUpDown className="size-3 text-frost/20" aria-hidden="true" />;
  return sort.dir === "asc"
    ? <ChevronUp   className="size-3 text-gold" aria-hidden="true" />
    : <ChevronDown className="size-3 text-gold" aria-hidden="true" />;
}

export function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab]   = React.useState<TabId>("predictions");
  const [data, setData] = React.useState<Record<TabId, Row[]>>({ predictions: [], matchPredictions: [] });
  const [loading, setLoading] = React.useState(true);
  const [error,   setError]   = React.useState("");
  const [query,     setQuery]     = React.useState("");
  const [program,   setProgram]   = React.useState("all");
  const [sort,      setSort]      = React.useState<{ key: string; dir: "asc" | "desc" }>({ key: "created_at", dir: "desc" });
  const [page,      setPage]      = React.useState(1);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/data", { cache: "no-store" });
      if (res.status === 401) { router.replace("/admin/login"); return; }
      const d = await res.json();
      if (!d.ok) { setError(d.error ?? "Could not load data."); return; }
      setData({ predictions: d.predictions ?? [], matchPredictions: d.matchPredictions ?? [] });
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  React.useEffect(() => { load(); }, [load]);

  const cols = TABS.find((t) => t.id === tab)!.cols;
  const rows = data[tab];

  // Unique programs for filter dropdown
  const programs = React.useMemo(() => {
    const all = rows.map((r) => String(r.program ?? "")).filter(Boolean);
    return ["all", ...Array.from(new Set(all)).sort()];
  }, [rows]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows;
    if (program !== "all") out = out.filter((r) => String(r.program ?? "") === program);
    if (q) out = out.filter((r) => cols.some((c) => fmtCell(c.key, r[c.key]).toLowerCase().includes(q)));
    const { key, dir } = sort;
    const sign = dir === "asc" ? 1 : -1;
    return [...out].sort((a, b) => {
      const av = a[key], bv = b[key];
      const an = Number(av), bn = Number(bv);
      if (Number.isFinite(an) && Number.isFinite(bn) && av !== "" && bv !== "") return (an - bn) * sign;
      return fmtCell(key, av).localeCompare(fmtCell(key, bv)) * sign;
    });
  }, [rows, cols, query, program, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page whenever filters/sort/tab change
  React.useEffect(() => { setPage(1); }, [query, program, sort, tab]);

  const toggleSort = (key: string) =>
    setSort((s) => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });

  const quickSort = (key: string, dir: "asc" | "desc") =>
    setSort((s) => s.key === key && s.dir === dir ? { key: "created_at", dir: "desc" } : { key, dir });

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
    XLSX.writeFile(wb, `hcoe-${tab}-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  const activeTab = TABS.find((t) => t.id === tab)!;

  return (
    <div className="min-h-screen bg-pitch">
      {/* Top accent bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-crimson via-gold to-turf" />

      <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-gold/70">
              HCOE · Fan Zone 2026
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-frost md:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-frost/45">View, sort, search and export form submissions.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-frost/15 bg-white/5 px-4 py-2 text-sm text-frost/60 transition-colors hover:border-frost/30 hover:text-frost disabled:opacity-40 cursor-pointer"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
              Refresh
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-crimson/25 bg-crimson/8 px-4 py-2 text-sm text-crimson transition-colors hover:bg-crimson/15 cursor-pointer"
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              Log out
            </button>
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Tournament Predictions" value={data.predictions.length}   color="text-gold"   />
          <StatCard label="Match Picks"             value={data.matchPredictions.length} color="text-turf" />
          <StatCard label="Showing"                 value={`${filtered.length} / ${rows.length}`} color="text-frost" isText />
          <StatCard label="Table"                   value={activeTab.label}           color="text-frost/60" isText />
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────── */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-frost/10 pb-0">
          {TABS.map((t) => {
            const active = t.id === tab;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setQuery(""); setProgram("all"); setSort({ key: "created_at", dir: "desc" }); }}
                className={`relative inline-flex items-center gap-2 rounded-t-lg px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-white/6 text-frost border border-b-0 border-frost/12"
                    : "text-frost/45 hover:text-frost/75"
                }`}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {t.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[0.62rem] font-semibold ${
                  active ? "bg-gold/20 text-gold" : "bg-white/8 text-frost/40"
                }`}>
                  {data[t.id].length}
                </span>
                {active && <span className="absolute bottom-0 inset-x-0 h-px bg-pitch" />}
              </button>
            );
          })}
        </div>

        {/* ── Toolbar ────────────────────────────────────────────────── */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-frost/35" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${activeTab.label.toLowerCase()}…`}
              className="w-full rounded-lg border border-frost/12 bg-white/5 py-2 pl-9 pr-4 text-sm text-frost placeholder:text-frost/30 outline-none focus:border-gold/50 focus:bg-white/7 transition-colors"
            />
          </div>

          {/* Quick sort: Date */}
          <div className="flex items-center gap-1 rounded-lg border border-frost/10 bg-white/[0.03] px-2 py-1">
            <Calendar className="size-3 text-frost/30 mr-1" aria-hidden="true" />
            <button
              onClick={() => quickSort("created_at", "desc")}
              title="Newest first"
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors cursor-pointer ${
                sort.key === "created_at" && sort.dir === "desc"
                  ? "bg-gold/20 text-gold"
                  : "text-frost/45 hover:text-frost"
              }`}
            >
              Newest
            </button>
            <span className="text-frost/15 text-xs">|</span>
            <button
              onClick={() => quickSort("created_at", "asc")}
              title="Oldest first"
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors cursor-pointer ${
                sort.key === "created_at" && sort.dir === "asc"
                  ? "bg-gold/20 text-gold"
                  : "text-frost/45 hover:text-frost"
              }`}
            >
              Oldest
            </button>
          </div>

          {/* Program filter */}
          <div className="flex items-center gap-1.5 rounded-lg border border-frost/10 bg-white/[0.03] px-2 py-1">
            <GraduationCap className="size-3 text-frost/30 shrink-0" aria-hidden="true" />
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="bg-transparent text-xs text-frost/70 outline-none cursor-pointer max-w-[160px]"
            >
              <option value="all">All Programs</option>
              {programs.slice(1).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Quick sort: Program A→Z */}
          <button
            onClick={() => quickSort("program", sort.key === "program" && sort.dir === "asc" ? "desc" : "asc")}
            title="Sort by program"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              sort.key === "program"
                ? "border-gold/30 bg-gold/10 text-gold"
                : "border-frost/10 bg-white/[0.03] text-frost/45 hover:text-frost"
            }`}
          >
            <GraduationCap className="size-3" aria-hidden="true" />
            Program
            {sort.key === "program" && (
              sort.dir === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
            )}
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={exportExcel}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-turf/30 bg-turf/8 px-4 py-2 text-sm text-turf transition-colors hover:bg-turf/15 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Download className="size-3.5" aria-hidden="true" />
              Export Excel
            </button>
          </div>
        </div>

        {/* ── Table ──────────────────────────────────────────────────── */}
        <div className="mt-3 rounded-xl border border-frost/10 bg-white/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ tableLayout: "fixed", minWidth: "860px" }}>
              <colgroup>
                {cols.map((c) => (
                  <col key={c.key} className={c.width} />
                ))}
              </colgroup>
              <thead>
                <tr className="border-b border-frost/10 bg-white/[0.04]">
                  {cols.map((c) => (
                    <th key={c.key} className="px-4 py-3 text-left">
                      <button
                        onClick={() => toggleSort(c.key)}
                        className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-frost/50 hover:text-frost transition-colors cursor-pointer"
                      >
                        {c.label}
                        <SortIcon colKey={c.key} sort={sort} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={cols.length} className="px-4 py-14 text-center text-sm text-frost/35">
                      <RefreshCw className="mx-auto mb-3 size-5 animate-spin opacity-40" aria-hidden="true" />
                      Loading submissions…
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={cols.length} className="px-4 py-14 text-center text-sm text-crimson/80">
                      {error}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={cols.length} className="px-4 py-14 text-center text-sm text-frost/30">
                      {query ? "No results match your search." : "No submissions yet."}
                    </td>
                  </tr>
                ) : (
                  paged.map((r, i) => (
                    <tr
                      key={(r.id as string) ?? i}
                      className="border-t border-frost/[0.06] transition-colors hover:bg-white/[0.04]"
                    >
                      {cols.map((c) => (
                        <td key={c.key} className="overflow-hidden px-4 py-3 text-frost/75">
                          <CellContent col={c} value={r[c.key]} row={r} />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          {!loading && !error && filtered.length > 0 && (
            <div className="border-t border-frost/[0.06] bg-white/[0.02] px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap">
              <span className="text-xs text-frost/30">
                {filtered.length} {filtered.length === 1 ? "row" : "rows"}
                {(query || program !== "all") && ` (filtered from ${rows.length})`}
                {totalPages > 1 && ` · page ${page} of ${totalPages}`}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="rounded px-2 py-1 text-xs text-frost/40 hover:text-frost disabled:opacity-20 cursor-pointer disabled:cursor-default transition-colors"
                  >
                    «
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded p-1 text-frost/40 hover:text-frost disabled:opacity-20 cursor-pointer disabled:cursor-default transition-colors"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                    .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                      if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…");
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((n, i) =>
                      n === "…" ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-xs text-frost/20">…</span>
                      ) : (
                        <button
                          key={n}
                          onClick={() => setPage(n as number)}
                          className={`min-w-[1.75rem] rounded px-1.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                            page === n
                              ? "bg-gold/20 text-gold"
                              : "text-frost/40 hover:text-frost"
                          }`}
                        >
                          {n}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded p-1 text-frost/40 hover:text-frost disabled:opacity-20 cursor-pointer disabled:cursor-default transition-colors"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="rounded px-2 py-1 text-xs text-frost/40 hover:text-frost disabled:opacity-20 cursor-pointer disabled:cursor-default transition-colors"
                  >
                    »
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  isText,
}: {
  label: string;
  value: number | string;
  color: string;
  isText?: boolean;
}) {
  return (
    <div className="rounded-xl border border-frost/8 bg-white/[0.03] px-4 py-3">
      <p className="text-[0.65rem] font-medium uppercase tracking-wider text-frost/35">{label}</p>
      <p className={`mt-1 ${isText ? "text-base font-medium truncate" : "text-2xl font-bold tabular-nums"} ${color}`}>
        {value}
      </p>
    </div>
  );
}
