import type { Metadata } from "next";
import { requireOrganizer } from "@/lib/auth";
import {
  getOrganizerProfile,
  getOrganizerStats,
  getOrganizedBazaars,
} from "@/lib/organizer-profile";
import { OrganizerProfileClient } from "@/components/organizer-profile-client";

export const metadata: Metadata = {
  title: "Profil Organizer - BazzUp",
};

export default async function OrganizerProfilePage() {
  const user = await requireOrganizer();

  const [profile, stats, bazaars] = await Promise.all([
    getOrganizerProfile(user.id),
    getOrganizerStats(user.id),
    getOrganizedBazaars(user.id),
  ]);

  if (!profile) {
    return null;
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <OrganizerProfileClient
        profile={profile}
        stats={stats}
        bazaars={bazaars}
      />
    </main>
  );
}
