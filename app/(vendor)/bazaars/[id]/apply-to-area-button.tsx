"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { ALREADY_APPLIED_MESSAGE } from "@/lib/application-messages";
import { applyToAreaAction, type ApplyToAreaState } from "../actions";

const initialState: ApplyToAreaState = {};

type ApplyToAreaButtonProps = {
  bazaarId: string;
  areaId: string;
  alreadyApplied: boolean;
};

export function ApplyToAreaButton({ bazaarId, areaId, alreadyApplied }: ApplyToAreaButtonProps) {
  const boundAction = applyToAreaAction.bind(null, bazaarId, areaId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  const disabled = alreadyApplied || isPending;
  const errorMessage = alreadyApplied ? ALREADY_APPLIED_MESSAGE : state.error;

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <Button type="submit" disabled={disabled}>
        {isPending ? "Submitting..." : "Apply for This Area"}
      </Button>
      {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
      {!alreadyApplied && state.success && (
        <p className="text-xs text-primary">{state.success}</p>
      )}
    </form>
  );
}
