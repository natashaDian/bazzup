"use client";

import { useActionState, useEffect, startTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@prisma/client";
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
  Beauty: "Beauty",
  Services: "Services",
  Other: "Other",
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
  onSaved,
  onCancel,
}: {
  user: User;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    updateVendorProfileAction,
    initialState,
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
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

  const onSubmit = handleSubmit((data) => {
    const fd = new FormData();
    for (const [key, value] of Object.entries(data)) {
      fd.set(key, value ?? "");
    }
    startTransition(() => {
      formAction(fd);
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="businessName">Business Name</Label>
        <Input id="businessName" {...register("businessName")} />
        {errors.businessName && (
          <p className="text-xs text-destructive">
            {errors.businessName.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Business Category</Label>
        <Controller
          control={control}
          name="businessType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose business category" />
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
          <Label htmlFor="businessTypeOther">Tell us about your business</Label>
          <Input id="businessTypeOther" {...register("businessTypeOther")} />
          {errors.businessTypeOther && (
            <p className="text-xs text-destructive">
              {errors.businessTypeOther.message}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="businessDesc">Business Description</Label>
        <Textarea id="businessDesc" rows={3} {...register("businessDesc")} />
        {errors.businessDesc && (
          <p className="text-xs text-destructive">
            {errors.businessDesc.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Target Market</Label>
        <Controller
          control={control}
          name="targetMarket"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose target market" />
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
        <Label htmlFor="phone">Call Number</Label>
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
            placeholder="@urusername"
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
          <Input id="whatsapp" {...register("whatsapp")} />
          {errors.whatsapp && (
            <p className="text-xs text-destructive">
              {errors.whatsapp.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tiktok">TikTok</Label>
          <Input id="tiktok" placeholder="@urusername" {...register("tiktok")} />
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

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

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
  );
}
