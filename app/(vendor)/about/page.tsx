import type { Metadata } from "next";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  ArrowRightIcon,
  BarChart3Icon,
  CalendarDaysIcon,
  CalendarPlusIcon,
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  CreditCardIcon,
  FileTextIcon,
  MousePointerClickIcon,
  SearchIcon,
  SparklesIcon,
  StoreIcon,
  UsersIcon,
  UsersRoundIcon,
} from "lucide-react";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { AboutTestimonialCarousel, type Testimonial } from "@/components/about-testimonial-carousel";
import { AboutScrollLink } from "@/components/about-scroll-link";
import aboutUsIllustration from "@/components/assets/about us illustration.png";
import aboutUsBg from "@/components/assets/about us bg.jpg";

export const metadata: Metadata = {
  title: "Tentang - BazzUp",
};

// Scopes the BazzUp accent purple (#7A5CA8) to this page only, so buttons and
// icon chips built on the shared `bg-primary`/`text-primary` utilities pick
// up the accent instead of the app-wide dark-purple `--primary` token.
const ACCENT_THEME_VARS = { "--primary": "#7A5CA8" } as CSSProperties;

type Step = { icon: LucideIcon; title: string; description: string };

const VENDOR_STEPS: Step[] = [
  {
    icon: SearchIcon,
    title: "Temukan Bazaar",
    description: "Cari bazaar berdasarkan lokasi, tanggal, kategori, atau minat kamu.",
  },
  {
    icon: MousePointerClickIcon,
    title: "Ajukan Slot",
    description: "Pilih area yang kamu inginkan dan kirim pengajuanmu.",
  },
  {
    icon: CreditCardIcon,
    title: "Lakukan Pembayaran",
    description: "Selesaikan pembayaran melalui metode yang tersedia.",
  },
  {
    icon: ClockIcon,
    title: "Tunggu Konfirmasi",
    description: "Organizer akan meninjau pengajuanmu dan mengonfirmasi keikutsertaanmu.",
  },
  {
    icon: StoreIcon,
    title: "Bersiap untuk Acara",
    description: "Setelah dikonfirmasi, siapkan booth kamu dan bawa produk terbaikmu!",
  },
];

const ORGANIZER_STEPS: Step[] = [
  {
    icon: CalendarPlusIcon,
    title: "Buat Acara",
    description: "Atur detail bazaar seperti tanggal, lokasi, tema, dan area yang tersedia.",
  },
  {
    icon: UsersRoundIcon,
    title: "Terima Pengajuan",
    description: "Tinjau pengajuan vendor dan kelola alokasi slot.",
  },
  {
    icon: FileTextIcon,
    title: "Konfirmasi Vendor",
    description: "Terima pengajuan dan pantau status pembayaran.",
  },
  {
    icon: BarChart3Icon,
    title: "Jalankan Acara yang Sukses",
    description: "Sambut vendor, libatkan pengunjung, dan beri dampak bagi komunitasmu.",
  },
];

const AUDIENCES: Step[] = [
  { icon: StoreIcon, title: "Untuk Vendor", description: "Temukan dan ikuti bazaar yang sesuai dengan bisnis kamu." },
  { icon: CalendarDaysIcon, title: "Untuk Organizer", description: "Kelola acara dan jangkau lebih banyak vendor." },
  {
    icon: UsersIcon,
    title: "Untuk Komunitas",
    description: "Dukung bisnis lokal dan temukan produk-produk unik.",
  },
];

const HIGHLIGHTS = ["Temukan peluang", "Dukung bisnis lokal", "Bangun komunitas yang lebih kuat"];

