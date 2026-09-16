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
  LineChart,
  Line,
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

const ATTENTION_ICON = {
  draft: FilePenLine,
  pending: Inbox,
  unrated: Star,
};

const CARD_ACCENTS = [
  { bg: "bg-accent/15", text: "text-accent" },
  { bg: "bg-secondary/25", text: "text-primary" },
  { bg: "bg-accent/10", text: "text-accent" },
  { bg: "bg-secondary/20", text: "text-primary" },
];

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
      ? `You have ${pendingCount} application${pendingCount > 1 ? "s" : ""} waiting for review.`
      : "You're all caught up.";

  const statusData = [
    { name: "Confirmed", value: statusBreakdown.confirmed, color: "#7A5CA8" },
    { name: "Pending", value: statusBreakdown.pending, color: "#B98CDE" },
    { name: "Rejected", value: statusBreakdown.rejected, color: "#D3D1C7" },
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
      label: "Pending",
      value: stats.pendingApplications,
      isNumber: true,
    },
    {
      icon: Users,
      label: "Confirmed vendors",
      value: stats.confirmedVendors,
      isNumber: true,
    },
    {
      icon: Wallet,
      label: "Revenue",
      value: `Rp ${stats.revenue.toLocaleString("id-ID")}`,
      isNumber: false,
    },
  ];

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
          <h1 className="text-xl font-medium">
            {greeting}, {displayName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>

        <select
          value={selectedBazaarId}
          onChange={(e) => handleBazaarChange(e.target.value)}
          className="text-sm px-3 py-2 rounded-lg border border-input bg-card transition-shadow hover:shadow-sm"
        >
          <option value="">All bazaars</option>
          {bazaarOptions.map((bazaar) => (
            <option key={bazaar.id} value={bazaar.id}>
              {bazaar.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
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
              accent={CARD_ACCENTS[i]}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 transition-shadow hover:shadow-md animate-in fade-in duration-500">
          <p className="text-xs font-medium text-muted-foreground mb-3">
            Applications trend
          </p>
          <div style={{ width: "100%", height: 140 }}>
            <ResponsiveContainer>
              <LineChart data={trend}>
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#7A5CA8"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#7A5CA8" }}
                  isAnimationActive
                  animationDuration={900}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 transition-shadow hover:shadow-md animate-in fade-in duration-500 delay-100">
          <p className="text-xs font-medium text-muted-foreground mb-3">
            Application status
          </p>
          {statusData.length > 0 ? (
            <div className="flex items-center gap-3">
              <div
                className="relative shrink-0"
                style={{ width: "55%", height: 140 }}
              >
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      isAnimationActive
                      animationDuration={800}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
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
              No applications yet
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl p-4 transition-shadow hover:shadow-md animate-in fade-in duration-500 delay-200">
          <p className="text-xs font-medium text-muted-foreground mb-3">
            Top categories
          </p>
          {categories.length > 0 ? (
            <div style={{ width: "100%", height: 140 }}>
              <ResponsiveContainer>
                <BarChart
                  data={categories}
                  layout="vertical"
                  margin={{ left: 8 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="category"
                    type="category"
                    tick={{ fontSize: 10, fill: "#2C1B45" }}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="#B98CDE"
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
              No data yet
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <p className="text-sm font-medium mb-3 flex items-center gap-2">
            Needs your attention
            {attentionItems.length > 0 && (
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex size-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
            )}
          </p>
          <div className="bg-card rounded-xl overflow-hidden">
            {attentionItems.length > 0 ? (
              attentionItems.map((item, i) => {
                const Icon = ATTENTION_ICON[item.type];
                const href =
                  item.type === "pending"
                    ? `/organizer/applications?bazaarId=${item.bazaarId}`
                    : `/organizer/bazaars/${item.bazaarId}`;
                return (
                  <Link
                    key={i}
                    href={href}
                    className={`group flex items-center justify-between px-4 py-3 transition-colors hover:bg-secondary/10 ${
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
                Nothing needs your attention right now.
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-3">Recent activity</p>
          <div className="bg-card rounded-xl p-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((item, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${i < recentActivity.length - 1 ? "mb-3" : ""}`}
                >
                  <div className="size-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <p className="text-xs">{item.message}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                No activity yet.
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-3">Upcoming bazaars</p>
        {upcomingBazaars.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto">
            {upcomingBazaars.map((bazaar) => (
              <Link
                key={bazaar.id}
                href={`/organizer/bazaars/${bazaar.id}`}
                className="group bg-card rounded-xl px-4 py-3 flex-1 min-w-[160px] flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div>
                  <p className="text-xs text-accent mb-1">
                    {bazaar.daysUntil === 0
                      ? "Today"
                      : `In ${bazaar.daysUntil} days`}
                  </p>
                  <p className="text-sm font-medium">{bazaar.title}</p>
                </div>
                <ArrowRight className="size-4 text-secondary shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl px-4 py-6 text-center text-sm text-muted-foreground">
            No upcoming bazaars scheduled.
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
    <div className="bg-card rounded-xl p-4 transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center gap-2.5 mb-2">
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
