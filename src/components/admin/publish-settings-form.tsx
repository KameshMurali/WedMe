"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { publishSiteAction, updatePublishSettingsAction } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";

export function PublishSettingsForm({
  defaultValues,
}: {
  defaultValues: {
    visibility: "PUBLIC" | "PASSWORD_PROTECTED" | "INVITE_ONLY";
    status: "DRAFT" | "PUBLISHED";
    noIndex: boolean;
    isRsvpOpen: boolean;
    isUploadsOpen: boolean;
    isMessagesOpen: boolean;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save publish settings"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await publishSiteAction();
              if (result.error) {
                toast.error(result.error);
                return;
              }
              toast.success(result.success ?? "Published");
              router.refresh();
            })
          }
        >
          Publish current draft
        </Button>
      </div>
    </form>
  );
}