const WHY_CHOOSE_ITEMS: Step[] = [
  {
    icon: SparklesIcon,
    title: "Lebih Banyak Peluang",
    description: "Temukan bazaar dan bisnis relevan yang sesuai dengan tujuan kamu.",
  },
  {
    icon: ClockIcon,
    title: "Hemat Waktu",
    description: "Kelola pendaftaran, pembayaran, dan acara dalam satu tempat.",
  },
  {
    icon: UsersIcon,
    title: "Komunitas yang Lebih Kuat",
    description: "Dukung talenta lokal dan jadi bagian dari ekosistem kreatif yang terus berkembang.",
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Aulia Rahma",
    role: "Vendor",
    businessName: "Kopi Senja",
    quote:
      "BazzUp membantu kami menemukan bazaar yang sesuai dengan target pelanggan kami. Proses pendaftarannya juga sederhana dan mudah dipahami.",
  },
  {
    name: "Dimas Pratama",
    role: "Organizer",
    businessName: "Urban Weekend Market",
    quote:
      "BazzUp memudahkan kami mengelola pendaftaran vendor dalam satu tempat. Kami jadi lebih mudah menemukan tenant yang sesuai dengan konsep acara.",
  },
  {
    name: "Nabila Putri",
    role: "Vendor",
    businessName: "Soba Bakehouse",
    quote:
      "Sebelumnya kami cukup kesulitan mencari event yang cocok untuk bisnis kami. Dengan BazzUp, kami bisa menemukan berbagai peluang bazaar dengan lebih cepat.",
  },
  {
    name: "Rizky Maulana",
    role: "Organizer",
    businessName: "Local Creative Fest",
    quote:
      "BazzUp membuat proses pengelolaan vendor terasa lebih terorganisir. Informasi aplikasi dan status vendor bisa dipantau dengan lebih mudah.",
  },
  {
    name: "Citra Lestari",
    role: "Vendor",
    businessName: "Bloom & Brew",
    quote:
      "Saya suka karena informasi bazaar disajikan dengan jelas. Kami bisa melihat lokasi, tanggal, kategori, dan harga booth sebelum memutuskan untuk mendaftar.",
  },
  {
    name: "Fajar Nugroho",
    role: "Organizer",
    businessName: "Weekend Collective",
    quote:
      "Platform ini membantu kami menghemat waktu saat mengelola banyak aplikasi vendor. Proses seleksi dan konfirmasi menjadi jauh lebih praktis.",
  },
  {
    name: "Sarah Amelia",
    role: "Vendor",
    businessName: "Sweet Corner",
    quote:
      "BazzUp membuka lebih banyak kesempatan untuk memperkenalkan bisnis kami ke komunitas baru. Proses pengajuan booth juga terasa sederhana.",
  },
  {
    name: "Andi Saputra",
    role: "Organizer",
    businessName: "Jakarta Local Market",
    quote:
      "Kami dapat menjangkau lebih banyak vendor tanpa harus mengelola pendaftaran melalui banyak platform berbeda. Semuanya terasa lebih terpusat.",
  },
  {
    name: "Maya Kirana",
    role: "Vendor",
    businessName: "Rumah Rasa",
    quote:
      "BazzUp membantu kami menemukan event yang lebih relevan dengan jenis produk yang kami jual. Ini membuat kami lebih percaya diri dalam memilih bazaar.",
  },
  {
    name: "Kevin Wijaya",
    role: "Organizer",
    businessName: "Creative City Bazaar",
    quote:
      "Pengelolaan bazaar menjadi lebih rapi karena informasi vendor dan aplikasi dapat dikelola dalam satu platform. BazzUp sangat membantu proses persiapan event kami.",
  },
];

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col bg-white" style={ACCENT_THEME_VARS}>
      <section className="relative isolate flex w-full flex-col items-center overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="login-gradient absolute -top-40 -left-40 size-[600px] rounded-full sm:size-[800px]" />
        </div>

        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center sm:px-8 sm:py-28">
          <h1 className="text-3xl font-bold text-balance text-[#3B1F4A] sm:text-5xl">
            Menghubungkan Komunitas Melalui Bazaar yang Bermakna
          </h1>
          <p className="max-w-2xl text-base text-[#6B7280] sm:text-lg">
            BazzUp adalah platform yang membantu vendor menemukan acara bazaar dan memudahkan
            organizer mengelola acaranya. Kami percaya pada kekuatan komunitas lokal, bisnis
            kreatif, dan koneksi yang nyata, semua dalam satu tempat.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/explore" className={buttonVariants({ size: "lg", className: "gap-1.5" })}>
              Jelajahi Bazaar
              <ArrowRightIcon className="size-4" />
            </Link>
            <AboutScrollLink
              href="#purpose"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "border-[#7A5CA8] text-[#7A5CA8] transition-colors duration-200 hover:bg-[#F3EAFB]",
              })}
            >
              Pelajari Lebih Lanjut
            </AboutScrollLink>
          </div>
        </div>
      </section>

      <section id="purpose" className="mx-auto mt-10 w-full max-w-6xl scroll-mt-16 px-6 pb-12 sm:mt-14 sm:px-8 sm:pb-16">
        <div className="grid grid-cols-1 gap-8 rounded-2xl bg-[#F3EAFB] p-8 shadow-[0_10px_30px_rgba(122,92,168,0.10)] sm:p-12 lg:grid-cols-[1.1fr_auto_1fr]">
          <div className="flex flex-col justify-center gap-3">
            <h2 className="text-2xl font-bold text-[#3B1F4A] sm:text-3xl">Tujuan Kami</h2>
            <p className="text-[#6B7280]">
              Kami ingin menyederhanakan pengalaman bazaar untuk semua orang, mulai dari vendor
              yang mencari peluang hingga organizer yang membangun acara yang meriah. BazzUp
              mendukung pertumbuhan bisnis lokal, keterlibatan komunitas, dan ekosistem kreatif
              yang lebih terhubung.
            </p>
          </div>
          <div className="hidden w-px bg-[#E8E1EF] lg:block" />
          <div className="flex flex-col gap-6">
            {AUDIENCES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-3.5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#7A5CA8]/10 text-[#7A5CA8]">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-[#3B1F4A]">{title}</p>
                  <p className="text-sm text-[#6B7280]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate my-16 w-full overflow-hidden sm:my-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-30">
          <Image
            src={aboutUsBg}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-r from-white via-white/75 to-white/25"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="home-gradient home-gradient-one" />
          <div className="home-gradient home-gradient-two" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 sm:px-8 sm:py-20">
          <StepsSection
            title="Cara Kerja untuk Vendor"
            subtitle="Ikuti bazaar hanya dengan beberapa langkah mudah."
            steps={VENDOR_STEPS}
          />

          <StepsSection
            title="Cara Kerja untuk Organizer"
            subtitle="Kelola bazaar kamu dengan mudah, dari perencanaan hingga pelaksanaan."
            steps={ORGANIZER_STEPS}
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-12 sm:px-8 sm:pb-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-[#3B1F4A] sm:mb-10 sm:text-3xl">
          Kenapa Memilih BazzUp?
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
          {WHY_CHOOSE_ITEMS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-3 rounded-2xl border border-[#E8E1EF] bg-white p-8 text-center shadow-[0_10px_30px_rgba(122,92,168,0.10)]"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-[#7A5CA8]/10 text-[#7A5CA8]">
                <Icon className="size-5" />
              </span>
              <p className="font-semibold text-[#3B1F4A]">{title}</p>
              <p className="text-sm text-[#6B7280]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-12 sm:px-8 sm:pb-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr] lg:gap-8">
          <div className="relative min-h-[280px] overflow-hidden rounded-2xl shadow-[0_10px_30px_rgba(122,92,168,0.10)]">
            <Image
              src={aboutUsIllustration}
              alt="Ilustrasi bazaar BazzUp"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <AboutTestimonialCarousel testimonials={TESTIMONIALS} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-12 sm:px-8 sm:pb-16">
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-[#F3EAFB] px-6 py-12 text-center shadow-[0_10px_30px_rgba(122,92,168,0.10)] sm:px-10 sm:py-16">
          <h2 className="text-2xl font-bold text-[#3B1F4A] sm:text-3xl">
            Pengalaman Bazaar yang Lebih Baik untuk Semua
          </h2>
          <p className="max-w-2xl text-[#6B7280]">
            Baik kamu vendor, organizer, atau pengunjung, BazzUp hadir untuk membuat bazaar lebih
            mudah diakses, terorganisir, dan menyenangkan.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {HIGHLIGHTS.map((label) => (
              <span key={label} className="flex items-center gap-2 text-sm font-medium text-[#3B1F4A]">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#7A5CA8] text-white">
                  <CheckIcon className="size-3" />
                </span>
                {label}
              </span>
            ))}
          </div>
          <a
            href="mailto:support@bazzup.id"
            className={buttonVariants({ className: "gap-1.5" })}
          >
            Hubungi Kami
            <ArrowRightIcon className="size-4" />
          </a>
        </div>
      </section>
    </main>
  );
}

function StepsSection({ title, subtitle, steps }: { title: string; subtitle: string; steps: Step[] }) {
  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-1.5 sm:mb-10">
        <h2 className="text-2xl font-bold text-[#3B1F4A] sm:text-3xl">{title}</h2>
        <p className="text-[#6B7280]">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        {steps.map(({ icon: Icon, title: stepTitle, description }, index) => (
          <div key={stepTitle} className="flex items-stretch gap-2 lg:flex-1">
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-[#E8E1EF] bg-white p-6 text-center shadow-[0_10px_30px_rgba(122,92,168,0.10)] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-[#DCC8EE] hover:shadow-[0_14px_34px_rgba(122,92,168,0.13)]">
              <span className="flex size-12 items-center justify-center rounded-full bg-[#7A5CA8]/10 text-[#7A5CA8]">
                <Icon className="size-5" />
              </span>
              <p className="font-semibold text-[#3B1F4A]">{stepTitle}</p>
              <p className="text-sm text-[#6B7280]">{description}</p>
            </div>
            {index < steps.length - 1 && (
              <ChevronRightIcon className="hidden size-5 shrink-0 self-center text-[#B98CDE] lg:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
