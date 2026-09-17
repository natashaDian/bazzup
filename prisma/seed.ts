import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

const SEED_EMAIL_DOMAIN = "@bazzup.test";

async function clearSeedData() {
  const seedUsers = await prisma.user.findMany({
    where: { email: { endsWith: SEED_EMAIL_DOMAIN } },
    select: { id: true },
  });
  const seedUserIds = seedUsers.map((u) => u.id);
  if (seedUserIds.length === 0) return;

  const seedBazaars = await prisma.bazaar.findMany({
    where: { organizerId: { in: seedUserIds } },
    select: { id: true },
  });
  const bazaarIds = seedBazaars.map((b) => b.id);

  const seedAreas = await prisma.area.findMany({
    where: { bazaarId: { in: bazaarIds } },
    select: { id: true },
  });
  const areaIds = seedAreas.map((a) => a.id);

  const seedApplications = await prisma.application.findMany({
    where: { areaId: { in: areaIds } },
    select: { id: true },
  });
  const applicationIds = seedApplications.map((a) => a.id);

  await prisma.review.deleteMany({ where: { applicationId: { in: applicationIds } } });
  await prisma.notification.deleteMany({ where: { userId: { in: seedUserIds } } });
  await prisma.application.deleteMany({ where: { id: { in: applicationIds } } });
  await prisma.areaImage.deleteMany({ where: { areaId: { in: areaIds } } });
  await prisma.area.deleteMany({ where: { id: { in: areaIds } } });
  await prisma.bazaarImage.deleteMany({ where: { bazaarId: { in: bazaarIds } } });
  await prisma.bazaar.deleteMany({ where: { id: { in: bazaarIds } } });
  await prisma.user.deleteMany({ where: { id: { in: seedUserIds } } });
}

