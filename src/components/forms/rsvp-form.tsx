"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// The event minimum only applies when the site actually has events —
// sites published without events still accept a general RSVP.
function buildClientRsvpSchema(hasEvents: boolean) {
  return z.object({
    guestName: z.string().min(2),
    guestEmail: z.string().email().optional().or(z.literal("")),
    guestPhone: z.string().max(30).optional(),
    inviteCode: z.string().optional().or(z.literal("")),
    status: z.enum(["ATTENDING", "MAYBE", "DECLINED"]),
    attendeeCount: z.number().min(1).max(10),
    guestSide: z.enum(["PARTNER_ONE", "PARTNER_TWO", "BOTH", ""]).optional(),
    mealPreference: z.string().optional(),
    accommodationNeeds: z.string().optional(),
    travelNotes: z.string().optional(),
    specialRequests: z.string().optional(),
    accessibilityNeeds: z.string().optional(),
    noteToCouple: z.string().optional(),
    selectedEventIds: hasEvents
      ? z.array(z.string()).min(1, "Choose at least one event.")
      : z.array(z.string()),
  });
}

type ClientRsvpValues = z.infer<ReturnType<typeof buildClientRsvpSchema>>;

export function RsvpForm({
  slug,
  events,
  isOpen,
  partnerOneName,
  partnerTwoName,
}: {
  slug: string;
  events: Array<{ id: string; title: string; dayLabel: string }>;
  isOpen: boolean;
  // Used to label the "whose side" options with the couple's actual names
  // instead of hardcoded bride/groom wording.
  partnerOneName: string;
  partnerTwoName: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClientRsvpValues>({
    resolver: zodResolver(buildClientRsvpSchema(events.length > 0)),
    defaultValues: {
      status: "ATTENDING",
      attendeeCount: 1,
      selectedEventIds: events.map((event) => event.id),
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      slug,
      guestName: values.guestName,
      guestEmail: values.guestEmail,
      guestPhone: values.guestPhone,
      inviteCode: values.inviteCode,
      status: values.status,
      attendeeCount: values.attendeeCount,
      guestSide: values.guestSide,
      mealPreference: values.mealPreference,
      accommodationNeeds: values.accommodationNeeds,
      travelNotes: values.travelNotes,
      specialRequests: values.specialRequests,
      accessibilityNeeds: values.accessibilityNeeds,
      noteToCouple: values.noteToCouple,
      selectedEvents: values.selectedEventIds.map((eventId: string) => ({
        eventId,
        status: values.status,
      })),
    };

    const response = await fetch("/api/rsvp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { error?: string; success?: string };

    if (!response.ok) {
      toast.error(data.error ?? "We couldn’t save your RSVP.");
      return;
    }

    toast.success(data.success ?? "Your RSVP has been submitted.");
    reset();
  }, () => {
    // Surface validation failures as a toast too — field errors alone can sit
    // off-screen on mobile, making a failed submit look like a dead button.
    toast.error("Please review the highlighted fields and try again.");
  });

  if (!isOpen) {
    return (
      <Card>
        <h3 className="font-display text-3xl text-[color:var(--text)]">RSVPs are currently closed</h3>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
          The couple may reopen responses soon. Please check back later.
        </p>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="rsvp-name" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
            Full name <span aria-hidden="true">*</span>
          </label>
          <Input id="rsvp-name" placeholder="Your full name" {...register("guestName")} />
          {errors.guestName ? <p className="mt-2 text-sm text-rose-600">{errors.guestName.message}</p> : null}
        </div>
        <div>
          <label htmlFor="rsvp-email" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
            Email address
          </label>
          <Input id="rsvp-email" placeholder="Optional" type="email" {...register("guestEmail")} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="rsvp-phone" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
            Contact number
          </label>
          <Input id="rsvp-phone" type="tel" placeholder="Optional" {...register("guestPhone")} />
        </div>
        <div>
          <label htmlFor="rsvp-code" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
            Invite code
          </label>
          <Input id="rsvp-code" placeholder="Optional" {...register("inviteCode")} />
        </div>
        <div>
          <label htmlFor="rsvp-status" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
            Response <span aria-hidden="true">*</span>
          </label>
          <Select id="rsvp-status" {...register("status")}>
            <option value="ATTENDING">Attending</option>
            <option value="MAYBE">Maybe</option>
            <option value="DECLINED">Not attending</option>
          </Select>
        </div>
        <div>
          <label htmlFor="rsvp-count" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
            Attendees <span aria-hidden="true">*</span>
          </label>
          <Input
            id="rsvp-count"
            type="number"
            min={1}
            max={10}
            placeholder="1"
            {...register("attendeeCount", { valueAsNumber: true })}
          />
        </div>
      </div>

      {events.length > 0 ? (
        <Card className="space-y-4">
          <h3 className="text-lg font-semibold text-[color:var(--text)]">Select your events</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {events.map((event) => (
              <label
                key={event.id}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/8 bg-white/70 px-4 py-3 text-sm"
              >
                <input
                  type="checkbox"
                  value={event.id}
                  {...register("selectedEventIds")}
                />
                <span>
                  <span className="font-medium text-[color:var(--text)]">{event.title}</span>
                  <span className="block text-xs text-[color:var(--muted)]">{event.dayLabel}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.selectedEventIds ? (
            <p className="text-sm text-rose-600">{errors.selectedEventIds.message}</p>
          ) : null}
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="rsvp-side" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
            Whose side are you joining from?
          </label>
          <Select id="rsvp-side" {...register("guestSide")}>
            <option value="">Prefer not to say</option>
            <option value="PARTNER_ONE">{partnerOneName}&apos;s side</option>
            <option value="PARTNER_TWO">{partnerTwoName}&apos;s side</option>
            <option value="BOTH">Both / friend of the couple</option>
          </Select>
        </div>
        <div>
          <label htmlFor="rsvp-meal" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">Meal preferences</label>
          <Input id="rsvp-meal" placeholder="e.g. Vegetarian, Vegan, No nuts" {...register("mealPreference")} />
        </div>
        <div>
          <label htmlFor="rsvp-accommodation" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">Accommodation needs</label>
          <Input id="rsvp-accommodation" placeholder="e.g. Help booking a hotel" {...register("accommodationNeeds")} />
        </div>
        <div>
          <label htmlFor="rsvp-travel" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">Travel notes</label>
          <Input id="rsvp-travel" placeholder="e.g. Flying in from London" {...register("travelNotes")} />
        </div>
        <div>
          <label htmlFor="rsvp-access" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">Accessibility requests</label>
          <Input id="rsvp-access" placeholder="e.g. Wheelchair access needed" {...register("accessibilityNeeds")} />
        </div>
      </div>
      <div>
        <label htmlFor="rsvp-special" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">Special requests</label>
        <Textarea id="rsvp-special" placeholder="Anything else the couple should know" {...register("specialRequests")} />
      </div>
      <div>
        <label htmlFor="rsvp-note" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">Note to the couple</label>
        <Textarea id="rsvp-note" placeholder="A personal message for Kamesh & Monisha" {...register("noteToCouple")} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit RSVP"}
      </Button>
    </form>
  );
}
