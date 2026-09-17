"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_STATUS_VALUE = "__all__";

type StatusOption = { value: string; label: string };

type ApplicationsFilterBarProps = {
  statuses: StatusOption[];
  initialStatus?: string;
  initialSearch?: string;
  initialSort?: "newest" | "oldest";
};

export function ApplicationsFilterBar({
  statuses,
  initialStatus,
  initialSearch,
  initialSort,
}: ApplicationsFilterBarProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch ?? "");

  function navigate(next: { status?: string; search?: string; sort?: string }) {
    const status = "status" in next ? next.status : initialStatus;
    const searchValue = "search" in next ? next.search : initialSearch;
    const sort = "sort" in next ? next.sort : initialSort;

    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (searchValue) params.set("search", searchValue);
    if (sort && sort !== "newest") params.set("sort", sort);

    const qs = params.toString();
    router.push(qs ? `/applications?${qs}` : "/applications");
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      if (search !== (initialSearch ?? "")) {
        navigate({ search });
      }
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const statusLabel = (value: string) =>
    value === ALL_STATUS_VALUE
      ? "Semua Status"
      : (statuses.find((s) => s.value === value)?.label ?? value);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <Select
        value={initialStatus ?? ALL_STATUS_VALUE}
        onValueChange={(value) =>
          navigate({
            status:
              value === ALL_STATUS_VALUE ? undefined : (value ?? undefined),
          })
        }
      >
        <SelectTrigger className="!h-11 w-full rounded-xl border-[#E8E1EF] bg-white px-3.5 text-[#3B1F4A] focus-visible:border-[#7A5CA8] sm:w-52">
          <SelectValue>{(value: string) => statusLabel(value)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_STATUS_VALUE}>Semua Status</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative flex-1">
        <SearchIcon className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#6B7280]" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari berdasarkan ID pengajuan, acara, atau area..."
          className="h-11 rounded-xl border-[#E8E1EF] bg-white pl-10 text-[#3B1F4A] focus-visible:border-[#7A5CA8]"
        />
      </div>

      <Select
        value={initialSort ?? "newest"}
        onValueChange={(value) => navigate({ sort: value ?? "newest" })}
      >
        <SelectTrigger className="!h-11 w-full rounded-xl border-[#E8E1EF] bg-white px-3.5 text-[#3B1F4A] focus-visible:border-[#7A5CA8] sm:w-44">
          <SelectValue>
            {(value: string) =>
              value === "oldest" ? "Terlama" : "Terbaru"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Terbaru</SelectItem>
          <SelectItem value="oldest">Terlama</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
