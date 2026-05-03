import {
  replaceDressCodesAction,
  replaceFaqItemsAction,
  replaceStoryMilestonesAction,
  replaceTidbitsAction,
  replaceTravelGuideItemsAction,
  replaceVideosAction,
} from "@/actions/dashboard";
import { ArrayEditor } from "@/components/admin/array-editor";
import { AdminMediaUploader } from "@/components/admin/media-uploader";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/server/auth/session";
import { getContentEditorSiteForUser } from "@/server/repositories/wedding-site";
import {
  directBlobUploadsEnabled,
  storageUploadsConfigurationMessage,
  storageUploadsConfigured,
} from "@/server/storage/upload-config";

export default async function DashboardContentPage() {
  const user = await requireUser();
  const site = await getContentEditorSiteForUser(user.id);
  if (!site) return null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Content</p>
        <h1 className="mt-3 font-display text-5xl text-[color:var(--text)]">Storytelling sections</h1>
      </div>
      <AdminMediaUploader
        slug={site.slug}
        useSignedUploads={directBlobUploadsEnabled}
        uploadsEnabled={storageUploadsConfigured}
        disabledReason={storageUploadsConfigurationMessage}
      />
      <ArrayEditor
        title="Story timeline"
        description="Edit the milestones that tell the couple’s journey."
        items={site.storyMilestones.map((item) => ({
          title: item.title,
          shortLabel: item.shortLabel ?? "",
          eventDateLabel: item.eventDateLabel,
          description: item.description,
          imageUrl: item.imageUrl ?? "",
        }))}
        emptyItem={{
          title: "",
          shortLabel: "",
          eventDateLabel: "",
          description: "",
          imageUrl: "",
        }}
        fields={[
          { name: "title", label: "Title", type: "text" },
          { name: "shortLabel", label: "Short label", type: "text" },
          { name: "eventDateLabel", label: "Date label", type: "text" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "imageUrl", label: "Image URL", type: "url" },
        ]}
        onSave={replaceStoryMilestonesAction}
      />
      <ArrayEditor
        title="Tidbits"
        description="Helpful notes, fun facts, traditions, and what-to-know cards."
        items={site.tidbits.map((item) => ({
          title: item.title,
          body: item.body,
          category: item.category,
          iconKey: item.iconKey ?? "",
        }))}
        emptyItem={{ title: "", body: "", category: "", iconKey: "" }}
        fields={[
          { name: "title", label: "Title", type: "text" },
          { name: "category", label: "Category", type: "text" },
          { name: "body", label: "Body", type: "textarea" },
          { name: "iconKey", label: "Icon key", type: "text" },
        ]}
        onSave={replaceTidbitsAction}
      />
      <ArrayEditor
        title="FAQs"
        description="Travel notes, guest questions, and quick reassurance."
        items={site.faqItems.map((item) => ({
          question: item.question,
          answer: item.answer,
          category: item.category,
        }))}
        emptyItem={{ question: "", answer: "", category: "" }}
        fields={[
          { name: "question", label: "Question", type: "text" },
          { name: "category", label: "Category", type: "text" },
          { name: "answer", label: "Answer", type: "textarea" },
        ]}
        onSave={replaceFaqItemsAction}
      />
      <ArrayEditor
        title="Guest experience"
        description="Travel, accommodation, airport, parking, recommendations, and logistics."
        items={site.travelGuideItems.map((item) => ({
          category: item.category,
          title: item.title,
          description: item.description,
          url: item.url ?? "",
        }))}
        emptyItem={{
          category: "TRANSPORT",
          title: "",
          description: "",
          url: "",
        }}
        fields={[
          {
            name: "category",
            label: "Category",
            type: "select",
            options: [
              "AIRPORT",
              "TRANSPORT",
              "HOTELS",
              "PARKING",
              "FAQ",
              "RECOMMENDATIONS",
              "WHAT_TO_BRING",
              "EMERGENCY",
            ].map((value) => ({ value, label: value.replaceAll("_", " ") })),
          },
          { name: "title", label: "Title", type: "text" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "url", label: "External link", type: "url" },
        ]}
        onSave={replaceTravelGuideItemsAction}
      />
      <ArrayEditor
        title="Dress codes"
        description="Add event-specific styling guidance and inspiration."
        items={site.dressCodeGuides.map((item) => ({
          eventId: item.eventId ?? "",
          title: item.title,
          guidance: item.guidance,
          inspirationImage: item.inspirationImage ?? "",
          palette: Array.isArray(item.palette) ? item.palette.map(String) : [],
        }))}
        emptyItem={{
          eventId: "",
          title: "",
          guidance: "",
          inspirationImage: "",
          palette: [],
        }}
        fields={[
          {
            name: "eventId",
            label: "Event",
            type: "select",
            options: [{ value: "", label: "General" }].concat(
              site.events.map((event) => ({ value: event.id, label: event.title })),
            ),
          },
          { name: "title", label: "Title", type: "text" },
          { name: "guidance", label: "Guidance", type: "textarea" },
          { name: "inspirationImage", label: "Inspiration image URL", type: "url" },
          { name: "palette", label: "Palette colors (comma separated)", type: "array-text" },
        ]}
        onSave={replaceDressCodesAction}
      />
      <ArrayEditor
        title="Embedded videos"
        description="Paste YouTube videos for teasers, stories, and highlights."
        items={site.embeddedVideos.map((item) => ({
          title: item.title,
          typeLabel: item.typeLabel,
          youtubeUrl: item.youtubeUrl,
        }))}
        emptyItem={{ title: "", typeLabel: "", youtubeUrl: "" }}
        fields={[
          { name: "title", label: "Title", type: "text" },
          { name: "typeLabel", label: "Type label", type: "text" },
          { name: "youtubeUrl", label: "YouTube URL", type: "url" },
        ]}
        onSave={replaceVideosAction}
      />
      <Card className="text-sm leading-7 text-[color:var(--muted)]">
        Draft changes here stay in the editor until you publish them from Settings.
      </Card>
    </div>
  );
}
