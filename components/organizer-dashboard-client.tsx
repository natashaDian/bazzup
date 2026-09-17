"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Calendar,
  Inbox,
  Users,
  Wallet,
  FilePenLine,
  Star,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import type {
  DashboardStats,
  TrendPoint,
  StatusBreakdown,
  CategoryCount,
  AttentionItem,
  ActivityItem,
  UpcomingBazaar,
} from "@/lib/dashboard";

type BazaarOption = { id: string; title: string };

const ALL_BAZAAR_VALUE = "__all__";

const ATTENTION_ICON = {
  draft: FilePenLine,
  pending: Inbox,
  review: Star,
};

// One consistent icon style across every stat card.
const CARD_ACCENT = { bg: "bg-accent/15", text: "text-accent" };

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value?: number | string;
    name?: string;
    color?: string;
    payload?: { fill?: string };
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-[#E5E0EB] bg-white/95 px-2.5 py-2 text-xs shadow-lg backdrop-blur-sm">
      {label && (
        <p className="mb-1 font-medium text-[#3B1F4A]">{label}</p>
      )}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span
            className="size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color ?? entry.payload?.fill }}
          />
          <span className="text-muted-foreground">
            {entry.name && entry.name !== label ? `${entry.name}: ` : ""}
          </span>
          <span className="font-medium text-[#3B1F4A]">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

export function OrganizerDashboardClient({
  greeting,
  displayName,
  pendingCount,
  stats,
  trend,
  statusBreakdown,
  categories,
  attentionItems,
  recentActivity,
  upcomingBazaars,
  bazaarOptions,
  selectedBazaarId,
}: {
  greeting: string;
  displayName: string;
  pendingCount: number;
  stats: DashboardStats;
  trend: TrendPoint[];
  statusBreakdown: StatusBreakdown;
  categories: CategoryCount[];
  attentionItems: AttentionItem[];
  recentActivity: ActivityItem[];
  upcomingBazaars: UpcomingBazaar[];
  bazaarOptions: BazaarOption[];
  selectedBazaarId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function handleBazaarChange(bazaarId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (bazaarId) params.set("bazaarId", bazaarId);
    else params.delete("bazaarId");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const subtitle =
    pendingCount > 0
      ? `Anda memiliki ${pendingCount} aplikasi yang menunggu ditinjau.`
      : "Semua aplikasi sudah ditinjau.";

  const statusData = [
    { name: "Dikonfirmasi", value: statusBreakdown.confirmed, color: "#7A5CA8" },
    { name: "Menunggu", value: statusBreakdown.pending, color: "#B98CDE" },
    { name: "Ditolak", value: statusBreakdown.rejected, color: "#D3D1C7" },
  ].filter((d) => d.value > 0);

  const totalApplications =
    statusBreakdown.confirmed +
    statusBreakdown.pending +
    statusBreakdown.rejected;

  const statCards = [
    {
      icon: Calendar,
      label: stats.primaryLabel,
      value: stats.primaryValue,
      isNumber: true,
    },
    {
      icon: Inbox,
      label: "Menunggu",
      value: stats.pendingApplications,
      isNumber: true,
    },
    {
      icon: Users,
      label: "Vendor terkonfirmasi",
      value: stats.confirmedVendors,
      isNumber: true,
    },
    {
      icon: Wallet,
      label: "Pendapatan",
      value: `Rp ${stats.revenue.toLocaleString("id-ID")}`,
      isNumber: false,
    },
  ];

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#3B1F4A] sm:text-3xl">
            {greeting}, {displayName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Select
            value={selectedBazaarId || ALL_BAZAAR_VALUE}
            onValueChange={(value) =>
              handleBazaarChange(value === ALL_BAZAAR_VALUE ? "" : (value ?? ""))
            }
          >
            <SelectTrigger className="!h-10 w-fit rounded-lg border-[#E5E0EB] bg-white px-4 text-sm text-[#3B1F4A] shadow-sm transition-all hover:border-[#B98CDE] hover:shadow-md focus-visible:border-[#7A5CA8] focus-visible:ring-[#7A5CA8]/30">
              <SelectValue>
                {(value: string) =>
                  value === ALL_BAZAAR_VALUE
                    ? "Semua bazaar"
                    : (bazaarOptions.find((b) => b.id === value)?.title ??
                      "Semua bazaar")
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="min-w-[180px] rounded-2xl border border-[#E5E0EB] bg-white p-2 shadow-lg">
              <SelectItem
                value={ALL_BAZAAR_VALUE}
                className="rounded-lg px-3 py-2.5 text-sm text-[#3B1F4A] data-[selected]:bg-[#F3EAFB] data-[selected]:font-medium data-[highlighted]:bg-[#F3EAFB]"
              >
                Semua bazaar
              </SelectItem>
              {bazaarOptions.map((bazaar) => (
                <SelectItem
                  key={bazaar.id}
                  value={bazaar.id}
                  className="rounded-lg px-3 py-2.5 text-sm text-[#3B1F4A] data-[selected]:bg-[#F3EAFB] data-[selected]:font-medium data-[highlighted]:bg-[#F3EAFB]"
                >
                  {bazaar.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="animate-in fade-in slide-in-from-bottom-3"
            style={{
              animationDelay: `${i * 80}ms`,
              animationDuration: "500ms",
              animationFillMode: "backwards",
            }}
          >
            <StatCard
              icon={<card.icon className="size-4" />}
              label={card.label}
              value={card.value}
              isNumber={card.isNumber}
              accent={CARD_ACCENT}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="bg-card rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md animate-in fade-in duration-500">
          <p className="text-xs font-medium text-muted-foreground mb-4">
            Tren aplikasi
          </p>
          <div style={{ width: "100%", height: 140 }}>
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7A5CA8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7A5CA8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  content={<ChartTooltip />}
                  position={{ y: 0 }}
                  wrapperStyle={{ zIndex: 20 }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Aplikasi"
                  stroke="#7A5CA8"
                  strokeWidth={2}
                  fill="url(#trendGradient)"
                  dot={{ r: 3, fill: "#7A5CA8", strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                  isAnimationActive
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md animate-in fade-in duration-500 delay-100">
          <p className="text-xs font-medium text-muted-foreground mb-4">
            Status aplikasi
          </p>
          {statusData.length > 0 ? (
            <div className="flex items-center gap-3">
              <div
                className="relative shrink-0"
                style={{ width: "55%", height: 140 }}
              >
                <ResponsiveContainer>
                  <PieChart>
                    <defs>
                      {statusData.map((entry, index) => (
                        <linearGradient
                          key={index}
                          id={`pieGradient-${index}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                          <stop
                            offset="100%"
                            stopColor={entry.color}
                            stopOpacity={0.7}
                          />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      isAnimationActive
                      animationDuration={800}
                    >
                      {statusData.map((_, index) => (
                        <Cell key={index} fill={`url(#pieGradient-${index})`} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<ChartTooltip />}
                      position={{ y: 0 }}
                      wrapperStyle={{ zIndex: 20 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-medium text-foreground">
                    {totalApplications}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    total
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {statusData.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {entry.name}
                    </span>
                    <span className="text-xs font-medium ml-auto">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[140px] flex items-center justify-center text-xs text-muted-foreground">
              Belum ada aplikasi
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md animate-in fade-in duration-500 delay-200">
          <p className="text-xs font-medium text-muted-foreground mb-4">
            Kategori teratas
          </p>
          {categories.length > 0 ? (
            <div style={{ width: "100%", height: 140 }}>
              <ResponsiveContainer>
                <BarChart
                  data={categories}
                  layout="vertical"
                  margin={{ left: 8 }}
                >
                  <defs>
                    <linearGradient id="categoryGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#B98CDE" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#7A5CA8" stopOpacity={0.95} />
                    </linearGradient>
                  </defs>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="category"
                    type="category"
                    tick={{ fontSize: 10, fill: "#2C1B45" }}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    position={{ y: 0 }}
                    wrapperStyle={{ zIndex: 20 }}
                  />
                  <Bar
                    dataKey="count"
                    name="Jumlah"
                    fill="url(#categoryGradient)"
                    radius={4}
                    barSize={14}
                    isAnimationActive
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[140px] flex items-center justify-center text-xs text-muted-foreground">
              Belum ada data
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="lg:col-span-2">
          <p className="text-sm font-medium mb-4 flex items-center gap-2">
            Perlu perhatian Anda
            {attentionItems.length > 0 && (
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex size-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
            )}
          </p>
          <div className="bg-card rounded-xl shadow-sm overflow-hidden">
            {attentionItems.length > 0 ? (
              attentionItems.map((item, i) => {
                const Icon = ATTENTION_ICON[item.type];
                const href =
                  item.type === "pending"
                    ? `/organizer/applications?bazaarId=${item.bazaarId}`
                    : item.type === "review"
                      ? `/organizer/bazaars?openSummary=${item.bazaarId}`
                      : `/organizer/bazaars/${item.bazaarId}`;
                return (
                  <Link
                    key={i}
                    href={href}
                    className={`group flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-secondary/10 ${
                      i < attentionItems.length - 1
                        ? "border-b border-secondary/10"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="size-4 text-accent" />
                      <span className="text-sm">{item.message}</span>
                    </div>
                    <ChevronRight className="size-3.5 text-secondary transition-transform group-hover:translate-x-0.5" />
                  </Link>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Tidak ada yang perlu diperhatikan saat ini.
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-4">Aktivitas terbaru</p>
          <div className="bg-card rounded-xl p-5 shadow-sm">
            {recentActivity.length > 0 ? (
              recentActivity.map((item, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${i < recentActivity.length - 1 ? "mb-3.5" : ""}`}
                >
                  <div className="size-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <p className="text-xs">{item.message}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                Belum ada aktivitas.
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-4">Bazaar mendatang</p>
        {upcomingBazaars.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto">
            {upcomingBazaars.map((bazaar) => (
              <Link
                key={bazaar.id}
                href={`/organizer/bazaars/${bazaar.id}`}
                className="group bg-card rounded-xl px-5 py-4 flex-1 min-w-[160px] flex items-center justify-between shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div>
                  <p className="text-xs text-accent mb-1">
                    {bazaar.daysUntil === 0
                      ? "Hari ini"
                      : `${bazaar.daysUntil} hari lagi`}
                  </p>
                  <p className="text-sm font-medium">{bazaar.title}</p>
                </div>
                <ArrowRight className="size-4 text-secondary shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl px-4 py-6 text-center text-sm text-muted-foreground shadow-sm">
            Belum ada bazaar mendatang yang dijadwalkan.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  isNumber,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  isNumber: boolean;
  accent: { bg: string; text: string };
}) {
  const animatedValue = useCountUp(isNumber ? Number(value) : 0);

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div
          className={`size-7 rounded-lg flex items-center justify-center ${accent.bg} ${accent.text}`}
        >
          {icon}
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className="text-xl font-medium">{isNumber ? animatedValue : value}</p>
    </div>
  );
}
