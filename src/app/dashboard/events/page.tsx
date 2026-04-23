import { replaceEventsAction, replaceScheduleItemsAction } from "@/actions/dashboard";
import { ArrayEditor } from "@/components/admin/array-editor";
import { requireUser } from "@/server/auth/session";
import { getWeddingSiteForUser } from "@/server/repositories/wedding-site";

function toDateTimeLocal(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default async function DashboardEventsPage() {
  const user = await requireUser();
  const site = await getWeddingSiteForUser(user.id);
  if (!site) return null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Events</p>
        <h1 className="mt-3 font-display text-5xl text-[color:var(--text)]">Manage celebration flow</h1>
      </div>
      <ArrayEditor
        title="Event cards"
        description="Each event supports timing, audience, maps, dress code, contact details, and notes."
        items={site.events.map((event) => ({
          title: event.title,
          subtitle: event.subtitle ?? "",
          description: event.description,
          startDateTime: toDateTimeLocal(event.startDateTime),
          endDateTime: toDateTimeLocal(event.endDateTime),
          dayLabel: event.dayLabel,
          locationName: event.locationName,
          fullAddress: event.fullAddress,
          googleMapsUrl: event.googleMapsUrl ?? "",
          dressCode: event.dressCode ?? "",
          notes: event.notes ?? "",
          imageUrl: event.imageUrl ?? "",
          rsvpRequired: event.rsvpRequired,
          audience: event.audience,
          contactName: event.contactName ?? "",
          contactPhone: event.contactPhone ?? "",
        }))}
        emptyItem={{
          title: "",
          subtitle: "",
          description: "",
          startDateTime: "",
          endDateTime: "",
          dayLabel: "",
          locationName: "",
          fullAddress: "",
          googleMapsUrl: "",
          dressCode: "",
          notes: "",
          imageUrl: "",
          rsvpRequired: true,
          audience: "ALL_GUESTS",
          contactName: "",
          contactPhone: "",
        }}
        fields={[
          { name: "title", label: "Title", type: "text" },
          { name: "subtitle", label: "Subtitle", type: "text" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "startDateTime", label: "Starts", type: "datetime-local" },
          { name: "endDateTime", label: "Ends", type: "datetime-local" },
          { name: "dayLabel", label: "Day label", type: "text" },
          { name: "locationName", label: "Location name", type: "text" },
          { name: "fullAddress", label: "Full address", type: "textarea" },
          { name: "googleMapsUrl", label: "Google Maps URL", type: "url" },
          { name: "dressCode", label: "Dress code", type: "text" },
          { name: "notes", label: "Notes", type: "textarea" },
          { name: "imageUrl", label: "Image URL", type: "url" },
          {
            name: "audience",
            label: "Audience",
            type: "select",
            options: [
              { value: "ALL_GUESTS", label: "All guests" },
              { value: "FAMILY_ONLY", label: "Family only" },
              { value: "INVITE_ONLY", label: "Invite only" },
            ],
          },
          { name: "contactName", label: "Contact name", type: "text" },
          { name: "contactPhone", label: "Contact phone", type: "text" },
          { name: "rsvpRequired", label: "RSVP required", type: "checkbox" },
        ]}
        onSave={replaceEventsAction}
      />
      <ArrayEditor
        title="Schedule items"
        description="Curate a readable itinerary across multiple days."
        items={site.scheduleItems.map((item) => ({
          title: item.title,
          category: item.category,
          description: item.description ?? "",
          startDateTime: toDateTimeLocal(item.startDateTime),
          endDateTime: item.endDateTime ? toDateTimeLocal(item.endDateTime) : "",
          dayLabel: item.dayLabel,
          locationName: item.locationName ?? "",
        }))}
        emptyItem={{
          title: "",
          category: "",
          description: "",
          startDateTime: "",
          endDateTime: "",
          dayLabel: "",
          locationName: "",
        }}
        fields={[
          { name: "title", label: "Title", type: "text" },
          { name: "category", label: "Category", type: "text" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "startDateTime", label: "Starts", type: "datetime-local" },
          { name: "endDateTime", label: "Ends", type: "datetime-local" },
          { name: "dayLabel", label: "Day label", type: "text" },
          { name: "locationName", label: "Location name", type: "text" },
        ]}
        onSave={replaceScheduleItemsAction}
      />
    </div>
  );
}
