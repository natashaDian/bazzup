"use client";

import { useState, useTransition } from "react";
import { deleteAreaAction } from "@/lib/areas";

export function AreaDeleteModal({
  areaId,
  areaName,
  bazaarId,
  onClose,
}: {
  areaId: string;
  areaName: string;
  bazaarId: string;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAreaAction(areaId, bazaarId);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-base font-medium mb-2">Hapus area ini?</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          "{areaName}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
        </p>

        {error && <p className="text-xs text-destructive mb-3">{error}</p>}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="bg-secondary/15 text-muted-foreground px-4 py-2 rounded-lg text-sm"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm"
          >
            {isPending ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
