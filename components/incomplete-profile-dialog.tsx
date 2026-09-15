"use client";

import { useState } from "react";
import Link from "next/link";
import { TriangleAlertIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function IncompleteProfileDialog({ defaultOpen }: { defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <TriangleAlertIcon className="size-14 text-amber-500" strokeWidth={1.5} />
          <DialogTitle className="text-lg">Complete Your Profile First</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-muted-foreground">
            Organizers need your business details to review applications.
            <br />
            Please fill in your profile before applying to a bazaar.
          </DialogDescription>
          <Link
            href="/profile"
            className="mt-4 flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go to Profile
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
