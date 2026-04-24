"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { moderateMessageAction, moderateUploadAction } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";

export function UploadModerationButtons({ uploadId }: { uploadId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await moderateUploadAction(uploadId, "APPROVED");
            if (result.error) toast.error(result.error);
            else toast.success(result.success ?? "Approved");
            router.refresh();
          })
        }
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await moderateUploadAction(uploadId, "REJECTED");
            if (result.error) toast.error(result.error);
            else toast.success(result.success ?? "Rejected");
            router.refresh();
          })
        }
      >
        Reject
      </Button>
    </div>
  );
}

export function MessageModerationButtons({ messageId }: { messageId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await moderateMessageAction(messageId, "APPROVED");
            if (result.error) toast.error(result.error);
            else toast.success(result.success ?? "Approved");
            router.refresh();
          })
        }
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await moderateMessageAction(messageId, "REJECTED");
            if (result.error) toast.error(result.error);
            else toast.success(result.success ?? "Rejected");
            router.refresh();
          })
        }
      >
        Reject
      </Button>
    </div>
  );
}
