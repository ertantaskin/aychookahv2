"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Image as ImageIcon } from "lucide-react";
import MediaLibrary from "./MediaLibrary";

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

interface MediaSelectorProps {
  onSelect: (media: Media[]) => void;
  multiple?: boolean;
  currentSelection?: Media[];
}

export default function MediaSelector({
  onSelect,
  multiple = true,
  currentSelection = [],
}: MediaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (media: Media[]) => {
    onSelect(multiple ? media : media.slice(0, 1));
    setIsOpen(false);
  };

  const handleModalClick = (e: React.MouseEvent) => {
    // Modal dışına tıklandığında kapat
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    // ESC tuşu ile kapat
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const modalContent = isOpen ? (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleModalClick}
      onKeyDown={handleModalKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-selector-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <MediaLibrary
          selectable={true}
          onSelect={handleSelect}
          onClose={() => setIsOpen(false)}
        />
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-luxury-goldLight text-luxury-black font-semibold rounded-lg hover:bg-luxury-gold transition-colors font-sans flex items-center gap-2"
      >
        <ImageIcon className="w-4 h-4" />
        Medya Seç
      </button>
      {typeof window !== "undefined" && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}

