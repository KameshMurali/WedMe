"use client";

import { useRef, useState, useTransition } from "react";
import { MessageSquareHeart, X } from "lucide-react";
import { toast } from "sonner";

import { submitWorkspaceFeedbackAction } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { feedbackCategories } from "@/lib/validations/feedback";

const categoryLabels: Record<(typeof feedbackCategories)[number], string> = {
  PRAISE: "Something you love",
  BUG: "Something's broken",
  IDEA: "Feature idea",
  OTHER: "Anything else",
};

export function FeedbackDialog({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitWorkspaceFeedbackAction({}, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Feedback sent.");
      formRef.current?.reset();
      setRating(null);
      setOpen(false);
    });
  }

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Share feedback"
          className="rounded-full p-2 text-[color:var(--muted)] transition hover:bg-black/5 hover:text-[color:var(--text)]"
        >
          <MessageSquareHeart className="h-5 w-5" />
        </button>
      ) : (
        <Button type="button" variant="ghost" className="w-full justify-start" onClick={() => setOpen(true)}>
          <MessageSquareHeart className="h-4 w-4" />
          Share feedback
        </Button>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-dialog-title"
        >
          <div className="w-full max-w-lg rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_32px_80px_rgba(43,26,24,0.18)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="feedback-dialog-title" className="font-display text-3xl text-stone-900">
                  How's it going?
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Your note goes straight to the team building ToNewBeginning.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close feedback dialog"
                className="rounded-full p-2 text-stone-500 transition hover:bg-black/5 hover:text-stone-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form ref={formRef} action={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="feedback-category" className="mb-1.5 block text-sm font-medium text-stone-900">
                  What's this about?
                </label>
                <Select id="feedback-category" name="category" defaultValue="IDEA">
                  {feedbackCategories.map((category) => (
                    <option key={category} value={category}>
                      {categoryLabels[category]}
                    </option>
                  ))}
                </Select>
              </div>

              <fieldset>
                <legend className="mb-1.5 block text-sm font-medium text-stone-900">
                  How happy are you overall? <span className="font-normal text-stone-500">(optional)</span>
                </legend>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={`${value} star${value > 1 ? "s" : ""}`}
                      aria-pressed={rating === value}
                      onClick={() => setRating(rating === value ? null : value)}
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-lg transition ${
                        rating !== null && value <= rating
                          ? "bg-amber-100 text-amber-600 ring-1 ring-amber-300"
                          : "bg-black/5 text-stone-400 hover:bg-black/10"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <input type="hidden" name="rating" value={rating ?? ""} />
              </fieldset>

              <div>
                <label htmlFor="feedback-message" className="mb-1.5 block text-sm font-medium text-stone-900">
                  Your feedback
                </label>
                <Textarea
                  id="feedback-message"
                  name="message"
                  required
                  minLength={5}
                  maxLength={1000}
                  placeholder="What's working? What's missing? What made you smile or sigh?"
                  rows={4}
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Sending..." : "Send feedback"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