async function main() {
  await clearSeedData();

  const [organizer1, organizer2, vendor1, vendor2, vendor3, vendor4] = await Promise.all([
    prisma.user.create({
      data: {
        supabaseUserId: randomUUID(),
        email: `rina.organizer${SEED_EMAIL_DOMAIN}`,
        name: "Rina Wijaya",
        phone: "081200000001",
        role: "ORGANIZER",
        businessName: "Kreasi Event Organizer",
      },
    }),
    prisma.user.create({
      data: {
        supabaseUserId: randomUUID(),
        email: `budi.organizer${SEED_EMAIL_DOMAIN}`,
        name: "Budi Santoso",
        phone: "081200000002",
        role: "ORGANIZER",
        businessName: "Bandung Creative Space",
      },
    }),
    prisma.user.create({
      data: {
        supabaseUserId: randomUUID(),
        email: `siti.vendor${SEED_EMAIL_DOMAIN}`,
        name: "Siti Aminah",
        phone: "081300000001",
        role: "VENDOR",
        businessName: "Dapur Siti",
        businessType: "Kuliner",
        targetMarket: "Keluarga",
        businessDesc: "Jajanan pasar dan minuman kekinian",
        isVerifiedVendor: true,
        profileImageUrl: "https://picsum.photos/seed/dapur-siti/400/400",
        instagram: "@dapur.siti",
        whatsapp: "6281300000001",
      },
    }),
    prisma.user.create({
      data: {
        supabaseUserId: randomUUID(),
        email: `andi.vendor${SEED_EMAIL_DOMAIN}`,
        name: "Andi Pratama",
        phone: "081300000002",
        role: "VENDOR",
        businessName: "Andi Denim Co.",
        businessType: "Fashion",
        targetMarket: "Remaja",
        businessDesc: "Pakaian denim buatan lokal",
        isVerifiedVendor: true,
        profileImageUrl: "https://picsum.photos/seed/andi-denim/400/400",
        instagram: "@andidenim.co",
        whatsapp: "6281300000002",
      },
    }),
    prisma.user.create({
      data: {
        supabaseUserId: randomUUID(),
        email: `dewi.vendor${SEED_EMAIL_DOMAIN}`,
        name: "Dewi Lestari",
        phone: "081300000003",
        role: "VENDOR",
        businessName: "Kriya Dewi",
        businessType: "Kerajinan",
        isVerifiedVendor: false,
        profileImageUrl: "https://picsum.photos/seed/kriya-dewi/400/400",
        instagram: "@kriya.dewi",
        whatsapp: "6281300000003",
      },
    }),
    prisma.user.create({
      data: {
        supabaseUserId: randomUUID(),
        email: `fajar.vendor${SEED_EMAIL_DOMAIN}`,
        name: "Fajar Nugroho",
        phone: "081300000004",
        role: "VENDOR",
        businessName: "Kopi Keliling Fajar",
        businessType: "Kuliner",
        targetMarket: "Pekerja kantoran",
        isVerifiedVendor: true,
        profileImageUrl: "https://picsum.photos/seed/kopi-fajar/400/400",
        instagram: "@kopikelilingfajar",
        whatsapp: "6281300000004",
      },
    }),
  ]);

  const bazaar1 = await prisma.bazaar.create({
    data: {
      organizerId: organizer1.id,
      title: "Bazaar Ramadan Kota Tua",
      description: "Bazaar UMKM bertema Ramadan di kawasan Kota Tua Jakarta",
      address: "Jl. Taman Fatahillah No. 1",
      city: "Jakarta",
      latitude: -6.1352,
      longitude: 106.8133,
      eventStartDate: new Date("2026-03-10T09:00:00Z"),
      eventEndDate: new Date("2026-03-15T21:00:00Z"),
      status: "ACTIVE",
      images: {
        create: [{ url: "https://picsum.photos/seed/bazaar-ramadan/800/400" }],
      },
    },
  });

  const bazaar2 = await prisma.bazaar.create({
    data: {
      organizerId: organizer2.id,
      title: "Pasar Kreatif Bandung",
      description: "Pameran produk kreatif dan kerajinan lokal Bandung",
      address: "Jl. Braga No. 10",
      city: "Bandung",
      latitude: -6.9175,
      longitude: 107.6191,
      eventStartDate: new Date("2026-01-05T09:00:00Z"),
      eventEndDate: new Date("2026-01-07T21:00:00Z"),
      status: "COMPLETED",
      images: {
        create: [{ url: "https://picsum.photos/seed/pasar-kreatif/800/400" }],
      },
    },
  });

  const bazaar3 = await prisma.bazaar.create({
    data: {
      organizerId: organizer1.id,
      title: "BSD Culinary Fest",
      description: "Festival kuliner UMKM di kawasan BSD City, Tangerang",
      address: "Jl. BSD Grand Boulevard",
      city: "Tangerang",
      latitude: -6.3016,
      longitude: 106.6527,
      eventStartDate: new Date("2026-10-05T09:00:00Z"),
      eventEndDate: new Date("2026-10-06T21:00:00Z"),
      status: "ACTIVE",
      images: {
        create: [{ url: "https://picsum.photos/seed/bsd-culinary-fest/800/400" }],
      },
    },
  });

  const bazaar4 = await prisma.bazaar.create({
    data: {
      organizerId: organizer2.id,
      title: "Bekasi Weekend Market",
      description: "Pasar akhir pekan untuk UMKM fashion dan lifestyle di Bekasi",
      address: "Jl. Ahmad Yani No. 20",
      city: "Bekasi",
      latitude: -6.2383,
      longitude: 107.0,
      eventStartDate: new Date("2026-10-18T09:00:00Z"),
      eventEndDate: new Date("2026-10-19T21:00:00Z"),
      status: "ACTIVE",
      images: {
        create: [{ url: "https://picsum.photos/seed/bekasi-weekend-market/800/400" }],
      },
    },
  });

  const bazaar5 = await prisma.bazaar.create({
    data: {
      organizerId: organizer1.id,
      title: "Surabaya Local Fest",
      description: "Pameran produk kerajinan dan UMKM lokal Surabaya",
      address: "Jl. Tunjungan No. 5",
      city: "Surabaya",
      latitude: -7.2575,
      longitude: 112.7521,
      eventStartDate: new Date("2026-11-05T09:00:00Z"),
      eventEndDate: new Date("2026-11-07T21:00:00Z"),
      status: "ACTIVE",
      images: {
        create: [{ url: "https://picsum.photos/seed/surabaya-local-fest/800/400" }],
      },
    },
  });

  const bazaar6 = await prisma.bazaar.create({
    data: {
      organizerId: organizer2.id,
      title: "Yogyakarta Creative Day",
      description: "Bazaar kreatif kuliner dan kerajinan khas Yogyakarta",
      address: "Jl. Malioboro No. 8",
      city: "Yogyakarta",
      latitude: -7.7956,
      longitude: 110.3695,
      eventStartDate: new Date("2026-11-12T09:00:00Z"),
      eventEndDate: new Date("2026-11-13T21:00:00Z"),
      status: "ACTIVE",
      images: {
        create: [{ url: "https://picsum.photos/seed/yogyakarta-creative-day/800/400" }],
      },
    },
  });

  const bazaar7 = await prisma.bazaar.create({
    data: {
      organizerId: organizer2.id,
      title: "Bandung Pop Up Market",
      description: "Pop up market fashion dan lifestyle di kawasan Bandung",
      address: "Jl. Riau No. 15",
      city: "Bandung",
      latitude: -6.9175,
      longitude: 107.6191,
      eventStartDate: new Date("2026-12-01T09:00:00Z"),
      eventEndDate: new Date("2026-12-02T21:00:00Z"),
      status: "ACTIVE",
      images: {
        create: [{ url: "https://picsum.photos/seed/bandung-popup-market/800/400" }],
      },
    },
  });

  const areaA = await prisma.area.create({
    data: {
      bazaarId: bazaar1.id,
      name: "Dekat Pintu Masuk",
      description: "Zona kuliner dekat pintu masuk utama",
      totalSlot: 10,
      pricePerSlot: 500000,
      categoryWanted: "Kuliner",
      estimatedTraffic: 800,
      visitorProfile: "Keluarga",
      peakHours: "17:00-21:00",
      hasElectricity: true,
      images: {
        create: [{ url: "https://picsum.photos/seed/area-pintu-masuk/600/400" }],
      },
    },
  });

  const areaB = await prisma.area.create({
    data: {
      bazaarId: bazaar1.id,
      name: "Zona Tengah",
      description: "Zona fashion dan aksesoris di area tengah",
      totalSlot: 15,
      pricePerSlot: 300000,
      categoryWanted: "Fashion",
      estimatedTraffic: 500,
      visitorProfile: "Remaja dan dewasa muda",
      peakHours: "15:00-19:00",
      hasElectricity: false,
      images: {
        create: [{ url: "https://picsum.photos/seed/area-tengah/600/400" }],
      },
    },
  });

  const areaC = await prisma.area.create({
    data: {
      bazaarId: bazaar2.id,
      name: "Panggung Utama",
      description: "Zona kerajinan tangan dekat panggung utama",
      totalSlot: 8,
      pricePerSlot: 700000,
      categoryWanted: "Kerajinan",
      estimatedTraffic: 600,
      visitorProfile: "Wisatawan",
      peakHours: "10:00-14:00",
      hasElectricity: true,
      images: {
        create: [{ url: "https://picsum.photos/seed/area-panggung/600/400" }],
      },
    },
  });

  await prisma.area.create({
    data: {
      bazaarId: bazaar3.id,
      name: "Food Court BSD",
      description: "Zona kuliner utama di tengah venue",
      totalSlot: 20,
      pricePerSlot: 600000,
      categoryWanted: "Kuliner",
      estimatedTraffic: 1200,
      visitorProfile: "Keluarga dan pekerja kantoran",
      peakHours: "11:00-14:00",
      hasElectricity: true,
      images: {
        create: [{ url: "https://picsum.photos/seed/area-bsd-foodcourt/600/400" }],
      },
    },
  });

  await prisma.area.create({
    data: {
      bazaarId: bazaar4.id,
      name: "Zona Fashion Utama",
      description: "Zona pakaian dan aksesoris",
      totalSlot: 12,
      pricePerSlot: 350000,
      categoryWanted: "Fashion",
      estimatedTraffic: 450,
      visitorProfile: "Remaja dan dewasa muda",
      peakHours: "16:00-20:00",
      hasElectricity: false,
      images: {
        create: [{ url: "https://picsum.photos/seed/area-bekasi-fashion/600/400" }],
      },
    },
  });

  await prisma.area.create({
    data: {
      bazaarId: bazaar5.id,
      name: "Galeri Kerajinan",
      description: "Zona pameran produk kerajinan lokal",
      totalSlot: 10,
      pricePerSlot: 450000,
      categoryWanted: "Kerajinan",
      estimatedTraffic: 700,
      visitorProfile: "Wisatawan dan kolektor",
      peakHours: "10:00-15:00",
      hasElectricity: true,
      images: {
        create: [{ url: "https://picsum.photos/seed/area-surabaya-kerajinan/600/400" }],
      },
    },
  });

  await prisma.area.create({
    data: {
      bazaarId: bazaar6.id,
      name: "Zona Kuliner Malioboro",
      description: "Zona jajanan khas Yogyakarta",
      totalSlot: 15,
      pricePerSlot: 400000,
      categoryWanted: "Kuliner",
      estimatedTraffic: 900,
      visitorProfile: "Wisatawan",
      peakHours: "17:00-21:00",
      hasElectricity: true,
      images: {
        create: [{ url: "https://picsum.photos/seed/area-jogja-kuliner/600/400" }],
      },
    },
  });

  await prisma.area.create({
    data: {
      bazaarId: bazaar7.id,
      name: "Zona Pop Up Fashion",
      description: "Zona brand fashion lokal Bandung",
      totalSlot: 14,
      pricePerSlot: 320000,
      categoryWanted: "Fashion",
      estimatedTraffic: 550,
      visitorProfile: "Remaja dan dewasa muda",
      peakHours: "15:00-19:00",
      hasElectricity: false,
      images: {
        create: [{ url: "https://picsum.photos/seed/area-bandung-popup/600/400" }],
      },
    },
  });

  const appConfirmed = await prisma.application.create({
    data: {
      areaId: areaA.id,
      vendorId: vendor1.id,
      businessCategory: "Kuliner",
      matchScore: 92,
      slotNumber: 3,
      status: "CONFIRMED",
      approvedAt: new Date("2026-02-20T08:00:00Z"),
      totalPrice: 500000,
      platformFee: 50000,
      paymentDeadline: new Date("2026-02-25T23:59:59Z"),
      paidAt: new Date("2026-02-22T10:00:00Z"),
      paymentConfirmedAt: new Date("2026-02-22T12:00:00Z"),
      invoiceSentAt: new Date("2026-02-20T08:05:00Z"),
    },
  });

  const appPending = await prisma.application.create({
    data: {
      areaId: areaA.id,
      vendorId: vendor4.id,
      businessCategory: "Kuliner",
      matchScore: 85,
      status: "PENDING",
    },
  });

  const appApproved = await prisma.application.create({
    data: {
      areaId: areaB.id,
      vendorId: vendor2.id,
      businessCategory: "Fashion",
      matchScore: 70,
      status: "APPROVED",
      approvedAt: new Date("2026-02-18T09:00:00Z"),
      totalPrice: 300000,
      platformFee: 30000,
      paymentDeadline: new Date("2026-02-24T23:59:59Z"),
      invoiceSentAt: new Date("2026-02-18T09:05:00Z"),
    },
  });

  const appCompleted = await prisma.application.create({
    data: {
      areaId: areaC.id,
      vendorId: vendor3.id,
      businessCategory: "Kerajinan",
      matchScore: 88,
      slotNumber: 1,
      status: "COMPLETED",
      approvedAt: new Date("2025-12-20T08:00:00Z"),
      totalPrice: 700000,
      platformFee: 70000,
      paymentDeadline: new Date("2025-12-27T23:59:59Z"),
      paidAt: new Date("2025-12-22T10:00:00Z"),
      paymentConfirmedAt: new Date("2025-12-22T12:00:00Z"),
      invoiceSentAt: new Date("2025-12-20T08:05:00Z"),
    },
  });

  await prisma.application.create({
    data: {
      areaId: areaC.id,
      vendorId: vendor2.id,
      businessCategory: "Fashion",
      matchScore: 40,
      status: "REJECTED",
      rejectReason: "Kategori tidak sesuai dengan kebutuhan area",
    },
  });

  await prisma.application.create({
    data: {
      areaId: areaB.id,
      vendorId: vendor1.id,
      businessCategory: "Kuliner",
      matchScore: 55,
      status: "CANCELLED",
      cancelReason: "Vendor mengundurkan diri karena jadwal bentrok",
    },
  });

  await prisma.review.create({
    data: {
      applicationId: appCompleted.id,
      authorId: vendor3.id,
      revieweeId: organizer2.id,
      type: "VENDOR_TO_BAZAAR",
      rating: 5,
      comment: "Lokasi strategis dan panitia sangat responsif.",
    },
  });

  await prisma.review.create({
    data: {
      applicationId: appCompleted.id,
      authorId: organizer2.id,
      revieweeId: vendor3.id,
      type: "ORGANIZER_TO_VENDOR",
      rating: 4,
      comment: "Vendor datang tepat waktu dan display produknya rapi.",
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: vendor1.id,
        message: "Pembayaran untuk slot di Area Dekat Pintu Masuk telah dikonfirmasi.",
      },
      {
        userId: vendor4.id,
        message: "Pengajuan Anda ke Area Dekat Pintu Masuk sedang diproses.",
      },
      {
        userId: vendor2.id,
        message: "Pengajuan Anda ke Zona Tengah disetujui, segera lakukan pembayaran.",
      },
      {
        userId: vendor2.id,
        message: "Pengajuan Anda ke Panggung Utama ditolak.",
        isRead: true,
      },
      {
        userId: vendor3.id,
        message: "Bazaar telah selesai, jangan lupa beri ulasan untuk penyelenggara.",
        isRead: true,
      },
      {
        userId: organizer1.id,
        message: "Ada pengajuan baru di Area Dekat Pintu Masuk.",
      },
      {
        userId: organizer2.id,
        message: "Anda menerima ulasan baru dari vendor.",
        isRead: true,
      },
    ],
  });

  await prisma.product.createMany({
    data: [
      { vendorId: vendor1.id, name: "Es Teh Kekinian", price: 8000 },
      { vendorId: vendor1.id, name: "Risoles Mayo", price: 6000 },
      { vendorId: vendor1.id, name: "Kue Cubit", price: 10000 },
      { vendorId: vendor1.id, name: "Pisang Nugget", price: 12000 },

      { vendorId: vendor2.id, name: "Jaket Denim Oversize", price: 250000 },
      { vendorId: vendor2.id, name: "Celana Denim Slim Fit", price: 180000 },
      { vendorId: vendor2.id, name: "Rok Denim A-Line", price: 150000 },
      { vendorId: vendor2.id, name: "Tas Denim Tote", price: 120000 },

      { vendorId: vendor3.id, name: "Tas Rajut Handmade", price: 95000 },
      { vendorId: vendor3.id, name: "Gantungan Kunci Makrame", price: 15000 },
      { vendorId: vendor3.id, name: "Vas Bunga Anyaman Rotan", price: 75000 },

      { vendorId: vendor4.id, name: "Kopi Susu Gula Aren", price: 15000 },
      { vendorId: vendor4.id, name: "Americano", price: 12000 },
      { vendorId: vendor4.id, name: "Cappuccino", price: 18000 },
      { vendorId: vendor4.id, name: "Roti Bakar Coklat Keju", price: 15000 },
      { vendorId: vendor4.id, name: "Es Kopi Kelapa", price: 20000 },
    ],
  });

  await prisma.portfolio.createMany({
    data: [
      {
        vendorId: vendor1.id,
        bazaarName: "Bazaar Ramadan Kota Tua",
        eventDate: new Date("2026-03-12T00:00:00Z"),
        photoUrl: "https://picsum.photos/seed/portfolio-siti-1/600/400",
      },
      {
        vendorId: vendor1.id,
        bazaarName: "Pasar Kaget Blok M",
        eventDate: new Date("2025-11-02T00:00:00Z"),
        photoUrl: "https://picsum.photos/seed/portfolio-siti-2/600/400",
      },

      {
        vendorId: vendor2.id,
        bazaarName: "Jakarta Fashion Market",
        eventDate: new Date("2025-09-14T00:00:00Z"),
        photoUrl: "https://picsum.photos/seed/portfolio-andi-1/600/400",
      },
      {
        vendorId: vendor2.id,
        bazaarName: "Flea Market Senayan Park",
        eventDate: new Date("2025-12-01T00:00:00Z"),
        photoUrl: "https://picsum.photos/seed/portfolio-andi-2/600/400",
      },

      {
        vendorId: vendor3.id,
        bazaarName: "Pasar Kreatif Bandung",
        eventDate: new Date("2026-01-06T00:00:00Z"),
        photoUrl: "https://picsum.photos/seed/portfolio-dewi-1/600/400",
      },
      {
        vendorId: vendor3.id,
        bazaarName: "Braga Craft Festival",
        eventDate: new Date("2025-07-20T00:00:00Z"),
        photoUrl: "https://picsum.photos/seed/portfolio-dewi-2/600/400",
      },
      {
        vendorId: vendor3.id,
        bazaarName: "Pasar Seni ITB",
        eventDate: new Date("2025-10-05T00:00:00Z"),
        photoUrl: "https://picsum.photos/seed/portfolio-dewi-3/600/400",
      },

      {
        vendorId: vendor4.id,
        bazaarName: "Car Free Day Sudirman Pop-up",
        eventDate: new Date("2025-08-17T00:00:00Z"),
        photoUrl: "https://picsum.photos/seed/portfolio-fajar-1/600/400",
      },
    ],
  });

  const [
    userCount,
    bazaarCount,
    areaCount,
    applicationCount,
    reviewCount,
    notificationCount,
    productCount,
    portfolioCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.bazaar.count(),
    prisma.area.count(),
    prisma.application.count(),
    prisma.review.count(),
    prisma.notification.count(),
    prisma.product.count(),
    prisma.portfolio.count(),
  ]);

  console.log("Seed selesai:");
  console.log({
    userCount,
    bazaarCount,
    areaCount,
    applicationCount,
    reviewCount,
    notificationCount,
    productCount,
    portfolioCount,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
