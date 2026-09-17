import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import {
  CalendarIcon,
  LayersIcon,
  MapPinIcon,
  StoreIcon,
  TagIcon,
  TrendingUpIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatDateDisplay } from "@/lib/date";
import { formatRupiah } from "@/lib/currency";
import { getCurrentUser } from "@/lib/auth";
import { getBazaarById, getVendorAppliedAreaIds } from "@/lib/bazaars";
import { isVendorProfileComplete } from "@/lib/vendor-profile";
import { BazaarImageCarousel } from "@/components/bazaar-image-carousel";
import { OrganizerInfoDialog } from "@/components/organizer-info-dialog";
import { ApplyToAreaButton } from "./apply-to-area-button";

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" }> = {
  ACTIVE: { label: "Open", variant: "default" },
  FULL: { label: "Full", variant: "secondary" },
  COMPLETED: { label: "Completed", variant: "secondary" },
  DRAFT: { label: "Draft", variant: "secondary" },
};

type PageParams = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { id } = await params;
  const bazaar = await getBazaarById(id);

  return { title: bazaar ? `${bazaar.title} - BazzUp` : "Bazaar - BazzUp" };
}

export default async function BazaarDetailPage({ params }: PageParams) {
  const { id } = await params;
  const bazaar = await getBazaarById(id);

  if (!bazaar) {
    notFound();
  }

  const user = await getCurrentUser();

  // Vendors are gated behind a complete profile so organizers always get
  // usable info to review applications with - anyone getting here without
  // one (direct link, back button, other cards) gets bounced back.
  if (user?.role === "VENDOR" && !isVendorProfileComplete(user)) {
    redirect("/explore?incompleteProfile=1");
  }

  const appliedAreaIds = user
    ? await getVendorAppliedAreaIds(
        user.id,
        bazaar.areas.map((area) => area.id)
      )
    : new Set<string>();

  const categories = [
    ...new Set(
      bazaar.areas.map((area) => area.categoryWanted).filter((c): c is string => Boolean(c))
    ),
  ];
  const maxTraffic = bazaar.areas.reduce(
    (max, area) => (area.estimatedTraffic && area.estimatedTraffic > max ? area.estimatedTraffic : max),
    0
  );
  const status = STATUS_LABEL[bazaar.status] ?? { label: bazaar.status, variant: "secondary" as const };
  const organizerInitial = bazaar.organizerName.charAt(0).toUpperCase();
  const confirmedVendorCount = bazaar.areas.reduce(
    (sum, area) => sum + (area.totalSlot - area.slotsLeft),
    0
  );
  const mapsUrl = bazaar.latitude !== null && bazaar.longitude !== null
    ? `https://www.google.com/maps?q=${bazaar.latitude},${bazaar.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${bazaar.address}, ${bazaar.city}`)}`;

  return (
    <main className="mx-auto mt-6 flex w-full max-w-6xl flex-1 flex-col px-6 py-10 md:mt-8 md:px-10 md:py-12 lg:px-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <BazaarImageCarousel images={bazaar.images} title={bazaar.title} />

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-[#3B1F4A] sm:text-[32px]">{bazaar.title}</h1>
              <Badge
                variant={status.variant}
                className={`h-auto rounded-full px-3 py-1 text-xs font-semibold ${
                  bazaar.status === "ACTIVE" ? "bg-[#4CAF50] text-white" : ""
                }`}
              >
                {status.label}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#6B7280]">
              <p className="flex min-w-0 flex-1 items-center gap-1.5">
                <MapPinIcon className="size-4 shrink-0 text-[#B98CDE]" />
                <span className="truncate">
                  {bazaar.city} &middot; {bazaar.address}
                </span>
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-sm font-medium text-[#7A5CA8] transition-colors duration-200 hover:text-[#3B1F4A]"
              >
                View Maps &rarr;
              </a>
            </div>

            <p className="flex items-center gap-1.5 text-sm text-[#6B7280]">
              <CalendarIcon className="size-4 text-[#B98CDE]" />
              {formatDateDisplay(bazaar.eventStartDate)} - {formatDateDisplay(bazaar.eventEndDate)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#EEE4FA] bg-[#FAF7FF] px-5 py-4 shadow-[0_2px_10px_rgba(122,92,168,0.05)]">
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarFallback className="bg-[#F3EAFB] font-semibold text-[#7A5CA8]">
                  {organizerInitial}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-[#6B7280]">Organized by</p>
                <p className="text-sm font-semibold text-[#3B1F4A]">{bazaar.organizerName}</p>
              </div>
            </div>
            <OrganizerInfoDialog name={bazaar.organizerName} contact={bazaar.organizerContact} rating={null} />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1.4fr_1fr]">
            {bazaar.description && (
              <div className="flex flex-col gap-2 rounded-2xl border border-[#EEE4FA] bg-white p-5 shadow-[0_2px_10px_rgba(122,92,168,0.05)] sm:p-6">
                <h2 className="text-lg font-semibold text-[#3B1F4A]">About This Bazaar</h2>
                <p className="text-sm leading-6 text-[#6B7280]">{bazaar.description}</p>
              </div>
            )}

            <div className="flex flex-col gap-2 rounded-2xl border border-[#EEE4FA] bg-white p-5 shadow-[0_2px_10px_rgba(122,92,168,0.05)] sm:p-6">
              <h2 className="text-lg font-semibold text-[#3B1F4A]">What to Expect</h2>
              {bazaar.facilities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {bazaar.facilities.map((facility) => (
                    <span
                      key={facility}
                      className="rounded-full bg-[#F3EAFB] px-2.5 py-1 text-xs font-medium text-[#7A5CA8]"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-[#6B7280]">
                  Facility details for this bazaar haven&apos;t been added yet.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-[#3B1F4A]">Event Highlights</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <HighlightStat
                icon={<StoreIcon className="size-5" />}
                value={`${confirmedVendorCount}+`}
                label="Vendors"
              />
              <HighlightStat
                icon={<UsersIcon className="size-5" />}
                value={maxTraffic > 0 ? `~${maxTraffic}` : "-"}
                label="Visitors / day"
              />
              <HighlightStat
                icon={<MapPinIcon className="size-5" />}
                value={`${bazaar.areas.length}`}
                label="Areas"
              />
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 rounded-2xl border border-[#EEE4FA] bg-white p-5 shadow-[0_2px_10px_rgba(122,92,168,0.05)] sm:p-6">
            <h2 className="text-lg font-semibold text-[#3B1F4A]">Event Information</h2>
            <div className="flex flex-col gap-4">
              <InfoRow icon={<MapPinIcon className="size-4" />} label="City" value={bazaar.city} />
              <InfoRow
                icon={<CalendarIcon className="size-4" />}
                label="Event Date"
                value={`${formatDateDisplay(bazaar.eventStartDate)} - ${formatDateDisplay(bazaar.eventEndDate)}`}
              />
              {categories.length > 0 && (
                <InfoRow
                  icon={<TagIcon className="size-4" />}
                  label="Category"
                  value={categories.join(", ")}
                />
              )}
              {maxTraffic > 0 && (
                <InfoRow
                  icon={<TrendingUpIcon className="size-4" />}
                  label="Estimated Traffic"
                  value={`~${maxTraffic} visitors/day`}
                />
              )}
            </div>
          </div>

          <div
            id="available-areas"
            className="flex scroll-mt-20 flex-col gap-5 rounded-2xl border border-[#EEE4FA] bg-white p-5 shadow-[0_2px_10px_rgba(122,92,168,0.05)] sm:p-6"
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-[#3B1F4A]">Available Areas</h2>
              <p className="text-xs text-[#6B7280]">
                Choose the perfect spot for your business
              </p>
              <p className="text-xs text-[#6B7280]">Total {bazaar.areas.length} areas</p>
            </div>

            {bazaar.areas.length === 0 ? (
              <p className="text-sm text-[#6B7280]">No areas have been set up yet.</p>
            ) : (
              <Accordion defaultValue={[bazaar.areas[0].id]} className="gap-3">
                {bazaar.areas.map((area) => (
                  <AccordionItem
                    key={area.id}
                    value={area.id}
                    className="overflow-hidden rounded-xl border border-[#EEE4FA] bg-[#FAF7FF]"
                  >
                    <AccordionTrigger className="px-4 py-3.5 hover:no-underline">
                      <div className="flex flex-1 flex-wrap items-center justify-between gap-2 pr-1">
                        <div>
                          <p className="font-semibold text-[#3B1F4A]">{area.name}</p>
                          {area.categoryWanted && (
                            <p className="text-xs font-normal text-[#6B7280]">
                              {area.categoryWanted}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#7A5CA8]">
                            {formatRupiah(area.pricePerSlot)}
                          </p>
                          <p className="text-xs font-normal text-[#6B7280]">per slot</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="flex flex-col gap-4 border-t border-[#EEE4FA] pt-4">
                        {area.description && (
                          <p className="text-sm text-[#6B7280]">{area.description}</p>
                        )}
                        {area.imageUrl && (
                          <div className="aspect-video w-full overflow-hidden rounded-lg bg-[#F3EAFB]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={area.imageUrl}
                              alt={area.name}
                              className="size-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex flex-col gap-3">
                          <Stat
                            icon={<LayersIcon className="size-4" />}
                            label="Total Slots"
                            value={`${area.slotsLeft} of ${area.totalSlot} left`}
                          />
                          <Stat
                            icon={<ZapIcon className="size-4" />}
                            label="Electricity"
                            value={area.hasElectricity ? "Yes" : "No"}
                          />
                          {area.estimatedTraffic !== null && (
                            <Stat
                              icon={<TrendingUpIcon className="size-4" />}
                              label="Estimated Traffic"
                              value={`~${area.estimatedTraffic}/day`}
                            />
                          )}
                          {area.categoryWanted && (
                            <Stat
                              icon={<TagIcon className="size-4" />}
                              label="Category"
                              value={area.categoryWanted}
                            />
                          )}
                        </div>
                        <ApplyToAreaButton
                          bazaarId={bazaar.id}
                          areaId={area.id}
                          alreadyApplied={appliedAreaIds.has(area.id)}
                          soldOut={area.slotsLeft <= 0}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-[#B98CDE]">{icon}</span>
      <div>
        <p className="text-xs text-[#6B7280]">{label}</p>
        <p className="text-sm font-medium text-[#3B1F4A]">{value}</p>
      </div>
    </div>
  );
}

function HighlightStat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-[#EEE4FA] bg-[#FAF7FF] p-6 text-center shadow-[0_2px_10px_rgba(122,92,168,0.05)]">
      <span className="flex size-10 items-center justify-center rounded-full bg-[#F3EAFB] text-[#7A5CA8]">
        {icon}
      </span>
      <p className="text-2xl font-bold text-[#3B1F4A]">{value}</p>
      <p className="text-xs text-[#6B7280]">{label}</p>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-[#B98CDE]">{icon}</span>
      <div>
        <p className="text-xs text-[#6B7280]">{label}</p>
        <p className="font-bold text-[#3B1F4A]">{value}</p>
      </div>
    </div>
  );
}