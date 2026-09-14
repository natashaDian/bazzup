import type { Metadata } from "next";
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
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About - BazzUp",
};

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

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 py-16 text-center sm:py-20">
        <h1 className="text-3xl font-bold text-balance sm:text-5xl">
          Connecting Communities Through Meaningful Bazaars
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          BazzUp is a platform that helps vendors discover bazaar events and makes it easier for
          organizers to manage their events. We believe in the power of local communities, creative
          businesses, and real connections — all in one place.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/explore" className={buttonVariants({ size: "lg", className: "gap-1.5" })}>
            Explore Bazaars
            <ArrowRightIcon className="size-4" />
          </Link>
          <a href="#purpose" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Learn More
          </a>
        </div>
      </section>

      <section id="purpose" className="mx-auto w-full max-w-6xl scroll-mt-16 px-4 pb-16">
        <div className="grid grid-cols-1 gap-8 rounded-2xl bg-muted p-8 sm:p-10 lg:grid-cols-[1.1fr_auto_1fr]">
          <div className="flex flex-col justify-center gap-3">
            <h2 className="text-2xl font-bold sm:text-3xl">Our Purpose</h2>
            <p className="text-muted-foreground">
              We aim to simplify the bazaar experience for everyone — from vendors looking for
              opportunities to organizers building vibrant events. BazzUp supports local business
              growth, community engagement, and a more connected creative ecosystem.
            </p>
          </div>
          <div className="hidden w-px bg-border lg:block" />
          <div className="flex flex-col gap-5">
            {AUDIENCES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <section className="mx-auto w-full max-w-5xl px-4 pb-16">
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-muted px-6 py-12 text-center sm:px-10">
          <h2 className="text-2xl font-bold sm:text-3xl">A Better Bazaar Experience for Everyone</h2>
          <p className="max-w-2xl text-muted-foreground">
            Whether you&apos;re a vendor, organizer, or visitor, BazzUp is here to make bazaars more
            accessible, organized, and enjoyable.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {HIGHLIGHTS.map((label) => (
              <span key={label} className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
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

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <SparklesIcon className="size-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-primary">BazzUp</p>
              <p className="text-[10px] font-medium tracking-wide text-muted-foreground">
                BOOST YOUR BAZAAR
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/vendor" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link href="/explore" className="text-muted-foreground hover:text-foreground">
              Explore
            </Link>
            <Link href="/about" className="text-foreground">
              About
            </Link>
          </nav>

          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} BazzUp. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

function StepsSection({ title, subtitle, steps }: { title: string; subtitle: string; steps: Step[] }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16">
      <div className="mb-6 flex flex-col gap-1">
        <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        {steps.map(({ icon: Icon, title: stepTitle, description }, index) => (
          <div key={stepTitle} className="flex items-center gap-2 lg:flex-1">
            <div className="flex flex-1 flex-col gap-3 rounded-xl border bg-card p-5 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <p className="font-semibold">{stepTitle}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {index < steps.length - 1 && (
              <ChevronRightIcon className="hidden size-5 shrink-0 text-muted-foreground lg:block" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
