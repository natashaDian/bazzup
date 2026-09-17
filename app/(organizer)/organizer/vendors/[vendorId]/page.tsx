import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Phone,
  AtSign,
  Send,
  Globe,
  ImageIcon,
} from "lucide-react";
import { requireOrganizer } from "@/lib/auth";
import { getVendorPublicProfile } from "@/lib/applications";
import { formatRupiah } from "@/lib/currency";

export default async function VendorPublicProfilePage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;
  await requireOrganizer();
  const vendor = await getVendorPublicProfile(vendorId);

  if (!vendor) {
    notFound();
  }

  const displayName = vendor.businessName || vendor.name;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link
        href="/organizer/applications"
        className="flex items-center gap-1.5 text-accent text-xs mb-4"
      >
        <ArrowLeft className="size-3.5" />
        Kembali ke pendaftaran
      </Link>

      <div className="bg-card rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-secondary/15 flex items-center justify-center overflow-hidden shrink-0">
            {vendor.profileImageUrl ? (
              <img
                src={vendor.profileImageUrl}
                alt={displayName}
                className="size-full object-cover"
              />
            ) : (
              <span className="text-lg font-medium text-accent">
                {displayName.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-medium">{displayName}</h1>
              {vendor.isVerifiedVendor && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAF3DE] text-[#27500A]">
                  Terverifikasi
                </span>
              )}
            </div>
            {vendor.businessType && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-secondary/15 text-accent inline-block mt-1">
                {vendor.businessType}
              </span>
            )}
          </div>
        </div>

        {vendor.businessDesc && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {vendor.businessDesc}
          </p>
        )}

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground border-t border-secondary/15 pt-4">
          <span className="flex items-center gap-1.5">
            <Package className="size-3.5 text-accent" />
            {vendor.bazaarsJoined} bazaar diikuti
          </span>
          {vendor.targetMarket && <span>Target: {vendor.targetMarket}</span>}
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground mt-3">
          {vendor.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5" /> {vendor.phone}
            </span>
          )}
          {vendor.instagram && (
            <span className="flex items-center gap-1.5">
              <AtSign className="size-3.5" /> {vendor.instagram}
            </span>
          )}
          {vendor.whatsapp && (
            <span className="flex items-center gap-1.5">
              <Send className="size-3.5" /> {vendor.whatsapp}
            </span>
          )}
          {vendor.website && (
            <span className="flex items-center gap-1.5">
              <Globe className="size-3.5" /> {vendor.website}
            </span>
          )}
        </div>
      </div>

      {vendor.products.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium mb-3">Produk</p>
          <div className="flex gap-3 overflow-x-auto">
            {vendor.products.map((p) => (
              <div
                key={p.id}
                className="bg-card rounded-xl overflow-hidden flex-shrink-0 w-36"
              >
                <div className="h-24 bg-secondary/10 flex items-center justify-center">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="size-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="size-5 text-secondary" />
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRupiah(p.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {vendor.portfolios.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-3">Portofolio</p>
          <div className="flex gap-3 overflow-x-auto">
            {vendor.portfolios.map((p) => (
              <div
                key={p.id}
                className="bg-card rounded-xl overflow-hidden flex-shrink-0 w-36"
              >
                <div className="h-24 bg-secondary/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.photoUrl}
                    alt={p.bazaarName}
                    className="size-full object-contain"
                  />
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium truncate">{p.bazaarName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(p.eventDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {vendor.products.length === 0 && vendor.portfolios.length === 0 && (
        <div className="bg-card rounded-2xl p-8 text-center text-sm text-muted-foreground">
          Vendor ini belum menambahkan produk atau portofolio.
        </div>
      )}
    </main>
  );
}
