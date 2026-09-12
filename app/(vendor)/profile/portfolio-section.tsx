"use client";

import { useState, useActionState, useEffect, useTransition } from "react";
import { Eye, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createPortfolioAction,
  updatePortfolioAction,
  deletePortfolioAction,
  type ProductActionState,
} from "./actions";

type Portfolio = {
  id: string;
  bazaarName: string;
  eventDate: Date;
  photoUrl: string;
};

const initialState: ProductActionState = {};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toInputDate(date: Date) {
  return new Date(date).toISOString().split("T")[0];
}

export function PortfolioSection({ portfolios }: { portfolios: Portfolio[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<Portfolio | null>(null);
  const [mode, setMode] = useState<"overview" | "edit" | "delete" | null>(null);

  const [addState, addAction, addPending] = useActionState(
    createPortfolioAction,
    initialState,
  );

  useEffect(() => {
    if (addState.success) setAddOpen(false);
  }, [addState.success]);

  function openMode(item: Portfolio, m: "overview" | "edit" | "delete") {
    setActiveItem(item);
    setMode(m);
  }

  function close() {
    setActiveItem(null);
    setMode(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-medium">Portofolio</span>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          + Tambah portofolio
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
        {portfolios.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white border rounded-xl overflow-hidden flex-shrink-0 w-40 snap-start"
          >
            <div className="h-28 bg-[var(--muted)] overflow-hidden">
              <img
                src={item.photoUrl}
                alt={item.bazaarName}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
            <div className="p-3">
              <p className="text-sm font-medium truncate">{item.bazaarName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(item.eventDate)}
              </p>
            </div>

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => openMode(item, "overview")}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center"
                aria-label="Lihat detail"
              >
                <Eye size={16} className="text-[var(--accent)]" />
              </button>
              <button
                onClick={() => openMode(item, "edit")}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center"
                aria-label="Edit"
              >
                <Pencil size={16} className="text-[var(--accent)]" />
              </button>
              <button
                onClick={() => openMode(item, "delete")}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center"
                aria-label="Hapus"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => setAddOpen(true)}
          className="border border-dashed rounded-xl w-40 h-[156px] flex-shrink-0 flex items-center justify-center text-sm text-muted-foreground text-center px-3 hover:bg-[var(--secondary)]/5 snap-start"
        >
          + Tambah portofolio
        </button>
      </div>

      {addOpen && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-80 relative">
            <button
              onClick={() => setAddOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground"
            >
              <X size={16} />
            </button>
            <p className="font-medium mb-3">Tambah portofolio</p>
            {addState.error && (
              <p className="text-xs text-red-500 mb-2">{addState.error}</p>
            )}
            <form action={addAction} className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Foto kenangan
                </label>
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  className="text-sm"
                />
                {addState.fieldErrors?.photo && (
                  <p className="text-xs text-red-500 mt-1">
                    {addState.fieldErrors.photo}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Nama bazaar
                </label>
                <input
                  name="bazaarName"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="Bazaar kemang raya"
                />
                {addState.fieldErrors?.bazaarName && (
                  <p className="text-xs text-red-500 mt-1">
                    {addState.fieldErrors.bazaarName}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Tanggal
                </label>
                <input
                  name="eventDate"
                  type="date"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
                {addState.fieldErrors?.eventDate && (
                  <p className="text-xs text-red-500 mt-1">
                    {addState.fieldErrors.eventDate}
                  </p>
                )}
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={addPending}>
                  {addPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeItem && mode === "overview" && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-80 relative">
            <button
              onClick={close}
              className="absolute top-4 right-4 text-muted-foreground"
            >
              <X size={16} />
            </button>
            <div className="h-40 bg-[var(--muted)] rounded-lg overflow-hidden mb-3">
              <img
                src={activeItem.photoUrl}
                alt={activeItem.bazaarName}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="font-medium text-base">{activeItem.bazaarName}</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(activeItem.eventDate)}
            </p>
          </div>
        </div>
      )}

      {activeItem && mode === "edit" && (
        <PortfolioEditModal item={activeItem} onClose={close} />
      )}
      {activeItem && mode === "delete" && (
        <PortfolioDeleteModal item={activeItem} onClose={close} />
      )}
    </div>
  );
}

function PortfolioEditModal({
  item,
  onClose,
}: {
  item: Portfolio;
  onClose: () => void;
}) {
  const boundAction = updatePortfolioAction.bind(null, item.id);
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) onClose();
  }, [state.success]);

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-5 w-80 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground"
        >
          <X size={16} />
        </button>
        <p className="font-medium mb-3">Edit portofolio</p>
        {state.error && (
          <p className="text-xs text-red-500 mb-2">{state.error}</p>
        )}
        <form action={formAction} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Foto
            </label>
            <img
              src={item.photoUrl}
              alt=""
              className="w-16 h-16 object-cover rounded-md mb-2"
            />
            <input
              type="file"
              name="photo"
              accept="image/*"
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Kosongkan kalau tidak mau ganti foto
            </p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Nama bazaar
            </label>
            <input
              name="bazaarName"
              defaultValue={item.bazaarName}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
            {state.fieldErrors?.bazaarName && (
              <p className="text-xs text-red-500 mt-1">
                {state.fieldErrors.bazaarName}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Tanggal
            </label>
            <input
              name="eventDate"
              type="date"
              defaultValue={toInputDate(item.eventDate)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
            {state.fieldErrors?.eventDate && (
              <p className="text-xs text-red-500 mt-1">
                {state.fieldErrors.eventDate}
              </p>
            )}
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PortfolioDeleteModal({
  item,
  onClose,
}: {
  item: Portfolio;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deletePortfolioAction(item.id);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-5 w-80">
        <p className="font-medium mb-2">Hapus portofolio?</p>
        <p className="text-sm text-muted-foreground mb-4">
          "{item.bazaarName}" akan dihapus permanen dan tidak bisa dikembalikan.
        </p>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </div>
      </div>
    </div>
  );
}
