"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@prisma/client";
import { MessageCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BUSINESS_CATEGORIES, BUSINESS_CATEGORY_OTHER } from "@/lib/constants";
import {
  updateVendorProfileAction,
  type UpdateVendorProfileState,
} from "./actions";
import {
  vendorProfileSchema,
  resolveBusinessTypeDefaults,
  type VendorProfileFormValues,
} from "./schema";
import {TARGET_MARKETS} from "@/lib/constants";

const CATEGORY_LABELS: Record<(typeof BUSINESS_CATEGORIES)[number], string> = {
  "F&B": "F&B (Makanan & Minuman)",
  Fashion: "Fashion",
  Lifestyle: "Lifestyle",
  Beauty: "Kecantikan",
  Services: "Jasa",
  Other: "Lainnya",
};

const TARGET_MARKET_LABELS: Record<(typeof TARGET_MARKETS)[number]["value"], string> = {
  pelajar: "Students & University Students",
  pekerja: "Office Workers",
  keluarga: "Families & Children",
  wisatawan: "Tourists",
  umum: "All Segments",
};

const initialState: UpdateVendorProfileState = {};

export function ProfileForm({
  user,
  hasBusinessPhoto,
  onSaved,
  onCancel,
}: {
  user: User;
  hasBusinessPhoto: boolean;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    updateVendorProfileAction,
    initialState,
  );
  const [photoError, setPhotoError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<VendorProfileFormValues>({
    resolver: zodResolver(vendorProfileSchema),
    defaultValues: {
      businessName: user.businessName ?? "",
      businessDesc: user.businessDesc ?? "",
      targetMarket: user.targetMarket ?? "",
      phone: user.phone ?? "",
      instagram: user.instagram ?? "",
      whatsapp: user.whatsapp ?? "",
      tiktok: user.tiktok ?? "",
      website: user.website ?? "",
      ...resolveBusinessTypeDefaults(user.businessType),
    },
  });

  const businessType = watch("businessType");
  const phone = watch("phone");
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(
    Boolean(user.whatsapp) && user.whatsapp === user.phone,
  );
  const [pendingSubmit, setPendingSubmit] = useState<VendorProfileFormValues | null>(null);

  useEffect(() => {
    if (state.fieldErrors) {
      for (const [field, message] of Object.entries(state.fieldErrors)) {
        setError(field as keyof VendorProfileFormValues, { message });
      }
    }
    if (state.success) {
      onSaved();
    }
  }, [state, setError, onSaved]);

  useEffect(() => {
    if (whatsappSameAsPhone) {
      setValue("whatsapp", phone, { shouldValidate: true });
    }
  }, [whatsappSameAsPhone, phone, setValue]);

  function submitProfile(data: VendorProfileFormValues) {
    const fd = new FormData();
    for (const [key, value] of Object.entries(data)) {
      fd.set(key, value ?? "");
    }
    startTransition(() => {
      formAction(fd);
    });
  }

  const onSubmit = handleSubmit((data) => {
    if (!hasBusinessPhoto) {
      setPhotoError("Logo usaha wajib diupload sebelum menyimpan.");
      return;
    }
    setPhotoError(null);

    if (data.whatsapp) {
      setPendingSubmit(data);
      return;
    }

    submitProfile(data);
  });

  return (
    <>
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="businessName">Nama Usaha</Label>
        <Input id="businessName" {...register("businessName")} />
        {errors.businessName && (
          <p className="text-xs text-destructive">
            {errors.businessName.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Kategori Usaha</Label>
        <Controller
          control={control}
          name="businessType"
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih kategori usaha" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.businessType && (
          <p className="text-xs text-destructive">
            {errors.businessType.message}
          </p>
        )}
      </div>

      {businessType === BUSINESS_CATEGORY_OTHER && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="businessTypeOther">Ceritakan tentang usaha Anda</Label>
          <Input id="businessTypeOther" {...register("businessTypeOther")} />
          {errors.businessTypeOther && (
            <p className="text-xs text-destructive">
              {errors.businessTypeOther.message}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="businessDesc">Deskripsi Usaha</Label>
        <Textarea id="businessDesc" rows={3} {...register("businessDesc")} />
        {errors.businessDesc && (
          <p className="text-xs text-destructive">
            {errors.businessDesc.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Target Pasar</Label>
        <Controller
          control={control}
          name="targetMarket"
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih target pasar" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_MARKETS.map((market) => (
                  <SelectItem key={market.value} value={market.value}>
                    {market.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.targetMarket && (
          <p className="text-xs text-destructive">
            {errors.targetMarket.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Nomor Telepon</Label>
        <Input id="phone" {...register("phone")} />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            placeholder="@usernamemu"
            {...register("instagram")}
          />
          {errors.instagram && (
            <p className="text-xs text-destructive">
              {errors.instagram.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" disabled={whatsappSameAsPhone} {...register("whatsapp")} />
          <label className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
            <input
              type="checkbox"
              checked={whatsappSameAsPhone}
              onChange={(e) => setWhatsappSameAsPhone(e.target.checked)}
              className="size-3.5 rounded border-input"
            />
            Sama dengan Nomor Telepon
          </label>
          {errors.whatsapp && (
            <p className="text-xs text-destructive">
              {errors.whatsapp.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tiktok">TikTok</Label>
          <Input id="tiktok" placeholder="@usernamemu" {...register("tiktok")} />
          {errors.tiktok && (
            <p className="text-xs text-destructive">{errors.tiktok.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="website">Website</Label>
          <Input id="website" placeholder="https://" {...register("website")} />
          {errors.website && (
            <p className="text-xs text-destructive">{errors.website.message}</p>
          )}
        </div>
      </div>

      {(photoError || state.error) && (
        <p className="text-sm text-destructive">{photoError ?? state.error}</p>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Batal
        </Button>
      </div>
    </form>

    <Dialog
      open={pendingSubmit !== null}
      onOpenChange={(open) => {
        if (!open) setPendingSubmit(null);
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <MessageCircleIcon className="size-14 text-amber-500" strokeWidth={1.5} />
          <DialogTitle className="text-lg">Konfirmasi Nomor WhatsApp Anda</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-muted-foreground">
            Pastikan nomor ini benar dan aktif di WhatsApp:
            <br />
            <span className="font-semibold text-foreground">{pendingSubmit?.whatsapp}</span>
            <br />
            Organizer akan menghubungi Anda lewat nomor ini terkait pengajuan Anda.
          </DialogDescription>
          <div className="mt-4 flex w-full gap-2">
            <button
              type="button"
              onClick={() => setPendingSubmit(null)}
              className="flex-1 rounded-md border border-input px-4 py-2.5 text-sm font-medium hover:bg-muted"
            >
              Ubah Nomor
            </button>
            <button
              type="button"
              onClick={() => {
                if (pendingSubmit) submitProfile(pendingSubmit);
                setPendingSubmit(null);
              }}
              className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Ya, Sudah Benar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
