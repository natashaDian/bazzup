"use client";

import { useActionState, useState } from "react";
import { StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitBazaarReviewAction, type ReviewActionState } from "./actions";

const initialState: ReviewActionState = {};

export function ReviewForm({ applicationId }: { applicationId: string }) {
  const boundAction = submitBazaarReviewAction.bind(null, applicationId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border bg-card p-8 text-center">
        <p className="text-lg font-semibold">Thanks for your review!</p>
        <p className="text-sm text-muted-foreground">
          Your feedback helps other vendors and the organizer.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border bg-card p-6">
      <input type="hidden" name="rating" value={rating} />

      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium">Your rating</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
              className="p-0.5"
            >
              <StarIcon
                className={
                  value <= (hoverRating || rating)
                    ? "size-8 fill-amber-400 text-amber-400"
                    : "size-8 text-muted-foreground"
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="comment" className="text-sm font-medium">
          Your comment (optional)
        </label>
        <Textarea
          id="comment"
          name="comment"
          rows={4}
          placeholder="What went well? What could be better for next time?"
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending || rating === 0}>
        {isPending ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
