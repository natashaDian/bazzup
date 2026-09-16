"use client";

import { useActionState, useState } from "react";
import { CheckCircleIcon, StarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { submitBazaarReviewAction, type ReviewActionState } from "@/lib/reviews";

const initialState: ReviewActionState = {};

export function ReviewDialog({
  applicationId,
  bazaarTitle,
}: {
  applicationId: string;
  bazaarTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const boundAction = submitBazaarReviewAction.bind(null, applicationId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center gap-1.5 rounded-lg border border-[#EEE4FA] bg-white px-3 py-1.5 text-xs text-[#3B1F4A]">
        <StarIcon className="size-3.5 text-amber-500" />
        Beri Ulasan
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        {state.success ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircleIcon className="size-12 text-green-600" strokeWidth={1.5} />
            <DialogTitle className="text-lg">Terima kasih!</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Ulasan Anda untuk <span className="font-medium text-foreground">{bazaarTitle}</span>{" "}
              sudah kami terima.
            </DialogDescription>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Tutup
            </button>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="rating" value={rating} />

            <div className="flex flex-col items-center gap-1.5 pt-2 text-center">
              <DialogTitle className="text-lg">Bagaimana pengalaman Anda?</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Berikan ulasan untuk <span className="font-medium text-foreground">{bazaarTitle}</span>{" "}
                &mdash; masukan Anda membantu vendor lain dan penyelenggara.
              </DialogDescription>
            </div>

            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`${value} bintang`}
                  className="p-1"
                >
                  <StarIcon
                    className={
                      value <= (hoverRating || rating)
                        ? "size-9 fill-amber-400 text-amber-400"
                        : "size-9 text-muted-foreground"
                    }
                  />
                </button>
              ))}
            </div>

            <Textarea
              name="comment"
              rows={3}
              placeholder="Ceritakan pengalaman Anda mengikuti bazaar ini (opsional)"
            />

            {state.error && (
              <p className="text-center text-sm text-destructive">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={isPending || rating === 0}
              className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Mengirim..." : "Kirim Ulasan"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
