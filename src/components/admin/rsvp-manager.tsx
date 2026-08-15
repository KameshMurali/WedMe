"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export type RsvpEventSelection = {
  id: string;
  status: string;
  event: { id: string; title: string };
};

export type RsvpRow = {
  id: string;
  guestName: string;
  guestEmail: string | null;
  guestPhone: string | null;
  status: string;
  attendeeCount: number;
  inviteCode: string | null;
  guestSide: string | null;
  mealPreference: string | null;
  accessibilityNeeds: string | null;
  accommodationNeeds: string | null;
  specialRequests: string | null;
  travelNotes: string | null;
  noteToCouple: string | null;
  createdAt: Date | string;
  eventSelections: RsvpEventSelection[];
};

const ALL = "__all__";
// Sentinel for "field is empty" so couples can find rows still missing an
// answer (e.g. nobody told us their meal preference yet).
const NONE = "__none__";

function sideLabel(side: string | null, partnerOne: string, partnerTwo: string) {
  if (side === "PARTNER_ONE") return `${partnerOne}'s side`;
  if (side === "PARTNER_TWO") return `${partnerTwo}'s side`;
  if (side === "BOTH") return "Both / friend of the couple";
  return "Not specified";
}

function statusPillClasses(status: string) {
  if (status === "ATTENDING") return "bg-emerald-100 text-emerald-900";
  if (status === "DECLINED") return "bg-rose-100 text-rose-900";
  return "bg-amber-100 text-amber-900";
}

export function RsvpManager({
  responses,
  partnerOneName,
  partnerTwoName,
}: {
  responses: RsvpRow[];
  partnerOneName: string;
  partnerTwoName: string;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [eventId, setEventId] = useState(ALL);
  const [side, setSide] = useState(ALL);
  const [meal, setMeal] = useState(ALL);

  // Filter options are derived from the data itself, so a couple only ever
  // sees choices that actually exist in their responses.
  const eventOptions = useMemo(() => {
    const map = new Map<string, string>();
    responses.forEach((response) =>
      response.eventSelections.forEach((selection) => {
        map.set(selection.event.id, selection.event.title);
      }),
    );
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [responses]);

  const mealOptions = useMemo(() => {
    const set = new Set<string>();
    responses.forEach((response) => {
      const value = response.mealPreference?.trim();
      if (value) set.add(value);
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [responses]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return responses.filter((response) => {
      if (status !== ALL && response.status !== status) return false;

      if (side !== ALL) {
        if (side === NONE ? Boolean(response.guestSide) : response.guestSide !== side) return false;
      }

      if (meal !== ALL) {
        const value = response.mealPreference?.trim() ?? "";
        if (meal === NONE ? value.length > 0 : value !== meal) return false;
      }

      if (eventId !== ALL) {
        const attending = response.eventSelections.some(
          (selection) => selection.event.id === eventId,
        );
        if (!attending) return false;
      }

      if (needle) {
        // Free-text search spans every text column so "all columns" are
        // reachable even where a dropdown wouldn't make sense.
        const haystack = [
          response.guestName,
          response.guestEmail,
          response.guestPhone,
          response.inviteCode,
          response.mealPreference,
          response.accessibilityNeeds,
          response.accommodationNeeds,
          response.specialRequests,
          response.travelNotes,
          response.noteToCouple,
          sideLabel(response.guestSide, partnerOneName, partnerTwoName),
          ...response.eventSelections.map((selection) => selection.event.title),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }

      return true;
    });
  }, [responses, search, status, side, meal, eventId, partnerOneName, partnerTwoName]);

  const attendeeTotal = filtered.reduce(
    (total, response) => total + (response.status === "ATTENDING" ? response.attendeeCount : 0),
    0,
  );

  const filtersActive =
    search.trim().length > 0 || status !== ALL || eventId !== ALL || side !== ALL || meal !== ALL;

  function clearFilters() {
    setSearch("");
    setStatus(ALL);
    setEventId(ALL);
    setSide(ALL);
    setMeal(ALL);
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, invite code, notes, meal, travel…"
            className="pl-11"
            aria-label="Search responses"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Status
            </span>
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value={ALL}>All statuses</option>
              <option value="ATTENDING">Attending</option>
              <option value="MAYBE">Maybe</option>
              <option value="DECLINED">Not attending</option>
            </Select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Event
            </span>
            <Select value={eventId} onChange={(event) => setEventId(event.target.value)}>
              <option value={ALL}>All events</option>
              {eventOptions.map(([id, title]) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
            </Select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Side
            </span>
            <Select value={side} onChange={(event) => setSide(event.target.value)}>
              <option value={ALL}>Everyone</option>
              <option value="PARTNER_ONE">{partnerOneName}&apos;s side</option>
              <option value="PARTNER_TWO">{partnerTwoName}&apos;s side</option>
              <option value="BOTH">Both / friend of the couple</option>
              <option value={NONE}>Not specified</option>
            </Select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Meal preference
            </span>
            <Select value={meal} onChange={(event) => setMeal(event.target.value)}>
              <option value={ALL}>All meals</option>
              {mealOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              <option value={NONE}>Not specified</option>
            </Select>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4">
          <p className="text-sm text-[color:var(--muted)]">
            Showing <span className="font-semibold text-[color:var(--text)]">{filtered.length}</span>{" "}
            of {responses.length} response{responses.length === 1 ? "" : "s"} ·{" "}
            <span className="font-semibold text-[color:var(--text)]">{attendeeTotal}</span> attending
            guest{attendeeTotal === 1 ? "" : "s"}
          </p>
          {filtersActive ? (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          ) : null}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="border-dashed text-center">
          <h3 className="font-display text-2xl text-[color:var(--text)]">
            {responses.length === 0 ? "No responses yet" : "No responses match these filters"}
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[color:var(--muted)]">
            {responses.length === 0
              ? "Once guests reply through your RSVP page, their responses will appear here."
              : "Try widening or clearing the filters to see more responses."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((response) => (
            <Card key={response.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-3xl text-[color:var(--text)]">
                      {response.guestName}
                    </h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${statusPillClasses(response.status)}`}
                    >
                      {response.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    {response.attendeeCount} guest(s) · {response.guestEmail ?? "No email"}
                    {response.guestPhone ? ` · ${response.guestPhone}` : ""} ·{" "}
                    {sideLabel(response.guestSide, partnerOneName, partnerTwoName)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {response.eventSelections.map((selection) => (
                      <span
                        key={selection.id}
                        className="rounded-full bg-[color:var(--accent)]/10 px-3 py-1 text-xs font-medium text-[color:var(--primary)]"
                      >
                        {selection.event.title}: {selection.status}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="max-w-md space-y-2 text-sm text-[color:var(--muted)]">
                  {response.noteToCouple ? <p>Note: {response.noteToCouple}</p> : null}
                  {response.mealPreference ? <p>Meal: {response.mealPreference}</p> : null}
                  {response.accessibilityNeeds ? (
                    <p>Accessibility: {response.accessibilityNeeds}</p>
                  ) : null}
                  {response.accommodationNeeds ? (
                    <p>Accommodation: {response.accommodationNeeds}</p>
                  ) : null}
                  {response.travelNotes ? <p>Travel: {response.travelNotes}</p> : null}
                  {response.specialRequests ? <p>Requests: {response.specialRequests}</p> : null}
                  <p className="text-xs">Replied {formatDate(response.createdAt)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
