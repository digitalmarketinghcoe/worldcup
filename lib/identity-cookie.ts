import { PROGRAMS } from "@/lib/data";

export const IDENTITY_COOKIE_NAME = "hcoe_identity";

type SavedIdentity = {
  v: 1;
  fullName: string;
  studentId: string;
  program: string;
};

export function readIdentityCookie(): SavedIdentity | null {
  if (typeof document === "undefined") return null;

  try {
    const prefix = `${IDENTITY_COOKIE_NAME}=`;
    const raw = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(prefix));
    if (!raw) return null;

    const parsed: unknown = JSON.parse(decodeURIComponent(raw.slice(prefix.length)));
    if (typeof parsed !== "object" || parsed === null) return null;

    const value = parsed as Record<string, unknown>;
    if (value.v !== 1) return null;
    if (typeof value.fullName !== "string") return null;
    const fullName = value.fullName.trim();
    if (fullName.length < 3 || fullName.length > 80) return null;
    if (typeof value.program !== "string" || !PROGRAMS.includes(value.program)) return null;
    if (typeof value.studentId !== "string") return null;
    const studentId = value.studentId.trim();
    if (studentId !== "" && !/^[A-Za-z0-9/-]{4,20}$/.test(studentId)) return null;

    return {
      v: 1,
      fullName,
      studentId,
      program: value.program,
    };
  } catch {
    return null;
  }
}

export function writeIdentityCookie(identity: {
  fullName: string;
  studentId: string;
  program: string;
}): void {
  if (typeof document === "undefined") return;

  const payload = {
    v: 1,
    fullName: identity.fullName,
    studentId: identity.studentId,
    program: identity.program,
  };
  const encoded = encodeURIComponent(JSON.stringify(payload));
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  document.cookie = `${IDENTITY_COOKIE_NAME}=${encoded}; Max-Age=2592000; Path=/; SameSite=Lax${secure}`;
}
