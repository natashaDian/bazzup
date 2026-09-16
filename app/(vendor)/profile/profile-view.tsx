"use client";

import { useRef, useState, useTransition } from "react";
import type { User } from "@prisma/client";
import {
  AtSign,
  BadgeCheck,
  Camera,
  Globe,
  MessageCircle,
  Music2,
  Pencil,
  Phone,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { uploadBusinessPhotoAction, type UploadBusinessPhotoState } from "./actions";
import { ProfileForm } from "./profile-form";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const uploadInitialState: UploadBusinessPhotoState = {};
const MAX_BUSINESS_LOGO_SIZE = 1 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function ProfileView({ user }: { user: User }) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [photoUrl, setPhotoUrl] = useState(user.profileImageUrl);
  const [uploadState, setUploadState] = useState<UploadBusinessPhotoState>(uploadInitialState);
  const [isUploading, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayUser = { ...user, profileImageUrl: photoUrl };

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    // Validated here (before any preview/upload) so an oversized file never
    // reaches the server action - Next's server actions silently reject
    // request bodies over its own default limit with an uncaught error,
    // which never reached our own "file too large" message.
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setUploadState({ error: "Format file harus PNG, JPG, atau WEBP." });
      input.value = "";
      return;
    }
    if (file.size > MAX_BUSINESS_LOGO_SIZE) {
      setUploadState({ error: "Ukuran logo maksimal 1MB." });
      input.value = "";
      return;
    }

    setUploadState(uploadInitialState);
    setPhotoUrl(URL.createObjectURL(file));

    const fd = new FormData();
    fd.set("photo", file);

    startTransition(async () => {
      const result = await uploadBusinessPhotoAction(uploadInitialState, fd);
      setUploadState(result);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border border-secondary/30 shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative">
                  <Avatar size="lg" className="size-16 ring-2 ring-secondary/40">
                    <AvatarImage src={displayUser.profileImageUrl ?? undefined} />
                    <AvatarFallback className="bg-accent/10 text-base font-semibold text-accent">
                      {initials(user.businessName || user.name)}
                    </AvatarFallback>
                  </Avatar>
                  {mode === "edit" && (
                    <>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-accent text-primary-foreground shadow ring-2 ring-card transition-opacity hover:opacity-90 disabled:opacity-50"
                        aria-label="Ubah foto usaha"
                      >
                        <Camera className="size-3.5" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </>
                  )}
                </div>
                {mode === "edit" && (
                  <p className="max-w-20 text-center text-[10px] leading-tight text-muted-foreground">
                    Upload your business logo
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-semibold text-foreground">
                    {user.businessName || user.name}
                  </h1>
                  {user.isVerifiedVendor && (
                    <Badge className="gap-1 bg-accent text-primary-foreground">
                      <BadgeCheck className="size-3" />
                      Terverifikasi
                    </Badge>
                  )}
                </div>
                {user.businessType && (
                  <Badge variant="secondary" className="w-fit text-secondary-foreground">
                    {user.businessType}
                  </Badge>
                )}
              </div>
            </div>

            {mode === "view" && (
              <Button variant="outline" size="sm" onClick={() => setMode("edit")}>
                <Pencil className="size-3.5" />
                Edit Profil
              </Button>
            )}
          </div>
          {uploadState.error && (
            <p className="text-xs text-destructive">{uploadState.error}</p>
          )}
        </CardHeader>

        <CardContent>
          {mode === "edit" ? (
            <ProfileForm
              user={user}
              hasBusinessPhoto={Boolean(photoUrl)}
              onSaved={() => setMode("view")}
              onCancel={() => setMode("view")}
            />
          ) : (
            <ProfileInfo user={user} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileInfo({ user }: { user: User }) {
  const hasSocials =
    user.instagram || user.whatsapp || user.tiktok || user.website;

  return (
    <div className="flex flex-col gap-5">
      <InfoBlock label="Deskripsi Usaha" value={user.businessDesc} />
      <InfoBlock label="Target Pasar" value={user.targetMarket} />
      <InfoBlock
        label="Telepon"
        value={user.phone}
        icon={<Phone className="size-4 text-accent" />}
      />

      {hasSocials && (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <span className="text-sm font-medium text-foreground">Media Sosial</span>
          <div className="flex flex-col gap-2">
            {user.instagram && (
              <SocialRow icon={<AtSign className="size-4 text-accent" />} value={user.instagram} />
            )}
            {user.whatsapp && (
              <SocialRow icon={<MessageCircle className="size-4 text-accent" />} value={user.whatsapp} />
            )}
            {user.tiktok && (
              <SocialRow icon={<Music2 className="size-4 text-accent" />} value={user.tiktok} />
            )}
            {user.website && (
              <SocialRow icon={<Globe className="size-4 text-accent" />} value={user.website} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {value || "Belum diisi"}
      </p>
    </div>
  );
}

function SocialRow({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {icon}
      {value}
    </div>
  );
}
