import { NextResponse } from "next/server";

import { getCurrentUser, isAdminUser } from "@/server/auth/session";
import { getWaitlistSignups } from "@/server/repositories/waitlist";

function quote(value: string | number | null | undefined) {
  const safeValue = value == null ? "" : String(value);
  return `"${safeValue.replaceAll('"', '""')}"`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const rows = await getWaitlistSignups();

  const header = ["Email", "Plan", "Currency", "Source", "Joined"];
  const body = rows.map((row) => [
    row.email,
    row.planKey,
    row.currency,
    row.source ?? "",
    row.createdAt.toISOString(),
  ]);

  const csv = [header, ...body].map((row) => row.map(quote).join(",")).join("\n");

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="waitlist-${stamp}.csv"`,
    },
  });
}
