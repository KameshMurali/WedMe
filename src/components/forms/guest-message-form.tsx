"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const clientMessageSchema = z.object({
  authorName: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().min(10),
  feedback: z.string().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
});

type MessageValues = z.infer<typeof clientMessageSchema>;

export function GuestMessageForm({ slug, isOpen }: { slug: string; isOpen: boolean }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MessageValues>({
    resolver: zodResolver(clientMessageSchema),
    defaultValues: {
      visibility: "PUBLIC",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug, ...values }),
    });

    const data = (await response.json()) as { error?: string; success?: string };
    if (!response.ok) {
      toast.error(data.error ?? "We couldn’t send your message.");
      return;
    }

    toast.success(data.success ?? "Your message has been sent.");
    reset();
  });

  if (!isOpen) {
    return <p className="text-sm text-[color:var(--muted)]">Messages are not open right now.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="message-name" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
            Your name <span aria-hidden="true">*</span>
          </label>
          <Input id="message-name" placeholder="Your name" {...register("authorName")} />
          {errors.authorName ? <p className="mt-1 text-sm text-rose-600">{errors.authorName.message}</p> : null}
        </div>
        <div>
          <label htmlFor="message-email" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
            Email
          </label>
          <Input id="message-email" placeholder="Optional" type="email" {...register("email")} />
        </div>
      </div>
      <div>
        <label htmlFor="message-visibility" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
          Visibility
        </label>
        <Select id="message-visibility" {...register("visibility")}>
          <option value="PUBLIC">Allow message on public wall</option>
          <option value="PRIVATE">Keep this private</option>
        </Select>
      </div>
      <div>
        <label htmlFor="message-body" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
          Your message <span aria-hidden="true">*</span>
        </label>
        <Textarea id="message-body" placeholder="Your wishes for the couple" {...register("message")} />
        {errors.message ? <p className="mt-1 text-sm text-rose-600">{errors.message.message}</p> : null}
      </div>
      <div>
        <label htmlFor="message-feedback" className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
          Event feedback
        </label>
        <Textarea id="message-feedback" placeholder="Optional event feedback" {...register("feedback")} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Share message"}
      </Button>
    </form>
  );
}
