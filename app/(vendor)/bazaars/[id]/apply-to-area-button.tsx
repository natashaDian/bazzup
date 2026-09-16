"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { CircleCheckBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALREADY_APPLIED_MESSAGE, SLOT_SOLD_OUT_MESSAGE } from "@/lib/application-messages";
import { applyToAreaAction, type ApplyToAreaState } from "../actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
const initialState: ApplyToAreaState = {};

type ApplyToAreaButtonProps = {
  bazaarId: string;
  areaId: string;
  alreadyApplied: boolean;
  soldOut: boolean;
};

export function ApplyToAreaButton({ bazaarId, areaId, alreadyApplied, soldOut }: ApplyToAreaButtonProps) {
  const boundAction = applyToAreaAction.bind(null, bazaarId, areaId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  const disabled = alreadyApplied || soldOut || isPending;
  const errorMessage = alreadyApplied
    ? ALREADY_APPLIED_MESSAGE
    : soldOut
      ? SLOT_SOLD_OUT_MESSAGE
      : state.error;

  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => {
    if (state.success) setShowSuccess(true);
  }, [state.success]);

  return (
    <form action={formAction} className="flex flex-col items-stretch gap-2">
      <Button type="submit" disabled={disabled} className="w-full">
        {isPending ? "Submitting..." : "Apply for This Area"}
      </Button>
      {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="sm:max-w-sm">
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CircleCheckBig className="size-14 text-green-600" strokeWidth={1.5} />
              <DialogTitle className="text-lg">Application Submitted!</DialogTitle>
              <DialogDescription className="text-sm leading-6 text-muted-foreground">
                Please wait for the organizer to review your application. 
                <br />
                Check your application status in the <span className="font-medium">{'"Status"'}</span> section
              </DialogDescription>
              <Link
                href="/applications"
                className="mt-4 flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Got It
              </Link>
            </div>
          </DialogContent>
        </Dialog>
    </form>
  );
}
