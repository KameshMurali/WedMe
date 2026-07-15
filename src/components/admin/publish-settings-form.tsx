"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { publishSiteAction, updatePublishSettingsAction } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";

export function PublishSettingsForm({
  defaultValues,
  publishBlockers = [],
}: {
  defaultValues: {
    visibility: "PUBLIC" | "PASSWORD_PROTECTED" | "INVITE_ONLY";
    status: "DRAFT" | "PUBLISHED";
    noIndex: boolean;
    isRsvpOpen: boolean;
    isUploadsOpen: boolean;
    isMessagesOpen: boolean;
  };
  // Unmet critical readiness checks (computed server-side). When non-empty,
  // publishing asks for confirmation instead of firing immediately.
  publishBlockers?: string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPublishWarning, setShowPublishWarning] = useState(false);

  function runPublish() {
    setShowPublishWarning(false);
    startTransition(async () => {
      const result = await publishSiteAction();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Published");
      router.refresh();
    });
  }

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          const result = await updatePublishSettingsAction({}, formData);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          toast.success(result.success ?? "Settings saved");
          router.refresh();
        })
      }
      className="space-y-5"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-[color:var(--muted)]">
          <span>Visibility</span>
          <select
            name="visibility"
            defaultValue={defaultValues.visibility}
            className="h-12 w-full rounded-2xl border border-black/10 bg-white/85 px-4"
          >
            <option value="PUBLIC">Public</option>
            <option value="PASSWORD_PROTECTED">Password protected</option>
            <option value="INVITE_ONLY">Invite only</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-[color:var(--muted)]">
          <span>Status</span>
          <select
            name="status"
            defaultValue={defaultValues.status}
            className="h-12 w-full rounded-2xl border border-black/10 bg-white/85 px-4"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </label>
      </div>
      <label className="space-y-2 text-sm text-[color:var(--muted)]">
        <span>Site password</span>
        <input
          name="sitePassword"
          type="password"
          className="h-12 w-full rounded-2xl border border-black/10 bg-white/85 px-4"
          placeholder="Optional password"
        />
      </label>
      <div className="grid gap-3 text-sm text-[color:var(--muted)] md:grid-cols-2">
        {[
          { key: "noIndex", label: "Hide from search engines", checked: defaultValues.noIndex },
          { key: "isRsvpOpen", label: "Keep RSVPs open", checked: defaultValues.isRsvpOpen },
          { key: "isUploadsOpen", label: "Accept guest uploads", checked: defaultValues.isUploadsOpen },
          { key: "isMessagesOpen", label: "Accept guest messages", checked: defaultValues.isMessagesOpen },
        ].map((item) => (
          <label key={item.key} className="flex items-center gap-3 rounded-2xl border border-black/8 bg-white/70 px-4 py-3">
            <input type="checkbox" name={item.key} defaultChecked={item.checked} />
            {item.label}
          </label>
        ))}
      </div>
      {showPublishWarning ? (
        <div
          role="alertdialog"
          aria-label="Publish warning"
          className="rounded-3xl border border-amber-200 bg-amber-50/95 px-5 py-4"
        >
          <p className="flex items-center gap-2 font-semibold text-amber-950">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Hold on — guests will hit problems:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-9 text-sm leading-6 text-amber-950">
            {publishBlockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" variant="outline" disabled={isPending} onClick={runPublish}>
              Publish anyway
            </Button>
            <Button type="button" disabled={isPending} onClick={() => setShowPublishWarning(false)}>
              Review first
            </Button>
          </div>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save publish settings"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => {
            if (publishBlockers.length > 0) {
              setShowPublishWarning(true);
              return;
            }
            runPublish();
          }}
        >
          Publish current draft
        </Button>
      </div>
    </form>
  );
}
