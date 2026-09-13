"use client";

import { useState, useActionState, useEffect, useTransition } from "react";
import { Eye, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  type ProductActionState,
} from "./actions";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
};

const initialState: ProductActionState = {};

export function ProductSection({ products }: { products: Product[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<Product | null>(null);
  const [mode, setMode] = useState<"overview" | "edit" | "delete" | null>(null);

  const [addState, addAction, addPending] = useActionState(
    createProductAction,
    initialState,
  );

  useEffect(() => {
    if (addState.success) setAddOpen(false);
  }, [addState.success]);

  function openMode(product: Product, m: "overview" | "edit" | "delete") {
    setActiveItem(product);
    setMode(m);
  }

  function close() {
    setActiveItem(null);
    setMode(null);
  }

  return (
    <div id="products" className="mb-6 scroll-mt-20">
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-medium">Produk saya</span>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          + Tambah produk
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
        {products.map((product) => (
          <div
            key={product.id}
            className="group relative bg-white border rounded-xl overflow-hidden flex-shrink-0 w-40 snap-start"
          >
            <div className="h-28 bg-[var(--muted)] flex items-center justify-center overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <span className="text-xs text-muted-foreground">
                  Tanpa foto
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => openMode(product, "overview")}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-white/90"
                aria-label="Lihat detail"
              >
                <Eye size={16} className="text-[var(--accent)]" />
              </button>
              <button
                onClick={() => openMode(product, "edit")}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-white/90"
                aria-label="Edit"
              >
                <Pencil size={16} className="text-[var(--accent)]" />
              </button>
              <button
                onClick={() => openMode(product, "delete")}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-white/90"
                aria-label="Hapus"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => setAddOpen(true)}
          className="border border-dashed rounded-xl w-40 h-[156px] flex-shrink-0 flex items-center justify-center text-sm text-muted-foreground hover:bg-[var(--secondary)]/5 snap-start"
        >
          + Tambah produk
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
            <p className="font-medium mb-3">Tambah produk</p>
            {addState.error && (
              <p className="text-xs text-red-500 mb-2">{addState.error}</p>
            )}
            <form action={addAction} className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Foto produk
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
                  Nama produk
                </label>
                <input
                  name="name"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="Kopi susu gula aren"
                />
                {addState.fieldErrors?.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {addState.fieldErrors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Harga
                </label>
                <input
                  name="price"
                  type="number"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="18000"
                />
                {addState.fieldErrors?.price && (
                  <p className="text-xs text-red-500 mt-1">
                    {addState.fieldErrors.price}
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
            <div className="h-40 bg-[var(--muted)] rounded-lg overflow-hidden mb-3 flex items-center justify-center">
              {activeItem.imageUrl ? (
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-muted-foreground">
                  Tanpa foto
                </span>
              )}
            </div>
            <p className="font-medium text-base">{activeItem.name}</p>
            <p className="text-sm text-muted-foreground">
              Rp {activeItem.price.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      )}

      {activeItem && mode === "edit" && (
        <ProductEditModal product={activeItem} onClose={close} />
      )}

      {activeItem && mode === "delete" && (
        <ProductDeleteModal product={activeItem} onClose={close} />
      )}
    </div>
  );
}

function ProductEditModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const boundAction = updateProductAction.bind(null, product.id);
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
        <p className="font-medium mb-3">Edit produk</p>
        {state.error && (
          <p className="text-xs text-red-500 mb-2">{state.error}</p>
        )}
        <form action={formAction} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Foto produk
            </label>
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt=""
                className="w-16 h-16 object-cover rounded-md mb-2"
              />
            )}
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
              Nama produk
            </label>
            <input
              name="name"
              defaultValue={product.name}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
            {state.fieldErrors?.name && (
              <p className="text-xs text-red-500 mt-1">
                {state.fieldErrors.name}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Harga
            </label>
            <input
              name="price"
              type="number"
              defaultValue={product.price}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
            {state.fieldErrors?.price && (
              <p className="text-xs text-red-500 mt-1">
                {state.fieldErrors.price}
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

function ProductDeleteModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteProductAction(product.id);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-5 w-80">
        <p className="font-medium mb-2">Hapus produk?</p>
        <p className="text-sm text-muted-foreground mb-4">
          "{product.name}" akan dihapus permanen dan tidak bisa dikembalikan.
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
