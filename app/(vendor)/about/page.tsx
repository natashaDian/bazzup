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
  title: "About - BazzUp",
};

// Scopes the BazzUp accent purple (#7A5CA8) to this page only, so buttons and
// icon chips built on the shared `bg-primary`/`text-primary` utilities pick
// up the accent instead of the app-wide dark-purple `--primary` token.
const ACCENT_THEME_VARS = { "--primary": "#7A5CA8" } as CSSProperties;

type Step = { icon: LucideIcon; title: string; description: string };

const VENDOR_STEPS: Step[] = [
  {
    icon: SearchIcon,
    title: "Find a Bazaar",
    description: "Search for bazaars based on location, date, category, or interests.",
  },
  {
    icon: MousePointerClickIcon,
    title: "Apply for a Slot",
    description: "Choose your preferred area and submit your application.",
  },
  {
    icon: CreditCardIcon,
    title: "Make a Payment",
    description: "Complete the payment through the available method.",
  },
  {
    icon: ClockIcon,
    title: "Wait for Confirmation",
    description: "The organizer will review your application and confirm your participation.",
  },
  {
    icon: StoreIcon,
    title: "Get Ready for the Event",
    description: "Once confirmed, prepare your booth and bring your best products!",
  },
];

const ORGANIZER_STEPS: Step[] = [
  {
    icon: CalendarPlusIcon,
    title: "Create an Event",
    description: "Set up your bazaar details such as date, location, theme, and available areas.",
  },
  {
    icon: UsersRoundIcon,
    title: "Receive Applications",
    description: "Review vendor applications and manage slot allocations.",
  },
  {
    icon: FileTextIcon,
    title: "Confirm Vendors",
    description: "Accept applications and monitor payment status.",
  },
  {
    icon: BarChart3Icon,
    title: "Run a Successful Event",
    description: "Welcome vendors, engage visitors, and make an impact in your community.",
  },
];

const AUDIENCES: Step[] = [
  { icon: StoreIcon, title: "For Vendors", description: "Find and join bazaars that fit your business." },
  { icon: CalendarDaysIcon, title: "For Organizers", description: "Manage events and reach more vendors." },
  {
    icon: UsersIcon,
    title: "For Communities",
    description: "Support local businesses and discover unique products.",
  },
];

const HIGHLIGHTS = ["Discover opportunities", "Support local businesses", "Build stronger communities"];

const WHY_CHOOSE_ITEMS: Step[] = [
  {
    icon: SparklesIcon,
    title: "More Opportunities",
    description: "Discover relevant bazaars and businesses that match your goals.",
  },
  {
    icon: ClockIcon,
    title: "Save Time",
    description: "Handle applications, payments, and event management in one place.",
  },
  {
    icon: UsersIcon,
    title: "Stronger Communities",
    description: "Support local talents and be part of a growing creative ecosystem.",
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
            Connecting Communities Through Meaningful Bazaars
          </h1>
          <p className="max-w-2xl text-base text-[#6B7280] sm:text-lg">
            BazzUp is a platform that helps vendors discover bazaar events and makes it easier for
            organizers to manage their events. We believe in the power of local communities, creative
            businesses, and real connections — all in one place.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/explore" className={buttonVariants({ size: "lg", className: "gap-1.5" })}>
              Explore Bazaars
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
              Learn More
            </AboutScrollLink>
          </div>
        </div>
      </section>

      <section id="purpose" className="mx-auto mt-10 w-full max-w-6xl scroll-mt-16 px-6 pb-12 sm:mt-14 sm:px-8 sm:pb-16">
        <div className="grid grid-cols-1 gap-8 rounded-2xl bg-[#F3EAFB] p-8 shadow-[0_10px_30px_rgba(122,92,168,0.10)] sm:p-12 lg:grid-cols-[1.1fr_auto_1fr]">
          <div className="flex flex-col justify-center gap-3">
            <h2 className="text-2xl font-bold text-[#3B1F4A] sm:text-3xl">Our Purpose</h2>
            <p className="text-[#6B7280]">
              We aim to simplify the bazaar experience for everyone — from vendors looking for
              opportunities to organizers building vibrant events. BazzUp supports local business
              growth, community engagement, and a more connected creative ecosystem.
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

      <section className="relative isolate mt-10 w-full overflow-hidden sm:mt-14">
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
            title="How It Works for Vendors"
            subtitle="Join a bazaar in just a few simple steps."
            steps={VENDOR_STEPS}
          />

          <StepsSection
            title="How It Works for Organizers"
            subtitle="Easily manage your bazaar from planning to execution."
            steps={ORGANIZER_STEPS}
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-12 sm:px-8 sm:pb-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-[#3B1F4A] sm:mb-10 sm:text-3xl">
          Why Choose BazzUp?
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
              alt="Illustration of a BazzUp bazaar"
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
            A Better Bazaar Experience for Everyone
          </h2>
          <p className="max-w-2xl text-[#6B7280]">
            Whether you&apos;re a vendor, organizer, or visitor, BazzUp is here to make bazaars more
            accessible, organized, and enjoyable.
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
            Contact Us
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
