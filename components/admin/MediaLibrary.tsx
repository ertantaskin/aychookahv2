"use client";

import { useState, useEffect } from "react";
import { Search, Grid, List, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import MediaCard from "./MediaCard";
import MediaUploader from "./MediaUploader";

interface Media {
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
}

interface MediaLibraryProps {
  initialMedia?: Media[];
  initialPagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  selectable?: boolean;
  onSelect?: (media: Media[]) => void;
  onClose?: () => void;
  onMediaUpdate?: () => void;
}

export default function MediaLibrary({
  initialMedia = [],
  initialPagination,
  selectable = false,
  onSelect,
  onClose,
  onMediaUpdate,
}: MediaLibraryProps) {
  const [media, setMedia] = useState<Media[]>(initialMedia);
  const [pagination, setPagination] = useState(
    initialPagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    }
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const fetchMedia = async (page: number = 1, search: string = "") => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
      });

      const response = await fetch(`/api/media?${params}`);
      if (!response.ok) throw new Error("Medya yüklenemedi");

      const data = await response.json();
      setMedia(data.media);
      setPagination(data.pagination);
    } catch (error: any) {
      toast.error(error.message || "Medya yüklenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia(1, searchQuery);
  }, [searchQuery]);

  const handleSelect = (id: string) => {
    if (!selectable) return;

    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/media/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Medya silinemedi");
      }

      setMedia((prev) => prev.filter((m) => m.id !== id));
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      toast.success("Medya silindi");
    } catch (error: any) {
      toast.error(error.message || "Medya silinirken bir hata oluştu");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`${selectedIds.size} medyayı silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedIds).map((id) =>
        fetch(`/api/media/${id}`, { method: "DELETE" })
      );

      await Promise.all(deletePromises);
      setSelectedIds(new Set());
      fetchMedia(pagination.page, searchQuery);
      toast.success("Medyalar silindi");
    } catch (error: any) {
      toast.error("Medyalar silinirken bir hata oluştu");
    }
  };

  const handleConfirmSelection = () => {
    if (!onSelect || selectedIds.size === 0) return;

    const selectedMedia = media.filter((m) => selectedIds.has(m.id));
    onSelect(selectedMedia);
  };

  const handleUploadComplete = () => {
    setShowUploader(false);
    fetchMedia(pagination.page, searchQuery);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <h2 className="font-sans text-xl font-bold text-gray-900">Medya Kütüphanesi</h2>
          {selectable && selectedIds.size > 0 && (
            <span className="font-sans text-sm text-gray-600">
              {selectedIds.size} medya seçildi
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Medya ara..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight/50 focus:border-luxury-goldLight font-sans"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowUploader(!showUploader)}
              className="px-4 py-2 bg-luxury-goldLight text-luxury-black font-semibold rounded-lg hover:bg-luxury-gold transition-colors font-sans"
            >
              {showUploader ? "Yükleme Kapat" : "Yeni Medya Yükle"}
            </button>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors font-sans flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Seçilenleri Sil ({selectedIds.size})
              </button>
            )}
            {selectable && selectedIds.size > 0 && onSelect && (
              <button
                type="button"
                onClick={handleConfirmSelection}
                className="px-4 py-2 bg-luxury-black text-white font-semibold rounded-lg hover:bg-luxury-darkGray transition-colors font-sans"
              >
                Seçimi Onayla
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-luxury-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-luxury-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Uploader */}
        {showUploader && (
          <div className="pt-4 border-t border-gray-200">
            <MediaUploader onUploadComplete={handleUploadComplete} />
          </div>
        )}
      </div>

      {/* Media Grid/List */}
      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-luxury-goldLight border-t-transparent rounded-full animate-spin" />
            <p className="font-sans text-sm text-gray-600 mt-4">Yükleniyor...</p>
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-sans text-gray-600">Medya bulunamadı</p>
          </div>
        ) : (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                  : "space-y-2"
              }
            >
              {media.map((item) => (
                <MediaCard
                  key={item.id}
                  media={item}
                  isSelected={selectedIds.has(item.id)}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                  selectable={selectable}
                  onUpdate={onMediaUpdate || (() => fetchMedia(pagination.page, searchQuery))}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchMedia(pagination.page - 1, searchQuery)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-sans"
                >
                  Önceki
                </button>
                <span className="font-sans text-sm text-gray-600">
                  Sayfa {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => fetchMedia(pagination.page + 1, searchQuery)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-sans"
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

