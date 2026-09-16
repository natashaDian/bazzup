"use client";

import type { ReactNode } from "react";
import { AtSignIcon, ChevronRightIcon, GlobeIcon, MessageCircleIcon, PhoneIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { BazaarOrganizerContact } from "@/lib/bazaars";

type OrganizerInfoDialogProps = {
  name: string;
  contact: BazaarOrganizerContact;
};

export function OrganizerInfoDialog({ name, contact }: OrganizerInfoDialogProps) {
  const initial = name.charAt(0).toUpperCase();
  const hasContact = contact.phone || contact.whatsapp || contact.instagram || contact.website;

  return (
    <Dialog>
      <DialogTrigger
        aria-label="View Organizer"
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
      >
        <ChevronRightIcon className="size-5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <Avatar size="lg" className="size-14">
            <AvatarFallback className="text-lg font-semibold">{initial}</AvatarFallback>
          </Avatar>
          <DialogTitle className="text-lg">{name}</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-muted-foreground">
            {contact.businessDesc || "This organizer hasn't added a description yet."}
          </DialogDescription>

          {hasContact && (
            <div className="mt-2 flex w-full flex-col gap-2 text-left">
              {contact.phone && (
                <ContactRow icon={<PhoneIcon className="size-4" />} value={contact.phone} />
              )}
              {contact.whatsapp && (
                <ContactRow icon={<MessageCircleIcon className="size-4" />} value={contact.whatsapp} />
              )}
              {contact.instagram && (
                <ContactRow icon={<AtSignIcon className="size-4" />} value={contact.instagram} />
              )}
              {contact.website && (
                <ContactRow icon={<GlobeIcon className="size-4" />} value={contact.website} />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContactRow({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground">
      {icon}
      <span className="text-foreground">{value}</span>
    </div>
  );
}
