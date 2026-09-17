"use client";

import { useState, useRef, useActionState, useEffect } from "react";
import {
  Phone,
  MessageCircle,
  AtSign,
  Music2,
  Globe,
  Star,
  Users,
  Building2,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Pencil,
  ImagePlus,
  X,
} from "lucide-react";
import {
  updateOrganizerProfileAction,
  type UpdateOrganizerProfileState,
} from "@/app/(organizer)/organizer/profile/actions";
import type {
  OrganizerProfileData,
  OrganizerStats,
  OrganizedBazaarCard,
} from "@/lib/organizer-profile";

const initialState: UpdateOrganizerProfileState = {};

function formatDateRange(start: Date, end: Date) {
  const startStr = new Date(start).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
  const endStr = new Date(end).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startStr} - ${endStr}`;
}

export function OrganizerProfileClient({
  profile,
  stats,
  bazaars,
}: {
  profile: OrganizerProfileData;
  stats: OrganizerStats;
  bazaars: OrganizedBazaarCard[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const displayName = profile.businessName || profile.name;
  const initials = displayName.slice(0, 2).toUpperCase();

  const [latest, ...rest] = bazaars;

  return (
    <div>
      <div className="rounded-2xl overflow-hidden border border-input mb-6">
        <div className="h-32 bg-secondary/10 flex items-center justify-center">
          {profile.coverImageUrl ? (
            <img
              src={profile.coverImageUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <ImagePlus className="size-6 text-secondary" />
          )}
        </div>

        <div className="bg-card px-5 pb-5 relative">
          <div className="flex items-end justify-between">
            <div className="size-16 rounded-full bg-secondary/20 border-4 border-card flex items-center justify-center -mt-8 mb-2.5 overflow-hidden">
              {profile.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt={displayName}
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-lg font-medium text-accent">
                  {initials}
                </span>
              )}
            </div>
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-input mt-2"
            >
              <Pencil className="size-3.5" />
              Edit profil
            </button>
          </div>

          <p className="text-lg font-medium mb-0.5">{displayName}</p>
          <p className="text-sm text-muted-foreground mb-2.5">
            Dikelola oleh {profile.name}
          </p>
          {profile.businessDesc && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-3.5">
              {profile.businessDesc}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-3.5">
            <span className="flex items-center gap-1.5 text-xs bg-secondary/10 px-3 py-1.5 rounded-full">
              <Building2 className="size-3.5 text-accent" />
              {stats.totalBazaars} bazaar
            </span>
            <span className="flex items-center gap-1.5 text-xs bg-secondary/10 px-3 py-1.5 rounded-full">
              <Users className="size-3.5 text-accent" />
              {stats.totalVendorsHosted} vendor bergabung
            </span>
            <span className="flex items-center gap-1.5 text-xs bg-secondary/10 px-3 py-1.5 rounded-full">
              <Star className="size-3.5 text-amber-500" />
              {stats.averageRating
                ? stats.averageRating.toFixed(1)
                : "Belum ada rating"}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 border-t border-input pt-3 text-xs text-muted-foreground">
            {profile.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="size-3.5" /> {profile.phone}
              </span>
            )}
            {profile.whatsapp && (
              <span className="flex items-center gap-1.5">
                <MessageCircle className="size-3.5" /> {profile.whatsapp}
              </span>
            )}
            {profile.instagram && (
              <span className="flex items-center gap-1.5">
                <AtSign className="size-3.5" /> {profile.instagram}
              </span>
            )}
            {profile.tiktok && (
              <span className="flex items-center gap-1.5">
                <Music2 className="size-3.5" /> {profile.tiktok}
              </span>
            )}
            {profile.website && (
              <span className="flex items-center gap-1.5">
                <Globe className="size-3.5" /> {profile.website}
              </span>
            )}
          </div>
        </div>
      </div>

      <div id="past-bazaars" className="scroll-mt-20">
        {latest && (
          <div className="mb-6">
            <p className="text-sm font-medium mb-3">Bazaar terbaru</p>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.3fr] rounded-2xl overflow-hidden border border-input">
              <div className="h-36 sm:h-auto bg-secondary/10 flex items-center justify-center">
                {latest.coverImageUrl ? (
                  <img
                    src={latest.coverImageUrl}
                    alt={latest.title}
                    className="size-full object-cover"
                  />
                ) : (
                  <ImagePlus className="size-6 text-secondary" />
                )}
              </div>
              <div className="bg-card p-5">
                {latest.categories.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {latest.categories.map((cat) => (
                      <span
                        key={cat}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-800"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-base font-medium mb-1">{latest.title}</p>
                {latest.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                    {latest.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    {formatDateRange(
                      latest.eventStartDate,
                      latest.eventEndDate,
                    )}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {latest.city}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    {latest.vendorCount} vendor
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {rest.length > 0 && <PastBazaarsCarousel bazaars={rest} />}
      </div>

      {bazaars.length === 0 && (
        <div className="border border-dashed rounded-2xl py-12 text-center text-sm text-muted-foreground">
          Belum ada bazaar yang selesai.
        </div>
      )}

      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}

function PastBazaarsCarousel({ bazaars }: { bazaars: OrganizedBazaarCard[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    });
  }

  return (
    <div>
      <p className="text-sm font-medium mb-3">Bazaar sebelumnya</p>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-1"
      >
        {bazaars.map((bazaar) => (
          <div
            key={bazaar.id}
            className="bg-card rounded-2xl overflow-hidden border border-input shrink-0"
            style={{ width: 200 }}
          >
            <div className="h-24 bg-secondary/10 flex items-center justify-center">
              {bazaar.coverImageUrl ? (
                <img
                  src={bazaar.coverImageUrl}
                  alt={bazaar.title}
                  className="size-full object-cover"
                />
              ) : (
                <ImagePlus className="size-5 text-secondary" />
              )}
            </div>
            <div className="p-3">
              <p className="text-xs font-medium mb-1 truncate">
                {bazaar.title}
              </p>
              {bazaar.description && (
                <p className="text-[11px] text-muted-foreground mb-2 line-clamp-2">
                  {bazaar.description}
                </p>
              )}
              {bazaar.categories.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-2">
                  {bazaar.categories.slice(0, 2).map((cat) => (
                    <span
                      key={cat}
                      className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-800"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-1 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {formatDateRange(bazaar.eventStartDate, bazaar.eventEndDate)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {bazaar.city}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {bazaar.vendorCount} vendor
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2.5 mt-3">
        <button
          onClick={() => scroll("left")}
          aria-label="Sebelumnya"
          className="size-8 rounded-full border border-input bg-card flex items-center justify-center"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          onClick={() => scroll("right")}
          aria-label="Berikutnya"
          className="size-8 rounded-full border border-input bg-card flex items-center justify-center"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function EditProfileModal({
  profile,
  onClose,
}: {
  profile: OrganizerProfileData;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    updateOrganizerProfileAction,
    initialState,
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    profile.profileImageUrl,
  );
  const [removePhoto, setRemovePhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [coverPreview, setCoverPreview] = useState<string | null>(
    profile.coverImageUrl,
  );
  const [removeCoverPhoto, setRemoveCoverPhoto] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    businessName: profile.businessName ?? "",
    businessDesc: profile.businessDesc ?? "",
    phone: profile.phone ?? "",
    whatsapp: profile.whatsapp ?? "",
    instagram: profile.instagram ?? "",
    tiktok: profile.tiktok ?? "",
    website: profile.website ?? "",
  });

  useEffect(() => {
    if (state.success) onClose();
    if (state.fieldErrors) setFieldErrors(state.fieldErrors);
  }, [state]);

  function updateField<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function validateClientSide() {
    const errors: Record<string, string> = {};
    if (!form.businessName.trim() || form.businessName.trim().length < 2) {
      errors.businessName = "Nama organisasi minimal 2 karakter.";
    }
    if (!form.whatsapp.trim()) {
      errors.whatsapp = "Nomor WhatsApp wajib diisi.";
    } else if (!/^0\d{9,13}$/.test(form.whatsapp.trim())) {
      errors.whatsapp =
        "Masukkan nomor yang valid, diawali dengan 0 (contoh: 0812xxxxxxx).";
    }
    if (form.phone.trim() && !/^0\d{9,13}$/.test(form.phone.trim())) {
      errors.phone = "Masukkan nomor telepon yang valid, diawali dengan 0.";
    }
    if (
      form.website.trim() &&
      !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(form.website.trim())
    ) {
      errors.website = "Masukkan website yang valid (contoh: example.com).";
    }
    return errors;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const errors = validateClientSide();
    if (Object.keys(errors).length > 0) {
      e.preventDefault();
      setFieldErrors(errors);
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      setRemovePhoto(false);
    }
  }

  function clearPhoto() {
    setPhotoPreview(null);
    setRemovePhoto(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
      setRemoveCoverPhoto(false);
    }
  }

  function clearCover() {
    setCoverPreview(null);
    setRemoveCoverPhoto(true);
    if (coverInputRef.current) coverInputRef.current.value = "";
  }

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground"
        >
          <X className="size-4" />
        </button>

        <p className="text-base font-medium mb-4">Edit profil</p>

        {state.error && (
          <p className="text-xs text-destructive mb-3">{state.error}</p>
        )}

        <form action={formAction} onSubmit={handleSubmit} className="space-y-3">
          <input
            type="hidden"
            name="removePhoto"
            value={removePhoto ? "true" : "false"}
          />
          <input
            type="hidden"
            name="removeCoverPhoto"
            value={removeCoverPhoto ? "true" : "false"}
          />

          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">
              Foto sampul
            </label>
            <div className="relative">
              <label className="block">
                <div className="h-24 rounded-lg border border-dashed border-secondary flex items-center justify-center bg-secondary/10 cursor-pointer overflow-hidden">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Pratinjau sampul"
                      className="size-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="size-5 text-accent" />
                  )}
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  name="coverPhoto"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>
              {coverPreview && (
                <button
                  type="button"
                  onClick={clearCover}
                  aria-label="Hapus foto sampul"
                  className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-white flex items-center justify-center"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center mb-1">
            <label className="text-xs text-muted-foreground block mb-1.5 self-start">
              Foto profil
            </label>
            <div className="relative">
              <label className="block">
                <div className="size-20 rounded-full border border-dashed border-secondary flex items-center justify-center bg-secondary/10 cursor-pointer overflow-hidden">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Pratinjau"
                      className="size-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="size-5 text-accent" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              {photoPreview && (
                <button
                  type="button"
                  onClick={clearPhoto}
                  aria-label="Hapus foto"
                  className="absolute -top-1 -right-1 size-5 rounded-full bg-destructive text-white flex items-center justify-center"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Nama organisasi *
            </label>
            <input
              name="businessName"
              value={form.businessName}
              onChange={(e) => updateField("businessName", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
            />
            {fieldErrors.businessName && (
              <p className="text-xs text-destructive mt-1">
                {fieldErrors.businessName}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Tentang
            </label>
            <textarea
              name="businessDesc"
              value={form.businessDesc}
              onChange={(e) => updateField("businessDesc", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Telepon
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="0812xxxxxxx"
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
            />
            {fieldErrors.phone && (
              <p className="text-xs text-destructive mt-1">
                {fieldErrors.phone}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              WhatsApp *
            </label>
            <input
              name="whatsapp"
              value={form.whatsapp}
              onChange={(e) => updateField("whatsapp", e.target.value)}
              placeholder="0812xxxxxxx"
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
            />
            {fieldErrors.whatsapp && (
              <p className="text-xs text-destructive mt-1">
                {fieldErrors.whatsapp}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Instagram
            </label>
            <input
              name="instagram"
              value={form.instagram}
              onChange={(e) => updateField("instagram", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              TikTok
            </label>
            <input
              name="tiktok"
              value={form.tiktok}
              onChange={(e) => updateField("tiktok", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Website
            </label>
            <input
              name="website"
              value={form.website}
              onChange={(e) => updateField("website", e.target.value)}
              placeholder="example.com"
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
            />
            {fieldErrors.website && (
              <p className="text-xs text-destructive mt-1">
                {fieldErrors.website}
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-secondary/15 text-muted-foreground px-4 py-2 rounded-lg text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm"
            >
              {isPending ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
