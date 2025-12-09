"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, Copy, Check, Edit } from "lucide-react";
import { toast } from "sonner";
import MediaEditModal from "./MediaEditModal";

interface MediaCardProps {
  media: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    mimeType: string;
    alt?: string | null;
    description?: string | null;
    createdAt: Date;
    usageCount: number;
  };
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  selectable?: boolean;
  onUpdate?: () => void;
}

export default function MediaCard({
  media,
  isSelected = false,
  onSelect,
  onDelete,
  selectable = false,
  onUpdate,
}: MediaCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (media.usageCount > 0) {
      toast.error("Bu medya kullanımda olduğu için silinemez");
      return;
    }

    if (!confirm("Bu medyayı silmek istediğinize emin misiniz?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(media.id);
      toast.success("Medya silindi");
    } catch (error: any) {
      toast.error(error.message || "Medya silinirken bir hata oluştu");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(media.url);
    setCopied(true);
    toast.success("URL kopyalandı");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardClick = () => {
    if (selectable && onSelect) {
      onSelect(media.id);
    } else {
      // Normal modda tıklayınca düzenleme modalını aç
      setIsEditModalOpen(true);
    }
  };

  const handleUpdate = () => {
    // Call parent update callback if provided
    if (onUpdate) {
      onUpdate();
    } else {
      // Fallback to page reload
      window.location.reload();
    }
  };

  return (
    <>
      <div
        className={`group relative bg-white rounded-lg border-2 overflow-hidden transition-all cursor-pointer ${
          isSelected
            ? "border-luxury-goldLight shadow-lg"
            : "border-gray-200 hover:border-gray-300"
        } ${selectable ? "" : ""}`}
        onClick={handleCardClick}
      >
      {/* Selection Checkbox */}
      {selectable && (
        <div className="absolute top-2 left-2 z-10">
          <div
            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
              isSelected
                ? "bg-luxury-goldLight border-luxury-goldLight"
                : "bg-white border-gray-300"
            }`}
          >
            {isSelected && <Check className="w-4 h-4 text-luxury-black" />}
          </div>
        </div>
      )}

      {/* Image Preview */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {media.type === "image" ? (
          <Image
            src={media.url}
            alt={media.alt || media.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <p className="text-xs text-gray-500">{media.mimeType}</p>
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {!selectable && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditModalOpen(true);
              }}
              className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
              title="Düzenle"
            >
              <Edit className="w-4 h-4 text-white" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCopyUrl();
            }}
            className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            title="URL'yi Kopyala"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-700" />
            )}
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isDeleting || media.usageCount > 0}
              className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Sil"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Media Info */}
      <div className="p-3">
        <h3 className="font-sans text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
          {media.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatFileSize(media.size)}</span>
          <span>{formatDate(media.createdAt)}</span>
        </div>
        {media.usageCount > 0 && (
          <div className="mt-1 text-xs text-luxury-goldLight">
            {media.usageCount} yerde kullanılıyor
          </div>
        )}
      </div>
      </div>

      {/* Edit Modal */}
      <MediaEditModal
        media={media}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUpdate}
      />
    </>
  );
}

